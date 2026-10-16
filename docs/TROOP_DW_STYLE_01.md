# DW-STYLE-01 soldier board visuals

The user approved the infantry (sword and shield), cavalry (mounted, diagonal
upward spear) and hooded crossbowman designs, then authorized integration of
their red, blue, yellow and gray variants.

The twelve transparent WebP board figures live in `assets/troops-dw-style-01/`.
The artwork manifest records source illustration and cutout filenames and hashes,
dimensions and the shipped WebP hashes. Neutral gray illustration backgrounds
and ground shadows are removed before resizing to 512 × 768.

Existing faction mapping remains: side 1 blue, side 2 red, side 3 gold/yellow,
side 4 silver/gray. `visualFaction` remains a presentation-only override; `gray`
also resolves to `silver`. Four colors are available without changing the
current two-side game modes or adding players. Each faction skin uses one
static pose, regardless of legacy `visualView` values. Older `troops-v3` files
remain as references and are no longer selected by the renderer.

Foot soldiers use an 86-unit-high frame, cavalry 98, at a shared ground anchor.
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
