import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, studentEmail } = body;

    if (
      !studentName ||
      typeof studentName !== "string" ||
      studentName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: "Please provide your full name." },
        { status: 400 }
      );
    }

    if (
      !studentEmail ||
      typeof studentEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const id = generateId();
    await db.insert(conversations).values({
      id,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim().toLowerCase(),
    });

    return NextResponse.json({ conversationId: id });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Unable to start conversation. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("id");
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
  }

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}
