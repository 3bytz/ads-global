import "server-only";
import { createHash } from "node:crypto";
import { serverEnv, isCloudinaryConfigured } from "@/lib/env.server";
import { ALLOWED_ATTACHMENT_EXT, MAX_ATTACHMENT_BYTES, type AttachmentInput } from "@/lib/forms/schemas";

/**
 * Cloudinary helpers without the SDK (signing is plain SHA-1).
 *  - Enquiry attachments are uploaded as type "authenticated" (private): they can
 *    only be fetched through a short-lived signed download URL generated for staff.
 *  - Site images (admin uploads) are public "upload" assets.
 */

export const ENQUIRY_FOLDER = "ads-enquiries";
export const SITE_FOLDER = "ads-site";

/** Cloudinary API signature: sorted key=value pairs joined by "&", + secret, SHA-1 hex. */
export function signParams(params: Record<string, string | number>): string {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + serverEnv.CLOUDINARY_API_SECRET).digest("hex");
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  type?: "authenticated" | "upload";
  allowedFormats?: string;
}

/** Signed params for a browser → Cloudinary upload of a private enquiry attachment. */
export function signEnquiryUpload(): UploadSignature | null {
  if (!isCloudinaryConfigured) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const month = new Date().toISOString().slice(0, 7);
  const folder = `${ENQUIRY_FOLDER}/${month}`;
  const allowedFormats = ALLOWED_ATTACHMENT_EXT.join(",");
  const signature = signParams({ allowed_formats: allowedFormats, folder, timestamp, type: "authenticated" });
  return {
    cloudName: serverEnv.CLOUDINARY_CLOUD_NAME!,
    apiKey: serverEnv.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    type: "authenticated",
    allowedFormats,
  };
}

/** Signed params for an admin upload of a public site image. */
export function signSiteImageUpload(): UploadSignature | null {
  if (!isCloudinaryConfigured) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const allowedFormats = "jpg,jpeg,png,webp,avif";
  const signature = signParams({ allowed_formats: allowedFormats, folder: SITE_FOLDER, timestamp });
  return {
    cloudName: serverEnv.CLOUDINARY_CLOUD_NAME!,
    apiKey: serverEnv.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: SITE_FOLDER,
    allowedFormats,
  };
}

/** Verifies the signature Cloudinary returned for an upload (proves the asset came from our account). */
export function isGenuineUpload(a: Pick<AttachmentInput, "publicId" | "version" | "signature">): boolean {
  if (!isCloudinaryConfigured) return false;
  const expected = createHash("sha1")
    .update(`public_id=${a.publicId}&version=${a.version}${serverEnv.CLOUDINARY_API_SECRET}`)
    .digest("hex");
  return expected === a.signature.toLowerCase();
}

/**
 * Re-checks size and format with the Admin API (the browser-reported values can't be trusted).
 * Returns the verified metadata, or null if the asset is missing, too large or the wrong type.
 */
export async function verifyAttachment(a: AttachmentInput): Promise<{ bytes: number; format: string | null } | null> {
  if (!isCloudinaryConfigured || !isGenuineUpload(a) || !a.publicId.startsWith(`${ENQUIRY_FOLDER}/`)) return null;
  const auth = Buffer.from(`${serverEnv.CLOUDINARY_API_KEY}:${serverEnv.CLOUDINARY_API_SECRET}`).toString("base64");
  const url = `https://api.cloudinary.com/v1_1/${serverEnv.CLOUDINARY_CLOUD_NAME}/resources/${a.resourceType}/authenticated/${a.publicId
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` }, cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { bytes?: number; format?: string };
    const bytes = Number(data.bytes ?? 0);
    const ext = (data.format ?? a.filename.split(".").pop() ?? "").toLowerCase();
    if (!bytes || bytes > MAX_ATTACHMENT_BYTES) return null;
    if (!(ALLOWED_ATTACHMENT_EXT as readonly string[]).includes(ext)) return null;
    return { bytes, format: data.format ?? null };
  } catch (err) {
    console.error("[cloudinary] verify failed", err);
    return null;
  }
}

/** Short-lived signed download URL for a private (authenticated) asset — staff only. */
export function privateDownloadUrl(opts: { publicId: string; resourceType: string; format?: string | null; expiresInSeconds?: number }): string | null {
  if (!isCloudinaryConfigured) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    attachment: "true",
    expires_at: timestamp + (opts.expiresInSeconds ?? 300),
    public_id: opts.publicId,
    timestamp,
    type: "authenticated",
  };
  if (opts.format && opts.resourceType !== "raw") params.format = opts.format;
  const signature = signParams(params);
  const query = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), signature, api_key: serverEnv.CLOUDINARY_API_KEY! });
  return `https://api.cloudinary.com/v1_1/${serverEnv.CLOUDINARY_CLOUD_NAME}/${opts.resourceType}/download?${query.toString()}`;
}
