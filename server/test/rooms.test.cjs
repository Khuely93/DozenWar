"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path");
const { Rooms } = require("../rooms.cjs"),
  { FileStore, PostgresStore } = require("../store.cjs");
async function environment(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dw-online-"));
  let at = 1000;
  const store = new FileStore(dir),
    rooms = new Rooms(store, { now: () => at });
  await rooms.init();
  t.after(async () => {
    await rooms.close();
    await fs.rm(dir, { recursive: true, force: true });
  });
  const p1 = await rooms.create("Kazu"),
    p2 = await rooms.join(p1.code, "Rodoc");
  let serial = 0;
  const send = async (side, command, commandId = "command-" + ++serial) => {
    const p = side === 1 ? p1 : p2,
      v = await rooms.view(p.code, p.resumeToken);
    return rooms.submit(p.code, p.resumeToken, {
      commandId,
      expectedRevision: v.revision,
      command,
    });
  };
  return {
    dir,
    rooms,
    store,
    p1,
    p2,
    send,
    setTime: (n) => (at = n),
    now: () => at,
  };
}
async function battle(env) {
  const { rooms, p1, p2, send } = env;
  await send(1, { type: "READY" });
  await send(2, { type: "READY" });
  for (let i = 0; i < 2; i++) {
    const g = (await rooms.view(p1.code, p1.resumeToken)).game;
    await send(g.selecting, {
      type: "TEAM",
      heroId: g.selecting === 1 ? "HERO_INF_KAZU" : "HERO_INF_RODOC",
      troops: { inf: 3, arch: 1, cav: 1 },
    });
  }
  for (let i = 0; i < 2; i++) {
    const room = rooms.room(p1.code),
      g = room.engine.view(1, env.now()),
      side = g.selecting,
      cells = room.engine.catalog().cells.filter((c) => c.zone === side),
      ids = [
        g.teams[side].heroDefinitionId,
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
        q: cells[i].q,
        r: cells[i].r,
      })),
    });
  }
}
test("tokens authorize seats; code alone cannot resume and room is private", async (t) => {
  const e = await environment(t);
  await assert.rejects(
    e.rooms.resume(e.p1.code, e.p2.resumeToken + "x"),
    /UNAUTHORIZED/,
  );
  const other = await e.rooms.create("Other");
  await assert.rejects(
    e.rooms.view(e.p1.code, other.resumeToken),
    /UNAUTHORIZED/,
  );
  await assert.rejects(e.rooms.join(e.p1.code, "Third"), /ROOM_FULL/);
  const view = await e.rooms.view(e.p1.code, e.p1.resumeToken);
  assert.ok(!JSON.stringify(view).includes(e.p2.resumeToken));
  assert.ok(!JSON.stringify(view).includes("tokenHash"));
  assert.equal(view.side, 1);
});
test("concurrent duplicate command is durable and applied exactly once; ID reuse fails", async (t) => {
  const e = await environment(t);
  const v = await e.rooms.view(e.p1.code, e.p1.resumeToken),
    envelope = {
      commandId: "same-command-123",
      expectedRevision: v.revision,
      command: { type: "READY" },
    };
  const a = await Promise.all([
    e.rooms.submit(e.p1.code, e.p1.resumeToken, envelope),
    e.rooms.submit(e.p1.code, e.p1.resumeToken, envelope),
  ]);
  assert.equal(a[0].revision, a[1].revision);
  assert.equal(a[1].duplicate, true);
  assert.equal(e.rooms.room(e.p1.code).doc.journal.length, 1);
  const restarted = new Rooms(new FileStore(e.dir), { now: e.now });
  await restarted.init();
  t.after(() => restarted.close());
  assert.equal(
    (await restarted.submit(e.p1.code, e.p1.resumeToken, envelope)).duplicate,
    true,
  );
  await assert.rejects(
    restarted.submit(e.p1.code, e.p1.resumeToken, {
      ...envelope,
      command: { type: "SURRENDER" },
    }),
    /COMMAND_ID_REUSED/,
  );
});
test("stale and illegal commands roll back partial deployment and preserve deterministic RNG", async (t) => {
  const e = await environment(t);
  await e.send(1, { type: "READY" });
  await e.send(2, { type: "READY" });
  for (let i = 0; i < 2; i++) {
    const g = (await e.rooms.view(e.p1.code, e.p1.resumeToken)).game;
    await e.send(g.selecting, {
      type: "TEAM",
      heroId: "HERO_INF_KAZU",
      troops: { inf: 3, arch: 1, cav: 1 },
    });
  }
  const r = e.rooms.room(e.p1.code),
    g = r.engine.view(1, e.now()),
    side = g.selecting,
    p = side === 1 ? e.p1 : e.p2,
    before = await e.rooms.view(p.code, p.resumeToken);
  const cells = r.engine.catalog().cells.filter((c) => c.zone === side),
    ids = [
      "HERO_INF_KAZU",
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_ARCH_001",
      "UNIT_CAV_001",
    ],
    units = ids.map((definitionId, i) => ({
      definitionId,
      q: cells[i].q,
      r: cells[i].r,
    }));
  units[5] = { ...units[5], q: cells[0].q, r: cells[0].r };
  await assert.rejects(
    e.send(side, { type: "DEPLOY", units }),
    /INVALID_DEPLOYMENT/,
  );
  assert.deepEqual(await e.rooms.view(p.code, p.resumeToken), before);
  await assert.rejects(
    e.rooms.submit(p.code, p.resumeToken, {
      commandId: "stale-command",
      expectedRevision: 0,
      command: { type: "DEPLOY", units },
    }),
    /STALE_STATE/,
  );
  const fresh = e.rooms.rebuild(r.doc);
  assert.deepEqual(
    r.engine.invoke("[Math.random(),crypto.randomUUID()]", e.now()),
    fresh.invoke("[Math.random(),crypto.randomUUID()]", e.now()),
  );
});
test("database failure rejects ack and restores in-memory state before retry", async (t) => {
  const e = await environment(t),
    original = e.store.save.bind(e.store),
    before = await e.rooms.view(e.p1.code, e.p1.resumeToken);
  e.store.save = async () => {
    throw Error("STORE_OFFLINE");
  };
  await assert.rejects(
    e.send(1, { type: "READY" }, "retry-command"),
    /STORE_OFFLINE/,
  );
  assert.deepEqual(await e.rooms.view(e.p1.code, e.p1.resumeToken), before);
  e.store.save = original;
  await e.send(1, { type: "READY" }, "retry-command");
  assert.equal(
    (await e.rooms.view(e.p1.code, e.p1.resumeToken)).game.ready[0],
    true,
  );
});
test("restart rebuilds a real deployed match; server clock advances without browser", async (t) => {
  const e = await environment(t);
  await battle(e);
  const original = await e.rooms.view(e.p1.code, e.p1.resumeToken),
    restarted = new Rooms(new FileStore(e.dir), { now: e.now });
  await restarted.init();
  t.after(() => restarted.close());
  assert.deepEqual(await restarted.view(e.p1.code, e.p1.resumeToken), original);
  e.setTime(181000);
  await restarted.tick();
  const after = await restarted.view(e.p1.code, e.p1.resumeToken);
  assert.equal(after.game.turn, 2);
  assert.equal(after.game.battleSide, 3 - original.game.battleSide);
  assert.equal(after.game.clock.remainingMs, 180000);
});
test("setup timeout, surrender and mutual rematch are server-owned transitions", async (t) => {
  const e = await environment(t);
  e.setTime(301000);
  await e.rooms.tick();
  let v = await e.rooms.view(e.p1.code, e.p1.resumeToken);
  assert.equal(v.game.result.resultType, "DRAW");
  await e.send(1, { type: "REMATCH" });
  assert.equal(
    (await e.rooms.view(e.p1.code, e.p1.resumeToken)).game.phase,
    "ended",
  );
  await e.send(2, { type: "REMATCH" });
  v = await e.rooms.view(e.p1.code, e.p1.resumeToken);
  assert.equal(v.game.phase, "ready");
  assert.equal(v.game.matchNo, 2);
  await e.send(1, { type: "SURRENDER" });
  assert.equal(
    (await e.rooms.view(e.p1.code, e.p1.resumeToken)).game.result.winnerSide,
    2,
  );
});
test("changed rule build refuses to silently replay or edit old matches", async (t) => {
  const e = await environment(t);
  const r = e.rooms.room(e.p1.code),
    old = r.doc;
  await e.store.save(
    { ...old, runtimeHash: "old-build", revision: old.revision + 1 },
    old.revision,
  );
  const restarted = new Rooms(new FileStore(e.dir), { now: e.now });
  await restarted.init();
  t.after(() => restarted.close());
  await assert.rejects(
    restarted.resume(e.p1.code, e.p1.resumeToken),
    /BUILD_MISMATCH/,
  );
});
test(
  "PostgreSQL durable command receipt and process restart",
  { skip: !process.env.POSTGRES_TEST_URL },
  async (t) => {
    const store = new PostgresStore(process.env.POSTGRES_TEST_URL),
      rooms = new Rooms(store);
    await rooms.init();
    const p = await rooms.create("PG test"),
      v = await rooms.view(p.code, p.resumeToken),
      envelope = {
        commandId: "pg-surrender-command",
        expectedRevision: v.revision,
        command: { type: "SURRENDER" },
      };
    const ack = await rooms.submit(p.code, p.resumeToken, envelope);
    await rooms.close();
    const restored = new Rooms(
      new PostgresStore(process.env.POSTGRES_TEST_URL),
    );
    await restored.init();
    t.after(async () => {
      await restored.store.delete(p.code);
      await restored.close();
    });
    assert.equal(
      (await restored.submit(p.code, p.resumeToken, envelope)).revision,
      ack.revision,
    );
    assert.equal(
      (await restored.view(p.code, p.resumeToken)).game.phase,
      "ended",
    );
  },
);
module.exports = { battle };
test("lost create/join acknowledgements can be retried with the saved seat token", async (t) => {
  const e = await environment(t),
    token = "b".repeat(64),
    p = await e.rooms.create("Retry", token),
    again = await e.rooms.create("Retry", token);
  assert.deepEqual(again, p);
  const joining = "c".repeat(64),
    joined = await e.rooms.join(p.code, "Joining", joining);
  assert.deepEqual(await e.rooms.join(p.code, "Joining", joining), joined);
  assert.equal(e.rooms.room(p.code).doc.players.length, 2);
});
test("a committed write with a lost database response is recovered before retry", async (t) => {
  const e = await environment(t),
    original = e.store.save.bind(e.store),
    v = await e.rooms.view(e.p1.code, e.p1.resumeToken),
    envelope = {
      commandId: "uncertain-write",
      expectedRevision: v.revision,
      command: { type: "READY" },
    };
  let failed = false;
  e.store.save = async (...args) => {
    await original(...args);
    if (!failed) {
      failed = true;
      throw Error("CONNECTION_LOST");
    }
  };
  await assert.rejects(
    e.rooms.submit(e.p1.code, e.p1.resumeToken, envelope),
    /CONNECTION_LOST/,
  );
  const ack = await e.rooms.submit(e.p1.code, e.p1.resumeToken, envelope);
  assert.equal(ack.duplicate, true);
  assert.equal(e.rooms.room(e.p1.code).doc.journal.length, 1);
});
test("clients cannot supply HP, arbitrary state or deeply nested command payloads", async (t) => {
  const e = await environment(t);
  const before = await e.rooms.view(e.p1.code, e.p1.resumeToken);
  await assert.rejects(
    e.send(1, { type: "READY", hp: 999 }),
    /INVALID_COMMAND/,
  );
  await assert.rejects(
    e.send(1, { type: "READY", actorId: { nested: { not: "an ID" } } }),
    /INVALID_COMMAND/,
  );
  assert.deepEqual(await e.rooms.view(e.p1.code, e.p1.resumeToken), before);
});
test("retry of the randomizing ready command does not reroll dice or redeal hands", async (t) => {
  const e = await environment(t);
  await e.send(1, { type: "READY" });
  const before = await e.rooms.view(e.p2.code, e.p2.resumeToken),
    envelope = {
      commandId: "random-ready-once",
      expectedRevision: before.revision,
      command: { type: "READY" },
    };
  const replies = await Promise.all([
    e.rooms.submit(e.p2.code, e.p2.resumeToken, envelope),
    e.rooms.submit(e.p2.code, e.p2.resumeToken, envelope),
  ]);
  assert.equal(replies[1].duplicate, true);
  const room = e.rooms.room(e.p1.code),
    g = room.engine.view(1, e.now());
  assert.equal(g.phase, "team");
  assert.equal(
    room.doc.journal.filter((e) => e.command.type === "READY").length,
    2,
  );
  assert.deepEqual(
    room.engine.view(1, e.now()),
    e.rooms.rebuild(room.doc).view(1, e.now()),
  );
  assert.equal(
    room.engine.invoke("Math.random()", e.now()),
    e.rooms.rebuild(room.doc).invoke("Math.random()", e.now()),
  );
});
