/* Presentation-only receipts for accepted defensive actions. Combat resolves synchronously. */
const DefenseFeedback={
  queue:[],active:false,timer:null,scope:0,seenWard:new WeakSet(),
  outcome(mechanic){return ({CANCEL:'Hủy đòn',ESCAPE:'Né đòn',HEAL:'Hồi máu',SWAP:'Đổi đơn vị nhận đòn',REDIRECT:'Chuyển hướng đòn',DICE_WARD:'Kích hoạt Phân Bóng',MORPH:'Biến đổi hệ',CONVERT:'Biến đổi hệ',COUNTER:'Chuẩn bị bắn trả',REVENGE:'Phản công',PUSH:'Đẩy lùi và trói',ROOT:'Khóa mục tiêu'})[mechanic]||'Đã dùng để phòng thủ'},
  receipt(h,item,kind,outcome){
    if(!h||!item)return;
    this.queue.push({side:h.side,unit:unitSpec(h).name,name:item.name,star:item.star||0,kind,outcome,html:kind==='card'?cardHTML(item):null,training:S.selectedMode==='MODE_TRAINING_001'});
    if(!this.active)this.next();
  },
  card(h,c,outcome){for(const part of EquipmentCore.parts(c)){const label=effectOf(part,'EFFECT_HEAL_1')?'Hồi máu':effectOf(part,'EFFECT_CANCEL_ATTACK')?'Hủy đòn':effectOf(part,'EFFECT_REFLECT_DAMAGE')?'Phản sát thương':effectOf(part,'EFFECT_COUNTER_BASE_ATTACK')?'Đánh trả':effectOf(part,'EFFECT_CANCEL_EQUIPMENT')?'Hủy trang bị':effectOf(part,'EFFECT_DAMAGE_REDUCE_1')?'Giảm sát thương':outcome;this.receipt(h,part,'card',label)}},
  next(){
    const item=this.queue.shift();if(!item){this.clear();return}
    this.active=true;this.root.hidden=false;this.root.classList.toggle('isSkill',item.kind==='skill');
    this.owner.textContent='PLAYER '+item.side+' · '+item.unit;
    this.name.textContent='Đã dùng '+item.name;this.result.textContent=item.outcome;
    this.hint.textContent=item.training?'Đã dùng · Có thể dùng lại trong Đấu tập':'Đã sử dụng';
    this.visual.replaceChildren();
    const face=document.createElement('div');face.className='defenseFeedbackFace';
    if(item.html)face.innerHTML=item.html;
    else{const icon=document.createElement('span');icon.className='defenseFeedbackSkillIcon';icon.textContent='🛡';const title=document.createElement('strong');title.textContent=item.name;const stars=document.createElement('span');stars.textContent='★'.repeat(item.star);face.append(icon,title,stars)}
    this.visual.append(face);
    for(let n=0;n<18;n++){const dot=document.createElement('i');dot.className='defenseFeedbackParticle';const angle=n*2.39996;dot.style.setProperty('--dx',Math.round(Math.cos(angle)*(85+n*5))+'px');dot.style.setProperty('--dy',Math.round(Math.sin(angle)*(110+n*7))+'px');dot.style.setProperty('--delay',(80+n*9)+'ms');this.visual.append(dot)}
    this.visual.classList.remove('playing');void this.visual.offsetWidth;this.visual.classList.add('playing');
    this.timer=setTimeout(()=>this.dismiss(),matchMedia('(prefers-reduced-motion: reduce)').matches?350:950);
    this.pauseClock();
  },
  pauseClock(){const now=Date.now();DuelTurnClock.lastTickMs=now;DuelTurnClock.defenseLastTickMs=now;if(S.equipmentReaction)S.equipmentReaction.lastTick=now;if(S.postHitReaction)S.postHitReaction.lastTick=now},
  dismiss(){clearTimeout(this.timer);this.timer=null;this.pauseClock();this.next()},
  clear(){clearTimeout(this.timer);this.timer=null;this.queue=[];this.active=false;if(this.root)this.root.hidden=true},
};
DefenseFeedback.root=document.createElement('div');DefenseFeedback.root.className='defenseFeedback';DefenseFeedback.root.hidden=true;
const defenseFeedbackPanel=document.createElement('section');defenseFeedbackPanel.className='defenseFeedbackPanel';defenseFeedbackPanel.setAttribute('role','status');defenseFeedbackPanel.setAttribute('aria-live','polite');
for(const [key,tag,cls] of [['owner','p','defenseFeedbackOwner'],['name','h2','defenseFeedbackName'],['result','p','defenseFeedbackResult'],['visual','div','defenseFeedbackVisual'],['hint','p','defenseFeedbackHint']]){DefenseFeedback[key]=document.createElement(tag);DefenseFeedback[key].className=cls;defenseFeedbackPanel.append(DefenseFeedback[key])}
const defenseFeedbackSkip=document.createElement('button');defenseFeedbackSkip.type='button';defenseFeedbackSkip.className='btn';defenseFeedbackSkip.textContent='TIẾP TỤC';defenseFeedbackPanel.append(defenseFeedbackSkip);DefenseFeedback.root.append(defenseFeedbackPanel);document.body.append(DefenseFeedback.root);
DefenseFeedback.root.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();DefenseFeedback.dismiss()});
document.addEventListener('keydown',event=>{if(!DefenseFeedback.active||event.ctrlKey||event.metaKey)return;event.stopImmediatePropagation();event.preventDefault();if(['Escape','Enter',' '].includes(event.key))DefenseFeedback.dismiss()},true);

