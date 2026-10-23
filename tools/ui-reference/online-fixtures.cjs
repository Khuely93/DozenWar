// Real local rooms and commands; no live multiplayer rooms are modified.
async function onlineScreens(app,browser,{width,height,save:record,pageErrors=[]}){
 const base='http://127.0.0.1:'+app.server.address().port,ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,bypassCSP:true}),p=await ctx.newPage();
 p.on('pageerror',e=>pageErrors.push({screen:'online',error:e.message}));await p.goto(base+'/online/',{waitUntil:'networkidle'});await p.getByText('Đã kết nối',{exact:true}).waitFor();
 await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
 const save=(id,title,notes='')=>record(p,{id,title,category:'Online',notes,client:'online'});
 await save('50-online-lobby','Online — tên người chơi, tạo / vào phòng');
 await p.locator('#playerName').fill('UI Designer');await p.locator('#roomCode').fill('ZZZZZZZZ');await p.getByRole('button',{name:'Vào phòng',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#notice').textContent.length>0);await save('66-online-room-error','Online — thông báo không vào được phòng');
 await p.locator('#playerName').fill('UI Designer');await p.getByRole('button',{name:'Tạo phòng',exact:true}).click();await p.locator('#roomLabel').waitFor();
 const code=(await p.locator('#roomLabel').innerText()).split(' ').pop(),room=app.rooms.room(code),v=()=>room.engine.view(1,Date.now());
 await save('51-online-room-wait','Online — phòng chờ một người');
 const other=await app.rooms.join(code,'Player 2');
 await p.getByRole('button',{name:'Kết nối lại / Đồng bộ',exact:true}).click();await p.getByRole('button',{name:'Sẵn sàng',exact:true}).waitFor({state:'visible'});
 await save('52-online-ready','Online — hai người, sẵn sàng');
 let serial=0;
 const token=await p.evaluate(base=>JSON.parse(localStorage.getItem('dozenwar-online-v1:'+base)).session.resumeToken,base);
 const seats={1:token,2:other.resumeToken};
 async function send(side,command){const view=await app.rooms.view(code,seats[side]);await app.rooms.submit(code,seats[side],{commandId:'ui-reference-'+ ++serial,expectedRevision:view.revision,command});}
 async function sync(){
  // A result window intentionally covers the room header. Reload to receive
  // fixture-only server commands rather than clicking behind that window.
  if(v().phase==='ended')await p.reload({waitUntil:'networkidle'});
  else await p.getByRole('button',{name:'Kết nối lại / Đồng bộ',exact:true}).click();
  await p.waitForFunction(rev=>Number(document.querySelector('#room').dataset.revision)>=rev,room.doc.revision);
 }
 await send(1,{type:'READY'});await send(2,{type:'READY'});await sync();
 if(v().selecting===1)await save('53-online-team','Online — chọn Hero và 5 lính');else await save('54-online-team-wait','Online — chờ đối thủ chọn đội hình');
 const firstSelecting=v().selecting;await send(firstSelecting,{type:'TEAM',heroId:'HERO_INF_KAZU',troops:{inf:3,arch:1,cav:1}});await sync();
 if(v().selecting===1)await save('53-online-team','Online — chọn Hero và 5 lính');else await save('54-online-team-wait','Online — chờ đối thủ chọn đội hình');
 await send(v().selecting,{type:'TEAM',heroId:'HERO_INF_KAZU',troops:{inf:3,arch:1,cav:1}});await sync();
 for(let i=0;i<2;i++){
  const side=v().selecting;await save(side===1?'55-online-deploy':'56-online-deploy-wait',side===1?'Online — xếp quân trên bàn cờ':'Online — chờ đối thủ xếp quân');
  const hero={q:2,r:side===1?1:-1},available=app.catalog.cells.filter(c=>c.zone===side&&(c.q!==hero.q||c.r!==hero.r));
  await send(side,{type:'DEPLOY',units:['HERO_INF_KAZU','UNIT_INF_001','UNIT_INF_001','UNIT_INF_001','UNIT_ARCH_001','UNIT_CAV_001'].map((definitionId,i)=>({definitionId,...(i?{q:available[i-1].q,r:available[i-1].r}:hero)}))});await sync();
 }
 // Present the active side using its real seat and unmodified client renderer.
 async function seat(side){await p.evaluate(({base,code,token,side})=>{localStorage.setItem('dozenwar-online-v1:'+base,JSON.stringify({session:{code,resumeToken:token,side}}))},{base,code,token:seats[side],side});await p.reload({waitUntil:'networkidle'});await p.getByText('Đã kết nối',{exact:true}).waitFor();await p.locator('#roomLabel').waitFor();}
 let active=v().battleSide;await seat(active);await save('57-online-battle','Online — lượt chiến đấu và bài trên tay');
 await p.getByRole('button',{name:'Di chuyển',exact:true}).click();await save('58-online-move','Online — chọn ô di chuyển');await p.getByRole('button',{name:'Hủy lựa chọn',exact:true}).click();
 const a=v().units.find(u=>u.hero&&u.side===active),d=v().units.find(u=>u.hero&&u.side!==active);
 await p.getByRole('button',{name:'Khóa Xích',exact:true}).click();await save('59-online-skill','Online — chọn mục tiêu kỹ năng');
 await p.locator('[data-unit="'+d.id+'"] .unitHit').click();await p.getByRole('button',{name:'Xác nhận hành động',exact:true}).click();
 await p.waitForFunction(()=>document.querySelector('#controls').textContent.includes('→'));await save('60-online-attack-wait','Online — chờ đối thủ phòng thủ');
 await seat(3-active);await save('61-online-defense','Online — phòng thủ, đỡ đòn, bài và kỹ năng');
 await p.getByRole('button',{name:'Nhận đòn / Bỏ qua phòng thủ',exact:true}).click();
 await p.getByRole('button',{name:'Kết nối lại / Đồng bộ',exact:true}).click();
 await send(3-active,{type:'SURRENDER'});await sync();await save('62-online-lose','Online — kết quả thua và đấu lại');
 await seat(active);await save('63-online-win','Online — kết quả thắng và đấu lại');
 await send(active,{type:'REMATCH'});await sync();await save('64-online-rematch','Online — đã đồng ý, chờ đấu lại');
 await ctx.setOffline(true);await p.waitForFunction(()=>/Mất kết nối|Chưa kết nối/.test(document.querySelector('#connection').textContent));await save('65-online-disconnect','Online — mất kết nối và trạng thái khôi phục');await ctx.setOffline(false);
 await ctx.close();
}
module.exports={onlineScreens};
