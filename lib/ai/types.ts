import type { UIMessage } from "ai";

export type MessageSource = { title: string; url: string };

export type WelfareMessageMetadata = {
  sources?: MessageSource[];
};

export type WelfareUIMessage = UIMessage<
  WelfareMessageMetadata,
  {
    metadata: {
      emergency: boolean;
      disposition: string;
    };
  }
>;

export function visibleSources(
  sources: MessageSource[] | undefined
): MessageSource[] {
  return (sources ?? []).filter((source) => !source.url.startsWith("tel:"));
}
