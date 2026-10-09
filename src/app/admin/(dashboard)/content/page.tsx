import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Image as ImageIcon, LayoutGrid, ListOrdered } from "lucide-react";
import { AdminHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Content" };

const sections = [
  { href: "/admin/content/categories", icon: LayoutGrid, title: "Products & services", text: "The 14 categories: images, text, group, order, example products and Incoterms." },
  { href: "/admin/content/projects", icon: FolderKanban, title: "Projects", text: "Case studies — write, add a cover photo and publish when ready." },
  { href: "/admin/content/hero", icon: ImageIcon, title: "Home hero", text: "Headline, sub-headline, background photo and optional desktop video." },
  { href: "/admin/content/process", icon: ListOrdered, title: "How we work", text: "The five process steps shown on the home and How we work pages." },
];

export default function ContentIndex() {
  return (
    <div>
      <AdminHeader eyebrow="Content" title="Website content" description="Changes appear on the public site within a few seconds of saving." />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, icon: Icon, title, text }) => (
          <li key={href}>
            <Link href={href} className="flex h-full gap-4 rounded-xl border border-line bg-white p-6 transition-colors hover:border-ink">
              <Icon className="size-6 shrink-0 text-brand" aria-hidden="true" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-muted">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
