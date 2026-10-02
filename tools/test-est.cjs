const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/core/core-runtime-a.js'),'utf8');
const ai=fs.readFileSync(path.join(__dirname,'../src/legacy/legacy-ai-runtime.js'),'utf8');
const content=fs.readFileSync(path.join(__dirname,'../src/content/content-runtime.js'),'utf8');
assert.match(content,/HERO_INF_EST:\{[^\n]*stats:\{hp:3,move:1,attackRange:1\},attackPattern:'RANGE'/);
for(const no of [1,2,3])assert.match(content,new RegExp('SKILL_HERO_EST_S'+no+':\\{'));
function extract(text,name){let start=text.indexOf('function '+name+'(');assert.ok(start>=0,name);let i=text.indexOf('{',start),depth=0;for(;i<text.length;i++){if(text[i]==='{')depth++;if(text[i]==='}'&&--depth===0)break}return text.slice(start,i+1)}
const fn=name=>extract(src,name);
const names=['showPhiThanDefenseCards','defenseCards','finishPhiThanTarget','selectedSkillTarget','beginDefenseSkillTarget','clearDefenseSkillTarget','baseSkillCandidate','isSkillCandidate','handleSkillTargetClick','defenseSkillChoices','useDefenseSkill','resolveCombat','defenseEquipmentWins','cancelSkillTarget','_beginSkillTargetInternal','applySkillTarget','skillDamageValue','beginSkillDamageSequence','commitActiveSkillAction','resolveNextSkillSequenceTarget','endTurn','resetTurnFlags','markDuelCardUsed'];
const routerStart=src.indexOf('const CoreSkillController = Object.freeze({');const routerEnd=src.indexOf('\n});',routerStart)+4;
function run(state){const random=Object.create(Math);random.random=()=>.99;const context=vm.createContext({...state,Math:random});new vm.Script(names.map(fn).join('\n')+'\n'+src.slice(routerStart,routerEnd)+'\n'+extract(ai,'botChooseClose')+'\n'+extract(ai,'planBotSkill')+'\n'+extract(ai,'botUseSkill')+'\nthis.api={beginDefenseSkillTarget,clearDefenseSkillTarget,isSkillCandidate,baseSkillCandidate,defenseSkillChoices,useDefenseSkill,resolveCombat,cancelSkillTarget,_beginSkillTargetInternal,applySkillTarget,endTurn,CoreSkillController,planBotSkill,botUseSkill};').runInContext(context);return context.api}
const skills=[
 {id:'SKILL_HERO_EST_S1',name:'Phi thân',star:1,timing:'DEFENSE_REACTION',target:{side:'ALLY',unitType:'TROOP',range:3,maxTargets:1},effects:['EFFECT_SWAP_ALLY']},
 {id:'SKILL_HERO_EST_S2',name:'Phục thù',star:1,timing:'DEFENSE_REACTION',target:{side:'ENEMY',range:3,maxTargets:2,requireRecentAttacker:true},effects:['EFFECT_RETALIATE_1']},
 {id:'SKILL_HERO_EST_S3',name:'Ác mộng phía đông',star:1,timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:4},maneuver:{moveBonus:2,attackFlow:'SELECT_ADJACENT'},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_DAMAGE_1','EFFECT_MOVE_PLUS_2']}
];
function scenario(){
 const est={id:'est',hero:true,side:1,q:0,r:0,hp:3,moveBuff:0,attacked:false,movementCostSpent:0};
 const infantry={id:'inf',hero:false,side:1,q:1,r:0,hp:2};
 const friend={id:'friend',hero:false,side:1,q:0,r:1,hp:2};
 const attacker={id:'enemy',hero:false,side:2,q:2,r:0,hp:3};
 const prior={id:'prior',hero:false,side:2,q:0,r:2,hp:2};
 const far={id:'far',hero:false,side:2,q:4,r:0,hp:2};
 const S={phase:'battle',battleSide:2,turn:1,selected:null,units:[est,infantry,friend,attacker,prior,far],pending:{a:'enemy',d:'est',base:1,sourceType:'ATTACK',cancel:false},recentAttackers:{1:['prior','enemy'],2:[]},hands:{1:[],2:[]},skillUsed:{},matchEnded:false,history:[]};
 const used=[];const events=[];
 const state={S,heroDefenseReactionSkills:h=>h.id==='est'?[{skillNo:1,skill:skills[0]},{skillNo:2,skill:skills[1]}]:[],
 isSkillUsed:(u,n)=>used.includes(n),markSkillUsed:(u,n)=>used.push(n),
 CorePowerResolver:{resolve:()=>({winner:'RESPONSE'})},pendingAttackPower:()=>0,
 effectOf:(o,id)=>!!o?.effects?.includes(id),effectValue:(o,id)=>o?.effects?.includes(id)?1:0,
 unitClassId:u=>u.id==='arch'?'ARCH':'INF',unitSpec:u=>({name:u.id,hp:u.hero?3:2,passives:[]}),
 distU:(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r)),aligned:()=>true,
 validCardFor:()=>true,EFFECTS:{EFFECT_HEAL_1:{value:1}},
 lg:m=>events.push(m),hideUnitMenu:()=>{},hideDefensePopup:()=>{},renderBoard:()=>{},updateUI:()=>{},checkWin:()=>null,
 reactionBox:{style:{}},setTimeout:()=>{},skillTargetPanel:{classList:{remove:()=>{}}},
 unitAt:(q,r)=>S.units.find(u=>u.q===q&&u.r===r&&u.hp>0),
 movementCostToCell:()=>2,movementCostSpent:u=>u.movementCostSpent||0,
 updateSkillTargetPanel:()=>{},renderUnitMenu:()=>{},remainingMove:u=>3-(u.movementCostSpent||0),
 heroSkill:(_u,n)=>skills[n-1],heroDefinition:()=>({skillIds:['SKILL_HERO_EST_S1','SKILL_HERO_EST_S2','SKILL_HERO_EST_S3']}),
 skillNeedsLineLock:()=>false,botAttackScore:()=>0,botAttackCard:()=>null,reachableCellCosts:()=>new Map([['1,0',1]]),attackCardsFor:()=>[],ContentViews:{skill:id=>skills.find(s=>s.id===id)},
 document:{createElement:()=>({})},defCardList:{innerHTML:'',children:[],appendChild(b){this.children.push(b)},classList:{add(){}}},
 defPopupTitle:{},defPopupTarget:{},defPopupHint:{},defGuardChoice:{style:{}},defHeroSkillChoice:{style:{}},defEquipChoice:{style:{}},
 positionDefensePopup:()=>events.push('phi-than-card-window'),showDefensePopup:()=>events.push("defense-reopened"),hideAttackPopup:()=>{},showReaction:()=>{},save:()=>S.history.push(JSON.stringify({units:S.units})),
 DW_MODES:{get:()=>({actionPolicy:{activeSkillConsumesAction:true}})},
 skillTargetCancel:{},skillTargetConfirm:{},CoreBuffController:{addMove:()=>{}},
 resetSkillUsageForModeBoundary:()=>{}};
 return {est,infantry,friend,attacker,prior,far,S,used,events,state,api:run(state)}
}
{
 const x=scenario();const c=x.api.defenseSkillChoices(x.est);
 assert.deepEqual(Array.from(c,v=>v.skillNo),[1,2]);
 assert.deepEqual(Array.from(c[0].targets,u=>u.id),['inf','friend']);
 assert.deepEqual(Array.from(c[1].targets,u=>u.id),['enemy','prior']);
 assert.equal(x.api.useDefenseSkill(c[0],x.infantry),true);
 assert.deepEqual([x.est.q,x.est.r,x.infantry.q,x.infantry.r],[1,0,0,0]);
 assert.equal(x.est.hp,3);assert.equal(x.infantry.hp,1);
 assert.equal(x.S.pending,null);assert.deepEqual(x.used,[1]);
}
{
 const x=scenario();x.S.pending.d='friend';const c=x.api.defenseSkillChoices(x.friend);
 assert.deepEqual(Array.from(c,v=>v.skillNo),[2]);
 assert.equal(x.api.useDefenseSkill(c[0],[x.attacker,x.prior,x.far]),false);
 assert.equal(x.api.useDefenseSkill(c[0],[x.attacker,x.prior]),true);
 assert.equal(x.friend.hp,1);assert.equal(x.attacker.hp,2);assert.equal(x.prior.hp,1);assert.equal(x.far.hp,2);
 assert.deepEqual(x.used,[2]);
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;x.S.units=x.S.units.filter(u=>u.id!=='inf'&&u.id!=='friend');
 x.api._beginSkillTargetInternal(3);
 assert.equal(x.est.moveBuff,2);assert.equal(x.S.skillTarget.selected.length,0);assert.equal(x.S.skillTarget.moving,true);
 x.api.CoreSkillController.handleHexClick({q:2,r:0});assert.equal(x.est.q,0,'movement requires move mode');
 assert.equal(x.api.CoreSkillController.hexClasses({q:1,r:0},null),' hl');x.api.CoreSkillController.handleHexClick({q:1,r:0});
 assert.equal(x.est.q,1);assert.equal(x.est.movementCostSpent,2);
 x.api.cancelSkillTarget();assert.equal(x.est.q,0);assert.equal(x.est.moveBuff,0);assert.equal(x.est.movementCostSpent,0);
 x.api._beginSkillTargetInternal(3);x.api.CoreSkillController.handleHexClick({q:1,r:0});
 assert.equal(x.S.skillTarget.moving,true,'moving stays active with Move remaining');
 assert.equal(x.api.applySkillTarget(),false,'an unselected enemy cannot be attacked');
 x.api.CoreSkillController.handleUnitClick(x.attacker);
 assert.deepEqual(Array.from(x.S.skillTarget.selected),['enemy']);
 x.api.applySkillTarget();
 assert.equal(x.est.attacked,true);assert.equal(x.est.turnMoveBuff,2);assert.equal(x.S.pending.d,'enemy');
 assert.equal(x.S.pending.base,1);assert.equal(x.S.pending.skillStar,1);
 assert.equal(x.S.history.length,1);assert.equal(JSON.parse(x.S.history[0]).units[0].q,0,'undo snapshot precedes maneuver');
 x.S.pending=null;x.S.skillSequence=null;x.api.endTurn();assert.equal(x.est.moveBuff,0);
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;
 x.S.units=x.S.units.filter(u=>u.id!=='inf');x.attacker.q=1;
 x.api._beginSkillTargetInternal(3);
 assert.equal(x.est.q,0);assert.equal(x.est.movementCostSpent,0);
 x.api.CoreSkillController.handleUnitClick(x.attacker);
 assert.deepEqual(Array.from(x.S.skillTarget.selected),['enemy']);
 x.api.applySkillTarget();
 assert.equal(x.S.pending.d,'enemy');assert.equal(x.est.attacked,true);
 assert.equal(x.est.movementCostSpent,0,'attack works without spending a Move');
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;
 x.S.units=x.S.units.filter(u=>u.id!=='inf');x.attacker.q=1;
 x.S.hands[1]=[{uid:'card',cls:'infantry',type:'atk',star:2,effects:['EFFECT_DAMAGE_PLUS_1']}];
 x.state.attackCardsFor=()=>x.S.hands[1];
 x.api._beginSkillTargetInternal(3);x.api.CoreSkillController.handleUnitClick(x.attacker);x.S.skillTarget.cardUid='card';x.api.applySkillTarget();
 assert.equal(x.S.pending.atkCard?.uid,'card');assert.equal(x.S.pending.skillStar,1);
}
{
 const hero={id:'est',q:0,r:0,hp:3,attacked:false,moved:false,movementCostSpent:0,moveBuff:2};
 const cells=[0,1,2,3].map(q=>({q,r:0}));
 const S={phase:'battle',skillTarget:{heroId:'est',skillId:'SKILL_HERO_EST_S3',moving:true}};
 const context=vm.createContext({S,cells,ContentViews:{skill:id=>skills.find(s=>s.id===id)},remainingMove:u=>3-u.movementCostSpent,
  canMoveFurther:u=>!u.moved,cellNeighbors:c=>cells.filter(n=>Math.abs(n.q-c.q)===1),unitAt:()=>null});
 new vm.Script(fn('reachableCellCosts')+'\n'+fn('movementCostToCell')+'\nthis.cost=movementCostToCell;').runInContext(context);
 assert.equal(context.cost(hero,{q:1,r:0}),1);hero.q=1;hero.movementCostSpent=1;hero.moved=true;
 assert.equal(context.cost(hero,{q:2,r:0}),1,'second leg remains available after the first leg');
 hero.q=2;hero.movementCostSpent=2;assert.equal(context.cost(hero,{q:3,r:0}),1);
 hero.q=3;hero.movementCostSpent=3;assert.equal(context.cost(hero,{q:2,r:0}),null,'no leg after Move is spent');
}
{
 const hero={id:'est',side:1,q:0,r:0,hp:3};const enemy={id:'enemy',side:2,q:1,r:0,hp:2};
 const S={units:[hero,enemy],skillTarget:{heroId:'est',skillId:'SKILL_HERO_EST_S3',skillNo:3,selected:[],cardUid:null,moving:true}};
 const control=()=>({style:{},textContent:'',disabled:false,classList:{add:()=>{},remove:()=>{}}});
 const skillTargetPanel=control(),skillTargetName=control(),skillTargetHint=control(),skillMoveButton=control(),skillTargetConfirm=control(),skillEquipWrap=control();
 const skillEquipSelect={value:'',replaceChildren:()=>{},add:()=>{}};
 const context=vm.createContext({S,skillTargetPanel,skillTargetName,skillTargetHint,skillMoveButton,skillTargetConfirm,skillEquipWrap,skillEquipSelect,
  ContentViews:{skill:id=>skills.find(s=>s.id===id)},attackCardsFor:()=>[],remainingMove:()=>2,Option:function(label,value){this.label=label;this.value=value},
  baseSkillCandidate:(h,s,u)=>u.side!==h.side&&Math.abs(h.q-u.q)<=1&&h.r===u.r,skillNeedsLineLock:()=>false,cancelSkillTarget:()=>{}});
 new vm.Script(fn('updateSkillTargetPanel')+'\nthis.refresh=updateSkillTargetPanel;').runInContext(context);
 context.refresh();assert.equal(skillTargetConfirm.textContent,'⚔️ TẤN CÔNG');assert.equal(skillTargetConfirm.disabled,true);
 assert.equal(skillMoveButton.style.display,'none');assert.equal(S.skillTarget.selected.length,0);
 assert.match(skillTargetHint.textContent,/Chạm địch kề bên để chọn/);
 S.skillTarget.selected=['enemy'];context.refresh();assert.equal(skillTargetConfirm.disabled,false);
 S.skillTarget.selected=[];hero.q=3;context.refresh();assert.equal(skillTargetConfirm.disabled,true);
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;
 x.S.units=x.S.units.filter(u=>u.id!=='inf');x.attacker.q=1;
 x.api._beginSkillTargetInternal(3);x.api.CoreSkillController.handleUnitClick(x.attacker);
 assert.deepEqual(Array.from(x.S.skillTarget.selected),['enemy']);
 x.api.CoreSkillController.handleUnitClick(x.attacker);assert.equal(x.S.skillTarget.selected.length,0,'click again deselects');
 x.api.CoreSkillController.handleUnitClick(x.attacker);
 x.api.CoreSkillController.handleHexClick({q:-1,r:0});
 assert.equal(x.S.skillTarget.selected.length,0,'moving to a new position clears prior targets');
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;
 x.S.units=x.S.units.filter(u=>u.id!=='inf'&&u.id!=='friend');x.attacker.q=1;x.prior.q=0;x.prior.r=1;
 x.api._beginSkillTargetInternal(3);
 x.api.CoreSkillController.handleUnitClick(x.attacker);x.api.CoreSkillController.handleUnitClick(x.prior);
 assert.deepEqual(Array.from(x.S.skillTarget.selected),['enemy','prior']);
 x.api.applySkillTarget();assert.equal(x.S.pending.d,'enemy');
 assert.deepEqual(Array.from(x.S.skillSequence.targetIds),['enemy','prior']);
}
{
 const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.selected=x.est;
 x.S.units=x.S.units.filter(u=>u.id!=='inf'&&u.id!=='friend');
 Object.assign(x.attacker,{q:1,r:0});Object.assign(x.prior,{q:0,r:1});Object.assign(x.far,{q:-1,r:0});
 const extra=[{id:'fourth',side:2,q:0,r:-1,hp:2},{id:'fifth',side:2,q:1,r:-1,hp:2}];x.S.units.push(...extra);
 x.api._beginSkillTargetInternal(3);
 for(const enemy of [x.attacker,x.prior,x.far,...extra])x.api.CoreSkillController.handleUnitClick(enemy);
 assert.deepEqual(Array.from(x.S.skillTarget.selected),['enemy','prior','far','fourth']);
}
{const x=scenario();x.S.pending=null;x.S.battleSide=1;x.S.botDifficulty='hard';x.S.units=x.S.units.filter(u=>!['inf','friend','prior','far'].includes(u.id));
 const plan=x.api.planBotSkill(x.est);assert.equal(plan.skillNo,3);assert.deepEqual([plan.moveCell.q,plan.moveCell.r],[1,0]);
 assert.equal(x.api.botUseSkill(x.est,plan),true);assert.equal(x.est.q,1);assert.equal(x.est.attacked,true);assert.equal(x.S.pending.d,'enemy')}
{const x=scenario();x.S.pending=null;x.api.endTurn();assert.deepEqual(Array.from(x.S.recentAttackers[1]),[]);assert.deepEqual(Array.from(x.S.recentAttackers[2]),[])}
console.log('EST: defensive reactions, manual target selection, optional multi-leg Move, Card, and immediate attack commit: PASS');

