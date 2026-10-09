"use client";

import { submitContact } from "@/app/actions/forms";
import { SimpleForm } from "./simple-form";
import { CountryField, SelectField, TextArea, TextField } from "./fields";
import { contactSchema, contactSubjects } from "@/lib/forms/schemas";

const ID = "contact";

const initial = {
  name: "",
  email: "",
  phone: "",
  company: "",
  countryCode: "",
  office: "any",
  subject: "",
  message: "",
  consent: false,
};

const labels: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  countryCode: "Country",
  office: "Office",
  subject: "Subject",
  message: "Message",
  consent: "Privacy consent",
};

export function ContactForm({ offices }: { offices: Array<{ slug: string; label: string }> }) {
  return (
    <SimpleForm idPrefix={ID} initial={initial} schema={contactSchema} action={submitContact} labels={labels} submitLabel="Send message" successTitle="Message sent.">
      {({ state, set, error }) => (
        <div className="grid gap-6 md:grid-cols-2">
          <TextField idPrefix={ID} name="name" label="Your name" required value={state.name} onChange={set("name")} autoComplete="name" error={error("name")} />
          <TextField idPrefix={ID} name="email" label="Email" type="email" inputMode="email" required value={state.email} onChange={set("email")} autoComplete="email" error={error("email")} />
          <TextField idPrefix={ID} name="phone" label="Phone / WhatsApp" type="tel" inputMode="tel" value={state.phone} onChange={set("phone")} autoComplete="tel" error={error("phone")} />
          <TextField idPrefix={ID} name="company" label="Company" value={state.company} onChange={set("company")} autoComplete="organization" error={error("company")} />
          <CountryField idPrefix={ID} name="countryCode" label="Country" value={state.countryCode} onChange={set("countryCode")} error={error("countryCode")} />
          <SelectField
            idPrefix={ID}
            name="office"
            label="Which office?"
            required
            value={state.office}
            onChange={set("office")}
            placeholder="Choose…"
            options={[{ value: "any", label: "Whichever is best" }, ...offices.map((o) => ({ value: o.slug, label: o.label }))]}
            error={error("office")}
          />
          <SelectField
            idPrefix={ID}
            name="subject"
            label="Subject"
            required
            value={state.subject}
            onChange={set("subject")}
            options={contactSubjects.map((s) => ({ value: s, label: s }))}
            error={error("subject")}
            className="md:col-span-2"
          />
          <TextArea idPrefix={ID} name="message" label="Message" required rows={6} maxLength={4000} value={state.message} onChange={set("message")} error={error("message")} className="md:col-span-2" />
        </div>
      )}
    </SimpleForm>
  );
}
