# DW-STYLE-01 transparent UI pack — v1.75.0

The live UI uses **53 individual RGBA PNGs** under `png/`: 26 frames,
15 button states and 12 ornaments. PNGs contain real transparent pixels outside
the silhouette. Dark stone panel interiors and colored button faces stay filled.
There is no checkerboard baked into the images, and no printed sample labels.

The approved original boards remain unchanged in the archive. Image editing was
used to remove their exterior backgrounds and labels, reconstruct blank surfaces,
and separate the center crest. These cleaned derivatives follow the originals;
they are not byte-identical extractions. `manifest.json` records edited source IDs,
export rectangles, dimensions, alpha counts and final SHA-256 digests.
`import-manifest.json` continues to verify the fourteen original concept boards.

`pack.js` references standalone PNG URLs and intrinsic dimensions. `concept-skins.js`
uses CSS border-image nine-slicing of each individual frame/button to retain corner
geometry at desktop and mobile sizes. The crest is a separate fixed-size PNG.
No live UI frame, button or ornament selects a window of a full concept board.
The reaction frame shares the equipment PNG; separate logical roles are retained.

All game labels, stats and controls remain live HTML. `pack-runtime.js` preserves
native handlers and adds the isolated logo, hub illustrations, result ornaments
and tab icons. The fortress scene is intentionally a full background image.
Existing Hero/troop art, equipment art and approved skill-icon sheets are separate
content assets and are unchanged by this UI-frame replacement.

Verification covers PNG integrity/alpha, no requests to UI concept sheets, button
states, desktop/mobile layouts, text layers, and actual online/offline game flows.
A public light/dark/checkerboard inspection page and a ZIP of all individual PNGs
are provided in `visual-previews/ui-png-dw-style-01/`.
