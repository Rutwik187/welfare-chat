"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  PromptInputFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { WelfareUIMessage } from "@/lib/ai/types";
import { visibleSources } from "@/lib/ai/types";
import { AlertCircle } from "lucide-react";

type ChatInterfaceProps = {
  conversationId: string;
  studentName: string;
  studentEmail: string;
};

const GENERIC_ERROR_MESSAGE =
  "The assistant could not reply right now. Your message was saved — a team member will follow up with you soon. Please try again in a few minutes.";

function getClientErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("resource_exhausted")
  ) {
    return "The assistant is temporarily busy due to high demand. Your message was saved — please try again in a few minutes.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "Unable to reach the assistant. Check your connection and try again.";
  }

  return GENERIC_ERROR_MESSAGE;
}

function messageHasText(message: WelfareUIMessage) {
  return message.parts.some((part) => part.type === "text" && part.text.trim());
}

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
  const [requestError, setRequestError] = useState<string | null>(null);

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
    (dataPart: {
      type: string;
      data?: { emergency?: boolean };
    }) => {
      if (dataPart.type !== "data-metadata" || !dataPart.data) return;
      if (dataPart.data.emergency) {
        setShowEmergency(true);
      }
    },
    []
  );

  const { messages, sendMessage, status } = useChat<WelfareUIMessage>({
    messages: initialMessages,
    transport,
    onData: handleData,
    onError: (error) => {
      setRequestError(getClientErrorMessage(error));
    },
    onFinish: () => {
      setRequestError(null);
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (isStreaming) return;

    const lastMessage = messages.at(-1);
    if (lastMessage?.role !== "assistant") return;
    if (messageHasText(lastMessage)) return;

    setRequestError(GENERIC_ERROR_MESSAGE);
  }, [isStreaming, messages]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text.trim() || isStreaming) return;
      setRequestError(null);
      sendMessage({ text: message.text });
      setInput("");
    },
    [isStreaming, sendMessage]
  );

  return (
    <div className="chat-surface flex min-h-0 flex-1 flex-col">
      {showEmergency ? (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
          <EmergencyBanner studentEmail={studentEmail} />
        </div>
      ) : null}

      {requestError ? (
        <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not get a reply</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.map((message, index) => {
              const isLastAssistant =
                message.role === "assistant" && index === messages.length - 1;
              const hasText = messageHasText(message);
              const showShimmer = isLastAssistant && isStreaming && !hasText;
              const messageSources = visibleSources(message.metadata?.sources);

              if (message.role === "assistant" && !hasText && !showShimmer) {
                return null;
              }

              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {showShimmer ? (
                      <Shimmer className="text-sm">Thinking…</Shimmer>
                    ) : (
                      message.parts.map((part, i) => {
                        if (part.type === "text" && part.text.trim()) {
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
                    messageSources.length > 0 &&
                    (!isLastAssistant || !isStreaming) ? (
                      <Sources className="mt-2">
                        <SourcesTrigger count={messageSources.length} />
                        <SourcesContent>
                          {messageSources.map((source) => (
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
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit disabled={isStreaming || !input.trim()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
