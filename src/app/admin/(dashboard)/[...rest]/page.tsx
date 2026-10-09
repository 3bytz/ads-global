import { notFound } from "next/navigation";

/** Unknown /admin/* paths render the admin not-found page (signed-in staff only). */
export default function AdminCatchAll() {
  notFound();
}
