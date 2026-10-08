function show(name){
  const target=screens[name];
  if(!target){
    console.error('[SHELL FLOW] Unknown or missing screen:',name);
    return false;
  }
  Object.values(screens).filter(Boolean).forEach(x=>x.classList.remove('active'));
  target.classList.add('active');
  phaseLabel.textContent=name==='playmenu'?'PLAY MENU':name==='mode'?'MODE SELECT':name==='ready'?'READY CHECK':name==='dice'?'ROLL DICE':name==='team'?'TEAM SELECT':name==='deal'?'EQUIPMENT DEAL':S.phase==='deploy'?'DEPLOYMENT':'BATTLE';
  return true;
}
function lg(t){DebugDOM.log.innerHTML='<div>• '+t+'</div>'+DebugDOM.log.innerHTML}
function dieGlyph(n){return ['','⚀','⚁','⚂','⚃','⚄','⚅'][n]}
const MODE_UI={
  MODE_DUEL_001:{badge:'CÓ THỂ CHƠI',badgeClass:'live',meta:['1 Hero + 5 Lính','Người đi sau chọn và xếp trước','Lượt công 180s · phản ứng thủ 30s'],rule:'Hạ Hero địch để thắng. Người đi trước không Attack trong 5 lượt liên tiếp sẽ thua.'},
  MODE_WAR_GOD_001:{badge:'ĐANG PHÁT TRIỂN',badgeClass:'soon',meta:['Map lớn hơn / camera mở rộng','Equipment, Event và Terrain riêng','Win/Lose Rule riêng theo Mode'],rule:'Mode đang phát triển. Core Hero · Lính · Equipment được tái sử dụng, nhưng Rule/Map/Event sẽ được cấu hình riêng.'}
};

const ShellModeService=Object.freeze({
  normalize(modeId,registered){
    if(!registered)return null;
    const shellEnabled=registered.shellEnabled ?? registered.enabled ?? true;
    const matchEnabled=registered.matchEnabled ?? false;
    return Object.freeze({
      ...registered,
      id:modeId,
      enabled:shellEnabled!==false,
      shellEnabled:shellEnabled!==false,
      matchEnabled:matchEnabled!==false
    });
  },
  get(modeId){
    if(!modeId)return null;
    const registered=(typeof DW_MODES!=='undefined'&&DW_MODES&&typeof DW_MODES.get==='function')?DW_MODES.get(modeId):null;
    return this.normalize(modeId,registered);
  },
  isPlayable(modeId){
    const m=this.get(modeId);
    return !!m&&m.enabled&&m.matchEnabled;
  }
});

function configurePlayMenuForMode(modeId=S.selectedMode){
  const m=ShellModeService.get(modeId);
  ShellDOM.playMenu.modeLabel.textContent=m?('MODE · '+m.name.toUpperCase()):'CHƯA CHỌN MODE';
  const playable=!!m&&m.enabled!==false&&m.matchEnabled!==false;
  [ShellDOM.playMenu.aiButton,ShellDOM.playMenu.casualButton,ShellDOM.playMenu.rankedButton].forEach(b=>{b.disabled=!playable});
  if(!playable){
    ShellDOM.global.summary.textContent=(m?.name||'Mode')+': gameplay của Mode này chưa được mở.';
  }
  return playable;
}

