# DOZEN WAR II v1.40.1 — Attack Equipment and per-hit defense

## Duel flow

1. Select one eligible attack Equipment and confirm it as pending. It stays in hand at this point.
2. Choose a normal Attack or an ACTIVE Skill. Cancelling target selection does not consume the Card or action.
3. On a legal normal Attack, the Card adds its applicable attack effects and ★ (normal Attack starts at ★0). The Card leaves the hand on commitment.
4. On an ACTIVE damage Skill, the Card and Skill effects apply to each target; one Card is consumed once. Final ★ is the maximum of Skill and Card ★. Each target receives a separate defense response.
5. On an ACTIVE support or heal Skill, the Card is consumed on Skill confirmation. Because there is no attack resolution, its attack effects and ★ remain attached to the acting Hero until their next normal Attack, across turn changes. A second attack Card cannot be attached while one is queued.
6. Attack and committed ACTIVE Skill each end the acting unit's action for that turn.

Both Heroes and troops may use Equipment when its class matches the unit or the Card is neutral. Attack or neutral Cards can join normal Attacks; defense or neutral Cards can respond to incoming hits. Troops use their attack Cards with normal Attacks. ACTIVE Skills belong to Heroes, who may attach eligible attack Equipment to them.

Each incoming hit opens one defense choice: eligible Guard, unused defensive Skill, one eligible defense Card, or no defense. The defender can use more defense Cards on later hits while cards remain in hand. Defensive Skill and defense Card are separate choices for the same hit.

## Verification

- `npm run validate`: 101/101 PASS.
- `npm run test:content-readiness`: 22/22 PASS.
- `npm run test:gameplay`: 17/17 PASS, including troop attack and defense Equipment.
- `npm run build`: PASS.
- Production HTML, JS, CSS, and board image served with HTTP 200.

Tests cover the underlying rules with controlled state. Full browser interaction was not available in this environment. Existing Equipment effects currently playable on an attack are damage +1 and Guard bypass; new effect types need an explicit Core implementation and tests.
