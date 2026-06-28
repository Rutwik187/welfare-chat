import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  cases,
  conversations,
  messages,
  triageResults,
} from "@/lib/db/schema";

async function requireStaffSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const conversationMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, caseRow.case.conversationId))
    .orderBy(asc(messages.createdAt));

  const triage = await db
    .select()
    .from(triageResults)
    .innerJoin(messages, eq(triageResults.messageId, messages.id))
    .where(eq(messages.conversationId, caseRow.case.conversationId));

  return NextResponse.json({
    case: {
      ...caseRow.case,
      studentName: caseRow.conversation.studentName,
      studentEmail: caseRow.conversation.studentEmail,
    },
    messages: conversationMessages,
    triage: triage.map((row) => ({
      ...row.triage_results,
      messageContent: row.messages.content,
    })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["new", "in_progress", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(cases)
    .set({ status, updatedAt: new Date() })
    .where(eq(cases.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
