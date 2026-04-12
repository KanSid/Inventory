# Graph Report - .  (2026-04-12)

## Corpus Check
- 107 files · ~33,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 204 nodes · 318 edges · 16 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `getAdminUser()` - 4 edges
2. `isUuid()` - 2 edges
3. `resolveDetailValue()` - 2 edges
4. `changeUserRole()` - 2 edges
5. `toggleUserActive()` - 2 edges
6. `initiatePasswordReset()` - 2 edges

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
Cohesion: 0.1
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (4): changeUserRole(), getAdminUser(), initiatePasswordReset(), toggleUserActive()

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (0): 

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
- **Thin community `Community 12`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `loading.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._