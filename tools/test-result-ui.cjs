const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const core=read('src/core/core-runtime-a.js');
const clock=read('src/mode/duel-turn-runtime.js');
const clockStart=clock.indexOf('const DuelTurnClock='),clockEnd=clock.indexOf('\n};',clockStart)+3;
const start=core.indexOf('function resolveCombat(){');
const end=core.indexOf('\nfunction doPierce(',start);
assert.ok(start>=0&&end>start);
const runtime=[read('src/mode/mode-registry-runtime.js'),read('src/mode/mode-definitions-runtime.js'),
  'const DW_CORE={emitGameEvent:event=>DW_MODES.onCoreEvent(event)};',
  core.slice(start,end),read('src/shell/shell-gameover-runtime.js'),
  'this.simulateHit=resolveCombat;this.evaluateWin=checkWin;'].join('\n');
const css=read('styles/main.css');
assert.match(css,/\.gameOverOverlay\.show\s*\{display:flex\}/);
function element(){const classes=new Set();const attributes={};return {
  className:'',textContent:'',innerHTML:'',disabled:false,
  classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c),contains:c=>classes.has(c)},
  setAttribute:(k,v)=>attributes[k]=v,getAttribute:k=>attributes[k]
}}
function scenario(p1hp,p2hp,pending=null){
  const a={id:'h1',side:1,hero:true,hp:p1hp},d={id:'h2',side:2,hero:true,hp:p2hp};
  const S={selectedMode:'MODE_DUEL_001',units:[a,d],pending,matchEnded:false,skillSequence:null,
    isRanked:false,botSide:2,botDifficulty:'normal',rating:100,
    matchSession:{matchId:'AI-TEST-M001'},roomSession:{roomId:'AI-TEST',modeId:'MODE_DUEL_001',
      playerRules:{requiredPlayersToStart:2},matchHistory:[],playerSlots:[
        {slotId:1,name:'PLAYER 1',type:'human',connected:true},
        {slotId:2,name:'BOT',type:'bot',connected:true}]}};
  const keys=['overlay','title','text','p1Card','p1Outcome','p2Card','p2Name','p2Outcome','room','mode','match','actions','rematchButton','leaveButton'];
  const GameOverDOM=Object.fromEntries(keys.map(k=>[k,element()]));
  const RematchDOM={players:element(),hint:element()};
  const DW_SHELL={_matchEndHandler:null,bindMatchEnd(fn){this._matchEndHandler=fn},onMatchEnd(result){this._matchEndHandler?.(result)}};
  const context=vm.createContext({S,GameOverDOM,RematchDOM,DW_SHELL,ShellDOM:{playMenu:{rating:element()}},
    ratingGain:()=>30,activeRoomPlayers:r=>r.playerSlots.filter(p=>p.connected),readyRoomPlayers:r=>r.playerSlots.filter(p=>p.rematchStatus==='READY'),
    hideUnitMenu:()=>{},hideDefensePopup:()=>{},renderBoard:()=>{},updateUI:()=>{},lg:()=>{},
    unitSpec:()=>({name:'Hero',passives:[]}),reactionBox:{style:{}},effectValue:()=>0,effectOf:()=>false,
    checkWin:()=>null,defenseEquipmentWins:()=>true,setTimeout:()=>{},CorePowerResolver:{resolve:()=>({winner:'RESPONSE'})}});
  new vm.Script(runtime).runInContext(context);
  return {S,a,d,GameOverDOM,context};
}
function check(label,scenarioData,expectedTitle){
  const {S,GameOverDOM,context}=scenarioData;
  const result=context.simulateHit();
  assert.equal(result.ended,true,label);
  assert.equal(S.matchEnded,true,label);
  assert.equal(GameOverDOM.overlay.classList.contains('show'),true,label);
  assert.equal(GameOverDOM.overlay.getAttribute('aria-hidden'),'false',label);
  assert.equal(GameOverDOM.title.textContent,expectedTitle,label);
  assert.equal(S.roomSession.matchHistory.length,1,label);
  assert.equal(GameOverDOM.rematchButton.disabled,false,label);
  console.log('PASS | '+label+' -> '+expectedTitle+' and visible result UI');
}
check('Player wins when Bot Hero reaches zero',scenario(3,1,{a:'h1',d:'h2',base:1,sourceType:'ATTACK',cancel:false}),'CHIẾN THẮNG!');
check('Player loses when own Hero reaches zero',scenario(1,3,{a:'h2',d:'h1',base:1,sourceType:'ATTACK',cancel:false}),'THẤT BẠI');
const skillFinish=scenario(3,1,{a:'h1',d:'h2',base:1,sourceType:'SKILL',skillStar:1,cancel:false});
skillFinish.S.skillSequence={heroId:'h1',targetIds:['h2','another'],index:1};
check('lethal multi-target Skill opens result and releases sequence',skillFinish,'CHIẾN THẮNG!');
assert.equal(skillFinish.S.skillSequence,null);
const recovered=scenario(3,1,{a:'h1',d:'h2',base:1,sourceType:'ATTACK',cancel:false});
recovered.S.selectedMode=null;
delete recovered.S.roomSession.matchHistory;
delete recovered.S.roomSession.playerRules;
const recoveredResult=recovered.context.simulateHit();
assert.equal(recoveredResult.winnerSide,1);
assert.equal(recovered.S.matchEnded,true);
assert.equal(recovered.GameOverDOM.overlay.classList.contains('show'),true);
assert.equal(recovered.GameOverDOM.title.textContent,'CHIẾN THẮNG!');
console.log('PASS | recovered room metadata -> win UI still opens');
const interrupted=scenario(0,3);
interrupted.S.matchEnded=true;
interrupted.context.evaluateWin();
assert.equal(interrupted.GameOverDOM.overlay.classList.contains('show'),true);
assert.equal(interrupted.GameOverDOM.title.textContent,'THẤT BẠI');
console.log('PASS | interrupted result rendering -> hidden result UI recovers');
const missed=scenario(0,3);
missed.S.phase='battle';
missed.context.duelTimerBadge={style:{},innerHTML:''};
missed.context.setInterval=()=>1;missed.context.clearInterval=()=>{};
new vm.Script(clock.slice(clockStart,clockEnd)+'\nthis.duelClock=DuelTurnClock;').runInContext(missed.context);
missed.context.duelClock.startTurn();missed.context.duelClock.tick();
assert.equal(missed.S.matchEnded,true);assert.equal(missed.GameOverDOM.overlay.classList.contains('show'),true);
console.log('PASS | timer recovers a missed Hero death and opens the result UI');
check('missing attack target still resolves a prior Hero death',scenario(0,3,{a:'h2',d:'missing',base:1,sourceType:'ATTACK'}),'THẤT BẠI');
const draw=scenario(1,1,{a:'h1',d:'h2',base:1,sourceType:'ATTACK',cancel:false,
  defCard:{name:'Reflect',star:1,effects:['EFFECT_REFLECT_DAMAGE']}});
