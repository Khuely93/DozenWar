const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['catalog','renderer'])vm.runInContext(fs.readFileSync(path.join(root,'assets/heroes-camera-06/'+file+'.js'),'utf8'),ctx);
const visual=vm.runInContext('HeroBoardVisuals',ctx),manifest=require('../assets/heroes-camera-06/manifest.json');
assert.equal(manifest.entries.length,12);let poses=0;
for(const e of manifest.entries){const entry=visual.get(e.definitionId);assert(Object.isFrozen(entry));assert.equal(entry.frame.width,e.mounted?114:100);const bytes=fs.readFileSync(path.join(root,entry.source));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),e.sha256);assert(e.transparentPixels>entry.width*entry.height*.25);for(const pose of visual.directions){const c=entry.poses[pose];assert(c.width>0&&c.height>0);assert(c.x>=0&&c.y>=0&&c.x+c.width<=entry.width&&c.y+c.height<=entry.height);assert(c.footX>=c.x&&c.footX<c.x+c.width);assert(c.footY>=c.y&&c.footY<c.y+c.height);poses++;}}
assert.equal(poses,72);
// Team facing must survive arbitrary moves, target changes and legacy facing hints.
for(const side of [1,2])for(const hero of manifest.entries){
 for(const [q,r] of [[0,0],[-2,1],[2,-1],[0,3],[0,-3]]){
  const unit=Object.freeze({id:hero.id,hero:true,definitionId:hero.definitionId,side,q,r,visualFacing:side===1?'front':'back'}),before=JSON.stringify(unit);
  assert.equal(visual.pose(unit),side===1?'back':'front');assert.equal(JSON.stringify(unit),before);
 }
}
vm.runInContext(fs.readFileSync(path.join(root,'assets/troops-camera-team/catalog.js'),'utf8'),ctx);
const troops=require('../assets/troops-camera-team/manifest.json');assert.equal(troops.entries.length,6);
for(const e of troops.entries){
 const unit=Object.freeze({kind:e.kind,side:e.faction==='blue'?1:2}),pose=visual.pose(unit),entry=visual.get(visual.troopId(unit));
 assert(entry);assert(Object.isFrozen(entry));assert.equal(pose,e.faction==='blue'?'back':'front');assert(entry.poses[pose]);
 const bytes=fs.readFileSync(path.join(root,entry.source));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),troops.sha256);
 const c=entry.poses[pose];assert(c.x>=0&&c.y>=0&&c.x+c.width<=entry.width&&c.y+c.height<=entry.height);
 assert(c.footX>=c.x&&c.footX<c.x+c.width&&c.footY>=c.y&&c.footY<c.y+c.height);
}
assert(troops.transparentPixels>1024*1536*.3);
assert.equal(visual.pose({side:2,visualFaction:'blue'}),'back');assert.equal(visual.pose({side:1,visualFaction:'red'}),'front');
assert.equal(visual.faction({side:1,visualFaction:'invalid'}),'blue');assert.equal(visual.faction({side:1,visualFaction:'gray'}),'silver');
console.log('PASS | 12 Hero atlases, 72 crops, 6 team troop crops; blue back / red front, stable after moves and immutable state');
