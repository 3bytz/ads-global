"use client";

import { useState, type ReactNode } from "react";
import { categoryGroupLabels, type CategoryGroup } from "@/content/types";
import { cn } from "@/lib/utils";

type Filter = CategoryGroup | "all";

/**
 * Group filter for the category grid. Cards are server-rendered and passed in
 * with their group; filtering just hides the others (works as a full list without JS).
 */
export function CategoryFilter({ items, counts }: { items: Array<{ group: CategoryGroup; slug: string; node: ReactNode }>; counts: Record<Filter, number> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const options: Filter[] = ["all", ...(Object.keys(categoryGroupLabels) as CategoryGroup[])];
  const shown = items.filter((i) => filter === "all" || i.group === filter);

  return (
    <div>
      <div role="group" aria-label="Filter by group" className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={filter === o}
            onClick={() => setFilter(o)}
            className={cn(
              "min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors",
              filter === o ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink",
            )}
          >
            {o === "all" ? "All" : categoryGroupLabels[o]} <span className={filter === o ? "text-white/70" : "text-muted"}>({counts[o]})</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "category" : "categories"}
      </p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((i) => (
          <li key={i.slug}>{i.node}</li>
        ))}
      </ul>
    </div>
  );
}
