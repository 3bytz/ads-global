"use server";

import { z } from "zod";
import { fail, fd, ok, optionalUrl, slugify, zodFail, type ActionState } from "@/lib/admin/action-state";
import { revalidatePublicSite, staffClient } from "@/lib/admin/server";
import { isCountryCode } from "@/lib/countries";
import type { SupabaseClient } from "@supabase/supabase-js";

const email = z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email." }));
const phone = z.string().trim().regex(/^\+[0-9]{7,15}$/, { error: "Use international format with no spaces, e.g. +2349030428141." });
const optionalPhone = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), phone.optional());

async function mergeSetting(supabase: SupabaseClient, key: string, patch: Record<string, unknown>) {
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
  const value = { ...((data?.value as Record<string, unknown> | undefined) ?? {}), ...patch };
  return supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
}

async function saveSetting(key: string, patch: Record<string, unknown>, message = "Saved."): Promise<ActionState> {
  const { supabase } = await staffClient();
  const { error } = await mergeSetting(supabase, key, patch);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok(message);
}

// ------------------------------------------------------------------ Company

export async function saveCompany(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(80),
      legalName: z.string().trim().min(2).max(120),
      tagline: z.string().trim().max(160),
      positioning: z.string().trim().max(80),
      shortDescription: z.string().trim().min(20).max(300),
      claimsMode: z.enum(["flag", "hide"]),
    })
    .safeParse({
      name: fd.str(form, "name"),
      legalName: fd.str(form, "legalName"),
      tagline: fd.str(form, "tagline") ?? "",
      positioning: fd.str(form, "positioning") ?? "",
      shortDescription: fd.str(form, "shortDescription"),
      claimsMode: fd.str(form, "claimsMode"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  return saveSetting("company", parsed.data, parsed.data.claimsMode === "hide" ? "Saved. Unconfirmed claims are now hidden on the site." : "Saved. Unconfirmed claims show with a marker.");
}

// ------------------------------------------------------------------ About

export async function saveAbout(_prev: ActionState, form: FormData): Promise<ActionState> {
  const storyRaw = (form.get("story") as string | null) ?? "";
  const values = fd.lines(form, "values").map((line) => {
    const [title, ...rest] = line.split(/\s+[—–-]\s+/);
    return { title: (title ?? "").trim(), description: rest.join(" — ").trim() };
  });
  const parsed = z
    .object({
      story: z.array(z.string().max(1200)).min(1, { error: "Write at least one paragraph." }).max(6),
      mission: z.string().trim().min(10).max(500),
      vision: z.string().trim().min(10).max(500),
      missionVisionConfirmed: z.boolean(),
      values: z.array(z.object({ title: z.string().min(2).max(60), description: z.string().max(240) })).max(8),
    })
    .safeParse({
      story: storyRaw
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      mission: fd.str(form, "mission"),
      vision: fd.str(form, "vision"),
      missionVisionConfirmed: fd.bool(form, "missionVisionConfirmed"),
      values,
    });
  if (!parsed.success) return zodFail(parsed.error);
  return saveSetting("about", parsed.data);
}

// ------------------------------------------------------------------ Contact & routing

export async function saveContact(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      generalEmail: email,
      partnersEmail: email,
      website: z.url({ error: "Enter a full URL." }),
      primaryPhone: phone,
      defaultOfficeSlug: z.string().min(1),
    })
    .safeParse({
      generalEmail: fd.str(form, "generalEmail"),
      partnersEmail: fd.str(form, "partnersEmail"),
      website: fd.str(form, "website"),
      primaryPhone: fd.str(form, "primaryPhone"),
      defaultOfficeSlug: fd.str(form, "defaultOfficeSlug"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  return saveSetting("contact", parsed.data);
}

/** Replaces the routing rules of one office with the submitted list of country codes. */
export async function saveRouting(officeSlug: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const raw = ((form.get("countries") as string | null) ?? "").toUpperCase();
  const codes = Array.from(new Set(raw.split(/[\s,;]+/).filter(Boolean)));
  const invalid = codes.filter((c) => !isCountryCode(c));
  if (invalid.length) return fail(`Unknown country codes: ${invalid.join(", ")}. Use ISO 3166 two-letter codes (NG, GH, CN…).`, { countries: "Fix the unknown codes." });

  const { supabase } = await staffClient();
  // Remove this office's old rules, then (re)assign the listed countries to it.
  const del = await supabase.from("routing_rules").delete().eq("office_slug", officeSlug);
  if (del.error) return fail(del.error.message);
  if (codes.length) {
    const { error } = await supabase.from("routing_rules").upsert(
      codes.map((country_code) => ({ country_code, office_slug: officeSlug })),
      { onConflict: "country_code" },
    );
    if (error) return fail(error.message);
  }
  return ok(`${codes.length} ${codes.length === 1 ? "country routes" : "countries route"} to this office.`);
}

// ------------------------------------------------------------------ Socials

export async function saveSocials(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({ linkedin: optionalUrl, x: optionalUrl, facebook: optionalUrl, instagram: optionalUrl })
    .safeParse({
      linkedin: fd.str(form, "linkedin"),
      x: fd.str(form, "x"),
      facebook: fd.str(form, "facebook"),
      instagram: fd.str(form, "instagram"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  const homepages = Object.entries(parsed.data).filter(([, v]) => v && /^https?:\/\/(www\.)?(linkedin|twitter|x|facebook|instagram)\.com\/?$/i.test(v));
  if (homepages.length) {
    return fail("Those look like the networks' home pages. Paste ADS Global's own profile URLs.", Object.fromEntries(homepages.map(([k]) => [k, "Use the company profile URL."])));
  }
  return saveSetting("socials", {
    linkedin: parsed.data.linkedin ?? null,
    x: parsed.data.x ?? null,
    facebook: parsed.data.facebook ?? null,
    instagram: parsed.data.instagram ?? null,
  });
}

// ------------------------------------------------------------------ Hero

export async function saveHero(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      eyebrow: z.string().trim().max(60),
      headlineLine1: z.string().trim().min(2).max(60),
      headlineLine2: z.string().trim().max(60),
      subhead: z.string().trim().max(300),
      imageUrl: optionalUrl,
      imageAlt: z.string().trim().max(200),
      videoUrl: optionalUrl,
    })
    .refine((v) => !v.imageUrl || v.imageAlt.length >= 5, { path: ["imageAlt"], error: "Alt text is required for the hero photo." })
    .refine((v) => !v.videoUrl || /\.(mp4|webm)(\?.*)?$/i.test(v.videoUrl), { path: ["videoUrl"], error: "Link directly to an .mp4 or .webm file (not a web page)." })
    .safeParse({
      eyebrow: fd.str(form, "eyebrow") ?? "",
      headlineLine1: fd.str(form, "headlineLine1"),
      headlineLine2: fd.str(form, "headlineLine2") ?? "",
      subhead: fd.str(form, "subhead") ?? "",
      imageUrl: fd.str(form, "imageUrl"),
      imageAlt: fd.str(form, "imageAlt") ?? "",
      videoUrl: fd.str(form, "videoUrl"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  return saveSetting("hero", { ...parsed.data, imageUrl: parsed.data.imageUrl ?? null, videoUrl: parsed.data.videoUrl ?? null }, "Hero saved.");
}

// ------------------------------------------------------------------ Stats & claims

export async function saveStat(key: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      label: z.string().trim().min(2).max(80),
      value: z.coerce.number().min(0).max(1e9),
      prefix: z.string().max(4),
      suffix: z.string().max(4),
      confirmed: z.boolean(),
      note: z.string().max(500),
      sort_order: z.coerce.number().int().min(0).max(99),
    })
    .safeParse({
      label: fd.str(form, "label"),
      value: fd.str(form, "value"),
      prefix: fd.str(form, "prefix") ?? "",
      suffix: fd.str(form, "suffix") ?? "",
      confirmed: fd.bool(form, "confirmed"),
      note: fd.str(form, "note") ?? "",
      sort_order: fd.str(form, "sort_order") ?? "0",
    });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const { error } = await supabase.from("stats").update(parsed.data).eq("key", key);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok(parsed.data.confirmed ? "Saved — shown on the site." : "Saved — still flagged as unconfirmed.");
}

export async function addStat(_prev: ActionState, form: FormData): Promise<ActionState> {
  const label = fd.str(form, "label") ?? "";
  if (label.length < 2) return fail("Enter a label.", { label: "Enter a label." });
  const { supabase } = await staffClient();
  const { error } = await supabase.from("stats").insert({ key: slugify(label).replace(/-/g, "_"), label, value: 0, confirmed: false, sort_order: 50 });
  if (error) return fail(error.code === "23505" ? "A stat with that name already exists." : error.message);
  return ok("Stat added — set its value below.");
}

export async function deleteStat(key: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  const { supabase } = await staffClient();
  const { error } = await supabase.from("stats").delete().eq("key", key);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Deleted.");
}

export async function saveClaim(key: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({ text: z.string().trim().min(3).max(240), confirmed: z.boolean(), note: z.string().max(1000) })
    .safeParse({ text: fd.str(form, "text"), confirmed: fd.bool(form, "confirmed"), note: fd.str(form, "note") ?? "" });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const { error } = await supabase.from("claims").update(parsed.data).eq("key", key);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Saved.");
}

// ------------------------------------------------------------------ Offices

export async function saveOffice(slug: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const hours = [0, 1, 2]
    .map((i) => ({
      days: fd.str(form, `hours_${i}_days`) ?? "",
      opens: fd.str(form, `hours_${i}_opens`) ?? null,
      closes: fd.str(form, `hours_${i}_closes`) ?? null,
      note: fd.str(form, `hours_${i}_note`),
    }))
    .filter((h) => h.days);
  const time = z.union([z.null(), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Use 24-hour HH:MM." })]);
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(80),
      legal_entity: z.preprocess((v) => (v === undefined || v === "" ? null : v), z.string().trim().max(160).nullable()),
      registration: z.preprocess((v) => (v === undefined || v === "" ? null : v), z.string().trim().max(60).nullable()),
      city: z.string().trim().min(2).max(80),
      country: z.string().trim().min(2).max(80),
      address: z.string().trim().max(300),
      address_confirmed: z.boolean(),
      phone,
      whatsapp: optionalPhone,
      email,
      map_url: optionalUrl,
      hours: z.array(z.object({ days: z.string().max(30), opens: time, closes: time, note: z.string().max(120).optional() })).max(3),
      hours_confirmed: z.boolean(),
    })
    .safeParse({
      name: fd.str(form, "name"),
      legal_entity: fd.str(form, "legal_entity"),
      registration: fd.str(form, "registration"),
      city: fd.str(form, "city"),
      country: fd.str(form, "country"),
      address: fd.str(form, "address") ?? "",
      address_confirmed: fd.bool(form, "address_confirmed"),
      phone: fd.str(form, "phone"),
      whatsapp: fd.str(form, "whatsapp"),
      email: fd.str(form, "email"),
      map_url: fd.str(form, "map_url"),
      hours,
      hours_confirmed: fd.bool(form, "hours_confirmed"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const { error } = await supabase
    .from("offices")
    .update({ ...parsed.data, whatsapp: parsed.data.whatsapp ?? null, map_url: parsed.data.map_url ?? null })
    .eq("slug", slug);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Office saved.");
}

// ------------------------------------------------------------------ Certifications & leaders

export async function saveCertification(slug: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(120),
      issuer: z.string().trim().max(120),
      reference: z.string().trim().max(80),
      valid_until: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.union([z.null(), z.iso.date({ error: "Use YYYY-MM-DD." })])),
      document_url: optionalUrl,
      confirmed: z.boolean(),
    })
    .safeParse({
      name: fd.str(form, "name"),
      issuer: fd.str(form, "issuer") ?? "",
      reference: fd.str(form, "reference") ?? "",
      valid_until: fd.str(form, "valid_until"),
      document_url: fd.str(form, "document_url"),
      confirmed: fd.bool(form, "confirmed"),
    });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const row = { ...parsed.data, document_url: parsed.data.document_url ?? null };
  const { error } = slug
    ? await supabase.from("certifications").update(row).eq("slug", slug)
    : await supabase.from("certifications").insert({ ...row, slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}`, sort_order: 50 });
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Saved.");
}

export async function saveLeader(slug: string | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(120),
      role: z.string().trim().max(120),
      bio: z.string().trim().max(800),
      photo_url: optionalUrl,
      confirmed: z.boolean(),
      sort_order: z.coerce.number().int().min(0).max(99),
    })
    .safeParse({
      name: fd.str(form, "name"),
      role: fd.str(form, "role") ?? "",
      bio: fd.str(form, "bio") ?? "",
      photo_url: fd.str(form, "photo_url"),
      confirmed: fd.bool(form, "confirmed"),
      sort_order: fd.str(form, "sort_order") ?? "0",
    });
  if (!parsed.success) return zodFail(parsed.error);
  const { supabase } = await staffClient();
  const row = { ...parsed.data, photo_url: parsed.data.photo_url ?? null };
  const { error } = slug
    ? await supabase.from("leaders").update(row).eq("slug", slug)
    : await supabase.from("leaders").insert({ ...row, slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}` });
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Saved.");
}

export async function deleteRow(table: "certifications" | "leaders", slug: string, _prev: ActionState, _form: FormData): Promise<ActionState> {
  if (table !== "certifications" && table !== "leaders") return fail("Not allowed.");
  const { supabase } = await staffClient();
  const { error } = await supabase.from(table).delete().eq("slug", slug);
  if (error) return fail(error.message);
  revalidatePublicSite();
  return ok("Deleted.");
}
