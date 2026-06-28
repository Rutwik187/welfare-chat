"use client";

import { useCallback, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { EmergencyBanner } from "@/components/chat/EmergencyBanner";
import type { WelfareUIMessage } from "@/lib/ai/types";

type ChatInterfaceProps = {
  conversationId: string;
  studentName: string;
  studentEmail: string;
};

function buildWelcomeMessage(studentName: string): WelfareUIMessage {
  return {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `Hi ${studentName}, I'm here to help with university support questions — things like money, housing, wellbeing, or finding resources. Tell me what's going on in your own words, and I'll do my best to help or connect you with someone who can.`,
      },
    ],
  };
}

export function ChatInterface({
  conversationId,
  studentName,
  studentEmail,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [latestSources, setLatestSources] = useState<
    { title: string; url: string }[]
  >([]);

  const initialMessages = useMemo(
    () => [buildWelcomeMessage(studentName)],
    [studentName]
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversationId },
      }),
    [conversationId]
  );

  const handleData = useCallback(
    (dataPart: { type: string; data?: { emergency?: boolean; sources?: { title: string; url: string }[] } }) => {
      if (dataPart.type !== "data-metadata" || !dataPart.data) return;
      if (dataPart.data.emergency) {
        setShowEmergency(true);
      }
      if (dataPart.data.sources?.length) {
        setLatestSources(dataPart.data.sources);
      }
    },
    []
  );

  const { messages, sendMessage, status } = useChat<WelfareUIMessage>({
    messages: initialMessages,
    transport,
    onData: handleData,
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text.trim() || isStreaming) return;
      sendMessage({ text: message.text });
      setInput("");
    },
    [isStreaming, sendMessage]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-teal-50/30">
      <header className="border-b bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-semibold text-teal-950">
          Welfare Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          A calm, confidential chat — a real person is available if you need one
        </p>
      </header>

      {showEmergency ? <EmergencyBanner studentEmail={studentEmail} /> : null}

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.map((message, index) => {
              const isLastAssistant =
                message.role === "assistant" && index === messages.length - 1;
              const hasText = message.parts.some(
                (p) => p.type === "text" && p.text.length > 0
              );
              const showShimmer = isLastAssistant && isStreaming && !hasText;

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {showShimmer ? (
                      <Shimmer className="text-sm">Thinking…</Shimmer>
                    ) : (
                      message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        }
                        return null;
                      })
                    )}
                    {message.role === "assistant" &&
                    isLastAssistant &&
                    latestSources.length > 0 &&
                    !isStreaming ? (
                      <Sources className="mt-2">
                        <SourcesTrigger count={latestSources.length} />
                        <SourcesContent>
                          {latestSources.map((source) => (
                            <Source
                              href={source.url}
                              key={source.url}
                              title={source.title}
                            />
                          ))}
                        </SourcesContent>
                      </Sources>
                    ) : null}
                  </MessageContent>
                </Message>
              );
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mt-4 shrink-0 pb-2">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe what you need help with…"
              disabled={isStreaming}
            />
            <PromptInputSubmit disabled={isStreaming || !input.trim()} />
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
