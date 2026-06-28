import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  getArticleBySlug,
  getInternalResourceArticles,
} from "@/lib/knowledge-base/articles";
import { ArrowLeft, GraduationCap } from "lucide-react";

export function generateStaticParams() {
  return getInternalResourceArticles().map((article) => ({
    slug: article.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Resource not found" };
  }

  return {
    title: `${article.title} | Student Welfare Assistant`,
    description: article.summary,
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || !article.link.startsWith("/resources/")) {
    notFound();
  }

  return (
    <div className="page-shell min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
              aria-hidden
            >
              <GraduationCap className="size-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Knowledge base</p>
              <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
                Student support resource
              </h1>
            </div>
          </div>

          <Link
            href="/chat"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "shrink-0",
            })}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to chat
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <article className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs ring-1 ring-foreground/[0.03] sm:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline">
              {CATEGORY_LABELS[article.category]}
            </Badge>
            {article.signpostOnly ? (
              <Badge variant="secondary">Signpost only</Badge>
            ) : null}
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {article.title}
          </h2>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
            {article.summary.split(". ").map((sentence, index, parts) => {
              const text =
                index < parts.length - 1 ? `${sentence}.` : sentence;
              if (!text.trim()) return null;

              return <p key={`${article.id}-${index}`}>{text}</p>;
            })}
          </div>

          {article.escalationNotes ? (
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-foreground/90">
              <p className="mb-1 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
                Important
              </p>
              <p>{article.escalationNotes}</p>
            </div>
          ) : null}
        </article>
      </main>
    </div>
  );
}
