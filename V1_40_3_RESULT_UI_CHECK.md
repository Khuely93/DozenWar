# v1.40.3 — Duel victory and result UI check

In Mode Đối Đầu, the match ends when either Hero HP reaches 0 after the current attack, defense, Reflect, and other mandatory effects resolve. If both Heroes fall in the same resolution, the result is a draw. Troop deaths do not end the match.

The result overlay is now opened before rematch details are rendered. Missing optional room metadata does not prevent the victory result from appearing. An interrupted result render that left the match marked ended can be recovered when the UI is still hidden.

`npm run test:result-ui` executes the actual combat, Mode rule, and Shell result code in a DOM state harness. It checks win, loss, draw, living Heroes, incomplete room metadata, and a previously interrupted result render. `npm run build` runs this alongside validation and gameplay checks.

Browser limitation: the available remote browser blocks the local development URL, so these checks confirm runtime logic and overlay state rather than a visible in-browser playthrough.
