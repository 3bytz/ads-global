/**
 * Stock photography used until ADS supplies its own photos.
 *
 * Source: Pexels (https://www.pexels.com/license/) — free for commercial use,
 * no attribution required (credited here anyway). Every slot shows a
 * "Replace with company photo" note in the admin.
 *
 * Before launch, open each `source` page and check: (1) no visible third-party
 * brand logos (shipping lines, product brands, car makers); (2) no person who
 * could be mistaken for ADS staff. Photographer names are on each source page
 * (the build environment couldn't load Pexels pages to copy them).
 *
 * Keep this file free of runtime imports so the seed generator can run it with plain Node.
 */

export interface StockImage {
  key: string;
  /** Pexels photo id */
  id: number;
  source: string;
  photographer: string;
  alt: string;
  /** Slot where it's used */
  slot: string;
}

/** images.pexels.com URL, pre-sized so the Next.js optimiser never fetches a 6000px original. */
export function pexelsUrl(id: number, width = 2400): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

const p = (key: string, id: number, slug: string, alt: string, slot: string): StockImage => ({
  key,
  id,
  source: `https://www.pexels.com/photo/${slug}-${id}/`,
  photographer: "See source page (Pexels)",
  alt,
  slot,
});

export const stockImages = {
  hero: p("hero", 5221699, "cranes-in-the-harbour-during-night-time", "Gantry cranes over a container terminal in the harbour at night", "Home hero"),
  warehouse: p("warehouse", 10697106, "interior-of-warehouse", "Long warehouse aisle with high racking stacked with goods", "Who we are (pair, large)"),
  meeting: p("meeting", 5668512, "multiethnic-businesspeople-having-deal-in-office", "Business partners shaking hands across a meeting table", "Who we are (pair, small)"),
  stepEnquiry: p("stepEnquiry", 8428059, "businessmen-having-a-deal-while-doing-handshake", "Two business people agreeing a deal with a handshake", "Process: enquiry"),
  stepSourcing: p("stepSourcing", 31047132, "dedicated-textile-factory-workers-in-action", "Factory floor with workers at production stations", "Process: sourcing"),
  stepInspection: p("stepInspection", 7937365, "engineer-in-helmet", "Inspector in a safety helmet checking goods", "Process: quality inspection"),
  stepShipping: p("stepShipping", 16053939, "men-loading-cargo-into-a-container-in-a-port", "Workers loading cargo into a shipping container at a port", "Process: shipping & customs"),
  stepPaperwork: p("stepPaperwork", 5387258, "person-signing-a-contract", "Person signing shipping documents at a desk", "How we work: customs & compliance"),
  stepDelivery: p("stepDelivery", 14005602, "truck-traveling-a-highway", "Cargo truck travelling on a highway", "Process: delivery"),
  port: p("port", 29822711, "large-cargo-ship-at-shipping-port-with-cranes", "Large cargo ship berthed under port cranes", "How we work hero / scroll image"),
  terminal: p("terminal", 28438334, "container-terminal-with-straddle-carriers", "Container terminal with straddle carriers moving boxes", "Import & export category"),
  lagos: p("lagos", 32656347, "aerial-view-of-lagos-cityscape-with-ocean-horizon", "Aerial view of the Lagos skyline with the Atlantic on the horizon", "Offices band: Lagos"),
  abuja: p("abuja", 31775644, "aso-rock-and-urban-roadway-in-abuja-nigeria", "Aso Rock rising behind a city roadway in Abuja", "Offices: Abuja"),
  kano: p("kano", 31603813, "traditional-architecture-of-gidan-dan-hausa-kano", "Traditional Hausa architecture of Gidan Dan Hausa in Kano", "Offices: Kano"),
  shenyang: p("shenyang", 16730527, "entrance-of-shenyang-imperial-palace", "Entrance gate of the Shenyang Imperial Palace", "Offices band: Shenyang"),
  catFood: p("catFood", 33975355, "colorful-fresh-produce-display-at-grocery-store", "Colourful fresh produce on display in a grocery store", "Category: Food & Beverages"),
  catOffice: p("catOffice", 7718714, "a-flatlay-of-office-supplies", "Flat lay of office stationery: notebooks, pens and clips", "Category: Office Supplies"),
  catApparel: p("catApparel", 3812433, "clothes-on-hangers-hanging-on-clothing-racks", "Garments on hangers along clothing racks", "Category: Apparel & Fashion"),
  catElectronics: p("catElectronics", 1010485, "green-circuit-board", "Close-up of a green electronic circuit board", "Category: Technology & Electronics"),
  catMachinery: p("catMachinery", 12951623, "dirty-industrial-machinery", "Heavy industrial machinery in a plant", "Category: Machinery & Equipment"),
  catBuilding: p("catBuilding", 31763543, "stack-of-roof-tiles-on-a-pallet-outdoors", "Roof tiles stacked on a pallet at a building site", "Category: Building Materials"),
  catChemicals: p("catChemicals", 1146627, "clear-laboratory-glassware", "Clear laboratory glassware on a bench", "Category: Specialty Chemicals"),
  catTransport: p("catTransport", 2348359, "parked-trucks-under-clouds", "Row of parked trucks under a cloudy sky", "Category: Transportation Equipment"),
  catJewelry: p("catJewelry", 20858959, "display-of-jewelry", "Jewellery arranged in a display case", "Category: Jewelry & Accessories"),
  catAppliances: p("catAppliances", 5825422, "kitchen-with-modern-appliances", "Kitchen fitted with modern home appliances", "Category: Home Appliances"),
  catFmcg: p("catFmcg", 1366594, "shelves-with-products-in-market", "Store shelves stocked with household products", "Category: Daily-use Goods (FMCG)"),
  catConsulting: p("catConsulting", 8145328, "persons-using-laptops-on-table-with-charts", "Team reviewing charts and data on laptops", "Category: Information Consulting"),
  catAutomobiles: p("catAutomobiles", 29566904, "line-of-modern-electric-cars-in-parking-lot", "Line of new electric cars in a parking lot", "Category: Automobiles"),
} satisfies Record<string, StockImage>;

export type StockImageKey = keyof typeof stockImages;

export const imageCredits: StockImage[] = Object.values(stockImages);
