"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict");
const { Engine } = require("../engine.cjs");
const { setup, fixture } = require("./helpers.cjs");
const combat = `S.phase='battle';S.battleSide=1;S.winner=1;S.turn=1;S.units=[createRuntimeEntityInstance({definitionId:'HERO_INF_KAZU',side:1,hero:true,q:0,r:0}),createRuntimeEntityInstance({definitionId:'HERO_INF_RODOC',side:2,hero:true,q:1,r:0})];S.hands={1:[],2:[]};resetTurnFlags();`;
function ids(e) {
  return e.view(1, e.now).units.map((u) => u.id);
}
function play(e, side, c, at = e.now + 1) {
  return e.command(side, c, at);
}
test("catalog and deterministic initial game use the same gameplay manifest", () => {
  const a = setup(),
    b = setup();
  assert.deepEqual(a.engine.view(1, a.at), b.engine.view(1, b.at));
  const c = a.engine.catalog();
  assert.equal(c.heroes.length, 12);
  assert.equal(c.cards.length, 30);
  assert.equal(c.gameplayHash, "fnv1a32:5873bec7");
  assert.equal(c.cells.length, 61);
});
test("private views do not reveal opponent hand, seed or payment state; reads are inert", () => {
  const { engine: e, at } = setup();
  const raw = e.invoke("S", at);
  for (let i = 0; i < 4; i++) {
    const a = e.view(1, at),
      b = e.view(2, at);
    assert.equal(a.hand.length, 5);
    assert.equal(b.hand.length, 5);
    for (const c of b.hand) assert.ok(!JSON.stringify(a).includes(c.uid));
    assert.ok(!JSON.stringify(a).includes("seed"));
  }
  assert.deepEqual(e.invoke("S", at), raw);
});
test("move options are payable once and turn ownership is enforced", () => {
  const { engine: e, at } = setup();
  const side = e.view(1, at).battleSide,
    v = e.view(side, at);
  const a = v.options.actors.find((a) =>
    a.moves.some((c) => {
      const u = v.units.find((u) => u.id === a.id);
      return c.q !== u.q || c.r !== u.r;
    }),
  );
  const u = v.units.find((u) => u.id === a.id),
    cell = a.moves.find((c) => c.q !== u.q || c.r !== u.r);
  assert.throws(
    () => play(e, 3 - side, { type: "MOVE", actorId: a.id, cell }),
    /WAIT_FOR_YOUR_TURN/,
  );
  play(e, side, { type: "MOVE", actorId: a.id, cell });
  assert.equal(e.view(side, e.now).units.find((u) => u.id === a.id).q, cell.q);
});
test("defense pauses the attacker clock; guarding does not renew defense time", () => {
  const e = fixture(
    combat +
      `S.units.push(createRuntimeEntityInstance({definitionId:'UNIT_INF_001',side:2,hero:false,q:1,r:-1}));`,
  );
  const [a, d, g] = ids(e);
  play(e, 1, { type: "ATTACK", actorId: a, targetIds: [d] }, 11000);
  assert.equal(e.view(1, 21000).clock.remainingMs, 20000);
  play(e, 2, { type: "DEFEND", guardId: g }, 21000);
  assert.equal(e.deadline(), 41000);
  play(e, 2, { type: "DEFEND" }, 31000);
  assert.equal(e.view(1, 31000).clock.kind, "turn");
  assert.equal(e.view(1, 31000).clock.remainingMs, 170000);
  assert.equal(e.view(1, 31000).units.find((u) => u.id === g).hp, 1);
});
test("counter chains preserve payment and cannot be bypassed by a defense action", () => {
  const e = fixture(
    combat +
      `S.hands[1]=[createEquipmentCardInstance('EQUIP_INF_ATK_001',1)];S.hands[2]=[createEquipmentCardInstance(NEW_EQUIPMENT_CATALOG.cards.find(c=>c.effects.includes('EFFECT_CANCEL_EQUIPMENT')).id,2)];`,
  );
  const v = e.view(1, e.now),
    [a, d] = ids(e);
  play(e, 1, {
    type: "ATTACK",
    actorId: a,
    targetIds: [d],
    cardUid: v.hand[0].uid,
  });
  assert.equal(e.view(1, e.now).hand.length, 0);
  const defense = e.view(2, e.now);
  assert.equal(defense.options.counter.length, 1);
  assert.throws(() => play(e, 2, { type: "DEFEND" }), /REACTION_PENDING/);
  play(e, 2, { type: "COUNTER_CARD", cardUid: defense.hand[0].uid });
  assert.equal(e.view(2, e.now).hand.length, 0);
  assert.equal(e.view(1, e.now).reaction, null);
  play(e, 2, { type: "DEFEND" });
  assert.equal(e.view(1, e.now).units.find((u) => u.id === d).hp, 2);
});
test("all twelve heroes expose actions without DOM calls or view-side spending", () => {
  for (const hero of new Engine("a".repeat(64), 1000).catalog().heroes) {
    const e = fixture(
      combat +
        `S.units[0]=createRuntimeEntityInstance({definitionId:${JSON.stringify(hero.id)},side:1,hero:true,q:0,r:0});S.hands[1]=NEW_EQUIPMENT_CATALOG.cards.map(c=>createEquipmentCardInstance(c.id,1));S.units[0].hp=2;`,
    );
    const before = e.invoke("S", e.now);
    const v = e.view(1, e.now);
    assert.ok(v.options.actors.some((a) => a.id === v.units[0].id));
    assert.deepEqual(
      e.invoke("S", e.now),
      before,
      hero.name + " view changed rules",
    );
  }
});
test("post-hit reflect remains available after lethal damage; simultaneous hero deaths draw", () => {
  const e = fixture(
    combat +
      `S.units.forEach(u=>u.hp=1);S.hands[2]=[createEquipmentCardInstance('EQUIP_INF_DEF_001',2)];`,
  );
  const [a, d] = ids(e);
  play(e, 1, { type: "ATTACK", actorId: a, targetIds: [d] });
  play(e, 2, { type: "DEFEND" });
  let v = e.view(2, e.now);
  assert.equal(v.phase, "battle");
  assert.equal(v.units[1].hp, 0);
  assert.equal(v.options.post.length, 1);
  play(e, 2, { type: "POST_HIT", cardUid: v.hand[0].uid });
  v = e.view(1, e.now);
  assert.equal(v.phase, "ended");
  assert.equal(v.result.resultType, "DRAW");
});
test("every hero active skill can commit through the server boundary with legal choices", () => {
  for (const hero of new Engine("a".repeat(64), 1000).catalog().heroes)
    for (let n = 1; n <= 3; n++) {
      if (hero.skills[n - 1].timing === "DEFENSE_REACTION") continue;
      const e = fixture(
        combat +
          `S.units[0]=createRuntimeEntityInstance({definitionId:${JSON.stringify(hero.id)},side:1,hero:true,q:0,r:0});S.units[1].q=2;S.units.push(...['UNIT_INF_001','UNIT_CAV_001','UNIT_ARCH_001'].map((definitionId,i)=>createRuntimeEntityInstance({definitionId,side:1,hero:false,q:-1,r:i})));S.troopDeaths=[{id:'dead',side:1}];S.heroSkillHistory=[{side:2,skillId:'SKILL_HERO_KAZU_S1',turn:1}];`,
      );
      const v = e.view(1, e.now),
        a = v.options.actors.find((a) => a.id === v.units[0].id),
        p = a.skills.find((s) => s.n === n);
      if (!p) continue;
      const q = p.skill.mechanic === "COPY" ? p.copies[0] : p;
      if (
        !q.targetIds.length &&
        !q.cells.length &&
        !["MORPH", "DICE_WARD", "COPY"].includes(q.skill.mechanic)
      )
        continue;
      const command = {
        type: "SKILL",
        actorId: a.id,
        skillNo: n,
        targetIds: q.targetIds.slice(0, 1),
        cell: q.cells[0],
        kind: q.kinds[0].id,
        copyId: q.skill.id,
        dice: [1, 2],
      };
      try {
        play(e, 1, command);
      } catch (err) {
        throw new Error(
          hero.name + " S" + n + " " + q.skill.mechanic + ": " + err.message,
        );
      }
      assert.ok(e.view(1, e.now), hero.name + " " + n);
    }
});
test("redirect preserves the incoming attack and gives its new receiver a defense choice", () => {
  const e = fixture(
    combat +
      `S.units[1]=createRuntimeEntityInstance({definitionId:'HERO_ARCH_LUCY',side:2,hero:true,q:1,r:0});S.units.push(createRuntimeEntityInstance({definitionId:'UNIT_INF_001',side:2,hero:false,q:2,r:0}));S.hands[2]=[createEquipmentCardInstance('EQUIP_ARCH_DEF_002',2)];`,
  );
  const [a, d, ally] = ids(e);
  play(e, 1, { type: "ATTACK", actorId: a, targetIds: [d] });
  const c = e.view(2, e.now).hand[0];
  play(e, 2, { type: "CARD", actorId: d, cardUid: c.uid, targetIds: [ally] });
  const v = e.view(2, e.now);
  assert.equal(v.pending.d, ally);
  assert.equal(v.units.find((u) => u.id === ally).hp, 2);
  play(e, 2, { type: "DEFEND" });
  assert.equal(e.view(2, e.now).units.find((u) => u.id === ally).hp, 1);
});
test("defense projections for all heroes and all cards remain inert", () => {
  for (const h of new Engine("a".repeat(64), 1000).catalog().heroes) {
    const e = fixture(
      combat +
        `S.units[1]=createRuntimeEntityInstance({definitionId:${JSON.stringify(h.id)},side:2,hero:true,q:1,r:0});S.hands[2]=NEW_EQUIPMENT_CATALOG.cards.map(c=>createEquipmentCardInstance(c.id,2));`,
    );
    const [a, d] = ids(e);
    play(e, 1, { type: "ATTACK", actorId: a, targetIds: [d] });
    const before = e.invoke("S", e.now);
    e.view(2, e.now);
    assert.deepEqual(e.invoke("S", e.now), before, h.name);
  }
});
test("steal only reveals choices after payment and its cancel window", () => {
  const e = fixture(
    combat +
      `S.hands[1]=[createEquipmentCardInstance('EQUIP_COMMON_BOTH_003',1)];S.hands[2]=[createEquipmentCardInstance('EQUIP_COMMON_BOTH_002',2),createEquipmentCardInstance('EQUIP_INF_ATK_001',2)];`,
  );
  const [a] = ids(e),
    before = e.view(2, e.now).hand;
  play(e, 1, {
    type: "CARD",
    actorId: a,
    cardUid: e.view(1, e.now).hand[0].uid,
  });
  assert.equal(e.view(1, e.now).options.steal, undefined);
  assert.equal(e.view(1, e.now).hand.length, 0);
  play(e, 2, { type: "PASS_COUNTER" });
  const choices = e.view(1, e.now).options.steal;
  assert.equal(choices.length, 2);
  play(e, 1, { type: "STEAL_CHOOSE", cardUid: before[1].uid });
  assert.equal(e.view(1, e.now).hand[0].uid, before[1].uid);
  assert.equal(e.view(2, e.now).hand.length, 1);
});
