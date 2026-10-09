/**
 * Trade reference content (general industry knowledge, not company claims).
 * Incoterms® is a trademark of the International Chamber of Commerce; summaries follow Incoterms 2020.
 */
import type { Incoterm } from "./types";

export const incotermInfo: Record<Incoterm, { name: string; summary: string; mode: "Any mode" | "Sea & inland waterway" }> = {
  EXW: { name: "Ex Works", summary: "Buyer collects at the supplier's premises and carries all costs and risk from there.", mode: "Any mode" },
  FCA: { name: "Free Carrier", summary: "Seller clears for export and hands goods to the buyer's carrier at a named place.", mode: "Any mode" },
  FOB: { name: "Free On Board", summary: "Seller loads goods on board at the port of shipment; risk passes once on board.", mode: "Sea & inland waterway" },
  CFR: { name: "Cost and Freight", summary: "Seller pays sea freight to the destination port; risk passes when goods are on board.", mode: "Sea & inland waterway" },
  CIF: { name: "Cost, Insurance and Freight", summary: "As CFR, plus the seller buys minimum cargo insurance to the destination port.", mode: "Sea & inland waterway" },
  CPT: { name: "Carriage Paid To", summary: "Seller pays carriage to a named destination; risk passes at the first carrier.", mode: "Any mode" },
  CIP: { name: "Carriage and Insurance Paid To", summary: "As CPT, plus the seller buys all-risks cargo insurance.", mode: "Any mode" },
  DAP: { name: "Delivered At Place", summary: "Seller delivers to a named place, ready for unloading; buyer handles import clearance and duties.", mode: "Any mode" },
  DPU: { name: "Delivered at Place Unloaded", summary: "Seller delivers and unloads at a named place; buyer handles import clearance.", mode: "Any mode" },
  DDP: { name: "Delivered Duty Paid", summary: "Seller delivers to your door with import duties and taxes paid.", mode: "Any mode" },
};

/** Incoterms offered on the RFQ form (plus "Not sure"). */
export const rfqIncoterms: Incoterm[] = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];

export const shippingModes = [
  {
    key: "fcl",
    title: "Sea freight — FCL",
    text: "A full container for your cargo alone. Best value per unit for larger orders, sealed at the factory and opened at destination.",
    specs: ["20ft, 40ft and 40ft High Cube", "Factory loading supervision", "Typical China → Lagos transit: about 30–45 days port to port"],
  },
  {
    key: "lcl",
    title: "Sea freight — LCL",
    text: "Share container space and pay for the cubic metres you use. Suited to trial orders and mixed small consignments.",
    specs: ["Consolidation at origin warehouse", "Priced per CBM / weight", "Longer handling time than FCL"],
  },
  {
    key: "air",
    title: "Air freight",
    text: "For samples, urgent spares and high-value, low-volume goods.",
    specs: ["Typically 5–10 days door to door", "Charged on chargeable (volumetric) weight", "Dangerous goods need special handling"],
  },
  {
    key: "road",
    title: "Road & inland",
    text: "Trucking from the factory to the export port, and from the destination port to your warehouse or site.",
    specs: ["Container haulage and break-bulk", "Final-mile delivery where available", "Tracking updates along the way"],
  },
] as const;

/** Typical ISO container internal dimensions (approximate — vary by container and line). */
export const containerSpecs = [
  { size: "20ft standard", internal: "5.90 × 2.35 × 2.39 m", volume: "≈ 33 m³", payload: "≈ 25–28 t" },
  { size: "40ft standard", internal: "12.03 × 2.35 × 2.39 m", volume: "≈ 67 m³", payload: "≈ 26–28 t" },
  { size: "40ft High Cube (40HC)", internal: "12.03 × 2.35 × 2.69 m", volume: "≈ 76 m³", payload: "≈ 26–28 t" },
] as const;

export const portsChina = ["Dalian", "Yingkou", "Tianjin", "Qingdao", "Shanghai", "Ningbo-Zhoushan", "Shenzhen (Yantian/Shekou)", "Guangzhou (Nansha)"];
export const portsWestAfrica = ["Lagos — Apapa", "Lagos — Tin Can Island", "Lekki Deep Sea Port", "Onne / Port Harcourt", "Tema (Ghana)", "Cotonou (Benin)", "Lomé (Togo)", "Abidjan (Côte d'Ivoire)"];

export const complianceItems = [
  { title: "Export documents (China)", text: "Commercial invoice, packing list, export customs declaration, bill of lading or air waybill, and certificate of origin." },
  { title: "Nigeria import requirements", text: "Form M through an authorised dealer bank, PAAR from Nigeria Customs, and product certification where required — SONCAP for regulated goods, NAFDAC registration for food, cosmetics and chemicals." },
  { title: "Product standards", text: "We check voltage, plug type, labelling language and any certification the destination market requires before goods are produced." },
  { title: "Dangerous goods", text: "Chemicals and batteries need safety data sheets, UN classification and approved packaging. We flag this at quotation stage." },
] as const;

export const quantityUnits = [
  "pieces",
  "units",
  "sets",
  "cartons",
  "kg",
  "tonnes",
  "litres",
  "m²",
  "20ft containers",
  "40ft containers",
  "40HC containers",
] as const;

export const timelines = ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Flexible / planning"] as const;
export const currencies = ["USD", "CNY", "NGN", "EUR"] as const;
