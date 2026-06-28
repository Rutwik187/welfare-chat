import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, Shield } from "lucide-react";
import { requireStaffSession } from "@/lib/auth-guard";
import { getCases } from "@/lib/dashboard/queries";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CaseTable } from "@/components/dashboard/CaseTable";

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "urgent" | "muted";
}) {
  const toneClasses = {
    default: "text-primary",
    urgent: "text-destructive",
    muted: "text-muted-foreground",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-lg bg-muted ${toneClasses[tone]}`}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  await requireStaffSession();
  const cases = await getCases();

  const openCases = cases.filter((c) => c.status !== "resolved");
  const safeguardingCount = openCases.filter((c) => c.safeguarding).length;
  const urgentCount = openCases.filter(
    (c) => c.urgency === "critical" || c.urgency === "high"
  ).length;

  return (
    <div className="page-shell-dashboard">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Open cases" value={openCases.length} icon={Inbox} />
          <StatCard
            label="High priority"
            value={urgentCount}
            icon={AlertTriangle}
            tone={urgentCount > 0 ? "urgent" : "default"}
          />
          <StatCard
            label="Safeguarding"
            value={safeguardingCount}
            icon={Shield}
            tone={safeguardingCount > 0 ? "urgent" : "muted"}
          />
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Case queue
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Filter and sort cases by creation date — update status inline or
                open a case to view the full conversation.
              </p>
            </div>
          </div>
          <CaseTable cases={cases} />
        </section>
      </main>
    </div>
  );
}
