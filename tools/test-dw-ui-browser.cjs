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
const capture = new Set(['01-mode', '04-play-hub', '10-ready', '12-dice-result', '13-deal', '15-team-selected', '19-deploy-complete', '21-hero-selected', '28-equipment-dialog', '33-dice-ward', '36-win', '37-lose', '38-draw', '39-ranked-result', '44-equipment-counter', '47-equipment-steal', '48-post-hit', '71-training-unit', '72-training-equipment']);
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
            detachedSkins: [...document.querySelectorAll('.dwConceptArt')].flatMap(host => {
              const skin = [...host.querySelectorAll(':scope > .dwAtlasSkin')].find(node => node.getBoundingClientRect().width), parent = host.getBoundingClientRect();
              if (!skin || !parent.width || !parent.height) return [];
              const child = skin.getBoundingClientRect(), style = getComputedStyle(host);
              const width = parent.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
              const height = parent.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
              return Math.abs(width - child.width) > 2 || Math.abs(height - child.height) > 2 ? [{id:host.id,className:host.className,parent:{width,height},skin:{width:child.width,height:child.height}}] : [];
            }),
            dialogs: dialogs.map(dialog => { const r = dialog.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }),
            viewport: { width: innerWidth, height: innerHeight }
          };
        });
        assert(state.themed && state.frame.includes('concept-atlas.png'), id + ' loads approved concept artwork');
        assert(!state.overflowX, id + ' horizontal overflow at ' + viewport.width);
        assert.deepEqual(state.detachedSkins, [], id + ' artwork stays anchored to its own control');
        for (const bounds of state.dialogs) {
          assert(bounds.left >= -1 && bounds.top >= -1 && bounds.right <= viewport.width + 1 && bounds.bottom <= viewport.height + 1, id + ' dialog stays inside viewport: ' + JSON.stringify(bounds));
        }
        if (capture.has(id)) {
          await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })); });
          await page.screenshot({ path: path.join(output, id + '-' + viewport.width + '.png'), fullPage: true });
        }
        if (id === '15-team-selected') {
          assert.equal(await page.locator('#heroChoices > button').count(), 12);
          const icons = page.locator('.dwTeamSkill > .dwSkillIcon > img');
          assert.equal(await icons.count(), 3, 'Kazu team preview has three framed skill icons');
          await icons.evaluateAll(images => Promise.all(images.map(image => image.decode())));
          assert.deepEqual(await icons.evaluateAll(images => images.map(image => image.parentElement.dataset.art)), ['SKILL_HERO_KAZU_S1','SKILL_HERO_KAZU_S2','SKILL_HERO_KAZU_S3']);
          assert.equal(await page.locator('#confirmTeam').isEnabled(), true);
          await page.getByRole('button', { name: 'Bớt Bộ binh', exact: true }).click();
          assert.equal(await page.locator('#confirmTeam').isEnabled(), false, 'Incomplete formation cannot confirm');
          await page.getByRole('button', { name: 'Thêm Bộ binh', exact: true }).click();
          assert.equal(await page.locator('#confirmTeam').isEnabled(), true);
          const teamBefore = await page.evaluate(() => JSON.stringify(S.teams));
          await page.getByRole('button', { name: 'XEM KỸ NĂNG HERO', exact: true }).click();
          await page.locator('.dwConfirmDialog[open]').waitFor();
          assert.match(await page.locator('#dwConfirmTitle').textContent(), /Kazu/);
          await page.locator('.dwConfirmDialog h3 > .dwSkillIcon > img').last().waitFor();
          assert.equal(await page.locator('.dwConfirmDialog h3 > .dwSkillIcon > img').count(), 3);
          await page.locator('.dwConfirmDialog').getByRole('button', { name: 'ĐÓNG', exact: true }).click();
          assert.equal(await page.evaluate(() => JSON.stringify(S.teams)), teamBefore, 'Reading Hero skills preserves the formation');
        }
        if (id === '71-training-unit') {
          await page.getByLabel('Hero hoặc lính', { exact: true }).selectOption('HERO_INF_KAZU');
          await page.locator('.dwTrainingPreview img[alt="Kazu"]').waitFor();
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
          const icons = page.locator('#skillBar [data-skill-id] > .dwSkillIcon > img');
          assert.equal(await icons.count(), 3, 'Kazu combat HUD resolves all skill IDs');
          await icons.evaluateAll(images => Promise.all(images.map(image => image.decode())));
          const distorted = await icons.evaluateAll(images => images.filter(image => {
            const frame = image.parentElement, box = frame.getBoundingClientRect();
            const [w,h] = frame.style.aspectRatio.split('/').map(Number);
            return box.width && Math.abs(box.height - box.width * h / w) > 1;
          }).length);
          assert.equal(distorted, 0, 'Framed skill icons preserve their aspect ratio');
          await page.screenshot({ path: path.join(output, 'kazu-skills-' + viewport.width + '.png') });
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
      // Every approved Hero must resolve the three correct icons in selection
      // and combat, including portrait-shaped frames and mobile scaling.
      for (const hero of require('../assets/skills/heroes-simple-dw-style-01/manifest.json').heroes) {
        const page = await context.newPage(); await page.setViewportSize(viewport);
        page.on('pageerror',error=>errors.push({hero:hero.name,error:error.message}));
        page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
        await page.goto('http://127.0.0.1:' + server.address().port + '/', {waitUntil:'load'});
        await fixtures.install(page);
        await page.evaluate(id=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.winner=1;S.loser=2;dealCards();beginTeam(1);tempHeroDefinitionId=id;tempTroops={inf:3,arch:1,cav:1};renderTeamPicker();},hero.heroId);
        await page.locator('.dwTeamSkill > .dwSkillIcon > img').last().waitFor({state:'attached'});
        assert.deepEqual(await page.locator('.dwTeamSkill').evaluateAll(nodes=>nodes.map(n=>n.dataset.skillId)),hero.skills.map(s=>s.skillId));
        await page.locator('.dwTeamSkill .dwSkillIcon > img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
        await page.evaluate(name=>{const {a}=DW_UI_CAPTURE.battle(name,name==='Kazu'?'Rodoc':'Kazu');selectUnit(a);},hero.name);
        if(viewport.width<900)await page.getByRole('tab',{name:'KỸ NĂNG',exact:true}).click();
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const icons=page.locator('#skillBar .dwSkillIcon > img');
        await icons.last().waitFor({state:'attached'}); await icons.evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
        const drawn=await page.evaluate(()=>{DWPackUI.update();return [...document.querySelectorAll('#skillBar .dwSkillIcon > img')].map(image=>{
          const icon=image.parentElement,box=icon.getBoundingClientRect(),button=icon.parentElement.getBoundingClientRect();
          return {id:icon.dataset.art,source:new URL(image.src).pathname,width:box.width,height:box.height,ratio:icon.style.aspectRatio,inside:box.left>=button.left-1&&box.right<=button.right+1&&box.top>=button.top-1&&box.bottom<=button.bottom+1};
        });});
        assert.deepEqual(drawn.map(i=>i.id),hero.skills.map(s=>s.skillId),hero.name+' HUD order');
        for(const icon of drawn){const [w,h]=icon.ratio.split('/').map(Number);assert(icon.source.endsWith('/'+hero.source));assert(icon.width>0&&icon.height>0&&icon.width<=66&&icon.height<=66&&Math.abs(icon.height-icon.width*h/w)<1,JSON.stringify({hero:hero.name,icon}));assert(icon.inside,'Icon stays in its button: '+hero.name);}
        await page.screenshot({path:path.join(output,'skills-'+hero.slug+'-'+viewport.width+'.png')});
        report.push({id:'all-hero-skills-'+hero.slug,viewport:viewport.width,ok:true});await page.close();
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
