# Fixed overhead team camera — v1.71.1

Requested correction: the camera looks down onto the board; blue units show
backs and red units show fronts, for soldiers and Heroes alike. Moving or
attacking must not reverse that view.

- `ingame-blue-back-red-front.png`: actual production-build browser screenshot.
- `troops-blue-back-red-front.png`: transparent production source, two columns
  (blue/back, red/front) and three rows (infantry, cavalry, crossbowman).
- `assets/troops-camera-team/manifest.json`: encoded atlas checksum and crop metadata.
- Hero figures select existing approved front/back atlas crops.

Both offline and two independent online clients were checked for stable team
facing. Selection, movement, attack, Guard, fallback art and reconnect flows pass.
