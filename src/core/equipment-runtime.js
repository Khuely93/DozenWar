/* Equipment effects are scoped to a combat commit. Movement cards are separate pre-Attack actions. */
const EquipmentCore={
  standalone(c){return this.independent(c)||effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1')||effectOf(c,'EFFECT_EQUIPMENT_PULL_3')},
  independent(c){return ['EFFECT_EQUIPMENT_TELEPORT_4','EFFECT_SUMMON_CAV','EFFECT_SUMMON_ARCH','EFFECT_HEAL_1','EFFECT_EQUIPMENT_BASE_MOVE','EFFECT_CANCEL_EQUIPMENT','EFFECT_STEAL_EQUIPMENT'].some(id=>effectOf(c,id))},
  context(h){return h.side===S.battleSide?'atk':'def'},
  baseMove(u){const d=u.morphDefinitionId?UnitRegistry.get(u.morphDefinitionId):u.hero?HeroRegistry.get(u.definitionId):UnitRegistry.get(u.definitionId);return d?.stats.move||0},
  responders(side,c){return S.units.filter(u=>u.side===side&&u.hp>0).flatMap(h=>(S.hands[side]||[]).filter(x=>effectOf(x,'EFFECT_CANCEL_EQUIPMENT')&&x.star>=c.star&&validCardFor(x,h,this.context(h))).map(card=>({h,card}))).filter((x,i,a)=>a.findIndex(y=>y.card.uid===x.card.uid)===i)},
  play(h,c,context,done){
    if(S.equipmentReaction)return false;
    if(h.queuedAttackEquipment!==c&&!HeroCore.equip(c,h,context))return false;
    c.zone='DISCARD';c.state='USED';
    return this.offer(h,c,done);
  },
  offer(h,c,done){
    const side=h.side===1?2:1,choices=this.responders(side,c);
    if(!choices.length){done(true);return true}
    S.equipmentReaction={h,c,side,done,choices,remainingMs:(HeroCore.mode()?.turnPolicy?.defenseTimerSeconds||30)*1000,lastTick:Date.now()};hideAttackPopup();hideDefensePopup();hideUnitMenu();
    if(side===S.botSide){this.counterEquipment(choices[0].h,choices[0].card);return true}
    updateUI();return true;
  },
  passEquipment(){const reaction=S.equipmentReaction;if(!reaction)return false;S.equipmentReaction=null;reaction.done(true);this.resumeClock();updateUI();return true},
  counterEquipment(h,c){
    const reaction=S.equipmentReaction;if(!reaction||h.side!==reaction.side||!this.responders(h.side,reaction.c).some(x=>x.card.uid===c.uid))return false;
    S.equipmentReaction=null;
    if(!HeroCore.equip(c,h,this.context(h))){S.equipmentReaction=reaction;return false}
    c.zone='DISCARD';c.state='USED';
    return this.offer(h,c,accepted=>{if(accepted)lg('🍀 '+reaction.c.name+' bị hủy toàn bộ hiệu ứng.');reaction.done(!accepted);this.resumeClock();updateUI()});
  },
  resumeClock(){if(typeof DuelTurnClock!=='undefined'){DuelTurnClock.lastTickMs=Date.now();DuelTurnClock.defenseLastTickMs=Date.now()}},
  beginIndependent(h,c){
    if(!this.canUse(h,c)||HeroCore.selection)return false;
    const defense=h.side!==S.battleSide;
    let mechanic,target={side:'ALLY',global:true,range:99,maxTargets:1},parameters={};
    if(effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4')){mechanic='ESCAPE';target={side:'SELF',unitType:'HERO'};parameters={escapeRange:4,teleport:true}}
    else if(effectOf(c,'EFFECT_SUMMON_CAV')||effectOf(c,'EFFECT_SUMMON_ARCH')){mechanic='SUMMON';parameters.summonClass=effectOf(c,'EFFECT_SUMMON_CAV')?'CAV':'ARCH'}
    else if(effectOf(c,'EFFECT_HEAL_1')){mechanic='HEAL';target={...target,healable:true,requireMissingHp:true}}
    else if(effectOf(c,'EFFECT_EQUIPMENT_BASE_MOVE'))mechanic='BASE_MOVE';
    else if(effectOf(c,'EFFECT_STEAL_EQUIPMENT'))mechanic='STEAL';
    else return false;
    const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:defense?'DEFENSE_REACTION':'ACTIVE',heroAttack:false,equipmentAction:true,equipmentCard:c,independentDefense:defense,mechanic,target,parameters};
    if(!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();updateUI();return true;
  },
  recoverTargets(s,targets,resume){
    const {h,sk}=s;
    if(targets.every(t=>HeroCore.candidate(h,sk,t)))return false;
    S.pending=null;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;h.queuedAttackEquipment=null;
    if(sk.heroAttack)h.attacked=true;
    HeroCore.selection={...s,selected:targets.filter(t=>HeroCore.candidate(h,sk,t)).map(t=>t.id),cardUid:null,continuation:true,equipmentRecovery:true,resume};
    HeroCore.notice='Trang bị tăng tầm đã bị hủy. Chọn mục tiêu hợp lệ khác hoặc BỎ QUA đòn này.';
    S.mode='hero-skill';hideDefensePopup();HeroCore.draw();renderBoard();updateUI();
    if(h.side===S.botSide){if(HeroCore.targets(h,sk).length)HeroCore.autoSelect();else this.skipRecovery()}
    return true;
  },
  skipRecovery(){
    const s=HeroCore.selection;if(!s?.equipmentRecovery)return false;
    if(s.n>0)HeroCore.remember(s.h,s.sk,s.n);
    HeroCore.selection=null;HeroCore.notice='';S.pending=null;S.heroSequence=null;S.skillSequence=null;S.mode=null;S.selected=null;
    lg('⏭ Bỏ qua đòn sau khi trang bị tăng tầm bị hủy.');HeroCore.draw();renderBoard();updateUI();return true;
  },
  resumeNormal(a,d){
    if(canAttack(a,d)){showReaction(true);updateUI();return}
    const original=S.pending;
    const sk={id:'NORMAL_ATTACK',name:'Đánh thường',star:0,heroAttack:true,mechanic:'STRIKE',target:{side:'ENEMY',range:'ATTACK',maxTargets:1,pattern:unitSpec(a).attackPattern},parameters:{damage:1,attack:true}};
    this.recoverTargets({h:a,n:0,sk},[d],targets=>{
      HeroCore.selection=null;S.mode=null;S.pending={...original,d:targets[0].id,atkCard:null};showReaction(true);updateUI();return true;
    });
  },
  owned(h,c){return !!h&&!!c&&(S.hands[h.side]||[]).some(x=>x.uid===c.uid)},
  canUse(h,c){if(S.equipmentReaction)return false;if(this.independent(c)){if(effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4')){if(!h?.hero||h.hp<=0||h.side===S.battleSide&&h.attacked||!HeroCore.escapeCells(h,{parameters:{escapeRange:4,teleport:true}}).length)return false;if(h.side!==S.battleSide){const p=S.pending;if(!p||p.isCounterattack||(p.guard?p.guardUnitId:p.replacementTargetId||p.d)!==h.id||!defenseEquipmentWins(p,c))return false}}if(!h||h.hp<=0||S.phase!=='battle'||S.matchEnded||!this.owned(h,c)||!validCardFor(c,h,this.context(h))||effectOf(c,'EFFECT_CANCEL_EQUIPMENT')||S.heroSequence&&!S.pending)return false;if(h.side!==S.battleSide&&c.type!=='neu'||h.side===S.battleSide&&(S.pending||S.heroSequence))return false;if(effectOf(c,'EFFECT_SUMMON_CAV')||effectOf(c,'EFFECT_SUMMON_ARCH'))return h.hero&&HeroCore.troopDefs().some(d=>d.class===(effectOf(c,'EFFECT_SUMMON_CAV')?'CAV':'ARCH'))&&cells.some(cell=>distU(h,cell)===1&&HeroCore.cellAllowed({side:h.side,hero:false,id:null},cell));if(effectOf(c,'EFFECT_STEAL_EQUIPMENT'))return (S.hands[h.side===1?2:1]||[]).length>0;return true}if(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'))return this.canUseNet(h,c);if(c?.type==='def')return this.canDefend(h,c);return S.phase==='battle'&&!S.matchEnded&&!S.pending&&!S.heroSequence&&h?.side===S.battleSide&&h.hp>0&&!h.attacked&&!HeroCore.blocked(h,'active')&&this.owned(h,c)&&validCardFor(c,h,'atk')},
  cardFor(u){
    if(S.heroSequence?.h===u.id)return S.heroSequence.card;
    if(S.pending?.a===u.id)return S.pending.atkCard;
    const s=HeroCore.selection;if(s?.h.id===u.id&&s.sk.heroAttack)return HeroCore.selectedCard();
    if(u.queuedAttackEquipment)return u.queuedAttackEquipment;
    if(S.equipPendingActorId===u.id&&this.owned(u,S.equipSelectedCard))return S.equipSelectedCard;
    if(S.selected?.id===u.id&&this.owned(u,S.attackChoice?.card))return S.attackChoice.card;
    return null;
  },
  begin(h,c){
    if(this.independent(c))return this.beginIndependent(h,c);
    if(!this.canUse(h,c)||HeroCore.selection)return false;
    S.selected=h;hideAttackPopup();
    if(!this.standalone(c)){S.equipSelectedCard=c;S.equipPendingActorId=h.id;S.attackChoice=null;showAttackPopup(h);return true}
    const move=effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1');
    const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'ACTIVE',heroAttack:!move,equipmentAction:true,equipmentCard:c,
      mechanic:move?'BUFF':'STRIKE',target:move?{side:'ALLY',class:'INF',range:99,maxTargets:2}:{side:'ENEMY',range:3,pattern:'LINE',maxTargets:1},
      parameters:move?{move:1}:{damage:1,pull:true,ignoreGuard:true,attack:true}};
    if(!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true;
  },
  canUseNet(h,c){return !S.equipmentReaction&&S.phase==='battle'&&!S.matchEnded&&h?.hp>0&&h.side!==S.battleSide&&this.owned(h,c)&&validCardFor(c,h,'def')&&(!S.pending||!S.pending.isCounterattack)},
  beginNet(h,c){if(!this.canUseNet(h,c)||HeroCore.selection)return false;const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'DEFENSE_REACTION',heroAttack:false,equipmentAction:true,equipmentCard:c,independentDefense:true,mechanic:'ROOT',target:{side:'ENEMY',range:2,maxTargets:1},parameters:{}};if(!HeroCore.targets(h,sk).length||!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true},
  canDefend(h,c){if(this.independent(c))return this.canUse(h,c);const p=S.pending;return !S.equipmentReaction&&S.phase==='battle'&&!S.matchEnded&&!!p&&!p.isCounterattack&&h?.hp>0&&h.side!==S.battleSide&&(p.d===h.id||p.guard&&p.guardUnitId===h.id)&&this.owned(h,c)&&validCardFor(c,h,'def')&&defenseEquipmentWins(p,c)},
  useDefense(h,c){
    if(this.independent(c))return this.beginIndependent(h,c);
    if(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'))return this.beginNet(h,c);
    if(!this.canDefend(h,c)||HeroCore.selection)return false;
    if(effectOf(c,'EFFECT_REDIRECT_ALLY')){
      const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'DEFENSE_REACTION',heroAttack:false,equipmentAction:true,equipmentCard:c,mechanic:'REDIRECT',target:{side:'ALLY',global:true,range:99,maxTargets:1,excludeSelf:true},parameters:{}};
      if(!HeroCore.targets(h,sk).length||!HeroCore.begin(h,0,sk))return false;
      HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true;
    }
    return this.play(h,c,'def',accepted=>{S.pending.defCard=accepted?c:null;resolveCombat()});
  },
  redirect(h,target){
    const p=S.pending;if(!p||target.hp<=0||target.side!==h.side||target.id===h.id)return false;
    (p.redirectHistory??=[]).push(h.id);p.d=target.id;p.guard=false;p.guardUnitId=null;delete p.replacementTargetId;
    p.defCard=null;p.defenseSkillStar=null;delete p.wardRolled;
    // The same incoming action resumes on its new target, with a fresh legal defense choice.
    HeroCore.rollWard(p);lg('↪ Áo Choàng chuyển đòn sang '+unitSpec(target).name+'.');return true;
  },
  afterHit(p,a,d){
    if(!effectOf(p.defCard,'EFFECT_COUNTER_BASE_ATTACK')||!defenseEquipmentWins(p,p.defCard)||a.hp<=0)return;
    const def=d.morphDefinitionId?UnitRegistry.get(d.morphDefinitionId):d.hero?HeroRegistry.get(d.definitionId):UnitRegistry.get(d.definitionId);
    if(!def)return;const range=def.stats.attackRange,pattern=def.attackPattern||'RANGE';
    if(distU(d,a)>range||pattern==='LINE'&&!aligned(d,a,range))return;
    const damage=def.stats.damage??1;a.hp=Math.max(0,a.hp-damage);
    lg('🗡 Dao Găm trả '+damage+' sát thương vào '+unitSpec(a).name+' — không mở phòng thủ, kể cả người dùng đã chết.');
  },
  guardReaction(g){
    hideDefensePopup();defPopupTitle.textContent='PLAYER '+g.side+' · ĐỠ ĐÒN CHO ĐỒNG ĐỘI';
    defPopupTarget.textContent=unitSpec(g).name+' · HP '+g.hp+' · Chọn trang bị hoặc nhận đòn';
    defGuardChoice.style.display='none';defHeroSkillChoice.style.display='none';defEquipChoice.style.display='none';
    defCardList.replaceChildren();const pending=S.pending;
    for(const card of defenseCards(g)){const b=HeroSkillUI.button(card.name+' · '+'★'.repeat(card.star),()=>{
      if(S.pending!==pending||!this.owned(g,card)||!validCardFor(card,g,'def'))return;
      this.useDefense(g,card);
    },!this.canDefend(g,card));defCardList.append(b)}
    defCardList.classList.add('show');defPopupHint.textContent='Trang bị áp dụng cho Bộ binh đang nhận đòn thay. Không nhận sát thương thì không phản.';positionDefensePopup(g);
  },
  render(){
    const host=CoreDOM.board.wrap.closest?.('.duelMapStage')||CoreDOM.board.wrap;if(this.bar.parentElement!==host)host.append(this.bar);
    this.bar.replaceChildren();
    const reaction=S.equipmentReaction;if(reaction){this.bar.hidden=false;const title=document.createElement('p');title.textContent='PLAYER '+reaction.side+' · Địch vừa dùng '+reaction.c.name+' · Hủy card?';this.bar.append(title);for(const {h,card} of this.responders(reaction.side,reaction.c))this.bar.append(HeroSkillUI.button(card.name+' · '+'★'.repeat(card.star),()=>this.counterEquipment(h,card)));this.bar.append(HeroSkillUI.button('BỎ QUA',()=>this.passEquipment()));return}
    if(S.phase==='battle'&&!S.matchEnded&&!HeroCore.selection){
      const seen=new Set();
      for(const h of S.units.filter(u=>u.side!==S.battleSide&&u.side!==S.botSide&&u.hp>0))for(const c of S.hands[h.side]||[]){
        if(!(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2')&&this.canUseNet(h,c)||this.independent(c)&&this.canUse(h,c)))continue;
        if(this.independent(c)&&seen.has(c.uid))continue;seen.add(c.uid);
        const b=HeroSkillUI.button('🛡 P'+h.side+' · '+c.name+' · '+unitSpec(h).name,()=>this.independent(c)?this.beginIndependent(h,c):this.beginNet(h,c));b.title=c.text;b.dataset.equipmentId=c.equipmentId;this.bar.append(b);
      }
      if(!S.pending&&!S.heroSequence&&S.battleSide!==S.botSide){
        for(const c of S.hands[S.battleSide]||[]){
          const eligible=S.units.filter(u=>u.side===S.battleSide&&this.canUse(u,c));
          const chosen=eligible.find(u=>u.id===S.selected?.id)||eligible[0];
          for(const h of effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4')?eligible:chosen?[chosen]:[]){const b=HeroSkillUI.button('🎴 P'+h.side+' · '+c.name+' · '+unitSpec(h).name,()=>this.begin(h,c));b.title=c.text;b.dataset.equipmentId=c.equipmentId;this.bar.append(b)}
        }
      }
    }
    this.bar.hidden=!this.bar.childElementCount;
  },
  bar:document.createElement('div')
};
EquipmentCore.bar.className='heroDefenseBar equipmentActionBar';EquipmentCore.bar.setAttribute('aria-label','Trang bị lượt công');CoreDOM.board.wrap.append(EquipmentCore.bar);
const _equipmentSpec=unitSpec;
unitSpec=function(u){const spec=_equipmentSpec(u);return spec?{...spec,range:spec.range+HeroCore.cardBonus(EquipmentCore.cardFor(u),'MODIFY_ATTACK_RANGE')}:spec};
const _equipmentSkillRange=HeroCore.skillRange;
HeroCore.skillRange=function(h,sk){const range=_equipmentSkillRange.call(this,h,sk);return range+(sk.heroAttack&&typeof sk.target?.range==='number'?this.cardBonus(EquipmentCore.cardFor(h),'MODIFY_ATTACK_RANGE'):0)};
const _equipmentStart=startAttack;
startAttack=function(a,d){if(S.equipmentReaction)return false;const c=a.queuedAttackEquipment||S.attackChoice?.card;if(c&&EquipmentCore.standalone(c)){if(!EquipmentCore.begin(a,c))return false;if(!HeroCore.select(d)){HeroCore.cancel();return false}return HeroCore.commit()}return _equipmentStart(a,d)};
const _equipmentUpdate=updateUI;
updateUI=function(){const r=_equipmentUpdate();EquipmentCore.render();if(S.equipmentReaction){if(typeof mainBtn!=='undefined')mainBtn.disabled=true;if(typeof undoBtn!=='undefined')undoBtn.disabled=true;if(typeof moveBtn!=='undefined')moveBtn.disabled=true;if(typeof attackBtn!=='undefined')attackBtn.disabled=true;if(typeof skillBar!=='undefined')for(const b of skillBar.querySelectorAll('button'))b.disabled=true;if(typeof gameHint!=='undefined')gameHint.textContent='Player '+S.equipmentReaction.side+' đang quyết định hủy card địch vừa dùng.';hideAttackPopup();hideDefensePopup();if(HeroSkillUI.bar)HeroSkillUI.bar.hidden=true}return r};
const _equipmentSelect=renderEquipmentSelect;
renderEquipmentSelect=function(){_equipmentSelect();const ok=atkCardList.querySelector('.equipSelectFooter .gold');if(!ok)return;const previous=ok.onclick;ok.onclick=()=>{const c=S.equipSelectedCard;if(c&&EquipmentCore.standalone(c))return EquipmentCore.begin(S.selected,c);const r=previous();showAttackPopup(S.selected);return r}};
const _equipmentBotCard=botAttackCard;
botAttackCard=function(u,t){const card=_equipmentBotCard(u,t);return card&&EquipmentCore.standalone(card)?null:card};
window.DOZEN_EQUIPMENT=EquipmentCore;

// All manual defense-card entry points share selection/consumption validation.
defEquipChoice.onclick=()=>{if(!S.pending)return;const d=S.units.find(u=>u.id===S.pending.d);defGuardList.classList.remove('show');clearGuardHighlights();defCardList.replaceChildren();for(const c of defenseCards(d)){const b=HeroSkillUI.button(c.name+' · '+'★'.repeat(c.star),()=>EquipmentCore.useDefense(d,c),!EquipmentCore.canDefend(d,c));b.innerHTML=cardHTML(c);b.title=c.text;defCardList.append(b)}defCardList.classList.toggle('show');positionDefensePopup(d)};

const _equipmentBotDefense=botDefense;
botDefense=function(){
  const p=S.pending,d=p&&S.units.find(u=>u.id===p.d);
  if(d?.side===S.botSide&&S.botDifficulty!=='easy'){
    const cards=defenseCards(d).filter(c=>EquipmentCore.canDefend(d,c));
    const ring=cards.find(c=>effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4'));if(ring&&HeroCore.incoming(p)>=d.hp&&EquipmentCore.useDefense(d,ring)){if(HeroCore.autoSelect())return;HeroCore.cancel()}
    const incoming=HeroCore.incoming(p),dagger=cards.find(c=>effectOf(c,'EFFECT_COUNTER_BASE_ATTACK'));
    if(dagger&&incoming>=d.hp){if(EquipmentCore.useDefense(d,dagger))return}
    const cloak=cards.find(c=>effectOf(c,'EFFECT_REDIRECT_ALLY'));
    const target=S.units.filter(u=>u.side===d.side&&u.id!==d.id&&u.hp>0).sort((a,b)=>(a.hero?20:0)-(b.hero?20:0)||b.hp-a.hp)[0];
    if(cloak&&target&&incoming>=d.hp&&EquipmentCore.useDefense(d,cloak)){HeroCore.select(target);if(HeroCore.commit())return;HeroCore.cancel()}
  }
  return _equipmentBotDefense();
};

// Equipment reactions are a locked transaction, including independent card actions.
const _equipmentResolve=resolveCombat;
resolveCombat=function(){if(S.equipmentReaction)return false;return _equipmentResolve()};
const _equipmentEnd=endTurn;
endTurn=function(){if(S.equipmentReaction)return false;return _equipmentEnd()};
const _equipmentReset=resetMatchState;
resetMatchState=function(){S.equipmentReaction=null;return _equipmentReset()};
