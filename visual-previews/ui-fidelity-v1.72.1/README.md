# UI fidelity correction v1.72.1

The user rejected v1.72.0 as visually different from the approved concepts.
This iteration is **in progress**, not a claim of 100% reproduction.

- The mode and HUD atlases are byte-identical copies of approved source boards.
- Runtime browser slices reuse their frames and controls; no image repainting,
  recoloring, or irreversible bitmap extraction is involved.
- HTML labels, focus, disabled states, and existing actions remain functional.
- Mode proportions now use the reference width of 1672 px on desktop.
- Screen captures show the actual production bundle, with test match fixtures
  used only to reach the HUD state. WebP copies are full-frame format conversions.

Remaining differences include fonts, backgrounds, panel texture scaling,
ornaments, and the individual layouts of other screens. The concept boards
include annotations and reusable kits that are not part of the playable screen.
Responsive mobile layouts are not expected to match desktop pixels.

See `index.html` for side-by-side comparison and original image links.
