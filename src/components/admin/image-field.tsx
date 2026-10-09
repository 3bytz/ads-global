"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { getSiteImageUploadSignature } from "@/app/admin/(dashboard)/content/upload-action";
import { useActionFormState } from "./action-form";

const MAX_BYTES = 8 * 1024 * 1024;
const allowedHosts = ["images.unsplash.com", "images.pexels.com", "res.cloudinary.com"];

/**
 * Image URL + required alt text, with optional signed upload to Cloudinary
 * (public site folder). Uploading a company photo clears the "stock" flag.
 */
export function ImageField({
  urlName,
  altName,
  stockName,
  label,
  defaultUrl,
  defaultAlt,
  defaultStock,
}: {
  urlName: string;
  altName: string;
  stockName?: string;
  label: string;
  defaultUrl?: string | null;
  defaultAlt?: string | null;
  defaultStock?: boolean;
}) {
  const state = useActionFormState();
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [stock, setStock] = useState(Boolean(defaultStock));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const urlError = state.fieldErrors?.[urlName];
  const altError = state.fieldErrors?.[altName];
  let previewable = false;
  try {
    previewable = Boolean(url) && allowedHosts.includes(new URL(url).hostname);
  } catch {
    previewable = false;
  }

  async function upload(file: File) {
    setProblem("");
    if (!file.type.startsWith("image/")) return setProblem("Choose an image file (JPG, PNG, WebP or AVIF).");
    if (file.size > MAX_BYTES) return setProblem("Image is larger than 8 MB. Export a smaller version (about 2400 px wide is plenty).");
    setBusy(true);
    try {
      const sig = await getSiteImageUploadSignature();
      if ("error" in sig) throw new Error(sig.error);
      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.apiKey);
      body.append("timestamp", String(sig.timestamp));
      body.append("signature", sig.signature);
      body.append("folder", sig.folder);
      if (sig.allowedFormats) body.append("allowed_formats", sig.allowedFormats);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body });
      const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
      if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? "Upload failed.");
      setUrl(json.secure_url);
      setStock(false);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="space-y-4 rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative grid aspect-[4/3] w-40 shrink-0 place-items-center overflow-hidden rounded-lg bg-tint">
          {previewable ? <Image src={url} alt="" fill sizes="160px" className="object-cover" /> : <ImageOff className="size-6 text-muted" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <label className="block text-sm font-semibold">
            Image URL
            <input
              name={urlName}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/…"
              aria-invalid={Boolean(urlError) || undefined}
              className="mt-1.5 block w-full rounded-lg border border-line px-3.5 py-2.5 text-sm font-normal outline-none focus:border-brand"
            />
          </label>
          {urlError && <p className="text-xs font-medium text-danger">{urlError}</p>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand">
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
            {busy ? "Uploading…" : "Upload a photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          </label>
          <p role="status" aria-live="polite" className="text-xs text-danger">
            {problem}
          </p>
        </div>
      </div>
      <label className="block text-sm font-semibold">
        Alt text <span className="text-danger">*</span>
        <input
          name={altName}
          defaultValue={defaultAlt ?? ""}
          required
          aria-invalid={Boolean(altError) || undefined}
          className="mt-1.5 block w-full rounded-lg border border-line px-3.5 py-2.5 text-sm font-normal outline-none focus:border-brand"
        />
        <span className="mt-1 block text-xs font-normal text-muted">Describe what the photo shows for visitors who can&apos;t see it. Required.</span>
      </label>
      {altError && <p className="text-xs font-medium text-danger">{altError}</p>}
      {stockName && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={stockName} checked={stock} onChange={(e) => setStock(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          This is a stock photo
          {stock && <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-ink">Replace with a company photo when available</span>}
        </label>
      )}
    </fieldset>
  );
}
