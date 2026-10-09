/**
 * Company content extracted from the previous site (src/data/*.ts, About.tsx,
 * Contact.tsx, Hero.tsx, Statistics.tsx). This file is:
 *   1. the input for `npm run seed:generate` → supabase/seed.sql
 *   2. the read-only fallback when Supabase isn't configured.
 * Once the database is seeded, edit content in the admin area, not here.
 *
 * Anything marked [CONFIRM] / `confirmed: false` is unverified. See docs/CLAIMS.md.
 *
 * NOTE: runtime imports must use explicit ".ts" paths and contain only plain
 * TypeScript, so Node can run the seed generator directly.
 */
import type {
  Category,
  Certification,
  Claim,
  Leader,
  Office,
  ProcessStep,
  Project,
  RoutingRule,
  SiteSettings,
  Stat,
  Strength,
} from "./types.ts";
import { pexelsUrl, stockImages, type StockImageKey } from "./image-credits.ts";

const ALL_GOODS_TERMS: Category["incoterms"] = ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];

export const defaultSettings: SiteSettings = {
  company: {
    name: "ADS Global",
    legalName: "ADS Global Limited",
    tagline: "Connect Globally, Trade with Confidence.",
    positioning: "Global Trade Solutions",
    shortDescription:
      "A diversified international trading house for import and export, sourcing, logistics and trade consulting, headquartered in Shenyang, China, with operations in Nigeria.",
    claimsMode: "flag",
  },
  about: {
    story: [
      "ADS Global Limited is a diversified international trading house with operations spanning food and beverages, import and export, technology, machinery and strategic consulting.",
      "Headquartered in Shenyang, China, with a branch in Shandong and offices in Abuja and Kano, Nigeria, we use our presence in both markets to source quality products and deliver practical trade solutions across continents.",
    ],
    // Chosen: src/data/mission.ts (more concrete, no superlatives).
    mission:
      "Facilitate seamless global trade through quality products, reliable logistics, and expert consulting that empowers our partners to succeed across borders.",
    vision:
      "Become a leading international trading house known for integrity, innovation, and sustainable value creation in the global marketplace.",
    // Flagged alternative: the old About.tsx version.
    alternateMission:
      "To revolutionize global trade by connecting markets, streamlining supply chains, and delivering exceptional value through innovative solutions and unwavering commitment to quality.",
    alternateVision:
      "To be the world's most trusted partner in international trade, recognized for our integrity, expertise, and ability to bridge markets while fostering sustainable economic growth.",
    missionVisionConfirmed: false,
    values: [
      { title: "Integrity", description: "Building trust through transparency and ethical business practices in every transaction." },
      { title: "Excellence", description: "Commitment to the highest standards of quality, service and professional conduct." },
      { title: "Global Collaboration", description: "Fostering partnerships and connections across cultures and continents." },
      { title: "Customer Success", description: "Delivering solutions that drive growth and profitability for our clients." },
    ],
  },
  contact: {
    generalEmail: "globalltdads@gmail.com",
    partnersEmail: "globalltdads@gmail.com",
    website: "https://www.adsglobaltd.com",
    primaryPhone: "+8618012824844",
    defaultOfficeSlug: "shenyang",
  },
  // Old site linked to the linkedin.com / twitter.com / facebook.com home pages. Hidden until real URLs are supplied.
  socials: { linkedin: null, x: null, facebook: null, instagram: null },
  hero: {
    eyebrow: "Global Trade Solutions",
    headlineLine1: "Connect globally.",
    headlineLine2: "Trade with confidence.",
    subhead:
      "Import, export, sourcing, logistics and trade consulting across 14 product categories, with teams in China and Nigeria.",
    imageUrl: pexelsUrl(stockImages.hero.id, 2400),
    imageAlt: stockImages.hero.alt,
    videoUrl: null,
  },
};

