"use client";

import { useEffect, useState } from "react";
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

  function handleStartNewChat() {
    clearSession();
    setSession(null);
  }

  function handleEndSession() {
    clearSession();
    setSession(null);
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="page-shell flex min-h-dvh flex-col">
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
