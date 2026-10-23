# DW-STYLE-01 Hero board visuals — v1.71.0

All twelve approved Heroes now use six directional board drawings. The shared
catalog and SVG atlas renderer in `assets/heroes-camera-06/` are used by both
the offline and online clients. Portraits in team selection and Hero information
keep their existing artwork. Soldier visuals are unchanged by this release.

## Approved assets

The source reviews are `visual-previews/heroes-camera-06/sheets/`. Production
sheets have transparent backgrounds and are encoded as WebP at quality 90,
alpha quality 100, at their original 1024 × 1536 resolution. Each sheet contains
two columns and three rows: front/back, front+45/back+45, front−45/back−45.
The production manifest records source checksums, output checksums, per-pose
crop bounds and foot anchors. Hashes in filenames prevent stale image caches.

The SVG renderer clips individual poses from the atlas without additional
downloads or horizontal mirroring. All poses of one Hero share a scale. Standing
Heroes use a 100-unit frame; mounted Heroes use 114. Each pose places its foot
anchor at the unit's board center plus 18 world units vertically. Weapons may
extend outside the frame; the source crop retains their tips.

## Direction and interaction

Side 1 initially faces upward (back); side 2 faces downward (front). Movement
and pending attacks turn the figure toward the move or target, including Guard
redirection. Hex coordinate deltas are projected into board coordinates first.
There are no exact east/west images in the approved six-view set: horizontal
ties select the nearest diagonal in the previous front/back hemisphere.

Facing is cosmetic, tracked separately from authoritative units. A fresh online
connection starts from default directions, or the pending attack if present;
facing is not persisted on the server. These are discrete poses, not animations.
The rules, network protocol, gameplay hashes and server engine code hash remain
unchanged. HP, team rings, action indicators and existing click/drag regions
remain separate layers. A failed atlas load falls back to the previous static
Hero art; if that also fails, selectable Hero initials remain.

## Verification

- `npm run build`: gameplay gates, directional metadata and production bytes.
- `npm run test:hero-facing`: all 72 crops, movement, Guard, reset and immutable inputs.
- `npm run test:hero-board-browser`: all twelve Heroes, all six poses, transparent
  image decoding, selection, foot anchors, movement, attack/Guard resolution,
  end turn, image failure and deployment drag under the `/DozenWar/` URL prefix.
- `npm run test:online-browser`: two independent browser seats, new atlas loads,
  combat, server restart during defense, reconnect and movement.

Browser screenshots and reports are written under ignored `work/` directories.
Gameplay hashes: Duel `fnv1a32:5873bec7`, Training `fnv1a32:3566a068`.
