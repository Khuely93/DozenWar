/* Confirmed Hero mechanics. Content supplies primitives, Mode supplies budgets/map rules.
   This module extends the existing combat transaction; mandatory effects finish before victory. */
const HeroCore={
  selection:null,
  notice:'',
  mode(){return DW_MODES.get(S.selectedMode)},
  alive(u){return !!u&&u.hp>0},
  statuses(u){return (u?.heroStatuses||[]).filter(s=>s.endTurn>=S.turn)},
  blocked(u,type){return this.statuses(u).some(s=>s.kind==='STUN'||s.kind==='FREEZE'||s.kind==='ROOT'&&['move','attack','active'].includes(type)||s.kind==='SILENCE'&&type==='defense')},
  status(u,kind){const endTurn=kind==='STUN'?S.turn+1:S.turn;(u.heroStatuses??=[]).push({kind,endTurn});},
  troopDefs(){const ids=this.mode()?.contentPolicy?.unitIds;return UnitRegistry.list().filter(d=>!ids||ids.includes(d.id))},
  spec(u){return unitSpec(u)},
  skillRange(h,sk){const r=sk.target?.range;return r==='ATTACK'?this.spec(h).range:r==='BASE_ATTACK'?HeroRegistry.get(h.definitionId).stats.attackRange:Number.isFinite(r)?r:99},
  cardBonus(card,type){return (card?.effects||[]).reduce((n,id)=>{const e=EffectRegistry.get(id);return n+(e?.type===type&&e.operation!=='SUBTRACT'?(e.value||0):0)},0)},
  targetLimit(h,sk,card){if(sk.parameters?.pull)return 1;return Math.max(1,(sk.target?.maxTargets||1)+(sk.heroAttack?(h.targetBuff||0)+this.cardBonus(card,'MODIFY_TARGET_COUNT'):0))},
  candidate(h,sk,u){
    if(!this.alive(u))return false;const t=sk.target||{};
    if(t.side==='SELF'&&u.id!==h.id||t.side==='ALLY'&&u.side!==h.side||t.side==='ENEMY'&&u.side===h.side)return false;
    if(t.unitType==='TROOP'&&u.hero||t.unitType==='HERO'&&!u.hero||t.class&&this.spec(u).classId!==t.class)return false;
    let range=this.skillRange(h,sk)+(sk.heroAttack&&typeof t.range==='number'?(h.rangeBuff||0):0);
    if(distU(h,u)>range||t.pattern==='LINE'&&!aligned(h,u,range))return false;
    if(t.requireMissingHp&&u.hp>=this.spec(u).hp)return false;
    if(sk.mechanic==='BUFF'&&u.attacked)return false;
    if(sk.parameters?.pull&&!this.pullDestination(h,u))return false;
    if(sk.mechanic==='CANCEL'&&sk.target.side!=='SELF'&&u.hero&&u.id!==h.id)return false;
    if(sk.mechanic==='REVENGE')return (S.attackHistory||[]).some(e=>e.turn===S.turn&&e.attacker===u.id&&e.targetSide===h.side&&distU(h,e.targetPosition)<=3);
    return true;
  },
  pullDestination(h,u){const ray=rayFrom(h,u);if(!ray)return null;const dest=findCellAxialStep(h,ray,1);if(!dest||unitAt(dest.q,dest.r))return null;
    for(let n=1;n<distU(h,u);n++){const c=findCellAxialStep(h,ray,n);if(!c||this.terrainBlocked(c)||unitAt(c.q,c.r))return null}return dest;
  },
  terrainBlocked(c){return !!(c.blocked||c.impassable||c.terrain?.blocked)},
  cellAllowed(h,c){const policy=this.mode()?.mapPolicy;const occupied=S.units.filter(u=>this.alive(u)&&u.q===c.q&&u.r===c.r&&u.id!==h.id);
    if(this.terrainBlocked(c))return false;
    if(policy?.occupancyMode!=='FORMATION')return !occupied.length;
    if(occupied.some(u=>u.side!==h.side))return false;
    return h.hero?occupied.filter(u=>u.hero).length<(policy.maxHeroesPerHex??1):occupied.filter(u=>!u.hero).length<(policy.maxTroopsPerHex??5);
  },
  escapeCells(h,sk){const range=sk.parameters.escapeRange;if(sk.parameters.teleport)return cells.filter(c=>distU(h,c)>0&&distU(h,c)<=range&&this.cellAllowed(h,c));
    const seen=new Set([h.q+','+h.r]),queue=[{c:h,d:0}],out=[];
    while(queue.length){const {c,d}=queue.shift();if(d>=range)continue;for(const n of cellNeighbors(c)){const k=n.q+','+n.r;if(seen.has(k)||this.terrainBlocked(n))continue;seen.add(k);queue.push({c:n,d:d+1});if(this.cellAllowed(h,n))out.push(n)}}return out;
  },
  canUse(h,n,sk=heroSkill(h,n),pending=S.pending){
    if(S.phase!=='battle'||S.matchEnded||!this.alive(h)||!sk||isSkillUsed(h,n))return false;
    const defense=h.side!==S.battleSide;
    if(defense){if(!['DEFENSE_REACTION','BOTH'].includes(sk.timing)||this.blocked(h,'defense'))return false;
      const d=pending&&S.units.find(u=>u.id===(pending.replacementTargetId||pending.d));
      if(pending&&pending.isCounterattack)return false;
      if(['SWAP','ESCAPE','DICE_WARD'].includes(sk.mechanic)&&(!d||d.id!==h.id))return false;
      if(sk.mechanic==='CANCEL'&&(!d||!this.candidate(h,sk,d)))return false;
      if(['PUSH','COUNTER'].includes(sk.mechanic)&&!(S.attackHistory||[]).some(e=>e.turn===S.turn&&e.targetSide===h.side))return false;
      if(sk.mechanic==='COUNTER'&&!pending)return false;
      if(sk.mechanic==='REVENGE'&&!this.targets(h,sk).length)return false;
      if(pending&&CorePowerResolver.resolve(pendingAttackPower(pending),sk.star||0).winner!=='RESPONSE'&&!(S.hands[h.side]||[]).some(c=>validCardFor(c,h,'def')&&CorePowerResolver.resolve(pendingAttackPower(pending),Math.max(c.star||0,sk.star||0)).winner==='RESPONSE'))return false;
    }else if(sk.timing==='DEFENSE_REACTION'||h.attacked||this.blocked(h,'active')||pending)return false;
    if(sk.parameters.requiresDeath&&!(S.troopDeaths||[]).some(e=>e.side===h.side))return false;
    if(sk.mechanic==='SUMMON'&&!cells.some(c=>distU(h,c)===1&&this.cellAllowed({side:h.side,hero:false,id:null},c)))return false;
    if(sk.mechanic==='ESCAPE'&&!this.escapeCells(h,sk).length)return false;
    if(sk.mechanic==='COPY'&&!this.copyChoices(h).length)return false;
    return true;
  },
  targets(h,sk){return S.units.filter(u=>this.candidate(h,sk,u))},
  copyChoices(h){const defense=h.side!==S.battleSide;return [...new Set((S.heroSkillHistory||[]).filter(e=>e.side!==h.side).map(e=>e.skillId))].map(id=>ContentViews.skill(id)).filter(sk=>sk&&sk.mechanic!=='COPY'&&(defense?['DEFENSE_REACTION','BOTH']:['ACTIVE','BOTH']).includes(sk.timing))},
  remember(h,sk,n){markSkillUsed(h,n);(S.heroSkillHistory??=[]).push({side:h.side,skillId:sk.id,turn:S.turn})},
  begin(h,n,override=null,continuation=false){
    const sk=override||heroSkill(h,n);if(!continuation&&!this.canUse(h,n,sk))return false;
    this.selection={h,n,sk,selected:[],cell:null,kind:this.troopDefs()[0]?.id,copyId:null,dice:[1,2],cardUid:S.equipPendingActorId===h.id?S.equipSelectedCard?.uid:null,continuation};
    hideUnitMenu();hideAttackPopup();hideDefensePopup();S.mode='hero-skill';this.draw();renderBoard();return true;
  },
  cancel(){if(this.selection?.continuation&&S.heroSequence)return false;this.selection=null;S.mode=null;this.draw();if(S.pending)showDefensePopup(S.units.find(u=>u.id===S.pending.d));return true},
  select(u){const s=this.selection;if(!s||!this.candidate(s.h,s.sk,u))return false;
    const i=s.selected.indexOf(u.id);if(i>=0)s.selected.splice(i,1);else{const max=this.targetLimit(s.h,s.sk,this.selectedCard());if(s.sk.target.selection?.lineLock&&s.selected.length&&!onRay(s.h,u,rayFrom(s.h,S.units.find(x=>x.id===s.selected[0])),this.skillRange(s.h,s.sk)))return false;if(max===1)s.selected=[u.id];else if(s.selected.length<max)s.selected.push(u.id)}this.draw();renderBoard();return true;
  },
  selectCell(c){const s=this.selection;if(!s)return false;const allowed=s.sk.mechanic==='ESCAPE'?this.escapeCells(s.h,s.sk):s.sk.mechanic==='SUMMON'?cells.filter(c=>distU(s.h,c)===1&&this.cellAllowed({side:s.h.side,hero:false,id:null},c)):[];if(!allowed.some(x=>x.q===c.q&&x.r===c.r))return false;s.cell=c;this.draw();renderBoard();return true},
  selectedCard(){const s=this.selection;return s&&(S.hands[s.h.side]||[]).find(c=>c.uid===s.cardUid)||null},
  equip(card,h,context){if(!card)return true;if(!validCardFor(card,h,context)||!(S.hands[h.side]||[]).some(c=>c.uid===card.uid))return false;S.hands[h.side]=S.hands[h.side].filter(c=>c.uid!==card.uid);markDuelCardUsed(h.side,context);return true},
  buff(u,p){for(const [field,key] of [['move','moveBuff'],['damage','damageBuff'],['range','rangeBuff'],['targets','targetBuff'],['attacks','attackCountBuff']])if(p[field]){u[key]=(u[key]||0)+p[field];(u.turnModifiers??={})[key]=(u.turnModifiers[key]||0)+p[field]}if(p.move)u.extraMoveGranted=(u.extraMoveGranted||0)+p.move;if(p.ignoreGuard){u.ignoreInfGuard=true;(u.turnModifiers??={}).ignoreInfGuard=true}},
  transform(u,id,hero){const def=UnitRegistry.get(id);if(!def)return false;if(hero){u.morphDefinitionId=id;u.classId=def.class;u.kind=CLASS_KIND[def.class];for(const key of ['equipment','equipmentCards','equipmentIds']){if(Array.isArray(u[key])){const kept=[];for(const c of u[key]){const card=typeof c==='string'?createEquipmentCardInstance(c,u.side):c;if(card&&equipmentEligibleForClass(card,def.class))kept.push(c);else if(card)(S.hands[u.side]??=[]).push({...card,uid:card.uid||crypto.randomUUID(),cls:CLASS_RUNTIME[card.class],type:card.category==='ATTACK'?'atk':card.category==='DEFENSE'?'def':'neu'})}u[key]=kept}}if(u.queuedAttackEquipment&&!equipmentEligibleForClass(u.queuedAttackEquipment,def.class)){S.hands[u.side].push(u.queuedAttackEquipment);u.queuedAttackEquipment=null}}else{u.definitionId=id;u.classId=def.class;u.kind=CLASS_KIND[def.class];u.hp=def.stats.hp}return true},
  incoming(p){let v=Math.max(0,p.base||0)+effectValue(p.atkCard,'EFFECT_DAMAGE_PLUS_1');if(p.defCard&&defenseEquipmentWins(p,p.defCard)){if(effectOf(p.defCard,'EFFECT_CANCEL_ATTACK'))return 0;v=Math.max(0,v-effectValue(p.defCard,'EFFECT_DAMAGE_REDUCE_1'))}return v},
  commit(){
    const s=this.selection;if(!s)return false;const {h,n,sk}=s,defense=h.side!==S.battleSide,p=sk.parameters||{},card=this.selectedCard();
    if(!s.continuation&&!this.canUse(h,n,sk)||s.cardUid&&!card&&!S.heroSequence?.normal)return false;
    let ts=s.selected.map(id=>S.units.find(u=>u.id===id));const cellSkill=['SUMMON','ESCAPE'].includes(sk.mechanic),optionSkill=['MORPH','COPY','DICE_WARD'].includes(sk.mechanic);
    if(!cellSkill&&!optionSkill&&!ts.length&&sk.target.side==='SELF')ts=[h];
    if(sk.target.selection?.lineLock&&ts.length>1&&!ts.every(t=>onRay(h,t,rayFrom(h,ts[0]),this.skillRange(h,sk)+(h.rangeBuff||0))))return false;
    if(!cellSkill&&!optionSkill&&(!ts.length||ts.some(t=>!this.candidate(h,sk,t))||ts.length>this.targetLimit(h,sk,card)))return false;
    if(cellSkill&&(!s.cell||!(sk.mechanic==='ESCAPE'?this.escapeCells(h,sk):cells.filter(c=>distU(h,c)===1&&this.cellAllowed({side:h.side,hero:false,id:null},c))).some(c=>c.q===s.cell.q&&c.r===s.cell.r)))return false;
    if(sk.mechanic==='DICE_WARD'&&(s.dice.length!==2||new Set(s.dice).size!==2))return false;
    if(defense&&S.pending&&CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(sk.star||0,card?.star||0)).winner!=='RESPONSE')return false;
    if(sk.mechanic==='COPY'){const original=this.copyChoices(h).find(k=>k.id===s.copyId);if(!original)return false;const copy={...original,star:Math.min(original.star||0,3),copied:true};this.selection=null;return this.begin(h,n,copy,true)}
    if(sk.mechanic==='HEAL'&&S.pending&&ts[0].id===(S.pending.replacementTargetId||S.pending.d)){const total=1+this.cardBonus(card,'HEAL');if(Math.min(this.spec(ts[0]).hp,ts[0].hp+total)<=this.incoming({...S.pending,defCard:card||S.pending.defCard}))return this.message('Hồi máu chưa đủ để sống sau đòn đánh.')}
    if(card&&!(s.continuation&&S.heroSequence)&&(!validCardFor(card,h,defense?'def':'atk')||!(S.hands[h.side]||[]).some(c=>c.uid===card.uid)))return false;
    save();if(card&&!(s.continuation&&S.heroSequence))this.equip(card,h,defense?'def':'atk');if(!s.continuation)this.remember(h,sk,n);else if(!S.heroSequence)this.remember(h,sk,n);
    if(defense&&S.pending&&card){S.pending.defCard=card;S.pending.defenseSkillStar=sk.star}
    this.selection=null;S.mode=null;this.draw();
    switch(sk.mechanic){
      case 'BUFF':for(const t of ts)this.buff(t,p);if(card)h.queuedAttackEquipment=card;break;
      case 'MORPH':this.transform(h,s.kind,true);break;
      case 'CONVERT':this.transform(ts[0],s.kind,false);break;
      case 'SUMMON':h.hp=Math.max(0,h.hp-(p.hpCost||0));S.units.push(createRuntimeEntityInstance({definitionId:p.summonClass?this.troopDefs().find(d=>d.class===p.summonClass).id:s.kind,side:h.side,hero:false,q:s.cell.q,r:s.cell.r}));break;
      case 'ESCAPE':h.q=s.cell.q;h.r=s.cell.r;if(defense&&S.pending){S.pending.cancel=true;S.pending.cancelReason='DODGE'}break;
      case 'HEAL':ts[0].hp=Math.min(this.spec(ts[0]).hp,ts[0].hp+1+this.cardBonus(card,'HEAL'));break;
      case 'CANCEL':if(S.pending){S.pending.cancel=true;S.pending.cancelReason='HERO_CANCEL'}break;
      case 'SWAP':if(S.pending){const ally=ts[0];[h.q,ally.q]=[ally.q,h.q];[h.r,ally.r]=[ally.r,h.r];S.pending.replacementTargetId=ally.id;S.pending.directRetaliation=p.directRetaliation||0;S.pending.d=ally.id;S.selected=null;renderBoard();showDefensePopup(ally);updateUI();return true}break;
      case 'REVENGE':for(const t of ts)t.hp=Math.max(0,t.hp-1);break;
      case 'PUSH':{const t=ts[0],ray=rayFrom(h,t);if(ray)for(let i=0;i<p.push;i++){const c=findCellAxialStep(t,ray,1);if(!c||this.terrainBlocked(c)||unitAt(c.q,c.r))break;t.q=c.q;t.r=c.r}this.status(t,'ROOT');break}
      case 'DICE_WARD':h.diceWard={numbers:[...s.dice],endTurn:S.turn};if(S.pending)this.rollWard(S.pending);break;
      case 'COUNTER':if(S.pending)S.pending.lucyCounter={heroId:h.id,targets:ts.map(t=>t.id)};break;
      case 'STRIKE':case 'SILENCE':{
        if(s.continuation&&S.heroSequence){const seq=S.heroSequence;if(seq.normal&&seq.round===0){const c=seq.card;if(c){if(h.queuedAttackEquipment===c)h.queuedAttackEquipment=null;else if(!this.equip(c,h,'atk'))return false}S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null}S.heroSequence.targets=ts.map(t=>t.id);S.heroSequence.index=0;S.heroSequence.round++;this.next();return true}
        if(sk.heroAttack)h.attacked=true;
        const count=(p.repeats||1)+(sk.heroAttack?h.attackCountBuff||0:0)+this.cardBonus(card,'MODIFY_ATTACK_COUNT');
        S.heroSequence={h:h.id,sk,n,targets:ts.map(t=>t.id),index:0,round:1,count,card};S.skillSequence={roster:true};this.next();return true;
      }
    }
    this.captureDeaths();checkWin();renderBoard();updateUI();if(S.pending&&!S.matchEnded)showDefensePopup(S.units.find(u=>u.id===S.pending.d));return true;
  },
  next(){const seq=S.heroSequence;if(!seq||S.pending)return;if(S.matchEnded){S.heroSequence=null;S.skillSequence=null;return}const h=S.units.find(u=>u.id===seq.h);if(!this.alive(h)){S.heroSequence=null;S.skillSequence=null;return}
    while(seq.index<seq.targets.length){const targetId=seq.targets[seq.index++];const d=S.units.find(u=>u.id===targetId);if(!this.alive(d)||seq.sk.parameters?.pull&&!this.pullDestination(h,d))continue;
      const p=seq.sk.parameters||{};let damage=seq.sk.mechanic==='SILENCE'?0:(p.damage||1)+(h.damageBuff||0);
      let drain=0;if(p.diceDrain){const die=this.roll();drain=die%2===0?2:1;damage=drain+(h.damageBuff||0);lg('🎲 '+seq.sk.name+': '+die+' → '+drain+' HP')}
      S.pending={a:h.id,d:d.id,base:damage,sourceType:seq.normal?'ATTACK':'SKILL',skillId:seq.normal?null:seq.sk.id,skillStar:seq.normal?null:seq.sk.star,atkCard:seq.card,defCard:null,guard:false,cancel:false,reflect:false,ignoreGuard:p.ignoreGuard||h.ignoreInfGuard||effectOf(seq.card,'EFFECT_IGNORE_INF_GUARD'),heroMechanic:seq.sk,drain,hitResult:'PENDING'};showReaction(true);updateUI();return;
    }
    if(seq.round<seq.count&&this.targets(h,seq.sk).length){this.begin(h,seq.n,seq.sk,true);this.notice='Chọn mục tiêu cho lần đánh '+(seq.round+1)+'/'+seq.count;this.draw();if(h.side===S.botSide)this.autoSelect();return}
    S.heroSequence=null;S.skillSequence=null;S.selected=null;renderBoard();updateUI();
  },
  roll(){return 1+Math.floor(Math.random()*6)},
  rollWard(p){const d=S.units.find(u=>u.id===p.d);if(!d?.diceWard||d.diceWard.endTurn<S.turn||p.wardRolled)return;p.wardRolled=true;const n=this.roll();lg('🎲 Phân Bóng: '+n);if(!d.diceWard.numbers.includes(n)){p.cancel=true;p.cancelReason='DICE_WARD'}},
  record(p){if(p.historyRecorded)return;p.historyRecorded=true;const a=S.units.find(u=>u.id===p.a),d=S.units.find(u=>u.id===p.d);if(a&&d)(S.attackHistory??=[]).push({turn:S.turn,attacker:a.id,target:d.id,targetSide:d.side,targetPosition:{q:d.q,r:d.r}})},
  afterHit(p,a,d,damage){if(p.drain&&!p.drainApplied)a.hp=Math.min(this.spec(a).hp,a.hp+p.drain);
    const sk=p.heroMechanic,meta=sk?.parameters||{};
    if(p.hitResult==='HIT'&&this.alive(d)){
      if(meta.status)this.status(d,meta.status);
      if(sk?.mechanic==='SILENCE')this.status(d,'SILENCE');
      if(meta.pull){const c=this.pullDestination(a,d);if(c){d.q=c.q;d.r=c.r}}
    }
    if(p.directRetaliation)a.hp=Math.max(0,a.hp-p.directRetaliation);
    if(p.lucyCounter){const h=S.units.find(u=>u.id===p.lucyCounter.heroId);if(this.alive(h)){const base=HeroRegistry.get(h.definitionId).stats;for(const id of p.lucyCounter.targets){const t=S.units.find(u=>u.id===id);if(this.alive(t)&&t.side!==h.side&&aligned(h,t,base.attackRange))t.hp=Math.max(0,t.hp-1)}}}
    this.captureDeaths();
  },
  captureDeaths(){for(const u of S.units.filter(u=>!u.hero&&u.hp<=0)){S.troopDeaths??=[];if(!S.troopDeaths.some(e=>e.id===u.id))S.troopDeaths.push({id:u.id,side:u.side,turn:S.turn})}},
  boundary(side){for(const u of S.units){if(u.side===side){for(const [key,v] of Object.entries(u.turnModifiers||{})){if(key==='ignoreInfGuard')u[key]=false;else u[key]=Math.max(0,(u[key]||0)-v)}u.turnModifiers={};u.extraMoveGranted=0}u.heroStatuses=(u.heroStatuses||[]).filter(s=>s.endTurn>S.turn);if(u.diceWard?.endTurn<=S.turn)u.diceWard=null}},
  message(t){this.notice=t;this.draw();return false},
  draw(){if(typeof HeroSkillUI!=='undefined')HeroSkillUI.render()},
  inputUnit(u){return this.selection?this.select(u)||true:false},
  inputHex(c){return this.selection?this.selectCell(c)||true:false}
};

