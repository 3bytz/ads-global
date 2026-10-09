import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { privateDownloadUrl } from "@/lib/cloudinary";

/**
 * Staff-only attachment download. Looks the attachment up with the user's
 * RLS-bound client (so non-staff can't resolve it), then redirects to a
 * Cloudinary signed download URL that expires in 5 minutes.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const staff = await getStaff();
  if (!staff) return new NextResponse("Unauthorized", { status: 401 });
  const { id, attachmentId } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 503 });

  const { data } = await supabase
    .from("enquiry_attachments")
    .select("public_id, resource_type, format")
    .eq("id", attachmentId)
    .eq("enquiry_id", id)
    .maybeSingle();
  if (!data) return new NextResponse("Not found", { status: 404 });

  const url = privateDownloadUrl({
    publicId: String(data.public_id),
    resourceType: String(data.resource_type),
    format: (data.format as string | null) ?? null,
    expiresInSeconds: 300,
  });
  if (!url) return new NextResponse("File storage is not configured", { status: 503 });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
