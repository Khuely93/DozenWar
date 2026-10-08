
// Keep targeting state clean across turn changes / reset and prevent selecting another unit mid-targeting.

const _selectUnitV72=selectUnit;
selectUnit=function(u){if(S.mode==='skill')return;_selectUnitV72(u)};



/* ===== V7.5 ATTACK ACTION POPUP ===== */
const attackPopup=document.createElement('div');
attackPopup.className='attackPopup';attackPopup.dataset.dwId='CORE_UI_ATTACK_POPUP';
attackPopup.innerHTML='<div class="attackPopupTitle"><b data-dw-id="CORE_UI_ATTACK_POPUP_TITLE">ATTACK ACTION</b><button class="attackPopupClose" data-dw-id="CORE_UI_ATTACK_POPUP_CLOSE">×</button></div><div class="attackPopupTarget" data-dw-id="CORE_UI_ATTACK_POPUP_INFO"></div><div class="attackPopupMain"><button class="btn danger" data-dw-id="CORE_UI_ATTACK_NORMAL">⚔️ ĐÁNH THƯỜNG</button><button class="btn gold" data-dw-id="CORE_UI_ATTACK_SKILL">✨ DÙNG SKILL</button><button class="btn" data-dw-id="CORE_UI_ATTACK_EQUIPMENT">🎴 DÙNG TRANG BỊ</button><button class="btn" data-dw-id="CORE_UI_ATTACK_SKIP">↪ BỎ QUA KHÔNG ĐÁNH</button></div><div class="attackSub" data-dw-id="CORE_UI_ATTACK_SKILL_LIST"></div><div class="attackSub" data-dw-id="CORE_UI_ATTACK_CARD_LIST"></div><div class="attackHint" data-dw-id="CORE_UI_ATTACK_HINT">Chọn cách thực hiện hành động tấn công.</div>';
CoreDOM.board.wrap.appendChild(attackPopup);
const AttackDOM=CoreDOM.registerDynamic('attackPopup',{
  popup:attackPopup,
  title:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_POPUP_TITLE"]'),
  info:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_POPUP_INFO"]'),
  closeButton:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_POPUP_CLOSE"]'),
  normalButton:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_NORMAL"]'),
  skillButton:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_SKILL"]'),
  equipmentButton:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_EQUIPMENT"]'),
  skipButton:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_SKIP"]'),
  skillList:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_SKILL_LIST"]'),
  cardList:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_CARD_LIST"]'),
  hint:attackPopup.querySelector('[data-dw-id="CORE_UI_ATTACK_HINT"]')
});
const atkPopupTitle=AttackDOM.title,atkPopupInfo=AttackDOM.info,atkPopupClose=AttackDOM.closeButton,atkNormalBtn=AttackDOM.normalButton,atkSkillBtn=AttackDOM.skillButton,atkEquipBtn=AttackDOM.equipmentButton,atkSkipBtn=AttackDOM.skipButton,atkSkillList=AttackDOM.skillList,atkCardList=AttackDOM.cardList,atkPopupHint=AttackDOM.hint;
S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;
function hasAttackTarget(u){return !!u&&S.units.some(t=>t.hp>0&&t.side!==u.side&&canAttack(u,t))}
function attackCardsFor(u){return u?.queuedAttackEquipment?[]:(S.hands[u.side]||[]).filter(c=>validCardFor(c,u,'atk'))}
function renderEquipmentSelect(){
  if(!S.selected)return;atkSkillList.classList.remove('show');atkCardList.innerHTML='';
  let cards=attackCardsFor(S.selected),wrap=document.createElement('div');wrap.className='equipSelectWrap';
  cards.forEach(c=>{let b=document.createElement('button');b.className='equipCardBtn'+(S.equipSelectedCard?.uid===c.uid?' selected':'');b.innerHTML=cardHTML(c);b.onclick=()=>{S.equipSelectedCard=S.equipSelectedCard?.uid===c.uid?null:c;renderEquipmentSelect()};wrap.appendChild(b)});
  let foot=document.createElement('div');foot.className='equipSelectFooter';
  let back=document.createElement('button');back.className='btn';back.textContent='← QUAY LẠI';back.onclick=()=>{S.equipSelectedCard=null;S.equipPendingActorId=null;atkCardList.classList.remove('show');atkCardList.innerHTML='';};
  let ok=document.createElement('button');ok.className='btn gold';ok.textContent='XÁC NHẬN CARD';ok.disabled=!S.equipSelectedCard;ok.onclick=()=>{if(!S.equipSelectedCard||!attackCardsFor(S.selected).some(c=>c.uid===S.equipSelectedCard.uid))return;S.equipPendingActorId=S.selected.id;atkCardList.classList.remove('show');atkCardList.innerHTML='';atkPopupHint.textContent='Card đang chờ · chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.';};
  foot.append(back,ok);wrap.appendChild(foot);atkCardList.appendChild(wrap);atkCardList.classList.add('show');
  atkPopupHint.textContent=S.equipSelectedCard?'XÁC NHẬN CARD để giữ pending, sau đó chọn ĐÁNH THƯỜNG hoặc SKILL.':'Chọn 1 Card. Nhấn lại Card đang chọn để bỏ chọn.';
}
function hideAttackPopup(){attackPopup.className='attackPopup';atkSkillList.classList.remove('show');atkCardList.classList.remove('show');atkSkillList.innerHTML='';atkCardList.innerHTML=''}
function positionAttackPopup(u){let c=cells.find(c=>c.q===u.q&&c.r===u.r);if(!c)return;if(typeof DuelCamera!=='undefined'&&DuelCamera.enabled)return DuelCamera.placePopup(attackPopup,c);attackPopup.style.left=(c.x/10)+'%';attackPopup.style.top=(c.y/10)+'%';attackPopup.className='attackPopup show';if(c.y<220)attackPopup.classList.add('below');else if(c.x<190)attackPopup.classList.add('right');else if(c.x>810)attackPopup.classList.add('left')}
function showAttackPopup(u){if(!u||S.battleSide===S.botSide||S.phase!=='battle'||u.side!==S.battleSide||u.attacked||S.pending)return;S.selected=u;S.mode=null;S.attackChoice=null;hideUnitMenu();hideDefensePopup();atkSkillList.innerHTML='';atkCardList.innerHTML='';atkSkillList.classList.remove('show');atkCardList.classList.remove('show');let cards=attackCardsFor(u),pending=S.equipPendingActorId===u.id&&cards.some(c=>c.uid===S.equipSelectedCard?.uid);atkPopupTitle.textContent='PLAYER '+u.side+' · ATTACK ACTION';atkPopupInfo.textContent=(u.hero?'HERO · ':'')+unitSpec(u).name+' · Chọn cách tấn công';atkNormalBtn.disabled=!hasAttackTarget(u);atkSkillBtn.style.display=u.hero?'block':'none';atkSkillBtn.disabled=!u.hero||allHeroSkillsUsed(u)||u.attacked;atkEquipBtn.disabled=!cards.length;atkEquipBtn.textContent='🎴 '+(pending?'ĐỔI CARD ĐANG CHỜ':'CHỌN TRANG BỊ')+' ('+cards.length+')';atkPopupHint.textContent=u.queuedAttackEquipment?'Card từ Skill hỗ trợ đang chờ đòn đánh thường kế tiếp.':pending?'Card đang chờ · chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.':'Chọn Card trước, rồi chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.';positionAttackPopup(u);renderBoard();updateUI()}
function _beginAttackTargetInternal(card){if(!S.selected||S.selected.attacked)return;S.attackChoice={type:card?'card':'normal',card:card||null};S.mode='attack';hideAttackPopup();renderBoard();updateUI();lg(card?'🎴 '+unitSpec(S.selected).name+' chuẩn bị tấn công với '+card.name+'.':'⚔️ '+unitSpec(S.selected).name+' chuẩn bị đánh thường.');}
atkPopupClose.onclick=()=>{S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;S.mode=null;hideAttackPopup();renderBoard();renderUnitMenu()};
atkNormalBtn.onclick=()=>{const card=S.equipPendingActorId===S.selected?.id?S.equipSelectedCard:null;CoreAttackController.begin(card)};
atkEquipBtn.onclick=()=>{if(!S.selected)return;renderEquipmentSelect()};
atkSkillBtn.onclick=()=>{if(!S.selected||!S.selected.hero)return;atkCardList.classList.remove('show');atkSkillList.innerHTML='';unitSpec(S.selected).skills.forEach((txt,i)=>{let n=i+1,b=document.createElement('button');b.className='btn';b.innerHTML='<b>S'+n+'</b> · '+txt;let defensive=heroSkill(S.selected,n)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(S.selected,n)||S.selected.attacked||defensive;b.onclick=()=>{hideAttackPopup();S.attackChoice=null;CoreSkillController.begin(n)};atkSkillList.appendChild(b)});atkSkillList.classList.toggle('show')};
atkSkipBtn.onclick=()=>{if(!S.selected)return;let u=S.selected;u.attacked=true;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;S.mode=null;S.selected=null;hideAttackPopup();hideUnitMenu();lg('↪ '+unitSpec(u).name+' bỏ qua hành động tấn công trong lượt này.');renderBoard();updateUI()};

