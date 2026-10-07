function beginDeploy(){hideDeployMenu();S.phase='deploy';show('game');S.deployOrder=[S.loser,S.winner];S.deployIndex=0;S.units=[];S.selected=null;S.history=[];renderBoard();updateUI()}
const boardSvg=CoreDOM.board.svg;
const unitMenu=CoreDOM.unitAction.menu,unitMenuName=CoreDOM.unitAction.name,unitMenuClose=CoreDOM.unitAction.closeButton,unitMoveQuick=CoreDOM.unitAction.moveButton,unitAttackQuick=CoreDOM.unitAction.attackButton,unitSkillQuick=CoreDOM.unitAction.skillButton,unitMenuSkills=CoreDOM.unitAction.skills,unitMenuHint=CoreDOM.unitAction.hint,
deployMenu=CoreDOM.deployment.menu,deployMenuTitle=CoreDOM.deployment.title,deployMenuClose=CoreDOM.deployment.closeButton,deployHeroBtn=CoreDOM.deployment.heroButton,deployTroopBtn=CoreDOM.deployment.troopButton,deployTroops=CoreDOM.deployment.troops,deployHint=CoreDOM.deployment.hint;
let cells=[];let deployTargetCell=null,lastDragEnd=0,dragState=null;
function buildCells(){
  cells=[];
  const rad=46;
  const hexW=Math.sqrt(3)*rad;
  const rowStep=1.5*rad;
  const centerX=500, centerY=500;
  // MAP_001_LAYOUT_01: true axial hexagon radius 4 => 5/6/7/8/9/8/7/6/5 (61 cells).
  // Using real axial coordinates keeps movement, range, line attacks and adjacency mathematically correct.
  for(let r=-4;r<=4;r++){
    const qMin=Math.max(-4,-r-4);
    const qMax=Math.min(4,-r+4);
    const zone=r<0?2:r>0?1:0;
    for(let q=qMin;q<=qMax;q++){
      const x=centerX+hexW*(q+r/2);
      const y=centerY+rowStep*r;
      cells.push({q,r,x,y,zone});
    }
  }
}
buildCells();
function hexPts(x,y,rad=46){
  let pts=[];
  for(let i=0;i<6;i++){
    let a=Math.PI/3*i+Math.PI/6;
    pts.push((x+rad*Math.cos(a))+','+(y+rad*Math.sin(a)));
  }
  return pts.join(' ');
}
function unitAt(q,r){return S.units.find(u=>u.q===q&&u.r===r&&u.hp>0)}
function cellNeighbors(c){return cells.filter(n=>distU(c,n)===1)}
function movementBudgetTotal(u){let spec=unitSpec(u);return Math.max(0,(spec?.move||0)+(u?.moveBuff||0))}
function movementCostSpent(u){return Math.max(0,u?.movementCostSpent||0)}
function remainingMove(u){return Math.max(0,movementBudgetTotal(u)-movementCostSpent(u))}
function canMoveFurther(u){return !!(u&&u.hp>0&&!u.attacked&&(S.selectedMode!=='MODE_DUEL_001'||!u.moved)&&remainingMove(u)>0)}
function reachableCellCosts(u){
  const out=new Map();
  const maneuver=S.skillTarget?.moving&&S.skillTarget.heroId===u?.id&&
    ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT';
  if(!u||S.phase!=='battle'||(!canMoveFurther(u)&&!(maneuver&&u.hp>0&&!u.attacked&&remainingMove(u)>0)))return out;
  const max=remainingMove(u),start=cells.find(c=>c.q===u.q&&c.r===u.r);
  if(!start||max<=0)return out;
  const seen=new Set([start.q+','+start.r]),front=[{c:start,d:0}];
  while(front.length){
    const cur=front.shift();if(cur.d>=max)continue;
    for(const n of cellNeighbors(cur.c)){
      const k=n.q+','+n.r;if(seen.has(k))continue;seen.add(k);
      if(unitAt(n.q,n.r))continue;
      const nd=cur.d+1;out.set(k,nd);front.push({c:n,d:nd});
    }
  }
  return out;
}
function reachableCells(u){return new Set(reachableCellCosts(u).keys())}
function movementCostToCell(u,c){return reachableCellCosts(u).get(c.q+','+c.r)??null}
function isHighlight(c){
  if(S.phase!=='battle'||S.mode!=='move'||!S.selected)return false;
  return reachableCells(S.selected).has(c.q+','+c.r);
}
function isAttackHL(c){
  if(S.phase!=='battle'||S.mode!=='attack'||!S.selected)return false;
  let u=unitAt(c.q,c.r);return !!(u&&u.side!==S.selected.side&&canAttack(S.selected,u));
}
function currentDeployPlayer(){return S.deployOrder[S.deployIndex]}
function save(){S.history.push(JSON.stringify({units:S.units,deployIndex:S.deployIndex,battleSide:S.battleSide,turn:S.turn,phase:S.phase,hands:S.hands,skillUsed:S.skillUsed,cardUsed:S.cardUsed,pending:S.pending,recentAttackers:S.recentAttackers,duelUsage:S.duelUsage,attackHistory:S.attackHistory,heroSkillHistory:S.heroSkillHistory,troopDeaths:S.troopDeaths,firstPlayerAttackedThisTurn:S.firstPlayerAttackedThisTurn}))}
function undo(){hideDeployMenu();hideUnitMenu();if(!S.history.length)return;let o=JSON.parse(S.history.pop());Object.assign(S,o);S.selected=null;S.mode=null;S.skillTarget=null;skillTargetPanel.classList.remove('show');renderBoard();updateUI()}
undoBtn.onclick=undo;resetBtn.onclick=()=>location.reload();
function legacyRenderBoardBase(){boardSvg.innerHTML='';for(let c of cells){let p=document.createElementNS('http://www.w3.org/2000/svg','polygon');p.setAttribute('points',hexPts(c.x,c.y));p.setAttribute('stroke','#fff');p.setAttribute('stroke-width','1.2');p.setAttribute('vector-effect','non-scaling-stroke');p.setAttribute('class','hex '+(c.zone===1?'zoneBottom':c.zone===2?'zoneTop':'border')+(isHighlight(c)?' hl':'')+(isAttackHL(c)?' attack':''));p.dataset.q=c.q;p.dataset.r=c.r;p.addEventListener('click',()=>cellClick(c));boardSvg.appendChild(p)}for(let u of S.units.filter(x=>x.hp>0)){let g=document.createElementNS('http://www.w3.org/2000/svg','g');let guardCls='';if(S.guardTargeting&&S.pending){let gd=S.units.find(x=>x.id===S.pending.d);if(gd&&u.id===gd.id)guardCls=' guardTarget';else if(gd&&guardCandidates(gd).some(x=>x.id===u.id))guardCls=' guardCandidate';}g.setAttribute('class','unit'+(S.phase==='deploy'&&u.side===currentDeployPlayer()?' deployDraggable':'')+guardCls);g.dataset.unitId=u.id;let c=cells.find(c=>c.q===u.q&&c.r===u.r);let cir=document.createElementNS('http://www.w3.org/2000/svg','circle');cir.setAttribute('cx',c.x);cir.setAttribute('cy',c.y);cir.setAttribute('r',28);cir.setAttribute('fill',u.side===1?'#2f86c7':'#c54b4b');g.appendChild(cir);let tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('x',c.x);tx.setAttribute('y',c.y-2);tx.textContent=unitSpec(u).sym;tx.setAttribute('font-size','24');g.appendChild(tx);let hp=document.createElementNS('http://www.w3.org/2000/svg','text');hp.setAttribute('x',c.x);hp.setAttribute('y',c.y+20);hp.textContent='❤'+u.hp;hp.setAttribute('fill','#fff');g.appendChild(hp);g.addEventListener('click',(e)=>{e.stopPropagation();if(Date.now()-lastDragEnd<280)return;if(S.guardTargeting){if(chooseGuardFromMap(u))return;let d=S.pending&&S.units.find(x=>x.id===S.pending.d);if(d&&u.id===d.id){cancelGuardTargeting(true);return}return;}if(S.phase==='deploy')return;if(S.phase==='battle'&&S.mode==='attack'&&S.selected&&u.side!==S.selected.side){if(canAttack(S.selected,u)){startAttack(S.selected,u)}else{lg('❌ Mục tiêu nằm ngoài tầm tấn công.')}return}selectUnit(u)});if(S.phase==='deploy'&&u.side===currentDeployPlayer())bindDeployDrag(g,u);boardSvg.appendChild(g)}}

