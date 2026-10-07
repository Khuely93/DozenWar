/* MODE_DUEL_001 owns its clocks and per-turn budgets. Core still resolves actions. */
const duelTimerBadge=document.createElement('div');
duelTimerBadge.className='duelTimers';
duelTimerBadge.setAttribute('aria-live','off');
CoreDOM.board.wrap.appendChild(duelTimerBadge);
const DuelTurnClock={
  turnRemainingMs:0,lastTickMs:0,defenseRemainingMs:0,defenseLastTickMs:0,defensePending:null,interval:null,timeoutHandled:false,defenseTimeoutPending:null,
  policy(){return DW_MODES.get(S.selectedMode)?.turnPolicy},
  enabled(){return S.selectedMode==='MODE_DUEL_001'&&S.phase==='battle'&&!S.matchEnded},
  display(){
    if(!this.enabled()){duelTimerBadge.style.display='none';return}
    duelTimerBadge.style.display='block';
    const attack=Math.max(0,Math.ceil(this.turnRemainingMs/1000));
    const defense=this.defensePending?'<span class="defenseClock">PHÒNG THỦ '+Math.max(0,Math.ceil(this.defenseRemainingMs/1000))+'s</span>':'';
    duelTimerBadge.innerHTML='<span>LƯỢT P'+S.battleSide+' · '+attack+'s'+(this.defensePending?' · TẠM DỪNG':'')+'</span>'+defense;
  },
  stop(){if(this.interval){clearInterval(this.interval);this.interval=null}this.defensePending=null;this.defenseTimeoutPending=null;this.timeoutHandled=false;this.turnRemainingMs=0;this.display()},
  startTurn(){
    if(!this.enabled())return this.stop();
    this.turnRemainingMs=(this.policy()?.turnTimerSeconds||180)*1000;
    this.lastTickMs=Date.now();this.defensePending=null;this.defenseTimeoutPending=null;this.defenseRemainingMs=0;this.timeoutHandled=false;
    if(!this.interval)this.interval=setInterval(()=>this.tick(),200);
    this.display();
  },
  openDefense(p){
    if(!this.enabled()||!p||this.defensePending===p)return;
    const now=Date.now();
    if(!this.defensePending)this.turnRemainingMs=Math.max(0,this.turnRemainingMs-(now-this.lastTickMs));
    this.defensePending=p;this.defenseTimeoutPending=null;this.defenseRemainingMs=(this.policy()?.defenseTimerSeconds||30)*1000;
    this.defenseLastTickMs=now;this.display();
  },
  afterResolve(){
    if(!this.enabled())return this.stop();
    if(S.pending){if(S.pending!==this.defensePending)this.openDefense(S.pending);return}
    this.defensePending=null;this.defenseTimeoutPending=null;this.defenseRemainingMs=0;this.lastTickMs=Date.now();this.display();
    if(this.turnRemainingMs<=0)this.autoEndTurn();
  },
  autoEndTurn(){
    if(!this.enabled()||S.pending||this.timeoutHandled)return;
    this.timeoutHandled=true;
    if(typeof HeroCore!=='undefined'&&HeroCore.selection){if(HeroCore.selection.continuation){HeroCore.selection=null;S.heroSequence=null;S.skillSequence=null;HeroCore.draw()}else HeroCore.cancel()}
    if(S.skillTarget)cancelSkillTarget();
    if(S.guardTargeting)hideGuardTargeting();
    // A timed-out multi-target selection cannot keep the turn blocked forever.
    if(S.skillSequence&&!S.pending)S.skillSequence=null;
    if(S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
    if(S.matchEnded)return this.stop();
    lg('⏱️ Hết 180 giây · tự động kết thúc lượt Player '+S.battleSide+'.');
    endTurn();
  },
  tick(){
    if(S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
    if(!this.enabled())return this.stop();
    const now=Date.now();
    if(S.pending){
      if(S.pending!==this.defensePending)this.openDefense(S.pending);
      this.defenseRemainingMs=Math.max(0,this.defenseRemainingMs-(now-this.defenseLastTickMs));
      this.defenseLastTickMs=now;this.display();
      if(this.defenseRemainingMs<=0&&S.pending===this.defensePending&&this.defenseTimeoutPending!==S.pending){
        this.defenseTimeoutPending=S.pending;
        lg('⏱️ Hết 30 giây phòng thủ · tự động bỏ qua phòng thủ.');
        hideGuardTargeting();resolveCombat();
      }
      return;
    }
    if(this.defensePending){this.afterResolve();return}
    this.turnRemainingMs=Math.max(0,this.turnRemainingMs-(now-this.lastTickMs));
    this.lastTickMs=now;this.display();
    if(this.turnRemainingMs<=0)this.autoEndTurn();
  }
};
const _duelMainAction=mainAction;
mainAction=function(){const was=S.phase;const result=_duelMainAction();if(was==='deploy'&&S.phase==='battle')DuelTurnClock.startTurn();return result};
const _duelEndTurn=endTurn;
endTurn=function(){
  if(S.selectedMode==='MODE_DUEL_001'&&S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
  if(S.matchEnded)return false;
  const side=S.battleSide;
  const changed=_duelEndTurn();
  if(!changed)return false;
  if(S.selectedMode==='MODE_DUEL_001'){
    if(side===S.winner){
      S.firstPlayerNoAttackTurns=S.firstPlayerAttackedThisTurn?0:(S.firstPlayerNoAttackTurns||0)+1;
    }
    S.firstPlayerAttackedThisTurn=false;
    S.duelUsage={activeSkill:{1:0,2:0},defenseSkill:{1:0,2:0},attackCard:{1:0,2:0},defenseCard:{1:0,2:0}};
    if(side===S.winner&&S.firstPlayerNoAttackTurns>=5){
      DW_CORE.emitGameEvent({type:'CORE_EVENT_FIRST_PLAYER_INACTIVITY',side,count:S.firstPlayerNoAttackTurns});
    }
    if(!S.matchEnded)DuelTurnClock.startTurn();else DuelTurnClock.stop();
    updateUI();
  }
  return true;
};
const _duelShowReaction=showReaction;
showReaction=function(defPhase){
  const p=S.pending;
  if(S.selectedMode==='MODE_DUEL_001'&&p&&S.units.find(u=>u.id===p.a)?.side===S.winner&&
     (p.sourceType==='ATTACK'||p.sourceType==='SKILL'&&(!p.heroMechanic||p.heroMechanic.heroAttack)))S.firstPlayerAttackedThisTurn=true;
  const result=_duelShowReaction(defPhase);
  if(defPhase&&p)DuelTurnClock.openDefense(p);
  return result;
};
const _duelResolveCombat=resolveCombat;
resolveCombat=function(){const p=S.pending;const result=_duelResolveCombat();if(p&&S.pending!==p)DuelTurnClock.afterResolve();return result};
const _duelResetMatchState=resetMatchState;
resetMatchState=function(){DuelTurnClock.stop();const result=_duelResetMatchState();S.duelUsage=null;S.firstPlayerNoAttackTurns=0;S.firstPlayerAttackedThisTurn=false;return result};

