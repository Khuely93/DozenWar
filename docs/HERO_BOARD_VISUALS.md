# DW-STYLE-01 compact Hero board visuals — v1.66.0

The user approved all twelve compact Hero designs and requested replacement
in game. All twelve Heroes resolve their token by Hero definition ID to a
separate transparent figure matching the approved compact soldier art direction.
Portrait crops in team selection and the Hero dock keep their existing source art.

## Assets

- Each `*-compact-dw-style-01-board.webp` is 512 × 512 with an alpha channel.
- The approved compact PNGs are exported at WebP quality 90, without redrawing.
  Broader silhouettes, simple armor planes and large signature equipment
  improve readability at game scale. Hero identities and palettes are retained.
- Previous 2:3 board files remain as inactive references; new paths avoid
  reusing browser cache entries for the old images.
- The board uses one static pose per Hero. No movement or attack animation and
  no automatic directional rotation is implied by these illustrations.
- Mask has a halberd, Soul a great dao, Siri twin dao; all three retain their horse.
- Raen retains two heads on one body. Lucy keeps her palm-held arrow and back
  bow case, Raen the filled bolt quiver, and Neuro the back book and potion grip.
- The artwork manifest records approved PNG names/hashes, board paths/output
  checksums and previous board assets. Original portrait hashes are preserved.

## Presentation and interaction

Hero token metadata controls size and anchor. Standing Heroes occupy 100 world
units in height; mounted Heroes use 114. All canvases are square, with
the foot/hoof anchor at 96% of the image height, matching the approved preview.
Figures are rendered from back rows to front rows without mutating unit state.

The existing colored team ring, HP, moved/completed action badges and incoming
attack/Guard highlights remain separate layers. Images do not intercept pointers;
the Hero hit region and the existing Core input routing handle clicks and drag.
An image load failure reveals the existing Hero initials as a selectable fallback.
Troop sprites and all Core/Mode mechanics remain unchanged.

## Verification

- `npm run build`: validation, gameplay and production-asset checks pass.
- `npm run test:hero-board-browser`: Chromium integration checks served from the
  production build under a `/DozenWar/` URL prefix.
- All twelve board sprites decode at 512 × 768, contain transparent background,
  have transparent corners and use the correct Hero asset, ring and HP.
- Real mouse selection of all twelve Heroes, movement and its badge, an attack,
  Guard redirection, damage resolution, completed-action badge and end turn pass.
- Deployment drag preserves the Core hex coordinates. Image-error fallback is
  selectable. Desktop, laptop and mobile screenshots are inspected.
- No unexpected JavaScript or HTTP errors occur in the integration run.
- Gameplay hashes match the previous release: Duel `fnv1a32:5873bec7`,
  Training `fnv1a32:3566a068`.

Browser checks require Playwright and Chromium, like the other browser tests in
this repository. `DOZEN_BROWSER_EXECUTABLE` can select the browser binary. Screenshots
and the QA report are written to the untracked `work/hero-board/` directory.
