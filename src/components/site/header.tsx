"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { primaryNav, quoteHref } from "./nav";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

/**
 * Site header. Transparent over the navy page hero (every public page starts
 * with one), then turns solid white once the visitor scrolls.
 * The mobile menu is a modal dialog: focus is trapped, Esc closes it and focus
 * returns to the toggle.
 */
function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const getScrolled = () => window.scrollY > 24;
const getServerScrolled = () => false;

export function Header() {
  const pathname = usePathname();
  // Server snapshot is always "not scrolled", so server and first client render match.
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getServerScrolled);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close the menu when the route changes (render-time state adjustment, no effect needed).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const solid = scrolled && !open;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500",
        solid ? "bg-white/95 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur" : "bg-transparent text-white",
      )}
    >
      <div className="wrap flex h-20 items-center justify-between gap-6 lg:h-24">
        <Link href="/" className="shrink-0 rounded-sm" aria-label="ADS Global Limited — home">
          <Logo tone={solid ? "dark" : "light"} priority className={solid ? "h-9 lg:h-10" : "h-10 lg:h-11"} />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors",
                    solid ? "hover:bg-tint" : "hover:bg-white/10",
                    isActive(item.href) && "after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:bg-accent",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href={quoteHref} variant="accent" className="hidden sm:inline-flex">
            Request a quote
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className={cn(
              "grid size-12 place-items-center rounded-full border xl:hidden",
              solid ? "border-ink/20" : "border-white/40",
            )}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      <div
        id={menuId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto bg-ink text-white lg:top-24 xl:hidden"
      >
        <nav aria-label="Mobile" className="wrap flex min-h-full flex-col justify-between gap-12 py-10">
          <ul className="space-y-1">
            {[{ label: "Home", href: "/" }, ...primaryNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="headline block py-2 text-5xl text-white transition-colors hover:text-accent aria-[current=page]:text-accent sm:text-6xl"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={quoteHref} variant="accent" onClick={() => setOpen(false)}>
              Request a quote
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-light" onClick={() => setOpen(false)}>
              Contact us
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
