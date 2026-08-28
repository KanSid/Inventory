# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mixed: the owner/admin of D'Aisle Bridals uses it for oversight, reporting, and admin configuration; atelier staff (cutting masters, unit designers, store designers, inventory managers) use it day-to-day to log stock actions — receiving shipments, logging material usage, recording adjustments. Used mostly on laptops, not primarily a mobile/shop-floor tool, though it should stay responsive.

## Product Purpose

Replaces manual/spreadsheet tracking of bridal-atelier material inventory with a system tailored to the atelier's actual production workflow: precise roll (meters) and piece (count) stock tracking, shipment receiving with discrepancy verification, and material usage attributed to specific bride commissions. Success is accurate, trustworthy stock numbers the whole team can act on without reconciling against paper or spreadsheets.

## Positioning

Purpose-built around three things a generic inventory tool doesn't model: a dual roll/piece stock-unit system matched to how bridal fabrics, lace, and trims are actually bought and used; usage logged against individual bride commissions rather than generic order lines; and shipment receiving that reconciles expected vs. received quantity per item, surfacing discrepancies (missing rolls, wrong lengths, damaged pieces) instead of assuming what shipped is what arrived.

## Operating Context

- **Shipments**: created against a supplier, received with per-item expected-vs-received verification (roll lengths or piece counts), discrepancies flagged and explained in notes.
- **Stock**: tracked per product as either rolls (meters, numbered `ITEMCODE-R1`, `-R2`...) or piece batches (count), depending on the product's category.
- **Usage**: logged against a specific bride's commission, drawn down from a specific roll or batch.
- **Adjustments**: manual corrections and damage records, additions or deductions, always with a reason.
- **Products**: can be phased out (hidden from new shipments/usage/adjustments while existing stock remains visible), have a low-stock threshold, and optionally an image, supplier(s), type, costing category, and design family.
- **Reports & activity log**: exportable (PDF/Excel) snapshots of inventory, usage, adjustments, and shipments; an immutable activity log records who did what and when.
- **Roles**: admin, inventory_manager, and viewer control permissions; staff also carry descriptive job-title labels (cutting master, unit designer, store designer, etc.) shown in user management.

## Capabilities and Constraints

Next.js + Supabase web app. Real production data is already live (500+ active products, ongoing shipment/usage/adjustment history) — this is the atelier's actual working system, not a prototype. Used mostly on laptops; responsive behavior still matters but is not the primary design constraint.

## Brand Commitments

Name: **D'Aisle** / **D'Aisle Bridals**, tagline "Bridal Standard v1.0". Existing visual identity (established in code, to be preserved): a warm "Atelier" editorial system — Harvest Gold/Sage/Bronze palette (`ATELIER_CHART_COLORS`), serif display type for headings, plain-language sans body text, and a numbered-kicker stat-card motif ("01 · Active Products") reused across the dashboard and reports pages.

## Evidence on Hand

Live production data: 500+ active products, real shipment/usage/adjustment/activity history. No marketing assets, testimonials, or case studies — this is an internal operational tool, not a persuade-mode surface.

## Product Principles

1. Stock numbers must stay trustworthy — every change (shipment receipt, usage, adjustment) is attributable and auditable via the activity log.
2. Model the atelier's real units (rolls in meters, pieces in count) and real workflow (bride commissions, supplier shipments) instead of generic SKU/order abstractions.
3. Discrepancies get surfaced, not hidden — receiving and reporting should show reality (expected vs. received, filtered vs. total) rather than a falsely clean number.
4. Staff and owner share one system: day-to-day stock actions and owner-level oversight/reporting live in the same tool, gated by role rather than split into separate apps.
5. Built for laptop use first; responsive behavior is maintained but not the primary design driver.
