"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os");
const { io } = require("socket.io-client"),
  { createApp } = require("../app.cjs"),
  { FileStore } = require("../store.cjs");
function request(socket, event, data = {}) {
  return new Promise((resolve, reject) =>
    socket
      .timeout(3000)
      .emit(event, data, (error, result) =>
        error ? reject(error) : resolve(result),
      ),
  );
}
test("two WebSocket clients share public state, keep hands private and resume their own seat", async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dw-ws-")),
    app = await createApp({ store: new FileStore(dir) });
  await app.listen(0);
  const base = "http://127.0.0.1:" + app.server.address().port,
    sockets = [];
  t.after(async () => {
    sockets.forEach((s) => s.disconnect());
    await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  });
  async function connect() {
    const s = io(base, { transports: ["websocket"], forceNew: true });
    sockets.push(s);
    await new Promise((resolve, reject) => {
      s.once("connect", resolve);
      s.once("connect_error", reject);
    });
    return s;
  }
  const a = await connect(),
    b = await connect(),
    p1 = await request(a, "room:create", { name: "Alice" }),
    p2 = await request(b, "room:join", { name: "Bob", code: p1.code });
  assert.equal(p2.side, 2);
  let v = (await request(a, "room:sync")).state;
  assert.equal(v.players.length, 2);
  await request(a, "command", {
    commandId: "ready-alice",
    expectedRevision: v.revision,
    command: { type: "READY" },
  });
  v = (await request(b, "room:sync")).state;
  await request(b, "command", {
    commandId: "ready-bob-1",
    expectedRevision: v.revision,
    command: { type: "READY" },
  });
  const av = (await request(a, "room:sync")).state,
    bv = (await request(b, "room:sync")).state;
  assert.equal(av.game.phase, "team");
  for (const card of bv.game.hand)
    assert.ok(!JSON.stringify(av).includes(card.uid));
  assert.equal(
    (
      await request(a, "command", {
        commandId: "bad-command-1",
        expectedRevision: av.revision,
        command: { type: "TIMEOUT" },
      })
    ).error,
    "UNKNOWN_COMMAND",
  );
  b.disconnect();
  const c = await connect();
  assert.equal(
    (
      await request(c, "room:resume", {
        code: p2.code,
        resumeToken: p1.resumeToken,
      })
    ).side,
    1,
  ); // A valid token always selects its own seat, never the caller's claimed side.
  const d = await connect();
  await request(d, "room:resume", p2);
  assert.equal((await request(d, "room:sync")).state.side, 2);
  const bad = io(base, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
    extraHeaders: { Origin: "https://untrusted.invalid" },
  });
  sockets.push(bad);
  await new Promise((resolve, reject) => {
    bad.once("connect", () => reject(Error("Untrusted origin connected")));
    bad.once("connect_error", resolve);
  });
  assert.equal((await fetch(base + "/api/health")).status, 200);
  assert.equal((await fetch(base + "/server/main.cjs")).status, 404);
  assert.equal((await fetch(base + "/online/client.js")).status, 200);
});
