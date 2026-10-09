import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { Checkbox, Input, Select, Textarea } from "@/components/admin/fields";
import { AdminHeader, Badge, Card } from "@/components/admin/ui";
import {
  addStat,
  deleteRow,
  deleteStat,
  saveAbout,
  saveCertification,
  saveClaim,
  saveCompany,
  saveContact,
  saveLeader,
  saveOffice,
  saveRouting,
  saveSocials,
  saveStat,
} from "./actions";
import { staffClient } from "@/lib/admin/server";
import { getSiteSettings } from "@/lib/content/queries";
import type { HoursRow } from "@/content/types";

export const metadata: Metadata = { title: "Company settings" };
export const dynamic = "force-dynamic";

const sections = [
  ["claims", "Claims & stats"],
  ["company", "Company"],
  ["about", "About & mission"],
  ["contact", "Contact & routing"],
  ["offices", "Offices & hours"],
  ["socials", "Social links"],
  ["certifications", "Certifications"],
  ["leaders", "Leadership"],
] as const;

export default async function SettingsPage() {
  const { supabase } = await staffClient();
  const [settings, stats, claims, offices, routing, certs, leaders] = await Promise.all([
    getSiteSettings(),
    supabase.from("stats").select("*").order("sort_order"),
    supabase.from("claims").select("*").order("key"),
    supabase.from("offices").select("*").order("sort_order"),
    supabase.from("routing_rules").select("country_code, office_slug").order("country_code"),
    supabase.from("certifications").select("*").order("sort_order"),
    supabase.from("leaders").select("*").order("sort_order"),
  ]);
  const officeRows = (offices.data ?? []) as Array<Record<string, unknown>>;
  const routes = (routing.data ?? []) as Array<{ country_code: string; office_slug: string }>;
  const unconfirmedStats = ((stats.data ?? []) as Array<{ confirmed: boolean }>).filter((s) => !s.confirmed).length;
  const unconfirmedClaims = ((claims.data ?? []) as Array<{ confirmed: boolean }>).filter((c) => !c.confirmed).length;

  return (
    <div className="space-y-10">
      <AdminHeader eyebrow="Settings" title="Company settings" description="Every company fact shown on the website lives here. Saving updates the site within seconds." />

      <nav aria-label="Settings sections" className="flex flex-wrap gap-2">
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-ink">
            {label}
          </a>
        ))}
      </nav>

      {/* Claims mode + stats + claims */}
      <section id="claims" className="scroll-mt-8 space-y-6">
        <Card
          title="Claims mode"
          description={
            <>
              <strong>Flag</strong> shows unconfirmed facts with an &ldquo;Unconfirmed&rdquo; marker (pre-launch review). <strong>Hide</strong> removes them from the public site. Switch to Hide
              before launch. Currently {unconfirmedStats} stat(s) and {unconfirmedClaims} claim(s) are unconfirmed.
            </>
          }
        >
          <ActionForm action={saveCompany}>
            <input type="hidden" name="name" value={settings.company.name} />
            <input type="hidden" name="legalName" value={settings.company.legalName} />
            <input type="hidden" name="tagline" value={settings.company.tagline} />
            <input type="hidden" name="positioning" value={settings.company.positioning} />
            <input type="hidden" name="shortDescription" value={settings.company.shortDescription} />
            <Select
              idPrefix="mode"
              name="claimsMode"
              label="Unconfirmed claims"
              defaultValue={settings.company.claimsMode}
              options={[
                { value: "flag", label: "Flag — show with marker (pre-launch)" },
                { value: "hide", label: "Hide — remove from site (live)" },
              ]}
            />
          </ActionForm>
        </Card>

        <Card title="Statistics" description="Animated counters on the home page. Only confirmed numbers appear once Claims mode is Hide.">
          <div className="space-y-4">
            {((stats.data ?? []) as Array<Record<string, unknown>>).map((s) => (
              <div key={String(s.key)} className="rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs text-muted">{String(s.key)}</span>
                  {s.confirmed ? <Badge tone="won">Confirmed</Badge> : <Badge tone="warn">Unconfirmed</Badge>}
                </div>
                <ActionForm action={saveStat.bind(null, String(s.key))}>
                  <div className="grid gap-3 sm:grid-cols-6">
                    <Input idPrefix={`stat-${s.key}`} name="label" label="Label" defaultValue={String(s.label)} className="sm:col-span-2" />
                    <Input idPrefix={`stat-${s.key}`} name="prefix" label="Prefix" defaultValue={String(s.prefix)} />
                    <Input idPrefix={`stat-${s.key}`} name="value" label="Value" type="number" defaultValue={Number(s.value)} />
                    <Input idPrefix={`stat-${s.key}`} name="suffix" label="Suffix" defaultValue={String(s.suffix)} hint="e.g. + or %" />
                    <Input idPrefix={`stat-${s.key}`} name="sort_order" label="Order" type="number" defaultValue={Number(s.sort_order)} />
                    <Textarea idPrefix={`stat-${s.key}`} name="note" label="Internal note / source" rows={2} defaultValue={String(s.note ?? "")} className="sm:col-span-6" />
                    <div className="sm:col-span-6">
                      <Checkbox idPrefix={`stat-${s.key}`} name="confirmed" label="Confirmed by ADS (evidence on file)" defaultChecked={Boolean(s.confirmed)} />
                    </div>
                  </div>
                </ActionForm>
                <div className="mt-3">
                  <ActionForm action={deleteStat.bind(null, String(s.key))} submitLabel="Delete stat" danger compact confirm="Delete this statistic?">
                    {null}
                  </ActionForm>
                </div>
              </div>
            ))}
            <ActionForm action={addStat} submitLabel="Add stat" compact resetOnSuccess>
              <Input idPrefix="new-stat" name="label" label="New statistic label" placeholder="e.g. Containers shipped in 2025" />
            </ActionForm>
          </div>
        </Card>

        <Card title="Claims" description="Statements that need evidence before they're shown as fact.">
          <div className="space-y-4">
            {((claims.data ?? []) as Array<Record<string, unknown>>).map((c) => (
              <div key={String(c.key)} className="rounded-lg border border-line p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">{String(c.label)}</span>
                  {c.confirmed ? <Badge tone="won">Confirmed</Badge> : <Badge tone="warn">Unconfirmed</Badge>}
                </div>
                <p className="mb-3 text-xs text-muted">Old site: {String(c.source)}</p>
                <ActionForm action={saveClaim.bind(null, String(c.key))}>
                  <Input idPrefix={`claim-${c.key}`} name="text" label="Text shown on the site" defaultValue={String(c.text)} />
                  <Textarea idPrefix={`claim-${c.key}`} name="note" label="Internal note" rows={2} defaultValue={String(c.note ?? "")} />
                  <Checkbox idPrefix={`claim-${c.key}`} name="confirmed" label="Confirmed by ADS" defaultChecked={Boolean(c.confirmed)} />
                </ActionForm>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="company" className="scroll-mt-8">
        <Card title="Company">
          <ActionForm action={saveCompany}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input idPrefix="co" name="name" label="Short name" required defaultValue={settings.company.name} />
              <Input idPrefix="co" name="legalName" label="Legal name" required defaultValue={settings.company.legalName} />
              <Input idPrefix="co" name="tagline" label="Tagline" defaultValue={settings.company.tagline} />
              <Input idPrefix="co" name="positioning" label="Positioning (site title suffix)" defaultValue={settings.company.positioning} />
              <Textarea idPrefix="co" name="shortDescription" label="Short description (SEO, footer)" required rows={3} defaultValue={settings.company.shortDescription} className="md:col-span-2" />
              <input type="hidden" name="claimsMode" value={settings.company.claimsMode} />
            </div>
          </ActionForm>
        </Card>
      </section>

      <section id="about" className="scroll-mt-8">
        <Card
          title="About, mission & values"
          description={
            <>
              Alternative wording from the old site — Mission: &ldquo;{settings.about.alternateMission}&rdquo; Vision: &ldquo;{settings.about.alternateVision}&rdquo;
            </>
          }
        >
          <ActionForm action={saveAbout}>
            <Textarea idPrefix="ab" name="story" label="Our story (blank line between paragraphs)" rows={6} defaultValue={settings.about.story.join("\n\n")} />
            <Textarea idPrefix="ab" name="mission" label="Mission" rows={3} defaultValue={settings.about.mission} />
            <Textarea idPrefix="ab" name="vision" label="Vision" rows={3} defaultValue={settings.about.vision} />
            <Checkbox idPrefix="ab" name="missionVisionConfirmed" label="Mission and vision wording confirmed" defaultChecked={settings.about.missionVisionConfirmed} />
            <Textarea
              idPrefix="ab"
              name="values"
              label="Values (one per line: Title — description)"
              rows={5}
              defaultValue={settings.about.values.map((v) => `${v.title} — ${v.description}`).join("\n")}
            />
          </ActionForm>
        </Card>
      </section>

      <section id="contact" className="scroll-mt-8 space-y-6">
        <Card title="Contact details">
          <ActionForm action={saveContact}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input idPrefix="ct" name="generalEmail" label="General email" type="email" defaultValue={settings.contact.generalEmail} />
              <Input idPrefix="ct" name="partnersEmail" label="Partnerships email" type="email" defaultValue={settings.contact.partnersEmail} hint="Copied on every partner application." />
              <Input idPrefix="ct" name="website" label="Website" defaultValue={settings.contact.website} />
              <Input idPrefix="ct" name="primaryPhone" label="Primary phone" defaultValue={settings.contact.primaryPhone} hint="International format, e.g. +8618012824844" />
              <Select
                idPrefix="ct"
                name="defaultOfficeSlug"
                label="Default office for enquiries"
                defaultValue={settings.contact.defaultOfficeSlug}
                hint="Receives enquiries from countries not listed in the routing rules below."
                options={officeRows.map((o) => ({ value: String(o.slug), label: `${String(o.city)}, ${String(o.country)}` }))}
              />
            </div>
          </ActionForm>
        </Card>

        <Card title="Enquiry routing" description="Destination countries (RFQ) or sender countries (contact, partner) handled by each office. ISO two-letter codes, separated by spaces or commas.">
          <div className="space-y-6">
            {officeRows.map((o) => (
              <ActionForm key={String(o.slug)} action={saveRouting.bind(null, String(o.slug))} submitLabel={`Save ${String(o.city)} routing`}>
                <Textarea
                  idPrefix={`route-${o.slug}`}
                  name="countries"
                  label={`${String(o.city)} handles`}
                  rows={3}
                  defaultValue={routes
                    .filter((r) => r.office_slug === o.slug)
                    .map((r) => r.country_code.trim())
                    .join(" ")}
                />
              </ActionForm>
            ))}
          </div>
        </Card>
      </section>

      <section id="offices" className="scroll-mt-8 space-y-6">
        {officeRows.map((o) => {
          const hours = ((o.hours as HoursRow[]) ?? []).concat([{ days: "", opens: null, closes: null }, { days: "", opens: null, closes: null }, { days: "", opens: null, closes: null }]).slice(0, 3);
          const p = `office-${String(o.slug)}`;
          return (
            <Card key={String(o.slug)} title={`${String(o.city)} office`} description={`${String(o.timezone)} · ${String(o.tz_label)} (${String(o.utc_offset_label)})`}>
              <ActionForm action={saveOffice.bind(null, String(o.slug))}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input idPrefix={p} name="name" label="Office name" defaultValue={String(o.name)} />
                  <Input idPrefix={p} name="legal_entity" label="Registered company" defaultValue={String(o.legal_entity ?? "")} hint="As on the letterhead, e.g. Abubakar Dahiru Sadiq Global Ltd." />
                  <Input idPrefix={p} name="registration" label="Registration number" defaultValue={String(o.registration ?? "")} hint="e.g. RC 8079004" />
                  <Input idPrefix={p} name="city" label="City" defaultValue={String(o.city)} />
                  <Input idPrefix={p} name="country" label="Country" defaultValue={String(o.country)} />
                  <Input idPrefix={p} name="email" label="Email" type="email" defaultValue={String(o.email)} hint="Receives enquiries routed to this office." />
                  <Input idPrefix={p} name="phone" label="Phone" defaultValue={String(o.phone)} hint="+234… / +86…, no spaces" />
                  <Input idPrefix={p} name="whatsapp" label="WhatsApp number" defaultValue={String(o.whatsapp ?? "")} hint="Leave blank to hide the WhatsApp button." />
                  <Textarea idPrefix={p} name="address" label="Address" rows={2} defaultValue={String(o.address)} className="md:col-span-2" />
                  <Checkbox idPrefix={p} name="address_confirmed" label="Address confirmed" defaultChecked={Boolean(o.address_confirmed)} />
                  <Input idPrefix={p} name="map_url" label="Map link" defaultValue={String(o.map_url ?? "")} />
                </div>
                <fieldset className="rounded-lg border border-line p-4">
                  <legend className="px-1 text-sm font-semibold">Business hours (local time, 24h)</legend>
                  <div className="space-y-3">
                    {hours.map((h, i) => (
                      <div key={i} className="grid gap-3 sm:grid-cols-4">
                        <Input idPrefix={p} name={`hours_${i}_days`} label="Days" defaultValue={h.days} placeholder="Mon–Fri" />
                        <Input idPrefix={p} name={`hours_${i}_opens`} label="Opens" defaultValue={h.opens ?? ""} placeholder="09:00 (blank = closed)" />
                        <Input idPrefix={p} name={`hours_${i}_closes`} label="Closes" defaultValue={h.closes ?? ""} placeholder="18:00" />
                        <Input idPrefix={p} name={`hours_${i}_note`} label="Note" defaultValue={h.note ?? ""} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Checkbox idPrefix={p} name="hours_confirmed" label="Hours confirmed" defaultChecked={Boolean(o.hours_confirmed)} />
                  </div>
                </fieldset>
              </ActionForm>
            </Card>
          );
        })}
      </section>

      <section id="socials" className="scroll-mt-8">
        <Card title="Social links" description="Hidden on the site until set. Paste the company's own profile URLs.">
          <ActionForm action={saveSocials}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input idPrefix="so" name="linkedin" label="LinkedIn" defaultValue={settings.socials.linkedin ?? ""} placeholder="https://www.linkedin.com/company/…" />
              <Input idPrefix="so" name="x" label="X (Twitter)" defaultValue={settings.socials.x ?? ""} placeholder="https://x.com/…" />
              <Input idPrefix="so" name="facebook" label="Facebook" defaultValue={settings.socials.facebook ?? ""} />
              <Input idPrefix="so" name="instagram" label="Instagram" defaultValue={settings.socials.instagram ?? ""} />
            </div>
          </ActionForm>
        </Card>
      </section>

      <section id="certifications" className="scroll-mt-8">
        <Card title="Certifications & registrations" description="Shown on the About page. Unconfirmed entries are hidden in Hide mode.">
          <div className="space-y-4">
            {((certs.data ?? []) as Array<Record<string, unknown>>).map((c) => {
              const p = `cert-${String(c.slug)}`;
              return (
                <div key={String(c.slug)} className="rounded-lg border border-line p-4">
                  <ActionForm action={saveCertification.bind(null, String(c.slug))}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input idPrefix={p} name="name" label="Name" defaultValue={String(c.name)} />
                      <Input idPrefix={p} name="issuer" label="Issuer" defaultValue={String(c.issuer)} />
                      <Input idPrefix={p} name="reference" label="Certificate / registration number" defaultValue={String(c.reference)} />
                      <Input idPrefix={p} name="valid_until" label="Valid until" type="date" defaultValue={String(c.valid_until ?? "")} />
                      <Input idPrefix={p} name="document_url" label="Document link (internal)" defaultValue={String(c.document_url ?? "")} className="md:col-span-2" />
                      <Checkbox idPrefix={p} name="confirmed" label="Verified" defaultChecked={Boolean(c.confirmed)} />
                    </div>
                  </ActionForm>
                  <div className="mt-3">
                    <ActionForm action={deleteRow.bind(null, "certifications", String(c.slug))} submitLabel="Delete" danger compact confirm="Delete this certification?">
                      {null}
                    </ActionForm>
                  </div>
                </div>
              );
            })}
            <details className="rounded-lg border border-dashed border-line p-4">
              <summary className="cursor-pointer text-sm font-semibold">Add a certification</summary>
              <div className="mt-4">
                <ActionForm action={saveCertification.bind(null, null)} submitLabel="Add" resetOnSuccess>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input idPrefix="cert-new" name="name" label="Name" required />
                    <Input idPrefix="cert-new" name="issuer" label="Issuer" />
                    <Input idPrefix="cert-new" name="reference" label="Number" />
                    <Input idPrefix="cert-new" name="valid_until" label="Valid until" type="date" />
                    <Checkbox idPrefix="cert-new" name="confirmed" label="Verified" />
                  </div>
                </ActionForm>
              </div>
            </details>
          </div>
        </Card>
      </section>

      <section id="leaders" className="scroll-mt-8">
        <Card title="Leadership" description="Use real names and photos only with each person's permission. Unconfirmed entries are hidden in Hide mode.">
          <div className="space-y-4">
            {((leaders.data ?? []) as Array<Record<string, unknown>>).map((l) => {
              const p = `leader-${String(l.slug)}`;
              return (
                <div key={String(l.slug)} className="rounded-lg border border-line p-4">
                  <ActionForm action={saveLeader.bind(null, String(l.slug))}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input idPrefix={p} name="name" label="Name" defaultValue={String(l.name)} />
                      <Input idPrefix={p} name="role" label="Role" defaultValue={String(l.role)} />
                      <Textarea idPrefix={p} name="bio" label="Short bio" rows={2} defaultValue={String(l.bio)} className="md:col-span-2" />
                      <Input idPrefix={p} name="photo_url" label="Photo URL (Cloudinary)" defaultValue={String(l.photo_url ?? "")} />
                      <Input idPrefix={p} name="sort_order" label="Order" type="number" defaultValue={Number(l.sort_order)} />
                      <Checkbox idPrefix={p} name="confirmed" label="Confirmed (show on site)" defaultChecked={Boolean(l.confirmed)} />
                    </div>
                  </ActionForm>
                  <div className="mt-3">
                    <ActionForm action={deleteRow.bind(null, "leaders", String(l.slug))} submitLabel="Delete" danger compact confirm="Delete this person?">
                      {null}
                    </ActionForm>
                  </div>
                </div>
              );
            })}
            <details className="rounded-lg border border-dashed border-line p-4">
              <summary className="cursor-pointer text-sm font-semibold">Add a person</summary>
              <div className="mt-4">
                <ActionForm action={saveLeader.bind(null, null)} submitLabel="Add" resetOnSuccess>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input idPrefix="leader-new" name="name" label="Name" required />
                    <Input idPrefix="leader-new" name="role" label="Role" />
                    <Textarea idPrefix="leader-new" name="bio" label="Short bio" rows={2} className="md:col-span-2" />
                    <Input idPrefix="leader-new" name="photo_url" label="Photo URL" />
                    <Input idPrefix="leader-new" name="sort_order" label="Order" type="number" defaultValue={10} />
                    <Checkbox idPrefix="leader-new" name="confirmed" label="Confirmed" />
                  </div>
                </ActionForm>
              </div>
            </details>
          </div>
        </Card>
      </section>
    </div>
  );
}
