"use strict";
const { io } = require("socket.io-client"),
  { randomUUID } = require("node:crypto"),
  { performance } = require("node:perf_hooks");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function summary(values) {
  const v = [...values].sort((a, b) => a - b),
    q = (n) => v[Math.min(v.length - 1, Math.floor(v.length * n))] || 0;
  return {
    count: v.length,
    meanMs: v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0,
    p50Ms: q(0.5),
    p95Ms: q(0.95),
    p99Ms: q(0.99),
    maxMs: v.at(-1) || 0,
  };
}
async function drive({
  url,
  rooms,
  seconds,
  intervalMs = 1000,
  progress = () => {},
}) {
  const sockets = [],
    scenarios = [],
    latency = [],
    stateLatency = [],
    broadcastLatency = [],
    failures = [],
    kinds = {},
    sessions = [],
    pendingViews = new Map();
  let unexpectedDisconnects = 0,
    monitoring = false;
  async function connect(index) {
    const s = io(url, {
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      extraHeaders: {
        "X-Forwarded-For":
          "10.77." + Math.floor(index / 250) + "." + ((index % 250) + 1),
      },
    });
    sockets.push(s);
    s.on("disconnect", () => {
      if (monitoring) unexpectedDisconnects++;
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error("CONNECT_TIMEOUT")), 10000);
      s.once("connect", () => {
        clearTimeout(timer);
        resolve();
      });
      s.once("connect_error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
    return s;
  }
  async function request(s, event, payload = {}) {
    return new Promise((resolve, reject) =>
      s
        .timeout(15000)
        .emit(event, payload, (err, result) =>
          err
            ? reject(err)
            : result?.ok
              ? resolve(result)
              : reject(Error(result?.error || "NO_REPLY")),
        ),
    );
  }
  const sync = async (s) => (await request(s, "room:sync")).state;
  async function command(s, view, action, measured = false) {
    const envelope = {
        commandId: randomUUID(),
        expectedRevision: view.revision,
        command: action,
      },
      begin = performance.now(),
      key = view.code + ":" + (view.revision + 1);
    if (measured) pendingViews.set(key, { begin, sides: new Set() });
    try {
      const ack = await request(s, "command", envelope);
      if (measured) {
        latency.push(performance.now() - begin);
        kinds[action.type] = (kinds[action.type] || 0) + 1;
      }
      const after = performance.now(),
        next = await sync(s);
      if (next.revision < ack.revision) throw Error("STATE_BEHIND_ACK");
      if (measured) stateLatency.push(performance.now() - after);
      return next;
    } catch (error) {
      if (measured) pendingViews.delete(key);
      throw error;
    }
  }
  function watch(s) {
    s.on("state", (view) => {
      const m = pendingViews.get(view.code + ":" + view.revision);
      if (!m) return;
      m.sides.add(view.side);
      if (m.sides.size === 2) {
        broadcastLatency.push(performance.now() - m.begin);
        pendingViews.delete(view.code + ":" + view.revision);
      }
    });
  }
  function deployment(catalog, g, side) {
    const hero = { q: 2, r: side === 1 ? 1 : -1 },
      available = catalog.cells.filter(
        (c) => c.zone === side && (c.q !== hero.q || c.r !== hero.r),
      ),
      ids = [
        g.teams[side].heroDefinitionId,
        "UNIT_INF_001",
        "UNIT_INF_001",
        "UNIT_INF_001",
        "UNIT_ARCH_001",
        "UNIT_CAV_001",
      ];
    return ids.map((definitionId, i) => ({
      definitionId,
      ...(i ? { q: available[i - 1].q, r: available[i - 1].r } : hero),
    }));
  }
  function nextAction(g, side, index = 0) {
    const o = g.options;
    if (g.phase === "ready") return { type: "READY" };
    if (g.phase === "team")
      return {
        type: "TEAM",
        heroId:
          catalog.heroes[
            (index + (side === 1 ? g.matchNo : g.matchNo + 3)) %
              catalog.heroes.length
          ].id,
        troops: { inf: 3, arch: 1, cav: 1 },
      };
    if (g.phase === "deploy")
      return { type: "DEPLOY", units: deployment(catalog, g, side) };
    if (g.phase === "ended") return { type: "REMATCH" };
    if (o.counter) return { type: "PASS_COUNTER" };
    if (o.post) return { type: "POST_HIT" };
    if (o.continuation) {
      const p = o.continuation;
      return o.recovery
        ? { type: "SKIP_CONTINUE" }
        : { type: "CONTINUE", targetIds: p.targetIds.slice(0, 1) };
    }
    if (g.pending) return { type: "DEFEND" };
    for (const a of o.actors || []) {
      const attack =
        a.attacks.find((p) => p.cardUid && p.targetIds.length) ||
        a.attacks.find((p) => p.targetIds.length);
      if (attack)
        return {
          type: "ATTACK",
          actorId: a.id,
          targetIds: attack.targetIds.slice(0, 1),
          cardUid: attack.cardUid,
        };
    }
    for (const a of o.actors || []) {
      const u = g.units.find((u) => u.id === a.id),
        enemies = g.units.filter((u) => u.side !== side && u.hp > 0),
        distance = (a, b) =>
          Math.max(
            Math.abs(a.q - b.q),
            Math.abs(a.r - b.r),
            Math.abs(a.q + a.r - b.q - b.r),
          ),
        near = (c) => Math.min(...enemies.map((e) => distance(c, e))),
        cell = a.moves
          .filter((c) => c.q !== u.q || c.r !== u.r)
          .sort((a, b) => near(a) - near(b))[0];
      if (cell) return { type: "MOVE", actorId: a.id, cell };
    }
    return { type: "END_TURN" };
  }
  let catalog;
  try {
    catalog = await fetch(url + "/api/catalog").then((r) => {
      if (!r.ok) throw Error("CATALOG_UNAVAILABLE");
      return r.json();
    });
    // Stagger setup in batches. Every virtual player gets its own trusted-proxy IP; production limits stay enabled.
    for (let start = 0; start < rooms; start += 5) {
      await Promise.all(
        Array.from(
          { length: Math.min(5, rooms - start) },
          async (_, offset) => {
            const index = start + offset,
              a = await connect(index * 2),
              b = await connect(index * 2 + 1),
              p1 = await request(a, "room:create", {
                name: "Load " + index + " A",
              }),
              p2 = await request(b, "room:join", {
                name: "Load " + index + " B",
                code: p1.code,
              });
            const pair = { 1: a, 2: b };
            sessions.push(p1, p2);
            watch(a);
            watch(b);
            let v = await sync(a);
            v = await command(a, v, { type: "READY" });
            v = await command(b, await sync(b), { type: "READY" });
            for (let i = 0; i < 4; i++) {
              const side = v.game.selecting;
              v = await command(
                pair[side],
                await sync(pair[side]),
                nextAction(v.game, side, index),
              );
            }
            if (v.game.phase !== "battle") throw Error("SETUP_FAILED");
            scenarios.push({ index, pair, view: v });
          },
        ),
      );
      progress({ phase: "setup", rooms: Math.min(rooms, start + 5) });
    }
    const begun = Date.now(),
      stop = begun + seconds * 1000;
    monitoring = true;
    progress({ phase: "measuring", rooms, at: begun });
    await Promise.all(
      scenarios.map(async (scenario) => {
        await sleep((scenario.index % 10) * Math.min(intervalMs / 10, 80));
        while (Date.now() < stop) {
          const at = Date.now();
          try {
            const snapshot = await sync(scenario.pair[1]),
              g = snapshot.game;
            let side = g.battleSide;
            if (g.phase === "ready") side = g.ready[0] ? 2 : 1;
            else if (["team", "deploy"].includes(g.phase)) side = g.selecting;
            else if (g.phase === "ended") side = g.rematch.includes(1) ? 2 : 1;
            else if (g.clock && g.clock.kind !== "turn") side = g.clock.side;
            const view =
              side === 1 ? snapshot : await sync(scenario.pair[side]);
            scenario.view = await command(
              scenario.pair[side],
              view,
              nextAction(view.game, side, scenario.index),
              true,
            );
          } catch (error) {
            failures.push({ roomIndex: scenario.index, error: error.message });
          }
          await sleep(Math.max(0, intervalMs - (Date.now() - at)));
        }
      }),
    );
    const ended = Date.now();
    await sleep(200);
    monitoring = false;
    return {
      rooms,
      players: rooms * 2,
      intervalMs,
      requestedSeconds: seconds,
      measurementStart: begun,
      measurementEnd: ended,
      durationSeconds: (ended - begun) / 1000,
      commands: latency.length,
      commandsPerSecond: latency.length / ((ended - begun) / 1000),
      commandAck: summary(latency),
      sync: summary(stateLatency),
      bothPlayersState: summary(broadcastLatency),
      missingBroadcasts: pendingViews.size,
      unexpectedDisconnects,
      failures,
      actions: kinds,
    };
  } finally {
    monitoring = false;
    sockets.forEach((s) => s.disconnect());
  }
}
module.exports = { drive, summary };
