"use client";

import { useId, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { getAttachmentUploadSignature } from "@/app/actions/forms";
import {
  ALLOWED_ATTACHMENT_EXT,
  ATTACHMENT_ACCEPT,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type AttachmentInput,
} from "@/lib/forms/schemas";
import { fieldId } from "./fields";

interface Uploading {
  key: string;
  name: string;
  progress: number;
}

const fmtSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function uploadOne(file: File, sig: Exclude<Awaited<ReturnType<typeof getAttachmentUploadSignature>>, { error: string }>, onProgress: (p: number) => void) {
  return new Promise<AttachmentInput>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    if (sig.type) form.append("type", sig.type);
    if (sig.allowedFormats) form.append("allowed_formats", sig.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText) as Record<string, unknown>;
        if (xhr.status >= 300 || !res.public_id) {
          reject(new Error((res.error as { message?: string } | undefined)?.message ?? "Upload rejected."));
          return;
        }
        resolve({
          publicId: String(res.public_id),
          version: Number(res.version),
          signature: String(res.signature),
          resourceType: (res.resource_type as AttachmentInput["resourceType"]) ?? "raw",
          format: typeof res.format === "string" ? res.format : undefined,
          bytes: Number(res.bytes ?? file.size),
          filename: file.name.slice(0, 200),
          mimeType: file.type || "application/octet-stream",
        });
      } catch {
        reject(new Error("Unexpected response from the upload service."));
      }
    };
    xhr.send(form);
  });
}

/**
 * Spec sheets / images for an RFQ. Files go straight from the browser to
 * Cloudinary as private ("authenticated") assets using a short-lived signature;
 * the server re-verifies size and type before attaching them to the enquiry.
 */
export function AttachmentUploader({
  idPrefix,
  files,
  onChange,
  error,
}: {
  idPrefix: string;
  files: AttachmentInput[];
  onChange: (files: AttachmentInput[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [status, setStatus] = useState<string>("");
  const [problem, setProblem] = useState<string>("");
  const hintId = useId();
  const id = fieldId(idPrefix, "attachments");
  const remaining = MAX_ATTACHMENTS - files.length - uploading.length;

  async function handleFiles(list: FileList | null) {
    setProblem("");
    if (!list?.length) return;
    const chosen = Array.from(list).slice(0, Math.max(0, remaining));
    if (list.length > chosen.length) setProblem(`You can attach up to ${MAX_ATTACHMENTS} files.`);

    let current = files;
    for (const file of chosen) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!(ALLOWED_ATTACHMENT_EXT as readonly string[]).includes(ext)) {
        setProblem(`“${file.name}” isn't an accepted file type.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setProblem(`“${file.name}” is larger than ${fmtSize(MAX_ATTACHMENT_BYTES)}.`);
        continue;
      }
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      setUploading((u) => [...u, { key, name: file.name, progress: 0 }]);
      setStatus(`Uploading ${file.name}…`);
      try {
        const sig = await getAttachmentUploadSignature();
        if ("error" in sig) throw new Error(sig.error);
        const uploaded = await uploadOne(file, sig, (p) => setUploading((u) => u.map((x) => (x.key === key ? { ...x, progress: p } : x))));
        current = [...current, uploaded];
        onChange(current);
        setStatus(`${file.name} uploaded.`);
      } catch (err) {
        setProblem(err instanceof Error ? err.message : "Upload failed.");
        setStatus("");
      } finally {
        setUploading((u) => u.filter((x) => x.key !== key));
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        Spec sheets, drawings or photos <span className="font-normal text-muted">(optional)</span>
      </p>
      <p id={hintId} className="mt-1.5 text-sm text-muted">
        Up to {MAX_ATTACHMENTS} files, {fmtSize(MAX_ATTACHMENT_BYTES)} each: PDF, JPG, PNG, WebP, Word, Excel or CSV. Files are stored privately.
      </p>

      <div className="mt-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={ATTACHMENT_ACCEPT}
          className="peer sr-only"
          disabled={remaining <= 0}
          aria-describedby={[hintId, error || problem ? `${id}-error` : ""].filter(Boolean).join(" ")}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <label
          htmlFor={id}
          className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-tint px-6 py-6 text-center transition-colors hover:border-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
        >
          <Paperclip className="size-6 text-brand" aria-hidden="true" />
          <span className="font-semibold">{remaining > 0 ? "Choose files to attach" : "Maximum files attached"}</span>
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      {(problem || error) && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-medium text-danger">
          {problem || error}
        </p>
      )}

      {(files.length > 0 || uploading.length > 0) && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li key={f.publicId} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <FileText className="size-5 shrink-0 text-brand" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.filename}</span>
              <span className="text-xs text-muted">{fmtSize(f.bytes)}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((x) => x.publicId !== f.publicId))}
                className="grid size-9 place-items-center rounded-full hover:bg-tint"
                aria-label={`Remove ${f.filename}`}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {uploading.map((u) => (
            <li key={u.key} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
              <Loader2 className="size-5 shrink-0 animate-spin text-brand" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm">{u.name}</span>
              <span className="text-xs tabular-nums text-muted">{u.progress}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