/**
 * Offices — from the company letterheads (China: Shenyang Sadiq International Trade Co., Ltd.;
 * Nigeria: Abubakar Dahiru Sadiq Global Ltd., RC 8079004). Phone / WhatsApp / email as printed there.
 * The Shandong branch has no phone of its own on the letterhead, so it uses the Shenyang number. [CONFIRM]
 */
export const defaultOffices: Office[] = [
  {
    slug: "shenyang",
    name: "Shenyang head office",
    legalEntity: "Shenyang Sadiq International Trade Co., Ltd.",
    registration: null,
    country: "China",
    countryCode: "CN",
    city: "Shenyang",
    address: "Room 3, No. 703, West Five District, 888 Puhe Avenue, Shenbei New District, Shenyang, Liaoning Province, China",
    addressConfirmed: true,
    phone: "+8618012824844",
    whatsapp: "+8613591479952",
    email: "globalltdads@gmail.com",
    timezone: "Asia/Shanghai",
    tzLabel: "CST",
    utcOffsetLabel: "UTC+8",
    isHq: true,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=888%20Puhe%20Avenue%2C%20Shenbei%20New%20District%2C%20Shenyang%2C%20Liaoning%2C%20China",
    hours: [
      { days: "Mon–Fri", opens: "09:00", closes: "18:00" },
      { days: "Saturday", opens: "10:00", closes: "16:00", note: "[CONFIRM: which time zone]" },
      { days: "Sunday", opens: null, closes: null },
    ],
    hoursConfirmed: false,
    sortOrder: 1,
  },
  {
    slug: "liangshan",
    name: "Shandong branch",
    legalEntity: "Shenyang Sadiq International Trade Co., Ltd.",
    registration: null,
    country: "China",
    countryCode: "CN",
    city: "Liangshan, Shandong",
    address: "500 metres east of Quanpuwaking Village, Quanpu Town, Liangshan County, Shandong Province, China",
    addressConfirmed: true,
    phone: "+8618012824844",
    whatsapp: "+8613591479952",
    email: "globalltdads@gmail.com",
    timezone: "Asia/Shanghai",
    tzLabel: "CST",
    utcOffsetLabel: "UTC+8",
    isHq: false,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Quanpu%20Town%2C%20Liangshan%20County%2C%20Shandong%2C%20China",
    hours: [
      { days: "Mon–Fri", opens: "09:00", closes: "18:00" },
      { days: "Saturday", opens: "10:00", closes: "16:00", note: "[CONFIRM: which time zone]" },
      { days: "Sunday", opens: null, closes: null },
    ],
    hoursConfirmed: false,
    sortOrder: 2,
  },
  {
    slug: "abuja",
    name: "Abuja office",
    legalEntity: "Abubakar Dahiru Sadiq Global Ltd.",
    registration: "RC 8079004",
    country: "Nigeria",
    countryCode: "NG",
    city: "Abuja",
    address: "Plot 458 Ahmadu Bello Way, opposite Access Bank, Garki II, Abuja, Nigeria",
    addressConfirmed: true,
    phone: "+2347031129111",
    whatsapp: "+8613591479952",
    email: "globalltdads@gmail.com",
    timezone: "Africa/Lagos",
    tzLabel: "WAT",
    utcOffsetLabel: "UTC+1",
    isHq: false,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Plot%20458%20Ahmadu%20Bello%20Way%2C%20Garki%20II%2C%20Abuja%2C%20Nigeria",
    hours: [
      { days: "Mon–Fri", opens: "09:00", closes: "18:00" },
      { days: "Saturday", opens: "10:00", closes: "16:00", note: "[CONFIRM: which time zone]" },
      { days: "Sunday", opens: null, closes: null },
    ],
    hoursConfirmed: false,
    sortOrder: 3,
  },
  {
    slug: "kano",
    name: "Kano office",
    legalEntity: "Abubakar Dahiru Sadiq Global Ltd.",
    registration: "RC 8079004",
    country: "Nigeria",
    countryCode: "NG",
    city: "Kano",
    address: "No. 86 U/Badawa, A.A. Rano Street, Hotoro NNPC Depot, Maiduguri Road, Kano, Nigeria",
    addressConfirmed: true,
    phone: "+2347031129111",
    whatsapp: "+8613591479952",
    email: "globalltdads@gmail.com",
    timezone: "Africa/Lagos",
    tzLabel: "WAT",
    utcOffsetLabel: "UTC+1",
    isHq: false,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Hotoro%20NNPC%20Depot%2C%20Maiduguri%20Road%2C%20Kano%2C%20Nigeria",
    hours: [
      { days: "Mon–Fri", opens: "09:00", closes: "18:00" },
      { days: "Saturday", opens: "10:00", closes: "16:00", note: "[CONFIRM: which time zone]" },
      { days: "Sunday", opens: null, closes: null },
    ],
    hoursConfirmed: false,
    sortOrder: 4,
  },
];

