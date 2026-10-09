# Colour contrast (WCAG 2.2 AA)

AA requires **4.5:1** for normal text and **3:1** for large text (≥ 24px, or ≥ 18.66px bold) and UI components. Ratios computed with the WCAG relative-luminance formula; alpha colours are blended onto their background first.

| Text / foreground | Background | Ratio | Use | Result |
|---|---|---|---|---|
| Ink `#0A1F3D` | White | 16.45 | Body text, headings | AA |
| Ink `#0A1F3D` | Tint `#F2F6FA` | 15.15 | Text on alternating sections | AA |
| Ink `#0A1F3D` | Orange `#FF6700` | 5.64 | **Text on orange buttons and the marquee** | AA |
| Ink `#0A1F3D` | White 95% (scrolled header) | 14.94 | Header nav | AA |
| Brand `#004E98` | White | 8.26 | Links, heading accents | AA |
| Brand `#004E98` | Tint | 7.60 | Links on tint | AA |
| Orange-ink `#B84A00` | White | 5.23 | Small orange text (eyebrows, markers) on light | AA |
| Orange-ink `#B84A00` | Tint | 4.81 | Small orange text on tint | AA |
| Orange `#FF6700` | Ink | 5.64 | Accent words, eyebrows on navy | AA |
| Orange `#FF6700` | Ink-2 `#132B4F` | 4.84 | Accent on raised navy cards | AA |
| White | Ink | 16.45 | Text on navy | AA |
| White 90% | Ink | 13.50 | Footer links | AA |
| White 85% | Ink | 12.08 | Hero sub-headline | AA |
| White | Ink-2 | 14.13 | Text on raised navy cards | AA |
| White | Brand `#004E98` | 8.26 | Text on brand-blue surfaces | AA |
| Muted `#4A5B72` | White | 6.93 | Secondary text | AA |
| Muted `#4A5B72` | Tint | 6.38 | Secondary text on tint | AA |
| Muted-on-dark `#A9B8CC` | Ink | 8.16 | Secondary text on navy | AA |
| Muted-on-dark `#A9B8CC` | Ink-2 | 7.01 | Secondary text on raised navy | AA |
| Brand-on-dark `#7FB2E5` | Ink | 7.37 | Links on navy | AA |
| Success `#176B48` | White | 6.50 | Success messages | AA |
| Success `#176B48` | Success 10% tint | 5.60 | Success chip | AA |
| Danger `#B42318` | White | 6.57 | Error messages | AA |
| Danger `#B42318` | Danger 10% tint | 5.58 | Error chip | AA |

## Pairs that are **not allowed**

| Foreground | Background | Ratio | Why |
|---|---|---|---|
| White | Orange `#FF6700` | 2.92 | Fails AA. Orange buttons always use ink text. |
| Orange `#FF6700` | White | 2.92 | Fails AA for text. Fails even the 3:1 large-text minimum. On light backgrounds use orange-ink `#B84A00` for any orange text; bright orange appears there only as fills and decoration. As text, bright orange is used only on navy. |

Focus indicator: a two-tone ring — 2px orange inner ring plus 2px navy outer ring (`:focus-visible`). On navy backgrounds the orange ring carries it (5.6:1); on white and tint the navy ring does (16.5:1 / 15.2:1). Both exceed the 3:1 non-text minimum.
