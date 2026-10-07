# v1.41.0 — Twelve confirmed Heroes

The Duel picker now offers Est, Kazu, Rodoc, Mask, Soul, Siri, Raen, Xacnas, Lucy, Grim, Neuro and Ranus. Names, stars, timing and Attack classification follow the four confirmed specifications in `docs/heroes/`.

Core supports temporary turn buffs, multiple targets and strikes in one commit, stun/root/freeze/silence, substitution, delayed counters, displacement, Dice wards, Dice drain, transformation, conversion, summoning and copying with a three-star cap. Equipment eligibility follows Grim's current form. Hero death remains a Mode decision after mandatory transaction effects; Soul's final-HP summon grants no survival exception.

Skill targeting can use battlefield clicks or the target list, with explicit confirmation, optional equipment and cancel before commitment. Defense skills that remain available outside a hit window appear in the defense bar. Hero selection shows class names and class colors; tokens use readable Hero initials. Existing troops v3 sprite bytes are preserved.

Validation: project validation, existing gameplay/UI/layout regressions, 31 new Node Hero cases, 24 real-browser Hero scenarios plus a UI click path, and production smoke with all 96 sprites decoded and no JavaScript/HTTP errors.

The deployed Duel uses its existing WebP map directly at startup. The unused legacy map PNG remains in the repository. Formation capacity support is a Mode policy hook; no new mode or map is enabled by this release. Future equipment definitions can extend the existing effect primitives; no unapproved equipment is added.
