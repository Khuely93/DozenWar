const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const { createApp } = require('../server/app.cjs');
const { FileStore } = require('../server/store.cjs');
const fixtures = require('./ui-reference/fixtures.cjs');

// Exercise the production UI through its actual skill, select, confirm and
// cancel controls. Both seats must retain their own Hero and hand while an
// off-turn choice is open, then return to the normal turn/defense UI.
(async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'dw-grim-ui-'));
  const output = path.resolve(__dirname, '../work/grim-disguise-fix');
  await fs.mkdir(output, { recursive: true });
  let app, browser;
  const report = [], errors = [], missing = [];
  try {
    app = await createApp({ store: new FileStore(temp) });
    await app.listen(0);
    browser = await chromium.launch(require('./helpers/browser.cjs').launchOptions());
    for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
      for (const side of [1, 2]) for (const scenario of ['offturn', 'active', 'cancel', 'defense-self', 'defense-ally']) {
        const page = await browser.newPage({ viewport, bypassCSP: true });
        page.setDefaultTimeout(15000);
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
        await page.goto('http://127.0.0.1:' + app.server.address().port + '/');
        await fixtures.install(page);
        const initial = await page.evaluate(({ side, scenario }) => {
          const { a, d } = DW_UI_CAPTURE.battle(side === 1 ? 'Grim' : 'Kazu', side === 2 ? 'Grim' : 'Kazu');
          const grim = side === 1 ? a : d, enemy = side === 1 ? d : a;
          const defending = scenario.startsWith('defense');
          S.battleSide = scenario === 'active' ? side : 3 - side;
          grim.hp = 2;
          S.hands = { 1: [createEquipmentCardInstance('EQUIP_COMMON_BOTH_001', 1)], 2: [createEquipmentCardInstance('EQUIP_COMMON_ATK_003', 2)] };
          if (defending) {
            enemy.q = grim.q + 1; enemy.r = grim.r;
            const ally = S.units.find(u => !u.hero && u.side === side);
            ally.q = grim.q + 1; ally.r = grim.r - 1;
            if (startAttack(enemy, scenario === 'defense-ally' ? ally : grim) === false || !S.pending) throw Error('Defense fixture did not start: ' + scenario + ', P' + side);
          }
          S.selected = grim;
          DuelTurnClock.startTurn();
          renderBoard(); updateUI();
          return { id: grim.id, active: S.battleSide, ownCard: S.hands[side][0].uid, otherCard: S.hands[3 - side][0].uid };
        }, { side, scenario });
        // The off-turn skill is exposed in the defensive skill bar even when
        // there is no incoming hit. Use that public control for the regression.
        const skill = scenario === 'active'
          ? page.locator('#skillBar [data-skill-id="SKILL_HERO_GRIM_S1"]')
          : page.locator('.heroDefenseBar [data-skill-id="SKILL_HERO_GRIM_S1"]');
        if (scenario === 'active' && viewport.width < 900) await page.getByRole('tab', { name: 'KỸ NĂNG', exact: true }).click();
        await skill.click();
        await page.getByLabel('Chủng lính', { exact: true }).waitFor();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const choosing = await page.evaluate(() => ({
          owner: HeroCore.selection?.h.side,
          actor: HeroSkillUI.actor()?.side,
          hero: document.querySelector('#unitPanel h3').textContent,
          title: HeroSkillUI.panel.querySelector('h3').textContent,
          hand: handOwner.textContent,
          cards: [...handBar.querySelectorAll('[data-card-uid]')].map(n => n.dataset.cardUid),
          noticeOverTitle: (() => {
            const title = HeroSkillUI.panel.querySelector('h3').getBoundingClientRect();
            const notices = document.querySelector('.dwBattleNotices').getBoundingClientRect();
            return Math.min(title.right, notices.right) - Math.max(title.left, notices.left) > 2 && Math.min(title.bottom, notices.bottom) - Math.max(title.top, notices.top) > 2;
          })(),
        }));
        assert.equal(choosing.owner, side, 'The skill belongs to Grim');
        assert.equal(choosing.actor, side, 'HUD follows the choosing Grim, including outside his turn');
        assert.equal(choosing.noticeOverTitle, false, 'The chooser owner/title stays clear of floating notices after a real click');
        for (const label of ['hero', 'title', 'hand']) assert.match(choosing[label], new RegExp('(?:PLAYER|PHE) ' + side + '\\b'), label + ' identifies the choosing seat');
        assert.deepEqual(choosing.cards, [initial.ownCard], 'The dock displays the chooser hand');
        assert(!choosing.cards.includes(initial.otherCard), 'The opponent hand stays out of the chooser dock');
        await page.getByLabel('Chủng lính', { exact: true }).selectOption('UNIT_CAV_001');
        if (scenario === 'offturn' && side === 1) {
          await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
          await page.screenshot({ path: path.join(output, 'offturn-' + viewport.width + '.png'), fullPage: true });
        }
        const panel = page.locator('.heroSkillPanel');
        await panel.getByRole('button', { name: scenario === 'cancel' ? 'HỦY' : 'XÁC NHẬN', exact: true }).click();
        const after = await page.evaluate(id => {
          const grim = S.units.find(u => u.id === id);
          return { selection: !!HeroCore.selection, popup: !HeroSkillUI.panel.hidden, side: grim.side, definition: grim.definitionId, hero: grim.hero, hp: grim.hp, morph: grim.morphDefinitionId || null, used: isSkillUsed(grim, 1), actor: HeroSkillUI.actor()?.side, active: S.battleSide, pending: !!S.pending, cards: [...handBar.querySelectorAll('[data-card-uid]')].map(n => n.dataset.cardUid) };
        }, initial.id);
        assert.equal(after.selection, false); assert.equal(after.popup, false);
        assert.equal(after.side, side); assert.equal(after.definition, 'HERO_ALCH_GRIM');
        assert.equal(after.hero, true); assert.equal(after.hp, 2, 'Disguise preserves Hero HP');
        assert.equal(after.active, initial.active, 'Choosing a form does not hand over the turn');
        assert.equal(after.morph, scenario === 'cancel' ? null : 'UNIT_CAV_001');
        assert.equal(after.used, scenario !== 'cancel', 'Cancel does not spend the skill');
        const restored = scenario.startsWith('defense') ? side : initial.active;
        assert.equal(after.actor, restored, 'Normal turn/defense ownership resumes after the choice');
        assert.deepEqual(after.cards, [restored === side ? initial.ownCard : initial.otherCard]);
        if (scenario.startsWith('defense')) assert(after.pending, 'Disguise keeps the incoming defense window open');
        report.push({ viewport, side, scenario, ok: true });
        if (report.length % 5 === 0) console.log('Checked ' + report.length + ' Grim ownership cases');
        await page.close();
      }
    }
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ ok: true, states: report, errors, missing }, null, 2) + '\n');
    console.log('PASS | 30 Grim Disguise UI cases: both seats, off-turn, active, cancel, self/ally defense, desktop and mobile');
  } finally {
    if (browser) await browser.close();
    if (app) await app.close();
    await fs.rm(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
