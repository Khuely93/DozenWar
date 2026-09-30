# UI layer — Part 13.5

Current extracted ownership:
- `ui-dom-runtime.js`: `requireDWElement`, `ShellDOM`, `CoreDOM`, `DebugDOM`, DOM registry validation, and temporary CoreDOM compatibility aliases.

This step only relocates the existing DOM registry source. It does not redesign UI or change renderer behavior. Board rendering remains in CORE temporarily and will move toward PRESENTATION later.
