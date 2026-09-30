# DOZEN WAR II v1.40.2 — Bot combat and tactics

- A pending hit resolves after Bot defense without any extra board click. When the human defender has no legal response, the hit resolves automatically. When the human has Guard, a defense Card, or an unused defensive Skill, they choose one response or **KHÔNG ĐỠ ĐÒN**.
- A resolved hit advances the Bot action queue. A multi-target Skill advances the queue after its last target. Failed end-turn attempts do not schedule extra Bot turns.
- The Bot compares legal hits by likely damage, finishing potential, Hero value, and Guard protection. It checks reachable tiles for attack opportunities and opposing attack range, protects its injured Hero, saves Cards that would have no effect, and uses eligible active Hero Skills when worthwhile.
- Difficulty: Easy makes simple legal choices; Normal weighs targets and varies positioning; Hard weighs threats, lethal attacks, defenses, and positioning more consistently. Core still validates all actions.
- When a Hero reaches zero HP, the Duel rule sends the result to the win/lose UI and rematch controls.

Verification: `npm run build` runs project validation, content readiness, and gameplay regressions. The gameplay suite covers automatic defense resolution, Infantry Guard, Bot turn completion, multi-target Skill completion, target/move decisions, and win/lose UI delivery.