const _feedbackApply=HeroCore.applySelection;
HeroCore.applySelection=function(s,ts,card){
  const defensive=s.h.side!==S.battleSide&&S.phase==='battle',pending=S.pending;
  const eligible=!pending||s.sk.independentDefense||CorePowerResolver.resolve(pendingAttackPower(pending),Math.max(s.sk.star||0,card?.star||0)).winner==='RESPONSE';
  DefenseFeedback.scope++;let result;try{result=_feedbackApply.call(this,s,ts,card)}finally{DefenseFeedback.scope--}
  if(result===true&&defensive&&eligible){
    if(s.sk.mechanic==='DICE_WARD'&&pending?.cancelReason==='DICE_WARD')DefenseFeedback.seenWard.add(pending);
    const outcome=DefenseFeedback.outcome(s.sk.mechanic);
    if(s.sk.equipmentAction)DefenseFeedback.card(s.h,card,outcome);
    else{DefenseFeedback.receipt(s.h,s.sk,'skill',outcome);if(card)DefenseFeedback.card(s.h,card,DefenseFeedback.outcome('HEAL'))}
  }
  return result;
};
const _feedbackOffer=EquipmentCore.offer;
EquipmentCore.offer=function(h,c,done){const defensive=h.side!==S.battleSide&&S.phase==='battle';let reported=false;return _feedbackOffer.call(this,h,c,accepted=>{
  const result=done(accepted);
  if(accepted&&defensive&&!reported&&(effectOf(c,'EFFECT_CANCEL_EQUIPMENT')||!this.standalone(c)&&!effectOf(c,'EFFECT_REDIRECT_ALLY')&&!effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'))){reported=true;DefenseFeedback.card(h,c,'Đã dùng để phòng thủ')}
  return result;
})};
const _feedbackWard=HeroCore.rollWard;
HeroCore.rollWard=function(p){const result=_feedbackWard.call(this,p);if(!DefenseFeedback.scope&&p.cancelReason==='DICE_WARD'&&!DefenseFeedback.seenWard.has(p)){DefenseFeedback.seenWard.add(p);const h=S.units.find(u=>u.id===p.d);const skill=SkillRegistry.list().map(sk=>ContentViews.skill(sk.id)).find(sk=>sk.mechanic==='DICE_WARD');if(skill)DefenseFeedback.receipt(h,skill,'skill','Hủy đòn')}return result};
const _feedbackTick=DuelTurnClock.tick;
DuelTurnClock.tick=function(){if(DefenseFeedback.active){DefenseFeedback.pauseClock();return}return _feedbackTick.call(this)};
const _feedbackReset=resetMatchState;
resetMatchState=function(){DefenseFeedback.clear();DefenseFeedback.seenWard=new WeakSet();return _feedbackReset()};
