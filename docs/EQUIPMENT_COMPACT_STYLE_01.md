# Compact equipment card artwork — v1.68.0

All 30 equipment designs use the user-approved card artwork matching the
compact Hero and soldier visual direction. Lao Móc and the remaining 29 cards
share broad angular planes, dark contours, cel shadows and a gold frame.

## Assets and integration

- `assets/equipment-compact-dw-style-01/manifest.json` records the approved
  source PNG and exported WebP hashes, dimensions, category and star count.
- The exports preserve the full 1024 × 1536 composition without cropping.
- Infantry frames are red, archers green, cavalry gray, common equipment blue.
- Each catalog entry's `visual.card` in `src/content/content-runtime.js` points
  to its own WebP. Existing `CARD_FULL` rendering covers dealing, team selection,
  dock hands and equipment selection panels without an additional UI layer.
- Four-star counts were corrected in the reviewed artwork for Khiên Ma Thuật,
  Lưới Sắt, Đánh Cắp and Thích Khách before integration.
- Original PNG drafts remain outside the runtime assets. Previous card art
  remains available at its original paths.

## Verification

The production build runs the project's validation and regression gates.
Browser verification checks all 30 registered images decode at 1024 × 1536,
production bytes match the asset manifest, the deal screen renders ten cards,
the battle dock renders five cards and clicking Lao Móc selects that card.
Desktop and mobile screenshots are retained in the local work directory.

Every nonvisual equipment property is compared with the previous release.
Gameplay compatibility hashes must remain unchanged for Duel and Training;
card effects, quantities, star values and rules are not modified.

Verified compatibility: Duel `fnv1a32:5873bec7`, Training `fnv1a32:3566a068`.
The browser check found no JavaScript errors or failed asset requests.
The 30 WebP files total 8,751,932 bytes.