function legacyCellClickBase(c){if(S.guardTargeting){cancelGuardTargeting(true);return;}if(S.phase==='deploy'){let p=currentDeployPlayer();if(c.zone!==p||unitAt(c.q,c.r))return hideDeployMenu();if(S.units.filter(u=>u.side===p).length>=6)return;showDeployMenu(c);return}if(S.phase==='battle'&&S.selected&&S.mode==='move'&&isHighlight(c)){let cost=movementCostToCell(S.selected,c);if(cost==null)return;save();S.selected.q=c.q;S.selected.r=c.r;S.selected.movementCostSpent=movementCostSpent(S.selected)+cost;S.selected.moved=S.selected.movementCostSpent>0;S.mode=null;renderBoard();updateUI();renderUnitMenu()}}
function mainAction(){hideUnitMenu();hideDeployMenu();if(S.phase==='deploy'){let p=currentDeployPlayer(),cnt=S.units.filter(u=>u.side===p).length;if(cnt<6)return alert('Phải xếp đủ 1 Hero + 5 lính.');if(S.deployIndex===0){S.deployIndex=1;S.selected=null;renderBoard();updateUI()}else{S.phase='battle';S.battleSide=S.winner;S.turn=1;resetTurnFlags();renderBoard();updateUI();lg('⚔️ Battle Start. Player '+S.battleSide+' đi trước.')}}else if(S.phase==='battle'){return endTurn()}}
mainBtn.onclick=()=>{if(S.botSide&&(S.phase==='battle'&&S.battleSide===S.botSide||S.phase==='deploy'&&currentDeployPlayer()===S.botSide))return false;return mainAction()};
function resetTurnFlags(){
  hideUnitMenu();
  S.units.filter(u=>u.side===S.battleSide).forEach(u=>{u.moved=false;u.movementCostSpent=0;u.attacked=false;u.moveBuff=0;u.turnMoveBuff=0;u.damageBuff=0});
  S.cardUsed={1:false,2:false};S.recentAttackers={1:[],2:[]};S.selected=null;S.mode=null;S.pending=null;S.skillSequence=null;
  S.skillTarget=null;skillTargetPanel.classList.remove('show');
  S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;hideAttackPopup();
  S.botQueue=null;
}
function endTurn(){if(S.skillSequence&&!S.pending)resolveNextSkillSequenceTarget();if(S.pending||S.skillTarget||S.skillSequence||S.guardTargeting||S.matchEnded)return false;for(const u of S.units.filter(u=>u.side===S.battleSide&&u.turnMoveBuff)){u.moveBuff=Math.max(0,(u.moveBuff||0)-u.turnMoveBuff);u.turnMoveBuff=0}resetSkillUsageForModeBoundary('TURN');S.battleSide=S.battleSide===1?2:1;S.turn++;resetTurnFlags();renderBoard();updateUI();lg('➡️ Sang lượt Player '+S.battleSide);return true}
function hideDeployMenu(){deployTargetCell=null;deployMenu.className='deployMenu';deployTroops.classList.remove('show');deployTroops.innerHTML=''}
function positionDeployMenu(c){if(typeof DuelCamera!=='undefined'&&DuelCamera.enabled)return DuelCamera.placePopup(deployMenu,c);deployMenu.style.left=(c.x/10)+'%';deployMenu.style.top=(c.y/10)+'%';deployMenu.className='deployMenu show';if(c.y<210)deployMenu.classList.add('below');else if(c.x<180)deployMenu.classList.add('right');else if(c.x>820)deployMenu.classList.add('left')}
function remainingTroops(p){let team=S.teams[p],placed=S.units.filter(u=>u.side===p&&!u.hero),arr=[];for(let [k,n] of Object.entries(team.troops)){let used=placed.filter(u=>u.kind===k).length,remain=n-used;if(remain>0)arr.push({kind:k,remain})}return arr}
function showDeployMenu(c){let p=currentDeployPlayer(),team=S.teams[p],placed=S.units.filter(u=>u.side===p);deployTargetCell=c;deployMenuTitle.textContent='ĐẶT QUÂN · PLAYER '+p;let heroPlaced=placed.some(u=>u.hero);deployHeroBtn.disabled=heroPlaced;deployHeroBtn.textContent=heroPlaced?'HERO · ĐÃ ĐẶT':'HERO';let remain=remainingTroops(p);deployTroopBtn.disabled=!remain.length;deployTroopBtn.textContent=remain.length?'LÍNH · '+remain.reduce((a,x)=>a+x.remain,0)+' CÒN LẠI':'LÍNH · ĐÃ ĐẶT HẾT';deployHint.textContent='Ô đã chọn · '+(placed.length)+'/6 quân đã đặt';deployTroops.classList.remove('show');deployTroops.innerHTML='';positionDeployMenu(c)}
function addDeployUnit(hero,kind){if(!deployTargetCell||S.phase!=='deploy'||currentDeployPlayer()===S.botSide)return;let p=currentDeployPlayer(),c=deployTargetCell;if(c.zone!==p||unitAt(c.q,c.r))return hideDeployMenu();let team=S.teams[p],definitionId=null;if(hero){if(S.units.some(u=>u.side===p&&u.hero))return;definitionId=team.heroDefinitionId;let h=ContentViews.hero(definitionId);if(!h)return;kind=CLASS_KIND[h.class]}else{let rem=remainingTroops(p).find(x=>x.kind===kind);if(!rem)return;definitionId=TROOPS[kind].canonicalId}save();S.units.push(createRuntimeEntityInstance({definitionId,side:p,hero,kind,q:c.q,r:c.r}));hideDeployMenu();renderBoard();updateUI()}
deployMenuClose.onclick=hideDeployMenu;
deployHeroBtn.onclick=()=>addDeployUnit(true,null);
deployTroopBtn.onclick=()=>{if(!deployTargetCell)return;let p=currentDeployPlayer(),remain=remainingTroops(p);deployTroops.innerHTML='';remain.forEach(x=>{let b=document.createElement('button');b.type='button';b.className='btn';b.innerHTML=(TROOPS[x.kind].sym||'')+' '+TROOPS[x.kind].name+' · còn '+x.remain;b.onclick=()=>addDeployUnit(false,x.kind);deployTroops.appendChild(b)});deployTroops.classList.toggle('show')};
function svgPointFromPointer(e){let r=boardSvg.getBoundingClientRect();return{x:(e.clientX-r.left)*1000/r.width,y:(e.clientY-r.top)*1000/r.height}}
function nearestCellFromPointer(e){let pt=svgPointFromPointer(e),best=null,bd=1e9;for(let c of cells){let d=Math.hypot(c.x-pt.x,c.y-pt.y);if(d<bd){bd=d;best=c}}return bd<54?best:null}
function setDragHexes(p,over){boardSvg.querySelectorAll('.hex').forEach(el=>{let c=cells.find(x=>x.q==el.dataset.q&&x.r==el.dataset.r);el.classList.remove('drag-valid','drag-over');if(c&&c.zone===p&&!unitAt(c.q,c.r))el.classList.add('drag-valid')});if(over){let el=[...boardSvg.querySelectorAll('.hex')].find(x=>+x.dataset.q===over.q&&+x.dataset.r===over.r);if(el)el.classList.add('drag-over')}}
function clearDragHexes(){boardSvg.querySelectorAll('.hex').forEach(el=>el.classList.remove('drag-valid','drag-over'))}
function bindDeployDrag(g,u){let holdTimer=null;g.addEventListener('pointerdown',e=>{if(S.phase!=='deploy'||u.side!==currentDeployPlayer())return;hideDeployMenu();let isTouch=e.pointerType==='touch';dragState={u,startX:e.clientX,startY:e.clientY,active:!isTouch,pointerId:e.pointerId,g};if(isTouch)holdTimer=setTimeout(()=>{if(dragState&&dragState.u===u){dragState.active=true;g.classList.add('deployDragging');setDragHexes(u.side,null)}},260);g.setPointerCapture?.(e.pointerId);e.stopPropagation()});g.addEventListener('pointermove',e=>{if(!dragState||dragState.u!==u)return;let moved=Math.hypot(e.clientX-dragState.startX,e.clientY-dragState.startY);if(!dragState.active&&e.pointerType!=='touch'&&moved>5){dragState.active=true;g.classList.add('deployDragging');setDragHexes(u.side,null)}if(!dragState.active)return;e.preventDefault();let over=nearestCellFromPointer(e);if(over&&over.zone===u.side&&( !unitAt(over.q,over.r)|| (over.q===u.q&&over.r===u.r)))setDragHexes(u.side,over);else setDragHexes(u.side,null)});let finish=e=>{if(holdTimer)clearTimeout(holdTimer);if(!dragState||dragState.u!==u)return;let was=dragState.active;g.classList.remove('deployDragging');clearDragHexes();if(was){let over=nearestCellFromPointer(e);if(over&&over.zone===u.side&&(!unitAt(over.q,over.r)||(over.q===u.q&&over.r===u.r))){if(over.q!==u.q||over.r!==u.r){save();u.q=over.q;u.r=over.r;lg('↔️ Đã đổi vị trí '+unitSpec(u).name+'.')}}lastDragEnd=Date.now();renderBoard();updateUI()}dragState=null;e.stopPropagation()};g.addEventListener('pointerup',finish);g.addEventListener('pointercancel',finish)}
function hideUnitMenu(){unitMenu.className='unitMenu';unitMenuSkills.classList.remove('show')}
function positionUnitMenu(u){let c=cells.find(c=>c.q===u.q&&c.r===u.r);if(!c)return hideUnitMenu();if(typeof DuelCamera!=='undefined'&&DuelCamera.enabled)return DuelCamera.placePopup(unitMenu,c);unitMenu.style.left=(c.x/10)+'%';unitMenu.style.top=(c.y/10)+'%';unitMenu.className='unitMenu show';if(c.y<210)unitMenu.classList.add('below');else if(c.x<180)unitMenu.classList.add('right');else if(c.x>820)unitMenu.classList.add('left')}
function renderUnitMenu(){if(S.phase!=='battle'||!S.selected||S.pending||S.battleSide===S.botSide||S.selected.side!==S.battleSide)return hideUnitMenu();let u=S.selected,sp=unitSpec(u);unitMenuName.textContent=(u.hero?'HERO · ':'')+sp.name+'  ❤'+u.hp+'/'+sp.hp;unitMoveQuick.disabled=!canMoveFurther(u);unitAttackQuick.disabled=u.attacked||(!hasAttackTarget(u)&&(!u.hero||allHeroSkillsUsed(u)));unitSkillQuick.style.display=u.hero?'block':'none';unitSkillQuick.disabled=!u.hero||allHeroSkillsUsed(u)||u.attacked;unitMenuHint.textContent=u.attacked?'Đơn vị đã kết thúc hành động trong lượt này':movementCostSpent(u)>0?('Đã dùng '+movementCostSpent(u)+' Move · còn '+remainingMove(u)+' · có thể Skill / Attack'):'Có thể Move → Skill/Attack hoặc Attack trực tiếp';unitMenuSkills.innerHTML='';if(u.hero){unitSpec(u).skills.forEach((txt,i)=>{let b=document.createElement('button');b.type='button';b.className='btn';b.innerHTML='<b>S'+(i+1)+'</b> · '+txt;let defensive=heroSkill(u,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(u,i+1)||u.attacked||(defensive&&!S.pending);b.addEventListener('click',()=>{unitMenuSkills.classList.remove('show');useSkill(i+1);hideUnitMenu()});unitMenuSkills.appendChild(b)})}positionUnitMenu(u)}
function selectUnit(u){if(S.phase!=='battle'||S.battleSide===S.botSide||u.side!==S.battleSide||S.pending)return false;if(u.attacked)return false;S.selected=u;S.mode=null;updateUI();renderBoard();renderUnitMenu();return true}
function axial(c){return [c.q,c.r]}
function distU(a,b){let [aq,ar]=axial(a),[bq,br]=axial(b),as=-aq-ar,bs=-bq-br;return Math.max(Math.abs(aq-bq),Math.abs(ar-br),Math.abs(as-bs))}
function aligned(a,b,max=99){let [aq,ar]=axial(a),[bq,br]=axial(b);let dq=bq-aq,dr=br-ar,ds=-(dq+dr);if(Math.max(Math.abs(dq),Math.abs(dr),Math.abs(ds))>max)return false;return dq===0||dr===0||ds===0}
function moveReach(u){let max=remainingMove(u);return cells.filter(c=>!unitAt(c.q,c.r)&&distU(u,c)<=max&&distU(u,c)>0)}
function canAttack(a,d){let spec=unitSpec(a),base=spec.base||a.kind;if(spec.attackPattern==='LINE'||(!spec.attackPattern&&base==='archer'))return aligned(a,d,spec.range);return distU(a,d)<=spec.range}
unitMenuClose.onclick=()=>{S.selected=null;S.mode=null;hideUnitMenu();renderBoard();updateUI()};
unitMoveQuick.onclick=()=>{if(!S.selected||!canMoveFurther(S.selected))return;S.mode='move';hideUnitMenu();renderBoard();updateUI()};
unitAttackQuick.onclick=()=>{if(!S.selected||S.selected.attacked)return;S.mode='attack';hideUnitMenu();renderBoard();updateUI()};
unitSkillQuick.onclick=()=>{if(!S.selected||!S.selected.hero||false||S.selected.attacked)return;unitMenuSkills.classList.toggle('show')};
moveBtn.onclick=()=>{if(!S.selected||!canMoveFurther(S.selected))return;S.mode='move';hideUnitMenu();renderBoard();updateUI()};
attackBtn.onclick=()=>{if(!S.selected||S.selected.attacked)return;S.mode='attack';hideUnitMenu();renderBoard();updateUI()};
function unitSpec(u){if(!u)return null;if(u.hero){let h=ContentViews.hero(u.definitionId);return h?{canonicalId:h.id,name:h.name,sym:h.sym,base:CLASS_RUNTIME[h.class],classId:h.class,hp:h.stats.hp,move:h.stats.move,range:h.stats.attackRange,attackPattern:h.attackPattern,passives:h.passives,equipmentClassIds:h.equipmentClassIds,skillIds:h.skillIds,skills:h.skillIds.map(id=>ContentViews.skill(id)?.description||id)}:null}let n=ContentViews.unit(u.definitionId);return n?{canonicalId:n.id,name:n.name,sym:n.sym,base:CLASS_RUNTIME[n.class],classId:n.class,hp:n.stats.hp,move:n.stats.move,range:n.stats.attackRange,attackPattern:n.attackPattern,passives:n.passives}:TROOPS[u.kind]}
function markDuelCardUsed(side,context){if(S.selectedMode==='MODE_DUEL_001'){const bucket=context==='def'?duelUsage().defenseCard:duelUsage().attackCard;bucket[side]++}}
function validCardFor(c,u,context){if(S.selectedMode==='MODE_DUEL_001'){const usage=duelUsage();if(context==='atk'&&usage.attackCard[u.side]>=1)return false;if(context==='def'&&(usage.defenseCard[u.side]>=1||S.pending?.isCounterattack||u.side===S.battleSide))return false}let spec=unitSpec(u),base=spec.base||u.kind;if(spec.equipmentClassIds&&!spec.equipmentClassIds.some(id=>CLASS_RUNTIME[id]===c.cls))return false;if(c.cls!=='neutral'&&c.cls!==base)return false;if(context==='atk')return c.type==='atk'||c.type==='neu';if(context==='def')return c.type==='def'||c.type==='neu';return false}
function startAttack(a,d){hideUnitMenu();S.mode=null;let base=1+(a.damageBuff||0);S.pending={a:a.id,d:d.id,base,sourceType:'ATTACK',skillId:null,skillStar:null,atkCard:null,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:false,isPropagationTarget:false};showReaction(false);updateUI()}
function showReaction(defPhase){reactionBox.style.display=defPhase?'none':'block';let a=S.units.find(x=>x.id===S.pending.a),d=S.units.find(x=>x.id===S.pending.d);if(defPhase){S.selected=(d&&d.hero)?d:null;S.recentAttackers??={1:[],2:[]};const ids=S.recentAttackers[d.side]??=[];if(!ids.includes(a.id))ids.push(a.id)}else S.selected=a;renderBoard();reactionInfo.textContent=(defPhase?'Defender':'Attacker')+' · '+unitSpec(a).name+' → '+unitSpec(d).name+' · Base Damage '+S.pending.base;if(defPhase){handBar.innerHTML='';handOwner.textContent='PLAYER '+d.side+' · DEFENSE REACTION TRÊN BATTLEFIELD';showDefensePopup(d)}else{hideDefensePopup();renderHand(a.side,'atk');guardBtn.style.display='none';skipReact.textContent='KHÔNG DÙNG CARD';resolveBtn.textContent='CHUYỂN SANG DEFENSE';resolveBtn.onclick=()=>showReaction(true)}renderSkills()}
function pendingAttackPower(p=S.pending){
  if(!p)return 0;
  const sources=[];
  if(p.sourceType==='SKILL'&&p.skillStar!=null)sources.push({sourceType:CORE_STAR_SOURCE.HERO_SKILL,star:p.skillStar,active:true});
  if(p.atkCard)sources.push({sourceType:CORE_STAR_SOURCE.EQUIPMENT,star:p.atkCard.star,active:true});
  return CorePowerResolver.finalPower(sources);
}
function defenseEquipmentWins(p,card){return !!(card&&CorePowerResolver.resolve(pendingAttackPower(p),Math.max(card.star||0,p.defenseSkillStar||0)).winner==='RESPONSE')}
function resolveCombat(){
  if(typeof clearDefenseSkillTarget==='function')clearDefenseSkillTarget();
  hideUnitMenu();
  if(typeof HeroCore!=='undefined'&&HeroCore.selection){HeroCore.selection=null;HeroCore.draw()}
  const p=S.pending;if(!p)return;
  const a=S.units.find(x=>x.id===p.a),originalTarget=S.units.find(x=>x.id===p.d);
  if(!a||!originalTarget){
    S.pending=null;S.skillSequence=null;reactionBox.style.display='none';hideDefensePopup();
    S.selected=null;S.mode=null;
    const result=checkWin();renderBoard();updateUI();
    return result;
  }
  let finalTarget=originalTarget;
  let dmg=Math.max(0,p.base||0),dc=p.defCard;
  if(p.atkCard)dmg+=effectValue(p.atkCard,'EFFECT_DAMAGE_PLUS_1');
  let defenseWon=false;
  if(dc){
    defenseWon=defenseEquipmentWins(p,dc);
    if(defenseWon){
      if(effectOf(dc,'EFFECT_CANCEL_ATTACK')){p.cancel=true;p.cancelReason='EQUIPMENT_CANCEL'}
      if(effectOf(dc,'EFFECT_REFLECT_DAMAGE'))p.reflect=true;
      const reduction=effectValue(dc,'EFFECT_DAMAGE_REDUCE_1');if(reduction)dmg=Math.max(0,dmg-reduction);
    }else lg('★ '+dc.name+' không đủ Interaction Power — effect phòng thủ không kích hoạt.');
  }
  if(p.ignoreGuard)p.guard=false;
  if(p.guard){const guard=S.units.find(u=>u.id===p.guardUnitId&&u.hp>0);if(guard){finalTarget=guard;lg('🛡️ '+unitSpec(guard).name+' trở thành Final Target thay '+unitSpec(originalTarget).name+'.')}}
  if(p.replacementTargetId){const replacement=S.units.find(u=>u.id===p.replacementTargetId&&u.hp>0);if(replacement){finalTarget=replacement;lg('✨ '+unitSpec(replacement).name+' nhận đòn thay '+unitSpec(originalTarget).name+'.')}}
  if(p.cancel){dmg=0;p.hitResult=p.cancelReason==='DODGE'?'MISS':'CANCELLED'}else p.hitResult='HIT';
  const appliedDamage=Math.max(0,dmg);
  if(p.hitResult==='HIT'&&appliedDamage>0)finalTarget.hp=Math.max(0,finalTarget.hp-appliedDamage);
  if(typeof HeroCore!=='undefined'&&p.drain){a.hp=Math.min(unitSpec(a).hp,a.hp+p.drain);p.drainApplied=true}
  if(p.reflect&&defenseWon&&p.hitResult==='HIT'&&appliedDamage>0){a.hp=Math.max(0,a.hp-appliedDamage);lg('↩️ Reflect trả '+appliedDamage+' damage về '+unitSpec(a).name+' — vẫn resolve kể cả Defender lethal.')}
  if(p.retaliationTargetIds)for(const id of p.retaliationTargetIds){const foe=S.units.find(u=>u.id===id&&u.hp>0);if(foe){const retaliation=1+(dc?effectValue(dc,'EFFECT_DAMAGE_PLUS_1'):0);foe.hp=Math.max(0,foe.hp-retaliation);lg('✨ Phục thù gây '+retaliation+' sát thương cho '+unitSpec(foe).name+'.')}}
  if(typeof HeroCore!=='undefined')HeroCore.afterHit(p,a,finalTarget,appliedDamage);
  if(p.sourceType!=='SKILL')a.attacked=true;
  lg(p.hitResult==='MISS'?'✨ Kết quả: MISS (Dodge).':p.hitResult==='CANCELLED'?'⛔ Attack bị CANCEL.':'⚔️ Damage resolve: '+appliedDamage);
  const passives=unitSpec(a).passives||[];
  if(p.sourceType!=='SKILL'&&passives.includes('PIERCE_ONE_HEX')&&originalTarget.hp<=0&&appliedDamage>0)doPierce(a,originalTarget,appliedDamage);
  const seq=S.skillSequence;
  S.pending=null;reactionBox.style.display='none';hideDefensePopup();S.selected=null;S.mode=null;
  const result=checkWin();
  if(S.matchEnded){S.skillSequence=null;S.heroSequence=null;}
  renderBoard();updateUI();
  if(!S.matchEnded&&seq)resolveNextSkillSequenceTarget();
  return result;
}
function doPierce(a,d,dmg){let aq=axial(a),dq=axial(d),vq=dq[0]-aq[0],vr=dq[1]-aq[1],m=Math.max(Math.abs(vq),Math.abs(vr),Math.abs(-(vq+vr)));vq/=m;vr/=m;for(let c of cells){let [cq,cr]=axial(c);if(cq===dq[0]+vq&&cr===dq[1]+vr){let u=unitAt(c.q,c.r);if(u&&u.side!==a.side){u.hp=Math.max(0,u.hp-dmg);lg('🐎 Pierce lan '+dmg+' damage.')}}}}
function guardCandidates(d){return S.units.filter(u=>u.side===d.side&&u.hp>0&&(unitSpec(u)?.passives||[]).includes('INF_GUARD')&&u.id!==d.id&&distU(u,d)<=1)}
function findGuard(d){return guardCandidates(d)[0]||null}
guardBtn.style.display='none';guardBtn.onclick=()=>{};
skipReact.onclick=()=>{if(!S.pending)return;let a=S.units.find(x=>x.id===S.pending.a),d=S.units.find(x=>x.id===S.pending.d);if(reactionInfo.textContent.startsWith('Attacker'))showReaction(true);else resolveCombat()};
function renderSkills(){skillBar.innerHTML='';if(!S.selected||!S.selected.hero){for(let i=0;i<3;i++){let b=document.createElement('button');b.className='btn skill';b.disabled=true;b.textContent='Skill '+(i+1);skillBar.appendChild(b)}return}let h=unitSpec(S.selected);h.skills.forEach((s,i)=>{let b=document.createElement('button');b.className='btn skill';b.innerHTML='<b>S'+(i+1)+'</b><br><span class="muted">'+s+'</span>';let defensive=heroSkill(S.selected,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(S.selected,i+1)||(!defensive&&S.selected.attacked)||(defensive&&!S.pending);b.onclick=()=>useSkill(i+1);skillBar.appendChild(b)})}
function useSkill(n){return CoreSkillController.begin(n)}
function lineSkill(h,len,maxT,dmg){for(let dir of dirs){let hits=[];for(let n=1;n<=len;n++){let targetCell=findCellAxialStep(h,dir,n);if(!targetCell)continue;let u=unitAt(targetCell.q,targetCell.r);if(u&&u.side!==h.side)hits.push(u)}if(hits.length){hits.slice(0,maxT).forEach(u=>u.hp=Math.max(0,u.hp-dmg));lg('✨ Skill đường thẳng trúng '+Math.min(maxT,hits.length)+' mục tiêu');return}}lg('Skill không tìm thấy mục tiêu trên đường thẳng.')}
function findCellAxialStep(u,dir,n){let [aq,ar]=axial(u),tq=aq+dir[0]*n,tr=ar+dir[1]*n;return cells.find(c=>{let [q,r]=axial(c);return q===tq&&r===tr})}
function renderHand(p,context){handOwner.textContent='PLAYER '+p+' · '+(context==='atk'?'ATTACK':'DEFENSE')+' WINDOW';handBar.innerHTML='';S.hands[p].forEach(c=>{let u=context==='atk'?S.units.find(x=>x.id===S.pending?.a):S.units.find(x=>x.id===S.pending?.d);let ok=u&&validCardFor(c,u,context);let d=document.createElement('button');d.className='card '+c.type+(ok?'':' dim');d.innerHTML=cardHTML(c);d.disabled=!ok;d.onclick=()=>{if(context==='atk'){S.pending.atkCard=c;if(effectOf(c,'EFFECT_IGNORE_INF_GUARD'))S.pending.ignoreGuard=true}else{S.pending.defCard=c}S.hands[p]=S.hands[p].filter(x=>x.uid!==c.uid);markDuelCardUsed(p,context);lg('🎴 Player '+p+' dùng '+c.name+' ['+c.canonicalId+']');showReaction(context==='def')};handBar.appendChild(d)})} 
let checkWin=()=>null
function updateUI(){if(S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();if(S.phase==='deploy'){let p=currentDeployPlayer(),n=S.units.filter(u=>u.side===p).length;mainBtn.disabled=currentDeployPlayer()===S.botSide;gameTitle.textContent='DEPLOYMENT — PLAYER '+p;gameHint.textContent=(p===S.loser?'Người đi sau xếp trước':'Người đi trước xếp sau')+' · đã xếp '+n+'/6';mainBtn.textContent=n===6?(S.deployIndex===0?'XÁC NHẬN & CHUYỂN PLAYER':'BATTLE START'):'XÁC NHẬN';summary.textContent='Player '+S.loser+' chọn/xếp trước. Player '+S.winner+' đi lượt đầu.';unitInfo.textContent='Nhấn một ô hex trống trong lãnh địa → chọn HERO hoặc LÍNH. Muốn đổi vị trí: kéo trực tiếp quân bằng chuột; trên điện thoại nhấn giữ rồi kéo.';moveBtn.disabled=attackBtn.disabled=true;renderSkills();handBar.innerHTML='';handOwner.textContent='Hand sẽ dùng trong Battle.';reactionBox.style.display='none'}else if(S.phase==='battle'){gameTitle.textContent='TURN '+S.turn+' — PLAYER '+S.battleSide;gameHint.textContent='Mỗi đơn vị có 1 lần Move và 1 lần Attack mỗi lượt; Attack kết thúc hành động của đơn vị.';mainBtn.textContent='KẾT THÚC LƯỢT';attackBtn.textContent=S.skillTarget&&ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT'?'TẤN CÔNG SKILL':'ATTACK';mainBtn.disabled=!!(S.pending||S.skillTarget||S.skillSequence||S.guardTargeting||S.matchEnded||S.battleSide===S.botSide);if(S.battleSide===S.botSide&&!S.pending)gameHint.textContent='Bot đang thực hiện lượt của mình.';if(S.pending)gameHint.textContent='Đang chờ phản ứng phòng thủ: chọn cách phòng thủ hoặc KHÔNG ĐỠ ĐÒN để hoàn tất đòn đánh.';else if(S.skillSequence)gameHint.textContent='Đang xử lý các mục tiêu tiếp theo của Skill.';else if(S.skillTarget)gameHint.textContent=ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT'?'Di chuyển EST tùy ý, chọn thủ công tối đa 4 địch kề bên rồi nhấn TẤN CÔNG.':'Chọn mục tiêu Skill hoặc hủy chọn mục tiêu để kết thúc lượt.';else if(S.guardTargeting)gameHint.textContent='Chọn Bộ binh đỡ đòn hoặc hủy lựa chọn phòng thủ.';summary.textContent='Lượt đầu thuộc Player '+S.winner+' (người thắng Roll Dice).';if(S.selected){let sp=unitSpec(S.selected);unitInfo.innerHTML='<b>'+sp.name+'</b><br>HP '+S.selected.hp+'/'+sp.hp+' · Move '+movementBudgetTotal(S.selected)+' (đã dùng '+movementCostSpent(S.selected)+', còn '+remainingMove(S.selected)+') · Range '+sp.range+(sp.base==='archer'?' đường thẳng 3 ô, xuyên đơn vị':'');moveBtn.disabled=!!S.skillTarget||S.battleSide===S.botSide||!canMoveFurther(S.selected);attackBtn.disabled=S.skillTarget?!(ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT'&&S.skillTarget.selected.length):S.battleSide===S.botSide||S.selected.attacked||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected)))}else{unitInfo.textContent='Chọn một đơn vị của Player '+S.battleSide+'.';moveBtn.disabled=attackBtn.disabled=true}renderSkills();if(!S.pending){handOwner.textContent=S.battleSide===S.botSide?'BOT HAND · đang ẩn':'PLAYER '+S.battleSide+' HAND · card hợp lệ sẽ sáng theo context';handBar.innerHTML=S.battleSide===S.botSide?'':S.hands[S.battleSide].map(c=>cardHTML(c,true)).join('');reactionBox.style.display='none'}}}

boardSvg.addEventListener('click',e=>{if(S.phase==='battle'&&S.mode==='attack'&&e.target.tagName==='polygon'){let q=+e.target.dataset.q,r=+e.target.dataset.r,u=unitAt(q,r);if(u&&S.selected&&u.side!==S.selected.side&&canAttack(S.selected,u)){startAttack(S.selected,u);return}}if(S.phase==='battle'&&e.target.tagName==='polygon'&&!S.mode&&!S.pending){S.selected=null;hideUnitMenu();renderBoard();updateUI()}});

// ===== V7.4 TARGET-ANCHORED DEFENSE POPUP =====
const defensePopup=document.createElement('div');
defensePopup.className='defensePopup';
defensePopup.innerHTML='<div class="defTitle" data-dw-id="CORE_UI_DEF_TITLE">DEFENSE REACTION</div><div class="defTarget" data-dw-id="CORE_UI_DEF_TARGET"></div><div class="defActions"><button class="btn good" data-dw-id="CORE_UI_DEF_GUARD">🛡️ BỘ BINH ĐỠ ĐÒN</button><button class="btn" data-dw-id="CORE_UI_DEF_EQUIPMENT">🎴 DÙNG TRANG BỊ ĐỠ ĐÒN</button><button class="btn primary" data-dw-id="CORE_UI_DEF_HERO_SKILL" style="display:none">✨ HERO SKILL</button><button class="btn danger" data-dw-id="CORE_UI_DEF_NONE">KHÔNG ĐỠ ĐÒN</button></div><div class="defSub" data-dw-id="CORE_UI_DEF_GUARD_LIST"></div><div class="defSub" data-dw-id="CORE_UI_DEF_CARD_LIST"></div><div class="defHint" data-dw-id="CORE_UI_DEF_HINT"></div>';
CoreDOM.board.wrap.appendChild(defensePopup);
const DefenseDOM=CoreDOM.registerDynamic('defensePopup',{
  popup:defensePopup,
  title:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_TITLE"]'),
  target:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_TARGET"]'),
  guardButton:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_GUARD"]'),
  equipmentButton:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_EQUIPMENT"]'),
  heroSkillButton:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_HERO_SKILL"]'),
  noDefenseButton:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_NONE"]'),
  guardList:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_GUARD_LIST"]'),
  cardList:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_CARD_LIST"]'),
  hint:defensePopup.querySelector('[data-dw-id="CORE_UI_DEF_HINT"]')
});
const defPopupTitle=DefenseDOM.title,defPopupTarget=DefenseDOM.target,defGuardChoice=DefenseDOM.guardButton,defEquipChoice=DefenseDOM.equipmentButton,defHeroSkillChoice=DefenseDOM.heroSkillButton,defNoDefense=DefenseDOM.noDefenseButton,defGuardList=DefenseDOM.guardList,defCardList=DefenseDOM.cardList,defPopupHint=DefenseDOM.hint;
const guardTargetHint=document.createElement('div');
guardTargetHint.className='guardTargetHint';guardTargetHint.dataset.dwId=DW_IDS.CORE.INFANTRY_GUARD_TARGETING;
guardTargetHint.textContent='🛡️ CHỌN BỘ BINH ĐỠ ĐÒN · chạm vào unit đang phát sáng';
document.querySelector('.boardWrap').appendChild(guardTargetHint);

function clearGuardHighlights(){
  boardSvg.querySelectorAll('.unit.guardCandidate,.unit.guardChosen,.unit.guardTarget')
    .forEach(g=>g.classList.remove('guardCandidate','guardChosen','guardTarget'));
}

function applyGuardTargetHighlights(){
  clearGuardHighlights();
  if(!S.guardTargeting||!S.pending)return;
  let d=S.units.find(x=>x.id===S.pending.d);
  if(!d)return;
  let targetNode=boardSvg.querySelector('[data-unit-id="'+d.id+'"]');
  if(targetNode)targetNode.classList.add('guardTarget');
  guardCandidates(d).forEach(g=>{
    let el=boardSvg.querySelector('[data-unit-id="'+g.id+'"]');
    if(el)el.classList.add('guardCandidate');
  });
}

function beginGuardTargeting(){
  if(!S.pending)return;
  let d=S.units.find(x=>x.id===S.pending.d);
  if(!d)return;
  let guards=guardCandidates(d);
  if(!guards.length||S.pending.ignoreGuard)return;
  S.guardTargeting=true;
  defensePopup.className='defensePopup';
  defGuardList.classList.remove('show');
  defCardList.classList.remove('show');
  guardTargetHint.classList.add('show');
  renderBoard();
  applyGuardTargetHighlights();
  handOwner.textContent='PLAYER '+d.side+' · CHỌN BỘ BINH ĐỠ ĐÒN TRÊN MAP';
}

function cancelGuardTargeting(reopen=true){
  if(!S.guardTargeting)return;
  S.guardTargeting=false;
  renderBoard();
  guardTargetHint.classList.remove('show');
  clearGuardHighlights();
  if(reopen&&S.pending){
    let d=S.units.find(x=>x.id===S.pending.d);
    if(d)showDefensePopup(d);
  }
}

function hideGuardTargeting(){
  S.guardTargeting=false;
  if(typeof guardTargetHint!=='undefined')guardTargetHint.classList.remove('show');
  clearGuardHighlights();
}

function chooseGuardFromMap(g){
  if(!S.guardTargeting||!S.pending)return false;
  let d=S.units.find(x=>x.id===S.pending.d);
  if(!d)return false;
  let valid=guardCandidates(d).some(x=>x.id===g.id);
  if(!valid)return false;
  S.pending.guard=true;
  S.pending.guardUnitId=g.id;
  S.guardTargeting=false;
  renderBoard();
  guardTargetHint.classList.remove('show');
  clearGuardHighlights();
  let node=boardSvg.querySelector('[data-unit-id="'+g.id+'"]');
  if(node)node.classList.add('guardChosen');
  lg('🛡️ Player '+d.side+' chọn '+unitSpec(g).name+' đỡ đòn cho '+unitSpec(d).name+'.');
  if(typeof EquipmentCore!=='undefined'&&defenseCards(g).length)EquipmentCore.guardReaction(g);else setTimeout(resolveCombat,120);
  return true;
}

function hideDefensePopup(){if(typeof defensePopup==='undefined')return;defensePopup.className='defensePopup';defGuardList.classList.remove('show');defCardList.classList.remove('show');S.guardTargeting=false;if(typeof guardTargetHint!=='undefined')guardTargetHint.classList.remove('show');clearGuardHighlights()}
function positionDefensePopup(d){let c=cells.find(c=>c.q===d.q&&c.r===d.r);if(!c)return;if(typeof DuelCamera!=='undefined'&&DuelCamera.enabled)return DuelCamera.placePopup(defensePopup,c);defensePopup.style.left=(c.x/10)+'%';defensePopup.style.top=(c.y/10)+'%';defensePopup.className='defensePopup show';if(c.y<220)defensePopup.classList.add('below');else if(c.x<190)defensePopup.classList.add('right');else if(c.x>810)defensePopup.classList.add('left')}
function defenseCards(d){return S.hands[d.side].filter(c=>validCardFor(c,d,'def'))}
function defenseSkillChoices(d){
  if(!d||!S.pending||S.pending.d!==d.id)return [];
  if(S.selectedMode==='MODE_DUEL_001'&&(d.side===S.battleSide||S.pending.isCounterattack))return [];
  return S.units.filter(h=>h.hero&&h.hp>0&&h.side===d.side).flatMap(h=>{
    return heroDefenseReactionSkills(h).flatMap(entry=>{
    if(isSkillUsed(h,entry.skillNo))return [];
    const skill=entry.skill;
    const cards=(S.hands?.[h.side]||[]).filter(card=>validCardFor(card,h,'def'));
    if(CorePowerResolver.resolve(pendingAttackPower(S.pending),skill.star||0).winner!=='RESPONSE'&&
       !cards.some(card=>CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(skill.star||0,card.star||0)).winner==='RESPONSE'))return [];
    if(effectOf(skill,'EFFECT_HEAL_1')){
      const targets=S.units.filter(u=>baseSkillCandidate(h,skill,u));
      return targets.length?[{hero:h,...entry,targets}]:[];
    }
    if(effectOf(skill,'EFFECT_SWAP_ALLY')){
      if(h.id!==d.id)return [];
      const targets=S.units.filter(u=>!u.hero&&baseSkillCandidate(h,skill,u));
      return targets.length?[{hero:h,...entry,targets}]:[];
    }
    if(effectOf(skill,'EFFECT_RETALIATE_1')){
      const recent=new Set([...(S.recentAttackers?.[d.side]||[]),S.pending.a]);
      const targets=S.units.filter(u=>recent.has(u.id)&&baseSkillCandidate(h,skill,u));
      return targets.length?[{hero:h,...entry,targets}]:[];
    }
    return h.id===d.id?[{hero:h,...entry,targets:[d]}]:[];
    });
  });
}
// Manual map targeting shares the existing skill selector, scoped to one defense window.
function beginDefenseSkillTarget(choice,card=null){
  if(!S.pending||!choice)return false;
  const current=defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).find(c=>c.hero.id===choice.hero.id&&c.skillNo===choice.skillNo);
  if(!current||!(effectOf(current.skill,'EFFECT_RETALIATE_1')||effectOf(current.skill,'EFFECT_SWAP_ALLY'))||current.hero.side===S.botSide)return false;
  if(card&&(!(S.hands[current.hero.side]||[]).some(c=>c.uid===card.uid)||!validCardFor(card,current.hero,'def')))return false;
  S.skillTarget={heroId:current.hero.id,skillNo:current.skillNo,skillId:current.skill.id,selected:[],ray:null,cardUid:card?.uid||null,defense:true,defensePending:S.pending};
  S.selected=current.hero;S.mode='skill';hideDefensePopup();hideUnitMenu();reactionBox.style.display='none';
  updateSkillTargetPanel();renderBoard();updateUI();return true;
}
function clearDefenseSkillTarget(){
  if(!S.skillTarget?.defense)return;
  S.skillTarget=null;if(S.mode==='skill')S.mode=null;skillTargetPanel.classList.remove('show');
}
function useDefenseSkill(choice,target,card=null,deferResolve=false){
  const selected=Array.isArray(target)?target:[target];
  if(!S.pending||!choice||!selected.length||selected.length>(choice.skill.target?.maxTargets||1)||
     !defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).some(c=>c.hero.id===choice.hero.id&&c.skillNo===choice.skillNo&&selected.every(u=>c.targets.some(valid=>valid.id===u?.id))))return false;
  const {hero,skill,skillNo}=choice;
  const cardTarget=effectOf(skill,'EFFECT_SWAP_ALLY')?selected[0]:hero;
  if(card&&(!validCardFor(card,cardTarget,'def')||!(S.hands?.[hero.side]||[]).some(c=>c.uid===card.uid)))return false;
  if(CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(skill.star||0,card?.star||0)).winner!=='RESPONSE')return false;
  if(card){S.hands[hero.side]=S.hands[hero.side].filter(c=>c.uid!==card.uid);S.pending.defCard=card;markDuelCardUsed(hero.side,'def');S.pending.defenseSkillStar=skill.star||0;lg('🎴 '+card.name+' gắn với '+skill.name+'.')}
  if(effectOf(skill,'EFFECT_HEAL_1')){
    const amount=EFFECTS.EFFECT_HEAL_1.value;
    selected[0].hp=Math.min(unitSpec(selected[0]).hp,selected[0].hp+amount);
    lg('✨ '+skill.name+' hồi '+amount+' HP cho '+unitSpec(selected[0]).name+' trước khi nhận đòn.');
  }else if(effectOf(skill,'EFFECT_SWAP_ALLY')){
    const d=S.units.find(u=>u.id===S.pending.d),ally=selected[0];
    [d.q,ally.q]=[ally.q,d.q];[d.r,ally.r]=[ally.r,d.r];
    S.pending.replacementTargetId=ally.id;
    lg('✨ '+skill.name+' · '+unitSpec(ally).name+' đổi chỗ với '+unitSpec(hero).name+'.');
  }else if(effectOf(skill,'EFFECT_RETALIATE_1')){
    S.pending.retaliationTargetIds=selected.map(u=>u.id);
  }else if(effectOf(skill,'EFFECT_EVADE_ATTACK')){
    S.pending.cancel=true;S.pending.cancelReason='DODGE';
    lg('✨ '+skill.name+' — Hero né đòn tấn công.');
  }
  markSkillUsed(hero,skillNo);if(!deferResolve)resolveCombat();return true;
}
function finishPhiThanTarget(target){
  const st=S.skillTarget;
  if(!st?.defense||!isSkillCandidate(target))return false;
  const choice=defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).find(c=>c.hero.id===st.heroId&&c.skillNo===st.skillNo);
  if(!choice||!effectOf(choice.skill,'EFFECT_SWAP_ALLY'))return false;
  if(!useDefenseSkill(choice,target,null,true))return false;
  clearDefenseSkillTarget();renderBoard();updateUI();
  const cards=defenseCards(target);
  if(cards.length)showPhiThanDefenseCards(target,cards);else resolveCombat();
  return true;
}
function showPhiThanDefenseCards(target,cards){
  const pending=S.pending;
  hideDefensePopup();defCardList.innerHTML='';
  defPopupTitle.textContent='PLAYER '+target.side+' · PHI THÂN · PHÒNG THỦ';
  defPopupTarget.textContent='Nhận đòn thay EST: '+unitSpec(target).name+' · HP '+target.hp+'/'+unitSpec(target).hp;
  defGuardChoice.style.display='none';defHeroSkillChoice.style.display='none';defEquipChoice.style.display='none';
  defPopupHint.textContent='Chọn bài phòng thủ cho lính nhận đòn thay, hoặc KHÔNG ĐỠ ĐÒN. Thời gian phòng thủ vẫn tiếp tục.';
  cards.forEach(card=>{
    const b=document.createElement('button');b.className='btn mini';b.textContent='🎴 '+card.name+' · '+'★'.repeat(card.star)+' · '+card.text;
    b.onclick=()=>{
      if(S.pending!==pending||target.hp<=0||!S.hands[target.side].some(c=>c.uid===card.uid)||!validCardFor(card,target,'def'))return;
      pending.defCard=card;S.hands[target.side]=S.hands[target.side].filter(c=>c.uid!==card.uid);
      markDuelCardUsed(target.side,'def');lg('🎴 '+unitSpec(target).name+' dùng '+card.name+' sau Phi thân.');resolveCombat();
    };defCardList.appendChild(b);
  });
  defCardList.classList.add('show');positionDefensePopup(target);
}
function showDefensePopup(d){
  if(!S.pending||!d)return;if(S.pending.isPropagationTarget)return hideDefensePopup();clearGuardHighlights();defGuardList.innerHTML='';defCardList.innerHTML='';defGuardList.classList.remove('show');defCardList.classList.remove('show');
  defGuardChoice.style.display='';defEquipChoice.style.display='';
  let guards=guardCandidates(d),cards=defenseCards(d);
  defPopupTitle.textContent='PLAYER '+d.side+' · DEFENSE REACTION';
  defPopupTarget.textContent='Mục tiêu: '+unitSpec(d).name+' · HP '+d.hp+'/'+unitSpec(d).hp+' · Incoming '+S.pending.base+' DMG';
  defGuardChoice.disabled=!guards.length||S.pending.ignoreGuard;defGuardChoice.textContent=S.pending.ignoreGuard?'🛡️ GUARD BỊ VÔ HIỆU':'🛡️ BỘ BINH ĐỠ ĐÒN ('+guards.length+')';
  defEquipChoice.disabled=!cards.length;defEquipChoice.textContent='🎴 TRANG BỊ ĐỠ ĐÒN ('+cards.length+')';
  let choices=defenseSkillChoices(d);defHeroSkillChoice.style.display=choices.length?'block':'none';defHeroSkillChoice.textContent='✨ HERO SKILL ('+choices.length+')';
  defPopupHint.textContent='Chọn cách phòng thủ hoặc KHÔNG ĐỠ ĐÒN để nhận sát thương. Bộ binh đỡ đòn phải ở trong phạm vi 1 ô.';
  positionDefensePopup(d);
}
defGuardChoice.onclick=()=>{
  if(!S.pending)return;
  let d=S.units.find(x=>x.id===S.pending.d),guards=guardCandidates(d);
  if(!guards.length||S.pending.ignoreGuard)return;
  CoreGuardController.begin();
};
defEquipChoice.onclick=()=>{
  if(!S.pending)return;let d=S.units.find(x=>x.id===S.pending.d),cards=defenseCards(d);defGuardList.classList.remove('show');clearGuardHighlights();defCardList.innerHTML='';
  cards.forEach(c=>{let b=document.createElement('button');b.className='btn mini';b.innerHTML=cardHTML(c);b.onclick=()=>{S.pending.defCard=c;S.hands[d.side]=S.hands[d.side].filter(x=>x.uid!==c.uid);markDuelCardUsed(d.side,'def');lg('🎴 Player '+d.side+' dùng '+c.name+' để phòng thủ.');resolveCombat()};defCardList.appendChild(b)});
  defCardList.classList.toggle('show');
};
defHeroSkillChoice.onclick=()=>{
  if(!S.pending)return;
  const d=S.units.find(u=>u.id===S.pending.d),choices=defenseSkillChoices(d);
  defGuardList.classList.remove('show');defCardList.innerHTML='';
  for(const choice of choices){
    if(effectOf(choice.skill,'EFFECT_RETALIATE_1')||effectOf(choice.skill,'EFFECT_SWAP_ALLY')){
      const b=document.createElement('button');b.className='btn mini';
      b.textContent='✨ '+unitSpec(choice.hero).name+' · '+choice.skill.name+' · CHỌN TRÊN MAP';
      b.onclick=()=>beginDefenseSkillTarget(choice);defCardList.appendChild(b);continue;
    }
    const options=choice.targets.map(u=>[u]);
    if((choice.skill.target?.maxTargets||1)>1)for(let i=0;i<choice.targets.length;i++)for(let j=i+1;j<choice.targets.length;j++)options.push([choice.targets[i],choice.targets[j]]);
    for(const targets of options)for(const card of [null,...(S.hands[choice.hero.side]||[]).filter(c=>validCardFor(c,choice.hero,'def'))]){
    const b=document.createElement('button');b.className='btn mini';
    b.textContent='✨ '+unitSpec(choice.hero).name+' · '+choice.skill.name+' → '+targets.map(t=>unitSpec(t).name+' (❤'+t.hp+'/'+unitSpec(t).hp+')').join(' + ')+(card?' + 🎴 '+card.name:'');
    b.disabled=CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(choice.skill.star||0,card?.star||0)).winner!=='RESPONSE';
    b.onclick=()=>useDefenseSkill(choice,targets,card);
    defCardList.appendChild(b);
    }
  }
  defCardList.classList.add('show');
};
defNoDefense.onclick=()=>{if(!S.pending)return;lg('⚔️ Defender chọn không đỡ đòn.');resolveCombat()};

// ===== V7.3 PLAYER-CONTROLLED HERO SKILL TARGETING =====
const boardWrap=CoreDOM.board.wrap;
const skillTargetPanel=document.createElement('div');
skillTargetPanel.className='skillTargetPanel';
skillTargetPanel.dataset.dwId='CORE_UI_SKILL_TARGET';
skillTargetPanel.innerHTML='<div class="skillHead"><div><div class="skillName" data-dw-id="CORE_UI_SKILL_TARGET_NAME">SKILL TARGET</div><div class="skillHint" data-dw-id="CORE_UI_SKILL_TARGET_HINT"></div></div></div><label class="skillEquip" data-dw-id="CORE_UI_SKILL_EQUIP_WRAP">Trang bị tấn công (tùy chọn)<select data-dw-id="CORE_UI_SKILL_EQUIP"><option value="">Không dùng Card</option></select></label><div class="skillBtns"><button type="button" class="btn" data-dw-id="CORE_UI_SKILL_MOVE" style="display:none">👟 DI CHUYỂN</button><button type="button" class="btn" data-dw-id="CORE_UI_SKILL_TARGET_CANCEL">HỦY</button><button type="button" class="btn gold" data-dw-id="CORE_UI_SKILL_TARGET_CONFIRM" disabled>XÁC NHẬN</button></div>';
boardWrap.appendChild(skillTargetPanel);
const SkillTargetDOM=CoreDOM.registerDynamic('skillTarget',{
  panel:skillTargetPanel,
  name:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_TARGET_NAME"]'),
  hint:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_TARGET_HINT"]'),
  moveButton:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_MOVE"]'),
  cancelButton:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_TARGET_CANCEL"]'),
  confirmButton:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_TARGET_CONFIRM"]'),
  equipmentWrap:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_EQUIP_WRAP"]'),
  equipmentSelect:skillTargetPanel.querySelector('[data-dw-id="CORE_UI_SKILL_EQUIP"]')
});
const skillTargetName=SkillTargetDOM.name,skillTargetHint=SkillTargetDOM.hint,skillMoveButton=SkillTargetDOM.moveButton,skillTargetCancel=SkillTargetDOM.cancelButton,skillTargetConfirm=SkillTargetDOM.confirmButton,skillEquipWrap=SkillTargetDOM.equipmentWrap,skillEquipSelect=SkillTargetDOM.equipmentSelect;

function heroDefinition(h){return h?.hero?ContentViews.hero(h.definitionId):null}
function heroSkill(h,n){let id=heroDefinition(h)?.skillIds?.[n-1];return id?ContentViews.skill(id):null}
function heroDefenseReactionSkills(h){let ids=heroDefinition(h)?.skillIds||[];return ids.flatMap((id,i)=>{let skill=ContentViews.skill(id);return skill?.timing==='DEFENSE_REACTION'||skill?.timing==='BOTH'?[{skillNo:i+1,skill}]:[]})}
function heroDefenseReactionSkill(h){return heroDefenseReactionSkills(h)[0]||null}
function unitClassId(u){return unitSpec(u).classId}
function skillNeedsLineLock(skill){return !!skill?.target?.selection?.lineLock}
function rayFrom(hero,target){let dq=target.q-hero.q,dr=target.r-hero.r,ds=-(dq+dr),m=Math.max(Math.abs(dq),Math.abs(dr),Math.abs(ds));if(!m)return null;let v=[dq/m,dr/m];return dirs.find(d=>d[0]===v[0]&&d[1]===v[1])||null}
function onRay(hero,u,ray,range){if(!ray)return false;for(let n=1;n<=range;n++)if(hero.q+ray[0]*n===u.q&&hero.r+ray[1]*n===u.r)return true;return false}
function baseSkillCandidate(hero,skill,u){
  if(!u||u.hp<=0)return false;
  let t=skill.target||{};
  if(t.side==='ALLY'&&u.side!==hero.side)return false;
  if(t.side==='ENEMY'&&u.side===hero.side)return false;
  if(t.side==='SELF'&&u.id!==hero.id)return false;
  if(t.class&&unitClassId(u)!==t.class)return false;
  if(t.unitType==='TROOP'&&u.hero)return false;
  let range=t.range==null?99:t.range;
  if(distU(hero,u)>range)return false;
  if(t.pattern==='LINE'&&!aligned(hero,u,range))return false;
  if(t.requireMissingHp&&u.hp>=unitSpec(u).hp)return false;
  return true;
}
function isSkillCandidate(u){
  let st=S.skillTarget;if(!st)return false;
  let hero=S.units.find(x=>x.id===st.heroId),skill=ContentViews.skill(st.skillId);if(!hero||!skill||!baseSkillCandidate(hero,skill,u))return false;
  if(st.defense){
    if(!S.pending||S.pending!==st.defensePending)return false;
    const choice=defenseSkillChoices(S.units.find(x=>x.id===S.pending.d)).find(c=>c.hero.id===hero.id&&c.skillNo===st.skillNo);
    return !!choice?.targets.some(t=>t.id===u.id);
  }
  if(skillNeedsLineLock(skill)&&st.ray&&!onRay(hero,u,st.ray,skill.target.range))return false;
  return true;
}
function selectedSkillTarget(u){return !!S.skillTarget?.selected?.includes(u.id)}
function updateSkillTargetPanel(){
  let st=S.skillTarget;if(!st){skillTargetPanel.classList.remove('show');return}
  let hero=S.units.find(x=>x.id===st.heroId),skill=ContentViews.skill(st.skillId);if(!hero||!skill)return cancelSkillTarget();
  const manualAdjacent=skill.maneuver?.attackFlow==='SELECT_ADJACENT';
  let count=st.selected.length,max=skill.target?.maxTargets||1;
  skillTargetName.textContent='S'+st.skillNo+' · '+skill.name;
  let rule=skill.target.side==='ALLY'?'Chọn đồng minh':'Chọn mục tiêu địch';
  if(skill.target.class)rule+=' · '+skill.target.class;
  if(skill.target.range!=null)rule+=' · phạm vi '+skill.target.range+' ô';
  if(skillNeedsLineLock(skill))rule+=' · các mục tiêu phải cùng một đường thẳng';
  const cards=st.defense?(effectOf(skill,'EFFECT_SWAP_ALLY')?[]:(S.hands[hero.side]||[]).filter(card=>validCardFor(card,hero,'def'))):(skill.timing==='ACTIVE'||skill.timing==='BOTH'?attackCardsFor(hero):[]);
  if(st.cardUid&&!cards.some(card=>card.uid===st.cardUid))st.cardUid=null;
  skillTargetHint.textContent=manualAdjacent?
    'Chạm ô trống để di chuyển (còn '+remainingMove(hero)+' Move) hoặc đứng yên. Chạm địch kề bên để chọn/bỏ chọn ('+count+'/'+max+'). '+
    (count?'Nhấn TẤN CÔNG để đánh các mục tiêu đã chọn.':'Chọn ít nhất 1 mục tiêu trước khi tấn công.')+
    ' Di chuyển tiếp sẽ bỏ chọn mục tiêu; HỦY trả lại vị trí và Move.':
    rule+' · đã chọn '+count+'/'+max+'. Click mục tiêu để chọn/bỏ chọn.'+
    (st.cardUid&&skillDamageValue(skill)===0?' Card sẽ chuyển hiệu ứng và ★ sang đòn đánh thường kế tiếp của Hero.':'');
  if(skill.maneuver&&!manualAdjacent){skillMoveButton.style.display='block';skillMoveButton.disabled=remainingMove(hero)<=0;skillMoveButton.textContent=st.moving?'👟 CHỌN Ô TRỐNG · HỦY CHỌN':'👟 DI CHUYỂN · còn '+remainingMove(hero)+' ô';skillTargetHint.textContent+=' Có thể di chuyển trước khi chọn mục tiêu; HỦY sẽ trả lại vị trí và Move.'}else skillMoveButton.style.display='none';
  if(skillEquipWrap.firstChild?.nodeType===3)skillEquipWrap.firstChild.nodeValue=st.defense?'Trang bị phòng thủ (tùy chọn)':'Trang bị tấn công (tùy chọn)';
  skillEquipWrap.style.display=cards.length?'block':'none';
  skillEquipSelect.replaceChildren(new Option('Không dùng Card',''));
  cards.forEach(card=>skillEquipSelect.add(new Option(card.name+' · '+'★'.repeat(card.star)+' · '+card.text,card.uid)));
  skillEquipSelect.value=cards.some(card=>card.uid===st.cardUid)?st.cardUid:'';
  skillTargetConfirm.textContent=manualAdjacent?'⚔️ TẤN CÔNG':'XÁC NHẬN';
  const selectedCard=cards.find(card=>card.uid===st.cardUid);
  skillTargetConfirm.disabled=count===0||!!(st.defense&&CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(skill.star||0,selectedCard?.star||0)).winner!=='RESPONSE');
  if(st.defense)skillTargetHint.textContent+=(effectOf(skill,'EFFECT_SWAP_ALLY')?' Chọn 1 lính đồng minh để đổi chỗ; sau đó chọn bài phòng thủ cho lính nếu có.':' Chỉ chọn kẻ địch đã tấn công phe mình.')+' HỦY quay lại phòng thủ; thời gian phòng thủ vẫn tiếp tục.';
  skillTargetPanel.classList.add('show');
}
skillEquipSelect.onchange=()=>{if(S.skillTarget){S.skillTarget.cardUid=skillEquipSelect.value||null;updateSkillTargetPanel()}};
skillMoveButton.onclick=()=>{if(!S.skillTarget)return;S.skillTarget.moving=!S.skillTarget.moving;updateSkillTargetPanel();renderBoard()};
function _beginSkillTargetInternal(n){
  let h=S.selected;if(!h||!h.hero||isSkillUsed(h,n))return;
  let skill=heroSkill(h,n);if(!skill)return;
  if(skill.timing==='DEFENSE_REACTION'||skill.timing==='BOTH'&&S.pending){
    if(!S.pending)return;
    const d=S.units.find(u=>u.id===S.pending.d),choice=defenseSkillChoices(d).find(c=>c.hero.id===h.id&&c.skillNo===n);
    if(choice){if(effectOf(skill,'EFFECT_RETALIATE_1')||effectOf(skill,'EFFECT_SWAP_ALLY'))beginDefenseSkillTarget(choice);else useDefenseSkill(choice,choice.targets.find(u=>u.id===d.id)||choice.targets[0]);}
    return;
  }
  if(h.attacked)return;
  let candidates=S.units.filter(u=>baseSkillCandidate(h,skill,u));
  if(!candidates.length&&!skill.maneuver)return alert('Không có mục tiêu hợp lệ cho skill này.');
  const pendingCard=S.equipPendingActorId===h.id&&attackCardsFor(h).some(c=>c.uid===S.equipSelectedCard?.uid)?S.equipSelectedCard:null;
  const maneuverStart=skill.maneuver?{q:h.q,r:h.r,movementCostSpent:h.movementCostSpent||0,moved:!!h.moved,moveBuff:h.moveBuff||0}:null;
  if(maneuverStart)h.moveBuff=(h.moveBuff||0)+skill.maneuver.moveBonus;
  S.skillTarget={heroId:h.id,skillNo:n,skillId:skill.id,selected:[],ray:null,cardUid:pendingCard?.uid||null,maneuverStart,moving:skill.maneuver?.attackFlow==='SELECT_ADJACENT'};S.mode='skill';hideUnitMenu();updateSkillTargetPanel();renderBoard();updateUI();
}
function handleSkillTargetClick(u){
  if(!S.skillTarget||!isSkillCandidate(u))return;
  let st=S.skillTarget,skill=ContentViews.skill(st.skillId),hero=S.units.find(x=>x.id===st.heroId),max=skill.target?.maxTargets||1;
  if(st.defense&&effectOf(skill,'EFFECT_SWAP_ALLY'))return finishPhiThanTarget(u);
  let idx=st.selected.indexOf(u.id);
  if(idx>=0){st.selected.splice(idx,1);if(skillNeedsLineLock(skill)&&st.selected.length===0)st.ray=null}
  else{
    if(max===1)st.selected=[u.id];
    else if(st.selected.length<max){if(skillNeedsLineLock(skill)&&!st.ray)st.ray=rayFrom(hero,u);st.selected.push(u.id)}
  }
  if(skillNeedsLineLock(skill)&&st.selected.length && !st.ray){let first=S.units.find(x=>x.id===st.selected[0]);st.ray=rayFrom(hero,first)}
  updateSkillTargetPanel();renderBoard();updateUI();
}
function cancelSkillTarget(){let st=S.skillTarget;if(st?.defense){const pending=st.defensePending;clearDefenseSkillTarget();renderBoard();updateUI();if(S.pending===pending&&!S.matchEnded)showDefensePopup(S.units.find(u=>u.id===pending.d));return;}if(st?.maneuverStart){let h=S.units.find(u=>u.id===st.heroId);if(h)Object.assign(h,st.maneuverStart)}S.skillTarget=null;if(S.mode==='skill')S.mode=null;skillTargetPanel.classList.remove('show');renderBoard();updateUI();if(S.selected?.hero&&!S.pending)renderUnitMenu()}
function skillDamageValue(skill){if(effectOf(skill,'EFFECT_DAMAGE_2'))return 2;if(effectOf(skill,'EFFECT_DAMAGE_1'))return 1;return 0}
function commitActiveSkillAction(hero,skill){
  const policy=DW_MODES.get(S.selectedMode)?.actionPolicy;
  if(policy?.activeSkillConsumesAction||policy?.heroAttackSkillConsumesAction&&(skill?.heroAttack===true||skillDamageValue(skill)>0))hero.attacked=true;
}
function beginSkillDamageSequence(hero,skill,targets,skillNo,card=null){
  const damage=skillDamageValue(skill);if(!damage||!targets.length)return false;
  markSkillUsed(hero,skillNo);commitActiveSkillAction(hero,skill);
  if(card){S.hands[hero.side]=S.hands[hero.side].filter(c=>c.uid!==card.uid);markDuelCardUsed(hero.side,'atk');lg('🎴 '+card.name+' gắn vào '+skill.name+' · hiệu ứng áp dụng cho từng mục tiêu.')}
  S.skillSequence={heroId:hero.id,skillId:skill.id,skillNo,targetIds:targets.map(t=>t.id),index:0,damage,card};
  S.skillTarget=null;S.mode=null;skillTargetPanel.classList.remove('show');resolveNextSkillSequenceTarget();return true;
}
function resolveNextSkillSequenceTarget(){
  const seq=S.skillSequence;if(!seq||S.pending)return;
  if(S.matchEnded){S.skillSequence=null;updateUI();return}
  const hero=S.units.find(u=>u.id===seq.heroId),skill=ContentViews.skill(seq.skillId);if(!hero||hero.hp<=0||!skill){S.skillSequence=null;updateUI();return}
  while(seq.index<seq.targetIds.length){
    const targetId=seq.targetIds[seq.index++];const target=S.units.find(u=>u.id===targetId);if(!target||target.hp<=0)continue;
    S.pending={a:hero.id,d:target.id,base:seq.damage,sourceType:'SKILL',skillId:skill.id,skillStar:Number.isInteger(skill.star)?skill.star:null,atkCard:seq.card||null,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:effectOf(skill,'EFFECT_IGNORE_INF_GUARD')||effectOf(seq.card,'EFFECT_IGNORE_INF_GUARD'),isPropagationTarget:false};
    lg('✨ '+skill.name+' → Defense Reaction riêng cho '+unitSpec(target).name+'.');showReaction(true);updateUI();return;
  }
  S.skillSequence=null;S.selected=null;hideUnitMenu();renderBoard();updateUI();
}
function applySkillTarget(){
  let st=S.skillTarget;if(!st)return;
  let hero=S.units.find(x=>x.id===st.heroId),skill=ContentViews.skill(st.skillId);if(!hero||!skill)return cancelSkillTarget();
  const targets=st.selected.map(id=>S.units.find(u=>u.id===id)).filter(Boolean);
  if(st.defense){
    if(!S.pending||S.pending!==st.defensePending||!targets.length||targets.some(t=>!isSkillCandidate(t)))return false;
    const choice=defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).find(c=>c.hero.id===hero.id&&c.skillNo===st.skillNo);
    const card=st.cardUid?(S.hands[hero.side]||[]).find(c=>c.uid===st.cardUid):null;
    if(!choice||(st.cardUid&&!card))return false;
    return useDefenseSkill(choice,targets,card);
  }
  if(S.phase!=='battle'||hero.side!==S.battleSide||hero.hp<=0||hero.attacked||isSkillUsed(hero,st.skillNo)||!targets.length||targets.some(t=>!baseSkillCandidate(hero,skill,t)))return false;
  const card=st.cardUid?(S.hands?.[hero.side]||[]).find(c=>c.uid===st.cardUid):null;
  if(st.cardUid&&(!card||hero.queuedAttackEquipment||!['ACTIVE','BOTH'].includes(skill.timing)||!validCardFor(card,hero,'atk')))return false;
  if(st.maneuverStart){
    const position={q:hero.q,r:hero.r,movementCostSpent:hero.movementCostSpent,moved:hero.moved,moveBuff:hero.moveBuff};
    Object.assign(hero,st.maneuverStart);try{save()}finally{Object.assign(hero,position)}
    hero.turnMoveBuff=(hero.turnMoveBuff||0)+(skill.maneuver?.moveBonus||0);
  }else save();
  if(skillDamageValue(skill)>0){S.equipSelectedCard=null;S.equipPendingActorId=null;return beginSkillDamageSequence(hero,skill,targets,st.skillNo,card)}
  for(let t of targets){
    if(effectOf(skill,'EFFECT_HEAL_1')){let v=EFFECTS.EFFECT_HEAL_1.value;t.hp=Math.min(unitSpec(t).hp,t.hp+v);lg('✨ '+skill.name+' hồi '+v+' HP cho '+unitSpec(t).name)}
    if(effectOf(skill,'EFFECT_MOVE_PLUS_2')){CoreBuffController.addMove(t,2,skill.name);if(skill.duration==='CURRENT_PLAYER_TURN')t.turnMoveBuff=(t.turnMoveBuff||0)+2}
    if(effectOf(skill,'EFFECT_MOVE_PLUS_3')){CoreBuffController.addMove(t,3,skill.name)}
    for(const effectId of skill.effects||[]){const effect=EFFECTS[effectId];if(effect?.type==='MODIFY_DAMAGE'&&effect.operation==='ADD')CoreBuffController.addDamage(t,effect.value||0,skill.name)}
  }
  if(card){
    S.hands[hero.side]=S.hands[hero.side].filter(c=>c.uid!==card.uid);markDuelCardUsed(hero.side,'atk');
    // Support has no damage resolution. Carry the Equipment's attack effect and ★
    // to the acting Hero's next normal Attack, across turn resets.
    hero.queuedAttackEquipment=card;
    lg('🎴 '+card.name+' được giữ cho đòn đánh thường kế tiếp của '+unitSpec(hero).name+'.');
  }
  S.equipSelectedCard=null;S.equipPendingActorId=null;
  markSkillUsed(hero,st.skillNo);commitActiveSkillAction(hero,skill);S.skillTarget=null;S.mode=null;skillTargetPanel.classList.remove('show');S.selected=null;hideUnitMenu();renderBoard();updateUI();
}
skillTargetCancel.onclick=cancelSkillTarget;skillTargetConfirm.onclick=applySkillTarget;

