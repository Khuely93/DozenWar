# DOZEN WAR II v1.39 — Duel Skill action and Equipment

## Confirmed Duel rule

- A normal Attack or a committed ACTIVE Skill consumes the acting Hero or unit's action for that turn. The acting Hero cannot move, Attack, or commit another ACTIVE Skill after that action.
- Choosing targets, choosing a Card, and cancelling before confirmation spend neither an action nor a Card.
- DEFENSE_REACTION Skill use remains in the defender's response window and is not the defender's active action.
- An ACTIVE damage Skill can attach at most one eligible attack Equipment from the Hero's current hand. Support Skills and defensive Skills cannot attach attack Equipment in this flow.
- Confirmation consumes the Card once. Every damage target receives the Card's applicable attack effects, including damage and Guard bypass. Each target retains its own defense response.
- Interaction Power for Skill plus Equipment is the higher ★ value, not their sum. On equal ★, the later defense response wins, following the existing Core resolver.
- The mode Skill usage limit remains one use per Skill per match. Equipment deck composition is unchanged.

## Verification

- `npm run validate`: 101/101 PASS.
- `npm run test:content-readiness`: 22/22 PASS.
- `npm run test:gameplay`: 10/10 PASS.
- `npm run build`: PASS.

Gameplay tests cover confirmation, cancellation, one Card across two Skill targets, damage, Guard bypass, Star selection, and invalid Card refusal. Browser click-through was not available in this environment.
