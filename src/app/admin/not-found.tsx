import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24">
      <p className="eyebrow text-accent-ink">Error 404</p>
      <h1 className="headline mt-2 text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">This admin page doesn&apos;t exist (yet).</p>
      <Link href="/admin" className="mt-8 inline-block font-semibold text-brand underline underline-offset-4">
        Back to the overview
      </Link>
    </main>
  );
}
