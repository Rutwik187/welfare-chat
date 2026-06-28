"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaseStatusForm } from "@/components/dashboard/CaseStatusForm";
import { CaseTableToolbar } from "@/components/dashboard/CaseTableToolbar";
import type { CaseRow } from "@/lib/dashboard/queries";
import {
  DEFAULT_CASE_FILTERS,
  DEFAULT_SORT,
  getUniqueCategories,
  normalizeCaseRow,
  processCases,
  type CaseFilters,
  type SortOption,
} from "@/lib/dashboard/case-filters";
import { ChevronRight, Inbox, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

const urgencyVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

function formatCategory(category: string) {
  return category.replace(/_/g, " ");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelativeTime(date: Date) {
  const now = Date.now();
  const then = date.getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function EmptyQueueState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Inbox className="size-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium">No open cases</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Escalated student enquiries will appear here.
      </p>
    </div>
  );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
        <SearchX className="size-7 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium">No cases match your filters</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try adjusting your filter criteria.
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

type CaseTableProps = {
  cases: (CaseRow & { createdAt: Date | string; updatedAt: Date | string })[];
};

export function CaseTable({ cases: rawCases }: CaseTableProps) {
  const cases = useMemo(
    () => rawCases.map((caseRow) => normalizeCaseRow(caseRow)),
    [rawCases]
  );

  const [filters, setFilters] = useState<CaseFilters>(DEFAULT_CASE_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

  const categories = useMemo(() => getUniqueCategories(cases), [cases]);

  const filteredCases = useMemo(
    () => processCases(cases, filters, sort),
    [cases, filters, sort]
  );

  function handleClear() {
    setFilters(DEFAULT_CASE_FILTERS);
    setSort(DEFAULT_SORT);
  }

  if (cases.length === 0) {
    return <EmptyQueueState />;
  }

  return (
    <div className="data-table-shell">
      <CaseTableToolbar
        filters={filters}
        sort={sort}
        categories={categories}
        totalCount={cases.length}
        filteredCount={filteredCases.length}
        onFiltersChange={setFilters}
        onSortChange={setSort}
        onClear={handleClear}
      />

      {filteredCases.length === 0 ? (
        <NoResultsState onClear={handleClear} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Priority</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Summary</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                Created
              </TableHead>
              <TableHead className="w-[100px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map((caseRow) => (
              <TableRow
                key={caseRow.id}
                className={cn(
                  "group",
                  caseRow.safeguarding && "row-safeguarding",
                  caseRow.status === "resolved" && "opacity-60"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "priority-dot",
                        `priority-dot-${caseRow.urgency}`
                      )}
                      aria-hidden
                    />
                    <div className="flex flex-wrap gap-1">
                      {caseRow.safeguarding ? (
                        <Badge variant="destructive">Safeguarding</Badge>
                      ) : null}
                      <Badge
                        variant={urgencyVariant[caseRow.urgency] ?? "outline"}
                        className="capitalize"
                      >
                        {caseRow.urgency}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/cases/${caseRow.id}`}
                    className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="student-avatar" aria-hidden>
                      {getInitials(caseRow.studentName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground transition-colors group-hover:text-primary">
                        {caseRow.studentName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {caseRow.studentEmail}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden capitalize md:table-cell">
                  {formatCategory(caseRow.category)}
                </TableCell>
                <TableCell className="hidden max-w-xs lg:table-cell">
                  <p className="truncate text-sm text-muted-foreground">
                    {caseRow.staffSummary}
                  </p>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <CaseStatusForm
                    caseId={caseRow.id}
                    value={caseRow.status}
                    className="w-[130px]"
                  />
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  <time
                    className="text-sm text-muted-foreground tabular-nums"
                    dateTime={caseRow.createdAt.toISOString()}
                    title={caseRow.createdAt.toLocaleString()}
                  >
                    {formatRelativeTime(caseRow.createdAt)}
                  </time>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/dashboard/cases/${caseRow.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "inline-flex shrink-0"
                    )}
                  >
                    View
                    <ChevronRight className="size-3.5" data-icon="inline-end" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
