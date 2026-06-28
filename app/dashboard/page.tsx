import { requireStaffSession } from "@/lib/auth-guard";
import { getOpenCases } from "@/lib/dashboard/queries";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CaseTable } from "@/components/dashboard/CaseTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  await requireStaffSession();
  const cases = await getOpenCases();

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Open cases</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseTable cases={cases} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