// Override skill entry points so both the local popup and the side HUD use the same targeting flow.
useSkill=(n)=>CoreSkillController.begin(n);
renderSkills=function(){
  skillBar.innerHTML='';if(!S.selected||!S.selected.hero){for(let i=0;i<3;i++){let b=document.createElement('button');b.className='btn skill';b.disabled=true;b.textContent='Skill '+(i+1);skillBar.appendChild(b)}return}
  let h=unitSpec(S.selected);h.skills.forEach((txt,i)=>{let b=document.createElement('button');b.className='btn skill';let active=S.skillTarget?.skillNo===i+1;b.innerHTML='<b>S'+(i+1)+(active?' · TARGETING':'')+'</b><br><span class="muted">'+txt+'</span>';let defensive=heroSkill(S.selected,i+1)?.timing==='DEFENSE_REACTION';b.disabled=(S.battleSide===S.botSide&&!S.pending)||isSkillUsed(S.selected,i+1)||(!defensive&&S.selected.attacked)||(defensive&&!S.pending)||!!(S.skillTarget&&!active);b.onclick=()=>CoreSkillController.begin(i+1);skillBar.appendChild(b)})
};

renderUnitMenu=function(){
  if(S.phase!=='battle'||!S.selected||S.pending||S.battleSide===S.botSide||S.selected.side!==S.battleSide||S.mode==='skill')return hideUnitMenu();
  let u=S.selected,sp=unitSpec(u);unitMenuName.textContent=(u.hero?'HERO · ':'')+sp.name+'  ❤'+u.hp+'/'+sp.hp;unitMoveQuick.disabled=!canMoveFurther(u);unitAttackQuick.disabled=u.attacked||(!hasAttackTarget(u)&&(!u.hero||allHeroSkillsUsed(u)));unitSkillQuick.style.display=u.hero?'block':'none';unitSkillQuick.disabled=!u.hero||allHeroSkillsUsed(u)||u.attacked;unitMenuHint.textContent=u.attacked?'Đơn vị đã kết thúc hành động trong lượt này':movementCostSpent(u)>0?('Đã dùng '+movementCostSpent(u)+' Move · còn '+remainingMove(u)+' · có thể Skill / Attack'):'Có thể Move → Skill/Attack hoặc Attack trực tiếp';unitMenuSkills.innerHTML='';if(u.hero){unitSpec(u).skills.forEach((txt,i)=>{let b=document.createElement('button');b.type='button';b.className='btn';b.innerHTML='<b>S'+(i+1)+'</b> · '+txt;let defensive=heroSkill(u,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(u,i+1)||u.attacked||(defensive&&!S.pending);b.addEventListener('click',()=>{unitMenuSkills.classList.remove('show');CoreSkillController.begin(i+1);hideUnitMenu()});unitMenuSkills.appendChild(b)})}positionUnitMenu(u)
};


/* =====================================================================
   CORE BOARD RENDERER + INPUT ROUTER — v1.0
   Ownership: CORE GAME only.

   Rules:
   - renderBoard() is defined exactly once.
   - Controllers never replace renderBoard().
   - Unit/Hex input enters through CoreInputRouter only.
   - Skill / Attack / Guard / Buff are isolated Core Controllers.
   ===================================================================== */

const CoreBuffController = Object.freeze({
  id: "CORE_CONTROLLER_BUFF",

  addMove(unit, amount, sourceLabel=""){
    unit.moveBuff=(unit.moveBuff||0)+amount;
    lg("✨ "+unitSpec(unit).name+" nhận MOVE +"+amount+(sourceLabel?" · "+sourceLabel:""));
  },

  addDamage(unit, amount, sourceLabel=""){
    unit.damageBuff=(unit.damageBuff||0)+amount;
    lg("✨ "+unitSpec(unit).name+" nhận DAMAGE +"+amount+(sourceLabel?" · "+sourceLabel:""));
  },

  hasVisual(unit){
    return !!((unit.moveBuff||0)||(unit.damageBuff||0));
  },

  renderBeforeUnit(group, unit, cell){
    if(!this.hasVisual(unit))return;
    let ring=document.createElementNS("http://www.w3.org/2000/svg","circle");
    ring.setAttribute("cx",cell.x);ring.setAttribute("cy",cell.y);ring.setAttribute("r",34);
    ring.setAttribute("class","buffRing");group.appendChild(ring);
  },

  renderAfterUnit(group, unit, cell){
    if(!this.hasVisual(unit))return;
    let tag=document.createElementNS("http://www.w3.org/2000/svg","text");
    tag.setAttribute("x",cell.x);tag.setAttribute("y",cell.y-38);tag.setAttribute("class","buffTag");
    tag.textContent=[
      unit.moveBuff?"MOVE +"+unit.moveBuff:"",
      unit.damageBuff?"DMG +"+unit.damageBuff:""
    ].filter(Boolean).join(" · ");
    group.appendChild(tag);
  }
});

const CoreSkillController = Object.freeze({
  id: "CORE_CONTROLLER_SKILL",

  active(){ return S.phase==="battle"&&S.mode==="skill"&&!!S.skillTarget; },

  begin(skillNo){
    if(!this.canBegin(skillNo))return false;
    return GameActionDispatcher.dispatch({type:ACTION_TYPES.BEGIN_SKILL_TARGETING,skillNo});
  },

  canBegin(skillNo){
    if(S.phase!=="battle")return false;
    if(S.battleSide===S.botSide&&!S.pending)return false;
    if(!S.selected || !S.selected.hero || S.selected.hp<=0)return false;
    if(![1,2,3].includes(skillNo))return false;
    const skill=heroSkill(S.selected,skillNo);
    if(!skill||isSkillUsed(S.selected,skillNo))return false;
    if(typeof HeroCore!=='undefined'&&skill.mechanic)return HeroCore.canUse(S.selected,skillNo,skill);
    if(skill.timing==='DEFENSE_REACTION'||skill.timing==='BOTH'&&S.pending)return !!S.pending&&defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).some(c=>c.hero.id===S.selected.id&&c.skillNo===skillNo);
    if(S.pending||S.selected.side!==S.battleSide||S.selected.attacked)return false;
    return true;
  },
  cancel(){ return cancelSkillTarget(); },
  commit(){ return applySkillTarget(); },

  handleUnitClick(unit){
    if(!this.active())return false;
    if(ContentViews.skill(S.skillTarget.skillId)?.maneuver?.attackFlow==='SELECT_ADJACENT'){
      handleSkillTargetClick(unit);return true;
    }
    if(S.skillTarget.moving){S.skillTarget.moving=false;updateSkillTargetPanel()}
    handleSkillTargetClick(unit);
    return true;
  },

  handleHexClick(cell){
    if(!this.active())return false;
    const st=S.skillTarget;
    if(!st.moving||!st.maneuverStart)return true;
    const hero=S.units.find(u=>u.id===st.heroId),cost=hero&&movementCostToCell(hero,cell);
    if(cost==null||unitAt(cell.q,cell.r))return true;
    hero.q=cell.q;hero.r=cell.r;
    hero.movementCostSpent=movementCostSpent(hero)+cost;hero.moved=hero.movementCostSpent>0;
    st.selected=[];st.ray=null;
    if(ContentViews.skill(st.skillId)?.maneuver?.attackFlow!=='SELECT_ADJACENT')st.moving=false;
    updateSkillTargetPanel();renderBoard();updateUI();return true;
  },

  hexClasses(cell, unit){
    if(!this.active())return "";
    if(S.skillTarget.moving&&!unit){
      const hero=S.units.find(u=>u.id===S.skillTarget.heroId);
      return hero&&movementCostToCell(hero,cell)!=null?" hl":"";
    }
    if(!unit)return "";
    let cls="";
    if(isSkillCandidate(unit))cls+=unit.side===S.selected?.side?" skill-valid":" skill-hostile";
    if(selectedSkillTarget(unit))cls+=" skill-selected";
    return cls;
  },

  renderBeforeUnit(group, unit, cell){
    if(!this.active()||!isSkillCandidate(unit))return;
    let ring=document.createElementNS("http://www.w3.org/2000/svg","circle");
    ring.setAttribute("cx",cell.x);ring.setAttribute("cy",cell.y);ring.setAttribute("r",38);
    ring.setAttribute(
      "class",
      "skillTargetRing "+(unit.side===S.selected?.side?"":"hostile")+
      (selectedSkillTarget(unit)?" selected":"")
    );
    group.appendChild(ring);
  }
});

