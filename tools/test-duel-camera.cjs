const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/presentation/duel-camera-runtime.js','utf8');
const S={matchSession:{matchId:'M1'},units:[],pending:null};
const context=vm.createContext({S,cells:[],Date,Math});
new vm.Script(source+'\nthis.camera=DuelCamera;').runInContext(context);
const c=context.camera;c.scene={style:{}};c.stage={classList:{add(){},remove(){}}};
c.resize(1920,756);assert.equal(c.base,756);assert.equal(c.width,1920);assert.equal(c.zoom,1.4);
const p=c.point(500,500);assert.equal(p.x,960);assert.equal(p.y,378);
// Zoom keeps the board point under the cursor fixed (unless pan boundary is reached).
const cursor={x:1050,y:410};const before={x:500+(cursor.x-960-c.panX)*1000/(c.base*c.zoom),y:500+(cursor.y-378-c.panY)*1000/(c.base*c.zoom)};
c.zoomAt(1.8,cursor.x,cursor.y);const after=c.point(before.x,before.y);
assert.ok(Math.abs(after.x-cursor.x)<1e-8);assert.ok(Math.abs(after.y-cursor.y)<1e-8);
c.panX=70;c.panY=-45;c.apply();assert.match(c.scene.style.transform,/scale\(1.8\)/);
// Real deploy drag conversion reads the transformed SVG bounds, not the viewport.
const core=fs.readFileSync('src/core/core-runtime-a.js','utf8');const pointer=core.split('\n').find(x=>x.startsWith('function svgPointFromPointer('));
const size=c.base*c.zoom,origin=c.point(0,0);const input=vm.createContext({boardSvg:{getBoundingClientRect:()=>({left:origin.x,top:origin.y,width:size,height:size})}});new vm.Script(pointer).runInContext(input);
for(const [x,y] of [[500,500],[144,224],[810,700]]){const pixel=c.point(x,y);const actual=input.svgPointFromPointer({clientX:pixel.x,clientY:pixel.y});assert.ok(Math.abs(actual.x-x)<1e-8);assert.ok(Math.abs(actual.y-y)<1e-8)}
c.zoomAt(99);assert.equal(c.zoom,2.6);c.zoomAt(.01);assert.equal(c.zoom,1.4);assert.equal(c.panX,0);assert.equal(c.panY,0);
c.panX=99999;c.clampPan();assert.ok(c.panX<=c.base*c.zoom*.55);
c.reset();assert.equal(c.zoom,1.4);assert.equal(c.panX,0);assert.equal(c.panY,0);
const set=new Set(),popup={style:{},offsetWidth:250,offsetHeight:160,classList:{remove(...a){a.forEach(x=>set.delete(x))},add(...a){a.forEach(x=>set.add(x))},contains:x=>set.has(x)}};
c.placePopup(popup,{x:10,y:10});assert.ok(parseFloat(popup.style.left)>=8);assert.ok(parseFloat(popup.style.top)>=8);assert.ok(set.has('cameraAnchored'));
c.panY=200;c.apply();assert.ok(parseFloat(popup.style.top)+160<=c.height-8);
// Reaction target is brought into view once; manual pan is retained thereafter.
S.units=[{id:2,q:0,r:0}];context.cells.push({q:0,r:0,x:500,y:500});S.pending={a:1,d:2};c.panY=400;c.resize(1920,756);assert.ok(c.point(500,500).y<=616);
c.panY=200;c.resize(1920,756);assert.equal(c.panY,200);
S.matchSession.matchId='M2';c.resize(1366,530);assert.equal(c.base,530);assert.equal(c.panX,0);assert.equal(c.panY,0);
c.disable();assert.equal(c.enabled,false);assert.equal(c.scene.style.transform,'none');assert.ok(!set.has('cameraAnchored'));
console.log('Duel camera: viewport, cursor zoom, limits/reset, transformed deploy coordinates, popup clamping, reaction focus and rematch reset: PASS');

assert.match(fs.readFileSync('styles/main.css','utf8'),/duelMapStage\{overflow:clip;/,'camera viewport must not become a native scroll container');

