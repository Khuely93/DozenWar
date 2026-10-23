const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const { createApp } = require('../server/app.cjs');
const { FileStore } = require('../server/store.cjs');
const fixtures = require('./ui-reference/fixtures.cjs');

(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'dw-deploy-ui-'));
  const output = path.resolve(__dirname, '../work/deployment-start');
  await fs.mkdir(output, { recursive: true });
  const report = [], errors = [], missing = [];
  let app, browser;
  try {
    app = await createApp({ store: new FileStore(temp) }); await app.listen(0);
    browser = await chromium.launch(require('./helpers/browser.cjs').launchOptions());
    const base = 'http://127.0.0.1:' + app.server.address().port;
    async function fresh(viewport) {
      const context = await browser.newContext({ viewport, bypassCSP: true });
      const page = await context.newPage(); page.setDefaultTimeout(15000);
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
      // An old cache-busting value and Facebook's sharing parameter must not
      // change the offline flow or require data from the author's browser.
      await page.goto(base + '/?v=1.75.0&fbclid=deployment-regression');
      assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      return { context, page };
    }
    async function actionVisible(page) {
      // Check BEFORE Playwright.click(), whose automatic scroll-into-view
      // would otherwise hide the very regression a real user encounters.
      const state = await page.evaluate(() => {
        const b = mainBtn.getBoundingClientRect(), h = document.querySelector('.statusLine').getBoundingClientRect();
        const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
        return { scrollY, label: mainBtn.textContent, top: b.top, bottom: b.bottom, right: b.right, left: b.left, headerTop: h.top, viewport: { width: innerWidth, height: innerHeight }, hit: !!hit && mainBtn.contains(hit) };
      });
      assert(state.top >= 0 && state.bottom <= state.viewport.height && state.left >= 0 && state.right <= state.viewport.width && state.headerTop >= 0 && state.hit, 'Deployment action must already be visible and clickable: ' + JSON.stringify(state));
      return state;
    }
    for (const viewport of [{ width: 1280, height: 750 }, { width: 1366, height: 768 }, { width: 1280, height: 600 }, { width: 1920, height: 1080 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
      const { context, page } = await fresh(viewport); await fixtures.install(page);
      await page.evaluate(() => {
        DW_UI_CAPTURE.clean(); S.selectedMode = 'MODE_DUEL_001'; S.winner = 1; S.loser = 2; dealCards();
        S.teams[2] = { heroDefinitionId: 'HERO_ALCH_RANUS', troops: { inf: 3, arch: 0, cav: 2 } };
        beginTeam(1); tempHeroDefinitionId = 'HERO_CAV_MASK'; tempTroops = { inf: 3, arch: 0, cav: 2 }; renderTeamPicker();
      });
      await page.locator('#confirmTeam').scrollIntoViewIfNeeded();
      const menuScroll = await page.evaluate(() => scrollY);
      await page.locator('#confirmTeam').click();
      await page.waitForFunction(() => S.phase === 'deploy');
      await actionVisible(page);
      await page.evaluate(() => {
        for (const side of [1, 2]) {
          const zone = cells.filter(c => c.zone === side);
          const ids = [S.teams[side].heroDefinitionId, 'UNIT_INF_001', 'UNIT_INF_001', 'UNIT_INF_001', 'UNIT_CAV_001', 'UNIT_CAV_001'];
          S.units.push(...ids.map((definitionId, i) => createRuntimeEntityInstance({ definitionId, hero: i === 0, side, q: zone[i].q, r: zone[i].r })));
        }
        S.deployIndex = 1; renderBoard(); updateUI();
      });
      const start = await actionVisible(page); assert.equal(start.label, 'BATTLE START');
      await page.screenshot({ path: path.join(output, 'ready-' + viewport.width + 'x' + viewport.height + '.png') });
      await page.locator('#mainBtn').click(); await page.waitForFunction(() => S.phase === 'battle');
      await actionVisible(page);
      report.push({ kind: 'scrolled-team-transition', viewport, menuScroll, ok: true });
      await context.close();
    }
    // Full first-visit flows use the public menus and actual board placement,
    // including both possible deployment orders after rolling against the bot.
    for (const winner of [1, 2]) {
      const viewport = { width: 1280, height: 750 }, { context, page } = await fresh(viewport);
      await page.locator('#playDuelMode').click(); await page.locator('#modeConfirmPlay').click();
      await page.locator('#openAiPlay').click(); await page.locator('.hubOption[data-d="normal"]').click();
      await page.locator('#r1btn').click(); await page.locator('#roll1').waitFor();
      await page.evaluate(winner => { const original = Math.random, dice = winner === 1 ? [0.9, 0.1] : [0.1, 0.9]; Math.random = () => dice.length ? dice.shift() : original(); }, winner);
      await page.locator('#roll1').click(); await page.locator('#toTeam').click(); await page.locator('#toDeploy').click();
      await page.waitForFunction(() => S.phase === 'team' && S.selecting === 1);
      await page.locator('#heroChoices button').filter({ hasText: /Mask/ }).click();
      for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Thêm Bộ binh', exact: true }).click();
      for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Thêm Kỵ binh', exact: true }).click();
      await page.locator('#confirmTeam').click();
      await page.waitForFunction(() => S.phase === 'deploy' && currentDeployPlayer() === 1);
      await actionVisible(page);
      for (let i = 0; i < 6; i++) {
        const cell = await page.evaluate(() => {
          const c = cells.filter(c => c.zone === 1 && !unitAt(c.q, c.r)).sort((a, b) => distU(a, { q: -1, r: 1 }) - distU(b, { q: -1, r: 1 }))[0];
          DuelCamera.ensureVisible(c); return { q: c.q, r: c.r };
        });
        await page.locator('#board polygon[data-q="' + cell.q + '"][data-r="' + cell.r + '"]').click();
        if (i === 0) await page.locator('#deployHeroBtn').click();
        else {
          await page.locator('#deployTroopBtn').click();
          await page.locator('#deployTroops button').filter({ hasText: i <= 3 ? /Bộ binh/ : /Kỵ binh/ }).click();
        }
      }
      await actionVisible(page); assert.equal(await page.locator('#mainBtn').isEnabled(), true);
      await page.locator('#mainBtn').click(); await page.waitForFunction(() => S.phase === 'battle');
      await actionVisible(page);
      report.push({ kind: 'fresh-browser-full-ai-flow', viewport, winner, ok: true });
      await context.close();
    }
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ ok: true, states: report, errors, missing }, null, 2) + '\n');
    console.log('PASS | 6 scrolled deployment layouts and 2 fresh-browser AI games, actual confirmation, placement and battle start');
  } finally {
    if (browser) await browser.close(); if (app) await app.close();
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