export const defaultStats: Stat[] = [
  { key: "categories", label: "Product & service categories", value: 14, prefix: "", suffix: "", confirmed: true, note: "Matches the 14 categories listed on the site.", sortOrder: 1 },
  { key: "offices", label: "Offices in China and Nigeria", value: 4, prefix: "", suffix: "", confirmed: true, note: "Shenyang, Shandong (Liangshan), Abuja, Kano — per company letterheads.", sortOrder: 2 },
  { key: "countries", label: "Countries served", value: 50, prefix: "", suffix: "+", confirmed: false, note: "[CONFIRM] Old site: '50+ countries served'.", sortOrder: 3 },
  { key: "partners", label: "Global partners", value: 1000, prefix: "", suffix: "+", confirmed: false, note: "[CONFIRM] Old site: '1000+ global partners'.", sortOrder: 4 },
  { key: "years", label: "Years of experience", value: 10, prefix: "", suffix: "+", confirmed: false, note: "[CONFIRM] Old site: '10+ years experience'. Conflicts with 'decades of experience' in Strengths.", sortOrder: 5 },
  { key: "supply_connections", label: "Supply connections", value: 100, prefix: "", suffix: "%", confirmed: false, note: "[CONFIRM] Old site: '100% supply connections'. Unclear what this measures — recommend removing.", sortOrder: 6 },
];

export const defaultClaims: Claim[] = [
  {
    key: "iso_status",
    label: "ISO status",
    text: "ISO-certified quality control processes",
    source: "About: 'ISO-certified quality control processes' vs Strengths: 'ISO-aligned quality standards'.",
    confirmed: false,
    note: "[CONFIRM] Certified (which standard, e.g. ISO 9001:2015, certificate number, certifying body) or only aligned?",
  },
  {
    key: "support_247",
    label: "24/7 support",
    text: "24/7 global hotline for urgent shipment issues",
    source: "Contact: '24/7 Global Hotline', 'Emergency Support'; Hero: '24/7 Support'; hours: 'Sunday — Emergency Only'.",
    confirmed: false,
    note: "[CONFIRM] Is a 24/7 line actually staffed? Which number?",
  },
  {
    key: "team_experience",
    label: "Team experience",
    text: "A multidisciplinary team with decades of combined international trade experience",
    source: "Strengths: 'decades of international trade experience' vs About: 'Industry veterans with 10+ years experience'.",
    confirmed: false,
    note: "[CONFIRM] Which is correct?",
  },
  {
    key: "supplier_network",
    label: "Supplier network reach",
    text: "Supplier connections across Africa, Asia and worldwide",
    source: "Strengths: 'Established connections across Africa, Asia, and worldwide supplier network'.",
    confirmed: false,
    note: "[CONFIRM] Keep as worded?",
  },
];

