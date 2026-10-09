/* Defensive choices share the dock and map; mode policy controls multi-card selection. */
const DirectDefenseFlow={
  pending:null,receiverId:null,cardUids:[],
  receiver(){const p=S.pending;return S.postHitReaction?.d||p&&S.units.find(u=>u.id===(p.guard?p.guardUnitId:p.replacementTargetId||p.d))},
  active(){const h=this.receiver();return S.phase==='battle'&&!S.matchEnded&&!!h&&h.side!==S.botSide&&!S.equipmentReaction},
  guards(){const p=S.pending,h=this.receiver();return this.active()&&!S.postHitReaction&&!HeroCore.selection&&!p.guard&&!p.directGuardSkipped&&!p.defenseSkillUsed&&!p.ignoreGuard?guardCandidates(h):[]},
  sync(){const h=this.receiver();if(this.pending!==S.pending||this.receiverId!==h?.id){this.pending=S.pending;this.receiverId=h?.id;this.cardUids=[]}this.panel.hidden=!this.active();if(!this.active())return;hideDefensePopup();hideUnitMenu();this.panel.replaceChildren();const p=S.pending,seq=S.heroSequence,a=S.units.find(u=>u.id===p.a),post=S.postHitReaction;const label=document.createElement('p');label.textContent=post?unitSpec(h).name+' đã nhận '+post.damage+' sát thương · Chọn Khiên Ma Thuật hoặc Không phản':'Đòn '+(seq?.round||1)+'/'+(seq?.count||1)+' · '+(a?unitSpec(a).name:'')+' → '+unitSpec(h).name+' · '+HeroCore.incoming(p)+' sát thương · '+pendingAttackPower(p)+' sao';this.panel.append(label);
    if(HeroCore.selection||CombatFlowUI.state){const hint=document.createElement('p');hint.textContent='Hoàn tất lựa chọn skill/card hoặc hủy để quay lại phòng thủ.';this.panel.append(hint);return}
    const guards=this.guards();if(guards.length){const hint=document.createElement('p');hint.textContent='Chọn Bộ binh để đỡ đòn, bỏ qua nếu không muốn Bộ binh đỡ đòn';this.panel.append(hint,HeroSkillUI.button('BỎ QUA',()=>{p.directGuardSkipped=true;this.cardUids=[];renderBoard();updateUI()}))}
    if(EquipmentCore.multipleAllowed())this.panel.append(HeroSkillUI.button('PHÒNG THỦ',()=>this.confirm(),!this.cardUids.length));
    this.panel.append(HeroSkillUI.button(post?'KHÔNG PHẢN':'NHẬN ĐÒN',()=>{this.cardUids=[];if(post)EquipmentCore.finishPostHit();else resolveCombat()}));
  },
  unit(g){if(!this.guards().some(u=>u.id===g.id))return false;return this.guard(g)},
  guard(g){const p=S.pending;if(!p||!this.guards().some(u=>u.id===g.id))return false;p.guard=true;p.guardUnitId=g.id;p.directGuardSkipped=true;this.cardUids=[];S.selected=g;hideGuardTargeting();lg('🛡 '+unitSpec(g).name+' nhận đòn thay đồng đội.');renderBoard();updateUI();return true},
  cards(h){return S.postHitReaction?EquipmentCore.postHitChoices(S.postHitReaction.p,h):CombatFlowUI.cards(h,'def')},
  choose(h,c){if(!this.active()||HeroCore.selection||CombatFlowUI.state)return false;const receiver=this.receiver();if(h?.id!==receiver.id||!this.cards(receiver).some(x=>x.uid===c.uid))return false;if(!EquipmentCore.multipleAllowed())return this.use(receiver,c);const next=this.cardUids.includes(c.uid)?this.cardUids.filter(uid=>uid!==c.uid):this.cardUids.concat(c.uid),cards=this.cards(receiver).filter(x=>next.includes(x.uid));if(!EquipmentCore.canCombine(cards))return false;this.cardUids=next;renderBoard();updateUI();return true},
  confirm(){const h=this.receiver();if(!h||HeroCore.selection||!this.cardUids.length)return false;const cards=this.cards(h).filter(c=>this.cardUids.includes(c.uid));if(cards.length!==this.cardUids.length||!EquipmentCore.canCombine(cards))return false;return this.use(h,EquipmentCore.combine(cards))},
  use(h,c){this.cardUids=[];if(S.postHitReaction)return EquipmentCore.finishPostHit(c);const result=EquipmentCore.useDefense(h,c);if(result&&HeroCore.selection){const s=HeroCore.selection;s.uiFlow=true;s.sk={...s.sk,uiFlow:true};CombatFlowUI.prepare(s)}renderBoard();updateUI();return result},
  renderHand(){const h=this.receiver();if(!this.active()||S.equipmentReaction)return;handOwner.textContent='PLAYER '+h.side+' · '+(S.postHitReaction?'PHẢN SÁT THƯƠNG':'PHÒNG THỦ');handBar.replaceChildren();const cards=this.cards(h);for(const c of S.hands[h.side]||[]){const b=document.createElement('button');b.type='button';b.className='card '+c.type+(this.cardUids.includes(c.uid)?' chosen':'');const tmp=document.createElement('div');tmp.innerHTML=cardHTML(c);b.append(...tmp.firstElementChild.childNodes);b.dataset.equipmentId=c.equipmentId;b.dataset.cardUid=c.uid;b.setAttribute('aria-pressed',String(this.cardUids.includes(c.uid)));b.disabled=!!HeroCore.selection||!!CombatFlowUI.state||!cards.some(x=>x.uid===c.uid);b.onclick=()=>this.choose(h,c);handBar.append(b)}},
};
DirectDefenseFlow.panel=document.createElement('div');DirectDefenseFlow.panel.className='directDefensePanel';DirectDefenseFlow.panel.setAttribute('aria-label','Phản ứng phòng thủ');DirectDefenseFlow.panel.hidden=true;CoreDOM.board.wrap.append(DirectDefenseFlow.panel);
const _directDefensePopup=showDefensePopup;
showDefensePopup=function(d){if(d?.side===S.botSide)return _directDefensePopup(d);S.selected=DirectDefenseFlow.receiver()||d;hideDefensePopup();renderBoard();updateUI()};
const _directDefenseOpen=CombatFlowUI.open.bind(CombatFlowUI);
CombatFlowUI.open=function(h,kind,options={}){if(h?.side!==S.botSide&&['def','post'].includes(kind)){this.close();S.selected=h;renderBoard();updateUI();return true}return _directDefenseOpen(h,kind,options)};
const _directDefenseEquipment=CombatFlowUI.startEquipment;
CombatFlowUI.startEquipment=function(h,c){return DirectDefenseFlow.active()&&!S.equipmentReaction?DirectDefenseFlow.choose(h||DirectDefenseFlow.receiver(),c):_directDefenseEquipment(h,c)};
const _directDefenseDock=EquipmentCore.renderDockHand;
EquipmentCore.renderDockHand=function(){if(DirectDefenseFlow.active()&&!S.equipmentReaction)return DirectDefenseFlow.renderHand();return _directDefenseDock.call(this)};
const _directDefenseSync=CombatFlowUI.sync.bind(CombatFlowUI);
CombatFlowUI.sync=function(){_directDefenseSync();DirectDefenseFlow.sync();if(DirectDefenseFlow.active())DirectDefenseFlow.renderHand()};
const _directGuard=chooseGuardFromMap;
chooseGuardFromMap=function(g){return DirectDefenseFlow.active()?DirectDefenseFlow.guard(g):_directGuard(g)};
const _directGuardReaction=EquipmentCore.guardReaction;
EquipmentCore.guardReaction=function(g){if(g.side===S.botSide)return _directGuardReaction.call(this,g);S.selected=g;renderBoard();updateUI();return true};
const _directDefenseUnit=DirectBoardFlow.unit.bind(DirectBoardFlow);
DirectBoardFlow.unit=function(u){return DirectDefenseFlow.active()&&!HeroCore.selection?DirectDefenseFlow.unit(u):_directDefenseUnit(u)};
CoreBoardRenderer.registerLayer('DIRECT_DEFENSE_GUARD',85,{unitClasses(u){return DirectDefenseFlow.guards().some(g=>g.id===u.id)?' guardCandidate':''}});
const _directDefenseSkill=CombatFlowUI.startSkill.bind(CombatFlowUI);
CombatFlowUI.startSkill=function(h,n){if(DirectDefenseFlow.active()){DirectDefenseFlow.cardUids=[]}return _directDefenseSkill(h,n)};
