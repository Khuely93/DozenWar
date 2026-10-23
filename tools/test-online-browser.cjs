"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  os = require("node:os"),
  path = require("node:path");
const { chromium } = require("playwright"),
  { createApp } = require("../server/app.cjs"),
  { FileStore } = require("../server/store.cjs");
(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "dw-browser-")),
    screens = path.resolve(__dirname, "../work/online-browser");
  await fs.mkdir(screens, { recursive: true });
  let app = await createApp({ store: new FileStore(dir) });
  await app.listen(0);
  const port = app.server.address().port,
    base = "http://127.0.0.1:" + port;
  const browser = await chromium.launch(
      require("./helpers/browser.cjs").launchOptions(),
    ),
    contexts = [],
    errors = [];
  try {
    const pages = [];
    for (let i = 0; i < 2; i++) {
      const c = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
      });
      contexts.push(c);
      const p = await c.newPage();
      p.on("pageerror", (e) => errors.push(e.message));
      p.on("console", (m) => {
        if (
          m.type() === "error" &&
          !m.text().includes("Failed to load resource")
        )
          errors.push(m.text());
      });
      pages.push(p);
      await p.goto(base + "/online/");
      await p.getByText("Đã kết nối", { exact: true }).waitFor();
    }
    await pages[0]
      .getByRole("button", { name: "Tạo phòng", exact: true })
      .click();
    await pages[0].locator("#roomLabel").waitFor();
    const code = (await pages[0].locator("#roomLabel").innerText())
      .split(" ")
      .pop();
    await pages[1].locator("#roomCode").fill(code);
    await pages[1]
      .getByRole("button", { name: "Vào phòng", exact: true })
      .click();
    await pages[1].locator("#roomLabel").waitFor();
    async function until(predicate) {
      const end = Date.now() + 15000;
      while (!predicate()) {
        if (Date.now() > end)
          throw Error(
            "Browser transition timed out: " +
              (
                await Promise.all(
                  pages.map((p) => p.locator("#notice").innerText()),
                )
              ).join(" / "),
          );
        await new Promise((r) => setTimeout(r, 50));
      }
    }
    const game = () => app.rooms.room(code).engine.view(1, Date.now());
    for (const p of pages) {
      await p.getByRole("button", { name: "Sẵn sàng", exact: true }).click();
    }
    await until(() => game().phase === "team");
    for (let i = 0; i < 2; i++) {
      const side = game().selecting;
      await pages[side - 1]
        .getByRole("button", { name: "Xác nhận đội hình", exact: true })
        .click();
      await until(() => game().phase !== "team" || game().selecting !== side);
    }
    for (let i = 0; i < 2; i++) {
      const side = game().selecting,
        p = pages[side - 1];
      await p.getByRole("heading", { name: "Xếp quân", exact: true }).waitFor();
      await p.locator('[data-cell="2,' + (side === 1 ? 1 : -1) + '"]').click();
      await p
        .getByRole("button", { name: "Xác nhận xếp quân", exact: true })
        .click();
      await until(() => game().phase !== "deploy" || game().selecting !== side);
    }
    await until(() => game().phase === "battle");
    // Both seats load the same new transparent Hero atlases in real multiplayer.
    for(const p of pages){
      await p.waitForFunction(()=>document.querySelectorAll('[data-unit] svg.heroBoardSprite').length===2);
      const visuals=await p.locator('[data-unit] svg.heroBoardSprite').evaluateAll(nodes=>nodes.map(n=>({id:n.getAttribute('data-hero'),pose:n.getAttribute('data-facing'),source:n.querySelector('image').getAttribute('href')})));
      assert.equal(visuals.length,2);assert(visuals.every(v=>v.source.includes('/assets/heroes-camera-06/')));
      assert.deepEqual(visuals.map(v=>v.pose).sort(),['back','front']);
      await p.evaluate(async()=>{await Promise.all(Array.from(document.querySelectorAll('image.heroAtlasImage'),n=>{const im=new Image();im.src=n.getAttribute('href');return im.decode()}))});
    }
    const side = game().battleSide,
      attacker = pages[side - 1],
      defender = pages[2 - side];
    const defenderHero = game().units.find((u) => u.hero && u.side !== side),
      hp = defenderHero.hp;
    await attacker
      .getByRole("button", { name: "Khóa Xích", exact: true })
      .click();
    await attacker.locator('[data-unit="' + defenderHero.id + '"] .unitHit').click();
    await attacker
      .getByRole("button", { name: "Xác nhận hành động", exact: true })
      .click();
    await until(() => !!game().pending);
    await defender
      .getByRole("button", { name: "Nhận đòn / Bỏ qua phòng thủ", exact: true })
      .waitFor();
    await attacker.screenshot({
      path: path.join(screens, "attacker-pending.png"),
      fullPage: true,
    });
    await defender.screenshot({
      path: path.join(screens, "defender-pending.png"),
      fullPage: true,
    });
    for(const p of pages){
      const facing=await p.locator('[data-unit] svg.heroBoardSprite').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-facing')));
      assert.equal(facing.length,2);assert(facing.every(f=>['front','back','front+45','back+45','front-45','back-45'].includes(f)));
    }
    const snapshot = game();
    await app.close();
    app = await createApp({ store: new FileStore(dir) });
    await app.listen(port);
    assert.deepEqual(game().pending, snapshot.pending);
    await defender.getByText("Đã kết nối", { exact: true }).waitFor();
    await defender
      .getByRole("button", { name: "Nhận đòn / Bỏ qua phòng thủ", exact: true })
      .click();
    await until(
      () =>
        !game().pending ||
        !!app.rooms.room(code).engine.view(3 - side, Date.now()).options.post,
    );
    if (app.rooms.room(code).engine.view(3 - side, Date.now()).options.post) {
      await defender
        .getByRole("button", { name: "Bỏ qua phản sát thương", exact: true })
        .click();
      await until(() => !game().pending);
    }
    assert.equal(game().units.find((u) => u.id === defenderHero.id).hp, hp - 2);
    await attacker
      .getByRole("button", { name: "Kết thúc lượt", exact: true })
      .click();
    await until(() => game().turn === 2);
    // A page reload resumes the same seat and state, with no manual room re-entry.
    await defender.reload();
    await defender.getByText("Đã kết nối", { exact: true }).waitFor();
    await defender.locator("#roomLabel").waitFor();
    assert.equal(
      await defender.locator("#roomLabel").innerText(),
      "PHÒNG " + code,
    );
    const v = app.rooms.room(code).engine.view(3 - side, Date.now()),
      movable = v.options.actors.find((a) => a.moves.length);
    assert.ok(movable);
    await defender
      .getByLabel("Quân điều khiển", { exact: true })
      .selectOption(movable.id);
    await defender
      .getByRole("button", { name: "Di chuyển", exact: true })
      .click();
    const u = v.units.find((u) => u.id === movable.id),
      cell = movable.moves.find((c) => c.q !== u.q || c.r !== u.r);
    assert.ok(cell);
    await defender
      .locator('[data-cell="' + cell.q + "," + cell.r + '"]')
      .click();
    await defender
      .getByRole("button", { name: "Xác nhận hành động", exact: true })
      .click();
    await until(() =>
      game().units.some(
        (u) => u.id === movable.id && u.q === cell.q && u.r === cell.r,
      ),
    );
    await defender.screenshot({
      path: path.join(screens, "turn-two.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "Online browser: two independent seats, setup, skill attack, restart during defense, HP resolution, turn switch, reload/resume and move: PASS",
    );
  } finally {
    await browser.close();
    await app.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
