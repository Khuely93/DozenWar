# ASSETS

Physical image/audio/VFX/3D files belong here.

Part 13.6 moved the stable asset metadata/IDs into `src/presentation/asset-definitions-runtime.js`; the prototype still uses embedded/fallback glyph presentation resources, so no external binary asset migration is invented in this step.

Future asset files should be referenced through stable IDs such as `IMG_*`, `VFX_*`, and `ANIM_*` rather than by gameplay code.
