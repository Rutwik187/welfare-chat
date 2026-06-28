import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffSession } from "@/lib/auth-guard";
import { getCaseDetail } from "@/lib/dashboard/queries";
import { CaseStatusForm } from "@/components/dashboard/CaseStatusForm";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { visibleSources } from "@/lib/ai/types";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffSession();
  const { id } = await params;
  const data = await getCaseDetail(id);

  if (!data) {
    notFound();
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
          <CaseStatusForm caseId={caseRow.id} value={caseRow.status} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {caseRow.safeguarding ? (
                <Badge variant="destructive">Safeguarding</Badge>
              ) : null}
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
            {messages.map((message) => {
              const sources = visibleSources(message.sources ?? undefined);

              return (
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
                  {sources.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            className="underline"
                            rel="noreferrer"
                            target="_blank"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Triage history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {triage.map((item, index) => (
              <details key={index} className="rounded border p-3 text-sm">
                <summary className="cursor-pointer font-medium">
                  {item.disposition.replace("_", " ")} — {item.category} (
                  {item.urgency})
                  {item.safeguarding ? " · safeguarding" : ""}
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
