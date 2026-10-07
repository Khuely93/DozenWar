const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const output=path.resolve(root,'outputs/troops-v3');
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
        if(bitmap.width!==256||bitmap.height!==256)throw Error('Invalid sprite dimensions');bitmap.close();loaded++;
      }
      const ally=S.units.find(unit=>!unit.hero&&unit.side===1),enemy=S.units.find(unit=>!unit.hero&&unit.side===2);
      // The runtime wrapper does not return the inner function's boolean.
      // Assert the resulting selection and visible controls instead.
      selectUnit(ally);
      const selected=S.selected?.id===ally.id;
      const menuVisible=unitMenu.classList.contains('show')&&getComputedStyle(unitMenu).display!=='none';
      selectUnit(enemy);const enemyRejected=S.selected?.id===ally.id;
      const finished=S.units.find(unit=>!unit.hero&&unit.side===1&&unit.id!==ally.id);finished.attacked=true;
      selectUnit(finished);const finishedRejected=S.selected?.id===ally.id;finished.attacked=false;
      S.mode='skill';selectUnit(finished);const targetingPreserved=S.selected?.id===ally.id;S.mode=null;
      return {loaded,rendered:document.querySelectorAll('image.troopSprite').length,selected,menuVisible,enemyRejected,finishedRejected,targetingPreserved,qa:window.DOZEN_QA.run()};
    });
    fs.mkdirSync(output,{recursive:true});
    await page.screenshot({path:path.join(output,'game-1920.png'),fullPage:true});
    await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>DuelBoardLayout.fit());
    await page.screenshot({path:path.join(output,'game-1366.png'),fullPage:true});
    Object.assign(report,{errors,missing});
    fs.writeFileSync(path.join(output,'browser-qa.json'),JSON.stringify(report,null,2)+'\n');
    assert.equal(report.loaded,96);assert.equal(report.rendered,10);
    for(const check of ['selected','menuVisible','enemyRejected','finishedRejected','targetingPreserved'])assert.equal(report[check],true,check);
    assert.equal(report.qa.ok,true);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('PASS | selectUnit state, visible menu, enemy/finished/skill-targeting guards');
    console.log('PASS | 96 decoded sprites, 10 rendered troops, 16 runtime QA checks, no JS/HTTP errors');
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});

