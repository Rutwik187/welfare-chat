"use client";

import { useTransition } from "react";
import { updateCaseStatus } from "@/app/dashboard/actions";
import { StatusSelect } from "@/components/dashboard/StatusSelect";

type CaseStatusFormProps = {
  caseId: string;
  value: string;
};

export function CaseStatusForm({ caseId, value }: CaseStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      await updateCaseStatus(caseId, status);
    });
  }

  return (
    <StatusSelect
      value={value}
      onChange={handleChange}
      disabled={isPending}
    />
  );
}
