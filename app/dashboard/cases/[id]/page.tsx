import { CaseDetailContent } from "@/components/dashboard/CaseDetailContent";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetailContent caseId={id} />;
}
