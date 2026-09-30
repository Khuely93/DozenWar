# DOZEN WAR II v1.37 — HERO / SKILL CONTENT READINESS GATE

Status: **READY FOR CONTENT EXPANSION**

This gate closes the two blockers identified in v1.36 without changing the locked gameplay rules of the current three Heroes.

## Hero identity

Playable Hero identity is now `definitionId`-first. `classId` / legacy `kind` remain class semantics only. Team selection stores `heroDefinitionId`, deployment creates a runtime instance from that exact definition, and Core/Shell/Presentation resolve Hero data through `ContentViews.hero(unit.definitionId)`. Multiple Heroes may therefore share the same class without colliding on `inf / arch / cav`.

## Skill runtime

The current Hero Skill special cases that were previously keyed by concrete Skill IDs are now represented by existing Skill data/effect metadata:

- heal only when HP is missing → `target.requireMissingHp`
- same-ray line lock → `target.selection.lineLock`
- Archer damage buff → generic `MODIFY_DAMAGE + ADD` effect handling
- defensive skill availability → `timing === DEFENSE_REACTION`

No current Skill damage, range, target count, Star, Guard interaction, or usage policy is changed.

## Green expansion paths

- ADD Hero definition, including another Hero of an existing class
- ADD Skill composed from existing targeting/effect primitives
- ADD Equipment definition
- ADD Mode definition
- ADD Mode Rule
- ADD localization / asset metadata

A genuinely new gameplay primitive still requires an explicit CORE `ADD` after requirement clarification; existing Core rules remain locked.
