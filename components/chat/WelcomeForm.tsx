"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock } from "lucide-react";

type WelcomeFormProps = {
  onStart: (data: {
    studentName: string;
    studentEmail: string;
    conversationId: string;
  }) => void;
};

export function WelcomeForm({ onStart }: WelcomeFormProps) {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, studentEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      sessionStorage.setItem("conversationId", data.conversationId);
      sessionStorage.setItem("studentName", studentName.trim());
      onStart({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        conversationId: data.conversationId,
      });
    } catch {
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="welcome-card">
          <CardHeader className="space-y-3 pb-2">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Confidential support
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              How can we help?
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              A calm space for visa questions, money worries, housing, wellbeing,
              and more. A real person is always available if you need one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Your full name</Label>
                <Input
                  id="name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Alex Smith"
                  required
                  autoComplete="name"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">University email</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="you@university.ac.uk"
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={loading}
              >
                {loading ? "Starting…" : "Start conversation"}
                {!loading ? (
                  <ArrowRight className="size-4" data-icon="inline-end" />
                ) : null}
              </Button>
            </form>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" strokeWidth={2} />
              Your conversation is private and secure
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
