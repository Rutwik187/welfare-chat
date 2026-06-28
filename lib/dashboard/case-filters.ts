import type { CaseRow } from "@/lib/dashboard/queries";

export type SortOption = "created_desc" | "created_asc";

export type CaseFilters = {
  urgency: string;
  status: string;
  category: string;
};

export const DEFAULT_CASE_FILTERS: CaseFilters = {
  urgency: "all",
  status: "all",
  category: "all",
};

export const DEFAULT_SORT: SortOption = "created_desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

export const URGENCY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

export function getOptionLabel(
  options: { value: string; label: string }[],
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function buildCategoryOptions(categories: string[]) {
  return [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({
      value: category,
      label: category.replace(/_/g, " "),
    })),
  ];
}

export function normalizeCaseRow(
  caseRow: CaseRow & { createdAt: Date | string; updatedAt: Date | string }
): CaseRow {
  return {
    ...caseRow,
    createdAt:
      caseRow.createdAt instanceof Date
        ? caseRow.createdAt
        : new Date(caseRow.createdAt),
    updatedAt:
      caseRow.updatedAt instanceof Date
        ? caseRow.updatedAt
        : new Date(caseRow.updatedAt),
  };
}

export function getUniqueCategories(cases: CaseRow[]): string[] {
  return [...new Set(cases.map((c) => c.category))].sort();
}

export function hasActiveFilters(filters: CaseFilters): boolean {
  return (
    filters.urgency !== "all" ||
    filters.status !== "all" ||
    filters.category !== "all"
  );
}

export function filterCases(cases: CaseRow[], filters: CaseFilters): CaseRow[] {
  return cases.filter((caseRow) => {
    if (filters.urgency !== "all" && caseRow.urgency !== filters.urgency) {
      return false;
    }

    if (filters.status !== "all" && caseRow.status !== filters.status) {
      return false;
    }

    if (filters.category !== "all" && caseRow.category !== filters.category) {
      return false;
    }

    return true;
  });
}

export function sortCases(cases: CaseRow[], sort: SortOption): CaseRow[] {
  const sorted = [...cases];

  if (sort === "created_asc") {
    return sorted.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function processCases(
  cases: CaseRow[],
  filters: CaseFilters,
  sort: SortOption
): CaseRow[] {
  return sortCases(filterCases(cases, filters), sort);
}
