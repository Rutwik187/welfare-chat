import { generateText, Output } from "ai";
import { AI_CALL_SETTINGS, welfareModel } from "./gemini";
import { isAiQuotaOrRateLimitError } from "./errors";
import { FALLBACK_TRIAGE, withTimeout } from "./fallback";
import { TRIAGE_SYSTEM_PROMPT } from "./prompts";
import { triageSchema, type TriageResult } from "./schemas";

type MessageForTriage = { role: "user" | "assistant"; content: string };

export async function runTriage(
  userMessage: string,
  history: MessageForTriage[]
): Promise<TriageResult> {
  const conversationContext = history
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const result = await withTimeout(
      generateText({
        model: welfareModel,
        ...AI_CALL_SETTINGS,
        output: Output.object({ schema: triageSchema }),
        system: TRIAGE_SYSTEM_PROMPT,
        prompt: `Conversation so far:\n${conversationContext || "(none)"}\n\nLatest student message:\n${userMessage}`,
      }),
      8000,
      null
    );

    if (!result) {
      return FALLBACK_TRIAGE;
    }

    const parsed = triageSchema.safeParse(result.output);
    if (!parsed.success) {
      return FALLBACK_TRIAGE;
    }
    return parsed.data;
  } catch (error) {
    if (isAiQuotaOrRateLimitError(error)) {
      console.warn("[triage] Gemini quota/rate limit — using safe fallback");
    }
    return FALLBACK_TRIAGE;
  }
}
