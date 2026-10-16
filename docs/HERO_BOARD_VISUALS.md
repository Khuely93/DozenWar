# DW-STYLE-01 Hero board visuals — v1.63.0

The user approved applying the final Hero artwork to the board. All twelve Heroes
now resolve their token by Hero definition ID to a separate transparent cutout.
Portrait crops in team selection and the Hero dock keep their existing source art.

## Assets

- Each `*-dw-style-01-board.webp` is 512 × 768 with an alpha channel.
- Background removal was performed with the image editing tool on the latest
  approved final image, followed by a WebP size/format export for game delivery.
- The board uses one static pose per Hero. No movement or attack animation and
  no automatic directional rotation is implied by these illustrations.
- Mask has a halberd, Soul a great dao, Siri twin dao; all three retain their horse.
- Raen retains two heads on one body. Lucy, Raen and Neuro use the corrected
  arrow, bolt-quiver and potion-hand revisions as their cutout source.
- The artwork manifest records the cutout source, board path and output checksums.

## Presentation and interaction

Hero token metadata controls size and anchor. Standing Heroes occupy 100 world
units in height; mounted Heroes use 114. All canvases keep 2:3 proportions, with
the foot/hoof anchor at 98% of the image height, placed at the same cell offset.
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
