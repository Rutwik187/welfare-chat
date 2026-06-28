import type { UIMessage } from "ai";

export type WelfareUIMessage = UIMessage<
  never,
  {
    metadata: {
      emergency: boolean;
      sources: { title: string; url: string }[];
      disposition: string;
    };
  }
>;
