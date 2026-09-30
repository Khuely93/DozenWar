# CONTENT — Part 13.2 extracted runtime

This directory now owns the executable Content layer extracted from the v1.25/v1.26 legacy runtime without gameplay changes.

## Runtime file
- `content-runtime.js`

It currently owns:
- canonical content IDs and definitions
- Hero / Unit / Skill / Equipment / Deck registries
- Effect / Status / Asset registries
- localization and content views
- runtime instance schema and deck runtime builder
- content packs and schema validation
- gameplay/presentation manifests and compatibility handshake
- match content snapshots
- persistence/content migration and historical content resolution
- temporary compatibility adapters (`HEROES`, `TROOPS`, `CARDS`); HEROES is retained for backward compatibility but no longer consumed by the playable Hero runtime

## Boundary
CONTENT may expose definitions, registries, validators, views, snapshots, and migration contracts. CONTENT must not resolve combat, movement, targeting, turn flow, victory, DOM rendering, or network transport.

## Temporary compatibility
Part 13.2 still uses classic ordered scripts rather than ES modules. Load order is intentionally:
1. `legacy-prelude.js` — existing shared/Core/Mode prerequisites that have not been extracted yet
2. `content-runtime.js` — extracted Content layer
3. `legacy-runtime.js` — remaining gameplay/UI runtime

This preserves the exact executable source ordering while extraction proceeds incrementally.
