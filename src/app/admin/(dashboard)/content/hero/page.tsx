import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/action-form";
import { Input, Textarea } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { AdminHeader, Card, StockPhotoNote } from "@/components/admin/ui";
import { saveHero } from "../../settings/actions";
import { requireStaff } from "@/lib/auth";
import { getSiteSettings } from "@/lib/content/queries";

export const metadata: Metadata = { title: "Home hero" };
export const dynamic = "force-dynamic";

export default async function HeroAdmin() {
  await requireStaff();
  const { hero } = await getSiteSettings();
  const isStock = Boolean(hero.imageUrl?.includes("images.pexels.com") || hero.imageUrl?.includes("images.unsplash.com"));

  return (
    <div className="space-y-8">
      <AdminHeader eyebrow="Content" title="Home hero" description="The first thing visitors see. Keep the headline short — it's displayed very large." />
      {isStock && <StockPhotoNote />}
      <Card>
        <ActionForm action={saveHero}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="eyebrow" label="Eyebrow (small line above)" defaultValue={hero.eyebrow} className="md:col-span-2" />
            <Input name="headlineLine1" label="Headline line 1 (navy/white)" required defaultValue={hero.headlineLine1} />
            <Input name="headlineLine2" label="Headline line 2 (orange)" defaultValue={hero.headlineLine2} />
            <Textarea name="subhead" label="Sub-headline" rows={3} defaultValue={hero.subhead} className="md:col-span-2" />
            <div className="md:col-span-2">
              <ImageField urlName="imageUrl" altName="imageAlt" label="Background photo (landscape, ≥ 2400 px wide)" defaultUrl={hero.imageUrl ?? ""} defaultAlt={hero.imageAlt} />
            </div>
            <Input
              name="videoUrl"
              label="Optional muted video loop (.mp4/.webm)"
              defaultValue={hero.videoUrl ?? ""}
              hint="Desktop only — never autoplays on phones, with reduced motion, or Data Saver. Keep it under ~4 MB."
              className="md:col-span-2"
            />
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
