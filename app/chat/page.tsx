"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { WelcomeForm } from "@/components/chat/WelcomeForm";

type Session = {
  studentName: string;
  studentEmail: string;
  conversationId: string;
} | null;

function clearSession() {
  sessionStorage.removeItem("conversationId");
  sessionStorage.removeItem("studentName");
  sessionStorage.removeItem("studentEmail");
}

export default function ChatPage() {
  const [session, setSession] = useState<Session>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const conversationId = sessionStorage.getItem("conversationId");
    const studentName = sessionStorage.getItem("studentName");
    const studentEmail = sessionStorage.getItem("studentEmail");

    if (conversationId && studentName && studentEmail) {
      setSession({ conversationId, studentName, studentEmail });
    }
    setReady(true);
  }, []);

  function handleEndSession() {
    clearSession();
    setSession(null);
  }

  async function handleStartNewChat() {
    if (!session) return;

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: session.studentName,
          studentEmail: session.studentEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) return;

      sessionStorage.setItem("conversationId", data.conversationId);
      setSession({
        ...session,
        conversationId: data.conversationId,
      });
    } catch {
      // Keep the current conversation if a new one cannot be created.
    }
  }

  if (!ready) {
    return null;
  }

  return (
    <div
      className={cn(
        "page-shell flex flex-col",
        session ? "h-dvh overflow-hidden" : "min-h-dvh"
      )}
    >
      <ChatHeader
        session={
          session
            ? {
                studentName: session.studentName,
                studentEmail: session.studentEmail,
              }
            : null
        }
        onStartNewChat={handleStartNewChat}
        onEndSession={handleEndSession}
      />

      {session ? (
        <ChatInterface
          key={session.conversationId}
          conversationId={session.conversationId}
          studentName={session.studentName}
          studentEmail={session.studentEmail}
        />
      ) : (
        <WelcomeForm
          onStart={(data) => {
            sessionStorage.setItem("studentEmail", data.studentEmail);
            setSession(data);
          }}
        />
      )}
    </div>
  );
}
