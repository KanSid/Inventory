# Graph Report - .  (2026-06-10)

## Corpus Check
- 115 files · ~39,245 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 226 nodes · 352 edges · 16 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `main()` - 5 edges
2. `upload_image()` - 3 edges
3. `clean_unicode()` - 3 edges
4. `get_3d_flower_category_id()` - 2 edges
5. `product_exists()` - 2 edges
6. `create_product()` - 2 edges
7. `normalize_phone()` - 2 edges
8. `isUuid()` - 2 edges
9. `resolveDetailValue()` - 2 edges
10. `formatLength()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (2): isUuid(), resolveDetailValue()

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (2): formatLength(), formatQuantity()

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.39
Nodes (7): create_product(), get_3d_flower_category_id(), main(), product_exists(), Script to add 3D Flower products to the D'Aisle inventory database. Can be run m, Download from S3 and upload to Supabase storage. Returns public URL or None., upload_image()

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (3): clean_unicode(), normalize_phone(), Strip invisible/directional unicode chars.

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **3 isolated node(s):** `Script to add 3D Flower products to the D'Aisle inventory database. Can be run m`, `Download from S3 and upload to Supabase storage. Returns public URL or None.`, `Strip invisible/directional unicode chars.`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (2 nodes): `loading.tsx`, `ReportsLoading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Script to add 3D Flower products to the D'Aisle inventory database. Can be run m`, `Download from S3 and upload to Supabase storage. Returns public URL or None.`, `Strip invisible/directional unicode chars.` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._