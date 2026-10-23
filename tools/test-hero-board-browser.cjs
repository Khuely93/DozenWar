// Integration checks for transparent Hero sprites and real board input.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),output=path.join(root,'work/hero-board');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
(async()=>{let browser;const server=http.createServer((req,res)=>{let pathname=new URL(req.url,'http://local').pathname.replace(/^\/DozenWar/,'');const file=path.resolve(dist,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!file.startsWith(dist+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end()}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(b)})});try{
 fs.mkdirSync(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({executablePath:process.env.DOZEN_BROWSER_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
 await page.goto('http://127.0.0.1:'+server.address().port+'/DozenWar/',{waitUntil:'networkidle'});
 const roster=await page.evaluate(async()=>{
  resetMatchState();ShellGameOverController.close();S.selectedMode='MODE_TRAINING_001';S.phase='battle';S.battleSide=1;S.botSide=null;S.winner=1;S.loser=2;
  const positions=[[-1,-3],[1,-3],[3,-3],[-2,-1],[0,-1],[2,-1],[-3,1],[-1,1],[1,1],[-3,3],[-1,3],[1,3]];
  S.units=HeroRegistry.list().map((h,i)=>createRuntimeEntityInstance({definitionId:h.id,hero:true,side:i%2+1,q:positions[i][0],r:positions[i][1]}));
  show('game');renderBoard();updateUI();DuelBoardLayout.fit();
  const checks=[];
  for(const u of S.units){const asset=AssetRegistry.get(HeroRegistry.get(u.definitionId).assets.token),src=TroopVisual.source(u),im=new Image();im.src=src;await im.decode();const canvas=document.createElement('canvas');canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const alpha=ctx.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,maxAlpha=0;for(let i=3;i<alpha.length;i+=4){if(!alpha[i])transparent++;maxAlpha=Math.max(maxAlpha,alpha[i])}const g=boardSvg.querySelector('[data-unit-id="'+u.id+'"]'),image=g.querySelector('.heroBoardSprite'),cell=cells.find(c=>c.q===u.q&&c.r===u.r);checks.push({id:u.id,side:u.side,heroId:u.definitionId,source:src,width:im.naturalWidth,height:im.naturalHeight,transparent,maxAlpha,corners:[alpha[3],alpha[(canvas.width-1)*4+3],alpha[((canvas.height-1)*canvas.width)*4+3],alpha[alpha.length-1]],rendered:!!image,footY:Number(image.getAttribute('data-foot-y')),pose:image.getAttribute('data-facing'),expectedFootY:cell.y+18,ring:g.querySelector('.troopTeamRing').getAttribute('class'),hp:g.querySelector('.troopHP').textContent})}
  return checks;
 });
 assert.equal(roster.length,12);assert.equal(await page.locator('svg.heroFacingSprite').count(),12);
 for(const h of roster){assert(h.rendered);assert.equal(h.width,1024);assert.equal(h.height,1536);assert(h.transparent>1024*1536*.25);assert.equal(h.pose,h.side===1?'back':'front');assert(h.maxAlpha>=240);assert(h.corners.every(a=>a<=1));assert(Math.abs(h.footY-h.expectedFootY)<.01);assert(h.ring.includes('team'+h.side));assert.equal(h.hp,'❤3');await page.evaluate(side=>{S.battleSide=side;S.selected=null;S.mode=null;updateUI()},h.side);{const hit=page.locator('[data-unit-id="'+h.id+'"] .troopHit'),box=await hit.boundingBox();await hit.click({position:{x:box.width/2,y:box.height*.8}});}assert.equal(await page.evaluate(()=>S.selected?.id),h.id,'Select '+h.heroId)}
 await page.screenshot({path:path.join(output,'all-12-heroes-1920.png')});
 await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>DuelBoardLayout.fit());await page.screenshot({path:path.join(output,'all-12-heroes-1366.png')});
 // Every approved crop renders with the shared foot anchor.
 for(const pose of ['front','back','front+45','back+45','front-45','back-45']){
  await page.evaluate(pose=>{renderBoard();for(const u of S.units){const cell=cells.find(c=>c.q===u.q&&c.r===u.r),old=boardSvg.querySelector('[data-unit-id=\"'+u.id+'\"] .heroFacingSprite'),next=HeroBoardVisuals.create(u.definitionId,pose,{x:cell.x,y:cell.y+18},{className:'heroBoardSprite heroFacingSprite'});old.replaceWith(next.root)}},pose);
  assert.equal(await page.locator('svg.heroFacingSprite[data-facing="'+pose+'"]').count(),12);
  await page.screenshot({path:path.join(output,'pose-'+pose.replace('+','plus')+'-1366.png')});
 }
 // Exercise selection -> movement -> normal attack -> Guard -> resolution -> end turn.
 const duel=await page.evaluate(()=>{
  resetMatchState();ShellGameOverController.close();S.selectedMode='MODE_DUEL_001';S.phase='battle';S.battleSide=1;S.botSide=null;S.winner=1;S.loser=2;
  const a=createRuntimeEntityInstance({definitionId:'HERO_INF_KAZU',hero:true,side:1,q:0,r:1}),d=createRuntimeEntityInstance({definitionId:'HERO_INF_RODOC',hero:true,side:2,q:1,r:0}),g=createRuntimeEntityInstance({definitionId:'UNIT_INF_001',hero:false,side:2,q:1,r:-1});
  S.units=[a,d,g];show('game');resetTurnFlags();DuelTurnClock.startTurn();renderBoard();updateUI();DuelBoardLayout.fit();return{a:a.id,d:d.id,g:g.id};
 });
 const clickUnit=async id=>{const hit=page.locator('[data-unit-id="'+id+'"] .troopHit'),box=await hit.boundingBox();await hit.click({position:{x:box.width/2,y:box.height*.8}})};
 await clickUnit(duel.a);assert.equal(await page.evaluate(()=>S.selected?.id),duel.a);
 await page.locator('.hex[data-q="0"][data-r="0"]').click();
 const moved=await page.evaluate(id=>{const u=S.units.find(u=>u.id===id);return{q:u.q,r:u.r,moved:u.moved}},duel.a);assert.deepEqual(moved,{q:0,r:0,moved:true});assert.equal(await page.locator('[data-unit-id="'+duel.a+'"] .heroFacingSprite').getAttribute('data-facing'),'back');assert.equal(await page.locator('[data-unit-id="'+duel.a+'"] .unitActionStatus.moved').count(),1);
 await clickUnit(duel.d);assert.equal(await page.evaluate(()=>S.pending?.d),duel.d);assert.equal(await page.locator('[data-unit-id="'+duel.d+'"].incomingAttackTarget').count(),1);
 await clickUnit(duel.g);assert.equal(await page.evaluate(()=>S.pending?.guardUnitId),duel.g);assert.equal(await page.locator('[data-unit-id="'+duel.g+'"].incomingAttackTarget').count(),1);
 await page.screenshot({path:path.join(output,'defense-1366.png')});
 await page.locator('.directDefensePanel').getByRole('button',{name:'NHẬN ĐÒN',exact:true}).click();
 assert.equal(await page.evaluate(()=>S.pending),null);assert.equal(await page.evaluate(id=>S.units.find(u=>u.id===id).hp,duel.g),1);assert.equal(await page.locator('[data-unit-id="'+duel.a+'"] .unitActionStatus.complete').count(),1);
 await page.locator('#mainBtn').click();assert.equal(await page.evaluate(()=>S.battleSide),2);
 // An unavailable sprite still leaves its Hero glyph selectable.
 const atlas=page.locator('[data-unit-id="'+duel.d+'"] .heroAtlasImage');await atlas.evaluate(n=>n.dispatchEvent(new Event('error')));const fallback=page.locator('[data-unit-id="'+duel.d+'"] .heroBoardFallback');await fallback.waitFor();await page.waitForTimeout(100);await fallback.evaluate(n=>n.dispatchEvent(new Event('error')));assert.equal(await fallback.getAttribute('visibility'),'hidden');assert.equal(await page.locator('[data-unit-id="'+duel.d+'"] text').first().getAttribute('visibility'),'visible');await clickUnit(duel.d);assert.equal(await page.evaluate(()=>S.selected?.id),duel.d);
 // Deployment drag continues to use Core hex coordinates.
 const deploy=await page.evaluate(()=>{resetMatchState();S.selectedMode='MODE_DUEL_001';S.loser=1;S.winner=2;S.botSide=null;S.teams={1:{heroDefinitionId:'HERO_INF_KAZU',troops:{inf:5,arch:0,cav:0}},2:{heroDefinitionId:'HERO_INF_RODOC',troops:{inf:5,arch:0,cav:0}}};beginDeploy();const zone=cells.filter(c=>c.zone===1),a=zone[0],b=zone.find(c=>c.q!==a.q||c.r!==a.r);const h=createRuntimeEntityInstance({definitionId:'HERO_INF_KAZU',hero:true,side:1,q:a.q,r:a.r});S.units=[h];renderBoard();updateUI();DuelBoardLayout.fit();return{id:h.id,dest:{q:b.q,r:b.r}}});
 const hit=await page.locator('[data-unit-id="'+deploy.id+'"] .troopHit').boundingBox(),dest=await page.locator('.hex[data-q="'+deploy.dest.q+'"][data-r="'+deploy.dest.r+'"]').boundingBox();
 await page.mouse.move(hit.x+hit.width/2,hit.y+hit.height*.8);await page.mouse.down();await page.mouse.move(dest.x+dest.width/2,dest.y+dest.height/2,{steps:15});await page.mouse.up();assert.deepEqual(await page.evaluate(id=>{const h=S.units.find(u=>u.id===id);return{q:h.q,r:h.r}},deploy.id),deploy.dest);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>DuelBoardLayout.fit());await page.screenshot({path:path.join(output,'deploy-mobile.png'),fullPage:true});
 const gameplayHashes=await page.evaluate(()=>Object.fromEntries(['MODE_DUEL_001','MODE_TRAINING_001'].map(id=>[id,ContentManifestBuilder.buildGameplay(id).gameplayHash])));
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 const report={ok:true,roster,checks:['12 transparent atlases and 72 directional crops','12 real Hero selections','foot anchors','team rings and HP','movement and badge','attack target','Guard redirect','damage resolution','completed action badge','end turn','image failure glyph','deployment drag'],gameplayHashes,errors,missing};
 fs.writeFileSync(path.join(output,'qa.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:true,heroes:roster.length,checks:report.checks,gameplayHashes,errors,missing},null,2));
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
