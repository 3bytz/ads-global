# Claims and facts to confirm

Every item below is stored as an **editable, flagged value** (database tables `stats`, `claims`, `offices`, `leaders`, `certifications`, `site_settings`). While **Claims mode** is `flag` (current setting), unconfirmed items show on the site with a dashed "Unconfirmed" marker. Before launch, switch Claims mode to `hide` and anything still unconfirmed disappears from the public site.

## Update — 9 October 2026: office details from the company letterheads

Now on the site (and editable in Admin → Settings → Offices):

| Office | Company | Address | Phone |
|---|---|---|---|
| Shenyang head office | Shenyang Sadiq International Trade Co., Ltd. | Room 3, No. 703, West Five District, 888 Puhe Avenue, Shenbei New District, Shenyang, Liaoning Province, China | +86 180 1282 4844 |
| Shandong branch | Shenyang Sadiq International Trade Co., Ltd. | 500 metres east of Quanpuwaking Village, Quanpu Town, Liangshan County, Shandong Province, China | +86 180 1282 4844 (Shenyang number — none printed for this branch) |
| Abuja office | Abubakar Dahiru Sadiq Global Ltd. (RC 8079004) | Plot 458 Ahmadu Bello Way, opposite Access Bank, Garki II, Abuja | +234 703 112 9111 |
| Kano office | Abubakar Dahiru Sadiq Global Ltd. (RC 8079004) | No. 86 U/Badawa, A.A. Rano Street, Hotoro NNPC Depot, Maiduguri Road, Kano | +234 703 112 9111 |

WhatsApp +86 135 9147 9952 and email globalltdads@gmail.com on all offices (as printed). The CAC registration (RC 8079004) is shown on the About page as verified. Items 9, 10 and 12 below are resolved.

Still to confirm:
- **Which Nigeria office receives enquiries** for African destinations — currently Abuja (change in Admin → Settings → Contact & routing).
- **Email**: the old site used info@ / partners@ / china@ / nigeria@adsglobaltd.com; the letterhead uses globalltdads@gmail.com, which is now used everywhere. If the domain mailboxes work, switch back in Admin — a domain address looks more professional and is needed for sending email reliably (see DEPLOY.md §5).
- Spelling of "Quanpuwaking Village" (copied exactly as printed) and whether the Shandong branch has its own phone.
- The old Nigeria number +234 903 042 8141 has been replaced by +234 703 112 9111 from the letterhead — confirm the old one is no longer used.

## A. Contradictions and unverified claims from the old site

| # | Item | What the old site said | Where | Stored as | Needs from ADS |
|---|---|---|---|---|---|
| 1 | **ISO status** | "ISO-certified quality control processes" **vs** "ISO-aligned quality standards" | `About.tsx` vs `strengths.ts` | `claims.iso_status` | Certified or only aligned? If certified: standard (e.g. ISO 9001:2015), certifying body, certificate number, expiry, PDF. |
| 2 | **Countries served** | "50+ countries served" | `About.tsx`, `Hero.tsx` | `stats.countries` | Real number (or remove). |
| 3 | **Global partners** | "1000+ global partners" | `Statistics.tsx` | `stats.partners` | Real number (or remove). |
| 4 | **Supply connections** | "100% supply connections" | `Statistics.tsx` | `stats.supply_connections` | Unclear what this measures. **Recommend removing.** |
| 5 | **Years of experience** | "10+ years experience" | `About.tsx` | `stats.years` | Company founding year, or team experience? |
| 6 | **Team experience** | "decades of international trade experience" **vs** "Industry veterans with 10+ years experience" | `strengths.ts` vs `About.tsx` | `claims.team_experience` | Which is correct? |
| 7 | **24/7 support** | "24/7 Global Hotline", "Emergency Support", "Sunday — Emergency only", Hero "24/7 Support" | `Contact.tsx`, `Hero.tsx` | `claims.support_247` | Is a 24/7 line actually staffed? Which number? |
| 8 | **Supplier network reach** | "Established connections across Africa, Asia, and worldwide" | `strengths.ts` | `claims.supplier_network` | Keep as worded? |

