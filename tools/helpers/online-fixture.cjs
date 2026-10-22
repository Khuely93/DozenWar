"use strict";
const { Rooms } = require("../../server/rooms.cjs");
const { Engine } = require("../../server/engine.cjs");
async function seedBattle(store, now) {
  const rooms = new Rooms(store, { now });
  await rooms.init();
  const seats = { 1: await rooms.create("Network A") };
  seats[2] = await rooms.join(seats[1].code, "Network B");
  const room = rooms.room(seats[1].code);
  let chosen;
  for (let n = 1; n <= 1000; n++) {
    const seed = n.toString(16).padStart(64, "0"),
      e = new Engine(seed, now());
    e.command(1, { type: "READY" }, now());
    e.command(2, { type: "READY" }, now());
    const first = e.view(1, now()).firstSide,
      a = e.view(first, now()).hand,
      b = e.view(3 - first, now()).hand;
    if (
      a.some((c) => c.id === "EQUIP_INF_ATK_001") &&
      !a.some((c) => c.id === "EQUIP_COMMON_BOTH_002") &&
      b.some((c) => c.id === "EQUIP_COMMON_BOTH_002")
    ) {
      chosen = seed;
      break;
    }
  }
  if (!chosen) throw Error("No deterministic equipment fixture found");
  const doc = { ...room.doc, seed: chosen, revision: room.doc.revision + 1 };
  await store.save(doc, room.doc.revision);
  room.doc = doc;
  room.engine = rooms.rebuild(doc);
  let serial = 0;
  async function send(side, command) {
    const v = await rooms.view(seats[side].code, seats[side].resumeToken);
    await rooms.submit(seats[side].code, seats[side].resumeToken, {
      commandId: "fixture-" + ++serial,
      expectedRevision: v.revision,
      command,
    });
  }
  for (const side of [1, 2]) await send(side, { type: "READY" });
  for (let i = 0; i < 2; i++) {
    const side = room.engine.view(1, now()).selecting;
    await send(side, {
      type: "TEAM",
      heroId: "HERO_INF_KAZU",
      troops: { inf: 3, arch: 1, cav: 1 },
    });
  }
  for (let i = 0; i < 2; i++) {
    const side = room.engine.view(1, now()).selecting,
      hero = { q: 2, r: side === 1 ? 1 : -1 },
      available = room.engine
        .catalog()
        .cells.filter(
          (c) => c.zone === side && (c.q !== hero.q || c.r !== hero.r),
        );
    const ids = [
      "HERO_INF_KAZU",
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_ARCH_001",
      "UNIT_CAV_001",
    ];
    await send(side, {
      type: "DEPLOY",
      units: ids.map((definitionId, i) => ({
        definitionId,
        ...(i ? { q: available[i - 1].q, r: available[i - 1].r } : hero),
      })),
    });
  }
  const v = room.engine.view(1, now()),
    side = v.battleSide,
    hero = v.units.find((u) => u.hero && u.side === side);
  await send(side, { type: "MOVE", actorId: hero.id, cell: { q: 2, r: 0 } });
  const result = { seats, code: doc.code, side };
  await rooms.close();
  return result;
}
module.exports = { seedBattle };