// Extend specs without changing content identity (especially Grim's Hero identity).
const _rosterSpec=unitSpec;
unitSpec=function(u){const spec=_rosterSpec(u);if(!spec)return spec;let out={...spec};if(u.morphDefinitionId){const d=ContentViews.unit(u.morphDefinitionId);if(d)out={...out,base:CLASS_RUNTIME[d.class],classId:d.class,move:d.stats.move,range:d.stats.attackRange,attackPattern:d.attackPattern,passives:d.passives,equipmentClassIds:[d.class,CLASS.NEU],sym:d.sym}}out.range+=(u.rangeBuff||0);return out};
const _rosterMove=canMoveFurther;
canMoveFurther=function(u){return !HeroCore.blocked(u,'move')&&(_rosterMove(u)||!!(u&&u.hp>0&&!u.attacked&&u.extraMoveGranted&&remainingMove(u)>0))};
const _rosterAttack=canAttack;
canAttack=function(a,d){return HeroCore.alive(a)&&!HeroCore.blocked(a,'attack')&&_rosterAttack(a,d)};
const _rosterSelect=selectUnit;
selectUnit=function(u){if(HeroCore.selection)return HeroCore.inputUnit(u);if(HeroCore.blocked(u,'active'))return false;return _rosterSelect(u)};
const _rosterBeginSkill=_beginSkillTargetInternal;
_beginSkillTargetInternal=function(n){const sk=heroSkill(S.selected,n);return sk?.mechanic?HeroCore.begin(S.selected,n):_rosterBeginSkill(n)};
const _rosterNextSkill=resolveNextSkillSequenceTarget;
resolveNextSkillSequenceTarget=function(){return S.skillSequence?.roster?HeroCore.next():_rosterNextSkill()};
const _rosterShowReaction=showReaction;
showReaction=function(def){if(S.pending&&def){HeroCore.record(S.pending);HeroCore.rollWard(S.pending)}return _rosterShowReaction(def)};
const _rosterDefenseChoices=defenseSkillChoices;
defenseSkillChoices=function(d){const old=_rosterDefenseChoices(d).filter(c=>!c.skill.mechanic);if(!d)return old;const added=S.units.filter(h=>h.hero&&h.side===d.side&&h.hp>0).flatMap(h=>heroDefenseReactionSkills(h).filter(e=>e.skill.mechanic&&HeroCore.canUse(h,e.skillNo,e.skill)).map(e=>({hero:h,...e,targets:HeroCore.targets(h,e.skill)})));return old.concat(added)};
const _rosterUseDefense=useDefenseSkill;
useDefenseSkill=function(choice,target,card=null,defer=false){if(!choice?.skill.mechanic)return _rosterUseDefense(choice,target,card,defer);if(!HeroCore.begin(choice.hero,choice.skillNo))return false;if(target)HeroCore.selection.selected=(Array.isArray(target)?target:[target]).map(u=>u.id);HeroCore.selection.cardUid=card?.uid||null;if(['MORPH','CONVERT','COPY','ESCAPE','SUMMON','DICE_WARD'].includes(choice.skill.mechanic))return true;return HeroCore.commit()};
const _rosterStartAttack=startAttack;
startAttack=function(a,d){if(!HeroCore.alive(a)||a.attacked||HeroCore.blocked(a,'attack')||!canAttack(a,d))return false;
  if(a.targetBuff||a.attackCountBuff){const card=a.queuedAttackEquipment||S.attackChoice?.card||null;const sk={id:'NORMAL_ATTACK',name:'Đánh thường',star:0,heroAttack:true,mechanic:'STRIKE',target:{side:'ENEMY',range:'ATTACK',maxTargets:1,pattern:unitSpec(a).attackPattern},parameters:{damage:1,attack:true}};HeroCore.selection={h:a,n:0,sk,selected:[d.id],continuation:true,cardUid:card?.uid};S.heroSequence={h:a.id,sk,n:0,targets:[],index:0,round:0,count:1+(a.attackCountBuff||0),card,normal:true};S.skillSequence={roster:true};a.attacked=true;S.mode='hero-skill';HeroCore.draw();if(a.side===S.botSide)HeroCore.autoSelect();return true}
  const result=_rosterStartAttack(a,d);if(S.pending)S.pending.ignoreGuard ||=!!a.ignoreInfGuard;return result};
