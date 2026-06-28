"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CaseRow = {
  id: string;
  studentName: string;
  studentEmail: string;
  category: string;
  urgency: string;
  safeguarding: boolean;
  staffSummary: string;
  status: string;
  priorityScore: number;
  createdAt: string;
  updatedAt: string;
};

const urgencyVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

function formatCategory(category: string) {
  return category.replace(/_/g, " ");
}

export function CaseTable({ cases }: { cases: CaseRow[] }) {
  if (cases.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No open cases — escalated student enquiries will appear here.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Priority</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((caseRow) => (
          <TableRow
            key={caseRow.id}
            className={caseRow.safeguarding ? "bg-red-50/60" : undefined}
          >
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {caseRow.safeguarding && (
                  <Badge variant="destructive">Safeguarding</Badge>
                )}
                <Badge variant={urgencyVariant[caseRow.urgency] ?? "outline"}>
                  {caseRow.urgency}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/cases/${caseRow.id}`}
                className="font-medium hover:underline"
              >
                {caseRow.studentName}
              </Link>
              <p className="text-xs text-muted-foreground">
                {caseRow.studentEmail}
              </p>
            </TableCell>
            <TableCell className="capitalize">
              {formatCategory(caseRow.category)}
            </TableCell>
            <TableCell className="max-w-xs truncate text-sm">
              {caseRow.staffSummary}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{caseRow.status.replace("_", " ")}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(caseRow.updatedAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
