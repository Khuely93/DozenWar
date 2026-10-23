const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),base=path.resolve(root,process.argv[2]||'visual-previews/ui-reference-v1.71.1'),reports=[];
const pngSize=p=>{const b=fs.readFileSync(p);assert.equal(b.toString('ascii',1,4),'PNG');return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}};
for(const size of ['1920x1080','390x844']){
 const dir=path.join(base,size),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'))),ids=new Set(),anchors=new Set();assert.equal(m.screenCount,72);assert.deepEqual(m.failures,[]);assert.deepEqual(m.pageErrors,[]);let count=0;
 const checks={};
 for(const s of m.screens){assert(!ids.has(s.id));ids.add(s.id);const data=JSON.parse(fs.readFileSync(path.join(dir,s.id,'measurements.json')));assert.deepEqual(data.viewport,m.viewport);assert.equal(data.frames.length,s.frameCount);count+=data.frames.length;
  assert.deepEqual(pngSize(path.join(dir,s.id,'screen.png')),data.document,s.id+' source raster dimensions');
  const expected={width:data.document.width+720,height:Math.max(data.document.height,132+data.frames.length*38)};
  for(const name of ['measured','wireframe'])assert.deepEqual(pngSize(path.join(dir,s.id,name+'.png')),expected,s.id+' diagram dimensions');
  for(const f of data.frames){anchors.add(f.name);assert(f.width>0&&f.height>0);assert(Number.isFinite(f.x)&&Number.isFinite(f.y));assert(f.visibleRect.width<=f.width+.02&&f.visibleRect.height<=f.height+.02);assert(f.visibleRect.x>=-.01&&f.visibleRect.y>=-.01);assert(f.visibleRect.x+f.visibleRect.width<=data.document.width+.02);assert(f.visibleRect.y+f.visibleRect.height<=data.document.height+.02);}
  checks[s.id]=data.frames;
 }
 assert.equal(count,m.frameCount);
 for(const [id,name] of [['02-mode-confirm','modeConfirmPopup'],['14-team-empty','SHELL_UI_TEAM_HERO_CHOICES'],['14-team-empty','SHELL_UI_TEAM_TROOP_CHOICES'],['17-deploy-menu','CORE_UI_DEPLOY_MENU'],['25-skill-morph','heroSkillPanel'],['28-equipment-dialog','combatEquipmentDialog'],['31-defense','directDefensePanel'],['36-win','gameOverPopup'],['37-lose','gameOverPopup'],['38-draw','gameOverPopup'],['45-defense-feedback-card','defenseFeedbackPanel'],['71-training-unit','trainingDialog'],['53-online-team','heroes']])assert(checks[id].some(f=>f.name===name),size+' expected UI '+id+'/'+name);
 const staticIds=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/data-dw-id="([^"]+)"/g)].map(v=>v[1]);const notVisible=staticIds.filter(id=>!anchors.has(id));
 // Old Guard is deliberately hidden. The old unit-menu hint lies completely
 // outside the clipped mobile map; its desktop dimensions are still exported.
 assert(notVisible.every(id=>id==='CORE_UI_GUARD'||size==='390x844'&&id==='CORE_UI_UNIT_ACTION_HINT'),JSON.stringify(notVisible));
 const components=JSON.parse(fs.readFileSync(path.join(dir,'components/catalog.json')));assert(components.count>=30);assert.equal(components.count,components.components.length);
 for(const c of components.components){const svg=fs.readFileSync(path.join(dir,'components',c.file+'-frame.svg'),'utf8');assert(svg.includes('width="'+c.width+'" height="'+c.height+'"'));pngSize(path.join(dir,'components',c.file+'.png'));}
 reports.push({viewport:m.viewport,screens:m.screenCount,frames:count,components:components.count,staticAnchors:staticIds.length,unrenderedLegacyAnchors:notVisible});
}
fs.writeFileSync(path.join(base,'verification.json'),JSON.stringify({ok:true,reports},null,2)+'\n');console.log(JSON.stringify({ok:true,reports},null,2));
