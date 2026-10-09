/* ===== v1.2 PLAY HUB + BOT AI + MATCHMAKING + REMATCH ===== */
// PHASE 3 — Game Over / Rematch are owned by ShellDOM Registry.
const GameOverDOM=ShellDOM.gameOver, RematchDOM=ShellDOM.rematch;
const aiThinking=document.createElement('div');aiThinking.className='aiThinking';aiThinking.textContent='BOT ĐANG TÍNH TOÁN…';document.querySelector('.boardWrap').appendChild(aiThinking);
function isBotSide(p){return S.botSide===p}

const ShellPlayMenuController={
  close(){ShellDOM.playMenu.overlay.classList.remove('show');ShellDOM.playMenu.overlay.setAttribute('aria-hidden','true');ShellDOM.playMenu.overlayBody.innerHTML='';},
  open(title,html){ShellDOM.playMenu.overlayTitle.textContent=title;ShellDOM.playMenu.overlayBody.innerHTML=html;ShellDOM.playMenu.overlay.classList.add('show');ShellDOM.playMenu.overlay.setAttribute('aria-hidden','false');},
  ensureMode(){
    if(S.selectedMode&&ShellModeService.get(S.selectedMode))return true;
    console.error('[PLAY MENU] Missing selected mode; returning to Mode Select');
    ShellFlowController.openModeSelect();
    return false;
  },
  openAI(){
    if(!this.ensureMode())return;
    this.open('ĐẤU VỚI MÁY','<div class="muted">Chọn cấp độ Bot. Bot dùng cùng Core Game / rule Đối Đầu.</div><div class="hubOptions"><button class="hubOption" data-d="easy"><b>DỄ</b><span class="muted">Ưu tiên nước hợp lệ đơn giản, đôi lúc bỏ lỡ cơ hội tối ưu.</span></button><button class="hubOption" data-d="normal"><b>BÌNH THƯỜNG</b><span class="muted">Chọn mục tiêu và vị trí bằng đánh giá chiến thuật.</span></button><button class="hubOption" data-d="hard"><b>KHÓ / GOSU</b><span class="muted">Ưu tiên Hero, đòn kết liễu và vị trí có lợi.</span></button></div>');
    ShellDOM.playMenu.overlayBody.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>startSession({type:'ai',difficulty:b.dataset.d}));
  },
  openCasual(ranked=false){
    if(!this.ensureMode())return;
    const title=ranked?'XẾP HẠNG':'ĐÁNH THƯỜNG';
    this.open(title,'<div class="ratingBox"><span>Rating</span><b>'+S.rating+'</b></div><div class="hubOptions"><button class="hubOption" data-action="auto-match"><b>TỰ GHÉP TRẬN</b><span class="muted">Prototype sẽ tìm đối thủ; nếu chưa có người online sẽ ghép Bot theo Rating.</span></button><button class="hubOption" data-action="create-room"><b>TẠO PHÒNG RIÊNG</b><span class="muted">Sinh Room ID riêng. Online room backend sẽ được nối sau.</span></button></div><div data-role="match-status" class="matchStatus">Chưa bắt đầu.</div>');
    const auto=ShellDOM.playMenu.overlayBody.querySelector('[data-action="auto-match"]');
    const room=ShellDOM.playMenu.overlayBody.querySelector('[data-action="create-room"]');
    if(auto)auto.onclick=()=>beginMatchmaking(ranked);
    if(room)room.onclick=()=>createPrivateRoom(ranked);
  },
  bind(){
    ShellDOM.playMenu.overlayClose.onclick=()=>this.close();
    ShellDOM.playMenu.overlayBack.onclick=()=>this.close();
    ShellDOM.playMenu.overlay.onclick=e=>{if(e.target===ShellDOM.playMenu.overlay)this.close();};
    ShellDOM.playMenu.aiButton.onclick=()=>this.openAI();
    ShellDOM.playMenu.casualButton.onclick=()=>this.openCasual(false);
    ShellDOM.playMenu.rankedButton.onclick=()=>this.openCasual(true);
  }
};
ShellPlayMenuController.bind();
const SHELL_PHASE1_HANDLER_VALIDATION=validateShellPhase1Handlers();
function closeHub(){return ShellPlayMenuController.close()}
function openHub(title,html){return ShellPlayMenuController.open(title,html)}
function ratingBotDifficulty(r){if(r<100)return'easy';if(r<=500)return'normal';return'hard'}
function ratingGain(r){return r<=200?30:r<=500?22:14}
function makeRoomId(prefix='DW'){return prefix+'-'+Math.random().toString(36).slice(2,7).toUpperCase()+'-'+Math.floor(100+Math.random()*900)}
function beginMatchmaking(ranked){let status=ShellDOM.playMenu.overlayBody.querySelector('[data-role="match-status"]');status.textContent='Đang tìm đối thủ online…';setTimeout(()=>{let d=ratingBotDifficulty(S.rating);status.textContent='Chưa có người phù hợp · fallback Bot '+(d==='hard'?'GOSU':d.toUpperCase())+'.';setTimeout(()=>startSession({type:ranked?'ranked':'casual',difficulty:d,ranked}),650)},900)}
function createPrivateRoom(ranked){let id=makeRoomId(ranked?'RANK':'ROOM'),d=ratingBotDifficulty(S.rating);ShellDOM.playMenu.overlayBody.innerHTML='<div class="muted">Room ID</div><div class="roomCode">'+id+'</div><div class="muted" style="margin-top:10px">Backend online chưa kết nối trong playtest này. Bạn có thể giữ ID để test flow hoặc bắt đầu phòng với Bot fallback.</div><div class="hubOptions"><button class="hubOption" data-action="room-bot-start"><b>BẮT ĐẦU PHÒNG THỬ</b><span class="muted">Bot '+d.toUpperCase()+' sẽ thay vị trí đối thủ.</span></button></div>';let btn=ShellDOM.playMenu.overlayBody.querySelector('[data-action="room-bot-start"]');if(btn)btn.onclick=()=>startSession({type:ranked?'ranked-room':'private-room',difficulty:d,ranked,roomId:id})}
function resetMatchState(){S.ready=[false,false];S.dice=[null,null];S.winner=null;S.loser=null;S.selecting=null;S.teams={1:null,2:null};S.hands={1:[],2:[]};S.deployOrder=[];S.deployIndex=0;S.battleSide=null;S.turn=1;S.round=1;S.units=[];S.selected=null;S.mode=null;S.history=[];S.pending=null;S.skillUsed={};S.cardUsed={1:false,2:false};S.skillTarget=null;S.skillSequence=null;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;S.botQueue=null;S.botRunning=false;S.botProfile=null;S.matchEnded=false;S.guardTargeting=false;hideGuardTargeting();hideAttackPopup();hideDefensePopup();hideUnitMenu();hideDeployMenu();reactionBox.style.display='none';log.innerHTML='';ShellDOM.ready.p1State.textContent='Đang chờ';ShellDOM.ready.p2State.textContent='Đang chờ';ShellDOM.ready.p1Button.disabled=false;ShellDOM.ready.p2Button.disabled=false;ShellDOM.dice.p1RollButton.disabled=false;ShellDOM.dice.p2RollButton.disabled=true;ShellDOM.dice.p1Text.textContent=ShellDOM.dice.p2Text.textContent='Chưa tung';ShellDOM.dice.p1Die.textContent=ShellDOM.dice.p2Die.textContent='⚀';ShellDOM.dice.result.textContent='';ShellDOM.dice.rule.textContent='';ShellDOM.dice.continueButton.style.display='none'}
function createRoomSession(cfg){let roomId=cfg.roomId||makeRoomId(cfg.ranked?'RANK':cfg.type==='ai'?'AI':'ROOM');let diff=cfg.difficulty||'normal';return{roomId,modeId:S.selectedMode||'MODE_DUEL_001',roomType:cfg.type||'ai',isRanked:!!cfg.ranked,settings:{botDifficulty:diff},playerRules:{...(ShellModeService.get(S.selectedMode||'MODE_DUEL_001')?.playerRules||{minPlayers:2,maxPlayers:2,requiredPlayersToStart:2})},playerSlots:[{slotId:1,type:'human',name:'PLAYER 1',connected:true,rematchStatus:'PENDING'},{slotId:2,type:'bot',name:'BOT '+diff.toUpperCase(),connected:true,rematchStatus:'READY'}],matchHistory:[],matchCounter:0}}
function activeRoomPlayers(room){return(room?.playerSlots||[]).filter(p=>p.connected)}
function readyRoomPlayers(room){return activeRoomPlayers(room).filter(p=>p.rematchStatus==='READY')}
function roomCanStartRematch(room){if(!room)return false;let active=activeRoomPlayers(room),ready=readyRoomPlayers(room);return active.length>=room.playerRules.minPlayers&&ready.length>=room.playerRules.requiredPlayersToStart}
function startSession(cfg){let m=ShellModeService.get(S.selectedMode);if(!m||m.matchEnabled===false){closeHub();alert('Mode '+(m?.name||'này')+' hiện mới có Play Menu. Gameplay riêng sẽ được bổ sung sau.');return}closeHub();S.roomSession=createRoomSession(cfg);beginNewMatchInRoom()}
function beginNewMatchInRoom(){let room=S.roomSession;if(!room)return;resetMatchState();room.matchCounter+=1;room.playerSlots.forEach(p=>{if(p.connected)p.rematchStatus=p.type==='bot'?'READY':'PENDING'});S.matchSession={matchId:room.roomId+'-M'+String(room.matchCounter).padStart(3,'0'),result:null,rematchState:'PLAYING',contentSnapshot:MatchContentSnapshotBuilder.create(room.modeId)};S.playType=room.roomType;S.botSide=room.playerSlots.find(p=>p.type==='bot'&&p.connected)?.slotId||null;S.botDifficulty=room.settings.botDifficulty||'normal';S.isRanked=room.isRanked;S.roomId=room.roomId;S.selectedMode=room.modeId;S.phase='ready';clearInterval(timer);t=20;ShellDOM.ready.timer.textContent=t;timer=setInterval(()=>{if(S.phase!=='ready')return;ShellDOM.ready.timer.textContent=t;if(t<=0){clearInterval(timer);startDice();return}t--;},1000);show('ready');ShellDOM.global.summary.textContent=(S.isRanked?'Xếp hạng':'Đối Đầu')+' · Room '+room.roomId+' · Match '+S.matchSession.matchId+' · Content '+S.matchSession.contentSnapshot.manifestHash+' · Player 2 = Bot '+S.botDifficulty.toUpperCase();if(isBotSide(2)){ShellDOM.ready.p2State.textContent='BOT · Đã sẵn sàng';ShellDOM.ready.p2Button.disabled=true;S.ready[1]=true}ShellDOM.playMenu.rating.textContent=S.rating;}
const _markReady_v12=markReady;markReady=function(i){_markReady_v12(i)};
const _roll_v12=roll;roll=function(p){_roll_v12(p);if(p===1&&isBotSide(2)&&S.phase==='dice'){setTimeout(()=>{if(S.dice[1]==null)_roll_v12(2)},420)}};
function botTeam(){const d=S.botDifficulty,heroes=HeroRegistry.list();if(!heroes.length)throw new Error('No playable Hero');const hero=heroes[Math.floor(Math.random()*heroes.length)];const troops=d==='hard'?{inf:2,arch:2,cav:1}:d==='normal'?{inf:2,arch:1,cav:2}:{inf:1,arch:2,cav:2};return{heroDefinitionId:hero.id,troops}}
const _beginTeam_v12=beginTeam;beginTeam=function(p){if(isBotSide(p)){S.phase='team';S.selecting=p;show('team');ShellDOM.team.title.textContent='BOT — ĐANG CHỌN ĐỘI HÌNH';ShellDOM.team.subtitle.textContent='AI '+S.botDifficulty.toUpperCase()+' đang xây đội…';const hand=document.getElementById('teamEquipmentHand');if(hand)hand.innerHTML='<div class="card dim">HIDDEN</div>'.repeat(5);setTimeout(()=>{S.teams[p]=botTeam();lg('🤖 Bot đã chọn đội hình.');if(p===S.loser)beginTeam(S.winner);else beginDeploy()},450);return}_beginTeam_v12(p)};
const _dealCards_v12=dealCards;dealCards=function(){_dealCards_v12();if(isBotSide(2)){ShellDOM.deal.p2Hand.innerHTML='<div class="card dim">HIDDEN</div>'.repeat(5);summary.textContent='Player nhận 5 Equipment. Hand của Bot được ẩn trong trận AI.'}}
function botDeploy(){if(S.phase!=='deploy'||!isBotSide(currentDeployPlayer()))return;let p=currentDeployPlayer(),team=S.teams[p],available=cells.filter(c=>c.zone===p&&!unitAt(c.q,c.r));let borderBias=(c)=>Math.abs(c.r);available.sort((a,b)=>S.botDifficulty==='easy'?Math.random()-.5:(borderBias(a)-borderBias(b)));let picks=[];let heroCell=S.botDifficulty==='hard'?available.slice().sort((a,b)=>Math.abs(b.r)-Math.abs(a.r))[0]:available.shift();picks.push({hero:true,definitionId:team.heroDefinitionId,c:heroCell});available=available.filter(c=>c!==heroCell);for(let [kind,n] of Object.entries(team.troops))for(let i=0;i<n;i++){let c=available.shift();if(c)picks.push({hero:false,kind,c})}picks.forEach(x=>{if(x.hero){let h=ContentViews.hero(x.definitionId);S.units.push(createRuntimeEntityInstance({definitionId:h.id,side:p,hero:true,kind:CLASS_KIND[h.class],q:x.c.q,r:x.c.r}))}else{let sp=TROOPS[x.kind];S.units.push(createRuntimeEntityInstance({definitionId:sp.canonicalId,side:p,hero:false,kind:x.kind,q:x.c.q,r:x.c.r}))}});renderBoard();updateUI();lg('🤖 Bot đã triển khai '+picks.length+' quân.');setTimeout(()=>mainAction(),500)}
const _beginDeploy_v12=beginDeploy;beginDeploy=function(){_beginDeploy_v12();setTimeout(botDeploy,450)};
const _mainAction_v12=mainAction;mainAction=function(){_mainAction_v12();if(S.phase==='deploy')setTimeout(botDeploy,450);if(S.phase==='battle')setTimeout(scheduleBotTurn,500)};
const _endTurn_v12=endTurn;endTurn=function(){const changed=_endTurn_v12();if(changed)setTimeout(scheduleBotTurn,450);return changed};