const ShellFlowController={
  pendingModeId:null,

  openModeConfirm(modeId){
    const m=ShellModeService.get(modeId);
    if(!m){console.error('[SHELL MODE] Unknown mode:',modeId);return false;}
    this.pendingModeId=modeId;
    const ui=MODE_UI[modeId]||{badge:m.enabled?'CÓ THỂ CHƠI':'CHƯA MỞ',badgeClass:m.enabled?'live':'soon',meta:[],rule:'Mode sử dụng rule set riêng.'};
    ShellDOM.modeConfirm.title.textContent=m.name;
    ShellDOM.modeConfirm.badge.textContent=ui.badge;
    ShellDOM.modeConfirm.badge.className='modeBadge '+ui.badgeClass;
    ShellDOM.modeConfirm.meta.innerHTML=ui.meta.map(x=>'<span>'+x+'</span>').join('');
    ShellDOM.modeConfirm.rule.textContent=ui.rule;
    ShellDOM.modeConfirm.playButton.disabled=!m.enabled;
    ShellDOM.modeConfirm.playButton.textContent=m.enabled?(m.matchEnabled===false?'MỞ PLAY MENU':'CHỌN '+m.name.toUpperCase()):'CHƯA MỞ';
    ShellDOM.modeConfirm.overlay.classList.add('show');
    ShellDOM.modeConfirm.overlay.setAttribute('aria-hidden','false');
    return true;
  },

  closeModeConfirm(){
    this.pendingModeId=null;
    ShellDOM.modeConfirm.overlay.classList.remove('show');
    ShellDOM.modeConfirm.overlay.setAttribute('aria-hidden','true');
  },

  selectMode(modeId){
    const m=ShellModeService.get(modeId);
    if(!m||m.enabled===false){console.error('[SHELL MODE] Invalid or disabled mode:',modeId);return false;}
    // Commit Mode selection before any visual transition.
    S.selectedMode=modeId;
    S.phase='playmenu';
    this.pendingModeId=null;
    ShellDOM.modeConfirm.overlay.classList.remove('show');
    ShellDOM.modeConfirm.overlay.setAttribute('aria-hidden','true');
    configurePlayMenuForMode(modeId);
    if(!show('playmenu'))return false;
    ShellDOM.global.summary.textContent='Mode: '+m.name+' · Chọn kiểu trận trong Play Menu.';
    return true;
  },

  confirmPendingMode(){
    const modeId=this.pendingModeId;
    if(!modeId){console.error('[SHELL MODE] No pending mode to confirm');return false;}
    return this.selectMode(modeId);
  },

  openModeSelect(){
    this.pendingModeId=null;
    ShellDOM.modeConfirm.overlay.classList.remove('show');
    S.phase='mode';
    show('mode');
    ShellDOM.global.summary.textContent='Chọn Mode chơi.';
  },

  bind(){
    ShellDOM.mode.duelButton.onclick=()=>this.openModeConfirm('MODE_DUEL_001');
    ShellDOM.mode.warGodButton.onclick=()=>this.openModeConfirm('MODE_WAR_GOD_001');
    ShellDOM.modeConfirm.playButton.onclick=()=>this.confirmPendingMode();
    ShellDOM.modeConfirm.backButton.onclick=()=>this.closeModeConfirm();
    ShellDOM.modeConfirm.closeButton.onclick=()=>this.closeModeConfirm();
    ShellDOM.modeConfirm.overlay.onclick=e=>{if(e.target===ShellDOM.modeConfirm.overlay)this.closeModeConfirm();};
    ShellDOM.playMenu.changeModeButton.onclick=()=>this.openModeSelect();
  }
};

ShellFlowController.bind();
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&S.guardTargeting){cancelGuardTargeting(true);return;}
  if(e.key==='Escape'&&ShellDOM.modeConfirm.overlay.classList.contains('show'))ShellFlowController.closeModeConfirm();
});

let t=20, timer=setInterval(()=>{
  if(S.phase!=='ready')return;
  ShellDOM.ready.timer.textContent=t;
  if(t<=0){clearInterval(timer);startDice();return;}
  t--;
},1000);

function markReady(i){
  S.ready[i]=true;
  const state=i===0?ShellDOM.ready.p1State:ShellDOM.ready.p2State;
  const button=i===0?ShellDOM.ready.p1Button:ShellDOM.ready.p2Button;
  state.textContent='Đã sẵn sàng';
  button.disabled=true;
  if(S.ready.every(Boolean)){clearInterval(timer);setTimeout(startDice,300);}
}
ShellDOM.ready.p1Button.onclick=()=>markReady(0);
ShellDOM.ready.p2Button.onclick=()=>markReady(1);

