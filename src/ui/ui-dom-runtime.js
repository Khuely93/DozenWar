function requireDWElement(dwId){
  const el=document.querySelector(`[data-dw-id="${dwId}"]`);
  if(!el) throw new Error(`[DW UI] Required component missing: ${dwId}`);
  return el;
}

const ShellDOM=Object.freeze({
  global:Object.freeze({
    phaseLabel:requireDWElement("SHELL_UI_PHASE_LABEL"),
    summary:requireDWElement("SHELL_UI_SUMMARY")
  }),
  mode:Object.freeze({
    screen:requireDWElement("SHELL_UI_MODE_SELECT"),
    duelButton:requireDWElement("SHELL_UI_MODE_DUEL_BUTTON"),
    warGodButton:requireDWElement("SHELL_UI_MODE_WARGOD_BUTTON")
  }),
  modeConfirm:Object.freeze({
    overlay:requireDWElement("SHELL_UI_MODE_CONFIRM"),
    badge:requireDWElement("SHELL_UI_MODE_CONFIRM_BADGE"),
    title:requireDWElement("SHELL_UI_MODE_CONFIRM_TITLE"),
    closeButton:requireDWElement("SHELL_UI_MODE_CONFIRM_CLOSE"),
    meta:requireDWElement("SHELL_UI_MODE_CONFIRM_META"),
    rule:requireDWElement("SHELL_UI_MODE_CONFIRM_RULE"),
    playButton:requireDWElement("SHELL_UI_MODE_CONFIRM_PLAY"),
    backButton:requireDWElement("SHELL_UI_MODE_CONFIRM_BACK")
  }),
  playMenu:Object.freeze({
    screen:requireDWElement("SHELL_UI_PLAY_MENU"),
    modeLabel:requireDWElement("SHELL_UI_PLAY_MENU_MODE_LABEL"),
    changeModeButton:requireDWElement("SHELL_UI_PLAY_MENU_CHANGE_MODE"),
    aiButton:requireDWElement("SHELL_UI_PLAY_MENU_AI"),
    casualButton:requireDWElement("SHELL_UI_PLAY_MENU_CASUAL"),
    rankedButton:requireDWElement("SHELL_UI_PLAY_MENU_RANKED"),
    rating:requireDWElement("SHELL_UI_PLAY_MENU_RATING"),
    overlay:requireDWElement("SHELL_UI_PLAY_MENU_OVERLAY"),
    overlayTitle:requireDWElement("SHELL_UI_PLAY_MENU_OVERLAY_TITLE"),
    overlayBody:requireDWElement("SHELL_UI_PLAY_MENU_OVERLAY_BODY"),
    overlayClose:requireDWElement("SHELL_UI_PLAY_MENU_OVERLAY_CLOSE"),
    overlayBack:requireDWElement("SHELL_UI_PLAY_MENU_OVERLAY_BACK")
  }),
  ready:Object.freeze({
    screen:requireDWElement("SHELL_UI_READY"),
    timer:requireDWElement("SHELL_UI_READY_TIMER"),
    p1State:requireDWElement("SHELL_UI_READY_P1_STATE"),
    p1Button:requireDWElement("SHELL_UI_READY_P1_BUTTON"),
    p2State:requireDWElement("SHELL_UI_READY_P2_STATE"),
    p2Button:requireDWElement("SHELL_UI_READY_P2_BUTTON")
  }),
  dice:Object.freeze({
    screen:requireDWElement("SHELL_UI_DICE"),
    p1Die:requireDWElement("SHELL_UI_DICE_P1"),
    p1Text:requireDWElement("SHELL_UI_DICE_P1_TEXT"),
    p1RollButton:requireDWElement("SHELL_UI_DICE_P1_ROLL"),
    p2Die:requireDWElement("SHELL_UI_DICE_P2"),
    p2Text:requireDWElement("SHELL_UI_DICE_P2_TEXT"),
    p2RollButton:requireDWElement("SHELL_UI_DICE_P2_ROLL"),
    result:requireDWElement("SHELL_UI_DICE_RESULT"),
    rule:requireDWElement("SHELL_UI_DICE_RULE"),
    continueButton:requireDWElement("SHELL_UI_DICE_CONTINUE")
  }),
  team:Object.freeze({
    screen:requireDWElement("SHELL_UI_TEAM_SELECT"),
    title:requireDWElement("SHELL_UI_TEAM_TITLE"),
    subtitle:requireDWElement("SHELL_UI_TEAM_SUBTITLE"),
    heroChoices:requireDWElement("SHELL_UI_TEAM_HERO_CHOICES"),
    troopChoices:requireDWElement("SHELL_UI_TEAM_TROOP_CHOICES"),
    troopTotal:requireDWElement("SHELL_UI_TEAM_TROOP_TOTAL"),
    confirmButton:requireDWElement("SHELL_UI_TEAM_CONFIRM")
  }),
  deal:Object.freeze({
    screen:requireDWElement("SHELL_UI_EQUIPMENT_DEAL"),
    p1Hand:requireDWElement("SHELL_UI_DEAL_P1_HAND"),
    p2Hand:requireDWElement("SHELL_UI_DEAL_P2_HAND"),
    toDeployButton:requireDWElement("SHELL_UI_DEAL_TO_DEPLOY")
  }),
  match:Object.freeze({
    screen:requireDWElement("SHELL_UI_MATCH_SCREEN")
  }),
  gameOver:Object.freeze({
    overlay:requireDWElement("SHELL_UI_GAME_OVER"),
    title:requireDWElement("SHELL_UI_GAME_OVER_TITLE"),
    text:requireDWElement("SHELL_UI_GAME_OVER_TEXT"),
    resultGrid:requireDWElement("SHELL_UI_GAME_OVER_RESULT_GRID"),
    p1Card:requireDWElement("SHELL_UI_GAME_OVER_P1_CARD"),
    p1Outcome:requireDWElement("SHELL_UI_GAME_OVER_P1_OUTCOME"),
    p2Card:requireDWElement("SHELL_UI_GAME_OVER_P2_CARD"),
    p2Name:requireDWElement("SHELL_UI_GAME_OVER_P2_NAME"),
    p2Outcome:requireDWElement("SHELL_UI_GAME_OVER_P2_OUTCOME"),
    room:requireDWElement("SHELL_UI_GAME_OVER_ROOM"),
    mode:requireDWElement("SHELL_UI_GAME_OVER_MODE"),
    match:requireDWElement("SHELL_UI_GAME_OVER_MATCH"),
    actions:requireDWElement("SHELL_UI_GAME_OVER_ACTIONS"),
    rematchButton:requireDWElement("SHELL_UI_REMATCH_BUTTON"),
    leaveButton:requireDWElement("SHELL_UI_LEAVE_BUTTON")
  }),
  rematch:Object.freeze({
    players:requireDWElement("SHELL_UI_REMATCH"),
    hint:requireDWElement("SHELL_UI_REMATCH_HINT")
  })
});

