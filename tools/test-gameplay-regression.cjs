const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual runtime functions with small, deterministic game states.
const source = fs.readFileSync(path.join(__dirname, '../src/core/core-runtime-a.js'), 'utf8');
const sourceB = fs.readFileSync(path.join(__dirname, '../src/core/core-runtime-b.js'), 'utf8');
const sourceAI = fs.readFileSync(path.join(__dirname, '../src/legacy/legacy-ai-runtime.js'), 'utf8');
const prelude = fs.readFileSync(path.join(__dirname, '../src/legacy/legacy-prelude-c.js'), 'utf8');
function runtimeFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} exists`);
  const brace = source.indexOf('{', start);
  let depth = 0, end = brace;
  for (; end < source.length; end++) {
    if (source[end] === '{') depth++;
    if (source[end] === '}' && --depth === 0) break;
  }
  return source.slice(start, end + 1);
}
const functions = ['resetTurnFlags', 'resolveCombat', 'doPierce', 'lineSkill', 'findCellAxialStep', 'unitAt', 'selectUnit',
  'pendingAttackPower', 'skillDamageValue', 'commitActiveSkillAction', 'beginSkillDamageSequence',
  'resolveNextSkillSequenceTarget', 'applySkillTarget', 'cancelSkillTarget', '_beginSkillTargetInternal',
  'markDuelCardUsed', 'validCardFor', 'defenseCards'];
function attackOverride() {
  const start=sourceB.indexOf('startAttack=function(a,d){');
  assert.notEqual(start,-1,'attack override exists');
  const brace=sourceB.indexOf('{',start);let depth=0,end=brace;
  for(;end<sourceB.length;end++){
    if(sourceB[end]==='{')depth++;
    if(sourceB[end]==='}'&&--depth===0)break;
  }
  return 'this.startAttack='+sourceB.slice(start+'startAttack='.length,end+1)+';';
}
function attackCardsFunction() {
  const marker='function attackCardsFor(u){';const start=sourceB.indexOf(marker);
  assert.notEqual(start,-1);
  return sourceB.slice(start,sourceB.indexOf('\n',start));
}
const preludeUsage=prelude.split('\n').find(line=>line.startsWith('function duelUsage(){'));
const script = new vm.Script(preludeUsage+'\n'+functions.map(runtimeFunction).join('\n')+'\n'+attackCardsFunction()+'\n'+attackOverride()+
  '\nthis.gameplay = {resetTurnFlags, resolveCombat, doPierce, lineSkill, selectUnit, pendingAttackPower, commitActiveSkillAction, applySkillTarget, resolveNextSkillSequenceTarget, cancelSkillTarget, _beginSkillTargetInternal, validCardFor, attackCardsFor, defenseCards, startAttack:this.startAttack};');
function run(state) {
  const context = vm.createContext(state);
  script.runInContext(context);
  return context.gameplay;
}
const cases = [];
function test(name, fn) { cases.push({name, fn}); }

test('turn reset clears targeting and Bot queue; refreshes only active units', () => {
  const active = {side:2, moved:true, attacked:true, movementCostSpent:2, moveBuff:1, damageBuff:1};
  const other = {side:1, attacked:true};
  let menuHides = 0, popupHides = 0, panelHides = 0;
  const S = {battleSide:2, units:[other, active], cardUsed:{1:true,2:true}, selected:active,
    mode:'attack', pending:{a:1}, skillSequence:{}, skillTarget:{}, attackChoice:{}, botQueue:[1]};
  const {resetTurnFlags} = run({S, hideUnitMenu:()=>menuHides++, hideAttackPopup:()=>popupHides++,
    skillTargetPanel:{classList:{remove:()=>panelHides++}}});
  resetTurnFlags();
  assert.deepEqual([menuHides,popupHides,panelHides], [1,1,1]);
  assert.equal(active.attacked,false);
  assert.equal(active.movementCostSpent,0);
  assert.equal(active.moveBuff,0);
  assert.equal(other.attacked,true);
  for (const key of ['selected','mode','pending','skillSequence','skillTarget','attackChoice','botQueue']) assert.equal(S[key],null,key);
  assert.deepEqual({...S.cardUsed},{1:false,2:false});
});

test('Pierce damage stops at zero behind a defeated target', () => {
  const a={q:0,r:0,side:1}, d={q:1,r:0,side:2,hp:0}, behind={q:2,r:0,side:2,hp:1};
  const S={units:[a,d,behind]};
  const {doPierce}=run({S,cells:[{q:2,r:0}],axial:u=>[u.q,u.r],lg:()=>{}});
  doPierce(a,d,2);
  assert.equal(behind.hp,0);
});

test('Pierce does not damage an ally behind the target', () => {
  const a={q:0,r:0,side:1}, d={q:1,r:0,side:2}, behind={q:2,r:0,side:1,hp:1};
  const {doPierce}=run({S:{units:[a,d,behind]},cells:[{q:2,r:0}],axial:u=>[u.q,u.r],lg:()=>{}});
  doPierce(a,d,2);
  assert.equal(behind.hp,1);
});

test('line skill damages enemies up to target limit and clamps HP', () => {
  const caster={q:0,r:0,side:1}, first={q:1,r:0,side:2,hp:1}, second={q:2,r:0,side:2,hp:3};
  const {lineSkill}=run({S:{units:[caster,first,second]},cells:[{q:1,r:0},{q:2,r:0}],
    dirs:[[1,0]],axial:u=>[u.q,u.r],lg:()=>{}});
  lineSkill(caster,2,1,2);
  assert.equal(first.hp,0);
  assert.equal(second.hp,3);
});

function combat(state) {
  const events=[];
  const defaults={
    hideUnitMenu:()=>{}, hideAttackPopup:()=>{}, hideDefensePopup:()=>{}, showReaction:()=>{}, renderBoard:()=>{}, updateUI:()=>{},
    lg:message=>events.push(message), effectOf:()=>false, effectValue:()=>0,
    defenseEquipmentWins:()=>true,
    unitSpec:()=>({name:'unit',passives:[]}), checkWin:()=>null,
    reactionBox:{style:{}}, CorePowerResolver:{resolve:()=>({winner:'RESPONSE'})},
    axial:u=>[u.q,u.r],cells:[]
  };
  return {game:run({...defaults,...state}), events};
}

test('Guard redirects combat damage and preserves the original Hero HP', () => {
  const attacker={id:1,side:1,hp:3,attacked:false};
  const hero={id:2,side:2,hp:2,hero:true};
  const guard={id:3,side:2,hp:1};
  const S={units:[attacker,hero,guard],pending:{a:1,d:2,base:1,sourceType:'ATTACK',
    guard:true,guardUnitId:3,cancel:false},skillSequence:null,matchEnded:false};
  let wins=0;
  const {game}=combat({S,checkWin:()=>{wins++;return null;}});
  game.resolveCombat();
  assert.equal(hero.hp,2);
  assert.equal(guard.hp,0);
  assert.equal(attacker.attacked,true);
  assert.equal(S.pending,null);
  assert.equal(wins,1);
});

test('Reflect resolves after lethal damage to defender', () => {
  const attacker={id:1,side:1,hp:1,attacked:false};
  const defender={id:2,side:2,hp:1,hero:true};
  const card={star:1,name:'Reflect'};
  const S={units:[attacker,defender],pending:{a:1,d:2,base:1,sourceType:'ATTACK',
    defCard:card,guard:false,cancel:false},skillSequence:null,matchEnded:false};
  const {game}=combat({S,effectOf:(_card,id)=>id==='EFFECT_REFLECT_DAMAGE',
    checkWin:()=>attacker.hp===0&&defender.hp===0?'DRAW':null});
  assert.equal(game.resolveCombat(),'DRAW');
  assert.equal(attacker.hp,0);
  assert.equal(defender.hp,0);
});

function skillState({card=null,damage=false,targetsCount=1}={}) {
  const hero={id:'hero',side:1,hp:3,hero:true,attacked:false};
  const targets=Array.from({length:targetsCount},(_,i)=>({id:'target'+i,side:damage?2:1,hp:3}));
  const skill={id:'skill',name:'Test Skill',timing:'ACTIVE',star:1,effects:[damage?'EFFECT_DAMAGE_2':'EFFECT_HEAL_1']};
  const S={selected:hero,units:[hero,...targets],phase:'battle',battleSide:1,selectedMode:'MODE_DUEL_001',
    hands:{1:card?[card]:[],2:[]},skillUsed:{},matchEnded:false,
    skillTarget:{heroId:hero.id,skillId:skill.id,skillNo:1,selected:targets.map(t=>t.id),cardUid:card?.uid||null}};
  const events=[];
  const game=run({S,ContentViews:{skill:()=>skill},DW_MODES:{get:()=>({actionPolicy:{activeSkillConsumesAction:true}})},
    effectOf:(item,id)=>!!item?.effects?.includes(id),EFFECTS:{EFFECT_HEAL_1:{value:1}},
    baseSkillCandidate:()=>true,validCardFor:()=>true,save:()=>events.push('saved'),
    markSkillUsed:()=>events.push('skill used'),isSkillUsed:()=>false,
    skillTargetPanel:{classList:{remove:()=>{}}},CoreBuffController:{addMove:()=>{},addDamage:()=>{}},
    unitSpec:()=>({name:'unit',hp:3,base:'infantry'}),renderBoard:()=>{},updateUI:()=>{},renderUnitMenu:()=>{},
    hideUnitMenu:()=>{},hideAttackPopup:()=>{},hideDefensePopup:()=>{},reactionBox:{style:{}},showReaction:()=>events.push('reaction'),
    lg:msg=>events.push(msg),checkWin:()=>null,setTimeout:()=>{},
    CORE_STAR_SOURCE:{HERO_SKILL:'HERO_SKILL',EQUIPMENT:'EQUIPMENT'},
    CorePowerResolver:{finalPower:sources=>Math.max(0,...sources.map(s=>s.star)),resolve:()=>({winner:'RESPONSE'})},
    effectValue:(item,id)=>item?.effects?.includes(id)?1:0,
    defenseEquipmentWins:()=>true});
  return {hero,targets,skill,S,game,events};
}

test('support Skill consumes the Hero action only when confirmed', () => {
  const x=skillState();x.targets[0].hp=2;
  x.game.applySkillTarget();
  assert.equal(x.targets[0].hp,3);
  assert.equal(x.hero.attacked,true);
  assert.equal(x.S.skillTarget,null);
  assert.equal(x.events.filter(e=>e==='skill used').length,1);
});

test('cancel Skill targeting retains the action and Card', () => {
  const card={uid:'card1',star:2,effects:['EFFECT_DAMAGE_PLUS_1']};
  const x=skillState({card,damage:true});
  x.game.cancelSkillTarget();
  assert.equal(x.hero.attacked,false);
  assert.equal(x.S.hands[1].length,1);
  assert.equal(x.S.skillTarget,null);
  assert.equal(x.events.filter(e=>e==='skill used').length,0);
});

test('one Card joins all Skill hits, contributes damage and maximum Star, and is consumed once', () => {
  const card={uid:'card1',name:'Attack Card',star:2,cls:'infantry',type:'atk',effects:['EFFECT_DAMAGE_PLUS_1','EFFECT_IGNORE_INF_GUARD']};
  const x=skillState({card,damage:true,targetsCount:2});
  x.game.applySkillTarget();
  assert.equal(x.hero.attacked,true);
  assert.equal(x.S.hands[1].length,0);
  assert.equal(x.events.filter(e=>e==='skill used').length,1);
  assert.equal(x.S.pending.atkCard,card);
  assert.equal(x.S.pending.ignoreGuard,true);
  assert.equal(x.game.pendingAttackPower(x.S.pending),2);
  assert.equal(x.S.pending.base,2);
  x.game.resolveCombat();
  assert.equal(x.targets[0].hp,0); // base 2 + Card 1
  x.game.resolveNextSkillSequenceTarget();
  assert.equal(x.S.pending.atkCard,card);
  x.game.resolveCombat();
  assert.equal(x.targets[1].hp,0);
  assert.equal(x.S.hands[1].length,0);
  assert.equal(x.hero.attacked,true);
});

test('Rodoc Chiến Thần applies Equipment damage, effects, and max Star to four hits', () => {
  const card={uid:'rodoc-card',name:'Bộ binh ATK',star:3,cls:'infantry',type:'atk',effects:['EFFECT_DAMAGE_PLUS_1','EFFECT_IGNORE_INF_GUARD']};
  const x=skillState({card,damage:true,targetsCount:4});
  x.hero.definitionId='HERO_INF_RODOC';
  x.skill.id='SKILL_HERO_RODOC_S3';x.skill.name='Chiến Thần';
  x.skill.effects=['EFFECT_DAMAGE_1'];x.skill.star=1;
  x.S.skillTarget.skillId=x.skill.id;
  x.game.applySkillTarget();
  assert.equal(x.hero.attacked,true);
  assert.equal(x.events.filter(e=>e==='skill used').length,1);
  assert.equal(x.S.hands[1].length,0);
  for(let i=0;i<4;i++){
    const pending=x.S.pending;
    assert.equal(pending.d,x.targets[i].id);
    assert.equal(pending.base,1);
    assert.equal(pending.ignoreGuard,true);
    assert.equal(x.game.pendingAttackPower(pending),3);
    x.game.resolveCombat();
    assert.equal(x.targets[i].hp,1,`target ${i} takes 1 Skill + 1 Equipment damage`);
    if(i<3)x.game.resolveNextSkillSequenceTarget();
  }
  assert.equal(x.S.hands[1].length,0,'one Card spent for the complete Skill');
  assert.equal(x.hero.attacked,true);
});

test('invalid or missing selected Card cannot spend a Skill action', () => {
  const x=skillState({card:{uid:'card1',star:1},damage:true});
  x.S.hands[1]=[];
  assert.equal(x.game.applySkillTarget(),false);
  assert.equal(x.hero.attacked,false);
  assert.equal(x.S.skillTarget.cardUid,'card1');
  assert.equal(x.events.filter(e=>e==='saved').length,0);
});

test('support Skill consumes Card and retains all attack effects for next normal Attack', () => {
  const card={uid:'card1',name:'Charge',star:2,cls:'infantry',type:'atk',effects:['EFFECT_DAMAGE_PLUS_1','EFFECT_IGNORE_INF_GUARD']};
  const x=skillState({card});
  x.targets[0].hp=2;
  x.game.applySkillTarget();
  assert.equal(x.hero.attacked,true);
  assert.equal(x.targets[0].hp,3);
  assert.equal(x.S.hands[1].length,0);
  assert.equal(x.hero.queuedAttackEquipment,card);
  x.S.battleSide=1;
  x.game.resetTurnFlags();
  assert.equal(x.hero.queuedAttackEquipment,card);
  assert.equal(x.hero.attacked,false);
  x.S.attackChoice={type:'normal',card:null};
  x.game.startAttack(x.hero,{id:'enemy',side:2});
  assert.equal(x.S.pending.atkCard,card);
  assert.equal(x.S.pending.ignoreGuard,true);
  assert.equal(x.game.pendingAttackPower(x.S.pending),2);
  assert.equal(x.hero.queuedAttackEquipment,null);
});

test('invalid pending Card leaves normal Attack and hand untouched', () => {
  const card={uid:'missing',name:'Missing',star:2,type:'atk'};
  const x=skillState();x.S.attackChoice={type:'card',card};
  assert.equal(x.game.startAttack(x.hero,{id:'enemy',side:2}),false);
  assert.equal(x.S.pending,undefined);
  assert.equal(x.S.hands[1].length,0);
});

test('normal Attack commits one pending Card with damage and Star', () => {
  const card={uid:'card1',name:'Attack Card',star:2,cls:'infantry',type:'atk',effects:['EFFECT_DAMAGE_PLUS_1']};
  const x=skillState({card});
  x.S.attackChoice={type:'card',card};
  x.game.startAttack(x.hero,{id:'enemy',side:2});
  assert.equal(x.S.hands[1].length,0);
  assert.equal(x.S.pending.sourceType,'ATTACK');
  assert.equal(x.S.pending.atkCard,card);
  assert.equal(x.game.pendingAttackPower(x.S.pending),2);
  assert.equal(x.S.pending.base,1);
});

test('confirmed pending Card follows an ACTIVE support Skill before target confirmation', () => {
  const card={uid:'card1',name:'Charge',star:1,type:'atk',cls:'infantry'};
  const x=skillState({card});
  x.S.skillTarget=null;x.S.equipSelectedCard=card;x.S.equipPendingActorId=x.hero.id;
  const context=run({S:x.S,heroSkill:()=>x.skill,isSkillUsed:()=>false,
    baseSkillCandidate:()=>true,unitSpec:()=>({base:'infantry'}),
    hideUnitMenu:()=>{},updateSkillTargetPanel:()=>{},renderBoard:()=>{},updateUI:()=>{}});
  context._beginSkillTargetInternal(1);
  assert.equal(x.S.skillTarget.cardUid,card.uid);
  assert.equal(x.S.hands[1].length,1);
  assert.equal(x.hero.attacked,false);
});

test('a later incoming hit may use a Card after the defensive Skill was spent', () => {
  const attacker={id:1,side:1,hp:3};const defender={id:2,side:2,hp:3,hero:true};
  const S={units:[attacker,defender],pending:{a:1,d:2,base:1,sourceType:'ATTACK',cancel:true,
    cancelReason:'DODGE'},skillUsed:{'2::S1':true},skillSequence:null,matchEnded:false};
  const {game}=combat({S,effectOf:(card,id)=>!!card?.effects?.includes(id),effectValue:()=>0});
  game.resolveCombat();
  assert.equal(defender.hp,3);
  S.pending={a:1,d:2,base:1,sourceType:'ATTACK',cancel:false,
    defCard:{star:1,effects:['EFFECT_CANCEL_ATTACK']}};
  game.resolveCombat();
  assert.equal(defender.hp,3);
  assert.equal(S.skillUsed['2::S1'],true);
  S.pending={a:1,d:2,base:1,sourceType:'ATTACK',cancel:false};
  game.resolveCombat();
  assert.equal(defender.hp,2);
});

test('Infantry soldier uses a matching attack Card; mismatched class is rejected', () => {
  const soldier={id:'inf',side:1,kind:'inf',hero:false,hp:2,attacked:false};
  const enemy={id:'enemy',side:2,kind:'cav',hero:false,hp:2};
  const card={uid:'inf-card',name:'Infantry Attack',cls:'infantry',type:'atk',star:1,effects:['EFFECT_DAMAGE_PLUS_1']};
  const wrong={uid:'arch-card',name:'Archer Attack',cls:'archer',type:'atk',star:1,effects:['EFFECT_DAMAGE_PLUS_1']};
  const S={phase:'battle',battleSide:1,units:[soldier,enemy],hands:{1:[card,wrong],2:[]},
    attackChoice:{type:'card',card},skillSequence:null,matchEnded:false};
  const {game}=combat({S,unitSpec:u=>({name:'soldier',base:u.kind==='inf'?'infantry':'cavalry',passives:[]}),
    effectOf:(c,id)=>!!c?.effects?.includes(id),effectValue:(c,id)=>c?.effects?.includes(id)?1:0});
  assert.deepEqual(game.attackCardsFor(soldier).map(c=>c.uid),[card.uid]);
  game.startAttack(soldier,enemy);
  assert.equal(S.pending.atkCard,card);
  assert.deepEqual(S.hands[1].map(c=>c.uid),[wrong.uid]);
  game.resolveCombat();
  assert.equal(enemy.hp,0); // normal 1 + Equipment 1
  assert.equal(soldier.attacked,true);
});

test('Duel consumes the only attack Equipment slot when the first Card commits', () => {
  const a={id:'a',side:1,kind:'inf',hp:2},b={id:'b',side:1,kind:'inf',hp:2};
  const enemy={id:'e',side:2,kind:'cav',hp:3};
  const card={uid:'first',cls:'infantry',type:'atk',star:1};
  const next={uid:'next',cls:'infantry',type:'atk',star:1};
  const S={selectedMode:'MODE_DUEL_001',phase:'battle',battleSide:1,units:[a,b,enemy],
    hands:{1:[card,next],2:[]},attackChoice:{type:'card',card},skillSequence:null};
  const {game}=combat({S,unitSpec:u=>({name:u.id,base:u.kind==='inf'?'infantry':'cavalry',passives:[]})});
  game.startAttack(a,enemy);
  assert.equal(S.duelUsage.attackCard[1],1);
  assert.equal(game.validCardFor(next,b,'atk'),false);
});

test('Infantry soldier can defend with a matching defense Card on an incoming hit', () => {
  const attacker={id:'enemy',side:1,kind:'cav',hero:false,hp:2};
  const soldier={id:'inf',side:2,kind:'inf',hero:false,hp:2};
  const card={uid:'def-card',name:'Infantry Defense',cls:'infantry',type:'def',star:1,
    effects:['EFFECT_DAMAGE_REDUCE_1']};
  const wrong={uid:'arch-def',cls:'archer',type:'def',star:1};
  const S={units:[attacker,soldier],hands:{1:[],2:[card,wrong]},
    pending:{a:'enemy',d:'inf',base:1,sourceType:'ATTACK',cancel:false},skillSequence:null,matchEnded:false};
  const {game}=combat({S,unitSpec:u=>({name:'soldier',base:u.kind==='inf'?'infantry':'cavalry',passives:[]}),
    effectOf:(c,id)=>!!c?.effects?.includes(id),effectValue:(c,id)=>c?.effects?.includes(id)?1:0});
  assert.deepEqual(game.defenseCards(soldier).map(c=>c.uid),[card.uid]);
  S.pending.defCard=card;S.hands[2]=S.hands[2].filter(c=>c.uid!==card.uid);
  game.resolveCombat();
  assert.equal(soldier.hp,2);
  assert.deepEqual(S.hands[2].map(c=>c.uid),[wrong.uid]);
});

test('completed unit cannot be selected for orders; moved unit still can', () => {
  const completed={id:'done',side:1,hp:2,attacked:true};
  const moved={id:'moving',side:1,hp:2,moved:true,movementCostSpent:1,attacked:false};
  const S={phase:'battle',battleSide:1,pending:null,selected:null,mode:null};
  const {selectUnit}=run({S,updateUI:()=>{},renderBoard:()=>{},renderUnitMenu:()=>{}});
  assert.equal(selectUnit(completed),false);
  assert.equal(S.selected,null);
  assert.equal(selectUnit(moved),true);
  assert.equal(S.selected,moved);
});

test('Bot turn never lets the human select Bot units', () => {
  const bot={id:'bot',side:2,hp:2,attacked:false};
  const S={phase:'battle',battleSide:2,botSide:2,pending:null,selected:null};
  const {selectUnit}=run({S,updateUI:()=>{},renderBoard:()=>{},renderUnitMenu:()=>{}});
  assert.equal(selectUnit(bot),false);
  assert.equal(S.selected,null);
});

function botScenario(overrides={}) {
  const timers=[];
  const bot={id:'bot',side:2,hp:2,hero:false,kind:'inf'};
  const player={id:'player',side:1,hp:3,hero:false,kind:'cav'};
  const S={phase:'battle',battleSide:2,botSide:2,botDifficulty:'normal',botRunning:false,
    botQueue:null,matchEnded:false,units:[bot,player],hands:{1:[],2:[]},pending:null,skillSequence:null};
  const context=vm.createContext({S,aiThinking:{classList:{add:()=>{},remove:()=>{}}},
    setTimeout:fn=>timers.push(fn),isBotSide:p=>p===2,attackCardsFor:()=>[],
    pickAttackTarget:()=>player,canAttack:()=>true,canMoveFurther:()=>false,
    startAttack:(a,d)=>{S.pending={a:a.id,d:d.id,base:1};return true},
    showDefensePopup:()=>{},hideDefensePopup:()=>{},guardCandidates:()=>[],defenseCards:()=>[],
    heroDefenseReactionSkill:()=>null,defenseSkillChoices:()=>[],useDefenseSkill:()=>false,isSkillUsed:()=>false,effectValue:()=>0,effectOf:()=>false,
    defenseEquipmentWins:()=>true,
    resolveCombat:()=>{player.hp--;S.pending=null},endTurn:()=>{S.battleSide=1;return true},
    resolveNextSkillSequenceTarget:()=>{},
    lg:()=>{},hideUnitMenu:()=>{},renderBoard:()=>{},updateUI:()=>{},...overrides});
  new vm.Script(sourceAI+'\nthis.botTest={botActNext,scheduleBotTurn,showDefensePopup,resolveCombat,resolveNextSkillSequenceTarget,pickAttackTarget,chooseMoveCell,planBotSkill,botUseSkill,botAttackCard,botLearningProfile,botObserveResolvedHit,botChooseClose};').runInContext(context);
  function advance(limit=30){let n=0;while(timers.length){assert.ok(++n<=limit,'Bot turn must finish');timers.shift()()}}
  return {S,bot,player,botTest:context.botTest,advance,timers};
}

test('Bot Guard resolves damage and does not leave the pending hit stuck', () => {
  const guard={id:'guard',side:2,hp:2,kind:'inf',hero:false};
  const x=botScenario({guardCandidates:()=>[guard],
    resolveCombat:()=>{const p=x.S.pending;guard.hp-=p.base;x.S.pending=null}});
  x.S.battleSide=1;x.S.botDifficulty='normal';x.S.units.push(guard);
  x.S.pending={a:'player',d:'bot',base:1,ignoreGuard:false};
  x.botTest.showDefensePopup(x.bot);
  x.advance();
  assert.equal(guard.hp,1);
  assert.equal(x.bot.hp,2);
  assert.equal(x.S.pending,null);
});

test('Bot finishes remaining actions and returns the turn after a defended hit', () => {
  const x=botScenario();
  x.botTest.scheduleBotTurn();
  x.timers.shift()();
  assert.equal(x.S.pending.d,'player');
  assert.equal(x.S.botQueue.length,0);
  x.botTest.resolveCombat();
  x.advance();
  assert.equal(x.player.hp,2);
  assert.equal(x.S.pending,null);
  assert.equal(x.S.battleSide,1);
  assert.equal(x.S.botRunning,false);
});

test('Human defender with no available reaction takes damage automatically', () => {
  const x=botScenario();
  x.S.botQueue=[];
  x.S.pending={a:'bot',d:'player',base:1};
  x.botTest.showDefensePopup(x.player);
  x.advance();
  assert.equal(x.player.hp,2);
  assert.equal(x.S.pending,null);
});

test('Hero defeat shows the win/lose result and rematch controls', () => {
  const shell=fs.readFileSync(path.join(__dirname,'../src/shell/shell-gameover-runtime.js'),'utf8');
  const start=shell.indexOf('function showGameOver('),end=shell.indexOf('\nDW_SHELL.bindMatchEnd(',start);
  assert.ok(start>=0&&end>start);
  const overlay={opened:false};
  const element=()=>({textContent:'',className:'',disabled:false});
  const GameOverDOM={title:element(),text:element(),p1Card:element(),p2Card:element(),
    p1Outcome:element(),p2Outcome:element(),p2Name:element(),room:element(),mode:element(),
    match:element(),rematchButton:element()};
  const S={matchEnded:false,isRanked:false,botSide:2,botDifficulty:'normal',
    selectedMode:'MODE_DUEL_001',units:[{id:'h1',side:1,hero:true,hp:2},{id:'h2',side:2,hero:true,hp:0}],
    matchSession:{matchId:'AI-M001'},roomSession:{roomId:'AI',modeId:'MODE_DUEL_001',matchHistory:[],
      playerSlots:[{slotId:1,type:'human',connected:true},{slotId:2,type:'bot',connected:true,name:'BOT'}]}};
  const DW_SHELL={onMatchEnd:result=>context.showGameOver(result)};
  const context=vm.createContext({S,GameOverDOM,ShellGameOverController:{setWaiting:()=>{},open:()=>{overlay.opened=true}},
    renderRematchPlayers:()=>{},DW_SHELL});
  const modeRegistry=fs.readFileSync(path.join(__dirname,'../src/mode/mode-registry-runtime.js'),'utf8');
  const modeRules=fs.readFileSync(path.join(__dirname,'../src/mode/mode-definitions-runtime.js'),'utf8');
  new vm.Script(modeRegistry+'\n'+modeRules+'\nthis.DW_MODES=DW_MODES;').runInContext(context);
  new vm.Script(shell.slice(start,end)+'\nthis.showGameOver=showGameOver').runInContext(context);
  const checkStart=shell.indexOf('checkWin=function(){'),checkEnd=shell.indexOf('\n};',checkStart);
  assert.ok(checkStart>=0&&checkEnd>checkStart);
  new vm.Script('this.checkWin='+shell.slice(checkStart+'checkWin='.length,checkEnd+3)+';').runInContext(context);
  context.DW_CORE={emitGameEvent:event=>context.DW_MODES.onCoreEvent(event)};
  context.checkWin();
  assert.equal(S.matchEnded,true);
  assert.equal(GameOverDOM.title.textContent,'CHIẾN THẮNG!');
  assert.equal(GameOverDOM.p1Outcome.textContent,'CHIẾN THẮNG');
  assert.equal(GameOverDOM.rematchButton.disabled,false);
  assert.equal(overlay.opened,true);
});

test('Hard Bot targets a lethal Hero hit instead of a low-value troop', () => {
  const x=botScenario({unitSpec:()=>({base:'infantry'}),guardCandidates:()=>[]});
  x.S.botDifficulty='hard';x.player.hero=true;x.player.hp=1;
  x.S.units.push({id:'troop',side:1,kind:'inf',hero:false,hp:2});
  assert.equal(x.botTest.pickAttackTarget(x.bot).id,x.player.id);
});

test('Low-HP Bot Hero avoids moving into immediate attack range', () => {
  const range=(a,b)=>Math.abs(a.q-b.q)+Math.abs(a.r-b.r);
  const positions=[{q:1,r:0},{q:2,r:0}];
  const x=botScenario({reachableCells:()=>new Set(['1,0','2,0']),cells:positions,
    distU:range,movementCostToCell:()=>1,unitSpec:()=>({base:'infantry'}),
    canAttack:(a,b)=>range(a,b)<=1,guardCandidates:()=>[]});
  x.bot.hero=true;x.bot.hp=1;x.bot.q=0;x.bot.r=0;
  x.player.q=3;x.player.r=0;
  x.S.botDifficulty='hard';
  assert.equal(x.botTest.chooseMoveCell(x.bot).q,1);
});

test('Bot Hero uses a legal damage Skill when it is stronger than a normal Attack', () => {
  const skill={id:'s1',timing:'ACTIVE',target:{maxTargets:1,range:3},effects:['EFFECT_DAMAGE_2']};
  const x=botScenario({heroDefinition:()=>({skillIds:['s1']}),heroSkill:()=>skill,
    isSkillUsed:hero=>hero.attacked,baseSkillCandidate:(hero,entry,target)=>target.side!==hero.side,
    skillDamageValue:()=>2,skillNeedsLineLock:()=>false,
    applySkillTarget:()=>{x.bot.attacked=true;x.S.pending={a:x.bot.id,d:x.player.id,base:2}}});
  x.bot.hero=true;x.S.botDifficulty='hard';x.player.hp=2;
  x.botTest.botActNext();
  assert.equal(x.bot.attacked,true);
  assert.equal(x.S.pending.base,2);
  assert.equal(x.S.skillTarget.selected[0],x.player.id);
});

test('Bot returns to a Hero after a support Skill that preserves Attack', () => {
  let used=false;
  const skill={id:'support',timing:'ACTIVE',effects:['EFFECT_MOVE_PLUS_2']};
  const x=botScenario({skillDamageValue:()=>0,skillNeedsLineLock:()=>false,
    isSkillUsed:()=>used,applySkillTarget:()=>{used=true;x.S.skillTarget=null}});
  x.bot.hero=true;x.S.botQueue=[];
  assert.equal(x.botTest.botUseSkill(x.bot,{skill,skillNo:1,targets:[x.bot]}),true);
  assert.deepEqual([...x.S.botQueue],[x.bot.id]);
});

test('Bot resumes its turn after the last target of a multi-target Skill', () => {
  const x=botScenario({resolveNextSkillSequenceTarget:()=>{x.S.skillSequence=null}});
  x.S.skillSequence={targetIds:[],index:0};x.S.botQueue=[];
  x.botTest.resolveNextSkillSequenceTarget();
  x.advance();
  assert.equal(x.S.battleSide,1);
});

test('Blocked end-turn does not schedule another Bot turn', () => {
  const shell=fs.readFileSync(path.join(__dirname,'../src/shell/shell-session-runtime.js'),'utf8');
  const line=shell.split('\n').find(s=>s.startsWith('const _endTurn_v12=endTurn;'));
  assert.ok(line);
  let scheduled=0;
  const context=vm.createContext({endTurn:()=>false,scheduleBotTurn:()=>scheduled++,setTimeout:()=>scheduled++});
  new vm.Script(line+'\nthis.tryEndTurn=endTurn;').runInContext(context);
  assert.equal(context.tryEndTurn(),false);
  assert.equal(scheduled,0);
});

test('Bot saves a defense Card whose Star cannot win the response', () => {
  const x=botScenario({defenseCards:d=>x.S.hands[d.side],
    defenseEquipmentWins:()=>false,
    resolveCombat:()=>{x.bot.hp--;x.S.pending=null}});
  x.S.battleSide=1;x.S.botDifficulty='hard';
  x.S.hands[2]=[{uid:'weak',star:0,effects:['EFFECT_CANCEL_ATTACK']}];
  x.S.pending={a:'player',d:'bot',base:1};
  x.botTest.showDefensePopup(x.bot);
  x.advance();
  assert.equal(x.bot.hp,1);
  assert.equal(x.S.hands[2].length,1);
});

test('Multi-target Skill advances immediately after Bot Guard and releases end turn', () => {
  const {S,hero,targets,game}=skillState({damage:true,targetsCount:2});
  const guard={id:'guard',side:2,hp:2};S.units.push(guard);
  S.skillTarget=null;S.skillSequence={heroId:hero.id,skillId:'skill',skillNo:3,
    targetIds:targets.map(t=>t.id),index:1,damage:1,card:null};
  S.pending={a:hero.id,d:targets[0].id,base:1,sourceType:'SKILL',skillStar:1,
    guard:true,guardUnitId:guard.id,cancel:false};
  game.resolveCombat();
  assert.equal(guard.hp,1);
  assert.equal(targets[0].hp,3);
  assert.equal(S.pending.d,targets[1].id);
  game.resolveCombat();
  assert.equal(targets[1].hp,2);
  assert.equal(S.pending,null);
  assert.equal(S.skillSequence,null);
});

test('Lethal Skill clears unfinished target sequence for visible result UI', () => {
  const {S,hero,targets,game}=skillState({damage:true,targetsCount:2});
  S.skillTarget=null;S.skillSequence={heroId:hero.id,skillId:'skill',skillNo:3,
    targetIds:targets.map(t=>t.id),index:1,damage:3};
  targets[0].hp=1;targets[0].hero=true;
  S.pending={a:hero.id,d:targets[0].id,base:3,sourceType:'SKILL',cancel:false};
  // The result controller sets matchEnded in response to a lethal Hero snapshot.
  const ctx=vm.createContext({S,hideUnitMenu:()=>{},hideDefensePopup:()=>{},
    unitSpec:()=>({name:'unit',passives:[]}),effectValue:()=>0,effectOf:()=>false,
    reactionBox:{style:{}},lg:()=>{},renderBoard:()=>{},updateUI:()=>{},
    checkWin:()=>{if(targets[0].hp===0){S.matchEnded=true;return {ended:true}}return null}});
  new vm.Script(runtimeFunction('resolveCombat')+'\nthis.hit=resolveCombat;').runInContext(ctx);
  assert.equal(ctx.hit().ended,true);
  assert.equal(S.skillSequence,null);
  assert.equal(S.pending,null);
});

test('Bot clears an orphaned target selection and finishes its turn', () => {
  const x=botScenario({endTurn:()=>x.S.skillTarget?false:(x.S.battleSide=1,true),
    skillTargetPanel:{classList:{remove:()=>{}}}});
  x.S.botQueue=[];x.S.skillTarget={heroId:'bot',selected:[]};
  x.botTest.scheduleBotTurn();x.advance();
  assert.equal(x.S.skillTarget,null);
  assert.equal(x.S.battleSide,1);
  assert.equal(x.S.botRunning,false);
});

test('Bot learns only player actions and counters repeated Infantry Guard', () => {
  const damage={uid:'damage',star:2,effects:['EFFECT_DAMAGE_PLUS_1']};
  const bypass={uid:'bypass',star:2,effects:['EFFECT_IGNORE_INF_GUARD']};
  const x=botScenario({attackCardsFor:()=>[damage,bypass],guardCandidates:()=>[{id:'guard'}],
    effectOf:(card,id)=>!!card?.effects?.includes(id),
    effectValue:(card,id)=>card?.effects?.includes(id)?1:0});
  const human=x.player,bot=x.bot;human.hero=true;
  x.botTest.botObserveResolvedHit({guard:true},bot,human);
  x.botTest.botObserveResolvedHit({guard:true},bot,human);
  x.botTest.botObserveResolvedHit({guard:false},bot,human);
  x.botTest.botObserveResolvedHit({},human,bot);
  x.botTest.botObserveResolvedHit({},bot,bot);
  assert.equal(x.S.botProfile.defenses,3);
  assert.equal(x.S.botProfile.guards,2);
  assert.equal(x.S.botProfile.attacks,1);
  assert.equal(x.botTest.botAttackCard(bot,human).uid,'bypass');
});

test('Bot varies comparable choices without taking a much worse move', () => {
  const random=Object.create(Math);random.random=()=>0;
  const x=botScenario({Math:random});
  const close=[{id:'best',score:40},{id:'alternative',score:38},{id:'bad',score:5}];
  assert.equal(x.botTest.botChooseClose(close).id,'alternative');
  assert.equal(x.botTest.botChooseClose([{id:'best',score:40},{id:'bad',score:5}]).id,'best');
});

test('Adaptive Bot returns control after 25 successive simulated turns', () => {
  const x=botScenario({endTurn:()=>{x.S.battleSide=1;x.S.turn++;x.S.botQueue=null;return true},
    startAttack:(a,d)=>{x.S.pending={a:a.id,d:d.id,base:1};x.timers.push(()=>x.botTest.resolveCombat());return true}});
  x.player.hp=100;x.S.turn=1;
  for(let i=0;i<25;i++){
    x.S.battleSide=2;x.bot.attacked=false;x.botTest.scheduleBotTurn();x.advance(40);
    assert.equal(x.S.battleSide,1,'Bot must return turn '+i);
    assert.equal(x.S.pending,null);
    assert.equal(x.S.botRunning,false);
  }
  assert.equal(x.player.hp,75);
});

let failed=0;
for (const {name,fn} of cases) {
  try { fn(); console.log(`PASS | ${name}`); }
  catch (error) { failed++; console.error(`FAIL | ${name}\n${error.stack}`); }
}
console.log(`Gameplay checks: ${cases.length-failed}/${cases.length} PASS`);
if (failed) process.exitCode=1;
