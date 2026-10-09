"use client";

import { submitPartner } from "@/app/actions/forms";
import { SimpleForm } from "./simple-form";
import { CheckboxGroup, CountryField, SelectField, TextArea, TextField } from "./fields";
import { partnerSchema, partnerTypes } from "@/lib/forms/schemas";

const ID = "partner";

const initial = {
  partnerType: "",
  company: "",
  name: "",
  email: "",
  phone: "",
  countryCode: "",
  companyUrl: "",
  categories: [] as string[],
  certifications: "",
  message: "",
  consent: false,
};

const labels: Record<string, string> = {
  partnerType: "Partnership type",
  company: "Company",
  name: "Contact name",
  email: "Email",
  phone: "Phone",
  countryCode: "Country",
  companyUrl: "Website",
  categories: "Categories",
  certifications: "Certifications",
  message: "Message",
  consent: "Privacy consent",
};

export function PartnerForm({ categories }: { categories: Array<{ slug: string; name: string }> }) {
  return (
    <SimpleForm idPrefix={ID} initial={initial} schema={partnerSchema} action={submitPartner} labels={labels} submitLabel="Send application" successTitle="Application received.">
      {({ state, set, error }) => (
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            idPrefix={ID}
            name="partnerType"
            label="How would you like to work with us?"
            required
            value={state.partnerType}
            onChange={set("partnerType")}
            options={partnerTypes.map((t) => ({ value: t, label: t }))}
            error={error("partnerType")}
            className="md:col-span-2"
          />
          <TextField idPrefix={ID} name="company" label="Company name" required value={state.company} onChange={set("company")} autoComplete="organization" error={error("company")} />
          <CountryField idPrefix={ID} name="countryCode" label="Country" required value={state.countryCode} onChange={set("countryCode")} error={error("countryCode")} />
          <TextField idPrefix={ID} name="name" label="Contact name" required value={state.name} onChange={set("name")} autoComplete="name" error={error("name")} />
          <TextField idPrefix={ID} name="email" label="Email" type="email" inputMode="email" required value={state.email} onChange={set("email")} autoComplete="email" error={error("email")} />
          <TextField idPrefix={ID} name="phone" label="Phone / WhatsApp" type="tel" inputMode="tel" value={state.phone} onChange={set("phone")} autoComplete="tel" error={error("phone")} />
          <TextField idPrefix={ID} name="companyUrl" label="Website" type="url" inputMode="url" value={state.companyUrl} onChange={set("companyUrl")} placeholder="www.example.com" error={error("companyUrl")} />
          <CheckboxGroup
            idPrefix={ID}
            name="categories"
            label="Categories you supply or serve"
            required
            values={state.categories}
            onChange={set("categories")}
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            error={error("categories")}
            className="md:col-span-2"
          />
          <TextArea
            idPrefix={ID}
            name="certifications"
            label="Certifications"
            rows={3}
            maxLength={1000}
            hint="e.g. ISO 9001, CE, SONCAP, NAFDAC, export licence."
            value={state.certifications}
            onChange={set("certifications")}
            error={error("certifications")}
            className="md:col-span-2"
          />
          <TextArea idPrefix={ID} name="message" label="Tell us about your company" rows={5} maxLength={4000} value={state.message} onChange={set("message")} error={error("message")} className="md:col-span-2" />
        </div>
      )}
    </SimpleForm>
  );
}