export const defaultStrengths: Strength[] = [
  { slug: "portfolio", title: "Extensive product portfolio", description: "Access to 14 major product and service categories spanning food, technology, machinery and more.", icon: "LayoutGrid", sortOrder: 1 },
  { slug: "quality", title: "Quality assurance", description: "Defined quality standards and inspection protocols before goods leave the factory.", icon: "BadgeCheck", sortOrder: 2 },
  { slug: "network", title: "Global supply-chain network", description: "Supplier and logistics relationships linking Asian manufacturers with buyers in Africa and beyond.", icon: "Network", sortOrder: 3 },
  { slug: "team", title: "Expert team", description: "A multidisciplinary team covering sourcing, inspection, shipping and customs on both sides of the trade lane.", icon: "Users", sortOrder: 4 },
  { slug: "customer", title: "Customer-centric service", description: "Dedicated support and tailored solutions for each client partnership.", icon: "Handshake", sortOrder: 5 },
];

const rawProcessSteps: ProcessStep[] = [
  {
    slug: "enquiry",
    title: "Enquiry",
    description: "Tell us what you need: product, specification, quantity, destination and timeline.",
    details: ["Request a quote online or by email", "We confirm the brief within one business day [CONFIRM]", "NDA available on request [CONFIRM]"],
    imageUrl: null,
    imageAlt: "Trade team reviewing a product specification at a meeting table",
    sortOrder: 1,
  },
  {
    slug: "sourcing-quotation",
    title: "Sourcing & quotation",
    description: "We shortlist vetted manufacturers, compare samples and send a quotation on your chosen Incoterm.",
    details: ["Supplier shortlisting and factory checks", "Samples where needed", "Quotation on EXW, FOB, CIF or DDP terms"],
    imageUrl: null,
    imageAlt: "Factory floor with workers at an assembly line",
    sortOrder: 2,
  },
  {
    slug: "quality-inspection",
    title: "Quality inspection",
    description: "Goods are checked against your specification before they leave the factory.",
    details: ["Pre-shipment inspection", "Photo and video reports", "Third-party inspection on request"],
    imageUrl: null,
    imageAlt: "Inspector checking products with a clipboard in a warehouse",
    sortOrder: 3,
  },
  {
    slug: "shipping-customs",
    title: "Shipping & customs",
    description: "We book freight, prepare export documents and coordinate clearance at the destination port.",
    details: ["Sea FCL (20ft / 40ft / 40HC) and LCL, air and road", "Commercial invoice, packing list, bill of lading, certificate of origin", "Customs clearance support at destination"],
    imageUrl: null,
    imageAlt: "Shipping container being loaded onto a vessel by a gantry crane",
    sortOrder: 4,
  },
  {
    slug: "delivery-after-sales",
    title: "Delivery & after-sales",
    description: "Final-mile delivery to your warehouse or site, with follow-up on any claims or reorders.",
    details: ["Door delivery where available", "Shipment tracking updates", "Reorders and claims handled by one contact"],
    imageUrl: null,
    imageAlt: "Truck on a highway delivering cargo",
    sortOrder: 5,
  },
];

