# DOZEN WAR II v1.38 — Foundation Stabilization

## Changes from v1.37

- Combined the three turn reset wrappers into a single `resetTurnFlags` implementation.
- Clamped Pierce and line Skill HP to zero after lethal damage.
- Reworded the Bot difficulty labels to describe its current heuristic choices.
- Added deterministic tests for reset, Pierce, line Skill, Guard, and lethal Reflect.
- Made the production build run all three checks before bundling.

## Verification

- `npm run validate`: 101/101 PASS.
- `npm run test:content-readiness`: 22/22 PASS.
- `npm run test:gameplay`: 6/6 PASS.
- `npm run build`: PASS.
- Static server: HTTP 200 for HTML, runtime JS, CSS, and board image.

The gameplay tests execute source functions with controlled state; they are not a full match playthrough. No interactive browser run was available in this environment. The AI combat and defense wrappers, other legacy globals, UI/Core coupling, and the partial Action Dispatcher remain to be addressed in later slices.

Use `npm run dev` to run the source project locally or `npm run preview` to serve `dist/`. Requires Node.js 18 or newer and no external npm packages.
