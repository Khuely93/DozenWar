const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const core=read('src/core/core-runtime-a.js');
function fn(name){const start=core.indexOf('function '+name+'(');assert.ok(start>=0,name);const brace=core.indexOf('{',start);let depth=0,end=brace;for(;end<core.length;end++){if(core[end]==='{')depth++;if(core[end]==='}'&&--depth===0)break}return core.slice(start,end+1)}
let timers=[];
const S={units:[],selectedMode:'OTHER',battleSide:1};
const context=vm.createContext({S,window:{},console,setTimeout:f=>timers.push(f),
 reactionBox:{style:{}},hideDefensePopup:()=>{},hideUnitMenu:()=>{},hideAttackPopup:()=>{},renderBoard:()=>{},updateUI:()=>{},checkWin:()=>{},lg:()=>{},
 defenseEquipmentWins:()=>false,effectValue:()=>0,guardTargetHint:{classList:{remove:()=>{}}},
 clearGuardHighlights:()=>{},boardSvg:{querySelector:()=>null}});
for(const file of ['src/content/content-prelude-runtime.js','src/presentation/asset-definitions-runtime.js','locales/vi-VN-runtime.js','src/content/content-runtime.js'])new vm.Script(read(file),{filename:file}).runInContext(context);
new vm.Script(['unitSpec','axial','distU','aligned','canAttack','guardCandidates','chooseGuardFromMap','validCardFor','resolveCombat','doPierce','unitAt'].map(fn).join('\n')+'\nthis.api={unitSpec,canAttack,guardCandidates,chooseGuardFromMap,validCardFor,resolveCombat};this.views=ContentViews;').runInContext(context);
const a=context.api;
const hero=(definitionId,id,q=0,r=0)=>({definitionId,id,hero:true,side:2,hp:3,q,r});
const ally={definitionId:'UNIT_ARCH_001',id:'ally',side:2,hp:1,q:1,r:0};
for(const id of ['HERO_INF_001','HERO_INF_RODOC','HERO_INF_EST']){
 const h=hero(id,id);assert.equal(a.unitSpec(h).hp,3);assert.equal(a.unitSpec(h).move,1);assert.equal(a.unitSpec(h).skillIds.length,3);
 const troop={definitionId:'UNIT_INF_001',id:'troop',side:2,hp:2,q:1,r:1};
 S.units=[ally,h,troop,hero('HERO_INF_RODOC','enemy',0,1),hero(id,'far',4,0),{...hero(id,'dead'),hp:0}];S.units[3].side=1;
 assert.deepEqual(Array.from(a.guardCandidates(ally),u=>u.id),[id,'troop']);
 assert.equal(a.guardCandidates(h).some(u=>u.id===h.id),false,'no self guard');
 S.pending={a:'attacker',d:'ally',base:1};S.guardTargeting=true;
 assert.equal(a.chooseGuardFromMap(h),true);assert.equal(S.pending.guardUnitId,h.id);
 const attacker={definitionId:'UNIT_CAV_001',id:'attacker',side:1,hp:1,q:2,r:0};S.units.push(attacker);
 timers.shift()();assert.equal(ally.hp,1,'ally protected');assert.equal(h.hp,2,'Hero absorbs damage immediately in resolution');assert.equal(S.pending,null);
}
const arch=hero('HERO_ARCH_001','arch');S.units=[arch,ally];
assert.equal(a.canAttack(arch,{q:3,r:0}),true,'line range3 through occupied cell');
assert.equal(a.canAttack(arch,{q:2,r:1}),false,'off-line disallowed');
assert.equal(a.canAttack(arch,{q:4,r:0}),false,'range limit');
const cav=hero('HERO_CAV_001','cav');assert.equal(a.unitSpec(cav).move,3);
for(const h of [hero('HERO_INF_RODOC','r'),hero('HERO_INF_EST','e'),arch,cav]){
 for(const cls of ['infantry','archer','cavalry','neutral'])for(const type of ['atk','def']){
  assert.equal(a.validCardFor({cls,type},h,type),cls==='neutral'||cls===a.unitSpec(h).base,'equipment class eligibility');
 }
}
const victim={definitionId:'UNIT_INF_001',id:'victim',side:1,hp:1,q:1,r:0};
const behind={definitionId:'UNIT_INF_001',id:'behind',side:1,hp:2,q:2,r:0};
context.cells=[{q:2,r:0}];S.units=[cav,victim,behind];S.pending={a:'cav',d:'victim',base:1,sourceType:'ATTACK'};
a.resolveCombat();assert.equal(victim.hp,0);assert.equal(behind.hp,1,'Cavalry Hero inherits Pierce');assert.equal(cav.attacked,true);
victim.hp=1;behind.hp=2;S.pending={a:'cav',d:'victim',base:1,sourceType:'SKILL'};
a.resolveCombat();assert.equal(behind.hp,2,'skills keep their own effects without implicit Pierce');
assert.equal(context.views.hero('HERO_INF_RODOC').passives.includes('INF_GUARD'),true);
console.log('Hero class inheritance: infantry Hero guard + actual damage resolution; archer lines; cavalry Pierce; equipment and preserved Hero stats/skills: PASS');
