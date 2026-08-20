# Graph Report - d_aisle_inventory  (2026-08-19)

## Corpus Check
- 148 files · ~42,323 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 601 nodes · 1564 edges · 42 communities (32 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a08edef5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- categories-client.tsx
- card.tsx
- dependencies
- compilerOptions
- index.ts
- adjustments/client.tsx
- devDependencies
- createClient
- dashboard/page.tsx
- shipment-form.tsx
- components.json
- admin-settings-form.tsx
- actions/product.ts
- cn
- dropdown-menu.tsx
- next.config.ts
- add-rolls-form.tsx
- sheet.tsx
- actions/category.ts
- actions/supplier.ts
- actions/usage.ts
- products/[id]/edit/page.tsx
- vercel.json
- add_3d_flower_products.py
- import_brides.py
- actions/bride.ts
- app/layout.tsx
- tooltip.tsx
- src/middleware.ts
- README.md
- actions/adjustment.ts
- pieces/add/page.tsx
- products/page.tsx
- badge.tsx
- AGENTS.md
- CLAUDE.md
- eslint.config.mjs
- postcss.config.mjs
- test.sh

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 106 edges
2. `cn()` - 79 edges
3. `Card()` - 39 edges
4. `CardContent()` - 39 edges
5. `PageHeader()` - 33 edges
6. `Button()` - 33 edges
7. `formatDate()` - 30 edges
8. `CardHeader()` - 24 edges
9. `CardTitle()` - 22 edges
10. `formatQuantity()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `updateBride()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/bride.ts → src/lib/supabase/server.ts
- `togglePhaseOut()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/product.ts → src/lib/supabase/server.ts
- `addRolls()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/product.ts → src/lib/supabase/server.ts
- `receiveShipment()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/shipment.ts → src/lib/supabase/server.ts
- `cancelShipment()` --calls--> `createClient()`  [EXTRACTED]
  src/actions/shipment.ts → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (42 total, 10 thin omitted)

### Community 0 - "categories-client.tsx"
Cohesion: 0.08
Nodes (52): createAdjustment(), createBride(), receiveShipmentVerified(), ForgotPasswordPage(), LoginPage(), AdjustmentForm(), ProductRow, Props (+44 more)

### Community 1 - "card.tsx"
Cohesion: 0.12
Nodes (45): AdjustmentsPage(), BrideDetailPage(), ProductDetailPage(), AdjustmentReportPage(), ShipmentReportPage(), UsageReportPage(), ACTION_COLORS, ACTION_LABELS (+37 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (39): @base-ui/react, class-variance-authority, clsx, date-fns, @hookform/resolvers, jspdf, lucide-react, next (+31 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "index.ts"
Cohesion: 0.10
Nodes (24): DashboardLayout(), DashboardShell(), DashboardShellProps, adminItems, navItems, Sidebar(), SidebarProps, ActivityLog (+16 more)

### Community 5 - "adjustments/client.tsx"
Cohesion: 0.14
Nodes (18): AdjustmentReportClient(), InventoryReportClient(), ShipmentReportClient(), UsageReportClient(), ExportButtons(), ExportButtonsProps, AdjustmentRow, exportAdjustmentExcel() (+10 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 7 - "createClient"
Cohesion: 0.14
Nodes (15): GET(), GET(), runtime, NewAdjustmentPage(), BridesPage(), AddRollsPage(), InventoryReportPage(), ActivityLogPage() (+7 more)

### Community 8 - "dashboard/page.tsx"
Cohesion: 0.11
Nodes (18): DashboardPage(), ShipmentTimelineChart(), ShipmentTimelineData, ConsumptionData, StockConsumptionChart(), StatusData, StockStatusChart(), BAR_COLORS (+10 more)

### Community 9 - "shipment-form.tsx"
Cohesion: 0.13
Nodes (17): cancelShipment(), createAndReceiveShipment(), createShipment(), deleteShipment(), ReceiveItemInput, receiveShipment(), renameShipment(), updateShipment() (+9 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "admin-settings-form.tsx"
Cohesion: 0.20
Nodes (13): saveAdminSettings(), AdminSettingsPage(), changeUserRole(), initiatePasswordReset(), ROLE_HIERARCHY, toggleUserActive(), AdminConfig, AdminSettingsForm() (+5 more)

### Community 12 - "actions/product.ts"
Cohesion: 0.19
Nodes (14): addRolls(), togglePhaseOut(), AddPieceBatchFormData, addPieceBatchSchema, AddRollsFormData, addRollsSchema, AddVariableRollsFormData, addVariableRollsSchema (+6 more)

### Community 13 - "cn"
Cohesion: 0.18
Nodes (14): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction(), CardFooter() (+6 more)

### Community 14 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 16 - "add-rolls-form.tsx"
Cohesion: 0.20
Nodes (12): addVariableRolls(), AddRollsForm(), Props, SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton() (+4 more)

### Community 17 - "sheet.tsx"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 18 - "actions/category.ts"
Cohesion: 0.29
Nodes (7): createCategory(), deleteCategory(), updateCategory(), CategoriesPage(), CategoriesClient(), CategoryFormData, categorySchema

### Community 19 - "actions/supplier.ts"
Cohesion: 0.27
Nodes (6): createSupplier(), toggleSupplierActive(), updateSupplier(), SupplierForm(), SupplierFormData, supplierSchema

### Community 20 - "actions/usage.ts"
Cohesion: 0.27
Nodes (7): logUsage(), logUsageBatch(), updateUsage(), EditUsagePage(), EditUsageForm(), UsageFormData, usageSchema

### Community 21 - "products/[id]/edit/page.tsx"
Cohesion: 0.22
Nodes (6): createProduct(), updateProduct(), uploadProductImage(), EditProductPage(), NewProductPage(), ProductForm()

### Community 22 - "vercel.json"
Cohesion: 0.25
Nodes (7): sin1, buildCommand, framework, headers, installCommand, outputDirectory, regions

### Community 23 - "add_3d_flower_products.py"
Cohesion: 0.39
Nodes (7): create_product(), get_3d_flower_category_id(), main(), product_exists(), Script to add 3D Flower products to the D'Aisle inventory database. Can be run…, Download from S3 and upload to Supabase storage. Returns public URL or None., upload_image()

### Community 24 - "import_brides.py"
Cohesion: 0.40
Nodes (3): clean_unicode(), normalize_phone(), Strip invisible/directional unicode chars.

### Community 25 - "actions/bride.ts"
Cohesion: 0.60
Nodes (3): updateBride(), BrideFormData, brideSchema

### Community 26 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): manrope, metadata, notoSerif

### Community 28 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 29 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 31 - "pieces/add/page.tsx"
Cohesion: 0.50
Nodes (3): addPieceBatch(), AddPiecesPage(), AddPiecesForm()

## Knowledge Gaps
- **168 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `categories-client.tsx`, `card.tsx`, `products/page.tsx`, `index.ts`, `dashboard/page.tsx`, `shipment-form.tsx`, `admin-settings-form.tsx`, `actions/product.ts`, `add-rolls-form.tsx`, `actions/category.ts`, `actions/supplier.ts`, `actions/usage.ts`, `products/[id]/edit/page.tsx`, `actions/bride.ts`, `actions/adjustment.ts`, `pieces/add/page.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `categories-client.tsx`, `card.tsx`, `badge.tsx`, `index.ts`, `dashboard/page.tsx`, `dropdown-menu.tsx`, `add-rolls-form.tsx`, `sheet.tsx`, `tooltip.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `Button()` connect `categories-client.tsx` to `card.tsx`, `adjustments/client.tsx`, `createClient`, `shipment-form.tsx`, `admin-settings-form.tsx`, `cn`, `add-rolls-form.tsx`, `sheet.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `categories-client.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07567567567567568 - nodes in this community are weakly interconnected._
- **Should `card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11834094368340943 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._