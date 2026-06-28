"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusSelect } from "@/components/dashboard/StatusSelect";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CaseDetailData = {
  case: {
    id: string;
    status: string;
    category: string;
    urgency: string;
    safeguarding: boolean;
    staffSummary: string;
    studentName: string;
    studentEmail: string;
    createdAt: string;
  };
  messages: { id: string; role: string; content: string; createdAt: string }[];
  triage: {
    category: string;
    urgency: string;
    safeguarding: boolean;
    disposition: string;
    messageContent: string;
  }[];
};

export function CaseDetailContent({ caseId }: { caseId: string }) {
  const [data, setData] = useState<CaseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/staff/cases/${caseId}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [caseId]);

  async function updateStatus(status: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setData((prev) =>
        prev ? { ...prev, case: { ...prev.case, status: updated.status } } : prev
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p>Case not found.</p>
        <Link href="/dashboard" className={buttonVariants({ variant: "link" })}>
          Back to queue
        </Link>
      </div>
    );
  }

  const { case: caseRow, messages, triage } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mb-2 -ml-2"
              )}
            >
              ← Back to queue
            </Link>
            <h1 className="text-xl font-semibold">{caseRow.studentName}</h1>
            <p className="text-sm text-muted-foreground">
              {caseRow.studentEmail}
            </p>
          </div>
          <StatusSelect
            value={caseRow.status}
            onChange={updateStatus}
            disabled={saving}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {caseRow.safeguarding && (
                <Badge variant="destructive">Safeguarding</Badge>
              )}
              <Badge>{caseRow.urgency}</Badge>
              <Badge variant="outline">
                {caseRow.category.replace(/_/g, " ")}
              </Badge>
            </div>
            <CardTitle className="text-base font-medium">Staff summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{caseRow.staffSummary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-lg bg-secondary p-3 text-sm"
                    : "mr-8 rounded-lg border bg-white p-3 text-sm"
                }
              >
                <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                  {message.role}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Triage history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {triage.map((item, i) => (
              <details key={i} className="rounded border p-3 text-sm">
                <summary className="cursor-pointer font-medium">
                  {item.disposition.replace("_", " ")} — {item.category} (
                  {item.urgency})
                  {item.safeguarding && " · safeguarding"}
                </summary>
                <p className="mt-2 text-muted-foreground">
                  {item.messageContent}
                </p>
              </details>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
