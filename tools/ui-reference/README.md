# UI reference exporter

Documentation tooling for the v1.71.1 game. The offline fixtures invoke existing
renderers in an isolated browser; the online fixtures use a temporary FileStore
and real room commands on a local server. No live rooms or game source are edited.

Requirements: project dev dependencies, Chromium, Python 3 for ZIP packaging.
Use `CHROMIUM_PATH` to select a browser binary. The controlled capture context
bypasses the local server CSP only to disable animations in the test page.

The capture uses browser DOM border boxes at DPR 1. PNG dimensions are verified
independently from their headers. CSV and SVG labels retain measurements rounded
to 0.01 CSS px. Clipping and transformed world geometry are recorded separately.
Individual frame SVGs have exactly the measured width and height; measured PNGs
include annotation margins outside those frames. Full-page diagrams mark the
first viewport fold, so mobile scrolling is explicit.

See `visual-previews/ui-reference-v1.71.1/README.md` for commands. `--only 01,02`
can limit a capture; `--append` retains other previously captured states.
Repackage after appending. `repaint.cjs <directory>` regenerates diagrams from
saved measurements and source PNGs without reopening game scenarios.

`verify.cjs` checks both viewport sets, all 72 scenarios in each, required UI
families, actual raster dimensions, crop bounds, frame templates and static
UI-anchor coverage. The two unrendered legacy anchors are explicitly reported.

The large reference output is excluded from the production Docker context.

## UI text and stacking checks

`npm run test:ui-text` reviews the 72 reference states plus six game-menu, confirmation, Hero-info and dock-tab states at 1920×1080, 1366×768, 390×844 and 844×390. It uses real local online rooms and Playwright clicks, and writes original screenshots, an HTML review index and measured text/layer findings under `work/ui-text-audit/review/`.

The checks cover rendered HTML text intersections, text escaping controls, covered actions, conflicting notice/popup regions, horizontal overflow and duplicate visible artwork states. Deliberately covered modal backgrounds, SVG world labels, normal scroll clipping and font descender edges are excluded. The original artwork also requires visual review: DOM measurements cannot recognize words printed into a raster image.

Representative screens and any failures are captured by default; `--capture-all` saves every state.

Use `--only=25,31,online` or `--widths=390,844` after the script name for focused reruns. Build `dist/` first and keep it unchanged during a run.

After fixing a finding, `--resume --only=31,35` retains passing records from the same release, automatically reruns every failed scenario, and refreshes the explicitly named scenarios. Use a full run after broad layout changes.