function startDice(){
  S.phase='dice';show('dice');
  ShellDOM.global.summary.textContent='Roll Dice: người đi sau chọn đội và xếp trước; người thắng Roll đi trước.';
}
function roll(p){
  const v=1+Math.floor(Math.random()*6);S.dice[p-1]=v;
  const die=p===1?ShellDOM.dice.p1Die:ShellDOM.dice.p2Die;
  const txt=p===1?ShellDOM.dice.p1Text:ShellDOM.dice.p2Text;
  die.textContent=dieGlyph(v);txt.textContent=v+' điểm';
  if(p===1){ShellDOM.dice.p1RollButton.disabled=true;ShellDOM.dice.p2RollButton.disabled=false;}
  else{ShellDOM.dice.p2RollButton.disabled=true;finishDice();}
}
ShellDOM.dice.p1RollButton.onclick=()=>roll(1);
ShellDOM.dice.p2RollButton.onclick=()=>roll(2);
function finishDice(){
  const [a,b]=S.dice;
  if(a===b){
    ShellDOM.dice.result.textContent='HÒA!';ShellDOM.dice.rule.textContent='Cả hai tung lại.';
    setTimeout(()=>{S.dice=[null,null];ShellDOM.dice.p1Text.textContent=ShellDOM.dice.p2Text.textContent='Chưa tung';ShellDOM.dice.p1Die.textContent=ShellDOM.dice.p2Die.textContent='⚀';ShellDOM.dice.p1RollButton.disabled=false;ShellDOM.dice.p2RollButton.disabled=true;ShellDOM.dice.result.textContent='';ShellDOM.dice.rule.textContent='';},900);
    return;
  }
  S.winner=a>b?1:2;S.loser=S.winner===1?2:1;
  ShellDOM.dice.result.textContent='PLAYER '+S.winner+' THẮNG ROLL DICE';
  ShellDOM.dice.rule.textContent='P'+S.loser+' chọn Hero + Equipment và xếp quân trước. P'+S.winner+' đi lượt đầu.';
  ShellDOM.dice.continueButton.style.display='inline-block';
}
ShellDOM.dice.continueButton.onclick=()=>beginTeam(S.loser);

