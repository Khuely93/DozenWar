// Export documentation artifacts only. Does not alter game code or live rooms.
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {chromium}=require('playwright'),{createApp}=require('../server/app.cjs'),{FileStore}=require('../server/store.cjs');
const {capture,esc}=require('./ui-reference/render.cjs'),{install,offline}=require('./ui-reference/fixtures.cjs');
const root=path.resolve(__dirname,'..');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1]};
const width=Number(arg('width','1920')),height=Number(arg('height','1080')),only=arg('only','');
const output=path.resolve(root,arg('out','visual-previews/ui-reference-v1.71.1/'+width+'x'+height));
const rows=[],failures=[],pageErrors=[];
async function onlineScreens(app,browser,paint){
 const base='http://127.0.0.1:'+app.server.address().port,ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,bypassCSP:true}),p=await ctx.newPage();
 p.on('pageerror',e=>pageErrors.push({screen:'online',error:e.message}));await p.goto(base+'/online/',{waitUntil:'networkidle'});await p.getByText('Đã kết nối',{exact:true}).waitFor();
 await p.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
 const save=async(id,title,notes='')=>{const row=await capture(p,paint,output,{id,title,category:'Online',notes,client:'online'});rows.push(row);console.log('CAPTURE '+id+' | '+row.frameCount+' frames')};
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
 async function sync(){await p.getByRole('button',{name:'Kết nối lại / Đồng bộ',exact:true}).click();await p.waitForFunction(rev=>Number(document.querySelector('#room').dataset.revision)>=rev,room.doc.revision);}
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
async function writeIndex(){
 rows.sort((a,b)=>a.id.localeCompare(b.id));
 const flat=rows.flatMap(r=>r.frames.map(f=>({screen:r.id,title:r.title,client:r.client,...f})));
 const csvQuote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const columns=['screen','number','name','selector','tag','x','y','width','height','aspectRatio','fontSize','fontWeight','lineHeight','borderRadius','padding','gap','overflowX','overflowY','scrollWidth','scrollHeight','text'];
 await fs.writeFile(path.join(output,'measurements.csv'),'\ufeff'+[columns.join(','),...flat.map(f=>columns.map(c=>csvQuote(f[c])).join(','))].join('\n')+'\n');
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({version:'1.71.1',generatedAt:new Date().toISOString(),viewport:{width,height,devicePixelRatio:1},scale:'1 CSS pixel = 1 raster pixel; border-box measurements, decimals preserved',screenCount:rows.length,frameCount:flat.length,failures,pageErrors,screens:rows.map(({frames,...r})=>r)},null,2)+'\n');
 const cards=rows.map(r=>`<article><h2>${esc(r.id)} · ${esc(r.title)}</h2><p>${esc(r.category)} · ${r.frameCount} khung · viewport ${width}×${height} · ảnh gốc ${r.document.width}×${r.document.height}</p><a href="${r.id}/measured.png"><img loading="lazy" src="${r.id}/screen.png" alt="${esc(r.title)}"></a><nav><a href="${r.id}/screen.png" download>Ảnh gốc PNG</a><a href="${r.id}/measured.png" download>Ảnh ghi kích thước PNG</a><a href="${r.id}/wireframe.png" download>Khung dây PNG</a><a href="${r.id}/wireframe.svg" download>Khung dây SVG</a><a href="${r.id}/measurements.json" download>Tọa độ JSON</a></nav>${r.notes?'<p>'+esc(r.notes)+'</p>':''}</article>`).join('\n');
 await fs.writeFile(path.join(output,'index.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DozenWar · UI Reference · ${width}×${height}</title><style>*{box-sizing:border-box}body{margin:0;background:#101b25;color:#e3edf5;font:15px Arial,sans-serif}main{max-width:1500px;margin:auto;padding:28px}h1{font-size:28px}p{line-height:1.6;color:#b5cbdc}a{color:#f0c77b}nav{display:flex;gap:12px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:24px;margin-top:30px}article{padding:18px;background:#192b39;border:1px solid #40596b;border-radius:12px}h2{font-size:18px;min-height:44px}img{width:100%;display:block;margin:16px 0;background:#fff}nav a{padding:8px;border:1px solid #667d8d;border-radius:6px;text-decoration:none}@media(max-width:600px){.grid{grid-template-columns:1fr}main{padding:14px}}</style><main><h1>DozenWar — Bộ khung UI để thiết kế lại</h1><p>Bản game v1.71.1 · ${rows.length} trạng thái · ${flat.length} khung đã đo · chuẩn ${width} × ${height} CSS px · DPR 1.</p><p>Giữ ảnh ở tỷ lệ 100% để đọc đúng pixel. PNG ghi kích thước và SVG có phần chú thích rộng 720 px nằm ngoài canvas game. X/Y tính từ góc trái trên; W/H là border-box đo trực tiếp từ Chromium, giữ cả số thập phân. Các màn dài có ảnh toàn trang và được ghi kích thước riêng. Khung cũ được đánh dấu riêng, không trộn với luồng đang dùng.</p><nav><a href="../DozenWar-UI-${width}x${height}.zip" download>Tải toàn bộ ZIP</a><a href="measurements.csv" download>Bảng kích thước CSV</a><a href="manifest.json" download>Danh mục JSON</a><a href="README.md">Hướng dẫn đọc</a></nav><section class="grid">${cards}</section></main></html>`);
 await fs.writeFile(path.join(output,'README.md'),`# DozenWar UI reference — ${width}×${height}\n\nĐo từ bản game v1.71.1 đang chạy, Chromium, viewport ${width}×${height}, deviceScaleFactor 1, zoom trình duyệt 100%.\n\n- ${rows.length} trạng thái; ${flat.length} frame được đo.\n- Mỗi trạng thái: screen.png (gốc), measured.png (ghi kích thước), wireframe.png / wireframe.svg (khung dây), measurements.json (tọa độ và kiểu chữ/viền/padding).\n- measurements.csv dùng UTF-8 BOM để mở bằng Excel.\n- Kích thước W/H là border-box CSS sau transform; số thập phân được giữ đến 0.01 px. Không ước lượng theo mắt.\n- layoutWidth/layoutHeight là kích thước layout làm tròn trước transform. visibleRect là phần không bị cắt bởi vùng cuộn/viewport.\n- Ảnh ghi kích thước có vùng chú giải rộng 720 px ngoài canvas gốc. Phần game bên trái giữ nguyên tỷ lệ 1:1.\n- SVG khung dây không chứa artwork; có thể mở trong Figma/Inkscape/Illustrator.\n- Mỗi trạng thái được dựng bằng dữ liệu trận mẫu trong môi trường cục bộ. Không phải dữ liệu người chơi thật.\n- Frame cũ có nhãn 'Khung cũ' là template còn trong mã, không phải flow mặc định.\n- Menu matchmaking/ranked trong Play Hub là prototype; phòng online thật nằm trong nhóm Online.\n- Các kích thước chỉ chính xác ở viewport này; thiết kế responsive cần đo riêng ở viewport khác.\n- Popup cảnh báo native của trình duyệt (alert/confirm) không có frame HTML của game để đo; không phải cửa sổ UI tùy biến.\n\nChạy lại: node tools/export-ui-reference.cjs --width ${width} --height ${height}\n`);
}
(async()=>{
 await fs.mkdir(output,{recursive:true});const temp=await fs.mkdtemp(path.join(os.tmpdir(),'dw-ui-ref-'));let app,browser;
 if(process.argv.includes('--append')){const previous=JSON.parse(await fs.readFile(path.join(output,'manifest.json'),'utf8'));for(const s of previous.screens){const row=JSON.parse(await fs.readFile(path.join(output,s.id,'measurements.json'),'utf8'));row.frameCount=row.frames.length;rows.push(row)};}
 try{
  app=await createApp({store:new FileStore(temp)});await app.listen(0);browser=await chromium.launch(require('./helpers/browser.cjs').launchOptions());
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,bypassCSP:true}),page=await context.newPage(),paint=await browser.newPage();
  page.on('pageerror',e=>pageErrors.push({screen:'offline',error:e.message}));
  await page.goto('http://127.0.0.1:'+app.server.address().port+'/',{waitUntil:'networkidle'});await install(page);
  for(const [id,title,category,fixture] of offline){if(only&&!only.split(',').some(x=>id.startsWith(x)))continue;
   try{await page.evaluate(fixture);await page.evaluate(()=>DuelBoardLayout.fit());
    const row=await capture(page,paint,output,{id,title,category,client:'offline',notes:category==='Khung cũ'?'Template cũ còn trong mã; không phải luồng mặc định hiện tại.':''});const old=rows.findIndex(r=>r.id===id);if(old>=0)rows.splice(old,1);rows.push(row);console.log('CAPTURE '+id+' | '+row.frameCount+' frames');
   }catch(e){failures.push({id,error:e.message});console.error('FAILED '+id+' | '+e.message);}
  }
  if(!only||only==='online')try{await onlineScreens(app,browser,paint)}catch(e){failures.push({id:'online',error:e.message});console.error('FAILED online | '+e.stack)}
  await writeIndex();console.log(JSON.stringify({output,screens:rows.length,frames:rows.reduce((n,r)=>n+r.frameCount,0),failures,pageErrors},null,2));
  if(failures.length||pageErrors.length)process.exitCode=1;
 }finally{if(browser)await browser.close();if(app)await app.close();await fs.rm(temp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
