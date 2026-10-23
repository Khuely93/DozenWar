async function install(page){
 await page.evaluate(()=>{
  const clean=()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());ShellPlayMenuController.close();ShellFlowController.closeModeConfirm();ShellGameOverController.close();resetMatchState();clearInterval(timer);DuelTurnClock.stop();S.botSide=null;S.roomSession=null;S.matchSession=null;document.querySelector('.duelMatchDetails').open=false;};
  const battle=(hero='Kazu',enemy='Rodoc')=>{
   clean();S.selectedMode='MODE_DUEL_001';S.phase='battle';S.battleSide=1;S.winner=1;S.loser=2;S.botSide=null;
   S.roomSession=createRoomSession({type:'private-room',difficulty:'normal'});S.roomSession.roomId='UI-REFERENCE';S.roomSession.playerSlots[1].type='human';S.roomSession.playerSlots[1].name='PLAYER 2';
   S.matchSession={matchId:'UI-REFERENCE-M001',result:null,rematchState:'PLAYING'};
   const make=(name,side,q,r)=>{const d=HeroRegistry.list().find(d=>ContentViews.hero(d.id).name===name);return createRuntimeEntityInstance({definitionId:d.id,hero:true,side,q,r})};
   const a=make(hero,1,0,1),d=make(enemy,2,1,0),g=createRuntimeEntityInstance({definitionId:'UNIT_INF_001',hero:false,side:2,q:1,r:-1});
   S.units=[a,d,g,...[['UNIT_INF_001',-1,1],['UNIT_ARCH_001',-2,2],['UNIT_CAV_001',0,2]].map(([definitionId,q,r])=>createRuntimeEntityInstance({definitionId,side:1,hero:false,q,r})),createRuntimeEntityInstance({definitionId:'UNIT_ARCH_001',side:2,hero:false,q:0,r:-2}),createRuntimeEntityInstance({definitionId:'UNIT_CAV_001',side:2,hero:false,q:2,r:-2})];
   S.hands={1:['EQUIP_INF_ATK_001','EQUIP_INF_ATK_005','EQUIP_INF_ATK_006','EQUIP_COMMON_ATK_003','EQUIP_INF_DEF_001'].map(id=>createEquipmentCardInstance(id,1)),2:['EQUIP_INF_DEF_001','EQUIP_ARCH_DEF_001','EQUIP_CAV_DEF_002','EQUIP_COMMON_DEF_001','EQUIP_COMMON_BOTH_002'].map(id=>createEquipmentCardInstance(id,2))};
   S.teams={1:{heroDefinitionId:a.definitionId,troops:{inf:1,arch:1,cav:1}},2:{heroDefinitionId:d.definitionId,troops:{inf:1,arch:1,cav:1}}};
   show('game');resetTurnFlags();DuelTurnClock.turnRemainingMs=180000;DuelTurnClock.display();renderBoard();updateUI();DuelBoardLayout.fit();return{a,d,g};
  };
  const deploy=(filled=false)=>{clean();S.selectedMode='MODE_DUEL_001';S.loser=1;S.winner=2;S.botSide=null;S.teams={1:{heroDefinitionId:'HERO_INF_KAZU',troops:{inf:3,arch:1,cav:1}},2:{heroDefinitionId:'HERO_INF_RODOC',troops:{inf:3,arch:1,cav:1}}};beginDeploy();if(filled){const zone=cells.filter(c=>c.zone===1);S.units=['HERO_INF_KAZU','UNIT_INF_001','UNIT_INF_001','UNIT_INF_001','UNIT_ARCH_001','UNIT_CAV_001'].map((definitionId,i)=>createRuntimeEntityInstance({definitionId,hero:i===0,side:1,q:zone[i].q,r:zone[i].r}));renderBoard();updateUI()}DuelBoardLayout.fit();};
  const result=(winner=1,ranked=false)=>{battle();S.isRanked=ranked;S.rating=250;S.botSide=2;S.botDifficulty='normal';S.roomSession.playerSlots[1].type='bot';S.roomSession.playerSlots[1].name='BOT NORMAL';showGameOver({ended:true,resultType:winner==null?'DRAW':'WIN',winnerSide:winner,reason:'HERO_DEATH'});};
  window.DW_UI_CAPTURE={clean,battle,deploy,result};
 });
 await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
}
const offline=[
 ['01-mode','Chọn chế độ chơi','Menu',()=>{DW_UI_CAPTURE.clean();ShellFlowController.openModeSelect()}],
 ['02-mode-confirm','Xác nhận chế độ Đối Đầu','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.openModeSelect();ShellFlowController.openModeConfirm('MODE_DUEL_001')}],
 ['03-mode-locked','Thông tin chế độ Chiến Thần','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.openModeSelect();ShellFlowController.openModeConfirm('MODE_WAR_GOD_001')}],
 ['04-play-hub','Chọn loại trận AI / Thường / Xếp hạng','Menu',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001')}],
 ['05-ai-difficulty','Chọn độ khó Bot','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001');ShellPlayMenuController.openAI()}],
 ['06-casual','Menu đánh thường','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001');ShellPlayMenuController.openCasual(false)}],
 ['07-ranked','Menu xếp hạng','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001');ShellPlayMenuController.openCasual(true)}],
 ['08-private-room','Tạo phòng thử trong Play Hub','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001');ShellPlayMenuController.openCasual(false);createPrivateRoom(false)}],
 ['09-matchmaking','Trạng thái tìm trận','Popup',()=>{DW_UI_CAPTURE.clean();ShellFlowController.selectMode('MODE_DUEL_001');ShellPlayMenuController.openCasual(false);const old=setTimeout;window.setTimeout=()=>0;beginMatchmaking(false);window.setTimeout=old}],
 ['10-ready','Sẵn sàng trước trận','Chuẩn bị',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.phase='ready';show('ready');clearInterval(timer);ShellDOM.ready.timer.textContent='20'}],
 ['11-dice','Tung xúc xắc','Chuẩn bị',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';startDice()}],
 ['12-dice-result','Kết quả tung xúc xắc','Chuẩn bị',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';startDice();S.dice=[6,3];ShellDOM.dice.p1Die.textContent=dieGlyph(6);ShellDOM.dice.p2Die.textContent=dieGlyph(3);ShellDOM.dice.p1Text.textContent='6 điểm';ShellDOM.dice.p2Text.textContent='3 điểm';finishDice()}],
 ['13-deal','Nhận bài trang bị','Chuẩn bị',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.winner=1;S.loser=2;dealCards()}],
 ['14-team-empty','Chọn Hero và lính — chưa đủ quân','Đội hình',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.winner=1;S.loser=2;dealCards();beginTeam(1)}],
 ['15-team-selected','Chọn Hero và lính — đủ 5 quân','Đội hình',()=>{DW_UI_CAPTURE.clean();S.selectedMode='MODE_DUEL_001';S.winner=1;S.loser=2;dealCards();beginTeam(1);tempHeroDefinitionId='HERO_INF_KAZU';tempTroops={inf:3,arch:1,cav:1};renderTeamPicker()}],
 ['16-deploy','Triển khai quân trên bàn cờ','Ingame',()=>DW_UI_CAPTURE.deploy()],
 ['17-deploy-menu','Popup đặt quân vào ô','Ingame',()=>{DW_UI_CAPTURE.deploy();showDeployMenu(cells.find(c=>c.zone===1))}],
 ['18-deploy-troops','Popup chọn chủng lính để đặt','Ingame',()=>{DW_UI_CAPTURE.deploy();showDeployMenu(cells.find(c=>c.zone===1));deployTroopBtn.click()}],
 ['19-deploy-complete','Đã xếp đủ quân — chờ xác nhận','Ingame',()=>DW_UI_CAPTURE.deploy(true)],
 ['20-battle','Ingame — HUD và thanh Hero / Skill / Bài','Ingame',()=>DW_UI_CAPTURE.battle()],
 ['21-hero-selected','Ingame — chọn Hero và vùng di chuyển','Ingame',()=>{const {a}=DW_UI_CAPTURE.battle();selectUnit(a)}],
 ['22-troop-selected','Ingame — chọn quân lính','Ingame',()=>{DW_UI_CAPTURE.battle();selectUnit(S.units.find(u=>!u.hero&&u.side===1))}],
 ['23-combat-log','Thông tin trận và Combat Log mở rộng','Ingame',()=>{DW_UI_CAPTURE.battle();lg('PLAYER 1 · Kazu sử dụng Khóa Xích');lg('PLAYER 2 · Bộ binh đỡ đòn thay Hero');document.querySelector('.duelMatchDetails').open=true}],
 ['24-skill-target','Kỹ năng chọn mục tiêu trên bàn cờ','Kỹ năng',()=>{const {a}=DW_UI_CAPTURE.battle();CombatFlowUI.startSkill(a,2)}],
 ['25-skill-morph','Chọn chủng lính biến hình','Kỹ năng',()=>{const {a}=DW_UI_CAPTURE.battle('Grim');CombatFlowUI.startSkill(a,1)}],
 ['26-skill-copy','Chọn kỹ năng sao chép','Kỹ năng',()=>{const {a}=DW_UI_CAPTURE.battle('Grim');S.heroSkillHistory=[{side:2,skillId:'SKILL_HERO_KAZU_S2'}];CombatFlowUI.startSkill(a,3)}],
 ['27-skill-summon','Triệu hồi — chủng lính và ô đích','Kỹ năng',()=>{const {a}=DW_UI_CAPTURE.battle('Neuro');S.troopDeaths=[{id:'ui-dead',side:1}];CombatFlowUI.startSkill(a,2)}],
 ['28-equipment-dialog','Hộp thoại chọn trang bị tấn công','Trang bị',()=>{const {a}=DW_UI_CAPTURE.battle();CombatFlowUI.open(a,'atk')}],
 ['29-equipment-actor','Dùng bài — chọn quân nhận trang bị','Trang bị',()=>{DW_UI_CAPTURE.battle();CombatFlowUI.startEquipment(null,S.hands[1][0])}],
 ['30-equipment-target','Lao Móc — chọn mục tiêu của bài','Trang bị',()=>{const {a}=DW_UI_CAPTURE.battle();CombatFlowUI.startEquipment(a,S.hands[1].find(c=>c.equipmentId==='EQUIP_INF_ATK_005'))}],
 ['31-defense','Phòng thủ — Hero nhận đòn','Phòng thủ',()=>{const {a,d}=DW_UI_CAPTURE.battle();S.selected=a;startAttack(a,d);renderBoard();updateUI()}],
 ['32-guard','Phòng thủ — Bộ binh đỡ đòn','Phòng thủ',()=>{const {a,d,g}=DW_UI_CAPTURE.battle();S.selected=a;startAttack(a,d);DirectDefenseFlow.guard(g);renderBoard();updateUI()}],
 ['33-dice-ward','Phòng thủ — chọn hai số xúc xắc','Phòng thủ',()=>{const {a,d}=DW_UI_CAPTURE.battle('Kazu','Xacnas');S.selected=a;startAttack(a,d);CombatFlowUI.startSkill(d,3)}],
 ['34-escape','Phòng thủ — chọn ô thoát hiểm','Phòng thủ',()=>{const {a,d}=DW_UI_CAPTURE.battle('Kazu','Siri');S.selected=a;startAttack(a,d);CombatFlowUI.startSkill(d,2)}],
 ['35-warning','Cảnh báo thao tác ngoài tầm','Thông báo',()=>{const {a}=DW_UI_CAPTURE.battle();selectUnit(a);DirectBoardFlow.warning('Ngoài tầm di chuyển');clearTimeout(DirectBoardFlow.warningTimer)}],
 ['36-win','Cửa sổ chiến thắng','Kết quả',()=>DW_UI_CAPTURE.result(1)],
 ['37-lose','Cửa sổ thất bại','Kết quả',()=>DW_UI_CAPTURE.result(2)],
 ['38-draw','Cửa sổ hòa trận','Kết quả',()=>DW_UI_CAPTURE.result(null)],
 ['39-ranked-result','Kết quả xếp hạng và thay đổi Elo','Kết quả',()=>DW_UI_CAPTURE.result(1,true)],
 ['40-rematch-wait','Chờ đối thủ đồng ý đấu lại','Kết quả',()=>{DW_UI_CAPTURE.result(1);S.roomSession.playerSlots[1].type='human';S.roomSession.playerSlots[1].rematchStatus='PENDING';voteRematch()}],
 ['41-legacy-unit-menu','Menu đơn vị kiểu cũ — mẫu còn trong mã','Khung cũ',()=>{const {a}=DW_UI_CAPTURE.battle();S.selected=a;_directMenu();unitMenuSkills.classList.add('show')}],
 ['42-legacy-attack','Popup tấn công kiểu cũ — mẫu còn trong mã','Khung cũ',()=>{const {a}=DW_UI_CAPTURE.battle();showAttackPopup(a)}],
 ['43-legacy-equipment','Danh sách bài trong popup kiểu cũ','Khung cũ',()=>{const {a}=DW_UI_CAPTURE.battle();showAttackPopup(a);renderEquipmentSelect();atkCardList.classList.add('show')}],
 ['44-equipment-counter','Phản ứng hủy trang bị đối thủ','Trang bị',()=>{const {a}=DW_UI_CAPTURE.battle();EquipmentCore.offer(a,S.hands[1][0],()=>{});renderBoard();updateUI()}],
 ['45-defense-feedback-card','Thông báo đã dùng bài phòng thủ','Thông báo',()=>{const {d}=DW_UI_CAPTURE.battle();DefenseFeedback.card(d,S.hands[2][3],'Hủy đòn');clearTimeout(DefenseFeedback.timer)}],
 ['46-defense-feedback-skill','Thông báo đã dùng kỹ năng phòng thủ','Thông báo',()=>{const {d}=DW_UI_CAPTURE.battle('Kazu','Siri');DefenseFeedback.receipt(d,heroSkill(d,2),'skill','Né đòn');clearTimeout(DefenseFeedback.timer)}],
 ['47-equipment-steal','Cướp trang bị — chọn bài đối thủ','Trang bị',()=>{const {a}=DW_UI_CAPTURE.battle();const id=EquipmentRegistry.list().find(c=>c.effects?.includes('EFFECT_STEAL_EQUIPMENT')).id,c=createEquipmentCardInstance(id,1);S.hands[1].push(c);CombatFlowUI.startEquipment(a,c)}],
 ['48-post-hit','Phản sát thương sau khi nhận đòn','Phòng thủ',()=>{const {a,d}=DW_UI_CAPTURE.battle();S.selected=a;startAttack(a,d);S.postHitReaction={p:S.pending,d,damage:1,remainingMs:30000,lastTick:Date.now()};renderBoard();updateUI()}],
 ['49-ai-thinking','Chỉ báo Bot đang tính toán','Thông báo',()=>{DW_UI_CAPTURE.battle();aiThinking.style.display='block'}],
 ['67-legacy-defense','Popup phòng thủ kiểu cũ — mẫu còn trong mã','Khung cũ',()=>{const {a,d}=DW_UI_CAPTURE.battle();S.selected=a;startAttack(a,d);_heroPopup(d);DirectDefenseFlow.panel.hidden=true}],
 ['68-legacy-skill-list','Danh sách kỹ năng trong popup kiểu cũ','Khung cũ',()=>{const {a}=DW_UI_CAPTURE.battle();showAttackPopup(a);atkSkillBtn.click()}],
 ['69-legacy-reaction','Khung phản ứng kiểu cũ — nút Guard / Resolve','Khung cũ',()=>{const {a,d}=DW_UI_CAPTURE.battle();S.selected=a;startAttack(a,d);showReaction(false)}],
 ['70-training','Đấu tập — thanh công cụ và bàn trống','Đấu tập',()=>{DW_UI_CAPTURE.clean();TrainingMode.start();TrainingMode.dialog.close()}],
 ['71-training-unit','Đấu tập — thêm Hero hoặc lính','Đấu tập',()=>{DW_UI_CAPTURE.clean();TrainingMode.start()}],
 ['72-training-equipment','Đấu tập — thêm trang bị','Đấu tập',()=>{DW_UI_CAPTURE.clean();TrainingMode.start();TrainingMode.dialog.close();TrainingMode.configure('card')}],
];
module.exports={install,offline};
