const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['catalog','renderer'])vm.runInContext(fs.readFileSync(path.join(root,'assets/heroes-camera-06/'+file+'.js'),'utf8'),ctx);
const visual=vm.runInContext('HeroBoardVisuals',ctx),manifest=require('../assets/heroes-camera-06/manifest.json');
assert.equal(manifest.entries.length,12);let poses=0;
for(const e of manifest.entries){const entry=visual.get(e.definitionId);assert(Object.isFrozen(entry));assert.equal(entry.frame.width,e.mounted?114:100);const bytes=fs.readFileSync(path.join(root,entry.source));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),e.sha256);assert(e.transparentPixels>entry.width*entry.height*.25);for(const pose of visual.directions){const c=entry.poses[pose];assert(c.width>0&&c.height>0);assert(c.x>=0&&c.y>=0&&c.x+c.width<=entry.width&&c.y+c.height<=entry.height);assert(c.footX>=c.x&&c.footX<c.x+c.width);assert(c.footY>=c.y&&c.footY<c.y+c.height);poses++;}}
assert.equal(poses,72);
const frozen=u=>Object.freeze(u),a=frozen({id:'a',hero:true,definitionId:'HERO_INF_KAZU',side:1,q:0,r:0}),b=frozen({id:'b',side:2,q:0,r:-2}),g=frozen({id:'g',side:2,q:-1,r:1}),c=visual.createFacingController();
const before=JSON.stringify([a,b,g]);c.update([a,b,g],{key:'one'});assert.equal(c.pose(a),'back');assert.equal(c.pose(b),'front');
// Actual axial neighbors, with horizontal ties retaining their hemisphere.
for(const [q,r,expected] of [[0,-1,'back+45'],[1,-1,'back-45'],[-1,0,'back+45'],[1,0,'back-45'],[-1,1,'front-45'],[0,1,'front+45']]){c.clear();c.update([a]);const moved=frozen({...a,q,r});c.update([moved]);assert.equal(c.pose(moved),expected);c.update([moved]);assert.equal(c.pose(moved),expected);}
c.update([a,b,g],{key:'one',pending:{a:'a',d:'b',guard:true,guardUnitId:'g'}});assert.equal(c.pose(a),'front-45');assert.equal(c.pose(g),'back-45');assert.equal(JSON.stringify([a,b,g]),before,'Never mutate authoritative units');
c.update([a,b],{key:'rematch'});assert.equal(c.pose(a),'back');assert.equal(c.pose(b),'front');
assert.equal(c.pose({...a,visualFacing:'front+45'}),'front+45');assert.equal(c.pose({...a,visualFacing:'bad'}),'back');
assert.equal(visual.direction(0,1),'front');assert.equal(visual.direction(0,-1),'back');assert.equal(visual.direction(0,0,'front'),'front');assert.equal(visual.direction(NaN,0,'back'),'back');
c.update([],{key:'rematch'});assert.equal(c.pose(b),'front');
console.log('PASS | 12 approved atlases, 72 crops, axial movement, guard facing, rematch, pruning, immutable game state');
