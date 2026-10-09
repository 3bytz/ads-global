import { renderOg, ogSize } from "@/lib/og";

export const alt = "ADS Global Limited — Global Trade Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOg({
    eyebrow: "Global Trade Solutions",
    title: "Connect globally. Trade with confidence.",
    subtitle: "Import, export, sourcing, logistics and trade consulting — China and Nigeria.",
  });
}
