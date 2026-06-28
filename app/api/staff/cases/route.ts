import { NextResponse } from "next/server";
import { desc, eq, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { cases, conversations } from "@/lib/db/schema";

async function requireStaffSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      case: cases,
      conversation: conversations,
    })
    .from(cases)
    .innerJoin(conversations, eq(cases.conversationId, conversations.id))
    .where(ne(cases.status, "resolved"))
    .orderBy(desc(cases.priorityScore), cases.createdAt);

  return NextResponse.json(
    rows.map(({ case: caseRow, conversation }) => ({
      ...caseRow,
      studentName: conversation.studentName,
      studentEmail: conversation.studentEmail,
    }))
  );
}
