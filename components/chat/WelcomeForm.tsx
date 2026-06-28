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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-teal-100 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-teal-950">
            Student Welfare Assistant
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            A confidential space to get help with university support — visa
            questions, money worries, housing, wellbeing, and more. A real
            person is always available if you need one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your full name</Label>
              <Input
                id="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Alex Smith"
                required
                autoComplete="name"
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
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800"
              disabled={loading}
            >
              {loading ? "Starting…" : "Start conversation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
