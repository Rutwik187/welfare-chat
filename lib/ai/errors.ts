import { APICallError, RetryError } from "ai";

export function isAiQuotaOrRateLimitError(error: unknown): boolean {
  if (RetryError.isInstance(error)) {
    return error.errors.some(
      (e) => APICallError.isInstance(e) && e.statusCode === 429
    );
  }
  if (APICallError.isInstance(error)) {
    return error.statusCode === 429 || error.statusCode === 503;
  }
  return false;
}
