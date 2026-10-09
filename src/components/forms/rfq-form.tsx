"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type FormEvent } from "react";
import { Check, CircleCheckBig, Pencil } from "lucide-react";
import { submitRfq } from "@/app/actions/forms";
import {
  CheckboxGroup,
  ConsentField,
  CountryField,
  ErrorSummary,
  Honeypot,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
} from "./fields";
import { AttachmentUploader } from "./attachment-uploader";
import { Turnstile } from "./turnstile";
import { clearDraft, draftExistedAtLoad, noopSubscribe, readDraft, writeDraft } from "./draft-store";
import { rfqSchema, rfqStep1, rfqStep2, rfqStep3, rfqStep4, toFieldErrors, type AttachmentInput, type FieldErrors } from "@/lib/forms/schemas";
import { currencies, incotermInfo, quantityUnits, rfqIncoterms, timelines } from "@/content/trade";
import { countryName } from "@/lib/countries";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "ads-rfq-draft-v1";
const ID = "rfq";

interface RfqState {
  company: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  categories: string[];
  productDetails: string;
  quantity: string;
  unit: string;
  targetPrice: string;
  currency: string;
  incoterm: string;
  destinationCountry: string;
  destinationPort: string;
  timeline: string;
  notes: string;
  attachments: AttachmentInput[];
  consent: boolean;
}

const empty: RfqState = {
  company: "",
  name: "",
  email: "",
  phone: "",
  countryCode: "",
  categories: [],
  productDetails: "",
  quantity: "",
  unit: "",
  targetPrice: "",
  currency: "USD",
  incoterm: "",
  destinationCountry: "",
  destinationPort: "",
  timeline: "",
  notes: "",
  attachments: [],
  consent: false,
};

const labels: Record<string, string> = {
  company: "Company",
  name: "Your name",
  email: "Email",
  phone: "Phone",
  countryCode: "Your country",
  categories: "Categories",
  productDetails: "Product details",
  quantity: "Quantity",
  unit: "Unit",
  targetPrice: "Target price",
  currency: "Currency",
  incoterm: "Incoterm",
  destinationCountry: "Destination country",
  destinationPort: "Destination port or city",
  timeline: "Timeline",
  notes: "Notes",
  attachments: "Attachments",
  consent: "Privacy consent",
};

const steps = [
  { title: "Company & contact", fields: ["company", "name", "email", "phone", "countryCode"] },
  { title: "Products", fields: ["categories", "productDetails", "quantity", "unit", "targetPrice", "currency"] },
  { title: "Shipping", fields: ["incoterm", "destinationCountry", "destinationPort", "timeline"] },
  { title: "Files & notes", fields: ["notes", "attachments"] },
  { title: "Review & send", fields: ["consent"] },
] as const;

function validateStep(index: number, s: RfqState): FieldErrors {
  const schema = [rfqStep1, rfqStep2, rfqStep3, rfqStep4.pick({ notes: true, attachments: true })][index];
  if (!schema) return {};
  const r = schema.safeParse(s);
  return r.success ? {} : toFieldErrors(r.error);
}

