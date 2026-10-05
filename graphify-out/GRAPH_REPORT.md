# Graph Report - inventory  (2026-10-05)

## Corpus Check
- 182 files · ~64,523 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 6, .ico 1, .css 1)

## Summary
- 889 nodes · 2731 edges · 57 communities (39 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f6d0a05d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Card
- edit-usage-form.tsx
- categories-client.tsx
- dependencies
- PostHog Self-driving Setup Report
- PageHeader
- compilerOptions
- index.ts
- export-buttons.tsx
- devDependencies
- dashboard/page.tsx
- components.json
- Button
- createClient
- PostHog Integration Skill (Next.js App Router)
- actions/product.ts
- view.tsx
- actions/shipment.ts
- 001_inventory_schema.sql
- actions/bride.ts
- actions/usage.ts
- vercel.json
- add_3d_flower_products.py
- import_brides.py
- app/layout.tsx
- next
- eslint.config.mjs
- package.json
- 007_split_pieces.sql
- postcss.config.mjs
- ProductForm
- test.sh
- Design System: D'Aisle Inventory
- usage-form.tsx
- cn
- Product
- CardHeader
- 005_schema_overhaul.sql
- ReceiveForm
- DatePicker
- public.product_stock_summary
- scripts
- ShipmentNameEditor
- 003_add_supplier_to_shipment_items.sql

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 110 edges
2. `cn()` - 85 edges
3. `Card()` - 84 edges
4. `CardContent()` - 84 edges
5. `Button()` - 71 edges
6. `next` - 65 edges
7. `PageHeader()` - 64 edges
8. `CardHeader()` - 50 edges
9. `CardTitle()` - 46 edges
10. `react` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Shipment receive flow breakage (scanner instance)` --semantically_similar_to--> `Breakage Scanner Brief Template`  [INFERRED] [semantically similar]
  posthog-self-driving-report.md → .claude/skills/replay-vision-scanner-broken-experiences/SKILL.md
- `Inventory staff workflow frustration (scanner instance)` --semantically_similar_to--> `Frustration Scanner Brief Template`  [INFERRED] [semantically similar]
  posthog-self-driving-report.md → .claude/skills/replay-vision-scanner-user-frustration/SKILL.md
- `PostHog Self-driving Setup Report` --conceptually_related_to--> `creating-replay-vision-scanners in-product skill`  [INFERRED]
  posthog-self-driving-report.md → .claude/skills/replay-vision-scanners-core/SKILL.md
- `Deploy to Vercel GitHub Workflow` --conceptually_related_to--> `README.md - Project Overview`  [INFERRED]
  .github/workflows/deploy.yml → README.md
- `D'Aisle Inventory project` --conceptually_related_to--> `Deploy to Vercel GitHub Workflow`  [INFERRED]
  posthog-self-driving-report.md → .github/workflows/deploy.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Sequential PostHog Next.js wizard workflow (begin→edit→revise→conclude)** — _claude_skills_integration_nextjs_app_router_references_1_begin_doc, _claude_skills_integration_nextjs_app_router_references_2_edit_doc, _claude_skills_integration_nextjs_app_router_references_3_revise_doc, _claude_skills_integration_nextjs_app_router_references_4_conclude_doc [EXTRACTED 1.00]
- **Disjoint dual-monitor Replay Vision scanner pattern** — _claude_skills_replay_vision_scanner_broken_experiences_skill_doc, _claude_skills_replay_vision_scanner_user_frustration_skill_doc, _claude_skills_replay_vision_scanners_core_skill_doc, _claude_skills_replay_vision_scanners_core_skill_disjointness_rule [EXTRACTED 1.00]
- **Duplicated PostHog framework-rules content across skill COMMANDMENTS files** — _claude_skills_integration_nextjs_app_router_references_commandments_doc, _claude_skills_replay_vision_scanner_broken_experiences_references_commandments_doc, _claude_skills_replay_vision_scanner_user_frustration_references_commandments_doc, _claude_skills_replay_vision_scanners_core_references_commandments_doc [INFERRED 0.85]

## Communities (57 total, 18 thin omitted)

### Community 0 - "Card"
Cohesion: 0.10
Nodes (77): getProductAdjustmentsPage(), getProductUsagePage(), AdjustmentsPage(), BrideDetailPage(), DemandLine, MaterialDemandTable(), prettyStage(), STATUS_BADGE (+69 more)

### Community 1 - "edit-usage-form.tsx"
Cohesion: 0.25
Nodes (7): updateUsage(), Props, SearchableSelect(), SelectOption, EditUsageForm(), handleSubmit(), Props

### Community 2 - "categories-client.tsx"
Cohesion: 0.13
Nodes (20): createCategory(), deleteCategory(), updateCategory(), addVariableRolls(), CategoriesClient(), handleDelete(), handleSubmit(), AddRollsForm() (+12 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @base-ui/react, class-variance-authority, clsx, date-fns, @hookform/resolvers, jspdf, lucide-react (+14 more)

### Community 4 - "PostHog Self-driving Setup Report"
Cohesion: 0.06
Nodes (33): Breakage Scanner Framework Rules (COMMANDMENTS), Breakage Scanner Brief Template, Breakage Scanner (Monitor) Brief, Frustration Scanner Framework Rules (COMMANDMENTS), Frustration Scanner (Monitor) Brief, Frustration Scanner Brief Template, Scanners Core Framework Rules (COMMANDMENTS), Replay Vision - PostHog Docs (+25 more)

### Community 5 - "PageHeader"
Cohesion: 0.12
Nodes (19): @supabase/ssr, NewAdjustmentPage(), AddPiecesPage(), AddRollsPage(), ReportsPage(), AdminSettingsPage(), SettingsPage(), EditShipmentPage() (+11 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "index.ts"
Cohesion: 0.08
Nodes (29): DashboardLayout(), Props, DashboardShell(), DashboardShellProps, adminItems, navItems, Sidebar(), SidebarProps (+21 more)

### Community 8 - "export-buttons.tsx"
Cohesion: 0.15
Nodes (20): jspdf, xlsx, AdjustmentReportClient(), InventoryReportClient(), ShipmentReportClient(), UsageReportClient(), ExportButtons(), ExportButtonsProps (+12 more)

### Community 9 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 10 - "dashboard/page.tsx"
Cohesion: 0.13
Nodes (20): recharts, DashboardPage(), weekLabel(), ShipmentTimelineChart(), ShipmentTimelineData, ConsumptionData, StockConsumptionChart(), StatusData (+12 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "Button"
Cohesion: 0.21
Nodes (13): lucide-react, react, DashboardError(), Props, LookupItem, Props, Props, ReceivedState (+5 more)

### Community 13 - "createClient"
Cohesion: 0.21
Nodes (10): createAndReceiveShipment(), createShipment(), updateShipment(), GET(), GET(), runtime, CategoriesPage(), ProductsPage() (+2 more)

### Community 14 - "PostHog Integration Skill (Next.js App Router)"
Cohesion: 0.22
Nodes (15): PostHog Setup - Begin, PostHog Setup - Edit, PostHog Setup - Revise, PostHog Setup - Conclusion, posthog.capture(), Next.js PostHog Framework Rules (COMMANDMENTS), PostHog Next.js App Router Example Project, Identify Users - PostHog Docs (+7 more)

### Community 15 - "actions/product.ts"
Cohesion: 0.21
Nodes (13): togglePhaseOut(), AddPieceBatchFormData, addPieceBatchSchema, AddRollsFormData, addRollsSchema, AddVariableRollsFormData, addVariableRollsSchema, ProductFormData (+5 more)

### Community 16 - "view.tsx"
Cohesion: 0.09
Nodes (30): DemandGroup, dynamic, LowStockDemandPage(), dynamic, OutOfStockDemandPage(), dynamic, MaterialDemandPage(), DemandFilter (+22 more)

### Community 17 - "actions/shipment.ts"
Cohesion: 0.16
Nodes (14): createAdjustment(), addRolls(), cancelShipment(), deleteShipment(), ReceiveItemInput, receiveShipment(), handleSubmit(), ShipmentPendingActions() (+6 more)

### Community 18 - "001_inventory_schema.sql"
Cohesion: 0.12
Nodes (28): idx_inv_activity_log_action, idx_inv_activity_log_created, idx_inv_activity_log_entity, idx_inv_activity_log_user, idx_products_category, idx_products_item_code, idx_rolls_product, idx_rolls_status (+20 more)

### Community 19 - "actions/bride.ts"
Cohesion: 0.19
Nodes (9): zod, updateBride(), toggleSupplierActive(), BrideFormData, brideSchema, CategoryFormData, categorySchema, SupplierFormData (+1 more)

### Community 20 - "actions/usage.ts"
Cohesion: 0.43
Nodes (5): logUsage(), logUsageBatch(), handleSubmit(), UsageFormData, usageSchema

### Community 21 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, installCommand, outputDirectory, regions

### Community 22 - "add_3d_flower_products.py"
Cohesion: 0.32
Nodes (5): create_product(), get_3d_flower_category_id(), main(), product_exists(), upload_image()

### Community 24 - "app/layout.tsx"
Cohesion: 0.33
Nodes (3): manrope, metadata, notoSerif

### Community 25 - "next"
Cohesion: 0.27
Nodes (5): nextConfig, next, updateSession(), config, middleware()

### Community 26 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 27 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, version, clsx, date-fns, @hookform/resolvers, posthog-node, react-dom (+11 more)

### Community 28 - "007_split_pieces.sql"
Cohesion: 0.18
Nodes (9): idx_piece_batches_product, idx_piece_batches_shipment, idx_piece_batches_status, idx_stock_adjustments_batch, idx_stock_usage_batch, inventory.products, public.generate_batch_number(), public.piece_batches (+1 more)

### Community 32 - "ProductForm"
Cohesion: 0.22
Nodes (8): createProduct(), updateProduct(), uploadProductImage(), EditProductPage(), NewProductPage(), ProductForm(), handleFileChange(), handleSubmit()

### Community 34 - "Design System: D'Aisle Inventory"
Cohesion: 0.07
Nodes (26): Badges / Status Pills, Buttons, Cards / Containers, Colors, Components, Design System: D'Aisle Inventory, Do:, Do's and Don'ts (+18 more)

### Community 35 - "usage-form.tsx"
Cohesion: 0.14
Nodes (23): createBride(), BridesPage(), BridesClient(), handleSubmit(), Dialog(), DialogContent(), DialogDescription(), DialogFooter() (+15 more)

### Community 36 - "cn"
Cohesion: 0.06
Nodes (35): @base-ui/react, class-variance-authority, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+27 more)

### Community 37 - "Product"
Cohesion: 0.18
Nodes (10): Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product, Product Principles (+2 more)

### Community 38 - "CardHeader"
Cohesion: 0.19
Nodes (17): posthog-js, createSupplier(), updateSupplier(), ForgotPasswordPage(), LoginPage(), AdjustmentForm(), ProductRow, Props (+9 more)

### Community 39 - "005_schema_overhaul.sql"
Cohesion: 0.23
Nodes (6): idx_product_suppliers_product, idx_product_suppliers_supplier, inventory.products, inventory.shipments, public.product_stock_summary, public.product_suppliers

### Community 40 - "ReceiveForm"
Cohesion: 0.32
Nodes (5): receiveShipmentVerified(), ReceiveForm(), handleSubmit(), updateRollLength(), round1()

### Community 41 - "DatePicker"
Cohesion: 0.15
Nodes (14): addPieceBatch(), AddPiecesForm(), handleSubmit(), Props, DatePicker(), handleOpenChange(), handleSelect(), isoToDMY() (+6 more)

### Community 43 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 44 - "ShipmentNameEditor"
Cohesion: 0.67
Nodes (3): renameShipment(), ShipmentNameEditor(), handleSave()

## Knowledge Gaps
- **232 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+227 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 327 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Card`, `edit-usage-form.tsx`, `categories-client.tsx`, `PageHeader`, `index.ts`, `dashboard/page.tsx`, `Button`, `createClient`, `actions/product.ts`, `view.tsx`, `actions/shipment.ts`, `actions/bride.ts`, `actions/usage.ts`, `app/layout.tsx`, `package.json`, `ProductForm`, `usage-form.tsx`, `CardHeader`, `DatePicker`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _232 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Card` be split into smaller, more focused modules?**
  _Cohesion score 0.09991015274034142 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `Card`, `edit-usage-form.tsx`, `categories-client.tsx`, `usage-form.tsx`, `PageHeader`, `CardHeader`, `index.ts`, `DatePicker`, `dashboard/page.tsx`, `Button`, `view.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `categories-client.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13109243697478992 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `Card`, `ProductForm`, `categories-client.tsx`, `usage-form.tsx`, `edit-usage-form.tsx`, `PageHeader`, `CardHeader`, `index.ts`, `ReceiveForm`, `DatePicker`, `dashboard/page.tsx`, `ShipmentNameEditor`, `actions/product.ts`, `view.tsx`, `actions/shipment.ts`, `actions/bride.ts`, `actions/usage.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._