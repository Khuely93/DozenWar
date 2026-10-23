# DW-STYLE-01 UI pack integration

The three ZIP archives supplied by the user contain fourteen concept boards,
not individually exported transparent controls. `import-manifest.json` records
every original PNG, its archive, original digest, runtime image digest, and size.
Each full board was converted to **lossless WebP**; decoded RGBA pixels were
compared byte-for-byte with the uploaded PNG before import.

`pack.js` maps source windows to components. `concept-skins.js` renders frames
as nine browser slices; text-free strips fill long edges and interiors so text
printed on a concept board never becomes a live game value. `pack-runtime.js`
adds illustrations/icons/previews around existing controls. `pack.css` implements
desktop/mobile layouts. Actual Hero identities, skills, cards, room readiness,
troop totals, eligibility, and outcomes continue to come from the game.

| Original board | Runtime use |
| --- | --- |
| Mode | Mode cards/buttons, logo, decorative scene edges |
| 01 Desktop HUD | Bottom dock, move/attack actions |
| 02 Hero / skills / equipment | Hero detail, Kazu skill symbols, equipment dialog |
| 03 Defense / results / dialogs | Defense panel, confirmation, result frames/crest |
| 04 Mobile ingame | Mobile dock frames and tab icons |
| 05 Play hub | Three mode illustrations and hub/card frames |
| 06 Online lobby / room | Lobby, room and readiness framing |
| 07 Ready / dice / deal | Setup frames and player/die boxes |
| 08 Hero / team selection | Team-selection frame, responsive roster/detail/troop layout |
| 09 Deployment | Deployment tray and context menu |
| 10 Special skills | Hero targeting/parameter panel and selected dice states |
| 11 Reactions / ranked | Equipment reactions and ranked-result frame |
| 12 Training / system kit | Training dialogs, live selection previews, common forms |
| 13 Mobile pregame | Mobile team/lobby frames and stacked setup layout |

Annotations, sample statistics, fictional item descriptions and UI-kit labels
from the boards are not game data. Concept strips outside the playable-screen
area are not shown as full-screen backgrounds. A responsive game is not claimed
to reproduce every pixel of a static board at all resolutions.

The gameplay/runtime compatibility hash remains unchanged. Visual verification
uses actual source/production browser captures and the offline/online UI suites.