// Manual retaliation uses only recent, living enemies in range and commits on confirm.
{
 const x=scenario();x.S.selected=x.est;
 const choice=x.api.defenseSkillChoices(x.est).find(c=>c.skillNo===2);
 assert.equal(x.api.beginDefenseSkillTarget(choice),true);assert.equal(x.S.mode,'skill');assert.equal(x.S.skillTarget.defense,true);
 assert.deepEqual(x.used,[]);assert.equal(x.attacker.hp,3);
 assert.equal(x.api.isSkillCandidate(x.attacker),true);assert.equal(x.api.isSkillCandidate(x.prior),true);assert.equal(x.api.isSkillCandidate(x.far),false);assert.equal(x.api.isSkillCandidate(x.infantry),false);
 x.api.CoreSkillController.handleUnitClick(x.far);assert.equal(x.S.skillTarget.selected.length,0);
 x.api.CoreSkillController.handleUnitClick(x.attacker);x.api.CoreSkillController.handleUnitClick(x.prior);
 assert.equal(x.S.skillTarget.selected.length,2);assert.match(x.api.CoreSkillController.hexClasses({},x.prior),/skill-selected/);
 x.api.cancelSkillTarget();assert.equal(x.S.skillTarget,null);assert.ok(x.S.pending);assert.deepEqual(x.used,[]);assert.ok(x.events.includes('defense-reopened'));
 x.api.beginDefenseSkillTarget(choice);x.api.CoreSkillController.handleUnitClick(x.prior);assert.equal(x.api.applySkillTarget(),true);
 assert.deepEqual(x.used,[2]);assert.equal(x.prior.hp,1);assert.equal(x.attacker.hp,3);assert.equal(x.S.skillTarget,null);assert.equal(x.S.pending,null);
}
{
 const x=scenario();x.S.selected=x.est;const choice=x.api.defenseSkillChoices(x.est).find(c=>c.skillNo===2);
 x.api.beginDefenseSkillTarget(choice);x.api.CoreSkillController.handleUnitClick(x.prior);x.prior.hp=0;
 assert.equal(x.api.applySkillTarget(),false);assert.deepEqual(x.used,[]);
 x.api.resolveCombat();assert.equal(x.S.skillTarget,null,'defense timeout clears map targeting');assert.deepEqual(x.used,[]);
}
console.log('EST manual retaliation: valid highlight, chosen subset, cancel, stale/dead target and timeout cleanup: PASS');


