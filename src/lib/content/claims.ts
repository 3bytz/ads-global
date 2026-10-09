import type { ClaimsMode } from "@/content/types";

/**
 * Display rule for anything unverified (stats, claims, placeholders):
 *  - confirmed → show normally
 *  - unconfirmed + mode "flag" (pre-launch) → show with a visible "Unconfirmed" marker
 *  - unconfirmed + mode "hide" (live) → don't render
 */
export type ClaimVisibility = "show" | "flag" | "hide";

export function claimVisibility(confirmed: boolean, mode: ClaimsMode): ClaimVisibility {
  if (confirmed) return "show";
  return mode === "flag" ? "flag" : "hide";
}
