# Graph Report - .  (2026-08-28)

## Corpus Check
- 177 files · ~59,487 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 681 nodes · 1767 edges · 39 communities (29 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.87)
- Token cost: 251,962 input · 0 output

## Community Hubs (Navigation)
- Dashboard Detail Pages
- Server Actions - CRUD Operations
- UI Components (Avatar/Forms)
- Frontend Dependencies
- Replay Vision Scanner Framework
- API Routes & Health Checks
- TypeScript Config
- Dashboard Layout Components
- Report Client Components
- Lint & Package Config
- Dashboard Charts
- shadcn/ui Config
- Shipment Actions
- Shipment Receiving & Activity Log
- PostHog Integration Guide
- Product Actions & Validation
- Admin & User Management
- Adjustment/Bride Actions & PostHog Server
- Inventory Mutation Actions
- Supplier Actions
- Usage Tracking Actions
- Vercel Deployment Config
- 3D Flower Import Script
- Bride Import Script
- Root Layout & Fonts
- Auth Middleware
- ESLint Config File
- PostHog Client Instrumentation
- Next.js Config File
- PostCSS Config
- Test Script
- File Icon Asset
- Globe Icon Asset
- Next.js Logo Asset
- Vercel Logo Asset
- Window Icon Asset

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 108 edges
2. `cn()` - 81 edges
3. `Card()` - 41 edges
4. `CardContent()` - 41 edges
5. `Button()` - 35 edges
6. `formatDate()` - 34 edges
7. `PageHeader()` - 33 edges
8. `CardHeader()` - 26 edges
9. `CardTitle()` - 24 edges
10. `formatQuantity()` - 24 edges

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

## Communities (39 total, 10 thin omitted)

### Community 0 - "Dashboard Detail Pages"
Cohesion: 0.10
Nodes (57): AdjustmentsPage(), BrideDetailPage(), ProductDetailPage(), AdjustmentReportPage(), ShipmentReportPage(), UsageReportPage(), ACTION_COLORS, ACTION_LABELS (+49 more)

### Community 1 - "Server Actions - CRUD Operations"
Cohesion: 0.06
Nodes (56): createAdjustment(), createBride(), createCategory(), deleteCategory(), updateCategory(), ForgotPasswordPage(), LoginPage(), BridesPage() (+48 more)

### Community 2 - "UI Components (Avatar/Forms)"
Cohesion: 0.05
Nodes (39): Props, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge() (+31 more)

### Community 3 - "Frontend Dependencies"
Cohesion: 0.05
Nodes (43): @base-ui/react, class-variance-authority, clsx, date-fns, @hookform/resolvers, jspdf, lucide-react, next (+35 more)

### Community 4 - "Replay Vision Scanner Framework"
Cohesion: 0.06
Nodes (35): Breakage Scanner Framework Rules (COMMANDMENTS), Breakage Scanner Brief Template, Breakage Scanner (Monitor) Brief, Frustration Scanner Framework Rules (COMMANDMENTS), Frustration Scanner (Monitor) Brief, Frustration Scanner Brief Template, Scanners Core Framework Rules (COMMANDMENTS), Replay Vision - PostHog Docs (+27 more)

### Community 5 - "API Routes & Health Checks"
Cohesion: 0.11
Nodes (19): GET(), GET(), runtime, NewAdjustmentPage(), CategoriesPage(), EditProductPage(), AddPiecesPage(), AddRollsPage() (+11 more)

### Community 6 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "Dashboard Layout Components"
Cohesion: 0.10
Nodes (24): DashboardLayout(), DashboardShell(), DashboardShellProps, adminItems, navItems, Sidebar(), SidebarProps, ActivityLog (+16 more)

### Community 8 - "Report Client Components"
Cohesion: 0.14
Nodes (18): AdjustmentReportClient(), InventoryReportClient(), ShipmentReportClient(), UsageReportClient(), ExportButtons(), ExportButtonsProps, AdjustmentRow, exportAdjustmentExcel() (+10 more)

### Community 9 - "Lint & Package Config"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 10 - "Dashboard Charts"
Cohesion: 0.11
Nodes (19): DashboardPage(), ShipmentTimelineChart(), ShipmentTimelineData, ConsumptionData, StockConsumptionChart(), StatusData, StockStatusChart(), BAR_COLORS (+11 more)

### Community 11 - "shadcn/ui Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "Shipment Actions"
Cohesion: 0.15
Nodes (15): createAndReceiveShipment(), createShipment(), deleteShipment(), ReceiveItemInput, renameShipment(), updateShipment(), EditShipmentPage(), NewShipmentPage() (+7 more)