// Phi than selects a troop, then offers only that troop's legal defense cards.
{
 const x=scenario();x.S.selected=x.est;
 const choice=x.api.defenseSkillChoices(x.est).find(c=>c.skillNo===1);
 assert.equal(x.api.beginDefenseSkillTarget(choice),true);
 assert.equal(x.api.isSkillCandidate(x.infantry),true);assert.equal(x.api.isSkillCandidate(x.est),false);
 x.api.cancelSkillTarget();assert.deepEqual(x.used,[]);
 x.api._beginSkillTargetInternal(1);x.api.CoreSkillController.handleUnitClick(x.infantry);
 assert.equal(x.est.q,1);assert.equal(x.infantry.q,0);
 assert.equal(x.est.hp,3);assert.equal(x.infantry.hp,1);
 assert.deepEqual(x.used,[1]);assert.equal(x.S.pending,null);assert.equal(x.S.skillTarget,null);
}
{
 const x=scenario();const card={uid:'troop-def',type:'def',star:1};x.S.hands[1]=[card];
 const choice=x.api.defenseSkillChoices(x.est).find(c=>c.skillNo===1);
 x.api.beginDefenseSkillTarget(choice);x.api.CoreSkillController.handleUnitClick(x.infantry);
 assert.equal(x.S.pending.replacementTargetId,'inf');assert.equal(x.infantry.hp,2);
 assert.deepEqual(x.used,[1]);assert.equal(x.S.hands[1].length,1);assert.equal(x.S.skillTarget,null);
 assert.ok(x.events.includes('phi-than-card-window'));
 x.api.resolveCombat();assert.equal(x.infantry.hp,1);assert.equal(x.est.hp,3);assert.equal(x.S.pending,null);
}
console.log('EST Phi than: troop card window, no-card auto resolve and timeout/pass replacement damage: PASS');

{
 const x=scenario();const card={uid:'troop-def',type:'def',star:1,effects:['EFFECT_DAMAGE_REDUCE_1']};x.S.hands[1]=[card];
 x.api.beginDefenseSkillTarget(x.api.defenseSkillChoices(x.est).find(c=>c.skillNo===1));
 x.api.CoreSkillController.handleUnitClick(x.infantry);
 assert.equal(x.state.defCardList.children.length,1);
 assert.equal(x.state.defGuardChoice.style.display,'none');
 x.state.defCardList.children[0].onclick();
 assert.equal(x.S.hands[1].length,0);assert.equal(x.infantry.hp,2);assert.equal(x.est.hp,3);assert.equal(x.S.pending,null);
}
console.log('EST Phi than troop equipment click: consumption, damage reduction and resolve: PASS');
