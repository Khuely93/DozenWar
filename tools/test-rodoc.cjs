const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const root=fs.readFileSync(require('node:path').join(__dirname,'../src/core/core-runtime-a.js'),'utf8');
const content=fs.readFileSync(require('node:path').join(__dirname,'../src/content/content-runtime.js'),'utf8');
const data=content.match(/SKILL_HERO_RODOC_S[123]:\{[^\n]+/g)||[];
assert.equal(data.length,3);
assert.match(content,/HERO_INF_RODOC:\{[^\n]*stats:\{hp:3,move:1,attackRange:1\},attackPattern:'RANGE'/);
assert.match(data[0],/star:3,timing:'DEFENSE_REACTION'.*class:'INF',range:3,maxTargets:1,requireMissingHp:true/);
assert.match(data[1],/star:1,timing:'ACTIVE'.*class:'INF',range:3,maxTargets:2.*duration:'CURRENT_PLAYER_TURN'/);
assert.match(data[2],/star:1,timing:'ACTIVE'.*pattern:'LINE',range:4,maxTargets:4,selection:\{lineLock:true\}/);
function get(name){const start=root.indexOf('function '+name+'(');assert.ok(start>=0,name);const brace=root.indexOf('{',start);let n=0,i=brace;for(;i<root.length;i++){if(root[i]==='{')n++;if(root[i]==='}'&&--n===0)break}return root.slice(start,i+1)}
const names=['baseSkillCandidate','defenseSkillChoices','useDefenseSkill','defenseEquipmentWins','rayFrom','onRay','endTurn','resetTurnFlags','applySkillTarget','skillDamageValue','beginSkillDamageSequence','markDuelCardUsed'];
function harness(extra){const ctx=vm.createContext(extra);new vm.Script(names.map(get).join('\n')+'\nthis.exports={baseSkillCandidate,defenseSkillChoices,useDefenseSkill,defenseEquipmentWins,rayFrom,onRay,endTurn,applySkillTarget};').runInContext(ctx);return ctx.exports}
const healer={id:'rodoc',definitionId:'HERO_INF_RODOC',side:2,hero:true,hp:2,q:0,r:0};
const target={id:'inf',side:2,hp:1,q:1,r:0};
const far={id:'far',side:2,hp:1,q:4,r:0};
const archer={id:'arch',side:2,hp:1,q:0,r:1};
const enemy={id:'enemy',side:1,hp:2,q:2,r:0};
const skill={id:'SKILL_HERO_RODOC_S1',name:'Hồi sức',timing:'DEFENSE_REACTION',star:3,target:{side:'ALLY',class:'INF',range:3,requireMissingHp:true},effects:['EFFECT_HEAL_1']};
const S={units:[healer,target,far,archer,enemy],pending:{a:'enemy',d:'inf',base:1,sourceType:'ATTACK'},skillUsed:{},battleSide:1};
let used=0,resolved=0,logs=[];
const state={S,dirs:[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]],heroDefenseReactionSkills:h=>h.id==='rodoc'?[{skillNo:1,skill}]:[],isSkillUsed:()=>used>0,
  CorePowerResolver:{resolve:()=>({winner:'RESPONSE'})},pendingAttackPower:()=>1,
  effectOf:(record,id)=>record.effects?.includes(id),baseSkillCandidate:null,
  unitClassId:u=>u.id==='arch'?'ARCH':'INF',distU:(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r)),unitSpec:u=>({name:u.id,hp:u.id==='rodoc'?3:2}),
  EFFECTS:{EFFECT_HEAL_1:{value:1}},markSkillUsed:()=>used++,resolveCombat:()=>resolved++,lg:m=>logs.push(m)};
const api=harness(state);state.baseSkillCandidate=api.baseSkillCandidate;
let choices=api.defenseSkillChoices(target);assert.equal(choices.length,1);assert.deepEqual(Array.from(choices[0].targets,u=>u.id),['rodoc','inf']);
assert.equal(api.useDefenseSkill(choices[0],target),true);assert.equal(target.hp,2);assert.equal(used,1);assert.equal(resolved,1);assert.equal(S.pending.cancel,undefined);
assert.equal(api.defenseSkillChoices(target).length,0,'skill cannot be used twice');
assert.equal(api.useDefenseSkill(choices[0],target),false,'stale reaction rejected');
used=0;target.hp=1;const card={uid:'def1',name:'Khiên',cls:'infantry',type:'def',star:4,effects:['EFFECT_CANCEL_ATTACK']};S.hands={1:[],2:[card]};
state.validCardFor=()=>true;state.CorePowerResolver.resolve=(attack,response)=>({winner:response>=attack?'RESPONSE':'ATTACK'});state.pendingAttackPower=()=>4;
choices=api.defenseSkillChoices(target);assert.equal(choices.length,1,'equipment can raise defense skill power');
assert.equal(api.useDefenseSkill(choices[0],target),false,'skill alone cannot beat a higher Star');
assert.equal(api.useDefenseSkill(choices[0],target,card),true);assert.equal(S.hands[2].length,0);assert.equal(S.pending.defenseSkillStar,3);
assert.equal(api.defenseEquipmentWins(S.pending,card),true);
const ray=api.rayFrom(healer,enemy);assert.equal(api.onRay(healer,{q:4,r:0},ray,4),true);assert.equal(api.onRay(healer,{q:2,r:1},ray,4),false);
const moveSkill={id:'SKILL_HERO_RODOC_S2',name:'Tiếng thét xung trận',timing:'ACTIVE',duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_MOVE_PLUS_2'],target:{maxTargets:2}};
const moveHero={...healer,side:1,hp:3,attacked:false,moveBuff:0};const a={id:'a',side:1,hp:2,moveBuff:0},b={id:'b',side:1,hp:2,moveBuff:0};
const M={units:[moveHero,a,b],selected:moveHero,phase:'battle',battleSide:1,turn:1,hands:{1:[],2:[]},skillTarget:{heroId:moveHero.id,skillId:moveSkill.id,skillNo:2,selected:['a','b']},skillUsed:{},cardUsed:{},history:[]};
const m=harness({S:M,ContentViews:{skill:()=>moveSkill},skillDamageValue:()=>0,baseSkillCandidate:()=>true,isSkillUsed:()=>false,
  save:()=>{},distU:()=>0,unitSpec:()=>({hp:3}),effectOf:(s,id)=>s?.effects?.includes(id),EFFECTS:{},CoreBuffController:{addMove:(u,v)=>u.moveBuff+=v},
  markSkillUsed:()=>{},commitActiveSkillAction:u=>u.attacked=true,skillTargetPanel:{classList:{remove:()=>{}}},
  hideUnitMenu:()=>{},hideAttackPopup:()=>{},renderBoard:()=>{},updateUI:()=>{},lg:()=>{},resetSkillUsageForModeBoundary:()=>{}});
assert.equal(m.applySkillTarget(),undefined);assert.equal(moveHero.attacked,true);assert.deepEqual([a.moveBuff,b.moveBuff],[2,2]);
assert.equal(m.endTurn(),true);assert.deepEqual([a.moveBuff,b.moveBuff],[0,0]);assert.equal(M.battleSide,2);
console.log('Rodoc: content, defense target/range/one-use and Equipment, line targeting, two Move buffs and turn expiry: PASS');
