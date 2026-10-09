import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/content/types";
import { categoryGroupLabels } from "@/content/types";
import { cn } from "@/lib/utils";

/** Image card for a product/service category, with the signature corner. */
export function CategoryCard({ category, index, className, priority }: { category: Category; index?: number; className?: string; priority?: boolean }) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className={cn("group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-signature bg-ink text-white", className)}
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 92vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_31_61/0.15)_0%,rgb(10_31_61/0.25)_45%,rgb(10_31_61/0.92)_100%)]" />
      {/* Arrow sits top-right, well away from the large bottom-right signature corner. */}
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-accent text-ink transition-transform duration-500 group-hover:rotate-45 lg:right-6 lg:top-6"
      >
        <ArrowUpRight className="size-5" />
      </span>
      {/* Right padding keeps every line inside the curved corner. */}
      <div className="relative min-w-0 p-6 pb-8 pr-[max(1.5rem,calc(var(--signature-radius)*0.45))] lg:pl-7 lg:pt-7 lg:pb-9">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
          {index !== undefined && <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>}
          <span>{category.hsLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{categoryGroupLabels[category.group]}</span>
        </p>
        <h3 className="headline mt-3 text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[0.95] [overflow-wrap:anywhere]">{category.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/85">{category.summary}</p>
      </div>
    </Link>
  );
}
