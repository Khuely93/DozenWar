# Compact fortress arena — v1.67.0

The user approved the map preview alongside the compact Heroes and soldiers
and requested integration in the game. The original approved PNG is exported
to WebP quality 90 at its original 1672 × 941 dimensions, without redrawing.
`assets/map-gallery/map-compact-manifest.json` records its source/output hashes.

The existing `data-duel-src` and `data-backdrop-src` now select the same new
map asset, matching the reviewed preview. The camera dims its backdrop with
the existing CSS. Old map-gallery images remain as inactive references.
The legacy default image for other map policies is retained.

The artwork contains no gameplay grid. Core still renders the same 61 hexes
in its existing square frame, so map art cannot alter movement, range, deploy
zones or collision. Camera sizing, pan/zoom and input routing are unchanged.

Validation:

- `npm run build`: validation, gameplay compatibility and production bytes.
- `npm run test:map-browser`: production map decoding, 61 cells, desktop zoom
  and pan, mobile touch pan, and unit selection without JavaScript/HTTP errors.
- `npm run test:hero-board-browser`: movement, attack, Guard, damage, end turn
  and deployment drag with the new background.

Preview screenshots and browser reports are saved in untracked `work/` folders.
