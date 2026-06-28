import { asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cases,
  conversations,
  messages,
  triageResults,
} from "@/lib/db/schema";

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
  createdAt: Date;
  updatedAt: Date;
};

export async function getOpenCases(): Promise<CaseRow[]> {
  const rows = await db
    .select({
      case: cases,
      conversation: conversations,
    })
    .from(cases)
    .innerJoin(conversations, eq(cases.conversationId, conversations.id))
    .where(ne(cases.status, "resolved"))
    .orderBy(desc(cases.priorityScore), cases.createdAt);

  return rows.map(({ case: caseRow, conversation }) => ({
    ...caseRow,
    studentName: conversation.studentName,
    studentEmail: conversation.studentEmail,
  }));
}

export type CaseDetail = {
  case: CaseRow;
  messages: {
    id: string;
    role: string;
    content: string;
    sources: { title: string; url: string }[] | null;
    createdAt: Date;
  }[];
  triage: {
    category: string;
    urgency: string;
    safeguarding: boolean;
    disposition: string;
    messageContent: string;
  }[];
};

export async function getCaseDetail(id: string): Promise<CaseDetail | null> {
  const [caseRow] = await db
    .select({
      case: cases,
      conversation: conversations,
    })
    .from(cases)
    .innerJoin(conversations, eq(cases.conversationId, conversations.id))
    .where(eq(cases.id, id))
    .limit(1);

  if (!caseRow) {
    return null;
  }

  const [conversationMessages, triage] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, caseRow.case.conversationId))
      .orderBy(asc(messages.createdAt)),
    db
      .select()
      .from(triageResults)
      .innerJoin(messages, eq(triageResults.messageId, messages.id))
      .where(eq(messages.conversationId, caseRow.case.conversationId)),
  ]);

  return {
    case: {
      ...caseRow.case,
      studentName: caseRow.conversation.studentName,
      studentEmail: caseRow.conversation.studentEmail,
    },
    messages: conversationMessages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      sources: message.sources,
      createdAt: message.createdAt,
    })),
    triage: triage.map((row) => ({
      category: row.triage_results.category,
      urgency: row.triage_results.urgency,
      safeguarding: row.triage_results.safeguarding,
      disposition: row.triage_results.disposition,
      messageContent: row.messages.content,
    })),
  };
}
