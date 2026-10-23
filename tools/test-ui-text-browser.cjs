// Full UI text/layer review using the same offline states and real online flow
// as the UI reference exporter. Art is rendered unchanged by the game itself.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {chromium}=require('playwright'),{createApp}=require('../server/app.cjs'),{FileStore}=require('../server/store.cjs');
const fixtures=require('./ui-reference/fixtures.cjs'),{onlineScreens}=require('./ui-reference/online-fixtures.cjs'),{inspectText}=require('./ui-reference/text-audit.cjs');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'work/ui-text-audit/review');
const viewports=[{width:1920,height:1080},{width:1366,height:768},{width:390,height:844},{width:844,height:390}];
let filter=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const widths=process.argv.find(a=>a.startsWith('--widths='))?.slice(9).split(',').map(Number);
const capture=new Set(['01-mode','04-play-hub','15-team-selected','21-hero-selected','25-skill-morph','28-equipment-dialog','31-defense','33-dice-ward','36-win','37-lose','70-training','73-match-menu','76-hero-readonly','59-online-skill','61-online-defense','63-online-win']);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const extra=[
  ['73-match-menu','Menu trong trận','Popup',()=>{DW_UI_CAPTURE.battle();document.querySelector('.dwMatchMenu').open=true;}],
  ['74-reset-confirm','Xác nhận chơi lại','Popup',()=>{DW_UI_CAPTURE.battle();resetBtn.click();}],
  ['75-leave-confirm','Xác nhận rời trận','Popup',()=>{DW_UI_CAPTURE.battle();[...document.querySelectorAll('.dwGameMenu button')].find(b=>b.textContent==='CHỌN CHẾ ĐỘ').click();}],
  ['76-hero-readonly','Hộp thông tin ba kỹ năng Hero','Popup',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.winner=1;S.loser=2;dealCards();beginTeam(1);tempHeroDefinitionId='HERO_INF_KAZU';renderTeamPicker();document.querySelector('.dwTeamHero > .btn').click();}],
  ['77-skill-tab','Tab kỹ năng trong trận','Ingame',()=>{const {a}=DW_UI_CAPTURE.battle();selectUnit(a);DWStyleUI.selectTab('skills');}],
  ['78-equipment-tab','Tab trang bị trong trận','Ingame',()=>{const {a}=DW_UI_CAPTURE.battle();selectUnit(a);DWStyleUI.selectTab('cards');}]
];
(async()=>{
  await fs.mkdir(out,{recursive:true});const temp=await fs.mkdtemp(path.join(os.tmpdir(),'dw-ui-text-'));
  let app,browser;const report=[],pageErrors=[],missing=[];
  try{
    if(process.argv.includes('--resume')){
      const previous=JSON.parse(await fs.readFile(path.join(out,'report.json'),'utf8'));
      assert.equal(previous.version,require('../package.json').version,'Resume only the same release');
      assert.deepEqual(previous.pageErrors,[],'Client errors require a full rerun');assert.deepEqual(previous.missing,[],'Missing assets require a full rerun');
      filter=[...new Set([...(filter||[]),...previous.report.filter(r=>r.result.issues.length||r.result.layers.length||r.result.decoration.length||r.result.overflowX).map(r=>r.client==='online'?'online':r.id)])];
      for(const row of previous.report){
        const selected=(!widths||widths.includes(row.viewport.width))&&(row.client==='online'?filter.includes('online'):filter.some(id=>row.id.startsWith(id)));
        if(!selected)report.push(row);
      }
    }
    app=await createApp({store:new FileStore(temp)});await app.listen(0);const base='http://127.0.0.1:'+app.server.address().port;
    browser=await chromium.launch(require('./helpers/browser.cjs').launchOptions());
    await Promise.all(viewports.filter(v=>!widths||widths.includes(v.width)).map(async viewport=>{
      const dir=path.join(out,String(viewport.width));await fs.mkdir(dir,{recursive:true});
      const context=await browser.newContext({viewport,bypassCSP:true});
      async function save(page,meta){
        await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(n=>n.getBoundingClientRect().width).map(n=>{n.loading='eager';return n.decode().catch(()=>{});}));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));DWPackUI.update();});
        const result=await inspectText(page),failed=result.issues.length||result.layers.length||result.decoration.length||result.overflowX;
        const file=failed||capture.has(meta.id)||process.argv.includes('--capture-all')?viewport.width+'/'+meta.id+'.png':null;
        const entry={...meta,viewport,result,file};report.push(entry);
        if(file)await page.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});
        if(failed)console.log('ISSUES '+JSON.stringify(entry));
        if(report.length%15===0)console.log('Reviewed '+report.length+' states');
      }
      for(const [id,title,category,setup] of [...fixtures.offline,...extra]){
        if(filter&&!filter.some(n=>id.startsWith(n)))continue;
        const page=await context.newPage();
        page.on('pageerror',error=>pageErrors.push({id,viewport,error:error.message}));
        page.on('response',response=>{if(response.status()>=400)missing.push({id,url:response.url()});});
        await page.goto(base+'/');await fixtures.install(page);await page.evaluate(setup);
        await save(page,{id,title,category,client:'offline'});
        if(id==='31-defense'&&viewport.width===844){
          const panel=await page.locator('.dwDefenseChoices').boundingBox();
          const before=await page.evaluate(()=>DuelCamera.zoom);
          await page.mouse.move(panel.x+20,panel.y+10);await page.mouse.wheel(0,180);
          await page.waitForFunction(()=>document.querySelector('.dwDefenseChoices').scrollTop>0);
          assert.equal(await page.evaluate(()=>DuelCamera.zoom),before,'Scrolling defense choices must not zoom the map');
        }
        await page.close();
      }
      await context.close();
      if(!filter||filter.includes('online'))await onlineScreens(app,browser,{...viewport,pageErrors,save});
      console.log('PASS capture | '+viewport.width+' × '+viewport.height);
    }));
    report.sort((a,b)=>b.viewport.width-a.viewport.width||a.id.localeCompare(b.id));
    const failing=report.filter(r=>r.result.issues.length||r.result.layers.length||r.result.decoration.length||r.result.overflowX);
    const result={version:require('../package.json').version,resumed:process.argv.includes('--resume'),states:report.length,failures:failing.length,pageErrors,missing,report};
    await fs.writeFile(path.join(out,'report.json'),JSON.stringify(result,null,2)+'\n');
    await fs.writeFile(path.join(out,'index.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DozenWar UI text review</title><style>body{background:#0c1923;color:#f4e9d1;font:15px system-ui;margin:24px}a{color:#edc875}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:20px}article{padding:16px;border:1px solid #726341}img{width:100%;height:360px;object-fit:contain;object-position:top;background:#050e16}h2{font-size:16px}.fail{border-color:#ef736b}p{color:#abbfca}</style><h1>UI text/layer review · v${result.version}</h1><p>${report.length} trạng thái × độ phân giải. Ảnh chụp từ game, 1 CSS px = 1 pixel ảnh. ${failing.length} trường hợp cần xem xét. <a href="report.json">Báo cáo đo</a></p><div class="grid">${report.map(r=>`<article class="${failing.includes(r)?'fail':''}"><h2>${esc(r.id+' · '+r.title)}</h2><p>${r.viewport.width} × ${r.viewport.height} · ${r.result.textLines} dòng chữ</p>${r.file?`<a href="${r.file}"><img loading="lazy" src="${r.file}" alt="${esc(r.title)}"></a>`:'<p>Đã đo text và layer; xem report.json.</p>'}</article>`).join('')}</div></html>`);
    assert.deepEqual(pageErrors,[],'No client exceptions');assert.deepEqual(missing,[],'No missing UI assets');
    assert.equal(failing.length,0,'Inspect work/ui-text-audit/review/report.json for text/layer conflicts');
    console.log('PASS | '+report.length+' UI states: text fit, overlap, notice/popup layers and exactly one visible artwork state');
  }finally{if(browser)await browser.close();if(app)await app.close();await fs.rm(temp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