const CoreGuardController = Object.freeze({
  id: "CORE_CONTROLLER_GUARD",

  active(){ return !!(S.guardTargeting&&S.pending); },
  begin(){ return GameActionDispatcher.dispatch({type:ACTION_TYPES.BEGIN_GUARD_TARGETING}); },
  cancel(reopen=true){ return cancelGuardTargeting(reopen); },
  hide(){ return hideGuardTargeting(); },

  target(){
    return this.active()?S.units.find(x=>x.id===S.pending.d)||null:null;
  },

  candidates(){
    let target=this.target();
    return target?guardCandidates(target):[];
  },

  isCandidate(unit){
    return this.candidates().some(x=>x.id===unit.id);
  },

  unitClasses(unit){
    let target=this.target();
    if(!target)return "";
    if(unit.id===target.id)return " guardTarget";
    if(this.isCandidate(unit))return " guardCandidate";
    return "";
  },

  handleUnitClick(unit){
    if(!this.active())return false;
    if(chooseGuardFromMap(unit))return true;
    let target=this.target();
    if(target&&unit.id===target.id){
      this.cancel(true);
      return true;
    }
    // Guard targeting owns the input context; invalid units do nothing.
    return true;
  },

  handleHexClick(){
    if(!this.active())return false;
    this.cancel(true);
    return true;
  }
});

