"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os");
const { chromium } = require("playwright"),
  { createApp } = require("../server/app.cjs"),
  { FileStore } = require("../server/store.cjs");
const { FaultRelay } = require("./helpers/fault-relay.cjs"),
  { seedBattle } = require("./helpers/online-fixture.cjs"),
  { launchOptions } = require("./helpers/browser.cjs");
(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dw-network-")),
    output = path.resolve(__dirname, "../work/online-network");
  await fs.mkdir(output, { recursive: true });
  let offset = 0,
    completed = false;
  const now = () => Date.now() + offset;
  const seeded = await seedBattle(new FileStore(dir), now),
    relays = { 1: new FaultRelay(), 2: new FaultRelay() };
  await Promise.all(Object.values(relays).map((r) => r.listen()));
  const app = await createApp({
    store: new FileStore(dir),
    origins: Object.values(relays).map((r) => r.origin),
    now,
  });
  await app.listen(0);
  for (const r of Object.values(relays)) {
    r.target = "http://127.0.0.1:" + app.server.address().port;
    r.upMs = 150;
    r.downMs = 200;
    r.jitterMs = 25;
  }
  const browser = await chromium.launch(launchOptions()),
    pages = {},
    errors = [],
    checks = [];
  const storageKey = (side) => "dozenwar-online-v1:" + relays[side].origin;
  const game = (side) =>
    app.rooms.room(seeded.code).engine.view(side || 1, now());
  const journal = (type) =>
    app.rooms
      .room(seeded.code)
      .doc.journal.filter((e) => e.command.type === type);
  async function until(fn, label, ms = 18000) {
    const stop = Date.now() + ms;
    while (!(await fn())) {
      if (Date.now() > stop) throw Error("Timed out: " + label);
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  async function outbox(side) {
    return pages[side].evaluate(
      (k) => JSON.parse(localStorage.getItem(k) || "{}").outbox,
      storageKey(side),
    );
  }
  function passed(text) {
    checks.push(text);
    console.log("PASS | " + text);
  }
  try {
    let healthDropped = false;
    relays[3 - seeded.side].httpFault = (req) => {
      if (req.url === "/api/health" && !healthDropped) {
        healthDropped = true;
        return true;
      }
      return false;
    };
    let resumeDropped = false,
      olderFrame;
    relays[seeded.side].filter = ({ direction, packet, data }) => {
      if (direction === "down" && packet?.event === "state" && !olderFrame)
        olderFrame = data;
      if (
        direction === "down" &&
        packet?.kind === "ack" &&
        packet.data?.code &&
        packet.data?.side &&
        !packet.data.resumeToken &&
        !resumeDropped
      ) {
        resumeDropped = true;
        return false;
      }
    };
    for (const side of [1, 2]) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 1000 },
      });
      await context.addInitScript(
        ({ key, session }) => {
          if (!localStorage.getItem(key))
            localStorage.setItem(key, JSON.stringify({ session }));
        },
        { key: storageKey(side), session: seeded.seats[side] },
      );
      const p = await context.newPage();
      pages[side] = p;
      p.on("pageerror", (e) => errors.push(e.message));
      await p.goto(relays[side].origin + "/online/");
    }
    await until(() => resumeDropped, "drop resume acknowledgement");
    const active = pages[seeded.side],
      defender = pages[3 - seeded.side];
    await active.locator("#roomLabel").waitFor();
    assert.equal(
      await active
        .getByRole("button", { name: "Đánh thường + Búa Chiến", exact: true })
        .isDisabled(),
      true,
      "commands must wait for seat authorization",
    );
    await Promise.all(
      [1, 2].map((s) =>
        pages[s].getByText("Đã kết nối", { exact: true }).waitFor(),
      ),
    );
    passed(
      "Lost resume acknowledgement retries on the same socket; controls stay locked until authenticated",
    );
    assert.equal(healthDropped, true);
    // A transient HTTP failure during bootstrap must recover without reloading the page.
    assert.equal(
      await pages[3 - seeded.side].locator("#notice").innerText(),
      "",
    );
    passed(
      "A temporary HTTP 503 during initial API loading recovers automatically",
    );
    const a = game().units.find((u) => u.hero && u.side === seeded.side),
      d = game().units.find((u) => u.hero && u.side !== seeded.side),
      initialHP = d.hp;
    let droppedAttack = false;
    relays[seeded.side].filter = ({ direction, packet }) => {
      if (
        direction === "down" &&
        packet?.kind === "ack" &&
        packet.data?.commandId &&
        !droppedAttack
      ) {
        droppedAttack = true;
        return false;
      }
    };
    const activeHand = game(seeded.side).hand.length;
    await active
      .getByRole("button", { name: "Đánh thường + Búa Chiến", exact: true })
      .click();
    await active.locator('[data-unit="' + d.id + '"] .unitHit').click();
    await active
      .getByRole("button", { name: "Xác nhận hành động", exact: true })
      .click();
    await until(
      () => journal("ATTACK").length === 1,
      "equipment attack accepted",
    );
    await until(
      async () => droppedAttack && !(await outbox(seeded.side)),
      "automatic retry of lost attack acknowledgement",
    );
    const attempts = relays[seeded.side].commands.filter(
      (c) => c.command.type === "ATTACK",
    );
    assert.ok(attempts.length >= 2);
    assert.equal(new Set(attempts.map((c) => c.commandId)).size, 1);
    assert.equal(journal("ATTACK").length, 1);
    assert.equal(game(seeded.side).hand.length, activeHand - 1);
    assert.ok(game().reaction);
    passed(
      "350–450 ms round trips with jitter and a lost committed ACK: same command retried automatically, one card spent",
    );
    relays[seeded.side].filter = null;
    const defending = 3 - seeded.side,
      defHand = game(defending).hand.length;
    let droppedCounter = false;
    relays[defending].filter = ({ direction, packet }) => {
      if (
        direction === "down" &&
        packet?.kind === "ack" &&
        packet.data?.commandId &&
        !droppedCounter
      ) {
        droppedCounter = true;
        relays[defending].setOffline(true);
        return false;
      }
    };
    await defender
      .getByRole("button", { name: "Hủy bằng Dây Chuyền May Mắn", exact: true })
      .click();
    await until(
      () => droppedCounter && journal("COUNTER_CARD").length === 1,
      "counter accepted before connection loss",
    );
    assert.ok(
      await outbox(defending),
      "unacknowledged counter is durable in browser",
    );
    relays[defending].filter = null;
    relays[defending].setOffline(false);
    await defender.reload();
    await defender.getByText("Đã kết nối", { exact: true }).waitFor();
    await until(
      async () => !(await outbox(defending)),
      "reload retries counter",
    );
    const counterAttempts = relays[defending].commands.filter(
      (c) => c.command.type === "COUNTER_CARD",
    );
    assert.ok(counterAttempts.length >= 2);
    assert.equal(new Set(counterAttempts.map((c) => c.commandId)).size, 1);
    assert.equal(journal("COUNTER_CARD").length, 1);
    assert.equal(game(defending).hand.length, defHand - 1);
    assert.equal(game().units.find((u) => u.id === d.id).hp, initialHP);
    passed(
      "Disconnect and reload after counter payment preserve the seat, pending defense and exactly one card cost",
    );
    await active
      .locator(
        '#room[data-revision="' +
          app.rooms.room(seeded.code).doc.revision +
          '"]',
      )
      .waitFor();
    const revision = await active
      .locator("#room")
      .getAttribute("data-revision");
    assert.ok(olderFrame);
    for (const link of relays[seeded.side].links) link.client.send(olderFrame);
    await new Promise((r) => setTimeout(r, 350));
    assert.equal(
      await active.locator("#room").getAttribute("data-revision"),
      revision,
    );
    passed("A delayed older state frame cannot roll the client back");
    relays[defending].setOffline(true);
    await until(
      async () =>
        !(await defender.locator("#connection").innerText()).includes(
          "Đã kết nối",
        ),
      "defender disconnect",
    );
    offset += 35000;
    await until(
      () => game().pending === null,
      "server expires absent defender",
    );
    assert.equal(game().units.find((u) => u.id === d.id).hp, initialHP - 1);
    assert.equal(journal("TIMEOUT").length, 1);
    relays[defending].setOffline(false);
    await defender.getByText("Đã kết nối", { exact: true }).waitFor();
    passed(
      "Missing defender does not freeze the server clock (35 seconds advanced in the test clock); damage resolves once",
    );
    let lostBeforeServer = false;
    relays[seeded.side].filter = ({ direction, packet }) => {
      if (
        direction === "up" &&
        packet?.event === "command" &&
        packet.data.command.type === "END_TURN" &&
        !lostBeforeServer
      ) {
        lostBeforeServer = true;
        relays[seeded.side].setOffline(true);
        return false;
      }
    };
    await active
      .getByRole("button", { name: "Kết thúc lượt", exact: true })
      .click();
    await until(() => lostBeforeServer, "drop outgoing turn command");
    assert.equal(journal("END_TURN").length, 0);
    relays[seeded.side].filter = null;
    relays[seeded.side].upMs = 450;
    relays[seeded.side].downMs = 500;
    relays[seeded.side].jitterMs = 50;
    relays[seeded.side].upBytesPerSecond = 16 * 1024;
    relays[seeded.side].downBytesPerSecond = 64 * 1024;
    relays[seeded.side].setOffline(false);
    await active.getByText("Đã kết nối", { exact: true }).waitFor();
    await until(
      async () =>
        journal("END_TURN").length === 1 && !(await outbox(seeded.side)),
      "unsent command retried after reconnect",
    );
    assert.equal(game().turn, 2);
    passed(
      "An outgoing command lost before reaching the server survives reconnect at roughly 1 second RTT with 128/512 kbps uplink/downlink limits",
    );
    assert.deepEqual(errors, []);
    await active.screenshot({
      path: path.join(output, "recovered.png"),
      fullPage: true,
    });
    completed = true;
  } finally {
    await fs.writeFile(
      path.join(output, "report.json"),
      JSON.stringify(
        {
          passed: completed,
          checks,
          scope:
            "Loopback WebSocket frame fault injection; deadline uses an advanced server clock",
        },
        null,
        2,
      ),
    );
    await browser.close();
    await Promise.all(Object.values(relays).map((r) => r.close()));
    await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
