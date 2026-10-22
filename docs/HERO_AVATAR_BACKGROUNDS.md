# Hero avatars with individual backgrounds — v1.69.0

The approved square avatar series replaces the previous crops from full-body
art in team selection and the Hero information dock. Each portrait preserves
the Hero's own face, palette and equipment motifs. Backgrounds are visual
interpretations of the existing skill themes, not new canonical biography.

| Hero | Background |
| --- | --- |
| Kazu | Stone fortress, iron chains and dragon relief |
| Rodoc | Infantry war camp and battered standards |
| EST | Eastern fortress passage in the wind |
| Mask | Judgment courtyard and balance-scale monument |
| Soul | Haunted ruins and spectral mist |
| Siri | Windswept mountain pass |
| Xacnas | Rocky canyon and ruined watchtower |
| Lucy | Misty ancient forest |
| Raen | Frost-covered woodland valley |
| Neuro | Alchemical study, books and flasks |
| Grim | Transmutation workshop and tarnished mirror |
| Ranus | Obsidian hall, portal arch and fire |

## Assets and display

- Each `assets/heroes/{class}/{hero}-avatar-background-dw-style-01.webp` is
  exported from the approved PNG to 1024 × 1024 at WebP quality 90, without crop.
- The existing artwork manifest records each avatar's source/output hashes,
  dimensions, bytes and background theme in its `avatar` entry.
- Portrait asset IDs remain stable; their image sources select the new avatars.
- Both UI views use the same `HeroPortrait` helper and a square frame with
  `object-fit: contain`. The old 3:4 crop offsets are removed from the runtime.
- Raen keeps both heads in one image. Full crown and helmet silhouettes remain
  visible. Image loading failures retain the existing text/glyph fallback.
- Full-body references, compact board sprites, troops, map and equipment are
  separate assets and retain their existing files and registrations.

## Verification

Run `npm run build` for the project's validation, gameplay and production gates.
Browser checks against the production build under `/DozenWar/` verify all twelve
picker images and twelve dock images decode at 1024 × 1024, square framing,
all twelve real picker selections, glyph fallback, desktop/mobile layouts and
no JavaScript or failed asset requests. Export hashes and production bytes are
compared with the manifest. Gameplay hashes are compared with the previous
release for Duel and Training; equipment and nonvisual Hero data are unchanged.

Verified results: 12 picker images, 12 dock images and 12 real picker clicks;
square desktop/mobile frames and both image-error fallbacks pass. No JavaScript
errors or failed asset requests. The avatar WebP payload is 3,134,744 bytes.
Compatibility hashes remain Duel `fnv1a32:5873bec7` and Training
`fnv1a32:3566a068`.
