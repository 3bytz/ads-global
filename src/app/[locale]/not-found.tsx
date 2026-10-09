import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <PageHero eyebrow="Error 404" line1="Off the shipping lane." line2="Page not found." size="page">
      <p className="measure text-lead text-white/85">
        The page you were looking for has moved or doesn&apos;t exist. Try one of these instead.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/products" variant="outline-light">
          Products & services
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline-light">
          Contact us
        </ButtonLink>
      </div>
    </PageHero>
  );
}
