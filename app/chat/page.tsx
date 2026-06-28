"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { WelcomeForm } from "@/components/chat/WelcomeForm";
import { buttonVariants } from "@/components/ui/button";

type Session = {
  studentName: string;
  studentEmail: string;
  conversationId: string;
} | null;

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

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b bg-white px-4 py-2">
        <span className="text-sm font-medium text-teal-900">
          University Welfare Assistant
        </span>
        <Link
          href="/dashboard/login"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Staff login
        </Link>
      </nav>

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
