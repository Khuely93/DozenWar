# CORE

Owns authoritative reusable gameplay mechanics and state transitions.

Part 13.6 split the Core runtime into `core-runtime-a.js` and `core-runtime-b.js` so the board renderer can execute between them from the PRESENTATION layer without changing source order.

The renderer no longer lives in the CORE folder, but Core still owns movement, targeting, combat, Guard, Skill, Attack and Input Router gameplay decisions.


Part 13.8A: `core-foundation-runtime.js` now owns the locked Star/Power invariant self-audit and shared axial direction constants previously parked in a legacy bridge. The unused `window.DOZEN_CORE_RULES` compatibility export was removed.
