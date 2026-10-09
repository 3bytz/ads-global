import Image from "next/image";
import logoWhite from "@/assets/brand/logo-white.png";
import logoBlue from "@/assets/brand/logo-blue.png";
import { cn } from "@/lib/utils";

/**
 * Company logo. `tone="light"` = white logo for navy backgrounds.
 *
 * The PNGs are imported from src/assets (bundled with the code), so the logo
 * can't break if public/ is missing a file, and Next knows the intrinsic size.
 * `sizes` keeps the download small (~1x/2x of the displayed width).
 */
export function Logo({ tone = "dark", className, priority }: { tone?: "light" | "dark"; className?: string; priority?: boolean }) {
  const light = tone === "light";
  return (
    <Image
      src={light ? logoWhite : logoBlue}
      alt="ADS Global Limited"
      priority={priority}
      sizes="128px"
      className={cn("w-auto", light ? "h-11" : "h-10", className)}
    />
  );
}
