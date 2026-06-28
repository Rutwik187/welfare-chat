import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage | { parts?: { type: string; text?: string }[]; content?: string }): string {
  if ("parts" in message && message.parts) {
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  if ("content" in message && typeof message.content === "string") {
    return message.content;
  }
  return "";
}

export function generateId(): string {
  return crypto.randomUUID();
}
