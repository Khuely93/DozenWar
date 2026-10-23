// Measure actual browser layout; diagrams are vectors at 1 CSS px = 1 image px.
const fs=require('node:fs/promises'),path=require('node:path');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const round=n=>Math.round(n*100)/100;
async function measure(page){
 return page.evaluate(()=>{
  const round=n=>Math.round(n*100)/100;
  const selector=n=>{if(n.id)return '#'+CSS.escape(n.id);if(n.dataset.dwId)return '[data-dw-id="'+n.dataset.dwId+'"]';const parts=[];let p=n;while(p&&p!==document.body&&parts.length<5){if(p.id){parts.unshift('#'+CSS.escape(p.id));break}parts.unshift(p.localName+':nth-child('+([...p.parentElement.children].indexOf(p)+1)+')');p=p.parentElement}return parts.join(' > ')};
  const candidates=document.querySelectorAll('[data-dw-id],[id],button,a.btn,input,select,textarea,dialog,img,h1,h2,h3,header,main,section,aside,details,summary,output,label,.box,.panel,.screen,.top,.modeWrap,.modeCard,.modeGrid,.modeConfirmPopup,.modeConfirmMeta,.modeConfirmRule,.modeConfirmActions,.playHubWrap,.playHubGrid,.playHubCard,.modeContextBar,.ratingBox,.hubPopup,.hubOptions,.hubOption,.hubFooter,.roomCode,.readyWrap,.readyCards,.readyCard,.readyTimer,.diceWrap,.diceArea,.dieBox,.die,.selectWrap,.teamCols,.heroList,.troopList,.choice,.sym,.countCtl,.dealWrap,.dealHands,.hand,.card,.statusLine,.boardWrap,.duelMapStage,.duelControlDock,.dockPortrait,.duelMatchDetails,.cameraControls,.duelCameraControls,.duelTurnClock,.unitMenu,.unitMenuTitle,.unitMenuActions,.unitMenuSkills,.deployMenu,.attackPopup,.attackPopupTitle,.attackPopupMain,.attackSub,.defensePopup,.defPopupMain,.defenseChoiceList,.directDefensePanel,.directFlowWarning,.heroSkillPanel,.heroTargetList,.heroDefenseBar,.equipmentActionBar,.combatEquipmentCards,.combatEquipmentActions,.gameOverPopup,.gameOverTitle,.resultGrid,.resultCard,.resultOutcome,.rematchMeta,.rematchPlayers,.rematchPlayer,.rematchHint,.gameOverActions,.rematchState,.aiThinking,.roomHeader,.arena,.heroes,.hint,.field,.brand,.runtimeBadge,.bigNotice,.modeMeta,.modeBadge,.duelTimers,.duelCameraToolbar,.defenseFeedback,.trainingToolbar,.defenseFeedbackPanel,.defenseFeedbackVisual,.defenseFeedbackFace,.defenseFeedbackName,.defenseFeedbackOwner,.defenseFeedbackResult,.defenseFeedbackHint');
  const frames=[];
  for(const n of candidates){
   if(n.closest('[data-ui-export]')||n.namespaceURI!=='http://www.w3.org/1999/xhtml'&&n.id!=='board'||n.matches('script,style,link,meta,html,body'))continue;
   const s=getComputedStyle(n),r=n.getBoundingClientRect();if(r.width<2||r.height<2||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||!n.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
   let clip={left:0,top:0,right:Math.max(innerWidth,document.documentElement.scrollWidth),bottom:Math.max(innerHeight,document.documentElement.scrollHeight)};
   for(let p=n.parentElement;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p),b=p.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(c.overflowX)){clip.left=Math.max(clip.left,b.left+scrollX);clip.right=Math.min(clip.right,b.right+scrollX)}if(/hidden|clip|auto|scroll/.test(c.overflowY)){clip.top=Math.max(clip.top,b.top+scrollY);clip.bottom=Math.min(clip.bottom,b.bottom+scrollY)}}
   const x=r.left+scrollX,y=r.top+scrollY,visible={x:Math.max(x,clip.left),y:Math.max(y,clip.top),right:Math.min(x+r.width,clip.right),bottom:Math.min(y+r.height,clip.bottom)};
   if(visible.right-visible.x<1||visible.bottom-visible.y<1)continue;
   const text=(n.getAttribute('aria-label')||n.getAttribute('alt')||n.innerText||n.textContent||'').replace(/\s+/g,' ').trim();
   const name=n.dataset.dwId||n.id||[...n.classList].find(c=>!['box','panel','btn','card','muted','on','show'].includes(c))||n.classList[0]||n.localName;
   frames.push({name,classes:[...n.classList],selector:selector(n),tag:n.localName,text:text.slice(0,160),x:round(x),y:round(y),width:round(r.width),height:round(r.height),aspectRatio:round(r.width/r.height),visibleRect:{x:round(visible.x),y:round(visible.y),width:round(visible.right-visible.x),height:round(visible.bottom-visible.y)},layoutWidth:n.offsetWidth??null,layoutHeight:n.offsetHeight??null,font:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,background:s.backgroundColor,border:s.border,borderRadius:s.borderRadius,padding:s.padding,gap:s.gap,overflowX:s.overflowX,overflowY:s.overflowY,scrollWidth:n.scrollWidth,scrollHeight:n.scrollHeight,transform:s.transform,disabled:!!n.disabled,image:n.localName==='img'?{source:n.getAttribute('src'),naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight,objectFit:s.objectFit,objectPosition:s.objectPosition}:null});
  }
  frames.sort((a,b)=>a.y-b.y||a.x-b.x||b.width*b.height-a.width*a.height);frames.forEach((f,i)=>f.number=i+1);
  return {viewport:{width:innerWidth,height:innerHeight,devicePixelRatio:devicePixelRatio},document:{width:Math.max(innerWidth,document.documentElement.scrollWidth),height:Math.max(innerHeight,document.documentElement.scrollHeight)},frames};
 });
}
function diagram(data,meta,{image=null,legend=true}={}){
 const w=data.document.width,h=data.document.height,margin=legend?720:0,height=legend?Math.max(h,132+data.frames.length*38):h;
 const out=[`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w+margin}" height="${height}" viewBox="0 0 ${w+margin} ${height}">`,`<title>${esc(meta.title)} — ${data.viewport.width}×${data.viewport.height}, 1:1 CSS px</title>`,`<rect width="100%" height="100%" fill="${image?'#14202a':'#f5f8fc'}"/>`,`<defs><clipPath id="screen"><rect width="${w}" height="${h}"/></clipPath></defs>`,`<g clip-path="url(#screen)">`];
 if(image)out.push(`<image width="${w}" height="${h}" href="${esc(image)}"/>`);
 for(const f of data.frames){const c=f.tag==='button'?'#b45309':f.image?'#7c3aed':'#087e8b',v=f.visibleRect,label=`${String(f.number).padStart(3,'0')} · ${f.width} × ${f.height} px`;
  out.push(`<g><title>${esc(f.name+' | '+f.selector+' | X '+f.x+' Y '+f.y+' W '+f.width+' H '+f.height)}</title><rect x="${v.x}" y="${v.y}" width="${v.width}" height="${v.height}" fill="${image?'none':'#ffffff'}" fill-opacity=".15" stroke="${c}" stroke-width="1"/>`);
  if(v.width>=65&&v.height>=18){const labelW=Math.min(v.width,Math.max(65,label.length*5.7));out.push(`<rect x="${v.x}" y="${v.y}" width="${labelW}" height="15" fill="${image?'#07131f':'#ffffff'}" fill-opacity=".93"/><text x="${v.x+3}" y="${v.y+11}" font-family="Arial,sans-serif" font-size="10" fill="${image?'#ffffff':c}">${esc(v.width>130?label:String(f.number).padStart(3,'0'))}</text>`)}
  out.push('</g>');
 }
 if(h>data.viewport.height){const y=data.viewport.height;out.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#e11d48" stroke-width="2" stroke-dasharray="8 5"/><rect x="4" y="${y-20}" width="${Math.min(w-8,290)}" height="19" fill="#fff1f2"/><text x="8" y="${y-6}" fill="#be123c" font-family="Arial,sans-serif" font-size="11">Viewport ends at ${y}px — scroll below</text>`)}
 out.push('</g>');
 if(legend){const x=w+20;out.push(`<rect x="${w}" width="720" height="${height}" fill="#0d1d2a"/><text x="${x}" y="30" fill="#ffffff" font-family="Arial,sans-serif" font-size="18">${esc(meta.id+' · '+meta.title.slice(0,64))}</text><text x="${x}" y="56" fill="#bcd1e2" font-family="Arial,sans-serif" font-size="13">Viewport ${data.viewport.width} × ${data.viewport.height} CSS px · DPR ${data.viewport.devicePixelRatio} · scale 1:1</text><text x="${x}" y="78" fill="#bcd1e2" font-family="Arial,sans-serif" font-size="12">Image ${w} × ${h} px at left. This 720 px legend is outside the game canvas.</text><text x="${x}" y="98" fill="#bcd1e2" font-family="Arial,sans-serif" font-size="12">Measured border boxes. Decimal CSS pixels are retained; X/Y origin is top-left.</text>`);
  data.frames.forEach((f,i)=>{const y=130+i*38;out.push(`<text x="${x}" y="${y}" fill="#f5c671" font-family="Arial,sans-serif" font-size="12">${esc(String(f.number).padStart(3,'0')+'  '+f.name.slice(0,69))}</text><text x="${x+28}" y="${y+15}" fill="#e1edf5" font-family="monospace" font-size="11">${esc('X '+f.x+' · Y '+f.y+' · W '+f.width+' × H '+f.height+' px')}</text>`)});
 }
 out.push('</svg>');return out.join('\n');
}
async function capture(page,paint,out,meta){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(n=>n.getBoundingClientRect().width>0).map(n=>n.decode().catch(()=>{})));scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});
 const data=await measure(page);if(!data.frames.length)throw Error('No frames: '+meta.id);
 const dir=path.join(out,meta.id);await fs.mkdir(dir,{recursive:true});
 const png=await page.screenshot({path:path.join(dir,'screen.png'),fullPage:true,animations:'disabled'});
 await renderDiagrams(paint,dir,data,meta,png);
 await fs.writeFile(path.join(dir,'measurements.json'),JSON.stringify({...meta,...data},null,2)+'\n');
 return {...meta,viewport:data.viewport,document:data.document,frameCount:data.frames.length,frames:data.frames};
}
async function renderDiagrams(paint,dir,data,meta,png){
 const measured=diagram(data,meta,{image:'screen.png'}),wireframe=diagram(data,meta);
 await fs.writeFile(path.join(dir,'measured.svg'),measured);await fs.writeFile(path.join(dir,'wireframe.svg'),wireframe);await fs.writeFile(path.join(dir,'measurements.json'),JSON.stringify({...meta,...data},null,2)+'\n');
 const paintHeight=Math.max(data.document.height,132+data.frames.length*38);
 await paint.setViewportSize({width:data.document.width+720,height:Math.min(1600,paintHeight)});
 for(const [name,svg] of [['measured',diagram(data,meta,{image:'data:image/png;base64,'+png.toString('base64')})],['wireframe',wireframe]]){
  await paint.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#0d1d2a}svg{display:block}</style></head><body>'+svg+'</body></html>');
  await paint.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('svg image')].map(n=>{const im=new Image();im.src=n.getAttribute('href');return im.decode().catch(()=>{})}));});
  await paint.screenshot({path:path.join(dir,name+'.png'),fullPage:true,animations:'disabled'});
 }
}
module.exports={measure,diagram,capture,renderDiagrams,esc,round};