const _rosterEndTurn=endTurn;
endTurn=function(){if(HeroCore.selection||S.heroSequence)return false;const side=S.battleSide,turn=S.turn;const snapshot=S.units.map(u=>[u,{...u,heroStatuses:[...(u.heroStatuses||[])]}]);HeroCore.boundary(side);const result=_rosterEndTurn();if(S.turn===turn){for(const [u,data] of snapshot)Object.assign(u,data)}return result};
const _rosterReset=resetMatchState;
resetMatchState=function(){HeroCore.selection=null;HeroCore.notice='';const result=_rosterReset();S.attackHistory=[];S.heroSkillHistory=[];S.troopDeaths=[];S.heroSequence=null;return result};
const _heroGuardCandidates=guardCandidates;
guardCandidates=function(d){return HeroCore.blocked(d,'defense')?[]:_heroGuardCandidates(d).filter(u=>!HeroCore.blocked(u,'defense'))};
HeroCore.autoSelect=function(){const s=this.selection;if(!s)return false;
  if(s.sk.mechanic==='COPY'){s.copyId=this.copyChoices(s.h).sort((a,b)=>(b.parameters?.damage||0)-(a.parameters?.damage||0))[0]?.id;return this.commit()&&this.autoSelect()}
  if(s.sk.mechanic==='ESCAPE')s.cell=this.escapeCells(s.h,s.sk).sort((a,b)=>S.units.filter(u=>u.side!==s.h.side&&u.hp>0).reduce((n,u)=>n+distU(b,u)-distU(a,u),0))[0];
  else if(s.sk.mechanic==='SUMMON')s.cell=cells.find(c=>distU(s.h,c)===1&&this.cellAllowed({side:s.h.side,hero:false,id:null},c));
  else{let targets=this.targets(s.h,s.sk).sort((a,b)=>s.sk.target.side==='ENEMY'?(b.hero?50:0)-(a.hero?50:0)+a.hp-b.hp:(b.hero?20:0)-(a.hero?20:0));if(s.sk.target.selection?.lineLock&&targets[0])targets=targets.filter(t=>onRay(s.h,t,rayFrom(s.h,targets[0]),this.skillRange(s.h,s.sk)));s.selected=targets.slice(0,this.targetLimit(s.h,s.sk,null)).map(u=>u.id)}
  return this.commit();
};
const _heroPlanBot=planBotSkill;
planBotSkill=function(u){if(!u.hero||u.attacked||HeroCore.blocked(u,'active'))return null;const plans=[];for(let n=1;n<=3;n++){const sk=heroSkill(u,n);if(!sk?.mechanic||!HeroCore.canUse(u,n,sk))continue;if(['STRIKE','SILENCE'].includes(sk.mechanic)&&!HeroCore.targets(u,sk).length)continue;if(sk.parameters?.hpCost&&u.hp<=sk.parameters.hpCost)continue;plans.push({skill:sk,skillNo:n,targets:HeroCore.targets(u,sk),score:sk.heroAttack?60:sk.mechanic==='SUMMON'?40:sk.mechanic==='BUFF'?25:10})}return plans.sort((a,b)=>b.score-a.score)[0]||null};
const _heroBotUse=botUseSkill;
botUseSkill=function(u,plan){if(!plan.skill.mechanic)return _heroBotUse(u,plan);S.selected=u;if(!HeroCore.begin(u,plan.skillNo))return false;const result=HeroCore.autoSelect();if(!S.pending&&!S.skillSequence&&!u.attacked)S.botQueue?.unshift(u.id);return result};
const _heroBotDefense=botDefense;
botDefense=function(){const pending=S.pending,d=pending&&S.units.find(u=>u.id===pending.d);if(!d||d.side!==S.botSide||S.botDifficulty==='easy')return _heroBotDefense();
  const choices=defenseSkillChoices(d).filter(c=>c.skill.mechanic).sort((a,b)=>['CANCEL','ESCAPE','DICE_WARD','SWAP'].includes(b.skill.mechanic)-['CANCEL','ESCAPE','DICE_WARD','SWAP'].includes(a.skill.mechanic));
  for(const c of choices){if(!HeroCore.begin(c.hero,c.skillNo))continue;if(CorePowerResolver.resolve(pendingAttackPower(pending),c.skill.star||0).winner!=='RESPONSE')HeroCore.selection.cardUid=(S.hands[c.hero.side]||[]).find(card=>validCardFor(card,c.hero,'def')&&CorePowerResolver.resolve(pendingAttackPower(pending),Math.max(card.star,c.skill.star||0)).winner==='RESPONSE')?.uid||null;
    if(HeroCore.autoSelect()){if(S.pending===pending&&c.skill.mechanic!=='SWAP')resolveCombat();return}HeroCore.selection=null;HeroCore.draw();
  }return _heroBotDefense();
};
