"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { LogOut, MessageCircle, Shield } from "lucide-react";

export function DashboardHeader() {
  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/dashboard/login";
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <Shield className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              Welfare Assistant
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Staff dashboard — review and manage cases
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-md border border-border/80 bg-muted/30 p-1">
          <Link
            href="/chat"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-9 px-3",
            })}
          >
            <MessageCircle className="size-4" data-icon="inline-start" />
            Student chat
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
