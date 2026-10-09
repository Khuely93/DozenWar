/* UI sequencing only: Core owns eligibility, payments, effects and combat. */
const CombatFlowUI={
  dialog:document.createElement('dialog'),state:null,
  cards(h,kind,sk=null){
    if(kind==='skillheal')return (S.hands[h.side]||[]).filter(c=>effectOf(c,'EFFECT_HEAL_1')&&validCardFor(c,h,'def')&&(!S.pending||CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(sk.star||0,c.star||0)).winner==='RESPONSE'));
    if(kind==='post')return S.postHitReaction?EquipmentCore.postHitChoices(S.postHitReaction.p,h):[];
    return (S.hands[h.side]||[]).filter(c=>kind==='skill'?validCardFor(c,h,'atk')&&sk.heroAttack&&!EquipmentCore.standalone(c):EquipmentCore.canUse(h,c));
  },
  open(h,kind,{card=null,sk=null,done=null,back=null,pending=S.pending}={}){
    if(this.state||S.equipmentReaction||S.matchEnded)return false;
    this.state={h,kind,cardUid:card?.uid||null,cardUids:EquipmentCore.parts(card).map(c=>c.uid),multi:EquipmentCore.multipleAllowed(),sk,done,back,pending};
    hideAttackPopup();hideDefensePopup();hideUnitMenu();this.render();this.dialog.showModal();updateUI();return true;
  },
  render(){
    const s=this.state;if(!s)return;this.dialog.replaceChildren();
    const title=document.createElement('h2');title.textContent='PLAYER '+s.h.side+' · TRANG BỊ '+(s.kind==='post'?'PHẢN SÁT THƯƠNG':s.kind==='def'?'PHÒNG THỦ':s.kind.startsWith('skill')?'CHO SKILL':'TẤN CÔNG');
    const info=document.createElement('p');info.textContent=unitSpec(s.h).name+(s.sk?' · '+s.sk.name:'')+(s.multi?' · Chọn nhiều trang bị hợp lệ · Đã chọn '+s.cardUids.length:' · Chọn một lá bài hợp lệ');this.dialog.append(title,info);
    const list=document.createElement('div');list.className='combatEquipmentCards';const cards=this.cards(s.h,s.kind,s.sk);
    if(!cards.some(c=>c.uid===s.cardUid))s.cardUid=null;
    s.cardUids=s.cardUids.filter(uid=>cards.some(c=>c.uid===uid));
    for(const c of cards){const selected=s.multi?s.cardUids.includes(c.uid):s.cardUid===c.uid;
      const compatible=selected||!s.multi||EquipmentCore.canCombine([...cards.filter(x=>s.cardUids.includes(x.uid)),c]);
      const b=HeroSkillUI.button('',()=>{if(s.multi){const i=s.cardUids.indexOf(c.uid);if(i>=0)s.cardUids.splice(i,1);else s.cardUids.push(c.uid)}else{s.cardUid=c.uid;s.cardUids=[c.uid]}this.render();[...this.dialog.querySelectorAll('[data-card-uid]')].find(b=>b.dataset.cardUid===c.uid)?.focus()},!compatible);
      b.className='card '+c.type+(selected?' chosen':'');b.dataset.equipmentId=c.equipmentId;b.dataset.cardUid=c.uid;b.setAttribute('aria-pressed',String(selected));b.innerHTML=cardHTML(c);b.title=c.text+(compatible?'':' · Card này cần hành động hoặc lựa chọn mục tiêu riêng');list.append(b)}
    if(!cards.length){const empty=document.createElement('p');empty.textContent='Không có trang bị phù hợp.';list.append(empty)}this.dialog.append(list);
    const actions=document.createElement('div');actions.className='combatEquipmentActions';
    actions.append(HeroSkillUI.button('XÁC NHẬN',()=>this.confirm(),s.multi?!s.cardUids.length:!s.cardUid),HeroSkillUI.button(s.kind.startsWith('skill')?'KHÔNG DÙNG':'BỎ QUA',()=>this.confirm(true)),HeroSkillUI.button('QUAY LẠI',()=>this.cancel()));this.dialog.append(actions);
  },
  close(){this.state=null;if(this.dialog.open)this.dialog.close()},
  confirm(skip=false){
    const s=this.state;if(!s)return false;
    if(S.matchEnded||s.h.hp<=0&&s.kind!=='post'||s.pending!==S.pending){this.close();updateUI();return false}
    const available=this.cards(s.h,s.kind,s.sk),chosen=s.multi?available.filter(c=>s.cardUids.includes(c.uid)):[available.find(c=>c.uid===s.cardUid)].filter(Boolean);
    if(!skip&&(chosen.length!==(s.multi?s.cardUids.length:1)||!EquipmentCore.canCombine(chosen)))return false;
    const c=skip?null:EquipmentCore.combine(chosen);if(!skip&&!c)return false;
    this.close();
    if(s.done)s.done(c);
    else if(s.kind==='def'){if(c){const r=EquipmentCore.useDefense(s.h,c);if(r&&c.equipmentCards&&HeroCore.selection){const selection=HeroCore.selection;selection.uiFlow=true;selection.sk={...selection.sk,uiFlow:true};this.prepare(selection)}}else resolveCombat()}
    else if(c&&EquipmentCore.standalone(c)){const r=EquipmentCore.begin(s.h,c);if(r&&c.equipmentCards&&HeroCore.selection){const selection=HeroCore.selection;selection.uiFlow=true;selection.sk={...selection.sk,uiFlow:true};this.prepare(selection)}}
    else{S.selected=s.h;S.equipSelectedCard=c;S.equipPendingActorId=c?s.h.id:null;CoreAttackController.begin(c)}
    updateUI();return true;
  },
  cancel(){const s=this.state;if(!s)return;this.close();if(s.kind==='actor'){updateUI();return;}if(s.back)s.back();else if(s.kind==='post'){EquipmentCore.finishPostHit();return;}else if(s.kind==='def'&&S.pending)_flowDefensePopup(s.h);else if(s.kind==='atk')showAttackPopup(s.h);updateUI()},
  startSkill(h,n){
    if(this.state||h.side===S.botSide||S.equipmentReaction||HeroCore.selection||!HeroCore.canUse(h,n,heroSkill(h,n)))return false;
    S.selected=h;if(!HeroCore.begin(h,n))return false;
    const s=HeroCore.selection;if(h.side!==S.battleSide)s.cardUid=null;s.uiFlow=true;s.sk={...s.sk,uiFlow:true};
    if(h.side===S.battleSide){s.uiEquipmentStep=true;return this.open(h,'skill',{sk:s.sk,card:HeroCore.selectedCard(),done:c=>{
      if(HeroCore.selection!==s)return;s.cardUid=c?.uid||null;s.equipmentBundle=c?.equipmentCards?c:null;s.uiEquipmentStep=false;this.prepare(s);
    },back:()=>HeroCore.cancel()})}
    if(s.sk.mechanic==='HEAL'&&this.cards(h,'skillheal',s.sk).length)return this.healingEquipment(s,true);
    return this.prepare(s);
  },
  healingEquipment(s,cancelSkill=false){
    s.uiEquipmentStep=true;return this.open(s.h,'skillheal',{sk:s.sk,card:HeroCore.selectedCard(),done:c=>{if(HeroCore.selection!==s)return;s.cardUid=c?.uid||null;s.equipmentBundle=c?.equipmentCards?c:null;s.selected=[];s.uiEquipmentStep=false;this.prepare(s)},back:()=>{s.uiEquipmentStep=false;if(cancelSkill)HeroCore.cancel();else this.prepare(s)}});
  },
  prepare(s){
    const m=s.sk.mechanic;
    if(s.sk.target.side==='SELF'&&!['ESCAPE','SUMMON','MORPH','COPY','DICE_WARD'].includes(m)){s.selected=[s.h.id];return this.commit(s)}
    s.uiAutoCommit=HeroCore.targetLimit(s.h,s.sk,HeroCore.selectedCard())===1&&!['MORPH','CONVERT','COPY','DICE_WARD','STEAL'].includes(m)&&!(m==='SUMMON'&&!s.sk.parameters?.summonClass);
    HeroCore.draw();renderBoard();updateUI();return true;
  },
  commit(s){
    const pending=S.pending,defense=s.h.side!==S.battleSide,result=HeroCore.commit();
    if(result&&s.sk.mechanic==='COPY'&&HeroCore.selection&&HeroCore.selection!==s){const copy=HeroCore.selection;copy.uiFlow=true;copy.sk={...copy.sk,uiFlow:true};if(!defense&&typeof DirectBoardFlow==='undefined'){copy.uiEquipmentStep=true;return this.open(copy.h,'skill',{sk:copy.sk,done:c=>{if(HeroCore.selection!==copy)return;copy.cardUid=c?.uid||null;copy.equipmentBundle=c?.equipmentCards?c:null;copy.uiEquipmentStep=false;this.prepare(copy)},back:()=>HeroCore.cancel()})}return this.prepare(copy)}
    if(result&&defense&&S.pending===pending&&!HeroCore.selection&&!S.equipmentReaction&&!S.postHitReaction&&!S.pending?.replacementTargetId&&s.sk.mechanic!=='REDIRECT')resolveCombat();
    return result;
  },
  sync(){
    if(this.state&&(S.matchEnded||S.phase!=='battle'||this.state.pending!==S.pending||this.state.kind.startsWith('skill')&&!HeroCore.selection))this.close();
    if(!this.state){const s=HeroCore.selection;if(s?.uiFlow&&!s.uiEquipmentStep)gameHint.textContent=(HeroCore.notice?HeroCore.notice+' · ':'')+s.sk.name+' · '+(s.uiAutoCommit?'Chọn mục tiêu hoặc hex được highlight để thực hiện ngay.':'Chọn mục tiêu / tùy chọn rồi xác nhận.');else if(S.mode==='attack'&&S.attackChoice?.card)gameHint.textContent=S.attackChoice.card.name+' đã gắn cho '+unitSpec(S.selected).name+' · Chọn mục tiêu được highlight để tấn công.';return;}
    hideAttackPopup();hideDefensePopup();hideUnitMenu();HeroSkillUI.panel.hidden=true;HeroSkillUI.bar.hidden=true;EquipmentCore.bar.hidden=true;
    mainBtn.disabled=undoBtn.disabled=moveBtn.disabled=attackBtn.disabled=true;
    for(const b of skillBar.querySelectorAll('button'))b.disabled=true;
  }
};
CombatFlowUI.dialog.className='combatEquipmentDialog';CombatFlowUI.dialog.setAttribute('aria-label','Chọn trang bị');document.body.append(CombatFlowUI.dialog);
CombatFlowUI.dialog.addEventListener('cancel',e=>{e.preventDefault();CombatFlowUI.cancel()});
atkEquipBtn.onclick=()=>{if(S.selected)CombatFlowUI.open(S.selected,'atk')};
defEquipChoice.onclick=()=>{const p=S.pending,h=p&&S.units.find(u=>u.id===(p.guard?p.guardUnitId:p.replacementTargetId||p.d));if(h)CombatFlowUI.open(h,'def')};
CombatFlowUI.startEquipment=function(h,c){
  if(this.state||HeroCore.selection)return false;
  if(!h){const side=c.ownerPlayerId,units=S.units.filter(u=>u.side===side&&EquipmentCore.canUse(u,c));if(!units.length)return false;
    this.state={kind:'actor',pending:S.pending,card:c};this.dialog.replaceChildren();const title=document.createElement('h2');title.textContent=c.name+' · CHỌN ĐƠN VỊ';this.dialog.append(title);
    for(const u of units)this.dialog.append(HeroSkillUI.button(unitSpec(u).name+' · '+u.q+','+u.r,()=>{this.close();S.selected=u;this.open(u,u.side===S.battleSide?'atk':'def',{card:c})}));this.dialog.append(HeroSkillUI.button('HỦY',()=>{this.close();updateUI()}));this.dialog.showModal();updateUI();return true;
  }
  return this.open(h,h.side===S.battleSide?'atk':'def',{card:c});
};
const _flowSkillRender=HeroSkillUI.render;
HeroSkillUI.render=function(){_flowSkillRender.call(this);const s=HeroCore.selection;if(s?.uiFlow){
  if(s.uiEquipmentStep||s.uiAutoCommit)this.panel.hidden=true;
  else{const confirm=[...this.panel.querySelectorAll('button')].find(b=>b.textContent==='XÁC NHẬN');if(confirm){confirm.textContent=s.sk.heroAttack?'TẤN CÔNG':'XÁC NHẬN';confirm.onclick=()=>CombatFlowUI.commit(s)}
    this.panel.querySelector('select[aria-label="Trang bị kết hợp"]')?.remove();
}
}if(!s&&!this.bar.hidden)for(const b of this.bar.querySelectorAll('button')){const choices=S.units.filter(h=>h.hero&&h.hp>0&&h.side!==S.battleSide).flatMap(h=>[1,2,3].map(n=>({h,n,sk:heroSkill(h,n)}))).filter(x=>x.sk&&HeroCore.canUse(x.h,x.n,x.sk));const choice=choices.find(x=>b.textContent.includes(x.sk.name)&&b.textContent.includes(unitSpec(x.h).name));if(choice)b.onclick=()=>CombatFlowUI.startSkill(choice.h,choice.n)}
};
const _flowSkills=renderSkills;
renderSkills=function(){_flowSkills();for(const b of skillBar.querySelectorAll('button')){const h=S.units.find(u=>String(u.id)===b.dataset.heroId),n=Number(b.dataset.skillNo);if(h&&n)b.onclick=()=>CombatFlowUI.startSkill(h,n)}};
atkSkillBtn.onclick=()=>{const h=S.selected;if(!h?.hero)return;atkSkillList.replaceChildren();for(let n=1;n<=3;n++){const sk=heroSkill(h,n);atkSkillList.append(HeroSkillUI.button(sk.name+' · '+'★'.repeat(sk.star||0),()=>CombatFlowUI.startSkill(h,n),!HeroCore.canUse(h,n,sk)))}atkSkillList.classList.toggle('show')};
defHeroSkillChoice.onclick=()=>{const d=S.pending&&S.units.find(u=>u.id===S.pending.d);defCardList.replaceChildren();for(const c of defenseSkillChoices(d))defCardList.append(HeroSkillUI.button(unitSpec(c.hero).name+' · '+c.skill.name,()=>CombatFlowUI.startSkill(c.hero,c.skillNo)));defCardList.classList.add('show')};
const _flowSkillEntry=_beginSkillTargetInternal;
_beginSkillTargetInternal=function(n){return heroSkill(S.selected,n)?.mechanic?CombatFlowUI.startSkill(S.selected,n):_flowSkillEntry(n)};
const _flowUpdate=updateUI;
updateUI=function(){const r=_flowUpdate();CombatFlowUI.sync();return r};
const _flowReset=resetMatchState;
resetMatchState=function(){CombatFlowUI.close();return _flowReset()};
const _flowResolve=resolveCombat;
resolveCombat=function(){if(S.postHitReaction)return false;if(CombatFlowUI.state&&!S.equipmentReaction)CombatFlowUI.close();return _flowResolve()};
const _flowSelect=HeroCore.select;
HeroCore.select=function(u){const s=this.selection;if(s?.uiEquipmentStep)return false;const r=_flowSelect.call(this,u);if(r&&s?.uiAutoCommit)CombatFlowUI.commit(s);CombatFlowUI.describe();return r};
const _flowSelectCell=HeroCore.selectCell;
HeroCore.selectCell=function(c){const s=this.selection;if(s?.uiEquipmentStep)return false;const r=_flowSelectCell.call(this,c);if(r&&s?.uiAutoCommit)CombatFlowUI.commit(s);CombatFlowUI.describe();return r};
const _flowDefensePopup=showDefensePopup;
showDefensePopup=function(d){
  if(CombatFlowUI.state)return;
  const result=_flowDefensePopup(d),p=S.pending;
  if(p&&d){const cards=CombatFlowUI.cards(d,'def');defEquipChoice.disabled=!cards.length;defEquipChoice.textContent='🎴 TRANG BỊ PHÒNG THỦ ('+cards.length+')';}
  if(p&&d&&d.side!==S.botSide&&!HeroCore.selection&&!S.equipmentReaction&&!p.isPropagationTarget&&!p.isCounterattack&&!p.cancel&&!defenseSkillChoices(d).length)CombatFlowUI.open(d,'def');
  return result;
};
const _flowGuardReaction=EquipmentCore.guardReaction;
EquipmentCore.guardReaction=function(g){if(g.side===S.botSide)return _flowGuardReaction.call(this,g);CombatFlowUI.close();if(!CombatFlowUI.cards(g,'def').length)return resolveCombat();return CombatFlowUI.open(g,'def')};
const _flowEndTurn=endTurn;
endTurn=function(){if(CombatFlowUI.state)return false;return _flowEndTurn()};
const _flowAutoEnd=DuelTurnClock.autoEndTurn;
DuelTurnClock.autoEndTurn=function(){CombatFlowUI.close();return _flowAutoEnd.call(this)};
const _flowNext=HeroCore.next;
HeroCore.next=function(){const seq=S.heroSequence,r=_flowNext.call(this);if(seq?.sk.uiFlow&&this.selection?.continuation){this.selection.uiFlow=true;CombatFlowUI.prepare(this.selection)}return r};
// A card reaction may defer skill execution; resolve UI defense after Core applies it.
const _flowApplySelection=HeroCore.applySelection;
HeroCore.applySelection=function(s,targets,card){const pending=S.pending,r=_flowApplySelection.call(this,s,targets,card);if(r&&s.uiFlow&&s.h.side!==S.battleSide&&pending&&S.pending===pending&&!this.selection&&!S.equipmentReaction&&!S.postHitReaction&&!S.pending.replacementTargetId&&s.sk.mechanic!=='REDIRECT')resolveCombat();return r};
// The bottom information panel is always a Hero panel; soldiers use the map menu.
CombatFlowUI.heroPanel=function(){
  const h=HeroSkillUI.actor()||S.units.find(u=>u.hero&&u.side===S.battleSide);if(!h)return;
  const sp=unitSpec(h),heading=document.getElementById('unitPanel').querySelector('h3');if(heading)heading.textContent='HERO · PLAYER '+h.side;
  unitInfo.replaceChildren();const name=document.createElement('strong');name.textContent=sp.name;const info=document.createElement('div');info.textContent='HP '+h.hp+'/'+sp.hp+' · Move '+movementBudgetTotal(h)+' · Range '+sp.range;unitInfo.append(name,info);
  moveBtn.disabled=S.phase!=='battle'||h.side!==S.battleSide||h.side===S.botSide||!!S.pending||!!HeroCore.selection||!!this.state||!canMoveFurther(h);
  attackBtn.disabled=S.phase!=='battle'||h.side!==S.battleSide||h.side===S.botSide||!!S.pending||!!HeroCore.selection||!!this.state||h.attacked||HeroCore.blocked(h,'attack');
};
const _flowHeroMove=moveBtn.onclick,_flowHeroAttack=attackBtn.onclick;
moveBtn.onclick=function(e){const h=HeroSkillUI.actor();if(!h||moveBtn.disabled)return;S.selected=h;return _flowHeroMove?.call(this,e)};
attackBtn.onclick=function(e){const h=HeroSkillUI.actor();if(!h||attackBtn.disabled)return;S.selected=h;return _flowHeroAttack?.call(this,e)};
CombatFlowUI.status=document.createElement('div');CombatFlowUI.status.className='combatFlowStatus';CombatFlowUI.status.setAttribute('aria-live','polite');document.getElementById('gameScreen').append(CombatFlowUI.status);
CombatFlowUI.describe=function(){
  const p=S.pending,s=HeroCore.selection,seq=S.heroSequence;let text='';
  if(p){const a=S.units.find(u=>u.id===p.a),d=S.units.find(u=>u.id===(p.guard?p.guardUnitId:p.replacementTargetId||p.d));text='Đòn '+(seq?.round||1)+'/'+(seq?.count||1)+' · '+(a?unitSpec(a).name:'')+' → '+(d?unitSpec(d).name:'')+' · '+(p.heroMechanic?.name||'Đánh thường')+(p.atkCard?' · '+p.atkCard.name:'')+(S.postHitReaction?' · Đã nhận '+S.postHitReaction.damage+' sát thương — chọn Khiên Ma Thuật':'')}
  else if(s){text=unitSpec(s.h).name+' · '+s.sk.name+(HeroCore.selectedCard()?' + '+HeroCore.selectedCard().name:'')+' · Mục tiêu '+s.selected.length+'/'+HeroCore.targetLimit(s.h,s.sk,HeroCore.selectedCard());if(seq)text+=' · Đòn '+(seq.round+1)+'/'+seq.count}
  else if(['attack','direct'].includes(S.mode)&&S.selected){text=unitSpec(S.selected).name+' · Đánh thường'+(S.attackChoice?.card?' + '+S.attackChoice.card.name:'')+' · Mục tiêu 0/1'}
  this.status.replaceChildren();const label=document.createElement('span');label.textContent=text;this.status.append(label);this.status.hidden=!text||S.phase!=='battle';
  if(s&&!s.uiEquipmentStep&&!s.continuation&&!this.state){
    if(s.h.side!==S.battleSide&&s.sk.mechanic==='HEAL'&&this.cards(s.h,'skillheal',s.sk).length)this.status.append(HeroSkillUI.button('CHỌN BÌNH MÁU',()=>this.healingEquipment(s)));
    if(typeof DirectBoardFlow==='undefined'&&s.h.side===S.battleSide&&!s.sk.equipmentAction)this.status.append(HeroSkillUI.button('ĐỔI TRANG BỊ',()=>{s.uiEquipmentStep=true;this.open(s.h,'skill',{sk:s.sk,card:HeroCore.selectedCard(),done:c=>{if(HeroCore.selection!==s)return;s.cardUid=c?.uid||null;s.equipmentBundle=c?.equipmentCards?c:null;s.selected=[];s.uiEquipmentStep=false;this.prepare(s)},back:()=>{s.uiEquipmentStep=false;this.prepare(s)}})}));
    this.status.append(HeroSkillUI.button('HỦY',()=>HeroCore.cancel()));
  }else if(S.mode==='attack'&&S.selected&&!p&&!this.state){const h=S.selected;this.status.append(HeroSkillUI.button('ĐỔI TRANG BỊ',()=>this.open(h,'atk',{card:S.attackChoice?.card})),HeroSkillUI.button('HỦY',()=>{CoreAttackController.cancelTargeting();S.equipSelectedCard=null;S.equipPendingActorId=null;S.attackChoice=null;updateUI()}));}

};
const _flowPanelUpdate=updateUI;
updateUI=function(){const r=_flowPanelUpdate();CombatFlowUI.heroPanel();CombatFlowUI.describe();return r};
const _flowCheckWin=checkWin;
checkWin=function(){if(S.postHitReaction)return false;return _flowCheckWin()};
const _flowClockTick=DuelTurnClock.tick;
DuelTurnClock.tick=function(){const r=S.postHitReaction;if(!r||S.equipmentReaction)return _flowClockTick.call(this);const now=Date.now();r.remainingMs=Math.max(0,r.remainingMs-(now-r.lastTick));r.lastTick=now;this.lastTickMs=now;this.defenseLastTickMs=now;duelTimerBadge.textContent='KHIÊN MA THUẬT P'+r.d.side+' · '+Math.ceil(r.remainingMs/1000)+'s';if(!r.remainingMs){CombatFlowUI.close();EquipmentCore.finishPostHit()}return};