function validateShellRegistry(){
  const required=[
    ShellDOM.global.phaseLabel,ShellDOM.global.summary,
    ShellDOM.mode.screen,ShellDOM.mode.duelButton,ShellDOM.mode.warGodButton,
    ShellDOM.modeConfirm.overlay,ShellDOM.modeConfirm.playButton,
    ShellDOM.playMenu.screen,ShellDOM.playMenu.aiButton,
    ShellDOM.ready.screen,ShellDOM.ready.timer,
    ShellDOM.dice.screen,ShellDOM.dice.p1RollButton,
    ShellDOM.team.screen,ShellDOM.team.confirmButton,
    ShellDOM.deal.screen,ShellDOM.deal.toDeployButton,
    ShellDOM.match.screen,
    ShellDOM.gameOver.overlay,ShellDOM.gameOver.rematchButton,ShellDOM.gameOver.leaveButton,
    ShellDOM.rematch.players,ShellDOM.rematch.hint
  ];
  const ok=required.every(Boolean);
  if(!ok) console.error("[SHELL REGISTRY INVALID]");
  return {ok,count:required.length};
}
const SHELL_REGISTRY_VALIDATION=validateShellRegistry();

/* =====================================================================
   CORE DOM REGISTRY CONVENTION v1.0 — PHASE 2

   Core gameplay UI is now accessed through CoreDOM / data-dw-id.
   HTML ids remain implementation details only.
   Dynamic popup components register themselves after creation.
   ===================================================================== */
