"use server";

import { requireStaff } from "@/lib/auth";
import { signSiteImageUpload, type UploadSignature } from "@/lib/cloudinary";

/** Signed parameters for an admin upload of a public site image (staff only). */
export async function getSiteImageUploadSignature(): Promise<UploadSignature | { error: string }> {
  await requireStaff();
  return signSiteImageUpload() ?? { error: "Cloudinary isn't configured. Paste an image URL instead, or set the CLOUDINARY_* variables." };
}
