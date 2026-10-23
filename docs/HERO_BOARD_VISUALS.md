# DW-STYLE-01 Hero board visuals — v1.71.1

All twelve approved Heroes now use six directional board drawings. The shared
catalog and SVG atlas renderer in `assets/heroes-camera-06/` are used by both
the offline and online clients. Portraits in team selection and Hero information
keep their existing artwork. Blue/red soldiers use the new matching overhead pair sheet; see `TROOP_DW_STYLE_01.md`.

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

The camera is fixed above the board. Side 1 is blue and shows the back of its
Hero and soldiers; side 2 is red and shows the front. This rule also applies to
the online client, which previously reversed those two faction colors. Movement,
attacks, Guard, crossing the board, reloads and reconnects never change the pose.
The former automatic movement/target facing controller has been removed.

Hero game rendering selects only the front/back crops from the existing six-view
set. All six source views remain available for art review; no diagonal or legacy
`visualFacing`/`visualView` value overrides the game's fixed team view. The troop
renderer uses matching real back/front illustrations, not mirrored front art.

Facing is a pure presentation choice. Authoritative unit state, rules, protocol,
gameplay hashes and server engine code hash are unchanged. HP, team rings, action
indicators and click/drag regions remain separate layers. Failed atlas loads fall
back to previous static art, then selectable initials if both images fail.

## Verification

- `npm run build`: gameplay gates, directional metadata and production bytes.
- `npm run test:hero-facing`: all 72 Hero crops, six new troop crops, fixed team facing and immutable inputs.
- `npm run test:hero-board-browser`: all twelve Heroes, all six poses, transparent
  image decoding, selection, foot anchors, movement, attack/Guard resolution,
  end turn, image failure and deployment drag under the `/DozenWar/` URL prefix.
- `npm run test:online-browser`: two independent browser seats, new atlas loads,
  combat, server restart during defense, reconnect and movement. Team facing is
  checked on both clients before, during and after combat.

Browser screenshots and reports are written under ignored `work/` directories.
Gameplay hashes: Duel `fnv1a32:5873bec7`, Training `fnv1a32:3566a068`.
