# Graph Report - d_aisle_inventory  (2026-08-28)

## Corpus Check
- 181 files · ~64,401 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 737 nodes · 1858 edges · 42 communities (36 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5cffe69d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- card.tsx
- shipment-form.tsx
- products-client.tsx
- dependencies
- PostHog Self-driving Setup Report
- createClient
- compilerOptions
- product-form.tsx
- adjustments/client.tsx
- devDependencies
- dashboard/page.tsx
- components.json
- receive-form.tsx
- formatDate
- PostHog Integration Skill (Next.js App Router)
- actions/product.ts
- view.tsx
- getPostHogClient
- add-pieces-form.tsx
- supplier-form.tsx
- actions/usage.ts
- vercel.json
- add_3d_flower_products.py
- import_brides.py
- app/layout.tsx
- src/middleware.ts
- eslint.config.mjs
- instrumentation-client.ts
- next.config.ts
- postcss.config.mjs
- test.sh
- Design System: D'Aisle Inventory
- usage-form.tsx
- cn
- Product
- button.tsx
- actions/category.ts
- tooltip.tsx
- date-picker.tsx

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 110 edges
2. `cn()` - 85 edges
3. `Card()` - 42 edges
4. `CardContent()` - 42 edges
5. `formatDate()` - 36 edges
6. `Button()` - 35 edges
7. `PageHeader()` - 33 edges
8. `CardHeader()` - 26 edges
9. `formatQuantity()` - 26 edges
10. `CardTitle()` - 24 edges

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

## Communities (42 total, 6 thin omitted)

### Community 0 - "card.tsx"
Cohesion: 0.13
Nodes (38): DemandLine, STATUS_BADGE, ACTION_COLORS, ACTION_LABELS, SearchParams, ROLE_COLORS, UsageSearchParams, ShipmentTimelineData (+30 more)

### Community 1 - "shipment-form.tsx"
Cohesion: 0.18
Nodes (13): ProductRow, Props, StockEntry, LineItem, Props, Label(), Props, SearchableSelect() (+5 more)

### Community 2 - "products-client.tsx"
Cohesion: 0.16
Nodes (15): Props, ProductSummary, Props, Ref, SortKey, StatusBadge(), SelectContent(), SelectGroup() (+7 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (43): @base-ui/react, class-variance-authority, clsx, date-fns, @hookform/resolvers, jspdf, lucide-react, next (+35 more)

### Community 4 - "PostHog Self-driving Setup Report"
Cohesion: 0.06
Nodes (35): Breakage Scanner Framework Rules (COMMANDMENTS), Breakage Scanner Brief Template, Breakage Scanner (Monitor) Brief, Frustration Scanner Framework Rules (COMMANDMENTS), Frustration Scanner (Monitor) Brief, Frustration Scanner Brief Template, Scanners Core Framework Rules (COMMANDMENTS), Replay Vision - PostHog Docs (+27 more)

### Community 5 - "createClient"
Cohesion: 0.09
Nodes (24): createProduct(), updateProduct(), uploadProductImage(), GET(), GET(), runtime, NewAdjustmentPage(), BridesPage() (+16 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "product-form.tsx"
Cohesion: 0.08
Nodes (31): DashboardLayout(), Props, Props, DashboardShell(), DashboardShellProps, adminItems, navItems, Sidebar() (+23 more)

### Community 8 - "adjustments/client.tsx"
Cohesion: 0.14
Nodes (18): AdjustmentReportClient(), InventoryReportClient(), ShipmentReportClient(), UsageReportClient(), ExportButtons(), ExportButtonsProps, AdjustmentRow, exportAdjustmentExcel() (+10 more)

### Community 9 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 10 - "dashboard/page.tsx"
Cohesion: 0.12
Nodes (18): DashboardPage(), weekLabel(), ShipmentTimelineChart(), ConsumptionData, StockConsumptionChart(), StatusData, StockStatusChart(), BAR_COLORS (+10 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "receive-form.tsx"
Cohesion: 0.14
Nodes (17): createAndReceiveShipment(), createShipment(), deleteShipment(), ReceiveItemInput, receiveShipmentVerified(), renameShipment(), updateShipment(), Props (+9 more)

### Community 13 - "formatDate"
Cohesion: 0.10
Nodes (26): getProductAdjustmentsPage(), updateUsage(), AdjustmentsPage(), BrideDetailPage(), MaterialDemandTable(), prettyStage(), ProductDetailPage(), ProductsPage() (+18 more)

### Community 14 - "PostHog Integration Skill (Next.js App Router)"
Cohesion: 0.24
Nodes (17): PostHog Setup - Begin, PostHog Setup - Edit, PostHog Setup - Revise, PostHog Setup - Conclusion, posthog.capture(), Next.js PostHog Framework Rules (COMMANDMENTS), PostHog Next.js App Router Example Project, instrumentation-client.ts (+9 more)

### Community 15 - "actions/product.ts"
Cohesion: 0.18
Nodes (15): addVariableRolls(), togglePhaseOut(), AddRollsForm(), AddPieceBatchFormData, addPieceBatchSchema, AddRollsFormData, addRollsSchema, AddVariableRollsFormData (+7 more)

### Community 16 - "view.tsx"
Cohesion: 0.11
Nodes (19): DemandGroup, dynamic, dynamic, dynamic, DemandFilter, DemandRow, getDemandGroups(), MaterialDemandView() (+11 more)

### Community 17 - "getPostHogClient"
Cohesion: 0.18
Nodes (11): createAdjustment(), updateBride(), addRolls(), cancelShipment(), receiveShipment(), AdjustmentForm(), getPostHogClient(), AdjustmentFormData (+3 more)

### Community 18 - "add-pieces-form.tsx"
Cohesion: 0.47
Nodes (4): addPieceBatch(), AddPiecesPage(), AddPiecesForm(), Props

### Community 19 - "supplier-form.tsx"
Cohesion: 0.22
Nodes (9): createSupplier(), toggleSupplierActive(), updateSupplier(), EditSupplierPage(), Props, SupplierForm(), Supplier, SupplierFormData (+1 more)

### Community 20 - "actions/usage.ts"
Cohesion: 0.31
Nodes (7): getProductUsagePage(), logUsage(), logUsageBatch(), monthRange(), RecentUsageCard(), UsageFormData, usageSchema

### Community 21 - "vercel.json"
Cohesion: 0.25
Nodes (7): sin1, buildCommand, framework, headers, installCommand, outputDirectory, regions

### Community 22 - "add_3d_flower_products.py"
Cohesion: 0.39
Nodes (7): create_product(), get_3d_flower_category_id(), main(), product_exists(), Script to add 3D Flower products to the D'Aisle inventory database. Can be run…, Download from S3 and upload to Supabase storage. Returns public URL or None., upload_image()

### Community 23 - "import_brides.py"
Cohesion: 0.40
Nodes (3): clean_unicode(), normalize_phone(), Strip invisible/directional unicode chars.

### Community 24 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): manrope, metadata, notoSerif

### Community 25 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 34 - "Design System: D'Aisle Inventory"
Cohesion: 0.07
Nodes (26): Badges / Status Pills, Buttons, Cards / Containers, Colors, Components, Design System: D'Aisle Inventory, Do:, Do's and Don'ts (+18 more)

### Community 35 - "usage-form.tsx"
Cohesion: 0.15
Nodes (17): createBride(), BridesClient(), BridesTable(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+9 more)

### Community 36 - "cn"
Cohesion: 0.07
Nodes (28): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge(), badgeVariants (+20 more)

### Community 37 - "Product"
Cohesion: 0.18
Nodes (10): Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product, Product Principles (+2 more)

### Community 38 - "button.tsx"
Cohesion: 0.28
Nodes (9): ForgotPasswordPage(), LoginPage(), Topbar(), TopbarProps, Button(), buttonVariants, Input(), createClient() (+1 more)

### Community 39 - "actions/category.ts"
Cohesion: 0.39
Nodes (6): createCategory(), deleteCategory(), updateCategory(), CategoriesClient(), CategoryFormData, categorySchema

### Community 41 - "date-picker.tsx"
Cohesion: 0.48
Nodes (6): DatePicker(), isoToDMY(), pad(), parseIso(), toIso(), WEEKDAY_LABELS

## Knowledge Gaps
- **227 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+222 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `card.tsx`, `usage-form.tsx`, `actions/category.ts`, `product-form.tsx`, `dashboard/page.tsx`, `receive-form.tsx`, `formatDate`, `actions/product.ts`, `view.tsx`, `getPostHogClient`, `add-pieces-form.tsx`, `supplier-form.tsx`, `actions/usage.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `card.tsx`, `shipment-form.tsx`, `products-client.tsx`, `usage-form.tsx`, `button.tsx`, `product-form.tsx`, `tooltip.tsx`, `date-picker.tsx`, `dashboard/page.tsx`, `formatDate`, `view.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `Card()` connect `card.tsx` to `shipment-form.tsx`, `products-client.tsx`, `usage-form.tsx`, `cn`, `button.tsx`, `product-form.tsx`, `dashboard/page.tsx`, `receive-form.tsx`, `view.tsx`, `add-pieces-form.tsx`, `supplier-form.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _227 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1267605633802817 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `PostHog Self-driving Setup Report` be split into smaller, more focused modules?**
  _Cohesion score 0.06386554621848739 - nodes in this community are weakly interconnected._