# Graph Report - .  (2026-04-11)

## Corpus Check
- 106 files · ~33,011 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 197 nodes · 310 edges · 15 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `getAdminUser()` - 4 edges
2. `changeUserRole()` - 2 edges
3. `toggleUserActive()` - 2 edges
4. `initiatePasswordReset()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (0): 

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (0): 

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (4): changeUserRole(), getAdminUser(), initiatePasswordReset(), toggleUserActive()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.29
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

## Knowledge Gaps
- **Thin community `Community 12`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._