// ATTACK button now opens the contextual attack-action popup instead of immediately entering target mode.
unitAttackQuick.onclick=()=>{if(!S.selected||S.selected.attacked||S.pending||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected))))return;showAttackPopup(S.selected)};
attackBtn.onclick=()=>{if(S.skillTarget){if(ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT')applySkillTarget();return}if(!S.selected||S.selected.attacked||S.pending||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected))))return;showAttackPopup(S.selected)};

// Consume an attack card only after a legal target is actually selected; then go straight to defender reaction.
startAttack=function(a,d){hideUnitMenu();hideAttackPopup();S.mode=null;let choice=S.attackChoice||{type:'normal',card:null};let base=1+(a.damageBuff||0),queued=a.queuedAttackEquipment||null,card=queued||choice.card||null;if(choice.card&&queued)return false;if(choice.card&&(!validCardFor(choice.card,a,'atk')||!(S.hands[a.side]||[]).some(c=>c.uid===choice.card.uid)))return false;S.pending={a:a.id,d:d.id,base,sourceType:'ATTACK',skillId:null,skillStar:null,atkCard:card,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:effectOf(card,'EFFECT_IGNORE_INF_GUARD'),isPropagationTarget:false};if(card&&typeof EquipmentCore!=='undefined'){S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;return EquipmentCore.play(a,card,'atk',accepted=>{if(queued)a.queuedAttackEquipment=null;S.pending.atkCard=accepted?card:null;S.pending.ignoreGuard=!!a.ignoreInfGuard||accepted&&effectOf(card,'EFFECT_IGNORE_INF_GUARD');if(!accepted)return EquipmentCore.resumeNormal(a,d);showReaction(true);updateUI()})}if(card){if(queued)a.queuedAttackEquipment=null;else{S.hands[a.side]=S.hands[a.side].filter(x=>x.uid!==card.uid);markDuelCardUsed(a.side,'atk')}lg('🎴 Player '+a.side+' dùng '+card.name+' cho đòn tấn công.')}S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;showReaction(true);updateUI()};

// Attack-target cancellation is now owned by CORE_INPUT_ROUTER.
// Keep attack UI state clean on turn/reset/skill changes.
// v1.13: legacy beginSkillTarget wrapper removed.
// Skill entry always goes through CoreSkillController so UI cannot bypass controller checks.
const _beginSkillFromAttackPopup=(n)=>{S.attackChoice=null;hideAttackPopup();return CoreSkillController.begin(n)};

