# DW-STYLE-01 — 12 Hero six-view camera trials

Status: **APPROVED_FOR_GAME**. 12 Hero sheets, six poses per Hero,
72 intended views total. These are drawings for art review, not calibrated
3D turntables or transparent production sprite atlases.

Each sheet uses two columns and three rows:

| Row | Left | Right |
| --- | --- | --- |
| 1 | Front | Back |
| 2 | Front +45° | Back +45° |
| 3 | Front −45° | Back −45° |

Camera/style references: the latest infantry-camera-06-v2 and cavalry-camera-06
trials. Standing Heroes were revised to emphasize the top of the head/hood,
shoulders and foreshortened body. Direction corrections were made where
initial generations repeated a diagonal. Only latest revisions are packaged.

Hero identity references: approved compact board art in `assets/heroes/`.
Hero colors and equipment remain individual. Mask, Soul and Siri are mounted;
Raen has two heads on one body. Neuro retains the back-mounted book.

Open `index.html` to browse/download individual sheets. The page uses relative
image links and no JavaScript or external resources, and is included in the
ZIP with PNGs and `manifest.json`. From the repository, `npm run dev` also
serves `/visual-previews/heroes-camera-06/`.

Gray backgrounds are retained here as review sources. The approved six-view
Hero set is now registered in game through transparent WebP atlases in
`assets/heroes-camera-06/`; see `docs/HERO_BOARD_VISUALS.md`. Gameplay and
server rules are unchanged.
