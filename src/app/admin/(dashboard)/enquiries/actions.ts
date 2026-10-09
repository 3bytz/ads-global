"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, fd, ok, zodFail, type ActionState } from "@/lib/admin/action-state";
import { staffClient, superAdminClient } from "@/lib/admin/server";
import { enquiryStatuses } from "@/lib/admin/enquiries";

const uuid = z.uuid();

const updateSchema = z.object({
  status: z.enum(enquiryStatuses),
  assignee: z.union([z.literal(""), z.uuid()]),
  office: z.string().max(40),
});

export async function updateEnquiry(id: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  if (!uuid.safeParse(id).success) return fail("Invalid enquiry.");
  const parsed = updateSchema.safeParse({
    status: fd.str(form, "status"),
    assignee: fd.str(form, "assignee") ?? "",
    office: fd.str(form, "office") ?? "",
  });
  if (!parsed.success) return zodFail(parsed.error);

  const { supabase } = await staffClient();
  const { error } = await supabase
    .from("enquiries")
    .update({
      status: parsed.data.status,
      assignee_id: parsed.data.assignee || null,
      office_slug: parsed.data.office || null,
    })
    .eq("id", id);
  if (error) return fail(`Couldn't save: ${error.message}`);

  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin/enquiries");
  return ok("Updated.");
}

export async function addNote(id: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  if (!uuid.safeParse(id).success) return fail("Invalid enquiry.");
  const body = z
    .string()
    .trim()
    .min(1, { error: "Write a note first." })
    .max(4000, { error: "Keep notes under 4,000 characters." })
    .safeParse(fd.str(form, "body") ?? "");
  if (!body.success) return fail(body.error.issues[0]?.message ?? "Invalid note.", { body: body.error.issues[0]?.message ?? "" });

  const { staff, supabase } = await staffClient();
  const { error } = await supabase.from("enquiry_notes").insert({ enquiry_id: id, body: body.data, author_id: staff.id });
  if (error) return fail(`Couldn't add note: ${error.message}`);
  revalidatePath(`/admin/enquiries/${id}`);
  return ok("Note added.");
}

export async function deleteNote(enquiryId: string, noteId: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  if (!uuid.safeParse(noteId).success) return fail("Invalid note.");
  const { supabase } = await staffClient();
  const { error, count } = await supabase.from("enquiry_notes").delete({ count: "exact" }).eq("id", noteId);
  if (error) return fail(error.message);
  if (!count) return fail("You can only delete your own notes.");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return ok("Note deleted.");
}

export async function deleteEnquiry(id: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  if (!uuid.safeParse(id).success) return fail("Invalid enquiry.");
  const { supabase } = await superAdminClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries?deleted=1");
}
