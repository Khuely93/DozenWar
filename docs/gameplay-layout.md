# Duel gameplay layout v1.40.21

Layout prototype; current game artwork retained. No camera transform added.

| Viewport | Status | Map region | Bottom dock |
|---|---:|---:|---:|
| 1920 × 1080 | 64 px | 756 px | 260 px |
| 1366 × 768 | 48 px | 530 px | 190 px |

The map image and SVG remain the same square, centered in the map region. On Full HD their size is 756 × 756 px; on laptop 530 × 530 px. Empty space on either side is intentional while retaining the original map aspect ratio and hex coordinates.

Dock height interpolates from 190 to 260 px across viewport heights 768–1080. Hero/Skill/Card column fractions: 23/33/44 of available width after padding and gaps. Padding/gap 16 px (12 on short desktop). Each group can scroll internally; equipment scrolls horizontally. Skill buttons keep original gameplay event handlers. Portrait uses the existing unit glyph pending approved artwork. Below 900 px width the dock stacks vertically and the page scrolls.

Editable CSS tokens: --duel-status-height, --duel-dock-height, --duel-hero-ratio, --duel-skill-ratio, --duel-card-ratio in styles/main.css. Dock height calculation: DuelBoardLayout.dockHeight in src/presentation/duel-board-layout-runtime.js.

Combat log and match summary are expandable over the map. End Turn remains in the status bar for this layout-only stage. Defense and result UI retain existing logic.

## v1.40.22 — Camera viewport
Map viewport fills the whole region above the dock. Backdrop covers its width; the square world and hexes preserve their proportions. Default zoom 140%, min 65%, max 260%. Wheel zoom anchors to pointer; buttons zoom around viewport center. Drag empty map or hold middle mouse to pan; Pan toggle permits dragging anywhere on the world. Deploy unit left drag retains its original placement behavior. Pan does not commit a click or a gameplay action. Reset returns default framing. Unit/deploy/attack/defense popups remain unscaled and follow transformed cells, clamped into viewport. A new offscreen reaction target is brought into view. Logical hex coordinates and core combat rules stay unchanged.
