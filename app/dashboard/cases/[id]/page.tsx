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
import { CitationLink } from "@/components/chat/CitationLink";
import { ArrowLeft } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
    <div className="page-shell-dashboard min-h-dvh">
      <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto max-w-4xl space-y-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to queue
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(caseRow.studentName)}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                  {caseRow.studentName}
                </h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {caseRow.studentEmail}
                </p>
              </div>
            </div>
            <CaseStatusForm caseId={caseRow.id} value={caseRow.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <Card className="border-border/80 shadow-xs ring-1 ring-foreground/[0.03]">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {caseRow.safeguarding ? (
                <Badge variant="destructive">Safeguarding</Badge>
              ) : null}
              <Badge className="capitalize">{caseRow.urgency}</Badge>
              <Badge variant="outline" className="capitalize">
                {caseRow.category.replace(/_/g, " ")}
              </Badge>
            </div>
            <CardTitle className="text-base font-medium">Staff summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">
              {caseRow.staffSummary}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs ring-1 ring-foreground/[0.03]">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((message) => {
              const sources = visibleSources(message.sources ?? undefined);
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-xl border p-4 text-sm",
                    isUser
                      ? "ml-6 border-primary/15 bg-primary/[0.04]"
                      : "mr-6 border-border/80 bg-card"
                  )}
                >
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {message.role}
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {sources.length > 0 ? (
                    <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      {sources.map((source) => (
                        <li key={source.url}>
                          <CitationLink
                            href={source.url}
                            title={source.title}
                            className="inline text-primary underline-offset-2 hover:underline"
                          >
                            {source.title}
                          </CitationLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs ring-1 ring-foreground/[0.03]">
          <CardHeader>
            <CardTitle>Triage history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {triage.map((item, index) => (
              <details
                key={index}
                className="group rounded-xl border border-border/80 bg-muted/20 p-4 text-sm transition-colors open:bg-muted/30"
              >
                <summary className="cursor-pointer font-medium capitalize">
                  {item.disposition.replace("_", " ")} — {item.category} (
                  {item.urgency})
                  {item.safeguarding ? " · safeguarding" : ""}
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">
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