let tempHeroDefinitionId='HERO_INF_RODOC', tempTroops={inf:0,arch:0,cav:0};
function beginTeam(p){
  S.phase='team';S.selecting=p;show('team');
  ShellDOM.team.title.textContent='PLAYER '+p+' — CHỌN ĐỘI HÌNH';
  ShellDOM.team.subtitle.textContent=(p===S.loser?'Người đi sau chọn trước':'Người đi trước chọn sau')+' · 1 Hero + đúng 5 lính';
  if(S.teams[p]){tempHeroDefinitionId=S.teams[p].heroDefinitionId||HERO_KEY[S.teams[p].hero]||'HERO_INF_RODOC';tempTroops={...S.teams[p].troops};}
  else{tempHeroDefinitionId='HERO_INF_RODOC';tempTroops={inf:0,arch:0,cav:0};}
  renderTeamPicker();
}
function renderTeamPicker(){
  if(!HeroRegistry.list().some(h=>h.id===tempHeroDefinitionId))tempHeroDefinitionId=HeroRegistry.list()[0]?.id||null;
  ShellDOM.team.heroChoices.innerHTML='';
  HeroRegistry.list().forEach(def=>{let h=ContentViews.hero(def.id);let d=document.createElement('button');d.className='choice'+(tempHeroDefinitionId===def.id?' on':'');d.dataset.heroClass=h.class;d.innerHTML='<div class="sym">'+h.sym+'</div><b>'+h.name+'</b><div class="muted">HP '+h.stats.hp+' · '+({INF:'Bộ binh',CAV:'Kỵ binh',ARCH:'Cung thủ',ALCH:'Giả kim thuật sư'}[h.class]||h.class)+'</div>';d.onclick=()=>{tempHeroDefinitionId=def.id;renderTeamPicker()};ShellDOM.team.heroChoices.appendChild(d)});
  ShellDOM.team.troopChoices.innerHTML='';
  Object.entries(TROOPS).forEach(([k,u])=>{let d=document.createElement('div');d.className='choice';d.innerHTML='<div class="sym">'+u.sym+'</div><b>'+u.name+'</b><div class="muted">HP '+u.hp+' · Move '+u.move+'</div><div class="countCtl"><button class="btn" data-k="'+k+'" data-d="-1">−</button><b>'+tempTroops[k]+'</b><button class="btn" data-k="'+k+'" data-d="1">+</button></div>';ShellDOM.team.troopChoices.appendChild(d)});
  ShellDOM.team.troopChoices.querySelectorAll('button').forEach(b=>b.onclick=()=>{let k=b.dataset.k,d=+b.dataset.d,total=Object.values(tempTroops).reduce((a,b)=>a+b,0);if(d>0&&total>=5)return;tempTroops[k]=Math.max(0,tempTroops[k]+d);renderTeamPicker()});
  ShellDOM.team.troopTotal.textContent=Object.values(tempTroops).reduce((a,b)=>a+b,0);
}
ShellDOM.team.confirmButton.onclick=()=>{
  const total=Object.values(tempTroops).reduce((a,b)=>a+b,0);if(total!==5)return alert('Phải chọn đúng 5 lính.');
  S.teams[S.selecting]={heroDefinitionId:tempHeroDefinitionId,troops:{...tempTroops}};
  if(S.selecting===S.loser)beginTeam(S.winner);else dealCards();
};
function cardHTML(c,dim=false,sel=false){
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeSource=id=>{const source=AssetResolver.source(id);return typeof source==='string'&&/^(?:\.\/|assets\/|https:\/\/|data:image\/)/.test(source)?source:''};
  const art=safeSource(c.assets?.art),frame=safeSource(c.assets?.frame),icon=safeSource(c.assets?.icon);
  const group=Object.values(EQUIPMENT_GROUPS).find(g=>g.id===c.groupId||g.classId===c.classId||CLASS_RUNTIME[g.classId]===c.cls);
  const image=(src,cls)=>src?'<img class="'+cls+'" src="'+esc(src)+'" alt="" loading="lazy" onerror="this.hidden=true">':'';
  return '<div class="card '+esc(c.type)+(dim?' dim':'')+(sel?' sel':'')+'" data-equipment-id="'+esc(c.equipmentId||c.canonicalId||c.id)+'" data-equipment-group="'+esc(group?.id)+'">'+image(frame,'equipmentFrame')+image(art,'equipmentArt')+'<div class="equipmentLabel">'+image(icon,'equipmentIcon')+'<b>'+esc(c.name)+'</b><div class="star">'+('★'.repeat(c.star))+'</div><div class="muted">'+esc(group?.name)+' · '+(c.type==='atk'?'Tấn công':c.type==='def'?'Phòng thủ':'Công và thủ')+'</div></div><div class="muted equipmentText">'+esc(c.text)+'</div></div>';
}

function dealCards(){
  S.phase='deal';show('deal');
  const mode=DW_MODES.get(S.selectedMode);const deckId=S.matchSession?.contentSnapshot?.deck?.id||mode?.contentPolicy?.deckId||'DECK_DUEL_STANDARD_001';const startingHand=mode?.cardRules?.startingHand??5;
  for(let p of [S.loser,S.winner])S.hands[p]=DeckRuntimeBuilder.dealStartingHand(deckId,p,startingHand);
  ShellDOM.deal.p1Hand.innerHTML=S.hands[1].map(c=>cardHTML(c)).join('');
  ShellDOM.deal.p2Hand.innerHTML=S.hands[2].map(c=>cardHTML(c)).join('');
  summary.textContent=DeckRuntimeBuilder.buildEquipmentIds(deckId).length?'Mỗi Player nhận tối đa '+startingHand+' trang bị. Không rút thêm.':'Bộ trang bị mới đang được xây dựng. Hiện tại hai bên bắt đầu với tay bài trống.'
}
ShellDOM.deal.toDeployButton.onclick=()=>beginDeploy();

