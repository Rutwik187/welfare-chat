"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";

export function DashboardHeader() {
  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/dashboard/login";
  }

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Staff Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Escalated student welfare cases — most urgent first
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className={buttonVariants({ variant: "outline" })}
          >
            View student chat
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
