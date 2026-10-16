const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const output=path.resolve(root,'work/troop-board');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
async function run(){
  let browser;
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(dist,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(dist+path.sep)){res.writeHead(403);res.end();return}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data)});
  });
  try{
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
    browser=await chromium.launch(process.env.DOZEN_BROWSER_EXECUTABLE?{executablePath:process.env.DOZEN_BROWSER_EXECUTABLE,headless:true,args:['--no-sandbox']}:{channel:process.env.DOZEN_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:1920,height:1080}});
    const errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)missing.push(response.url())});
    await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'networkidle'});
    const report=await page.evaluate(async()=>{
      resetMatchState();S.selectedMode='MODE_DUEL_001';S.phase='battle';S.botSide=null;S.battleSide=1;S.winner=1;S.loser=2;
      S.teams={1:{heroDefinitionId:'HERO_INF_EST',troops:{inf:2,arch:2,cav:1}},2:{heroDefinitionId:'HERO_INF_RODOC',troops:{inf:2,arch:2,cav:1}}};S.units=[];
      for(const side of [1,2]){
        const own=cells.filter(cell=>cell.zone===side).filter((cell,i)=>i%2===0).slice(0,6);
        const hero=ContentViews.hero(S.teams[side].heroDefinitionId);
        S.units.push(createRuntimeEntityInstance({definitionId:hero.id,side,hero:true,kind:CLASS_KIND[hero.class],q:own[0].q,r:own[0].r}));
        ['inf','inf','arch','arch','cav'].forEach((kind,i)=>S.units.push(createRuntimeEntityInstance({definitionId:TROOPS[kind].canonicalId,side,hero:false,kind,q:own[i+1].q,r:own[i+1].r})));
      }
      show('game');resetTurnFlags();renderBoard();updateUI();DuelBoardLayout.fit();
      let loaded=0;
      for(const kind of ['inf','arch','cav'])for(const faction of ['red','blue','gold','silver'])for(let view=1;view<=8;view++){
        const response=await fetch(TroopVisual.source({kind,side:1,visualFaction:faction,visualView:view}));
        if(!response.ok)throw Error('Missing sprite');const bitmap=await createImageBitmap(await response.blob());
        if(bitmap.width!==512||bitmap.height!==768)throw Error('Invalid sprite dimensions');bitmap.close();loaded++;
      }
      const ally=S.units.find(unit=>!unit.hero&&unit.side===1),enemy=S.units.find(unit=>!unit.hero&&unit.side===2);
      // The runtime wrapper does not return the inner function's boolean.
      // Assert the resulting selection and visible controls instead.
      selectUnit(ally);
      const selected=S.selected?.id===ally.id;
      const directControls=S.mode==='direct'&&gameHint.textContent.includes('Click ô')&&getComputedStyle(gameHint).display!=='none';
      selectUnit(enemy);const enemyRejected=S.selected?.id===ally.id;
      const finished=S.units.find(unit=>!unit.hero&&unit.side===1&&unit.id!==ally.id);finished.attacked=true;
      selectUnit(finished);const finishedRejected=S.selected?.id===ally.id;finished.attacked=false;
      selectUnit(finished);const directSelection=S.selected?.id===finished.id&&S.mode==='direct';selectUnit(ally);
      return {loaded,rendered:document.querySelectorAll('image.troopSprite').length,selected,directControls,enemyRejected,finishedRejected,directSelection,qa:window.DOZEN_QA.run()};
    });
    fs.mkdirSync(output,{recursive:true});
    await page.screenshot({path:path.join(output,'game-1920.png'),fullPage:true});
    await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>DuelBoardLayout.fit());
    await page.screenshot({path:path.join(output,'game-1366.png'),fullPage:true});
    // Show all four faction skins, using presentation overrides for the two-side mode.
    const variants=await page.evaluate(async()=>{
      resetMatchState();ShellGameOverController.close();S.selectedMode='MODE_TRAINING_001';S.phase='battle';S.botSide=null;S.battleSide=1;S.winner=1;S.loser=2;
      const positions=[[-1,-3],[1,-3],[3,-3],[-2,-1],[0,-1],[2,-1],[-3,1],[-1,1],[1,1],[-3,3],[-1,3],[1,3]];
      S.units=[];let i=0;
      for(const faction of ['red','blue','gold','silver'])for(const kind of ['inf','cav','arch']){
        const p=positions[i++],u=createRuntimeEntityInstance({definitionId:TROOPS[kind].canonicalId,side:1,hero:false,kind,q:p[0],r:p[1]});u.visualFaction=faction;S.units.push(u);
      }
      show('game');renderBoard();updateUI();DuelBoardLayout.fit();const checks=[];
      for(const u of S.units){
        const im=new Image();im.src=TroopVisual.source(u);await im.decode();const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const c=canvas.getContext('2d');c.drawImage(im,0,0);const d=c.getImageData(0,0,im.width,im.height).data;let clear=0;for(let j=3;j<d.length;j+=4)if(!d[j])clear++;
        const g=boardSvg.querySelector('[data-unit-id="'+u.id+'"]'),image=g.querySelector('image.troopSprite'),cell=cells.find(c=>c.q===u.q&&c.r===u.r);
        checks.push({id:u.id,kind:u.kind,faction:u.visualFaction,source:im.src,width:im.width,height:im.height,clear,corners:[d[3],d[(im.width-1)*4+3],d[((im.height-1)*im.width)*4+3],d[d.length-1]],footY:Number(image.getAttribute('y'))+Number(image.getAttribute('height'))*.98,expectedFootY:cell.y+18,ring:!!g.querySelector('.troopTeamRing'),hp:!!g.querySelector('.troopHP')});
      }return checks;
    });
    assert.equal(variants.length,12);
    for(const v of variants){assert.equal(v.width,512);assert.equal(v.height,768);assert(v.clear>512*768*.15,v.source);assert.deepEqual(v.corners,[0,0,0,0]);assert(Math.abs(v.footY-v.expectedFootY)<.01);assert(v.ring&&v.hp);const hit=page.locator('[data-unit-id="'+v.id+'"] .troopHit'),b=await hit.boundingBox();await hit.click({position:{x:b.width/2,y:b.height*.8}});assert.equal(await page.evaluate(()=>S.selected?.id),v.id);}
    await page.screenshot({path:path.join(output,'all-12-colors-1366.png')});
    await page.setViewportSize({width:1920,height:1080});await page.evaluate(()=>DuelBoardLayout.fit());await page.screenshot({path:path.join(output,'all-12-colors-1920.png')});
    const fallback=page.locator('[data-unit-id="'+variants[0].id+'"] image.troopSprite');await fallback.evaluate(n=>n.dispatchEvent(new Event('error')));assert.equal(await fallback.getAttribute('visibility'),'hidden');assert.equal(await page.locator('[data-unit-id="'+variants[0].id+'"] text').first().getAttribute('visibility'),'visible');
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>DuelBoardLayout.fit());await page.screenshot({path:path.join(output,'all-12-colors-mobile.png'),fullPage:true});
    Object.assign(report,{variants,errors,missing});
    fs.writeFileSync(path.join(output,'browser-qa.json'),JSON.stringify(report,null,2)+'\n');
    assert.equal(report.loaded,96);assert.equal(report.rendered,10);
    for(const check of ['selected','directControls','enemyRejected','finishedRejected','directSelection'])assert.equal(report[check],true,check);
    assert.equal(report.qa.ok,true);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('PASS | direct selection/controls, enemy and finished-unit guards, 16 runtime QA checks');
    console.log('PASS | 12 transparent faction skins, 96 legacy facing routes, 12 real troop clicks, foot anchors, rings/HP, image failure glyph, desktop/mobile, no JS/HTTP errors');
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});