const CoreDOM={
  board:Object.freeze({
    wrap:requireDWElement("CORE_UI_BOARD_WRAP"),
    svg:requireDWElement("CORE_UI_BOARD")
  }),
  hud:Object.freeze({
    title:requireDWElement("CORE_UI_MATCH_TITLE"),
    hint:requireDWElement("CORE_UI_MATCH_HINT"),
    undoButton:requireDWElement("CORE_UI_UNDO"),
    mainButton:requireDWElement("CORE_UI_MAIN_ACTION"),
    resetButton:requireDWElement("CORE_UI_RESET")
  }),
  selection:Object.freeze({
    panel:requireDWElement("CORE_UI_UNIT_PANEL"),
    info:requireDWElement("CORE_UI_UNIT_INFO"),
    moveButton:requireDWElement("CORE_UI_MOVE"),
    attackButton:requireDWElement("CORE_UI_ATTACK"),
    skillBar:requireDWElement("CORE_UI_SKILL_BAR"),
    handOwner:requireDWElement("CORE_UI_HAND_OWNER"),
    handBar:requireDWElement("CORE_UI_HAND_BAR")
  }),
  reaction:Object.freeze({
    box:requireDWElement("CORE_UI_REACTION"),
    info:requireDWElement("CORE_UI_REACTION_INFO"),
    guardButton:requireDWElement("CORE_UI_GUARD"),
    skipButton:requireDWElement("CORE_UI_REACTION_SKIP"),
    resolveButton:requireDWElement("CORE_UI_REACTION_RESOLVE")
  }),
  unitAction:Object.freeze({
    menu:requireDWElement("CORE_UI_UNIT_ACTION"),
    name:requireDWElement("CORE_UI_UNIT_ACTION_NAME"),
    closeButton:requireDWElement("CORE_UI_UNIT_ACTION_CLOSE"),
    moveButton:requireDWElement("CORE_UI_UNIT_ACTION_MOVE"),
    attackButton:requireDWElement("CORE_UI_UNIT_ACTION_ATTACK"),
    skillButton:requireDWElement("CORE_UI_UNIT_ACTION_SKILL"),
    skills:requireDWElement("CORE_UI_UNIT_ACTION_SKILLS"),
    hint:requireDWElement("CORE_UI_UNIT_ACTION_HINT")
  }),
  deployment:Object.freeze({
    menu:requireDWElement("CORE_UI_DEPLOY_MENU"),
    title:requireDWElement("CORE_UI_DEPLOY_TITLE"),
    closeButton:requireDWElement("CORE_UI_DEPLOY_CLOSE"),
    heroButton:requireDWElement("CORE_UI_DEPLOY_HERO"),
    troopButton:requireDWElement("CORE_UI_DEPLOY_TROOP"),
    troops:requireDWElement("CORE_UI_DEPLOY_TROOPS"),
    hint:requireDWElement("CORE_UI_DEPLOY_HINT")
  }),
  log:requireDWElement("CORE_UI_LOG"),
  dynamic:Object.create(null),
  registerDynamic(name,refs){
    if(!name||!refs)throw new Error('[CORE DOM] Dynamic registration requires name + refs');
    this.dynamic[name]=Object.freeze(refs);
    return this.dynamic[name];
  },
  getDynamic(name){return this.dynamic[name]||null;}
};

function validateCoreDOM(){
  const required=[
    CoreDOM.board.wrap,CoreDOM.board.svg,
    CoreDOM.hud.title,CoreDOM.hud.mainButton,
    CoreDOM.selection.info,CoreDOM.selection.attackButton,
    CoreDOM.reaction.box,CoreDOM.reaction.guardButton,
    CoreDOM.unitAction.menu,CoreDOM.unitAction.attackButton,
    CoreDOM.deployment.menu,CoreDOM.deployment.heroButton,
    CoreDOM.log
  ];
  const ok=required.every(Boolean);
  if(!ok)console.error('[CORE DOM INVALID]');
  return {ok,count:required.length};
}
const CORE_DOM_VALIDATION=validateCoreDOM();

/* =====================================================================
   DEBUG DOM REGISTRY CONVENTION v1.0 — PHASE 3
   Debug/diagnostic UI is isolated from Core and Shell ownership.
   ===================================================================== */
const DebugDOM=Object.freeze({
  log:CoreDOM.log
});
function validateDebugDOM(){
  const ok=!!DebugDOM.log;
  if(!ok) console.error('[DEBUG DOM INVALID]');
  return {ok};
}
const DEBUG_DOM_VALIDATION=validateDebugDOM();

// Explicit compatibility aliases sourced only from CoreDOM.
// These keep gameplay logic stable during Phase 2 while removing implicit globals.
const gameTitle=CoreDOM.hud.title,gameHint=CoreDOM.hud.hint,undoBtn=CoreDOM.hud.undoButton,mainBtn=CoreDOM.hud.mainButton,resetBtn=CoreDOM.hud.resetButton,
unitInfo=CoreDOM.selection.info,moveBtn=CoreDOM.selection.moveButton,attackBtn=CoreDOM.selection.attackButton,skillBar=CoreDOM.selection.skillBar,handOwner=CoreDOM.selection.handOwner,handBar=CoreDOM.selection.handBar,
reactionBox=CoreDOM.reaction.box,reactionInfo=CoreDOM.reaction.info,guardBtn=CoreDOM.reaction.guardButton,skipReact=CoreDOM.reaction.skipButton,resolveBtn=CoreDOM.reaction.resolveButton,
log=CoreDOM.log;

function validateShellPhase1Handlers(){
  const checks={
    modeDuel:typeof ShellDOM.mode.duelButton.onclick==='function',
    modeConfirmPlay:typeof ShellDOM.modeConfirm.playButton.onclick==='function',
    playAi:typeof ShellDOM.playMenu.aiButton.onclick==='function',
    readyP1:typeof ShellDOM.ready.p1Button.onclick==='function',
    diceP1:typeof ShellDOM.dice.p1RollButton.onclick==='function',
    teamConfirm:typeof ShellDOM.team.confirmButton.onclick==='function',
    toDeploy:typeof ShellDOM.deal.toDeployButton.onclick==='function'
  };
  const ok=Object.values(checks).every(Boolean);
  if(!ok)console.error('[SHELL PHASE1 HANDLERS INVALID]',checks);
  return {ok,checks};
}
