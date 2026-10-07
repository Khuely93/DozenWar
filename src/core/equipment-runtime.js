/* Equipment effects are scoped to a combat commit. Movement cards are separate pre-Attack actions. */
const EquipmentCore={
  standalone(c){return effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1')||effectOf(c,'EFFECT_EQUIPMENT_PULL_3')},
  owned(h,c){return !!h&&!!c&&(S.hands[h.side]||[]).some(x=>x.uid===c.uid)},
  canUse(h,c){return S.phase==='battle'&&!S.matchEnded&&!S.pending&&!S.heroSequence&&h?.side===S.battleSide&&h.hp>0&&!h.attacked&&!HeroCore.blocked(h,'active')&&this.owned(h,c)&&validCardFor(c,h,'atk')},
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
    if(!this.canUse(h,c)||HeroCore.selection)return false;
    S.selected=h;hideAttackPopup();
    if(!this.standalone(c)){S.equipSelectedCard=c;S.equipPendingActorId=h.id;S.attackChoice=null;showAttackPopup(h);return true}
    const move=effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1');
    const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'ACTIVE',heroAttack:!move,equipmentAction:true,equipmentCard:c,
      mechanic:move?'BUFF':'STRIKE',target:move?{side:'ALLY',class:'INF',range:99,maxTargets:2}:{side:'ENEMY',range:3,pattern:'LINE',maxTargets:1},
      parameters:move?{move:1}:{damage:1,pull:true,ignoreGuard:true,attack:true}};
    if(!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true;
  },
  guardReaction(g){
    hideDefensePopup();defPopupTitle.textContent='PLAYER '+g.side+' · ĐỠ ĐÒN CHO ĐỒNG ĐỘI';
    defPopupTarget.textContent=unitSpec(g).name+' · HP '+g.hp+' · Chọn trang bị hoặc nhận đòn';
    defGuardChoice.style.display='none';defHeroSkillChoice.style.display='none';defEquipChoice.style.display='none';
    defCardList.replaceChildren();const pending=S.pending;
    for(const card of defenseCards(g)){const b=HeroSkillUI.button(card.name+' · '+'★'.repeat(card.star),()=>{
      if(S.pending!==pending||!this.owned(g,card)||!validCardFor(card,g,'def'))return;
      pending.defCard=card;S.hands[g.side]=S.hands[g.side].filter(c=>c.uid!==card.uid);markDuelCardUsed(g.side,'def');resolveCombat();
    },!defenseEquipmentWins(pending,card));defCardList.append(b)}
    defCardList.classList.add('show');defPopupHint.textContent='Trang bị áp dụng cho Bộ binh đang nhận đòn thay. Không nhận sát thương thì không phản.';positionDefensePopup(g);
  },
  render(){
    const host=CoreDOM.board.wrap.closest?.('.duelMapStage')||CoreDOM.board.wrap;if(this.bar.parentElement!==host)host.append(this.bar);
    this.bar.replaceChildren();this.bar.hidden=S.phase!=='battle'||S.matchEnded||!!S.pending||!!S.heroSequence||!!HeroCore.selection||S.battleSide===S.botSide;
    if(this.bar.hidden)return;
    const eligible=S.units.filter(u=>u.side===S.battleSide&&u.hp>0&&!u.attacked&&!HeroCore.blocked(u,'active')&&unitSpec(u).classId==='INF');
    const h=eligible.find(u=>u.id===S.selected?.id)||eligible[0];if(!h)return;
    for(const c of (S.hands[h.side]||[]).filter(c=>c.type==='atk'&&validCardFor(c,h,'atk'))){const b=HeroSkillUI.button('🎴 '+c.name+' · '+unitSpec(h).name,()=>this.begin(h,c));b.title=c.text;b.dataset.equipmentId=c.equipmentId;this.bar.append(b)}
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
startAttack=function(a,d){const c=a.queuedAttackEquipment||S.attackChoice?.card;if(c&&EquipmentCore.standalone(c)){if(!EquipmentCore.begin(a,c))return false;if(!HeroCore.select(d)){HeroCore.cancel();return false}return HeroCore.commit()}return _equipmentStart(a,d)};
const _equipmentUpdate=updateUI;
updateUI=function(){const r=_equipmentUpdate();EquipmentCore.render();return r};
const _equipmentSelect=renderEquipmentSelect;
renderEquipmentSelect=function(){_equipmentSelect();const ok=atkCardList.querySelector('.equipSelectFooter .gold');if(!ok)return;const previous=ok.onclick;ok.onclick=()=>{const c=S.equipSelectedCard;if(c&&EquipmentCore.standalone(c))return EquipmentCore.begin(S.selected,c);const r=previous();showAttackPopup(S.selected);return r}};
const _equipmentBotCard=botAttackCard;
botAttackCard=function(u,t){const card=_equipmentBotCard(u,t);return card&&EquipmentCore.standalone(card)?null:card};
window.DOZEN_EQUIPMENT=EquipmentCore;
