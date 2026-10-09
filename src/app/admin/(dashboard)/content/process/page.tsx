import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { Input, Textarea } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { AdminHeader, Card } from "@/components/admin/ui";
import { saveProcessStep } from "../actions";
import { staffClient } from "@/lib/admin/server";

export const metadata: Metadata = { title: "How we work" };

export default async function ProcessAdmin() {
  const { supabase } = await staffClient();
  const { data } = await supabase.from("process_steps").select("*").order("sort_order");
  const steps = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Content"
        title="How we work"
        description="Lines containing “[CONFIRM” are shown with a marker in pre-launch mode and hidden once Claims mode is set to Hide."
      />
      {steps.map((s, i) => (
        <Card key={String(s.slug)} title={`Step ${i + 1}: ${String(s.title)}`}>
          <ActionForm action={saveProcessStep.bind(null, String(s.slug))}>
            <div className="grid gap-5 md:grid-cols-2">
              <Input idPrefix={String(s.slug)} name="title" label="Title" required defaultValue={String(s.title)} />
              <Input idPrefix={String(s.slug)} name="sort_order" label="Order" type="number" defaultValue={Number(s.sort_order)} />
              <Textarea idPrefix={String(s.slug)} name="description" label="Description" rows={2} defaultValue={String(s.description)} className="md:col-span-2" />
              <Textarea idPrefix={String(s.slug)} name="details" label="Details (one per line)" rows={4} defaultValue={((s.details as string[]) ?? []).join("\n")} className="md:col-span-2" />
              <div className="md:col-span-2">
                <ImageField urlName="image_url" altName="image_alt" label="Photo" defaultUrl={(s.image_url as string | null) ?? ""} defaultAlt={String(s.image_alt ?? "")} />
              </div>
            </div>
          </ActionForm>
        </Card>
      ))}
    </div>
  );
}
