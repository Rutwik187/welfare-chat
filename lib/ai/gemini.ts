import { google } from "@ai-sdk/google";

/** Change via GEMINI_MODEL in .env.local without code changes. */
export const GEMINI_MODEL_ID =
  process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";

export const welfareModel = google(GEMINI_MODEL_ID);

/** Avoid long retry loops on 429 quota errors (default is 2–3 retries). */
export const AI_CALL_SETTINGS = {
  maxRetries: 0,
} as const;
