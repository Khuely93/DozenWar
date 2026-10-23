const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const fixtures = require('./ui-reference/fixtures.cjs');
const root = path.resolve(__dirname, '..');
const served = path.join(root, 'dist');
const output = path.join(root, 'work/dw-ui');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' };
const cases = fixtures.offline.filter(([id]) => !['41', '42', '43', '67', '68', '69'].includes(id.slice(0, 2)));
const capture = new Set(['01-mode', '15-team-selected', '19-deploy-complete', '21-hero-selected', '28-equipment-dialog', '33-dice-ward', '36-win', '71-training-unit']);
async function run() {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(served, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(served + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (error, bytes) => {
      if (error) { res.writeHead(404); res.end(); return; }
      res.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(bytes);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const report = [], errors = [], missing = [];
  try {
    browser = await chromium.launch(require('./helpers/browser.cjs').launchOptions());
    const context = await browser.newContext();
    for (const viewport of process.argv.includes('--layout-only') ? [] : [{ width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
      for (const [id, title, , setup] of cases) {
        // Isolated documents keep rematch timers and Bot callbacks out of other states.
        const page = await context.newPage();
        await page.setViewportSize(viewport);
        page.on('pageerror', error => errors.push({ id, width: viewport.width, error: error.message }));
        page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
        await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'load' });
        await fixtures.install(page);
        await page.evaluate(setup);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const state = await page.evaluate(() => {
          const dialogs = [...document.querySelectorAll('dialog[open], .hubOverlay.show .hubPopup, .modeConfirmOverlay.show .modeConfirmPopup, .gameOverOverlay.show .gameOverPopup')];
          return {
            themed: document.body.classList.contains('dwUI'),
            overflowX: document.documentElement.scrollWidth > innerWidth + 1,
            frame: getComputedStyle(document.querySelector('.modeWrap > .dwAtlasSkin > .dwAtlasPiece')).backgroundImage,
            dialogs: dialogs.map(dialog => { const r = dialog.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }),
            viewport: { width: innerWidth, height: innerHeight }
          };
        });
        assert(state.themed && state.frame.includes('concept-atlas.png'), id + ' loads approved concept artwork');
        assert(!state.overflowX, id + ' horizontal overflow at ' + viewport.width);
        for (const bounds of state.dialogs) {
          assert(bounds.left >= -1 && bounds.top >= -1 && bounds.right <= viewport.width + 1 && bounds.bottom <= viewport.height + 1, id + ' dialog stays inside viewport: ' + JSON.stringify(bounds));
        }
        if (capture.has(id)) {
          await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })); });
          await page.screenshot({ path: path.join(output, id + '-' + viewport.width + '.png'), fullPage: true });
        }
        if (id === '15-team-selected') {
          assert.equal(await page.locator('#heroChoices > button').count(), 12);
          assert.equal(await page.locator('#confirmTeam').isEnabled(), true);
          await page.getByRole('button', { name: 'Bớt Bộ binh', exact: true }).click();
          assert.equal(await page.locator('#confirmTeam').isEnabled(), false, 'Incomplete formation cannot confirm');
          await page.getByRole('button', { name: 'Thêm Bộ binh', exact: true }).click();
          assert.equal(await page.locator('#confirmTeam').isEnabled(), true);
        }
        if (id === '21-hero-selected') {
          if (viewport.width < 900) {
            await page.getByRole('tab', { name: 'KỸ NĂNG', exact: true }).click();
            assert.equal(await page.locator('.dockSkills').isVisible(), true);
            assert.equal(await page.locator('.dockHero').isVisible(), false);
            await page.getByRole('tab', { name: 'TRANG BỊ', exact: true }).click();
            assert.equal(await page.locator('.dockCards').isVisible(), true);
            assert.equal(await page.locator('.dockCards .equipmentFullCard').count(), 5);
            await page.getByRole('tab', { name: 'HERO', exact: true }).click();
            await page.keyboard.press('ArrowRight');
            assert.equal(await page.getByRole('tab', { name: 'KỸ NĂNG', exact: true }).getAttribute('aria-selected'), 'true');
          }
          const before = await page.evaluate(() => JSON.stringify(S.units));
          await page.getByLabel('Menu trận đấu', { exact: true }).click();
          await page.locator('.dwGameMenu').getByRole('button', { name: 'CHƠI LẠI', exact: true }).click();
          assert.equal(await page.locator('.dwConfirmDialog').isVisible(), true);
          await page.locator('.dwConfirmDialog').getByRole('button', { name: 'QUAY LẠI' }).click();
          assert.equal(await page.evaluate(() => JSON.stringify(S.units)), before, 'Cancelling reset preserves the match');
        }
        report.push({ id, title, viewport: viewport.width, ok: true });
        if (report.length % 10 === 0) console.log('Checked ' + report.length + ' UI states');
        await page.close();
      }
      console.log('PASS | ' + cases.length + ' UI states at ' + viewport.width + 'px');
    }
    for (const viewport of [{ width: 1366, height: 768 }, { width: 360, height: 780 }, { width: 844, height: 390 }]) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      page.on('pageerror', error => errors.push({ viewport, error: error.message }));
      await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'load' });
      await fixtures.install(page);
      for (const deploy of [false, true]) {
        await page.evaluate(deploy => { if (deploy) DW_UI_CAPTURE.deploy(true); else { const { a } = DW_UI_CAPTURE.battle(); selectUnit(a); } }, deploy);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const bounds = await page.evaluate(() => {
          const board = document.querySelector('.duelMapStage').getBoundingClientRect();
          const action = mainBtn.getBoundingClientRect();
          const tabs = document.querySelector('.dwDockTabs').getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > innerWidth, boardHeight: board.height, actionVisible: action.top >= 0 && action.bottom <= innerHeight, tabsVisible: !tabs.height || tabs.bottom <= innerHeight + 1 };
        });
        assert(!bounds.overflow && bounds.boardHeight >= 90 && bounds.actionVisible && bounds.tabsVisible, JSON.stringify({ viewport, deploy, bounds }));
        report.push({ id: deploy ? 'deploy-layout' : 'battle-layout', viewport, ok: true });
        await page.screenshot({ path: path.join(output, (deploy ? 'deploy' : 'battle') + '-' + viewport.width + 'x' + viewport.height + '.png') });
      }
      await page.close();
    }
    assert.deepEqual(errors, [], 'No client exceptions');
    assert.deepEqual(missing, [], 'No missing production assets');
    fs.writeFileSync(path.join(output, process.argv.includes('--layout-only') ? 'layout-report.json' : 'browser-report.json'), JSON.stringify({ ok: true, states: report, errors, missing }, null, 2) + '\n');
    console.log('PASS | 12 Hero choices, valid/incomplete formations, mobile tabs and keyboard, reset cancellation, modal bounds, no horizontal overflow or missing assets');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
