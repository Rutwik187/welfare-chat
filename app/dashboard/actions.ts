"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getStaffSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema";

const CASE_STATUSES = ["new", "in_progress", "resolved"] as const;

export async function updateCaseStatus(caseId: string, status: string) {
  const session = await getStaffSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!CASE_STATUSES.includes(status as (typeof CASE_STATUSES)[number])) {
    throw new Error("Invalid status");
  }

  const [updated] = await db
    .update(cases)
    .set({ status: status as (typeof CASE_STATUSES)[number], updatedAt: new Date() })
    .where(eq(cases.id, caseId))
    .returning();

  if (!updated) {
    throw new Error("Case not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/cases/${caseId}`);

  return updated;
}
