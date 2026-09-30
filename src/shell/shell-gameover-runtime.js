function renderRematchPlayers(){let room=S.roomSession;if(!room?.playerSlots){RematchDOM.players.innerHTML='';return}RematchDOM.players.innerHTML=room.playerSlots.map(p=>{let st=!p.connected?'LEFT':p.rematchStatus||'PENDING',label=st==='READY'?'✓ CHƠI LẠI':st==='LEFT'?'✕ RỜI PHÒNG':'… ĐANG QUYẾT ĐỊNH',cls=st==='READY'?'ready':st==='LEFT'?'left':'wait';return'<div class="rematchPlayer"><span><b>Slot '+p.slotId+'</b> · '+p.name+'</span><span class="rematchState '+cls+'">'+label+'</span></div>'}).join('');let active=activeRoomPlayers(room).length,ready=readyRoomPlayers(room).length,need=room.playerRules?.requiredPlayersToStart??2;RematchDOM.hint.textContent='Room giữ nguyên · '+ready+'/'+need+' slot READY · '+active+' slot đang ở trong Room. Match mới chỉ tạo khi đủ điều kiện của Mode.';}
function showGameOver(matchResult){
  if(S.matchEnded&&GameOverDOM.overlay.classList.contains('show'))return;
  if(!matchResult||!matchResult.ended)return;
  const room=S.roomSession, isDraw=matchResult.resultType==='DRAW'||matchResult.winnerSide==null;
  const winner=matchResult.winnerSide;
  const humanWon=!isDraw&&winner===1;
  let delta=0;
  if(S.isRanked&&!isDraw){
    const gain=ratingGain(S.rating);
    delta=humanWon?gain:-Math.ceil(gain*1.3);
    S.rating=Math.max(0,S.rating+delta);
    ShellDOM.playMenu.rating.textContent=S.rating;
  }
  if(S.matchSession){
    S.matchSession.result={...matchResult,winner,eloDelta:delta,ratingAfter:S.rating};
    S.matchSession.rematchState='VOTING';
    room?.matchHistory?.push({...S.matchSession});
  }
  room?.playerSlots?.forEach(p=>{if(p.connected)p.rematchStatus=p.type==='bot'?'READY':'PENDING'});

  const p2=room?.playerSlots?.find(p=>p.slotId===2);
  GameOverDOM.p2Name.textContent=p2?.name||'PLAYER 2';
  GameOverDOM.p1Card.className='resultCard '+(isDraw?'draw':winner===1?'win':'lose');
  GameOverDOM.p2Card.className='resultCard '+(isDraw?'draw':winner===2?'win':'lose');
  GameOverDOM.p1Outcome.textContent=isDraw?'HÒA':winner===1?'CHIẾN THẮNG':'THUA CUỘC';
  GameOverDOM.p2Outcome.textContent=isDraw?'HÒA':winner===2?'CHIẾN THẮNG':'THUA CUỘC';

  GameOverDOM.title.textContent=isDraw?'HÒA!':humanWon?'CHIẾN THẮNG!':'THẤT BẠI';
  const resultText=isDraw?'Hai Hero cùng bị hạ trong cùng chuỗi giải quyết bắt buộc.':matchResult.reason==='FIRST_PLAYER_NO_ATTACK_FIVE_TURNS'?'Người đi trước không tấn công trong 5 lượt · xử thua.':'Đối Đầu kết thúc';
  GameOverDOM.text.textContent=(S.isRanked?(isDraw?'Ranked · Hòa · Rating '+S.rating:'Ranked · '+(delta>=0?'+':'')+delta+' Elo · Rating '+S.rating):resultText)
    +(S.botSide?' · Bot '+String(S.botDifficulty||'').toUpperCase():'');
  GameOverDOM.room.textContent=room?.roomId||'-';
  GameOverDOM.mode.textContent=room?.modeId==='MODE_DUEL_001'?'ĐỐI ĐẦU':(DW_MODES.get(room?.modeId)?.name||room?.modeId||'-');
  GameOverDOM.match.textContent=S.matchSession?.matchId||'-';
  GameOverDOM.rematchButton.disabled=false;
  GameOverDOM.rematchButton.textContent='CHƠI LẠI';
  ShellGameOverController.setWaiting(false);
  ShellGameOverController.open();
  S.matchEnded=true;
  renderRematchPlayers();
}
DW_SHELL.bindMatchEnd(matchResult=>{
  if(!matchResult||!matchResult.ended||(S.matchEnded&&GameOverDOM.overlay.classList.contains('show')))return;
  if(S.matchSession)S.matchSession.ruleResult=matchResult;
  showGameOver(matchResult);
});

checkWin=function(){
  if(S.matchEnded&&GameOverDOM.overlay.classList.contains('show'))return null;
  const heroes=S.units.filter(u=>u.hero).map(h=>({entityId:h.id,side:h.side,hp:h.hp}));
  return DW_CORE.emitGameEvent({
    type:'CORE_EVENT_HERO_STATE_SNAPSHOT',
    transactionState:'RESOLVED',
    heroes
  });
};


const ShellGameOverController=Object.freeze({
  open(){
    GameOverDOM.overlay.classList.add('show');
    GameOverDOM.overlay.setAttribute('aria-hidden','false');
  },
  close(){
    GameOverDOM.overlay.classList.remove('show');
    GameOverDOM.overlay.setAttribute('aria-hidden','true');
  },
  setWaiting(waiting){
    GameOverDOM.actions.classList.toggle('waiting',!!waiting);
  },
  bind(){
    GameOverDOM.rematchButton.onclick=voteRematch;
    GameOverDOM.leaveButton.onclick=leaveToMenu;
  }
});
function voteRematch(){let room=S.roomSession;if(!room)return;let human=room.playerSlots.find(p=>p.type==='human'&&p.connected);if(human)human.rematchStatus='READY';renderRematchPlayers();GameOverDOM.rematchButton.disabled=true;GameOverDOM.rematchButton.textContent='ĐÃ ĐỒNG Ý';ShellGameOverController.setWaiting(true);if(roomCanStartRematch(room)){RematchDOM.hint.textContent='Tất cả slot cần thiết đã READY · đang tạo Match mới trong cùng Room…';setTimeout(()=>{ShellGameOverController.close();beginNewMatchInRoom()},650)}else RematchDOM.hint.textContent='Đã gửi yêu cầu chơi lại · đang chờ các Player còn lại trong Room.'}
function leaveToMenu(){let room=S.roomSession;if(room){let human=room.playerSlots.find(p=>p.type==='human'&&p.connected);if(human){human.connected=false;human.rematchStatus='LEFT'}renderRematchPlayers()}ShellGameOverController.close();resetMatchState();S.botSide=null;S.playType=null;S.isRanked=false;S.roomId=null;S.matchSession=null;S.roomSession=null;S.phase='playmenu';configurePlayMenuForMode(S.selectedMode);show('playmenu');ShellDOM.playMenu.rating.textContent=S.rating;ShellDOM.global.summary.textContent='Đã rời Room · quay lại Play Menu của Mode hiện tại.'}
ShellGameOverController.bind();