// An equal-Star response reflects the same lethal damage to the attacker.
const drawContext=draw.context;
// This branch is covered separately by the gameplay Reflect regression; test the actual UI result via a resolved snapshot.
draw.a.hp=0;draw.d.hp=0;
const drawResult=drawContext.evaluateWin();
assert.equal(drawResult.resultType,'DRAW');
assert.equal(draw.GameOverDOM.overlay.classList.contains('show'),true);
assert.equal(draw.GameOverDOM.title.textContent,'HÒA!');
console.log('PASS | simultaneous Hero death -> HÒA! and visible result UI');
const ongoing=scenario(3,3);
assert.equal(ongoing.context.evaluateWin(),null);
assert.equal(ongoing.GameOverDOM.overlay.classList.contains('show'),false);
console.log('PASS | living Heroes -> result UI remains hidden');
const surrender=scenario(3,3);
const surrenderResult=vm.runInContext("DW_CORE.emitGameEvent({type:'CORE_EVENT_FIRST_PLAYER_INACTIVITY',side:1,count:5})",surrender.context);
assert.equal(surrenderResult.winnerSide,2);
assert.equal(surrender.GameOverDOM.overlay.classList.contains('show'),true);
assert.equal(surrender.GameOverDOM.title.textContent,'THẤT BẠI');
assert.match(surrender.GameOverDOM.text.textContent,/5 lượt/);
console.log('PASS | five turns without attack -> loss overlay opens');
