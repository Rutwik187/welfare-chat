"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCaseStatus } from "@/app/dashboard/actions";
import { StatusSelect } from "@/components/dashboard/StatusSelect";

type CaseStatusFormProps = {
  caseId: string;
  value: string;
  className?: string;
};

export function CaseStatusForm({
  caseId,
  value,
  className,
}: CaseStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      await updateCaseStatus(caseId, status);
      router.refresh();
    });
  }

  return (
    <StatusSelect
      value={value}
      onChange={handleChange}
      disabled={isPending}
      className={className}
    />
  );
}
