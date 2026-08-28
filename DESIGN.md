---
name: D'Aisle Inventory
description: The atelier's working record for fabric, roll, and shipment stock
colors:
  harvest-gold: "#735b2c"
  light-gold: "#a68b54"
  bright-gold: "#c4a265"
  muted-sage: "#5b8a72"
  warm-bronze: "#8b6e4e"
  warm-paper: "#faf9f6"
  warm-card: "#ffffff"
  warm-ink: "#2c2418"
  warm-taupe: "#8a7e6b"
  warm-border: "#e2dcd0"
  sidebar-warm: "#f0ece4"
  status-in-stock: "#5b8a72"
  status-low-stock: "#c4a265"
  status-out-of-stock: "#735b2c"
  status-phased-out: "#c8bfaf"
  destructive: "#c4473a"
typography:
  display:
    fontFamily: "Noto Serif, Noto Serif Fallback, ui-serif, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
  section-title:
    fontFamily: "Noto Serif, Noto Serif Fallback, ui-serif, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
  body:
    fontFamily: "Manrope, Manrope Fallback, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "Manrope, Manrope Fallback, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.15em"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.5rem"
  xl: "0.75rem"
  pill: "9999px"
spacing:
  page-rhythm: "2rem"
  card-gap: "1rem"
  card-padding: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.harvest-gold}"
    textColor: "#fff8ee"
    rounded: "{rounded.md}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.warm-card}"
    rounded: "{rounded.xl}"
  badge-status:
    rounded: "{rounded.pill}"
---

# Design System: D'Aisle Inventory

## Overview

**Creative North Star: "The Bridal Standard"**

D'Aisle Inventory is an internal operating system for a bridal atelier, not a storefront — its confidence comes from precision and restraint, not persuasion. The system reads as a warm, editorial ledger: a serif hand (Noto Serif) for display numbers and section titles gives every page the weight of a record kept by hand, while a plain, legible sans (Manrope) carries all working text — labels, table data, form fields — so the eye never has to work to find the number that matters. The palette stays inside one warm family (Harvest Gold, Muted Sage, Bright Gold, Warm Bronze, on warm paper neutrals) rather than reaching for department-store brights; color is spent deliberately, mostly through status meaning (in stock, low stock, out of stock) rather than decoration. Surfaces are flat and warm — soft `shadow-sm` lift on cards, nothing heavier — because the material world being tracked (fabric, thread, lace) is soft, not glossy or industrial.