/* CONTROLLER ENTRYPOINT RULE v1.0
   UI/public callers must use CoreAttackController.begin(...) and CoreSkillController.begin(...).
   Low-level targeting starters are private implementation details. */
const CoreAttackController = Object.freeze({
  id: "CORE_CONTROLLER_ATTACK",

  active(){ return S.phase==="battle"&&S.mode==="attack"&&!!S.selected; },

  begin(card=null){
    if(!this.canBegin(card))return false;
    return GameActionDispatcher.dispatch({type:ACTION_TYPES.BEGIN_ATTACK_TARGETING,card});
  },

  canBegin(card=null){
    if(S.phase!=="battle")return false;
    if(S.battleSide===S.botSide)return false;
    if(!S.selected || S.selected.hp<=0)return false;
    if(S.selected.attacked)return false;
    if(typeof HeroCore!=='undefined'&&HeroCore.blocked(S.selected,'attack'))return false;
    return true;
  },

  cancelTargeting(){
    if(!this.active())return false;
    let wasCard=S.attackChoice?.type==="card";
    S.mode=null;S.attackChoice=null;
    renderBoard();updateUI();
    if(wasCard){showAttackPopup(S.selected);renderEquipmentSelect()}
    else renderUnitMenu();
    return true;
  },

  handleUnitClick(unit){
    if(!this.active())return false;
    let attacker=S.selected;
    if(unit.side!==attacker.side){
      if(canAttack(attacker,unit))startAttack(attacker,unit);
      else lg("❌ Mục tiêu nằm ngoài tầm tấn công.");
      return true;
    }
    // Preserve existing behavior: choosing a friendly unit exits the current
    // target focus by selecting that unit through the normal Core flow.
    selectUnit(unit);
    return true;
  },

  handleHexClick(cell){
    if(!this.active())return false;
    if(!unitAt(cell.q,cell.r))return this.cancelTargeting();
    return true;
  }
});

