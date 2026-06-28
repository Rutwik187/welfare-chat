import type { UIMessageStreamWriter } from "ai";
import { generateId } from "@/lib/utils/messages";

export function writeStaticAssistantText(
  writer: UIMessageStreamWriter,
  text: string,
  messageId = generateId()
) {
  writer.write({ type: "text-start", id: messageId });
  writer.write({ type: "text-delta", id: messageId, delta: text });
  writer.write({ type: "text-end", id: messageId });
}