## B. Two different mission/vision texts

I used the version from `src/data/mission.ts` (more concrete, no superlatives). The other is saved as `about.alternateMission` / `about.alternateVision` so you can switch.

| | **Used** (`mission.ts`) | **Alternative** (`About.tsx`) |
|---|---|---|
| Mission | Facilitate seamless global trade through quality products, reliable logistics, and expert consulting that empowers our partners to succeed across borders. | To revolutionize global trade by connecting markets, streamlining supply chains, and delivering exceptional value through innovative solutions and unwavering commitment to quality. |
| Vision | Become a leading international trading house known for integrity, innovation, and sustainable value creation in the global marketplace. | To be the world's most trusted partner in international trade, recognized for our integrity, expertise, and ability to bridge markets while fostering sustainable economic growth. |

## C. Facts that are missing or ambiguous

| # | Item | Current value | Needs |
|---|---|---|---|
| 9 | Nigeria office city | "Lagos/Abuja" | Which city (or both)? Street address. |
| 10 | China office address | "Shenyang, Liaoning Province" | Street address. |
| 11 | Saturday hours | 10:00–16:00 (old site said "local time for each office") | Confirm it's local time at each office, or a single time zone. |
| 12 | WhatsApp numbers | none | Number per office (may be the same as the phone). |
| 13 | Social links | old links went to linkedin.com / twitter.com / facebook.com home pages — now hidden | Real profile URLs. |
| 14 | Leadership | placeholders | Names, roles, short bios, photos (with permission). |
| 15 | Certifications / registrations | placeholders (ISO, CAC RC number) | Documents and numbers. |
| 16 | Enquiry routing | African destination countries → Nigeria office; everything else → Shenyang | Confirm which office handles which countries. |
| 17 | Example products and sourcing regions per category | Illustrative lists, flagged per category | Confirm or edit each list. |
| 18 | "We confirm the brief within one business day" / "NDA on request" | Process-step details, flagged inline | Confirm or remove. |

## D. Added during the build — please confirm

| # | Item | Where | Notes |
|---|---|---|---|
| 19 | Stock photos (26) | `src/content/image-credits.ts` | From Pexels (free commercial licence). I couldn't open the images from the build environment, so each must be checked on its source page for visible brand logos (shipping lines, product brands, car makers) — or replaced with company photos. The admin flags every stock slot. |
| 20 | "Typical China → Lagos transit about 30–45 days port to port", air "5–10 days" | How we work page (`src/content/trade.ts`) | Industry-typical figures, labelled "typical". Adjust to your actual experience. |
| 21 | Customs & compliance support (Form M, PAAR, SONCAP, NAFDAC, export docs) | How we work page | Describes services as briefed. Confirm ADS actually provides each. |
| 22 | Common ports listed (Dalian, Yingkou, Tianjin… / Apapa, Tin Can, Lekki, Onne, Tema, Cotonou, Lomé, Abidjan) | How we work page | Confirm these are the lanes you use. |
| 23 | Privacy policy & terms placeholders | `/legal/privacy`, `/legal/terms` | Registered addresses, company numbers, privacy contact, Supabase region, PIPL transfer mechanism, retention periods, governing law. Have a lawyer review. |
| 24 | Email-hosting provider for @adsglobaltd.com | `docs/DEPLOY.md` §5 | Needed to write the root SPF record correctly. |

## E. Things I checked and dropped

- **`Solar_Charging_System_Project_Proposal.docx`** is a university final-year project proposal by a student (Onyedika Christian Chukwuemeka, MOUAU), not an ADS project. It is **not** used as a case study. The Projects section starts empty and is ready for real ones.
- **"14+ categories"** became **14** (the site lists exactly 14). Confirmed.
- **"2 global offices"** kept. Confirmed.