### Community 13 - "Shipment Receiving & Activity Log"
Cohesion: 0.15
Nodes (16): receiveShipmentVerified(), ReceiveShipmentPage(), ACTION_LABELS, ActivityLogFilters(), ActivityLogFiltersProps, Props, ReceivedState, ReceiveForm() (+8 more)

### Community 14 - "PostHog Integration Guide"
Cohesion: 0.24
Nodes (17): PostHog Setup - Begin, PostHog Setup - Edit, PostHog Setup - Revise, PostHog Setup - Conclusion, posthog.capture(), Next.js PostHog Framework Rules (COMMANDMENTS), PostHog Next.js App Router Example Project, instrumentation-client.ts (+9 more)

### Community 15 - "Product Actions & Validation"
Cohesion: 0.18
Nodes (15): addVariableRolls(), togglePhaseOut(), AddRollsForm(), AddPieceBatchFormData, addPieceBatchSchema, AddRollsFormData, addRollsSchema, AddVariableRollsFormData (+7 more)

### Community 16 - "Admin & User Management"
Cohesion: 0.29
Nodes (10): saveAdminSettings(), changeUserRole(), initiatePasswordReset(), ROLE_HIERARCHY, toggleUserActive(), AdminSettingsForm(), UserManagementActions(), UserManagementActionsProps (+2 more)

### Community 17 - "Adjustment/Bride Actions & PostHog Server"
Cohesion: 0.25
Nodes (6): getProductAdjustmentsPage(), updateBride(), AdjustmentFormData, adjustmentSchema, BrideFormData, brideSchema

### Community 18 - "Inventory Mutation Actions"
Cohesion: 0.20
Nodes (10): addPieceBatch(), addRolls(), createProduct(), updateProduct(), cancelShipment(), receiveShipment(), uploadProductImage(), AddPiecesForm() (+2 more)

### Community 19 - "Supplier Actions"
Cohesion: 0.27
Nodes (6): createSupplier(), toggleSupplierActive(), updateSupplier(), SupplierForm(), SupplierFormData, supplierSchema

### Community 20 - "Usage Tracking Actions"
Cohesion: 0.31
Nodes (7): getProductUsagePage(), logUsage(), logUsageBatch(), updateUsage(), EditUsageForm(), UsageFormData, usageSchema

### Community 21 - "Vercel Deployment Config"
Cohesion: 0.25
Nodes (7): sin1, buildCommand, framework, headers, installCommand, outputDirectory, regions

### Community 22 - "3D Flower Import Script"
Cohesion: 0.39
Nodes (7): create_product(), get_3d_flower_category_id(), main(), product_exists(), Script to add 3D Flower products to the D'Aisle inventory database. Can be run…, Download from S3 and upload to Supabase storage. Returns public URL or None., upload_image()

### Community 23 - "Bride Import Script"
Cohesion: 0.40
Nodes (3): clean_unicode(), normalize_phone(), Strip invisible/directional unicode chars.

### Community 24 - "Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): manrope, metadata, notoSerif

### Community 25 - "Auth Middleware"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

## Knowledge Gaps
- **194 isolated node(s):** `This is NOT the Next.js you know`, `graphify`, `Getting Started`, `Learn More`, `Deploy on Vercel` (+189 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `API Routes & Health Checks` to `Dashboard Detail Pages`, `Server Actions - CRUD Operations`, `Dashboard Layout Components`, `Dashboard Charts`, `Shipment Actions`, `Shipment Receiving & Activity Log`, `Product Actions & Validation`, `Admin & User Management`, `Adjustment/Bride Actions & PostHog Server`, `Inventory Mutation Actions`, `Supplier Actions`, `Usage Tracking Actions`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `cn()` connect `UI Components (Avatar/Forms)` to `Dashboard Detail Pages`, `Server Actions - CRUD Operations`, `Dashboard Layout Components`, `Dashboard Charts`, `Shipment Receiving & Activity Log`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Button()` connect `Server Actions - CRUD Operations` to `Dashboard Detail Pages`, `UI Components (Avatar/Forms)`, `API Routes & Health Checks`, `Report Client Components`, `Shipment Actions`, `Shipment Receiving & Activity Log`, `Admin & User Management`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `This is NOT the Next.js you know`, `graphify`, `Getting Started` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard Detail Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.10057471264367816 - nodes in this community are weakly interconnected._
- **Should `Server Actions - CRUD Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.06450617283950617 - nodes in this community are weakly interconnected._
- **Should `UI Components (Avatar/Forms)` be split into smaller, more focused modules?**
  _Cohesion score 0.05480225988700565 - nodes in this community are weakly interconnected._