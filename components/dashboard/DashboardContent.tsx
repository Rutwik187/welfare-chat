"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { CaseTable, type CaseRow } from "@/components/dashboard/CaseTable";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/staff/cases")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load cases");
        return res.json();
      })
      .then(setCases)
      .catch(() => setError("Unable to load cases."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/dashboard/login";
  }

  return (
    <div className="min-h-screen bg-muted/30">
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

      <main className="mx-auto max-w-6xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Open cases</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {!loading && !error && <CaseTable cases={cases} />}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
