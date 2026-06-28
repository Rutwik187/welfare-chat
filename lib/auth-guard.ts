import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getStaffSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireStaffSession() {
  const session = await getStaffSession();

  if (!session) {
    redirect("/dashboard/login");
  }

  return session;
}
