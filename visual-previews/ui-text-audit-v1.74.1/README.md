# UI text and layer review · v1.74.1

78 UI states at four viewports (312 checks), Chromium, DPR 1. The 72 reference scenarios include local online rooms, plus six in-game menu, confirmation, Hero info and dock-tab states.

Fixed: clock/action notice collisions; skill chooser headings obscured by status; defense skills/log/action panel collisions; training controls over the match header and mobile tabs; online confirmation buttons covered by tabs; overly blurred small button text.

All raster artwork is unchanged. Original browser screenshots are copied without editing. The selected eight images are examples; report.json lists all measured states. The check targets HTML interface text and layers; normal modal coverage, SVG world labels and scroll clipping are excluded. Names and actions retain their original game handlers.

Reproduce: npm run build && npm run test:ui-text. Full functional UI and online browser suites also pass.
