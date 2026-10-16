# DW-STYLE-01 soldier board visuals

From v1.65.0 the user approved new compact designs specifically for the board,
replacing the detailed full-body illustrations. Infantry keeps its sword and
shield, cavalry the mounted diagonal spear, and the hooded crossbowman its nỏ.
The approved blue originals are retained without redrawing; red, yellow and
gray skins are color edits of each approved original.

The twelve transparent WebP board figures live in
`assets/troops-compact-dw-style-01/`. The artwork manifest records source image
filenames, approved base image hashes, dimensions and shipped WebP hashes.
Images use a square 512 × 512 canvas, broad team-color areas, simplified armor
and heavy contours for readability at small board sizes. The previous
`troops-dw-style-01` and `troops-v3` files remain as inactive references.

Existing faction mapping remains: side 1 blue, side 2 red, side 3 gold/yellow,
side 4 silver/gray. `visualFaction` remains a presentation-only override; `gray`
also resolves to `silver`. Four colors are available without changing the
current two-side game modes or adding players. Each faction skin uses one
static pose, regardless of legacy `visualView` values.

Foot soldiers use an 86-unit square frame, cavalry 98, with a .96 ground anchor
matching the approved in-game comparison.
Hero frames stay at 100/114. Images ignore pointer events, retain click and drag
regions, and reveal the existing unit glyph on image failure. Team rings, HP,
action badges, attack targeting and Core rules remain independent of artwork.

Verification:

- `npm run build`: content, gameplay, input/visual and production checks.
- `DOZEN_BROWSER_EXECUTABLE=/usr/bin/chromium npm run test:browser-smoke`:
  all twelve skins decode, transparent corners and foot anchors, real clicks,
  team rings/HP, image-failure glyph and desktop/mobile screenshots.
- `npm run test:hero-board-browser`: Hero visuals, movement, attack, Guard,
  damage, turn transition and deployment drag continue to work.