const CoreInputRouter = Object.freeze({
  id: "CORE_INPUT_ROUTER",

  handleUnitClick(unit){
    if(typeof HeroCore!=='undefined'&&HeroCore.selection)return HeroCore.inputUnit(unit);
    if(Date.now()-lastDragEnd<280)return;
    if(S.phase==="battle"&&(S.pending?S.units.find(u=>u.id===S.pending.d)?.side===S.botSide:S.battleSide===S.botSide))return false;

    // Priority is explicit and centralized.
    if(CoreGuardController.active())return CoreGuardController.handleUnitClick(unit);
    if(S.phase==="deploy")return;
    if(CoreSkillController.active())return CoreSkillController.handleUnitClick(unit);
    if(CoreAttackController.active())return CoreAttackController.handleUnitClick(unit);

    return selectUnit(unit);
  },

  handleHexClick(cell){
    if(typeof HeroCore!=='undefined'&&HeroCore.selection)return HeroCore.inputHex(cell);
    if(S.phase==="battle"&&(S.pending?S.units.find(u=>u.id===S.pending.d)?.side===S.botSide:S.battleSide===S.botSide))return false;
    if(CoreGuardController.active())return CoreGuardController.handleHexClick(cell);

    if(S.phase==="deploy"){
      let player=currentDeployPlayer();
      if(player===S.botSide)return false;
      if(cell.zone!==player||unitAt(cell.q,cell.r))return hideDeployMenu();
      if(S.units.filter(u=>u.side===player).length>=6)return;
      return showDeployMenu(cell);
    }

    if(CoreAttackController.active())return CoreAttackController.handleHexClick(cell);
    if(CoreSkillController.active())return CoreSkillController.handleHexClick(cell);

    if(S.phase==="battle"&&S.selected&&S.mode==="move"&&isHighlight(cell)){
      const cost=movementCostToCell(S.selected,cell);if(cost==null)return;
      save();
      S.selected.q=cell.q;S.selected.r=cell.r;
      S.selected.movementCostSpent=movementCostSpent(S.selected)+cost;
      S.selected.moved=S.selected.movementCostSpent>0;S.mode=null;
      renderBoard();updateUI();renderUnitMenu();
      return;
    }
  }
});

