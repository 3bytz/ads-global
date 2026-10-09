import { cn } from "@/lib/utils";

/**
 * Visible marker for unverified company facts while settings.company.claimsMode = "flag".
 * Switch claimsMode to "hide" in admin before launch to remove unconfirmed items entirely.
 */
export function Unconfirmed({ className, label = "Unconfirmed" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-dashed border-current px-1.5 py-0.5 align-middle font-sans text-[0.6875rem] font-semibold uppercase tracking-wider",
        className,
      )}
      title="Pending confirmation by ADS Global — shown only in pre-launch mode"
    >
      <span aria-hidden="true">⚑</span>
      {label}
    </span>
  );
}
