# Transitional legacy area

Part 13.8A removed the old Core bridge and Mode compatibility tables.
Part 13.8B additionally removes the comment-only prelude head and moves `DW_SHELL` to SHELL ownership.

Remaining files are intentionally retained until their mixed dependencies are separated and regression-gated:
- `legacy-prelude-a-tail.js`
- `legacy-prelude-c.js`
- `legacy-ai-runtime.js`
- `legacy-post-runtime.js`

See `/LEGACY_DEPENDENCY_AUDIT.md`.
