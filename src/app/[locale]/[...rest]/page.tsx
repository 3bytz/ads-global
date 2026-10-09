import { notFound } from "next/navigation";

/** Unknown paths render the localized, fully-styled not-found page. */
export default function CatchAll() {
  notFound();
}
