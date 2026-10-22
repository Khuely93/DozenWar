"use strict";
const crypto = require("node:crypto");
const { Engine, codeHash } = require("./engine.cjs");
const { validateCommand } = require("./protocol.cjs");
const ALLOWED = new Set([
  "SKIP_CONTINUE",
  "READY",
  "TEAM",
  "DEPLOY",
  "MOVE",
  "ATTACK",
  "SKILL",
  "CARD",
  "DEFEND",
  "END_TURN",
  "CONTINUE",
  "COUNTER_CARD",
  "PASS_COUNTER",
  "POST_HIT",
  "STEAL_CHOOSE",
  "SURRENDER",
  "REMATCH",
]);
function requireValue(value, code) {
  if (!value) throw Error(code);
}
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
function tokenHash(token) {
  requireValue(
    typeof token === "string" && /^[a-f0-9]{64}$/.test(token),
    "UNAUTHORIZED",
  );
  return hash(token);
}
function fingerprint(value) {
  const sorted = (v) =>
    Array.isArray(v)
      ? v.map(sorted)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, sorted(v[k])]),
          )
        : v;
  return hash(JSON.stringify(sorted(value)));
}
class Rooms {
  constructor(
    store,
    { now = Date.now, maxRooms = 100, maxCommands = 2000 } = {},
  ) {
    this.store = store;
    this.now = now;
    this.maxRooms = maxRooms;
    this.maxCommands = maxCommands;
    this.rooms = new Map();
    this.queues = new Map();
  }
  rebuild(doc) {
    requireValue(doc.runtimeHash === codeHash, "BUILD_MISMATCH");
    const engine = new Engine(doc.seed, doc.createdAt);
    for (const e of doc.journal) engine.command(e.side, e.command, e.at);
    return engine;
  }
  async init() {
    await this.store.init();
    for (const doc of await this.store.all()) {
      let engine = null;
      try {
        engine = this.rebuild(doc);
      } catch (error) {
        if (error.message !== "BUILD_MISMATCH") throw error;
      }
      this.rooms.set(doc.code, { doc, engine });
    }
  }
  queue(code, fn) {
    const old = this.queues.get(code) || Promise.resolve();
    const next = old.catch(() => {}).then(fn),
      tail = next.catch(() => {});
    this.queues.set(code, tail);
    tail.then(() => {
      if (this.queues.get(code) === tail) this.queues.delete(code);
    });
    return next;
  }
  room(code) {
    requireValue(
      typeof code === "string" && /^[A-Z2-9]{8}$/.test(code),
      "INVALID_ROOM",
    );
    const room = this.rooms.get(code);
    requireValue(room, "ROOM_NOT_FOUND");
    requireValue(room.engine, "BUILD_MISMATCH");
    return room;
  }
  actor(doc, token) {
    const h = tokenHash(token);
    const p = doc.players.find((p) =>
      crypto.timingSafeEqual(
        Buffer.from(p.tokenHash, "hex"),
        Buffer.from(h, "hex"),
      ),
    );
    requireValue(p, "UNAUTHORIZED");
    return p;
  }
  async create(name, requestedToken) {
    return this.queue("__create__", async () => {
      if (this.needsCreateRefresh) {
        for (const doc of await this.store.all())
          if (!this.rooms.has(doc.code))
            this.rooms.set(doc.code, { doc, engine: this.rebuild(doc) });
        this.needsCreateRefresh = false;
      }
      if (requestedToken) {
        const h = tokenHash(requestedToken);
        for (const { doc } of this.rooms.values()) {
          const p = doc.players.find((p) => p.tokenHash === h);
          if (p)
            return {
              code: doc.code,
              side: p.side,
              resumeToken: requestedToken,
              revision: doc.revision,
            };
        }
      }
      requireValue(this.rooms.size < this.maxRooms, "SERVER_FULL");
      let code;
      do {
        code = crypto
          .randomBytes(8)
          .toString("hex")
          .slice(0, 8)
          .toUpperCase()
          .replace(/0/g, "G")
          .replace(/1/g, "H");
      } while (this.rooms.has(code));
      const token = requestedToken || crypto.randomBytes(32).toString("hex"),
        at = this.now(),
        doc = {
          code,
          seed: crypto.randomBytes(32).toString("hex"),
          runtimeHash: codeHash,
          createdAt: at,
          updatedAt: at,
          revision: 0,
          players: [{ side: 1, name: this.name(name), tokenHash: hash(token) }],
          journal: [],
          receipts: {},
        };
      const engine = this.rebuild(doc);
      try {
        await this.store.save(doc, null);
      } catch (error) {
        this.needsCreateRefresh = true;
        throw error;
      }
      this.rooms.set(code, { doc, engine });
      return { code, side: 1, resumeToken: token, revision: 0 };
    });
  }
  name(name) {
    requireValue(
      typeof name === "string" &&
        name.trim().length >= 1 &&
        name.trim().length <= 32,
      "INVALID_NAME",
    );
    return name.trim();
  }
  async join(code, name, requestedToken) {
    return this.queue(code, async () => {
      const room = this.room(code);
      await this.refresh(room);
      if (requestedToken) {
        const h = tokenHash(requestedToken),
          p = room.doc.players.find((p) => p.tokenHash === h);
        if (p)
          return {
            code,
            side: p.side,
            resumeToken: requestedToken,
            revision: room.doc.revision,
          };
      }
      await this.expire(room);
      requireValue(
        room.doc.players.length === 1 &&
          room.engine.view(1, this.now()).phase === "ready",
        "ROOM_FULL",
      );
      const token = requestedToken || crypto.randomBytes(32).toString("hex"),
        old = room.doc,
        doc = {
          ...old,
          players: [
            ...old.players,
            { side: 2, name: this.name(name), tokenHash: hash(token) },
          ],
          revision: old.revision + 1,
          updatedAt: this.now(),
        };
      await this.persist(room, doc);
      return { code, side: 2, resumeToken: token, revision: doc.revision };
    });
  }
  async resume(code, token) {
    return this.queue(code, async () => {
      const room = this.room(code);
      await this.refresh(room);
      const actor = this.actor(room.doc, token);
      await this.expire(room);
      return { code, side: actor.side, revision: room.doc.revision };
    });
  }
  async refresh(room) {
    if (!room.needsReload) return;
    const doc = await this.store.get(room.doc.code);
    requireValue(doc, "ROOM_NOT_FOUND");
    const engine = this.rebuild(doc);
    room.doc = doc;
    room.engine = engine;
    room.needsReload = false;
  }
  async persist(room, doc) {
    const old = room.doc;
    try {
      await this.store.save(doc, old.revision);
      room.doc = doc;
    } catch (error) {
      room.engine = this.rebuild(old);
      room.needsReload = true;
      try {
        await this.refresh(room);
      } catch {}
      throw error;
    }
  }
  async expire(room) {
    let count = 0,
      changed = false;
    while (
      room.engine.deadline() !== null &&
      room.engine.deadline() <= this.now()
    ) {
      requireValue(++count <= 100, "TIMEOUT_CATCHUP_LIMIT");
      const at = room.engine.deadline(),
        event = { side: 0, command: { type: "TIMEOUT" }, at },
        old = room.doc;
      try {
        room.engine.command(0, event.command, at);
      } catch (error) {
        room.engine = this.rebuild(old);
        throw error;
      }
      await this.persist(room, {
        ...old,
        journal: [...old.journal, event],
        revision: old.revision + 1,
        updatedAt: at,
      });
      changed = true;
    }
    return changed;
  }
  async submit(code, token, envelope) {
    return this.queue(code, async () => {
      const room = this.room(code);
      await this.refresh(room);
      const actor = this.actor(room.doc, token);
      requireValue(
        envelope &&
          typeof envelope === "object" &&
          JSON.stringify(envelope).length <= 12000,
        "INVALID_ENVELOPE",
      );
      const { commandId, expectedRevision, command } = envelope;
      requireValue(
        typeof commandId === "string" &&
          /^[a-zA-Z0-9_-]{8,80}$/.test(commandId) &&
          Number.isSafeInteger(expectedRevision),
        "INVALID_ENVELOPE",
      );
      requireValue(command && ALLOWED.has(command.type), "UNKNOWN_COMMAND");
      validateCommand(command);
      const receiptKey = actor.side + ":" + commandId,
        fp = fingerprint(command),
        receipt = room.doc.receipts[receiptKey];
      if (receipt) {
        requireValue(receipt.fingerprint === fp, "COMMAND_ID_REUSED");
        return { ...receipt.ack, duplicate: true };
      }
      await this.expire(room);
      requireValue(expectedRevision === room.doc.revision, "STALE_STATE");
      requireValue(
        room.doc.players.length === 2 || command.type === "SURRENDER",
        "WAITING_FOR_OPPONENT",
      );
      requireValue(
        room.doc.journal.length < this.maxCommands ||
          command.type === "SURRENDER",
        "ROOM_COMMAND_LIMIT",
      );
      const old = room.doc,
        at = this.now(),
        event = { side: actor.side, command: structuredClone(command), at };
      try {
        room.engine.command(actor.side, event.command, at);
      } catch (error) {
        room.engine = this.rebuild(old);
        throw error;
      }
      const ack = { ok: true, commandId, revision: old.revision + 1 },
        doc = {
          ...old,
          revision: ack.revision,
          updatedAt: at,
          journal: [...old.journal, event],
          receipts: { ...old.receipts, [receiptKey]: { fingerprint: fp, ack } },
        };
      await this.persist(room, doc);
      return ack;
    });
  }
  async view(code, token) {
    return this.queue(code, async () => {
      const room = this.room(code);
      await this.refresh(room);
      const actor = this.actor(room.doc, token);
      await this.expire(room);
      return {
        protocol: 1,
        code,
        revision: room.doc.revision,
        side: actor.side,
        players: room.doc.players.map(({ side, name }) => ({ side, name })),
        serverTime: this.now(),
        game: room.engine.view(actor.side, this.now()),
      };
    });
  }
  async tick() {
    const changed = [];
    for (const [code, room] of this.rooms) {
      if (!room.engine) continue;
      await this.queue(code, async () => {
        await this.refresh(room);
        if (await this.expire(room)) changed.push(code);
        if (
          room.engine.invoke("S.phase==='ended'", this.now()) &&
          this.now() - room.doc.updatedAt > 86400000
        ) {
          await this.store.delete(code);
          this.rooms.delete(code);
        }
      });
    }
    return changed;
  }
  async close() {
    await Promise.all(this.queues.values());
    await this.store.close();
  }
}
module.exports = { Rooms };
