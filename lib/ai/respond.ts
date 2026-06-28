import { generateText, streamText } from "ai";
import type { FinalTriage } from "./schemas";
import { AI_CALL_SETTINGS, welfareModel } from "./gemini";
import { isAiQuotaOrRateLimitError } from "./errors";
import {
  buildClarifyingPrompt,
  buildEscalatePrompt,
  buildHandleNowPrompt,
  buildStaffSummaryPrompt,
} from "./prompts";
import { formatKBContext } from "@/lib/knowledge-base/retrieval";
import type { KBArticle } from "@/lib/knowledge-base/articles";

type HistoryMessage = { role: "user" | "assistant"; content: string };

export function buildResponseMessages(
  history: HistoryMessage[],
  userMessage: string
) {
  return [
    ...history.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];
}

export function streamAssistantResponse(options: {
  triage: FinalTriage;
  kbArticles: KBArticle[];
  history: HistoryMessage[];
  userMessage: string;
  studentName: string;
  studentEmail: string;
}) {
  const { triage, kbArticles, history, userMessage, studentName, studentEmail } =
    options;

  const base = { model: welfareModel, ...AI_CALL_SETTINGS };

  if (triage.isSpamOrAbuse) {
    return streamText({
      ...base,
      system: buildEscalatePrompt({
        studentName,
        studentEmail,
        showEmergency: false,
        isSpam: true,
      }),
      messages: [{ role: "user", content: userMessage }],
    });
  }

  if (triage.disposition === "handle_now") {
    return streamText({
      ...base,
      system: buildHandleNowPrompt(formatKBContext(kbArticles)),
      messages: buildResponseMessages(history, userMessage),
    });
  }

  if (triage.disposition === "ask_clarifying") {
    return streamText({
      ...base,
      system: buildClarifyingPrompt(),
      messages: buildResponseMessages(history, userMessage),
    });
  }

  return streamText({
    ...base,
    system: buildEscalatePrompt({
      studentName,
      studentEmail,
      showEmergency: triage.showEmergencyBanner,
      showCrisisSupport: triage.showCrisisSupport,
      isSpam: false,
    }),
    messages: buildResponseMessages(history, userMessage),
  });
}

export async function generateStaffSummary(
  userMessage: string,
  triage: FinalTriage
): Promise<string> {
  const triageSummary = `category=${triage.category}, urgency=${triage.urgency}, safeguarding=${triage.safeguarding}, disposition=${triage.disposition}`;
  const fallback = `Student enquiry (${triage.category}, ${triage.urgency} urgency${triage.safeguarding ? ", safeguarding concern" : ""}): ${userMessage.slice(0, 200)}`;

  try {
    const { text } = await generateText({
      model: welfareModel,
      ...AI_CALL_SETTINGS,
      prompt: buildStaffSummaryPrompt(userMessage, triageSummary),
    });
    return text.trim() || fallback;
  } catch (error) {
    if (isAiQuotaOrRateLimitError(error)) {
      console.warn("[staff-summary] Gemini quota/rate limit — using template");
    }
    return fallback;
  }
}

export function computePriorityScore(
  safeguarding: boolean,
  urgency: FinalTriage["urgency"]
): number {
  const urgencyWeight = {
    critical: 400,
    high: 300,
    medium: 200,
    low: 100,
  }[urgency];

  return (safeguarding ? 1000 : 0) + urgencyWeight;
}