export function RfqForm({ categories, initialCategory }: { categories: Array<{ slug: string; name: string }>; initialCategory?: string }) {
  const [state, setState] = useState<RfqState>(() => ({
    ...empty,
    categories: initialCategory && categories.some((c) => c.slug === initialCategory) ? [initialCategory] : [],
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | undefined>();
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [honeypot, setHoneypot] = useState("");
  const [reference, setReference] = useState<string | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();
  const [draftDecided, setDraftDecided] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Server snapshot is false, so the restore banner only appears after hydration.
  const draftExisted = useSyncExternalStore(noopSubscribe, () => draftExistedAtLoad(DRAFT_KEY), () => false);
  const showRestore = draftExisted && !draftDecided && reference === undefined;

  // Autosave (not while a previous draft is waiting for a restore/discard decision).
  useEffect(() => {
    if (reference !== undefined) return;
    if (draftExisted && !draftDecided) return;
    const t = setTimeout(() => writeDraft(DRAFT_KEY, { ...state, consent: false, step }), 400);
    return () => clearTimeout(t);
  }, [state, step, draftExisted, draftDecided, reference]);

  // Move focus to the step heading when the step changes (screen readers announce it).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (Object.keys(errors).length || formMessage) summaryRef.current?.focus();
  }, [errors, formMessage]);

  useEffect(() => {
    if (reference !== undefined) successRef.current?.focus();
  }, [reference]);

  const set = <K extends keyof RfqState>(key: K) => (value: RfqState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key as string]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== key)));
  };

  function restore() {
    const draft = readDraft<RfqState & { step?: number }>(DRAFT_KEY);
    if (draft) {
      const { step: savedStep, ...rest } = draft;
      setState({ ...empty, ...rest, consent: false, attachments: Array.isArray(rest.attachments) ? rest.attachments : [] });
      setStep(Math.min(Math.max(Number(savedStep ?? 0), 0), steps.length - 1));
    }
    setDraftDecided(true);
  }

  function discard() {
    clearDraft(DRAFT_KEY);
    setDraftDecided(true);
  }

  function next() {
    const e = validateStep(step, state);
    setFormMessage(undefined);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setErrors({});
    setFormMessage(undefined);
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < steps.length - 1) {
      next();
      return;
    }
    const parsed = rfqSchema.safeParse(state);
    if (!parsed.success) {
      const fe = toFieldErrors(parsed.error);
      const firstStep = steps.findIndex((st) => st.fields.some((f) => fe[f]));
      if (firstStep >= 0 && firstStep !== step) setStep(firstStep);
      setErrors(fe);
      return;
    }
    startTransition(async () => {
      const res = await submitRfq(state, {
        turnstileToken: token,
        website: honeypot,
        sourcePath: window.location.pathname,
      });
      if (res.ok) {
        clearDraft(DRAFT_KEY);
        setReference(res.reference);
        return;
      }
      setResetKey((k) => k + 1);
      const fe = res.fieldErrors ?? {};
      const firstStep = steps.findIndex((st) => st.fields.some((f) => fe[f]));
      if (firstStep >= 0) setStep(firstStep);
      setErrors(fe);
      setFormMessage(res.message);
    });
  }

  if (reference !== undefined) {
    return (
      <div ref={successRef} tabIndex={-1} className="rounded-signature bg-ink p-10 text-white outline-none lg:p-14" role="status">
        <CircleCheckBig className="size-12 text-accent" aria-hidden="true" />
        <h2 className="headline mt-6 text-h3">Request received.</h2>
        {reference && (
          <p className="mt-4 text-lead">
            Your reference: <strong className="headline text-4xl text-accent">{reference}</strong>
          </p>
        )}
        <p className="mt-4 measure text-muted-on-dark">
          We&apos;ve emailed you a copy. The office handling your destination will review it and reply by email — please quote your reference in any follow-up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-ink">
            Back to products
          </Link>
          <button
            type="button"
            onClick={() => {
              setState(empty);
              setStep(0);
              setReference(undefined);
              setDraftDecided(true);
            }}
            className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 font-semibold"
          >
            Send another request
          </button>
        </div>
      </div>
    );
  }

  const current = steps[step]!;
  const fe = (k: string) => errors[k];
  const catOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <form onSubmit={onSubmit} noValidate className="relative">
      {showRestore && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-brand/30 bg-tint p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">You have an unfinished request saved on this device.</p>
          <div className="flex gap-2">
            <button type="button" onClick={restore} className="min-h-11 rounded-full bg-ink px-5 font-semibold text-white">
              Restore draft
            </button>
            <button type="button" onClick={discard} className="min-h-11 rounded-full border border-line bg-white px-5 font-semibold">
              Start fresh
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <nav aria-label="Form progress">
        <p className="text-sm font-semibold text-muted">
          Step {step + 1} of {steps.length}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tint" aria-hidden="true">
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <ol className="mt-4 hidden gap-2 md:flex">
          {steps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined} className="flex-1">
              <span
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  i === step ? "text-ink" : i < step ? "text-brand" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                    i < step ? "bg-brand text-white" : i === step ? "bg-accent text-ink" : "bg-tint text-muted",
                  )}
                >
                  {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                </span>
                {s.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <h2 ref={headingRef} tabIndex={-1} className="headline mt-10 text-h3 outline-none">
        {current.title}
      </h2>

      <div className="mt-6">
        <ErrorSummary ref={summaryRef} idPrefix={ID} errors={errors} labels={labels} message={formMessage} />
      </div>

      <Honeypot value={honeypot} onChange={setHoneypot} />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {step === 0 && (
          <>
            <TextField idPrefix={ID} name="company" label="Company name" required value={state.company} onChange={set("company")} autoComplete="organization" error={fe("company")} className="md:col-span-2" />
            <TextField idPrefix={ID} name="name" label="Your name" required value={state.name} onChange={set("name")} autoComplete="name" error={fe("name")} />
            <TextField idPrefix={ID} name="email" label="Work email" type="email" inputMode="email" required value={state.email} onChange={set("email")} autoComplete="email" error={fe("email")} />
            <TextField
              idPrefix={ID}
              name="phone"
              label="Phone / WhatsApp"
              type="tel"
              inputMode="tel"
              value={state.phone}
              onChange={set("phone")}
              autoComplete="tel"
              hint="Include the country code, e.g. +234 or +86."
              error={fe("phone")}
            />
            <CountryField idPrefix={ID} name="countryCode" label="Your country" required value={state.countryCode} onChange={set("countryCode")} error={fe("countryCode")} />
          </>
        )}

        {step === 1 && (
          <>
            <CheckboxGroup
              idPrefix={ID}
              name="categories"
              label="Product categories"
              required
              hint="Choose one or more."
              values={state.categories}
              onChange={set("categories")}
              options={catOptions}
              error={fe("categories")}
              className="md:col-span-2"
            />
            <TextArea
              idPrefix={ID}
              name="productDetails"
              label="Product details"
              required
              rows={6}
              maxLength={4000}
              hint="Specifications, materials, sizes, brands you'd accept, packaging, certifications needed…"
              value={state.productDetails}
              onChange={set("productDetails")}
              error={fe("productDetails")}
              className="md:col-span-2"
            />
            <TextField idPrefix={ID} name="quantity" label="Quantity" type="number" inputMode="decimal" min={0} step="any" required value={state.quantity} onChange={set("quantity")} error={fe("quantity")} />
            <SelectField idPrefix={ID} name="unit" label="Unit" required value={state.unit} onChange={set("unit")} options={quantityUnits.map((u) => ({ value: u, label: u }))} error={fe("unit")} />
            <TextField
              idPrefix={ID}
              name="targetPrice"
              label="Target price per unit"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={state.targetPrice}
              onChange={set("targetPrice")}
              hint="Helps us shortlist the right suppliers."
              error={fe("targetPrice")}
            />
            <SelectField idPrefix={ID} name="currency" label="Currency" required value={state.currency} onChange={set("currency")} options={currencies.map((c) => ({ value: c, label: c }))} error={fe("currency")} />
          </>
        )}

        {step === 2 && (
          <>
            <SelectField
              idPrefix={ID}
              name="incoterm"
              label="Preferred Incoterm"
              required
              value={state.incoterm}
              onChange={set("incoterm")}
              options={[...rfqIncoterms.map((t) => ({ value: t, label: `${t} — ${incotermInfo[t].name}` })), { value: "NOT_SURE", label: "Not sure — please advise" }]}
              hint="Who pays freight, insurance and duties. Not sure? We'll recommend one."
              error={fe("incoterm")}
              className="md:col-span-2"
            />
            <CountryField
              idPrefix={ID}
              name="destinationCountry"
              label="Destination country"
              required
              value={state.destinationCountry}
              onChange={set("destinationCountry")}
              hint="We route your request to the office that handles this country."
              error={fe("destinationCountry")}
            />
            <TextField idPrefix={ID} name="destinationPort" label="Destination port or city" required value={state.destinationPort} onChange={set("destinationPort")} placeholder="e.g. Lagos Apapa, Onne, Abuja" error={fe("destinationPort")} />
            <SelectField idPrefix={ID} name="timeline" label="When do you need it?" required value={state.timeline} onChange={set("timeline")} options={timelines.map((t) => ({ value: t, label: t }))} error={fe("timeline")} />
          </>
        )}

        {step === 3 && (
          <>
            <div className="md:col-span-2">
              <AttachmentUploader idPrefix={ID} files={state.attachments} onChange={set("attachments")} error={fe("attachments")} />
            </div>
            <TextArea
              idPrefix={ID}
              name="notes"
              label="Anything else we should know?"
              rows={4}
              maxLength={4000}
              value={state.notes}
              onChange={set("notes")}
              error={fe("notes")}
              className="md:col-span-2"
            />
          </>
        )}

        {step === 4 && (
          <div className="space-y-8 md:col-span-2">
            <dl className="divide-y divide-line rounded-2xl border border-line">
              {[
                { step: 0, rows: [["Company", state.company], ["Contact", `${state.name} · ${state.email}${state.phone ? ` · ${state.phone}` : ""}`], ["Country", countryName(state.countryCode)]] },
                {
                  step: 1,
                  rows: [
                    ["Categories", state.categories.map((s) => categories.find((c) => c.slug === s)?.name ?? s).join(", ")],
                    ["Product details", state.productDetails],
                    ["Quantity", `${state.quantity} ${state.unit}`],
                    ["Target price", state.targetPrice ? `${state.currency} ${state.targetPrice}` : "—"],
                  ],
                },
                {
                  step: 2,
                  rows: [
                    ["Incoterm", state.incoterm === "NOT_SURE" ? "Not sure — please advise" : state.incoterm],
                    ["Destination", `${state.destinationPort}, ${countryName(state.destinationCountry)}`],
                    ["Timeline", state.timeline],
                  ],
                },
                { step: 3, rows: [["Attachments", state.attachments.length ? state.attachments.map((a) => a.filename).join(", ") : "None"], ["Notes", state.notes || "—"]] },
              ].map((group) => (
                <div key={group.step} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid flex-1 gap-2">
                    {group.rows.map(([k, v]) => (
                      <div key={k} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                        <dt className="text-sm font-semibold text-muted">{k}</dt>
                        <dd className="whitespace-pre-wrap break-words">{v}</dd>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep(group.step)} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand underline-offset-4 hover:underline">
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit<span className="sr-only"> {steps[group.step]?.title}</span>
                  </button>
                </div>
              ))}
            </dl>
            <ConsentField idPrefix={ID} checked={state.consent} onChange={set("consent")} error={fe("consent")} />
            <Turnstile onToken={setToken} resetKey={resetKey} />
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        {step > 0 ? (
          <button type="button" onClick={back} className="min-h-12 rounded-full border border-line px-6 font-semibold hover:border-ink">
            ← Back
          </button>
        ) : (
          <span className="text-sm text-muted">Your answers are saved on this device as you go.</span>
        )}
        {step < steps.length - 1 ? (
          <button type="submit" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-ink py-1.5 pl-6 pr-1.5 font-semibold text-white hover:bg-ink-2">
            Continue
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-accent text-ink">
              →
            </span>
          </button>
        ) : (
          <SubmitButton pending={pending}>Send request</SubmitButton>
        )}
      </div>
    </form>
  );
}