This is an Operate-mode surface: staff complete real tasks against it daily (receive a shipment, log usage against a bride's commission, correct a count), so scanability and consistency outrank expression. The editorial voice lives in precise, deliberate details — a serif number, a hairline rule, an uppercase label — not in page-level flourish.

**Key Characteristics:**
- Warm, single-family palette (gold/sage/bronze on warm neutrals) — color carries status meaning, not decoration
- Serif display numbers and titles (Noto Serif) paired with plain sans for everything functional (Manrope)
- Flat, warm surfaces with restrained `shadow-sm` lift; no heavy elevation
- A signature numbered-kicker stat card ("01 · Active Products") reused for KPI summaries across dashboard and reports
- Generous page rhythm (`space-y-8`), tight grouping within cards

## Colors

The palette is a single warm family — gold as the primary voice, sage as its complement, bronze and bright gold as supporting accents — laid over warm paper neutrals instead of cool gray.

### Primary
- **Harvest Gold** (`#735b2c`): primary buttons, active nav state, focus rings, links, the brand's one confident accent. Used sparingly — most of any given screen stays neutral.

### Secondary
- **Muted Sage** (`#5b8a72`): "in stock" / positive status, a secondary chart color, the emerald-toned confirm actions (receive shipment). Reads as calm and settled against the warm gold.

### Tertiary
- **Bright Gold** (`#c4a265`) and **Light Gold** (`#a68b54`): low-stock warning tone and chart accents. **Warm Bronze** (`#8b6e4e`): a fifth chart/status accent, used last in rotation.

### Neutral
- **Warm Paper** (`#faf9f6`): page background.
- **Warm Card** (`#ffffff`): card and popover surfaces, lifted off the paper background with `shadow-sm`.
- **Warm Ink** (`#2c2418`): primary text.
- **Warm Taupe** (`#8a7e6b`): muted/secondary text, chart axis labels.
- **Warm Border** (`#e2dcd0`): hairlines, dividers, input borders.
- **Sidebar Warm** (`#f0ece4`): the sidebar's own slightly-deeper warm neutral, distinguishing navigation from content.

### Status
- **In Stock** — Muted Sage. **Low Stock** — Bright Gold. **Out of Stock** — Harvest Gold (dark). **Phased Out** — warm gray (`#c8bfaf`). **Destructive** — `#c4473a`, used only for delete/irreversible actions, never as a general accent.

### Named Rules
**The One Family Rule.** Every accent color, including chart colors, comes from the gold/sage/bronze family or its warm neutrals. A new hue never enters without a stated reason — status meaning is the only reason that has qualified so far.

## Typography

**Display Font:** Noto Serif (with `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` fallback)
**Body Font:** Manrope (with system sans-serif fallback)

**Character:** A quiet, confident serif for the numbers and titles that matter, set against a completely plain, highly legible sans for everything operational. The pairing reads as "ledger," not "boutique" — restraint over ornament.

### Hierarchy
- **Display** (400, `text-3xl` / `text-4xl` on `lg`, tight tracking): page titles ("Inventory Overview," "AL005").
- **Section Title** (400, `text-lg`): card and chart titles ("Stock Status Distribution").
- **Metric** (400, `text-5xl`, `leading-none`): the large serif figure inside a stat card — the single most important number on the card.
- **Body** (400, `text-sm`): table data, form values, running copy.
- **Label** (600, `10px`, `0.15em` tracking, uppercase): field labels, the numbered-kicker prefix on stat cards, chart legend/axis text.

### Named Rules
**The Serif-Only-For-Weight Rule.** Serif type is reserved for titles and standalone metrics — the moments that carry real weight. Table cells, buttons, badges, and helper text are always sans; mixing serif into dense data makes it harder to scan, not more elegant.

## Layout

A fixed 256px sidebar (warm neutral, dark relative to the page) sits left of a fluid content column with `p-6` / `p-8` on `lg`. Page content follows a consistent vertical rhythm of `space-y-8` between major sections and `space-y-4`–`space-y-6` within a card. KPI stat cards use a responsive grid (`sm:grid-cols-2 lg:grid-cols-4`); chart pairs use `lg:grid-cols-2`; forms cap at `max-w-lg` to `max-w-3xl` depending on field count, never stretching full-width. Tables scroll horizontally inside their own `overflow-x-auto` container on narrow viewports rather than wrapping cell content — actions stay reachable by a scroll, not by growing the row.

## Elevation & Depth

Flat by default. Cards lift off the paper background with a single soft `shadow-sm` — enough to read as a surface, not enough to feel glossy. Dialogs use a heavier `shadow-xl` since they interrupt the page and need to read as clearly above it. Depth is otherwise conveyed through color (warm card white vs. warm paper background) and hairline borders, not shadow escalation.

### Named Rules
**The Single-Step Lift Rule.** There is one elevation step above the page (`shadow-sm` cards) and one above that (`shadow-xl` dialogs). Nothing escalates further; a third shadow tier has no role in this system.

## Shapes

Corners are gently rounded and consistent by component role: `0.5rem` (`rounded-lg`/`rounded-md`) for buttons, inputs, and small interactive controls; `0.75rem` (`rounded-xl`) for cards and dialogs; fully rounded (`rounded-4xl`) for badges, pills, and status chips. Borders are thin (1px hairline in `warm-border`, 2px on inputs for a slightly firmer edge) and warm-toned rather than cool gray.

## Components

### Buttons
- **Shape:** `rounded-lg` (0.5rem).
- **Primary:** Harvest Gold background, warm off-white text (`#fff8ee`); the one high-commitment action per view (Save, Create, Add).
- **Outline / Ghost / Secondary:** transparent or warm-neutral background, ink text; used for Cancel, secondary actions, and icon-only row actions.
- **Destructive:** low-saturation red wash (`bg-destructive/10`, red text) rather than a solid red fill — visible without being alarming until intentionally confirmed.
- **Hover / Focus:** subtle opacity shift on hover; a 3px ring in the button's own hue on focus-visible.

### Badges / Status Pills
- **Style:** fully rounded (`rounded-4xl`), colored background tint + matching text, small colored dot for stock-status badges specifically (see Signature Component below).
- **State:** variant carries meaning (default = primary gold, secondary = neutral, destructive = red wash, outline = bordered neutral).

### Cards / Containers
- **Corner Style:** `rounded-xl` (0.75rem).
- **Background:** Warm Card white on Warm Paper page background.
- **Shadow Strategy:** `shadow-sm` only (see Elevation & Depth).
- **Border:** none by default; relies on the shadow + background-color contrast to read as a surface.
- **Internal Padding:** `1.5rem` (`px-6`), tightened to `1rem` (`px-4`) in the `sm` card density variant.

### Inputs / Fields
- **Style:** `rounded-lg`, 2px `warm-border` stroke, transparent background.
- **Focus:** border shifts to the ring color plus a soft 3px ring at 50% opacity.
- **Error:** border and ring shift to destructive red.
- **Disabled:** reduced opacity, background tint, no pointer events.

### Navigation (Sidebar)
- Fixed-width, warm-neutral background distinct from page content. Nav items are uppercase, small (`text-xs`), tightly tracked labels with a leading icon. Active state: solid Harvest Gold background with light text. Inactive: muted warm-taupe text, no background, gaining a soft warm hover fill. Admin-only items separate below a hairline divider.

### Numbered Stat Card (signature component)
The dashboard and reports pages share one KPI-summary pattern: a small uppercase kicker ("01 · Active Products") above a large serif metric, a hairline rule, and a "View →" link to the detail page. The sequence number is decorative editorial texture, not a claim about order — it's the system's most identifiable signature and should be the first pattern reused for any new summary metric.

## Do's and Don'ts

### Do:
- **Do** keep Harvest Gold rare and intentional — primary actions, active states, and the metric numbers. It should never read as a background or fill color for large areas.
- **Do** reuse the numbered-kicker stat card for any new KPI summary rather than inventing a new card pattern.
- **Do** pair every serif title or metric with plain sans supporting text; never set dense data or long copy in the display serif.
- **Do** let tables scroll horizontally on narrow viewports (`overflow-x-auto`, `whitespace-nowrap` on action cells) instead of letting row content wrap and balloon row height.

### Don't:
- **Don't** introduce a shadow tier beyond `shadow-sm` (cards) and `shadow-xl` (dialogs) — depth in this system comes from warm-neutral color contrast, not stacked elevation.
- **Don't** add a new accent hue outside the gold/sage/bronze family without a status-meaning reason; chart and UI colors both draw from the same five-color palette.
- **Don't** stack a redundant uppercase "kicker" label directly above a heading that already says the same thing — the title should stand alone unless the kicker carries genuinely different information (like the numbered stat cards' sequence + label).
