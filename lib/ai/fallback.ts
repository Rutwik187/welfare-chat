import type { TriageResult } from "./schemas";

export const FALLBACK_TRIAGE: TriageResult = {
  category: "other",
  urgency: "medium",
  safeguarding: false,
  disposition: "escalate",
  reasoning: "AI triage unavailable — safe fallback escalation",
};

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}
