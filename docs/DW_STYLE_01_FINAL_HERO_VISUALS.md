# DW-STYLE-01 — approved Hero artwork

The user approved the latest twelve Hero illustrations on 2026-10-16.
The image selected for each Hero, its original PNG SHA-256, and the shipped
WebP SHA-256 are recorded in `assets/heroes/dw-style-01-manifest.json`.

## Shared art direction

- Hand-drawn black contours with varied thickness, angular shapes and grouped shadows.
- Muted colors, matte materials and selective wear; each Hero keeps their own identity.
- Full body, 1024 × 1536 (2:3), gray background, no text or logo.
- Final PNGs are encoded as WebP at quality 90 for the game, without cropping or redrawing.

## Approved revisions

| Hero | Final visual |
| --- | --- |
| Kazu | Short hair, red scarf, dragon shield and hooked chain. |
| Rodoc | Long hair, braided beard, beast pauldron and sword. |
| Est | Asymmetric short hair and armor, curved sword. |
| Mask | Mounted, **halberd**; supersedes the saber trial. |
| Soul | Mounted, **great dao**; supersedes the halberd trial. |
| Siri | Mounted, twin dao. |
| Xacnas | Short bow and belt-mounted throwing knives. |
| Lucy | Longbow and back-mounted bow case; corrected palm grip on the arrow. |
| Raen | Exactly two heads on one body, crossbow; hip case filled with bolts. |
| Neuro | Back-mounted book; corrected hand holding the potion flask. |
| Grim | Short magic wand, raised hood and belt-mounted potion bottles. |
| Ranus | Long magic staff. |

## Integration

The existing Hero portrait asset IDs now resolve to the approved artwork in
the team picker and Hero dock, including Training mode. Both views use
`object-fit: contain` so full-body art, weapons and horses stay within the image.
The taller team-picker image keeps the 2:3 aspect ratio.

Board tokens are independent assets. Existing initials, troop sprites and Lucy's
eight directional board sprites remain separate from portrait art. Gameplay
definitions, stats, skills and the strict gameplay compatibility hash are unchanged.

Original portrait PNGs remain in the repository as the previous identity reference;
the runtime selects only the new `*-dw-style-01.webp` portrait files.

## Verification

- `npm run build`: validation, content readiness, gameplay and production-asset gates pass.
- Production Chromium check under a `/DozenWar/` URL prefix: all 12 picker images and
  all 12 Hero dock images decode at 1024 × 1536, with no JavaScript or HTTP errors.
- Desktop 1920 × 1080, laptop 1366 × 768 and mobile 390 × 844 layouts inspected.
- Source and production copies match the SHA-256 values in the artwork manifest.
- Total approved WebP payload: 3,012,848 bytes.
- Strict gameplay hashes match the v1.61.0 baseline: Duel `fnv1a32:5873bec7`,
  Training `fnv1a32:3566a068`.
