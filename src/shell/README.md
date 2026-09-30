# SHELL layer — Part 13.5

Current extracted ownership:
- `shell-flow-runtime.js`: Mode Select/Confirm, Play Menu context, Ready Check, Dice, Team Select, Equipment Deal Shell flow.
- `shell-session-runtime.js`: Play Hub, room/session lifecycle, matchmaking/private-room prototype flow and Shell-side match start orchestration.
- `shell-gameover-runtime.js`: MatchResult rendering, Game Over, Rematch voting and Leave-to-Menu flow.

SHELL consumes `MatchResult`; it does not calculate victory. Gameplay board/renderer and combat remain outside SHELL.

## Part 13.8B
`src/shell/shell-kernel-runtime.js` now owns the small `DW_SHELL` MatchResult delivery kernel. The source was relocated byte-for-byte from the former legacy prelude; Mode still decides the result and Shell only receives/renders it.
