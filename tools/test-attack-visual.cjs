const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function node(tag){return{tag,attributes:{},children:[],dataset:{},listeners:{},setAttribute(k,v){this.attributes[k]=v},appendChild(n){this.children.push(n)},addEventListener(k,v){this.listeners[k]=v},set innerHTML(v){this.children=[]}}}
const units=[{id:'a',side:1,hp:3,q:0,r:0},{id:'d',side:2,hp:3,q:1,r:0},{id:'g',side:2,hp:2,q:2,r:0}];
const S={phase:'battle',units},boardSvg=node('svg'),cells=units.map((u,i)=>({q:u.q,r:0,x:i*90+50,y:80}));
let clicked;
const ctx=vm.createContext({S,boardSvg,cells,document:{createElementNS:(_,tag)=>node(tag)},isHighlight:()=>false,isAttackHL:()=>false,unitAt:(q,r)=>units.find(u=>u.q===q&&u.r===r&&u.hp>0),unitSpec:()=>({sym:'H'}),hexPts:()=>'',CoreBuffController:{},CoreSkillController:{},CoreGuardController:{},CoreInputRouter:{handleUnitClick:u=>clicked=u.id},bindDeployDrag:()=>{},currentDeployPlayer:()=>1});
new vm.Script(read('src/presentation/board-renderer-runtime.js')+'\nthis.layer=CoreIncomingAttackLayer;').runInContext(ctx);
function target(id){ctx.renderBoard();const marked=boardSvg.children.filter(n=>n.tag==='g'&&n.attributes.class.includes('incomingAttackTarget'));assert.deepEqual(marked.map(n=>n.dataset.unitId),id?[id]:[]);if(id){const visual=marked[0].children.find(n=>n.attributes.class==='incomingAttackVisual');assert.equal(visual.attributes['aria-label'],'Đang bị tấn công');assert.ok(visual.children.some(n=>n.textContent==='BỊ TẤN CÔNG'));assert.ok(boardSvg.children.some(n=>n.tag==='polygon'&&n.attributes.class.includes('incomingAttackHex')));marked[0].listeners.click({stopPropagation(){}});assert.equal(clicked,id)}}
target(null);S.pending={a:'a',d:'d',sourceType:'ATTACK'};target('d');
S.pending.sourceType='SKILL';target('d');S.pending.d='g';target('g');
S.pending.d='d';S.pending.guard=true;S.pending.guardUnitId='g';target('g');
S.pending.ignoreGuard=true;target('d');S.pending.replacementTargetId='g';target('g');
S.pending=null;target(null);S.pending={d:'d'};S.matchEnded=true;target(null);S.matchEnded=false;S.phase='deploy';target(null);S.phase='battle';units[1].hp=0;target(null);
assert.match(read('styles/main.css'),/\.incomingAttackVisual,\.incomingAttackVisual \*\{pointer-events:none\}/);
assert.match(read('styles/main.css'),/prefers-reduced-motion/);
const core=read('src/core/core-runtime-a.js');assert.match(core,/else S.selected=a;renderBoard\(\);reactionInfo/,'reaction entry renders immediately');
console.log('Incoming attack visual: normal/Skill, target sequence, Guard/redirect, cleanup, ended/dead units and click-through: PASS');
