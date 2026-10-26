# DW-STYLE-01 UI — v1.75.2

The user approved applying the mode-selection, ingame and remaining UI concepts
to the game. The implementation uses the approved illustration language with
working HTML controls, rather than placing screenshots over the game.

## Surfaces

The three production images in assets/ui/dw-style-01 were generated from the
approved mode-screen reference: a blank gold/slate panel, an empty gold button
and a fortress backdrop. WebP encoding preserves their full source dimensions
and panel/button transparency. No Hero, soldier, card or map image was edited.
The image manifest records dimensions and SHA-256 checksums.

theme.css is shared by the root game and /online/. Panel borders use CSS
nine-slice rendering; button state/color treatments affect a decorative
pseudo-element, leaving live text readable. Disabled states, focus outlines,
reduced-motion preferences, keyboard tab navigation and native form semantics
remain available. The production build copies the shared assets unchanged.

## Implemented screens

- Mode selection and confirmation, Play Hub, AI difficulty, casual/ranked menus,
  room codes, matchmaking and waiting states.
- Ready check, dice and outcome, starting equipment, all 12 Hero choices,
  selected-Hero information, troop counts and formation confirmation.
- Deployment tray, placed/remaining counts, placement menus and completed state.
- Battle header, clocks, Hero/skills/equipment dock, combat log, targeting,
  special Hero choices and equipment selection.
- Defense, infantry Guard, counter-card, stealing and post-hit responses;
  warning/feedback surfaces and AI status.
- Win/lose/draw, ranked result text, room rematch states and restart/leave prompts.
- Training toolbar, unit/equipment dialogs and shared form controls.
- Online lobby, ready seats, team/deployment, battle controls, card hand,
  connection/errors, result/rematch and responsive mobile tabs.

The original concept gallery remains a visual reference. Concept illustrations
and sample descriptions do not override registered game data, skill costs,
legal targeting or hidden information. Offline shared-device setup retains its
existing hand display; online hands remain private under server authority.

## Interaction and layout

The new offline presentation module wraps existing UI rendering and delegates
actions to Shell/Core. It does not write combat state. A formation can be
confirmed only after selecting five soldiers, matching the existing rule.
Deployment confirmation remains disabled until all six units are placed.
Restart/leave prompts use a styled dialog; cancelling preserves the match.

Desktop keeps the map and three dock panels visible together. Below 900px,
Hero/Skills/Equipment tabs share one compact dock, with arrow-key navigation.
Deployment uses a separate remaining-unit tray. Short landscape viewports use
a smaller dock to keep controls inside the screen. The online client moves
the same existing action buttons into the appropriate visual panel; command
IDs, authorization, retries and server validation are unchanged.

Build/version metadata is in the document's data-build-version attribute and
the match menu instead of a technical header. The current production version is
1.75.2; older UI direction notes below describe the shared DW-STYLE-01 implementation.

## Verification

- npm run build: project/content/gameplay/bootstrap/result/visual/Hero/equipment/
  camera gates, production output and byte-identical asset checks.
- npm run test:deployment-ui: six viewport sizes, including short desktop and mobile layouts; checks that deployment confirmation is visible and hit-testable before interaction, plus two fresh-browser AI games with both deployment orders.
- v1.75.2 release verification recorded in the commit: build, eight deployment scenarios, 30 Grim ownership cases, responsive match layouts, two-seat online flow and a 312-state UI text audit. These are release-recorded results; consult CI artifacts for independently inspectable run evidence.
- npm run test:ui-browser: 49 active offline states at 1920×1080 and 390×844;
  1366×768, 360×780 and 844×390 battle/deployment bounds; Hero count, valid and
  incomplete formations, mobile tabs/keyboard, cancelled restart, modal bounds,
  horizontal overflow, missing files and client exceptions.
- npm run test:browser-smoke and npm run test:hero-board-browser: real unit
  clicks, movement, attack, Guard, HP resolution, turn changes, deployment drag,
  camera facing, image fallback and original gameplay hashes.
- npm run test:online-browser: two independent seats, setup, combat, persisted
  server restart, HP/turn/move, reconnect, mobile tabs and result bounds.
- npm run test:online-network: delayed/lost frames and acknowledgements,
  reconnect/reload, exactly-once costs and server deadline handling. The timeout
  assertion now waits for both the engine result and the durable journal entry,
  avoiding a race between an applied timeout and its asynchronous persistence.

The server engine hash before/after this UI work remains
d5bcc0ca56e33e301e05a6cb335071588b177400e6e2cf83459f2fca6c350db5.
Duel gameplay hash remains fnv1a32:5873bec7; Training remains fnv1a32:3566a068.
Local browser evidence is written under work/dw-ui and work/online-browser.
GitHub Actions runs the UI test and retains screenshots with the other checks.
