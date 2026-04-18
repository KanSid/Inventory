# Graph Report - src  (2026-04-17)

## Corpus Check
- Corpus is ~25,149 words - fits in a single context window. You may not need a graph.

## Summary
- 203 nodes · 322 edges · 15 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `isUuid()` - 2 edges
2. `resolveDetailValue()` - 2 edges
3. `formatLength()` - 2 edges
4. `formatQuantity()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Activity Log & Admin UI"
Cohesion: 0.07
Nodes (2): isUuid(), resolveDetailValue()

### Community 1 - "Rolls Inventory Forms"
Cohesion: 0.11
Nodes (0): 

### Community 2 - "UI Primitive Components"
Cohesion: 0.11
Nodes (2): formatLength(), formatQuantity()

### Community 3 - "Adjustment Export & Reporting"
Cohesion: 0.1
Nodes (0): 

### Community 4 - "Button & Dialog Primitives"
Cohesion: 0.14
Nodes (0): 

### Community 5 - "Bride Management & Auth"
Cohesion: 0.15
Nodes (0): 

### Community 6 - "Adjustment Operations"
Cohesion: 0.17
Nodes (0): 

### Community 7 - "Client Page Components"
Cohesion: 0.2
Nodes (0): 

### Community 8 - "Admin Server Actions"
Cohesion: 0.2
Nodes (0): 

### Community 9 - "Category Management"
Cohesion: 0.22
Nodes (0): 

### Community 10 - "Dashboard Layout & Shell"
Cohesion: 0.29
Nodes (0): 

### Community 11 - "Supplier Management"
Cohesion: 0.38
Nodes (0): 

### Community 12 - "Shipment Management"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Loading States"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Entry Point"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Loading States`** (2 nodes): `loading.tsx`, `ReportsLoading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Entry Point`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Activity Log & Admin UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Rolls Inventory Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `UI Primitive Components` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Adjustment Export & Reporting` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Button & Dialog Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._