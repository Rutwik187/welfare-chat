"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DEFAULT_CASE_FILTERS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
  buildCategoryOptions,
  getOptionLabel,
  type CaseFilters,
  type SortOption,
  hasActiveFilters,
} from "@/lib/dashboard/case-filters";
import { ArrowUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseTableToolbarProps = {
  filters: CaseFilters;
  sort: SortOption;
  categories: string[];
  totalCount: number;
  filteredCount: number;
  onFiltersChange: (filters: CaseFilters) => void;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
};

type FilterSelectProps = {
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
};

function FilterSelect({
  value,
  options,
  onValueChange,
  className,
}: FilterSelectProps) {
  const label = getOptionLabel(options, value);

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger
        className={cn("h-9 min-w-[148px] bg-background capitalize", className)}
        size="sm"
      >
        <span className="truncate">{label}</span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="capitalize">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CaseTableToolbar({
  filters,
  sort,
  categories,
  totalCount,
  filteredCount,
  onFiltersChange,
  onSortChange,
  onClear,
}: CaseTableToolbarProps) {
  const active = hasActiveFilters(filters);
  const categoryOptions = buildCategoryOptions(categories);
  const sortLabel = getOptionLabel(SORT_OPTIONS, sort);

  return (
    <div className="space-y-3 border-b border-border/80 bg-muted/20 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={filters.urgency}
            options={URGENCY_OPTIONS}
            onValueChange={(urgency) =>
              onFiltersChange({ ...filters, urgency })
            }
          />

          <FilterSelect
            value={filters.status}
            options={STATUS_OPTIONS}
            onValueChange={(status) =>
              onFiltersChange({ ...filters, status })
            }
          />

          <FilterSelect
            value={filters.category}
            options={categoryOptions}
            onValueChange={(category) =>
              onFiltersChange({ ...filters, category })
            }
            className="min-w-[160px]"
          />

          {active ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-9"
            >
              <X className="size-4" data-icon="inline-start" />
              Clear
            </Button>
          ) : null}
        </div>

        <Select
          value={sort}
          onValueChange={(value) => value && onSortChange(value as SortOption)}
        >
          <SelectTrigger
            className="h-9 w-full gap-2 bg-background sm:w-auto sm:min-w-[160px]"
            size="sm"
          >
            <ArrowUpDown className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{sortLabel}</span>
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground tabular-nums">
          {filteredCount}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground tabular-nums">
          {totalCount}
        </span>{" "}
        {totalCount === 1 ? "case" : "cases"}
        {active ? " matching your filters" : null}
      </p>
    </div>
  );
}

export { DEFAULT_CASE_FILTERS };
