import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
  type UIMessageStreamWriter,
} from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cases,
  conversations,
  messages,
  triageResults,
} from "@/lib/db/schema";
import { applyHouseRules, shouldCreateCase } from "@/lib/ai/house-rules";
import { isAiQuotaOrRateLimitError } from "@/lib/ai/errors";
import { getFallbackAssistantMessage } from "@/lib/ai/fallback-messages";
import {
  computePriorityScore,
  generateStaffSummary,
  streamAssistantResponse,
} from "@/lib/ai/respond";
import { writeStaticAssistantText } from "@/lib/ai/stream-fallback";
import { runTriage } from "@/lib/ai/triage";
import type { MessageSource, WelfareUIMessage } from "@/lib/ai/types";
import { visibleSources } from "@/lib/ai/types";
import { retrieveArticles } from "@/lib/knowledge-base/retrieval";
import { generateId, getMessageText } from "@/lib/utils/messages";

type ChatRequestBody = {
  messages: UIMessage[];
  conversationId: string;
};

function writeMessageSources(
  writer: UIMessageStreamWriter<WelfareUIMessage>,
  sources: MessageSource[]
) {
  if (sources.length === 0) return;

  writer.write({
    type: "message-metadata",
    messageMetadata: { sources },
  });
}

async function streamAssistantOrFallback(
  writer: UIMessageStreamWriter<WelfareUIMessage>,
  options: Parameters<typeof streamAssistantResponse>[0] & {
    sources: MessageSource[];
  }
) {
  const { sources, ...streamOptions } = options;

  try {
    const result = streamAssistantResponse(streamOptions);
    writer.merge(
      toUIMessageStream({
        stream: result.stream,
        messageMetadata: ({ part }) => {
          if (part.type === "start" && sources.length > 0) {
            return { sources };
          }
        },
        onError: (error) => {
          console.error("[chat] response stream error:", error);
          return getFallbackAssistantMessage({
            triage: streamOptions.triage,
            studentName: streamOptions.studentName,
            studentEmail: streamOptions.studentEmail,
          });
        },
      })
    );
  } catch (error) {
    if (isAiQuotaOrRateLimitError(error)) {
      console.warn("[chat] Gemini quota/rate limit — static fallback response");
    }
    writeMessageSources(writer, sources);
    writeStaticAssistantText(
      writer,
      getFallbackAssistantMessage({
        triage: streamOptions.triage,
        studentName: streamOptions.studentName,
        studentEmail: streamOptions.studentEmail,
      })
    );
  }
}

export async function processChatRequest(body: ChatRequestBody) {
  const { messages: uiMessages, conversationId } = body;

  if (!conversationId) {
    return new Response("Missing conversationId", { status: 400 });
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const userMessage = getMessageText(
    uiMessages.filter((m) => m.role === "user").at(-1) ?? { parts: [] }
  );

  if (!userMessage.trim()) {
    return new Response("Empty message", { status: 400 });
  }

  const history = uiMessages
    .slice(0, -1)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: getMessageText(m),
    }))
    .filter((m) => m.content.trim());

  const userMessageId = generateId();

  const stream = createUIMessageStream<WelfareUIMessage>({
    originalMessages: uiMessages as WelfareUIMessage[],
    onError: () =>
      "The assistant is temporarily unavailable. Your message has been saved and a team member will follow up with you.",
    execute: async ({ writer }) => {
      await db.insert(messages).values({
        id: userMessageId,
        conversationId,
        role: "user",
        content: userMessage,
      });

      const rawTriage = await runTriage(userMessage, history);
      const retrieval = retrieveArticles(userMessage, rawTriage.category);

      const triage = applyHouseRules({
        triage: rawTriage,
        message: userMessage,
        clarifyingRounds: conversation.clarifyingRounds,
        kbCanAnswer: retrieval.canAnswer,
      });

      const groundedSources =
        triage.disposition === "handle_now" && retrieval.canAnswer
          ? visibleSources(retrieval.kbLinks)
          : [];

      const staffSummaryPromise =
        triage.disposition === "escalate" && shouldCreateCase(triage)
          ? generateStaffSummary(userMessage, triage)
          : Promise.resolve(null);

      const staffSummary = await staffSummaryPromise;

      await db.insert(triageResults).values({
        id: generateId(),
        messageId: userMessageId,
        category: triage.category,
        urgency: triage.urgency,
        safeguarding: triage.safeguarding,
        disposition: triage.disposition,
        staffSummary,
        rawModelOutput: { raw: rawTriage, final: triage },
      });

      if (triage.disposition === "ask_clarifying") {
        await db
          .update(conversations)
          .set({
            clarifyingRounds: conversation.clarifyingRounds + 1,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId));
      }

      if (shouldCreateCase(triage)) {
        const summary =
          staffSummary ?? `Escalated case: ${userMessage.slice(0, 200)}`;

        await db.insert(cases).values({
          id: generateId(),
          conversationId,
          triggerMessageId: userMessageId,
          status: "new",
          category: triage.category,
          urgency: triage.urgency,
          safeguarding: triage.safeguarding,
          staffSummary: summary,
          priorityScore: computePriorityScore(
            triage.safeguarding,
            triage.urgency
          ),
        });

        await db
          .update(conversations)
          .set({ status: "escalated", updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));
      }

      writer.write({
        type: "data-metadata",
        data: {
          emergency: triage.showEmergencyBanner,
          disposition: triage.disposition,
        },
        transient: true,
      });

      await streamAssistantOrFallback(writer, {
        triage,
        kbArticles: retrieval.articles,
        history,
        userMessage,
        studentName: conversation.studentName,
        studentEmail: conversation.studentEmail,
        sources: groundedSources,
      });
    },
    onFinish: async ({ responseMessage }) => {
      const assistantText = getMessageText(responseMessage);
      const sources = visibleSources(responseMessage.metadata?.sources);

      if (assistantText.trim()) {
        await db.insert(messages).values({
          id: generateId(),
          conversationId,
          role: "assistant",
          content: assistantText,
          sources: sources.length > 0 ? sources : null,
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}
