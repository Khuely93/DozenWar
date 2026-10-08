/* Multiple equipment is a Mode policy. Each physical card keeps its Core checks and counter window. */
EquipmentCore.multipleAllowed=function(){return DW_MODES.get(S.selectedMode)?.equipmentRules?.allowMultiple===true};
EquipmentCore.combine=function(cards){
  if(!cards.length)return null;if(cards.length===1)return cards[0];
  if(!this.multipleAllowed()||new Set(cards.map(c=>c.uid)).size!==cards.length)return null;
  const pack={uid:'equipment-set:'+cards.map(c=>c.uid).join('|'),type:'neu',cls:'neutral',equipmentCards:[...cards]};this.refreshCombination(pack);return pack;
};
EquipmentCore.refreshCombination=function(pack){
  pack.name=pack.equipmentCards.map(c=>c.name).join(' + ');pack.star=Math.max(0,...pack.equipmentCards.map(c=>c.star||0));pack.effects=pack.equipmentCards.flatMap(c=>c.effects||[]);return pack;
};
EquipmentCore.canCombine=function(cards){
  if(cards.length<=1)return true;if(!this.multipleAllowed()||new Set(cards.map(c=>c.uid)).size!==cards.length)return false;
  const actions=cards.filter(c=>this.standalone(c)||effectOf(c,'EFFECT_REDIRECT_ALLY')||effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'));
  // Independent actions with different target choices remain separate Core actions.
  if(actions.length>1)return cards.every(c=>effectOf(c,'EFFECT_HEAL_1'));
  if(actions.length===1&&!effectOf(actions[0],'EFFECT_EQUIPMENT_PULL_3')&&cards.some(c=>c.type==='atk'))return false;
  if(actions.some(c=>effectOf(c,'EFFECT_EQUIPMENT_ROOT_2')))return false;
  return true;
};
const _multiValidCard=validCardFor;
validCardFor=function(c,h,context){if(c?.equipmentCards)return EquipmentCore.multipleAllowed()&&EquipmentCore.canCombine(c.equipmentCards)&&c.equipmentCards.length>0&&c.equipmentCards.every(x=>_multiValidCard(x,h,context));return _multiValidCard(c,h,context)};
const _multiEffectValue=effectValue;
effectValue=function(c,id){return c?.equipmentCards?c.equipmentCards.reduce((n,x)=>n+_multiEffectValue(x,id),0):_multiEffectValue(c,id)};
const _multiOwned=EquipmentCore.owned;
EquipmentCore.owned=function(h,c){return c?.equipmentCards?this.multipleAllowed()&&c.equipmentCards.length>0&&new Set(c.equipmentCards.map(x=>x.uid)).size===c.equipmentCards.length&&c.equipmentCards.every(x=>_multiOwned.call(this,h,x)):_multiOwned.call(this,h,c)};
const _multiCanUse=EquipmentCore.canUse,_multiCanDefend=EquipmentCore.canDefend;
EquipmentCore.canUse=function(h,c){if(c?.equipmentCards)return this.canCombine(c.equipmentCards)&&this.owned(h,c)&&c.equipmentCards.every(x=>_multiCanUse.call(this,h,x));return _multiCanUse.call(this,h,c)};
EquipmentCore.canDefend=function(h,c){if(c?.equipmentCards)return this.canCombine(c.equipmentCards)&&this.owned(h,c)&&c.equipmentCards.every(x=>_multiCanDefend.call(this,h,x));return _multiCanDefend.call(this,h,c)};
const _multiSelectedCard=HeroCore.selectedCard;
HeroCore.selectedCard=function(){const s=this.selection;if(s?.equipmentBundle)return s.equipmentBundle;if(s?.cardUid&&S.equipSelectedCard?.equipmentCards&&s.cardUid===S.equipSelectedCard.uid)return S.equipSelectedCard;return _multiSelectedCard.call(this)};
const _multiEquip=HeroCore.equip;
HeroCore.equip=function(c,h,context){if(!c?.equipmentCards)return _multiEquip.call(this,c,h,context);if(!validCardFor(c,h,context)||!EquipmentCore.owned(h,c))return false;for(const x of c.equipmentCards)_multiEquip.call(this,x,h,context);return true};
const _multiPlay=EquipmentCore.play;
EquipmentCore.play=function(h,c,context,done){
  if(!c?.equipmentCards)return _multiPlay.call(this,h,c,context,done);
  if(!this.multipleAllowed()||!this.canCombine(c.equipmentCards)||S.equipmentReaction||h.queuedAttackEquipment!==c&&(!this.owned(h,c)||!validCardFor(c,h,context)))return false;
  const chosen=[...c.equipmentCards],accepted=[];let index=0;
  const advance=()=>{if(index===chosen.length){c.equipmentCards=accepted;this.refreshCombination(c);done(accepted.length>0);return}
    const next=chosen[index++];if(h.queuedAttackEquipment===c){accepted.push(next);advance();return}
    _multiPlay.call(this,h,next,context,ok=>{if(ok)accepted.push(next);advance()});
  };advance();return true;
};
const _multiAfterHit=EquipmentCore.afterHit;
EquipmentCore.afterHit=function(p,a,d){if(!p.defCard?.equipmentCards)return _multiAfterHit.call(this,p,a,d);for(const c of p.defCard.equipmentCards)if(effectOf(c,'EFFECT_COUNTER_BASE_ATTACK'))_multiAfterHit.call(this,{...p,defCard:c},a,d)};

const _multiRedirect=EquipmentCore.redirect;
EquipmentCore.redirect=function(h,target){const selected=HeroCore.selection?.equipmentBundle||S.pending?.defCard;const r=_multiRedirect.call(this,h,target);if(r&&selected?.equipmentCards){const remaining=selected.equipmentCards.filter(c=>!effectOf(c,'EFFECT_REDIRECT_ALLY')&&validCardFor(c,target,'def')&&defenseEquipmentWins(S.pending,c));S.pending.defCard=this.combine(remaining)}return r};
const _multiCandidate=HeroCore.candidate;
HeroCore.candidate=function(h,sk,u){if(!_multiCandidate.call(this,h,sk,u))return false;const c=this.selection?.h.id===h.id?this.selectedCard():null;if(sk.mechanic==='REDIRECT'&&c?.equipmentCards)return c.equipmentCards.filter(x=>!effectOf(x,'EFFECT_REDIRECT_ALLY')).every(x=>validCardFor(x,u,'def')&&defenseEquipmentWins(S.pending,x));return true};
const _multiBegin=HeroCore.begin;
HeroCore.begin=function(h,n,sk=null,continuation=false){const r=_multiBegin.call(this,h,n,sk,continuation);if(r&&sk?.equipmentCard?.equipmentCards)this.selection.equipmentBundle=sk.equipmentCard;return r};
