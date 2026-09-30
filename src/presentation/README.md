# PRESENTATION

Owns non-authoritative rendering/presentation behavior.

Part 13.6 extracted:
- `board-renderer-runtime.js` — current SVG Hex/Unit renderer and visual layer registry.
- `asset-definitions-runtime.js` — stable presentation asset definitions/IDs.

Rules:
- PRESENTATION may read Match/Core state but must not decide legal gameplay outcomes.
- Board coordinates `(q,r)` remain gameplay truth; SVG/Three.js world/screen coordinates are presentation only.
- Future Three.js implementation belongs here and should preserve the existing Core Input Router/Controller boundary.