const rawCategories: Category[] = [
  {
    slug: "food-beverages", name: "Food & Beverages", hsLabel: "HS 01–24", group: "consumer",
    summary: "Premium sourcing of food and beverage products from global suppliers.",
    description: "We source packaged foods, ingredients and beverages from vetted producers, with attention to shelf life, labelling and import permits for the destination market.",
    exampleProducts: ["Rice, pasta and grains", "Edible oils", "Canned and packaged foods", "Beverages and juices", "Confectionery"],
    exampleProductsConfirmed: false, sourcingRegions: ["China", "Southeast Asia", "Global"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Packaged foods and beverages on supermarket shelves", imageIsStock: true, sortOrder: 1, published: true,
  },
  {
    slug: "import-export-services", name: "Import & Export Services", hsLabel: "SVC · Trade", group: "services",
    summary: "Comprehensive import and export logistics solutions.",
    description: "End-to-end handling of cross-border shipments: supplier payments coordination, export documentation, freight booking, insurance and customs clearance support.",
    exampleProducts: ["Freight booking (sea, air, road)", "Export documentation", "Cargo insurance arrangement", "Customs clearance support", "Consolidation (LCL)"],
    exampleProductsConfirmed: false, sourcingRegions: ["China ⇄ West Africa", "Global trade lanes"], sourcingRegionsConfirmed: false,
    incoterms: ["EXW", "FOB", "CIF", "DAP", "DDP"], imageUrl: null, imageAlt: "Stacked shipping containers at a port terminal", imageIsStock: true, sortOrder: 2, published: true,
  },
  {
    slug: "office-supplies", name: "Office Supplies", hsLabel: "HS 48 · 96", group: "consumer",
    summary: "Complete office supply solutions for businesses of all sizes.",
    description: "Stationery, paper products and office equipment sourced in bulk for corporate, education and government buyers.",
    exampleProducts: ["Copy paper and notebooks", "Pens and writing instruments", "Files and folders", "Office furniture", "Printers and consumables"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Neatly arranged office stationery on a desk", imageIsStock: true, sortOrder: 3, published: true,
  },
  {
    slug: "apparel-fashion", name: "Apparel & Fashion", hsLabel: "HS 61–64", group: "consumer",
    summary: "Quality fashion and apparel procurement and distribution.",
    description: "Garments, uniforms, footwear and textiles from established mills and factories, with size-set approval and pre-shipment checks.",
    exampleProducts: ["Ready-to-wear garments", "Workwear and uniforms", "Footwear", "Fabrics and textiles", "Bags"],
    exampleProductsConfirmed: false, sourcingRegions: ["China", "Southeast Asia"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Garments hanging on rails in a clothing showroom", imageIsStock: true, sortOrder: 4, published: true,
  },
  {
    slug: "technology-electronics", name: "Technology & Electronics", hsLabel: "HS 85 · 8471", group: "consumer",
    summary: "Latest technology and electronic products from trusted manufacturers.",
    description: "Consumer and business electronics, components and accessories from certified manufacturers, with attention to voltage, plug type and certification requirements for the destination.",
    exampleProducts: ["Laptops and computer accessories", "Mobile phones and accessories", "Solar panels, inverters and batteries", "CCTV and networking equipment", "Electronic components"],
    exampleProductsConfirmed: false, sourcingRegions: ["China (Guangdong)", "Asia"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Close-up of electronic circuit boards on an assembly line", imageIsStock: true, sortOrder: 5, published: true,
  },
  {
    slug: "machinery-equipment", name: "Machinery & Equipment", hsLabel: "HS 84", group: "industrial",
    summary: "Industrial machinery and equipment for manufacturing operations.",
    description: "Production lines, processing machinery, generators and spare parts, sourced with technical specification review and factory acceptance checks.",
    exampleProducts: ["Food-processing machinery", "Packaging machines", "Generators", "Construction equipment", "Spare parts"],
    exampleProductsConfirmed: false, sourcingRegions: ["China (Liaoning, Jiangsu, Zhejiang)"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Heavy industrial machinery in a manufacturing plant", imageIsStock: true, sortOrder: 6, published: true,
  },
  {
    slug: "building-materials", name: "Building Materials", hsLabel: "HS 68–70 · 72–73", group: "industrial",
    summary: "High-quality building materials and construction supplies.",
    description: "Tiles, sanitary ware, steel products, roofing and finishing materials for contractors and developers, consolidated into full containers.",
    exampleProducts: ["Floor and wall tiles", "Sanitary ware", "Steel sections and rebar", "Roofing sheets", "Doors, windows and fittings"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Stacks of construction materials at a building site", imageIsStock: true, sortOrder: 7, published: true,
  },
  {
    slug: "specialty-chemicals", name: "Specialty Chemicals", hsLabel: "HS 28–38", group: "industrial",
    summary: "Industrial and specialty chemicals for various applications.",
    description: "Industrial and specialty chemicals supplied with safety data sheets and the correct dangerous-goods documentation where required.",
    exampleProducts: ["Water-treatment chemicals", "Coatings and additives", "Industrial cleaning agents", "Raw materials for manufacturing"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ["FOB", "CFR", "CIF", "DAP"], imageUrl: null, imageAlt: "Glass laboratory flasks on a clean lab bench", imageIsStock: true, sortOrder: 8, published: true,
  },
  {
    slug: "transportation-equipment", name: "Transportation Equipment", hsLabel: "HS 86–89", group: "automotive_transport",
    summary: "Vehicles and transportation solutions for logistics.",
    description: "Commercial vehicles, trailers and fleet equipment for logistics operators, shipped RoRo or in flat-rack containers.",
    exampleProducts: ["Trailers and semi-trailers", "Tankers", "Forklifts", "Buses", "Fleet spare parts"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ["FOB", "CFR", "CIF", "DAP"], imageUrl: null, imageAlt: "Fleet of trucks parked at a logistics depot", imageIsStock: true, sortOrder: 9, published: true,
  },
  {
    slug: "jewelry-accessories", name: "Jewelry & Accessories", hsLabel: "HS 71 · 42", group: "consumer",
    summary: "Fine jewelry and luxury accessories sourcing and distribution.",
    description: "Jewellery, watches and fashion accessories, sourced in retail-ready packaging with batch quality checks.",
    exampleProducts: ["Fashion jewellery", "Watches", "Handbags and leather goods", "Hair accessories", "Sunglasses"],
    exampleProductsConfirmed: false, sourcingRegions: ["China (Guangdong, Zhejiang)"], sourcingRegionsConfirmed: false,
    incoterms: ["EXW", "FOB", "CIF", "DDP"], imageUrl: null, imageAlt: "Jewellery displayed in a glass showcase", imageIsStock: true, sortOrder: 10, published: true,
  },
  {
    slug: "home-appliances", name: "Home Appliances", hsLabel: "HS 8418 · 8450 · 8516", group: "consumer",
    summary: "Quality home appliances from leading global manufacturers.",
    description: "Large and small appliances specified for the destination grid, with spare-parts and warranty arrangements agreed up front.",
    exampleProducts: ["Refrigerators and freezers", "Washing machines", "Air conditioners", "Cookers and microwaves", "Small kitchen appliances"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Modern kitchen with built-in home appliances", imageIsStock: true, sortOrder: 11, published: true,
  },
  {
    slug: "fmcg", name: "Daily-use Goods (FMCG)", hsLabel: "HS 33 · 34 · 96", group: "consumer",
    summary: "Fast-moving consumer goods and household products.",
    description: "Household, personal-care and cleaning products for distributors and retailers, with labelling adapted to the destination market.",
    exampleProducts: ["Personal-care products", "Detergents and cleaning products", "Tissue and paper goods", "Plasticware and kitchenware", "Baby care"],
    exampleProductsConfirmed: false, sourcingRegions: ["China", "Asia"], sourcingRegionsConfirmed: false,
    incoterms: ALL_GOODS_TERMS, imageUrl: null, imageAlt: "Supermarket aisle stocked with household products", imageIsStock: true, sortOrder: 12, published: true,
  },
  {
    slug: "information-consulting", name: "Information Consulting", hsLabel: "SVC · Advisory", group: "services",
    summary: "Market research and business consulting services.",
    description: "Market-entry research, supplier due diligence and trade advisory for companies buying from or selling into China and West Africa.",
    exampleProducts: ["Market-entry research", "Supplier due diligence", "Import regulation guidance", "Trade-fair and factory visit support"],
    exampleProductsConfirmed: false, sourcingRegions: ["China", "Nigeria", "West Africa"], sourcingRegionsConfirmed: false,
    incoterms: [], imageUrl: null, imageAlt: "Business team discussing charts and data in a meeting", imageIsStock: true, sortOrder: 13, published: true,
  },
  {
    slug: "automobiles", name: "Automobiles", hsLabel: "HS 87", group: "automotive_transport",
    summary: "Trucks, EVs, luxury cars and automotive solutions.",
    description: "Passenger cars, electric vehicles and trucks sourced to the destination's import rules, shipped RoRo or containerised.",
    exampleProducts: ["Electric vehicles (EVs)", "Trucks and tippers", "SUVs and passenger cars", "Luxury vehicles", "Automotive parts"],
    exampleProductsConfirmed: false, sourcingRegions: ["China"], sourcingRegionsConfirmed: false,
    incoterms: ["FOB", "CFR", "CIF", "DAP"], imageUrl: null, imageAlt: "New cars lined up at a vehicle terminal", imageIsStock: true, sortOrder: 14, published: true,
  },
];

const stepImages: Record<string, StockImageKey> = {
  enquiry: "stepEnquiry",
  "sourcing-quotation": "stepSourcing",
  "quality-inspection": "stepInspection",
  "shipping-customs": "stepShipping",
  "delivery-after-sales": "stepDelivery",
};

const categoryImages: Record<string, StockImageKey> = {
  "food-beverages": "catFood",
  "import-export-services": "terminal",
  "office-supplies": "catOffice",
  "apparel-fashion": "catApparel",
  "technology-electronics": "catElectronics",
  "machinery-equipment": "catMachinery",
  "building-materials": "catBuilding",
  "specialty-chemicals": "catChemicals",
  "transportation-equipment": "catTransport",
  "jewelry-accessories": "catJewelry",
  "home-appliances": "catAppliances",
  fmcg: "catFmcg",
  "information-consulting": "catConsulting",
  automobiles: "catAutomobiles",
};

export const defaultProcessSteps: ProcessStep[] = rawProcessSteps.map((step) => {
  const key = stepImages[step.slug];
  const img = key ? stockImages[key] : undefined;
  return img ? { ...step, imageUrl: pexelsUrl(img.id, 1600), imageAlt: img.alt } : step;
});

export const defaultCategories: Category[] = rawCategories.map((category) => {
  const key = categoryImages[category.slug];
  const img = key ? stockImages[key] : undefined;
  return img ? { ...category, imageUrl: pexelsUrl(img.id, 1600), imageAlt: img.alt } : category;
});

export const defaultLeaders: Leader[] = [
  { slug: "leader-1", name: "[CONFIRM: name]", role: "[CONFIRM: e.g. Managing Director]", bio: "[CONFIRM: short bio]", photoUrl: null, confirmed: false, sortOrder: 1 },
  { slug: "leader-2", name: "[CONFIRM: name]", role: "[CONFIRM: e.g. Country Manager, Nigeria]", bio: "[CONFIRM: short bio]", photoUrl: null, confirmed: false, sortOrder: 2 },
];

export const defaultCertifications: Certification[] = [
  { slug: "iso", name: "[CONFIRM: e.g. ISO 9001:2015]", issuer: "[CONFIRM: certifying body]", reference: "[CONFIRM: certificate number]", validUntil: null, confirmed: false, sortOrder: 1 },
  { slug: "cac", name: "CAC registration — Abubakar Dahiru Sadiq Global Ltd.", issuer: "Corporate Affairs Commission, Nigeria", reference: "RC 8079004", validUntil: null, confirmed: true, sortOrder: 2 },
];

/** No genuine case studies yet. (The old site's solar-charging .docx is a student project, not ADS work.) */
export const defaultProjects: Project[] = [];

/** African destinations route to the Abuja office; everything else falls back to contact.defaultOfficeSlug. [CONFIRM: Abuja or Kano?] */
const AFRICA = [
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET",
  "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW",
  "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "ZM", "ZW",
];
export const defaultRoutingRules: RoutingRule[] = AFRICA.map((countryCode) => ({ countryCode, officeSlug: "abuja" }));
