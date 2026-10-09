import { ButtonLink } from "@/components/ui/button-link";
import { RouteLines } from "./route-lines";

/** Closing call-to-action band on a light tint with route line art. */
export function CtaBand({
  title1 = "Tell us what you need.",
  title2 = "We'll find it and ship it.",
  text = "Send a request for quotation with your product, quantity and destination. We reply with options on your preferred Incoterm.",
}: {
  title1?: string;
  title2?: string;
  text?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-tint section-pad">
      <RouteLines />
      <div className="wrap relative grid items-end gap-10 lg:grid-cols-12">
        <h2 id="cta-title" className="headline text-h1 lg:col-span-8">
          <span className="block">{title1}</span>
          <span className="block text-brand">{title2}</span>
        </h2>
        <div className="lg:col-span-4">
          <p className="text-lead text-muted">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/request-a-quote">Request a quote</ButtonLink>
            <ButtonLink href="/contact" variant="outline-dark">
              Talk to us
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
