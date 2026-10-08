/* Training controls configure scenarios; normal Core still resolves every action. */
const TrainingMode={
  id:'MODE_TRAINING_001',placement:null,unlocked:{1:new Set(),2:new Set()},
  active(){return S.selectedMode===this.id&&S.phase==='battle'},
  busy(){return !!(S.pending||S.heroSequence||HeroCore.selection||S.equipmentReaction||S.postHitReaction||CombatFlowUI.state)},
  start(){
    CombatFlowUI.close();resetMatchState();ShellGameOverController.close();closeHub();
    S.selectedMode=this.id;S.roomSession=null;S.matchSession=null;S.phase='battle';S.botSide=null;S.playType='local';S.battleSide=1;S.winner=1;S.loser=2;S.turn=1;S.round=1;
    this.placement=null;this.unlocked={1:new Set(),2:new Set()};buildCells();show('game');renderBoard();updateUI();this.configure('unit');
  },
  configure(kind){
    if(!this.active()||this.busy())return false;
    this.dialog.replaceChildren();const title=document.createElement('h2');title.textContent=kind==='unit'?'THÊM HERO / LÍNH':'THÊM TRANG BỊ';this.dialog.append(title);
    const side=document.createElement('select');side.setAttribute('aria-label','Phe');for(const p of [1,2])side.add(new Option('Phe '+p,p));
    const choice=document.createElement('select');choice.setAttribute('aria-label',kind==='unit'?'Hero hoặc lính':'Trang bị');
    const defs=kind==='unit'?[...HeroRegistry.list().map(d=>({id:d.id,name:ContentViews.hero(d.id).name,hero:true})),...UnitRegistry.list().map(d=>({id:d.id,name:ContentViews.unit(d.id).name,hero:false}))]:EquipmentRegistry.list().map(d=>({id:d.id,name:ContentViews.equipment(d.id)?.name||d.id}));
    for(const d of defs)choice.add(new Option((kind==='unit'?(d.hero?'Hero · ':'Lính · '):'')+d.name,d.id));
    this.dialog.append(side,choice,HeroSkillUI.button(kind==='unit'?'CHỌN Ô TRIỂN KHAI':'THÊM',()=>{const p=Number(side.value),def=defs.find(d=>d.id===choice.value);this.dialog.close();if(kind==='unit'){this.placement={side:p,...def};hideUnitMenu();S.selected=null;S.mode=null}else{this.unlocked[p].add(def.id);this.refill()}updateUI()}),HeroSkillUI.button('HỦY',()=>this.dialog.close()));this.dialog.showModal();return true;
  },
  place(cell){
    const d=this.placement;if(!d||!this.active()||unitAt(cell.q,cell.r)||cell.blocked)return false;
    S.units.push(createRuntimeEntityInstance({definitionId:d.id,hero:d.hero,side:d.side,q:cell.q,r:cell.r}));this.placement=null;renderBoard();updateUI();return true;
  },
  refill(){if(!this.active())return;for(const side of [1,2])for(const id of this.unlocked[side])if(!S.hands[side].some(c=>c.equipmentId===id))S.hands[side].push(createEquipmentCardInstance(id,side))},
  refresh(){if(!this.active()||this.busy())return false;this.placement=null;S.skillUsed={};S.duelUsage=null;resetTurnFlags();renderBoard();updateUI();return true},
  exit(){this.placement=null;this.dialog.close();CombatFlowUI.close();resetMatchState();S.roomSession=null;S.matchSession=null;S.selectedMode=null;ShellGameOverController.close();this.toolbar.hidden=true;ShellFlowController.openModeSelect()},
  sync(){
    this.toolbar.hidden=!this.active();if(!this.active())return;this.refill();
    this.label.textContent='ĐẤU TẬP · Lượt công phe '+S.battleSide+(this.placement?' · Chọn hex trống cho '+this.placement.name:'');
    for(const b of this.toolbar.querySelectorAll('[data-training-edit]'))b.disabled=this.busy();
  }
};
TrainingMode.dialog=document.createElement('dialog');TrainingMode.dialog.className='trainingDialog';document.body.append(TrainingMode.dialog);
TrainingMode.toolbar=document.createElement('div');TrainingMode.toolbar.className='trainingToolbar';TrainingMode.toolbar.hidden=true;TrainingMode.label=document.createElement('strong');TrainingMode.toolbar.append(TrainingMode.label);
for(const [name,fn] of [['Thêm quân',()=>TrainingMode.configure('unit')],['Thêm trang bị',()=>TrainingMode.configure('card')],['Đổi lượt',()=>{TrainingMode.placement=null;endTurn()}],['Làm mới lượt',()=>TrainingMode.refresh()],['Hủy triển khai',()=>{TrainingMode.placement=null;updateUI()}]]){const b=HeroSkillUI.button(name,fn);b.dataset.trainingEdit='1';TrainingMode.toolbar.append(b)}
TrainingMode.toolbar.append(HeroSkillUI.button('Thoát trận',()=>TrainingMode.exit()));document.getElementById('gameScreen').append(TrainingMode.toolbar);
const trainingEntry=HeroSkillUI.button('ĐẤU TẬP',()=>TrainingMode.start());trainingEntry.id='trainingModeButton';ShellDOM.mode.duelButton.parentElement.append(trainingEntry);
boardSvg.addEventListener('click',e=>{if(!TrainingMode.active()||!TrainingMode.placement)return;const hex=e.target.closest('[data-q][data-r]');e.stopImmediatePropagation();if(hex)TrainingMode.place(cells.find(c=>c.q===Number(hex.dataset.q)&&c.r===Number(hex.dataset.r)))},true);
const _trainingUsed=isSkillUsed;isSkillUsed=function(h,n){return TrainingMode.active()?false:_trainingUsed(h,n)};
const _trainingMark=markSkillUsed;markSkillUsed=function(h,n){if(!TrainingMode.active())return _trainingMark(h,n)};
const _trainingTick=DuelTurnClock.tick;DuelTurnClock.tick=function(){if(TrainingMode.active())return;return _trainingTick.call(this)};
const _trainingUpdate=updateUI;updateUI=function(){if(TrainingMode.active()){TrainingMode.refill();if(!TrainingMode.busy())for(const u of S.units)u.attacked=false;}const r=_trainingUpdate();TrainingMode.sync();return r};
