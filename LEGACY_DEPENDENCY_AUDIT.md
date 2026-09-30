# Part 13.8B - Remaining Legacy Dependency Audit

Scope: architecture cleanup only. No gameplay-rule change is authorized in this step.

## Safe removal executed

1. `src/legacy/legacy-prelude-a-head.js`
   - Content: comments only.
   - Runtime behavior: none.
   - Action: REMOVE from project/runtime order.

2. `src/legacy/legacy-prelude-b.js`
   - Content: `DW_SHELL` MatchResult delivery kernel only.
   - Consumers: `mode-registry-runtime.js`, `shell-gameover-runtime.js`.
   - Action: RELOCATE exact source bytes to `src/shell/shell-kernel-runtime.js` and remove legacy path.
   - Behavior: unchanged.

## Remaining legacy areas

### legacy-prelude-a-tail.js
Mixed architecture IDs, registries/policies and compatibility-era declarations. Not removed in 13.8B because consumers span CORE/MODE/SHELL and a blind move could alter load-time bindings.

### legacy-prelude-c.js
Contains embedded Hero fallback image plus MatchState `S`, skill-usage helpers and shared runtime state. This is not a disposable bridge. It requires ownership separation before removal.

### legacy-ai-runtime.js
Contains Bot decision and reaction automation and monkey-patches defense/combat hooks. It should move only after a dedicated AI/controller boundary is defined and regression-tested.

### legacy-post-runtime.js
Contains playtest QA API plus boot/reset/main-button wiring. It is not gameplay authority, but boot ordering is observable and should be separated from QA before removal.

## Locked KEEP set

Combat, Star/Power, Movement, Targeting, Guard, Pierce/Propagation, Reflect, Skill usage semantics, Duel Hero Death/DRAW, Equipment gameplay, Mode policies, Content manifest/handshake and backward compatibility are NOT modified by Part 13.8B.

## Part 13.8C update (v1.35)

Safe source-equivalent reductions completed:
- `heroImg` embedded fallback moved byte-for-byte from `legacy-prelude-c.js` to `src/presentation/hero-fallback-runtime.js`.
- `legacy-post-runtime.js` removed after an exact split into:
  - `src/debug/playtest-qa-runtime.js` — playtest-only QA API.
  - `src/shell/shell-boot-runtime.js` — reset/main-button/initial Shell boot wiring.

Remaining legacy runtime is now limited to:
- `legacy-prelude-a-tail.js` — mixed architecture/action/network/Core declarations.
- `legacy-prelude-c.js` — MatchState `S`, skill-usage state and shared runtime helpers.
- `legacy-ai-runtime.js` — bot automation/hook wrappers.

No gameplay rule was modified in this step.
