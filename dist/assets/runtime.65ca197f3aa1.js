/* DOZEN WAR II v1.26 - Part 13.1 Module Boundary Contract
   Architecture metadata only. No gameplay behavior lives here. */
(function(){
  'use strict';
  const frozen = Object.freeze;
  window.DWArchitecture = frozen({
    version: '13.1',
    policy: 'CORE_MODE_SHELL_CONTENT_PRESENTATION_NETWORK',
    layers: frozen({
      CORE: 'Reusable gameplay mechanics, resolvers, transactions, state engine.',
      MODE: 'Match-specific policies, win/lose rules, setup and configuration.',
      CONTENT: 'Hero, Unit, Skill, Equipment, Effect, Status and content schemas.',
      SHELL: 'Mode select, rooms, matchmaking, ready, game over and rematch.',
      UI: 'HUD and interaction views. Does not own gameplay truth.',
      PRESENTATION: 'Board/unit rendering, camera, VFX and future Three.js adapter.',
      NETWORK: 'Local/online transport adapters and server-facing contracts.',
      SHARED: 'Stable IDs, pure contracts and utilities safe across boundaries.'
    }),
    invariants: frozen([
      'Core does not compute universal victory conditions.',
      'Mode configures Core mechanics but does not own their implementation.',
      'Shell renders MatchResult and never evaluates victory.',
      'Content definitions are separate from runtime state.',
      'Presentation does not mutate authoritative gameplay state.',
      'Gameplay coordinates are independent from camera/screen coordinates.',
      'UI routes gameplay intent through controllers/dispatcher.',
      'Online authority can replace LocalAdapter without rewriting presentation.'
    ]),
    migration: frozen({
      phase: 'PART_13_1',
      currentRuntimeLocation: 'src/legacy/legacy-runtime.js',
      strategy: 'STRANGLER_MIGRATION',
      next: 'PART_13_2_CONTENT_EXTRACTION'
    })
  });
})();


;
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


;




/* =====================================================================
   FULL LEGACY DOM AUDIT v1.0 — v1.15
   - Implicit DOM globals: 0
   - document.getElementById feature calls: 0
   - Legacy DOM Compatibility Bridge: REMOVED
   - Shell/Core/Debug UI access: Registry + data-dw-id only
   ===================================================================== */

/* ================================================================
   DOZEN WAR II — ARCHITECTURE SEPARATION v1.0
   LATEST PLAYTEST RELEASE v1.7.2
   LATEST PLAYTEST RELEASE v1.6.1
   BUILD INTEGRATION v1.6

   OWNERSHIP
   1) DW_CORE  : Hero / Unit / Equipment / Skill / Combat / Core UX
   2) DW_MODES : mode configuration + rule evaluation only
   3) DW_SHELL : Mode Select / Play Menu / Room / Match / Game Over / Rematch

   IMPORTANT:
   - Core never decides who wins.
   - Mode Rules never render UI.
   - Game Over UI never checks Hero HP directly.
   ================================================================ */

const DW_IDS = Object.freeze({
  CORE: Object.freeze({
    UNIT_ACTION_POPUP: "CORE_UI_UNIT_ACTION",
    ATTACK_ACTION_POPUP: "CORE_UI_ATTACK_ACTION",
    ATTACK_TARGETING: "CORE_UI_ATTACK_TARGETING",
    SKILL_SELECT: "CORE_UI_SKILL_SELECT",
    SKILL_TARGETING: "CORE_UI_SKILL_TARGETING",
    EQUIPMENT_ATTACK_SELECT: "CORE_UI_EQUIPMENT_ATTACK_SELECT",
    EQUIPMENT_DEFENSE_SELECT: "CORE_UI_EQUIPMENT_DEFENSE_SELECT",
    DEFENSE_REACTION: "CORE_UI_DEFENSE_REACTION",
    INFANTRY_GUARD_TARGETING: "CORE_UI_INFANTRY_GUARD_TARGETING",
    DAMAGE_RESULT: "CORE_UI_DAMAGE_RESULT",
    STATUS_EFFECT: "CORE_UI_STATUS_EFFECT"
  }),
  SHELL: Object.freeze({
    MODE_SELECT: "SHELL_UI_MODE_SELECT",
    MODE_CONFIRM: "SHELL_UI_MODE_CONFIRM",
    PLAY_MENU: "SHELL_UI_PLAY_MENU",
    AI_SELECT: "SHELL_UI_AI_SELECT",
    CASUAL: "SHELL_UI_CASUAL",
    RANKED: "SHELL_UI_RANKED",
    ROOM: "SHELL_UI_ROOM",
    MATCHMAKING: "SHELL_UI_MATCHMAKING",
    READY: "SHELL_UI_READY",
    GAME_OVER: "SHELL_UI_GAME_OVER",
    REMATCH: "SHELL_UI_REMATCH"
  })
});


/* =====================================================================
   DOZEN WAR II — BASELINE SUMMARY v1.9.1

   CORE
   - Hero / Unit / Equipment / Skill / Effect / Buff
   - CoreBoardRenderer + CoreInputRouter
   - CoreAttackController / CoreSkillController / CoreGuardController / CoreBuffController
   - Guard Targeting UX and Equipment Selection UX remain Core mechanics

   MODE
   - MODE_DUEL_001 active
   - RULE_DUEL_HERO_DEATH: Hero HP <= 0 -> Match End
   - MODE_WAR_GOD_001 reserved for future rules

   SHELL
   - Mode Select -> Play Menu -> Room/Ready -> Match -> Game Over -> Rematch

   CONTENT
   - Content Schema v1.0
   - Canonical IDs for Hero / Unit / Skill / Card / Effect / Asset
   - Content Registry + validation
   - New content must be data-driven; avoid hardcoded hero/card-specific UI logic

   ONLINE-READY
   - GameActionDispatcher
   - LocalActionAdapter active
   - OnlineActionAdapter reserved
   - Current runtime remains OFFLINE
   ===================================================================== */

/* =====================================================================
   ACTION DISPATCH ARCHITECTURE v1.0
   Purpose:
   - Keep current playtest OFFLINE.
   - Prepare a clean boundary for future ONLINE server authority.
   - UI/Controllers send Actions; adapters decide where they execute.
   - OFFLINE -> LocalActionAdapter -> current local game logic.
   - ONLINE  -> OnlineActionAdapter -> server transport (stub for now).
   ===================================================================== */

const ACTION_TYPES = Object.freeze({
  BEGIN_ATTACK_TARGETING: "ACTION_BEGIN_ATTACK_TARGETING",
  BEGIN_SKILL_TARGETING: "ACTION_BEGIN_SKILL_TARGETING",
  BEGIN_GUARD_TARGETING: "ACTION_BEGIN_GUARD_TARGETING",
  MOVE_COMMIT: "ACTION_MOVE_COMMIT",
  ATTACK_COMMIT: "ACTION_ATTACK_COMMIT",
  SKILL_COMMIT: "ACTION_SKILL_COMMIT",
  GUARD_COMMIT: "ACTION_GUARD_COMMIT",
  EQUIPMENT_COMMIT: "ACTION_EQUIPMENT_COMMIT",
  EQUIPMENT_RESPONSE: "ACTION_EQUIPMENT_RESPONSE",
  EQUIPMENT_COUNTER: "ACTION_EQUIPMENT_COUNTER",
  EQUIPMENT_COUNTER_TARGET: "ACTION_EQUIPMENT_COUNTER_TARGET",
  EQUIPMENT_COUNTER_PASS: "ACTION_EQUIPMENT_COUNTER_PASS",
  EQUIPMENT_STEAL: "ACTION_EQUIPMENT_STEAL",
  END_TURN: "ACTION_END_TURN"
});

const NETWORK_EVENTS = Object.freeze({
  STATE_SNAPSHOT: "STATE_SNAPSHOT",
  ACTION_ACCEPTED: "ACTION_ACCEPTED",
  ACTION_REJECTED: "ACTION_REJECTED",
  MATCH_RESULT: "MATCH_RESULT",
  ROOM_STATE: "ROOM_STATE",
  RECONNECT_STATE: "RECONNECT_STATE",
  EQUIPMENT_REVEALED: "EQUIPMENT_REVEALED",
  EQUIPMENT_RESPONSE_OPENED: "EQUIPMENT_RESPONSE_OPENED",
  EQUIPMENT_COUNTER_COMMITTED: "EQUIPMENT_COUNTER_COMMITTED",
  EQUIPMENT_DESTROYED: "EQUIPMENT_DESTROYED",
  EQUIPMENT_STOLEN: "EQUIPMENT_STOLEN",
  EQUIPMENT_RESOLVED: "EQUIPMENT_RESOLVED"
});

const RuntimeConfig = {
  transportMode: "offline",   // "offline" only for current playtests
  onlineEnabled: false,
  clientVersion: "1.20",
  protocolVersion: "1.0"
};

const LocalActionAdapter = {
  id: "LOCAL_ACTION_ADAPTER",

  execute(action){
    switch(action?.type){
      case ACTION_TYPES.BEGIN_ATTACK_TARGETING:
        return _beginAttackTargetInternal(action.card || null);

      case ACTION_TYPES.BEGIN_SKILL_TARGETING:
        return _beginSkillTargetInternal(action.skillNo);

      case ACTION_TYPES.BEGIN_GUARD_TARGETING:
        return beginGuardTargeting();

      // Commit-type actions are scaffolded for future migration.
      // Current v1.8 gameplay still resolves them through existing local logic
      // to avoid changing behavior during the architecture preparation phase.
      default:
        return {deferredToLegacyLocalFlow:true, action};
    }
  }
};

const OnlineActionAdapter = {
  id: "ONLINE_ACTION_ADAPTER",

  execute(action){
    if(!RuntimeConfig.onlineEnabled){
      throw new Error("[ONLINE DISABLED] Current playtest is offline-only.");
    }
    // Future:
    // NetworkClient.send({
    //   protocolVersion: RuntimeConfig.protocolVersion,
    //   matchId: S.matchSession?.matchId,
    //   action
    // });
    return {queuedForServer:true, action};
  }
};

const GameActionDispatcher = {
  id: "GAME_ACTION_DISPATCHER",

  setMode(mode){
    if(mode==="online" && !RuntimeConfig.onlineEnabled){
      throw new Error("Online runtime is not enabled in this playtest.");
    }
    RuntimeConfig.transportMode=mode;
  },

  dispatch(action){
    if(!action || !action.type){
      throw new Error("[ACTION ERROR] Missing action.type");
    }
    if(RuntimeConfig.transportMode==="online"){
      return OnlineActionAdapter.execute(action);
    }
    return LocalActionAdapter.execute(action);
  },

  isOffline(){ return RuntimeConfig.transportMode==="offline"; },
  isOnline(){ return RuntimeConfig.transportMode==="online"; }
};

const MatchStateOwnership = Object.freeze({
  OFFLINE: Object.freeze({
    authoritative: "LOCAL_MATCH_ENGINE",
    clientStateMutable: true
  }),
  ONLINE_FUTURE: Object.freeze({
    authoritative: "SERVER_MATCH_ENGINE",
    clientStateMutable: false
  })
});


/* =====================================================================
   CORE STAR / POWER SYSTEM v1.0 — LOCKED CORE GAME RULES

   CORE, not Mode-specific:
   - Star sources are HERO_SKILL and EQUIPMENT only.
   - Normal attack has interaction power 0.
   - Final action power = MAX participating Skill/Equipment stars.
   - Stars NEVER add together.
   - Higher interaction power wins.
   - If powers are equal, the later-used source/response wins.
   - Stats/effects are resolved independently from Star.
   - Defensive Skill and Defense Equipment are independent response paths;
     they do NOT merge into one defensive action.
   - Core supports multiple Equipment sources per action; Mode decides max count.
   ===================================================================== */
const CORE_STAR_SOURCE=Object.freeze({
  HERO_SKILL:'HERO_SKILL',
  EQUIPMENT:'EQUIPMENT'
});

const CORE_INTERACTION_POWER=Object.freeze({
  NORMAL_ACTION:0,
  ONLY_STAR_SOURCES:Object.freeze([CORE_STAR_SOURCE.HERO_SKILL,CORE_STAR_SOURCE.EQUIPMENT])
});

const CorePowerResolver=Object.freeze({
  id:'CORE_POWER_RESOLVER',

  isStarSource(source){
    return !!source && CORE_INTERACTION_POWER.ONLY_STAR_SOURCES.includes(source.sourceType);
  },

  normalizeStar(value){
    return Number.isInteger(value) && value >= 0 ? value : null;
  },

  finalPower(sources=[]){
    const stars=sources
      .filter(src=>this.isStarSource(src) && src.active!==false && src.destroyed!==true && src.invalid!==true)
      .map(src=>this.normalizeStar(src.star))
      .filter(v=>v!==null);
    return stars.length ? Math.max(...stars) : CORE_INTERACTION_POWER.NORMAL_ACTION;
  },

  resolve(sourcePower,responsePower){
    const source=this.normalizeStar(sourcePower) ?? CORE_INTERACTION_POWER.NORMAL_ACTION;
    const response=this.normalizeStar(responsePower) ?? CORE_INTERACTION_POWER.NORMAL_ACTION;
    if(response>source)return Object.freeze({winner:'RESPONSE',reason:'HIGHER_POWER',sourcePower:source,responsePower:response});
    if(response<source)return Object.freeze({winner:'SOURCE',reason:'HIGHER_POWER',sourcePower:source,responsePower:response});
    // Equal Power -> later source wins. In a response comparison, RESPONSE is later.
    return Object.freeze({winner:'RESPONSE',reason:'EQUAL_POWER_LATEST_WINS',sourcePower:source,responsePower:response});
  }
});

const CORE_EFFECT_CLASS=Object.freeze({
  STAT_MODIFIER:'STAT_MODIFIER',
  SPECIAL_EFFECT:'SPECIAL_EFFECT'
});

const CORE_DEFENSE_RESPONSE_POLICY=Object.freeze({
  id:'CORE_DEFENSE_RESPONSE_POLICY',
  mergeDefensiveSkillAndEquipment:false,
  paths:Object.freeze(['INFANTRY_GUARD','HERO_DEFENSIVE_SKILL','DEFENSE_EQUIPMENT','NO_DEFENSE'])
});

const CoreActionBuilder=Object.freeze({
  id:'CORE_ACTION_BUILDER',

  build({baseAction=null,sources=[]}={}){
    const liveSources=(sources||[]).filter(src=>src && src.active!==false && src.destroyed!==true && src.invalid!==true);
    return Object.freeze({
      baseAction:baseAction||null,
      interactionPower:CorePowerResolver.finalPower(liveSources),
      sources:Object.freeze(liveSources.slice()),
      // Effect/stat aggregation remains effect-driven. This builder only owns
      // source survival + final interaction power so destroyed equipment can
      // be removed and the action rebuilt without rollback.
      effectRefs:Object.freeze(liveSources.flatMap(src=>Array.isArray(src.effects)?src.effects:[])),
      authoritative:true
    });
  },

  preview(args={}){
    const state=this.build(args);
    return Object.freeze({...state,authoritative:false,preview:true});
  }
});

/* Equipment can contain both A + B simultaneously. */
const CORE_EQUIPMENT_EFFECT_MODEL=Object.freeze({
  id:'CORE_EQUIPMENT_EFFECT_MODEL',
  A_STAT_MODIFIER:CORE_EFFECT_CLASS.STAT_MODIFIER,
  B_SPECIAL_EFFECT:CORE_EFFECT_CLASS.SPECIAL_EFFECT,
  combatEngineReadsFinalRuntimeState:true,
  cardSpecificCombatHardcode:false
});

/* EQUIP-COUNTER is a Core interaction mechanic, not a card-only mechanic.
   Equipment cards, Hero Skills, or future sources may invoke it with their own
   timing/cost/cooldown rules. */
const CORE_EQUIP_COUNTER=Object.freeze({
  id:'EQUIP-COUNTER',
  revealBeforeApply:true,
  previewBeforeApply:true,
  responseSeconds:10,
  destroyTargetSeconds:20,
  targetState:'REVEALED_PENDING',
  finalTargetClickCommits:true,
  timeoutResponse:'AUTO_PASS',
  timeoutTargeting:'AUTO_PASS_KEEP_COUNTER_ON_HAND',
  destroyedCardDestination:'REMOVED_FROM_MATCH',
  applyTargetEffectsOnlyIfSurvives:true,
  supportsCounterChain:true,
  powerRule:'HIGHER_POWER_WINS_EQUAL_POWER_LATEST_WINS'
});

const CORE_EQUIP_STEAL=Object.freeze({
  id:'EQUIP-STEAL',
  targetState:'IN_HAND_ONLY',
  cannotTargetRevealedOrPending:true,
  transferOwnership:true,
  destination:'THIEF_HAND',
  mayUseImmediatelyOrKeep:true
});

const CoreEquipmentPolicy=Object.freeze({
  id:'CORE_EQUIPMENT_POLICY',

  maxPerAction(modeId){
    const registered=(typeof DW_MODES!=='undefined' && DW_MODES?.get)?DW_MODES.get(modeId):null;
    const value=registered?.equipmentRules?.maxPerAction;
    return Number.isInteger(value) && value>=0 ? value : 1;
  },

  finalActionPower({skill=null,equipment=[]}={}){
    const sources=[];
    if(skill)sources.push({sourceType:CORE_STAR_SOURCE.HERO_SKILL,star:skill.star,effects:skill.effects,active:true,id:skill.id});
    for(const card of equipment||[])sources.push({sourceType:CORE_STAR_SOURCE.EQUIPMENT,star:card.star,effects:card.effects,active:true,id:card.id});
    return CorePowerResolver.finalPower(sources);
  }
});

/* =====================================================================
   CORE ARCHITECTURE CONSOLIDATION v1.20
   Locked design boundaries from the Core/Mode review.
   These declarations are intentionally data/policy oriented; Duel keeps its
   current playable board while future modes can opt into larger map systems.
   ===================================================================== */
// This file loads before Content's deepFreeze helper in the modular dev build.
// Keep the architecture snapshot self-contained so later Core declarations run.
function freezeCoreArchitecture(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freezeCoreArchitecture);
    Object.freeze(value);
  }
  return value;
}
const CORE_ARCHITECTURE_V18=freezeCoreArchitecture({
  map:{
    coordinateSystem:'AXIAL',orientation:'POINTY_TOP',pixelIsGameplayTruth:false,
    occupancyModes:['SINGLE','FORMATION','STACK'],enemySideSharing:false,
    sameSideSharing:'MODE_AND_CAPACITY_POLICY',placementAtomic:true,
    propagationSeparateFromOccupancy:true
  },
  movement:{
    pathBased:true,enemyBlocks:true,allyPassThrough:'MODE_POLICY',
    remainingMoveFormula:'MAX_0_RUNTIME_BUDGET_MINUS_SPENT',
    buffAddsBudgetWithoutResettingSpent:true,
    movementTypes:['VOLUNTARY','FORCED_PULL','FORCED_PUSH','TELEPORT','SWAP','FORMATION_MOVE']
  },
  targeting:{
    rangeSeparateFromPattern:true,targetingSeparateFromPropagation:true,
    formationTargetSelection:'PLAYER_SELECTS_ENTITY',
    areaFormationPolicies:['EACH_VALID_ENTITY','ONE_TARGET_PER_CELL','SELECT_N_PER_CELL'],
    multiWave:{resolveEachWaveBeforeNext:true,repeatAcrossWaves:true,uniqueWithinWave:true,revalidateBetweenWaves:true}
  },
  terrain:{
    terrainSeparateFromElevation:true,structureSeparateFromTerrain:true,specialCellSeparateFromTerrain:true,
    movementCostUniformByDefault:true,terrainCreatesStar:false,
    mountain:{infantryCanEnter:true,archerCanEnter:true,cavalryCanEnter:false,groundToMountainExtraMoveCost:0,groundArcherCanTargetMountain:true,equalElevationIntermediateMountainBlocksLOS:false},
    cavalryPierce:{terrainPropagationPolicy:true,highGroundToGroundAllowedWhenCavalryPlacementIsLegal:true}
  },
  specialCells:{
    ownership:'OCCUPANCY_BOUND',enemyShareHex:false,
    teleport:{cost:0,cooldown:0,payload:'FORMATION',emptyBecomesNeutral:true,placementAtomic:true},
    fortress:{cellSpan:1,containsFormation:true,destroyedDisablesReinforcementAdd:true,eventDrivenReinforcement:true}
  },
  camera:{worldAndHudSeparated:true,targetingSurvivesPanZoom:true,anchorPopupFollowsUnit:true,anchorOffscreen:'AUTO_CLOSE',combatFocus:'SOFT_AUTO_FOCUS',zoomBounded:true,localOnly:true},
  combat:{damageMinimum:0,dodgeResult:'MISS',reflectAfterLethal:true,reflectDoesNotReflectReflect:true,pullRequiresTargetAlive:true,propagationTargetsCanDefend:false,multiTargetPrimaryTargetsDefendIndependently:true},
  runtimeModifiers:{baseDataImmutable:true,groups:['STAT_MODIFIER','RULE_MODIFIER','TRIGGERED_EFFECT'],statFloor:0,buffDebuffCoexist:true,sourceDeathDoesNotRemoveTimedBuffByDefault:true},
  events:{eventTriggerEffectSeparated:true,automaticTriggerSeparateFromPlayerReaction:true,deterministicQueue:true,prioritySeparateFromStar:true,stateMutationThroughResolvers:true},
  modeBoundary:{coreCodeMustNotBranchOnModeName:true,modeCanEnableDisableConfigure:true,winLoseOwnedByMode:true,matchConfigSnapshot:true,winRuleLogic:['ANY','ALL']}
});

const DW_CORE = {
  id: "CORE_GAME",
  uiIds: DW_IDS.CORE,

  // Core emits a neutral gameplay event. It does NOT decide victory.
  emitGameEvent(event){
    return DW_MODES.onCoreEvent(event);
  },

  // Stable Core mechanic identifier. All modes reuse the same Guard UX.
  mechanics: Object.freeze({
    infantryGuard: Object.freeze({
      id: "CORE_MECHANIC_INFANTRY_GUARD",
      targetingUiId: DW_IDS.CORE.INFANTRY_GUARD_TARGETING,
      uxVersion: "1.5"
    }),
    equipmentSelection: Object.freeze({
      id: "CORE_MECHANIC_EQUIPMENT_SELECTION",
      attackUiId: DW_IDS.CORE.EQUIPMENT_ATTACK_SELECT,
      defenseUiId: DW_IDS.CORE.EQUIPMENT_DEFENSE_SELECT,
      uxVersion: "1.1"
    }),
    starPower: Object.freeze({
      id: "CORE_MECHANIC_STAR_POWER",
      version: "1.0",
      resolver: "CORE_POWER_RESOLVER"
    }),
    equipmentCounter: Object.freeze({
      id: "EQUIP-COUNTER",
      responseSeconds: 10,
      targetSeconds: 20
    }),
    equipmentSteal: Object.freeze({
      id: "EQUIP-STEAL",
      targetState: "IN_HAND_ONLY"
    })
  })
};


;
const DW_MODES = {
  registry: Object.create(null),
  rules: Object.create(null),

  registerMode(config){ this.registry[config.id] = Object.freeze(config); },
  registerRule(ruleId, evaluator){ this.rules[ruleId] = evaluator; },

  get(modeId){ return this.registry[modeId] || null; },

  evaluate(modeId, event){
    const mode = this.get(modeId);
    if(!mode) return null;
    const results=[];
    for(const ruleId of (mode.winRules || [])){
      const evaluator=this.rules[ruleId];
      if(typeof evaluator !== 'function') continue;
      const result=evaluator(event,{mode});
      if(result && result.ended) results.push({...result,ruleId});
    }
    if(!results.length) return null;
    const logic=mode.winRuleLogic||'ANY';
    if(logic==='ALL' && results.length < (mode.winRules||[]).length) return null;
    const chosen=results[0];
    return Object.freeze({
      ended:true,
      resultType:chosen.resultType||((chosen.winnerSide==null)?'DRAW':'WIN_LOSE'),
      winnerSide:chosen.winnerSide ?? null,
      loserSide:chosen.loserSide ?? null,
      ruleId:chosen.ruleId,
      reason:chosen.reason||chosen.ruleId,
      modeId
    });
  },

  onCoreEvent(event){
    const modeId=(typeof S!=='undefined' && (S.selectedMode||S.roomSession?.modeId))||null;
    const result=this.evaluate(modeId,event);
    if(result) DW_SHELL.onMatchEnd(result);
    return result;
  }
};


;
const DW_SHELL = {
  id: "GAME_SHELL",
  uiIds: DW_IDS.SHELL,
  _matchEndHandler: null,

  bindMatchEnd(handler){ this._matchEndHandler = handler; },

  // Shell renders a result already decided by the active Mode.
  onMatchEnd(matchResult){
    if(typeof this._matchEndHandler === "function"){
      this._matchEndHandler(matchResult);
    }
  }
};



;
// Current mode definitions.
// Core owns mechanics; Mode only enables/disables/configures supported policies.
DW_MODES.registerMode({
  id:'MODE_DUEL_001',
  version:6,
  name:'Đối Đầu',
  shellEnabled:true,
  matchEnabled:true,
  playerRules:{minPlayers:2,maxPlayers:2,requiredPlayersToStart:2},
  teamRules:{heroCount:1,unitCount:5},
  mapPolicy:{mapId:'MAP_DUEL_001',occupancyMode:'SINGLE',allyPassThrough:false},
  turnPolicy:{roundEnabled:false,endTurn:'MANUAL_WITH_TIMEOUT',reactionPausesTurnTimer:true,turnTimerSeconds:180,defenseTimerSeconds:30,firstPlayerNoAttackLimit:5},
  skillUsagePolicy:{scope:'MATCH',maxUsesPerSkill:1,reset:'NEVER'},
  actionPolicy:{activeSkillConsumesAction:false,heroAttackSkillConsumesAction:true},
  coreFeatures:{infantryGuard:true,equipmentSelection:true,equipmentCounter:true,equipmentSteal:true},
  cardRules:{deckSize:null,startingHand:5,drawPerTurn:0},
  contentPolicy:{packId:'CONTENT_PACK_DUEL_001',deckId:'DECK_DUEL_STANDARD_001'},
  equipmentRules:{maxPerAction:1,attackPerTurn:1,defensePerOpponentTurn:1},
  winRuleLogic:'ANY',
  winRules:['RULE_DUEL_HERO_DEATH','RULE_DUEL_FIRST_PLAYER_NO_ATTACK']
});

DW_MODES.registerMode({
  id:'MODE_WAR_GOD_001',
  version:1,
  name:'Chiến Thần',
  shellEnabled:true,
  matchEnabled:false,
  playerRules:{minPlayers:2,maxPlayers:4,requiredPlayersToStart:2},
  mapPolicy:{mapId:null,occupancyMode:'FORMATION',allyPassThrough:'IF_CAPACITY_AVAILABLE'},
  turnPolicy:{roundEnabled:true,reactionPausesTurnTimer:true},
  skillUsagePolicy:{scope:'ROUND',maxUsesPerSkill:1,reset:'ROUND'},
  coreFeatures:{infantryGuard:true,equipmentSelection:true,teleport:true,fortress:true,terrain:true},
  equipmentRules:{maxPerAction:null},
  winRuleLogic:'ANY',
  winRules:[]
});

// MODE RULE: only Đối Đầu owns Hero-death victory.
// Evaluation occurs on a transaction-complete Hero snapshot so mandatory
// effects such as Reflect can finish before the MatchResult is finalized.
DW_MODES.registerRule('RULE_DUEL_HERO_DEATH',(event)=>{
  if(!event || event.type!=='CORE_EVENT_HERO_STATE_SNAPSHOT') return null;
  const heroes=Array.isArray(event.heroes)?event.heroes:[];
  const p1=heroes.find(h=>h.side===1);
  const p2=heroes.find(h=>h.side===2);
  if(!p1||!p2) return null;
  const p1Dead=p1.hp<=0, p2Dead=p2.hp<=0;
  if(!p1Dead && !p2Dead) return null;
  if(p1Dead && p2Dead){
    return {ended:true,resultType:'DRAW',winnerSide:null,loserSide:null,reason:'BOTH_HEROES_ZERO_OR_BELOW_SAME_RESOLUTION'};
  }
  const loserSide=p1Dead?1:2;
  return {ended:true,resultType:'WIN_LOSE',winnerSide:loserSide===1?2:1,loserSide,reason:'HERO_HP_ZERO_OR_BELOW'};
});
DW_MODES.registerRule('RULE_DUEL_FIRST_PLAYER_NO_ATTACK',(event)=>{
  if(event?.type!=='CORE_EVENT_FIRST_PLAYER_INACTIVITY'||event.count<5||![1,2].includes(event.side))return null;
  return {ended:true,resultType:'WIN_LOSE',winnerSide:event.side===1?2:1,loserSide:event.side,reason:'FIRST_PLAYER_NO_ATTACK_FIVE_TURNS'};
});


DW_MODES.registerMode({
  id:'MODE_TRAINING_001',version:1,name:'Đấu tập',shellEnabled:true,matchEnabled:true,
  playerRules:{minPlayers:2,maxPlayers:2,requiredPlayersToStart:2},
  mapPolicy:{mapId:'MAP_DUEL_001',occupancyMode:'SINGLE',allyPassThrough:false},
  turnPolicy:{roundEnabled:false,endTurn:'MANUAL',reactionPausesTurnTimer:true},
  skillUsagePolicy:{scope:'ACTION',maxUsesPerSkill:null,reset:'CONTINUOUS'},
  equipmentRules:{maxPerAction:null,allowMultiple:true,attackPerTurn:null,defensePerOpponentTurn:null},
  contentPolicy:{packId:'CONTENT_PACK_DUEL_001',deckId:'DECK_DUEL_STANDARD_001'},
  winRules:[],winRuleLogic:'ANY'
});

;
const heroImg='data:image/jpeg;base64,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';


;
// SHELL FLOW v1.1 — screen map uses registry directly.
// Only phaseLabel/summary aliases remain temporarily for legacy Core code outside Shell.
const phaseLabel=ShellDOM.global.phaseLabel, summary=ShellDOM.global.summary;
const screens={
  playmenu:ShellDOM.playMenu.screen,
  mode:ShellDOM.mode.screen,
  ready:ShellDOM.ready.screen,
  dice:ShellDOM.dice.screen,
  team:ShellDOM.team.screen,
  deal:ShellDOM.deal.screen,
  game:ShellDOM.match.screen
};

const S={phase:'mode',selectedMode:null,ready:[false,false],dice:[null,null],winner:null,loser:null,selecting:null,teams:{1:null,2:null},hands:{1:[],2:[]},deployOrder:[],deployIndex:0,battleSide:null,turn:1,round:1,units:[],selected:null,mode:null,history:[],pending:null,skillUsed:{},cardUsed:{1:false,2:false},skillTarget:null,skillSequence:null,playType:null,botSide:null,botDifficulty:null,isRanked:false,rating:100,roomId:null,botRunning:false,botQueue:null,matchEnded:false,guardTargeting:false};
function skillUsageKey(hero,skillNo){return hero ? String(hero.id)+'::S'+String(skillNo) : null}
function duelUsage(){return S.duelUsage??={activeSkill:{1:0,2:0},defenseSkill:{1:0,2:0},attackCard:{1:0,2:0},defenseCard:{1:0,2:0}}}
function isSkillUsed(hero,skillNo){const k=skillUsageKey(hero,skillNo);if(!k||S.skillUsed[k])return !!k&&!!S.skillUsed[k];if(S.selectedMode!=='MODE_DUEL_001')return false;const skill=ContentViews.skill(ContentViews.hero(hero.definitionId)?.skillIds?.[skillNo-1]);const defense=skill?.timing==='DEFENSE_REACTION'||skill?.timing==='BOTH'&&hero.side!==S.battleSide;return (defense?duelUsage().defenseSkill:duelUsage().activeSkill)[hero.side]>=1}
function markSkillUsed(hero,skillNo){const k=skillUsageKey(hero,skillNo);if(!k||S.skillUsed[k])return;if(S.selectedMode==='MODE_DUEL_001'){const skill=ContentViews.skill(ContentViews.hero(hero.definitionId)?.skillIds?.[skillNo-1]);const bucket=skill?.timing==='DEFENSE_REACTION'||skill?.timing==='BOTH'&&hero.side!==S.battleSide?duelUsage().defenseSkill:duelUsage().activeSkill;bucket[hero.side]++}S.skillUsed[k]=true}
function allHeroSkillsUsed(hero){if(!hero||!hero.hero)return true;const count=(ContentViews.hero(hero.definitionId)?.skillIds||[]).length||3;for(let n=1;n<=count;n++)if(!isSkillUsed(hero,n))return false;return true}
function resetSkillUsageForModeBoundary(boundary){
  const mode=DW_MODES.get(S.selectedMode);
  const policy=mode?.skillUsagePolicy;
  if(!policy)return;
  if((boundary==='ROUND'&&policy.reset==='ROUND')||(boundary==='TURN'&&policy.reset==='TURN'))S.skillUsed={};
}


;
// ===== DOZEN WAR II DATA & ASSET CONVENTION v1.0 =====
// Canonical IDs are permanent. Display names / artwork may change without changing gameplay references.
const CLASS={INF:'INF',ARCH:'ARCH',CAV:'CAV',ALCH:'ALCH',NEU:'NEU'};
const CLASS_RUNTIME={INF:'infantry',ARCH:'archer',CAV:'cavalry',ALCH:'alchemist',NEU:'neutral'};
const CLASS_KIND={INF:'inf',ARCH:'arch',CAV:'cav',ALCH:'alch',NEU:'neu'};

// Hero-only class. HP and skills must be supplied for each individual Hero.
const HERO_CLASS_RULES=Object.freeze({
  ALCH:Object.freeze({name:'Giả Kim Thuật',heroOnly:true,
    defaultStats:Object.freeze({move:1,attackRange:1}),attackPattern:'RANGE',
    passives:Object.freeze([]),equipmentClassIds:Object.freeze(['NEU'])})
});


;
const RAW_ASSETS={
  IMG_MAP_001_BG:{type:'IMAGE',usage:'MAP_BG',source:'EMBEDDED_BOARD_BG'},
  IMG_HERO_INF_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_HERO_RODOC_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_HERO_EST_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'PLACEHOLDER_EST',fallbackGlyph:'E'},
  IMG_HERO_ARCH_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_BOW',fallbackGlyph:'🏹'},
  IMG_HERO_CAV_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_HORSE',fallbackGlyph:'🐎'},
  IMG_UNIT_INF_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_UNIT_ARCH_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_BOW',fallbackGlyph:'🏹'},
  IMG_UNIT_CAV_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_HORSE',fallbackGlyph:'🐎'},
  VFX_HEAL_01:{type:'VFX'},VFX_DAMAGE_BUFF_01:{type:'VFX'},VFX_GUARD_01:{type:'VFX'},VFX_DODGE_01:{type:'VFX'},VFX_REFLECT_01:{type:'VFX'},
  ANIM_HERO_INF_001_ATTACK:{type:'ANIMATION'},ANIM_HERO_RODOC_ATTACK:{type:'ANIMATION'},ANIM_HERO_EST_ATTACK:{type:'ANIMATION'},ANIM_HERO_ARCH_001_ATTACK:{type:'ANIMATION'},ANIM_HERO_CAV_001_ATTACK:{type:'ANIMATION'}
};


;


// UI text is intentionally outside gameplay definitions. Vietnamese remains the active locale for this playable build.
const RAW_LOCALES={
  'vi-VN':{
    HERO_INF_001_NAME:'Hero Bộ binh',HERO_INF_RODOC_NAME:'Rodoc',HERO_INF_EST_NAME:'EST',HERO_ARCH_001_NAME:'Hero Cung thủ',HERO_CAV_001_NAME:'Hero Kỵ binh',
    UNIT_INF_001_NAME:'Bộ binh',UNIT_ARCH_001_NAME:'Cung thủ',UNIT_CAV_001_NAME:'Kỵ binh',
    SKILL_HERO_INF_001_S1_NAME:'Field Heal',SKILL_HERO_INF_001_S1_DESC:'Hồi 1 HP cho đồng minh hoặc bản thân trong phạm vi 3 ô',
    SKILL_HERO_INF_001_S2_NAME:'Infantry Advance',SKILL_HERO_INF_001_S2_DESC:'+2 Move cho Infantry',
    SKILL_HERO_INF_001_S3_NAME:'Shield Line',SKILL_HERO_INF_001_S3_DESC:'1 dmg / tối đa 4 mục tiêu đường thẳng',
    SKILL_HERO_RODOC_S1_NAME:'Hồi sức',SKILL_HERO_RODOC_S1_DESC:'Phản ứng phòng thủ ★3: hồi 1 HP cho 1 Bộ binh đồng minh hoặc Rodoc trong 3 ô',
    SKILL_HERO_RODOC_S2_NAME:'Tiếng thét xung trận',SKILL_HERO_RODOC_S2_DESC:'★1: +2 Move cho tối đa 2 Bộ binh đồng minh hoặc Rodoc trong 3 ô, đến hết lượt phe nhận buff',
    SKILL_HERO_RODOC_S3_NAME:'Chiến Thần',SKILL_HERO_RODOC_S3_DESC:'★1: 1 sát thương mỗi mục tiêu · tối đa 4 địch trên một đường thẳng, tầm 4 ô. Card tấn công cộng sát thương và hiệu ứng cho mỗi mục tiêu; ★ lấy mức cao nhất.',
    SKILL_HERO_EST_S1_NAME:'Phi thân',SKILL_HERO_EST_S1_DESC:'Phòng thủ ★1: khi EST bị đánh, đổi chỗ với 1 Lính đồng minh trong 3 ô; Lính nhận đòn thay',
    SKILL_HERO_EST_S2_NAME:'Phục thù',SKILL_HERO_EST_S2_DESC:'Phòng thủ ★1: sau đòn đánh, gây 1 sát thương cho tối đa 2 địch vừa tấn công phe EST trong 3 ô',
    SKILL_HERO_EST_S3_NAME:'Ác mộng phía đông',SKILL_HERO_EST_S3_DESC:'Tấn công ★1: di chuyển tùy ý tối đa Move còn lại (+2), chọn thủ công tối đa 4 địch kề EST rồi nhấn TẤN CÔNG, mỗi địch 1 sát thương',
    SKILL_HERO_ARCH_001_S1_NAME:'Evasion',SKILL_HERO_ARCH_001_S1_DESC:'Né Attack + Equipment ★1',
    SKILL_HERO_ARCH_001_S2_NAME:'Focus Shot',SKILL_HERO_ARCH_001_S2_DESC:'+1 Damage cho Archer',
    SKILL_HERO_ARCH_001_S3_NAME:'Double Shot',SKILL_HERO_ARCH_001_S3_DESC:'2 dmg / tối đa 2 mục tiêu',
    SKILL_HERO_CAV_001_S1_NAME:'Charge Line',SKILL_HERO_CAV_001_S1_DESC:'1 dmg / 2 mục tiêu trên 3 ô',
    SKILL_HERO_CAV_001_S2_NAME:'Cavalry Rush',SKILL_HERO_CAV_001_S2_DESC:'+3 Move cho Cavalry',
    SKILL_HERO_CAV_001_S3_NAME:'Guard Break Charge',SKILL_HERO_CAV_001_S3_DESC:'2 dmg, bỏ qua Infantry Guard',
  }
};


;


const RAW_EFFECTS={
  EFFECT_DAMAGE_PLUS_1:{id:'EFFECT_DAMAGE_PLUS_1',type:'MODIFY_DAMAGE',operation:'ADD',value:1,duration:'CURRENT_ACTION'},
  EFFECT_DAMAGE_REDUCE_1:{id:'EFFECT_DAMAGE_REDUCE_1',type:'MODIFY_DAMAGE',operation:'SUBTRACT',value:1,duration:'CURRENT_ACTION'},
  EFFECT_CANCEL_ATTACK:{id:'EFFECT_CANCEL_ATTACK',type:'CANCEL_ATTACK'},
  EFFECT_REFLECT_DAMAGE:{id:'EFFECT_REFLECT_DAMAGE',type:'REFLECT_DAMAGE',ratio:1},
  EFFECT_IGNORE_INF_GUARD:{id:'EFFECT_IGNORE_INF_GUARD',type:'IGNORE_DEFENSE',targetDefenseType:'INF_GUARD'},
  EFFECT_HEAL_1:{id:'EFFECT_HEAL_1',type:'HEAL',value:1},
  EFFECT_MOVE_PLUS_2:{id:'EFFECT_MOVE_PLUS_2',type:'MODIFY_MOVE',operation:'ADD',value:2},
  EFFECT_MOVE_PLUS_3:{id:'EFFECT_MOVE_PLUS_3',type:'MODIFY_MOVE',operation:'ADD',value:3},
  EFFECT_EVADE_ATTACK:{id:'EFFECT_EVADE_ATTACK',type:'CANCEL_ATTACK'},
  EFFECT_DAMAGE_1:{id:'EFFECT_DAMAGE_1',type:'DAMAGE',value:1},
  EFFECT_DAMAGE_2:{id:'EFFECT_DAMAGE_2',type:'DAMAGE',value:2},
  EFFECT_SWAP_ALLY:{id:'EFFECT_SWAP_ALLY',type:'SWAP_DEFENDER'},
  EFFECT_RETALIATE_1:{id:'EFFECT_RETALIATE_1',type:'RETALIATE',value:1}
};
Object.assign(RAW_EFFECTS,{
  EFFECT_ASSASSIN_HERO_1:{id:"EFFECT_ASSASSIN_HERO_1",type:"ASSASSIN_HERO",value:1},
  EFFECT_EQUIPMENT_TELEPORT_4:{id:"EFFECT_EQUIPMENT_TELEPORT_4",type:"EQUIPMENT_TELEPORT",range:4,heroOnly:true},
  EFFECT_SUMMON_CAV:{id:"EFFECT_SUMMON_CAV",type:"SUMMON_TROOP",classId:"CAV"},
  EFFECT_SUMMON_ARCH:{id:"EFFECT_SUMMON_ARCH",type:"SUMMON_TROOP",classId:"ARCH"},
  EFFECT_EQUIPMENT_BASE_MOVE:{id:"EFFECT_EQUIPMENT_BASE_MOVE",type:"EQUIPMENT_BASE_MOVE",duration:"CURRENT_PLAYER_TURN"},
  EFFECT_CANCEL_EQUIPMENT:{id:"EFFECT_CANCEL_EQUIPMENT",type:"CANCEL_EQUIPMENT"},
  EFFECT_STEAL_EQUIPMENT:{id:"EFFECT_STEAL_EQUIPMENT",type:"STEAL_EQUIPMENT"},
  EFFECT_PIERCE_PLUS_1:{id:'EFFECT_PIERCE_PLUS_1',type:'MODIFY_PROPAGATION_LENGTH',operation:'ADD',value:1,duration:'CURRENT_ACTION'},
  EFFECT_EQUIPMENT_ROOT_2:{id:'EFFECT_EQUIPMENT_ROOT_2',type:'EQUIPMENT_ROOT',range:2,duration:'CURRENT_PLAYER_TURN'},
  EFFECT_REDIRECT_ALLY:{id:'EFFECT_REDIRECT_ALLY',type:'REDIRECT_DEFENDER'},
  EFFECT_COUNTER_BASE_ATTACK:{id:'EFFECT_COUNTER_BASE_ATTACK',type:'COUNTER_ATTACK',useBaseStats:true,allowAfterDeath:true},
  EFFECT_ATTACK_COUNT_PLUS_1:{id:'EFFECT_ATTACK_COUNT_PLUS_1',type:'MODIFY_ATTACK_COUNT',operation:'ADD',value:1,duration:'CURRENT_ACTION'},
  EFFECT_ATTACK_RANGE_PLUS_1:{id:'EFFECT_ATTACK_RANGE_PLUS_1',type:'MODIFY_ATTACK_RANGE',operation:'ADD',value:1,duration:'CURRENT_ACTION'},
  EFFECT_EQUIPMENT_MOVE_PLUS_1:{id:'EFFECT_EQUIPMENT_MOVE_PLUS_1',type:'EQUIPMENT_MOVE',value:1,maxTargets:2,duration:'CURRENT_PLAYER_TURN'},
  EFFECT_EQUIPMENT_PULL_3:{id:'EFFECT_EQUIPMENT_PULL_3',type:'EQUIPMENT_PULL',value:1,range:3}
});
const RAW_SKILLS={
  SKILL_HERO_INF_001_S1:{id:'SKILL_HERO_INF_001_S1',nameKey:'SKILL_HERO_INF_001_S1_NAME',descriptionKey:'SKILL_HERO_INF_001_S1_DESC',class:'INF',timing:'ACTIVE',target:{side:'ALLY',range:3,maxTargets:1,requireMissingHp:true},effects:['EFFECT_HEAL_1']},
  SKILL_HERO_INF_001_S2:{id:'SKILL_HERO_INF_001_S2',nameKey:'SKILL_HERO_INF_001_S2_NAME',descriptionKey:'SKILL_HERO_INF_001_S2_DESC',class:'INF',timing:'ACTIVE',target:{side:'ALLY',class:'INF',range:3,maxTargets:1},effects:['EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_INF_001_S3:{id:'SKILL_HERO_INF_001_S3',nameKey:'SKILL_HERO_INF_001_S3_NAME',descriptionKey:'SKILL_HERO_INF_001_S3_DESC',class:'INF',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:4,maxTargets:4,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_RODOC_S1:{id:'SKILL_HERO_RODOC_S1',nameKey:'SKILL_HERO_RODOC_S1_NAME',descriptionKey:'SKILL_HERO_RODOC_S1_DESC',class:'INF',star:3,timing:'DEFENSE_REACTION',target:{side:'ALLY',class:'INF',range:3,maxTargets:1,requireMissingHp:true},effects:['EFFECT_HEAL_1']},
  SKILL_HERO_RODOC_S2:{id:'SKILL_HERO_RODOC_S2',nameKey:'SKILL_HERO_RODOC_S2_NAME',descriptionKey:'SKILL_HERO_RODOC_S2_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ALLY',class:'INF',range:3,maxTargets:2},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_RODOC_S3:{id:'SKILL_HERO_RODOC_S3',nameKey:'SKILL_HERO_RODOC_S3_NAME',descriptionKey:'SKILL_HERO_RODOC_S3_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:4,maxTargets:4,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_EST_S1:{id:'SKILL_HERO_EST_S1',nameKey:'SKILL_HERO_EST_S1_NAME',descriptionKey:'SKILL_HERO_EST_S1_DESC',class:'INF',star:1,timing:'DEFENSE_REACTION',target:{side:'ALLY',unitType:'TROOP',range:3,maxTargets:1},effects:['EFFECT_SWAP_ALLY']},
  SKILL_HERO_EST_S2:{id:'SKILL_HERO_EST_S2',nameKey:'SKILL_HERO_EST_S2_NAME',descriptionKey:'SKILL_HERO_EST_S2_DESC',class:'INF',star:1,timing:'DEFENSE_REACTION',target:{side:'ENEMY',range:3,maxTargets:2,requireRecentAttacker:true},effects:['EFFECT_RETALIATE_1']},
  SKILL_HERO_EST_S3:{id:'SKILL_HERO_EST_S3',nameKey:'SKILL_HERO_EST_S3_NAME',descriptionKey:'SKILL_HERO_EST_S3_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:4},maneuver:{moveBonus:2,attackFlow:'SELECT_ADJACENT'},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_DAMAGE_1','EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_ARCH_001_S1:{id:'SKILL_HERO_ARCH_001_S1',nameKey:'SKILL_HERO_ARCH_001_S1_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S1_DESC',class:'ARCH',star:1,timing:'DEFENSE_REACTION',target:{side:'SELF'},effects:['EFFECT_EVADE_ATTACK']},
  SKILL_HERO_ARCH_001_S2:{id:'SKILL_HERO_ARCH_001_S2',nameKey:'SKILL_HERO_ARCH_001_S2_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S2_DESC',class:'ARCH',timing:'ACTIVE',target:{side:'ALLY',class:'ARCH',range:3,maxTargets:1},effects:['EFFECT_DAMAGE_PLUS_1']},
  SKILL_HERO_ARCH_001_S3:{id:'SKILL_HERO_ARCH_001_S3',nameKey:'SKILL_HERO_ARCH_001_S3_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S3_DESC',class:'ARCH',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:3,maxTargets:2},effects:['EFFECT_DAMAGE_2']},
  SKILL_HERO_CAV_001_S1:{id:'SKILL_HERO_CAV_001_S1',nameKey:'SKILL_HERO_CAV_001_S1_NAME',descriptionKey:'SKILL_HERO_CAV_001_S1_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:3,maxTargets:2,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_CAV_001_S2:{id:'SKILL_HERO_CAV_001_S2',nameKey:'SKILL_HERO_CAV_001_S2_NAME',descriptionKey:'SKILL_HERO_CAV_001_S2_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ALLY',class:'CAV',range:3,maxTargets:1},effects:['EFFECT_MOVE_PLUS_3']},
  SKILL_HERO_CAV_001_S3:{id:'SKILL_HERO_CAV_001_S3',nameKey:'SKILL_HERO_CAV_001_S3_NAME',descriptionKey:'SKILL_HERO_CAV_001_S3_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:1},effects:['EFFECT_DAMAGE_2','EFFECT_IGNORE_INF_GUARD']}
};
const RAW_HERO_DB={
  HERO_INF_RODOC:{id:'HERO_INF_RODOC',nameKey:'HERO_INF_RODOC_NAME',class:'INF',stats:{hp:3,move:1,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_RODOC_S1','SKILL_HERO_RODOC_S2','SKILL_HERO_RODOC_S3'],assets:{token:'IMG_HERO_RODOC_TOKEN',attackAnimation:'ANIM_HERO_RODOC_ATTACK'}},
  HERO_INF_EST:{id:'HERO_INF_EST',nameKey:'HERO_INF_EST_NAME',class:'INF',stats:{hp:3,move:1,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_EST_S1','SKILL_HERO_EST_S2','SKILL_HERO_EST_S3'],assets:{token:'IMG_HERO_EST_TOKEN',attackAnimation:'ANIM_HERO_EST_ATTACK'}},
};
const RAW_UNIT_DB={
  UNIT_INF_001:{id:'UNIT_INF_001',nameKey:'UNIT_INF_001_NAME',class:'INF',stats:{hp:2,move:1,attackRange:1},attackPattern:'RANGE',passives:['INF_GUARD'],assets:{token:'IMG_UNIT_INF_001_TOKEN'}},
  UNIT_ARCH_001:{id:'UNIT_ARCH_001',nameKey:'UNIT_ARCH_001_NAME',class:'ARCH',stats:{hp:1,move:1,attackRange:3},attackPattern:'LINE',passives:[],assets:{token:'IMG_UNIT_ARCH_001_TOKEN'}},
  UNIT_CAV_001:{id:'UNIT_CAV_001',nameKey:'UNIT_CAV_001_NAME',class:'CAV',stats:{hp:1,move:3,attackRange:1},attackPattern:'RANGE',passives:['PIERCE_ONE_HEX'],assets:{token:'IMG_UNIT_CAV_001_TOKEN'}}
};
// New Equipment catalog: no legacy cards are playable. Fill cards only after design approval.
const EQUIPMENT_GROUPS=Object.freeze({
  INF:{id:'EQUIPMENT_GROUP_INF',name:'Bộ binh',classId:'INF',assetId:'IMG_EQUIPMENT_GROUP_INF'},
  ARCH:{id:'EQUIPMENT_GROUP_ARCH',name:'Cung thủ',classId:'ARCH',assetId:'IMG_EQUIPMENT_GROUP_ARCH'},
  CAV:{id:'EQUIPMENT_GROUP_CAV',name:'Kỵ binh',classId:'CAV',assetId:'IMG_EQUIPMENT_GROUP_CAV'},
  COMMON:{id:'EQUIPMENT_GROUP_COMMON',name:'Dùng chung',classId:'NEU',assetId:'IMG_EQUIPMENT_GROUP_COMMON'}
});
const EQUIPMENT_CATEGORIES=Object.freeze({ATTACK:{id:'EQUIPMENT_CATEGORY_ATTACK',name:'Tấn công',timing:'ATTACK',assetId:'ICON_EQUIPMENT_ATTACK'},DEFENSE:{id:'EQUIPMENT_CATEGORY_DEFENSE',name:'Phòng thủ',timing:'DEFENSE',assetId:'ICON_EQUIPMENT_DEFENSE'},BOTH:{id:'EQUIPMENT_CATEGORY_BOTH',name:'Công và thủ',timing:['ATTACK','DEFENSE'],assetId:'ICON_EQUIPMENT_BOTH'}});
const NEW_EQUIPMENT_CATALOG={
  "version": 10,
  "cards": [
    {
      "id": "EQUIP_INF_ATK_001",
      "visual": { "card": "./assets/equipment/inf/001/card-800x1200.png" },
      "group": "INF",
      "name": "Búa Chiến",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_DAMAGE_PLUS_1"
      ],
      "text": "+1 sát thương cho đòn thường và skill Attack trong một lần commit."
    },
    {
      "id": "EQUIP_INF_DEF_001",
      "visual": { "card": "./assets/equipment/inf/def-001/card-800x1200.png" },
      "group": "INF",
      "name": "Khiên Ma Thuật",
      "category": "DEFENSE",
      "star": 4,
      "count": 2,
      "effects": [
        "EFFECT_REFLECT_DAMAGE"
      ],
      "text": "Phản toàn bộ sát thương thực nhận sau giảm sát thương khi bị đánh hoặc Guard đồng đội. Vẫn mất HP; vẫn phản khi chết. Không nhận sát thương thì không phản."
    },
    {
      "id": "EQUIP_INF_ATK_002",
      "visual": { "card": "./assets/equipment/inf/002/card-800x1200.png" },
      "group": "INF",
      "name": "Song Kiếm",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_ATTACK_COUNT_PLUS_1"
      ],
      "text": "+1 lần đánh trong một lần commit; áp dụng cho đòn thường và skill Attack. Mỗi lần mở phản ứng phòng thủ riêng."
    },
    {
      "id": "EQUIP_INF_ATK_003",
      "visual": { "card": "./assets/equipment/inf/003/card-800x1200.png" },
      "group": "INF",
      "name": "Giày Nhanh Nhẹn",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_EQUIPMENT_MOVE_PLUS_1"
      ],
      "text": "Chọn tối đa 2 Bộ binh cùng phe ở bất kỳ đâu chưa Attack: +1 ô di chuyển trong lượt công hiện tại, kể cả đã di chuyển."
    },
    {
      "id": "EQUIP_INF_ATK_004",
      "visual": { "card": "./assets/equipment/inf/004/card-800x1200.png" },
      "group": "INF",
      "name": "Trường Thương",
      "category": "ATTACK",
      "star": 1,
      "count": 3,
      "effects": [
        "EFFECT_ATTACK_RANGE_PLUS_1"
      ],
      "text": "+1 ô tầm đánh cho đòn thường và skill Attack trong một lần commit."
    },
    {
      "id": "EQUIP_INF_ATK_005",
      "visual": { "card": "./assets/equipment/inf/005/card-800x1200.png" },
      "group": "INF",
      "name": "Lao Móc",
      "category": "ATTACK",
      "star": 3,
      "count": 1,
      "effects": [
        "EFFECT_EQUIPMENT_PULL_3",
        "EFFECT_IGNORE_INF_GUARD"
      ],
      "text": "Đánh 1 địch trên đường thẳng tối đa 3 ô: gây 1 sát thương rồi kéo mục tiêu sống về hex trống liền kề trước mặt. Mục tiêu đứng sát vẫn nhận sát thương nhưng không bị kéo. Đường giữa phải trống quân/vật cản; không Guard Bộ binh."
    },
    {
      "id": "EQUIP_INF_ATK_006",
      "visual": { "card": "./assets/equipment/inf/006/card-800x1200.png" },
      "group": "INF",
      "name": "Chùy Xích",
      "category": "ATTACK",
      "star": 1,
      "count": 1,
      "effects": [
        "EFFECT_ATTACK_RANGE_PLUS_1",
        "EFFECT_DAMAGE_PLUS_1"
      ],
      "text": "+1 ô tầm đánh và +1 sát thương cho đòn thường và skill Attack trong một lần commit."
    },
    {
      "id": "EQUIP_ARCH_ATK_001",
      "visual": { "card": "./assets/equipment/arch/001/card-800x1200.png" },
      "group": "ARCH",
      "name": "Nỏ Sắt",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_ATTACK_COUNT_PLUS_1"
      ],
      "text": "+1 lần đánh cho đòn thường hoặc skill Attack trong một commit; mỗi lần mở phản ứng phòng thủ riêng."
    },
    {
      "id": "EQUIP_ARCH_DEF_001",
      "visual": { "card": "./assets/equipment/arch/def-001/card-800x1200.png" },
      "group": "ARCH",
      "name": "Bom Khói",
      "category": "DEFENSE",
      "star": 2,
      "count": 2,
      "effects": [
        "EFFECT_CANCEL_ATTACK"
      ],
      "text": "Hủy một đòn đánh nhắm vào Cung thủ: hủy cả sát thương và hiệu ứng lên đơn vị được bảo vệ."
    },
    {
      "id": "EQUIP_ARCH_ATK_002",
      "visual": { "card": "./assets/equipment/arch/002/card-800x1200.png" },
      "group": "ARCH",
      "name": "Tên Xuyên Phá",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_DAMAGE_PLUS_1"
      ],
      "text": "+1 sát thương cho đòn thường hoặc skill Attack trong một commit."
    },
    {
      "id": "EQUIP_ARCH_ATK_003",
      "visual": { "card": "./assets/equipment/arch/003/card-800x1200.png" },
      "group": "ARCH",
      "name": "Cung Thép",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_ATTACK_RANGE_PLUS_1"
      ],
      "text": "+1 ô tầm đánh cho đòn thường hoặc skill Attack trong một commit."
    },
    {
      "id": "EQUIP_ARCH_DEF_002",
      "visual": { "card": "./assets/equipment/arch/def-002/card-800x1200.png" },
      "group": "ARCH",
      "name": "Áo Choàng Phép Thuật",
      "category": "DEFENSE",
      "star": 2,
      "count": 2,
      "effects": [
        "EFFECT_REDIRECT_ALLY"
      ],
      "text": "Chuyển đòn sang 1 lính/Hero khác còn sống cùng phe ở bất kỳ đâu. Không đổi vị trí; đơn vị nhận thay được phản ứng phòng thủ hợp lệ."
    },
    {
      "id": "EQUIP_ARCH_DEF_003",
      "visual": { "card": "./assets/equipment/arch/def-003/card-800x1200.png" },
      "group": "ARCH",
      "name": "Dao Găm",
      "category": "DEFENSE",
      "star": 2,
      "count": 3,
      "effects": [
        "EFFECT_COUNTER_BASE_ATTACK"
      ],
      "text": "Sau khi nhận đòn, trả đòn vào chính kẻ tấn công bằng sát thương và tầm cơ bản, không buff/trang bị. Vẫn trả khi chết; đối phương không được phòng thủ."
    },
    {
      "id": "EQUIP_CAV_ATK_002",
      "visual": { "card": "./assets/equipment/cav/002/card-800x1200.png" },
      "name": "Đại Đao",
      "group": "CAV",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_DAMAGE_PLUS_1"
      ],
      "text": "+1 sát thương cho đòn thường và skill Attack trong một commit."
    },
    {
      "id": "EQUIP_CAV_DEF_002",
      "visual": { "card": "./assets/equipment/cav/def-002/card-800x1200.png" },
      "name": "Khiên Gỗ",
      "group": "CAV",
      "category": "DEFENSE",
      "star": 2,
      "count": 2,
      "effects": [
        "EFFECT_CANCEL_ATTACK"
      ],
      "text": "Hủy một đòn đánh lên Kỵ binh, gồm sát thương và hiệu ứng lên đơn vị được bảo vệ."
    },
    {
      "id": "EQUIP_CAV_ATK_003",
      "visual": { "card": "./assets/equipment/cav/003/card-800x1200.png" },
      "name": "Giáo Thép",
      "group": "CAV",
      "category": "ATTACK",
      "star": 1,
      "count": 1,
      "effects": [
        "EFFECT_IGNORE_INF_GUARD"
      ],
      "text": "Đòn thường và skill Attack của Kỵ binh trong một commit không được Guard Bộ binh; vẫn có phản ứng phòng thủ khác hợp lệ."
    },
    {
      "id": "EQUIP_COMMON_ATK_003",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_003.png" },
      "name": "Lọ Phép Thuật",
      "group": "COMMON",
      "category": "ATTACK",
      "star": 1,
      "count": 1,
      "effects": [
        "EFFECT_IGNORE_INF_GUARD"
      ],
      "text": "Đòn thường và skill Attack trong một commit không được Guard Bộ binh; vẫn có phản ứng phòng thủ khác hợp lệ."
    },
    {
      "id": "EQUIP_COMMON_ATK_004",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_004.png" },
      "name": "Thuốc Hồi Sức",
      "group": "COMMON",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "effects": [
        "EFFECT_ATTACK_COUNT_PLUS_1"
      ],
      "text": "+1 lần tấn công cho đòn thường hoặc skill Attack trong một commit; mỗi lần mở phản ứng phòng thủ riêng."
    },
    {
      "id": "EQUIP_COMMON_DEF_001",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_DEF_001.png" },
      "name": "Quyền Trượng Phép Thuật",
      "group": "COMMON",
      "category": "DEFENSE",
      "star": 3,
      "count": 2,
      "effects": [
        "EFFECT_CANCEL_ATTACK"
      ],
      "text": "Hủy một đòn tấn công, gồm sát thương và hiệu ứng lên đơn vị được bảo vệ; vẫn so sánh sao."
    },
    {
      "id": "EQUIP_CAV_DEF_001",
      "visual": { "card": "./assets/equipment/cav/def-001/card-800x1200.png" },
      "name": "Kiếm Một Tay",
      "group": "CAV",
      "category": "DEFENSE",
      "star": 2,
      "count": 2,
      "effects": [
        "EFFECT_COUNTER_BASE_ATTACK"
      ],
      "text": "Sau khi nhận đòn, trả chính kẻ tấn công bằng sát thương/tầm cơ bản, không buff/trang bị. Chết vẫn trả; đối phương không được phòng thủ."
    },
    {
      "id": "EQUIP_CAV_DEF_003",
      "visual": { "card": "./assets/equipment/cav/def-003/card-800x1200.png" },
      "name": "Lưới Sắt",
      "group": "CAV",
      "category": "DEFENSE",
      "star": 4,
      "count": 1,
      "effects": [
        "EFFECT_EQUIPMENT_ROOT_2"
      ],
      "text": "Dùng bất kỳ lúc nào trong lượt thủ: khóa 1 địch trong phạm vi tối đa 2 ô đến hết lượt công của địch. Cấm di chuyển, Attack và skill công; vẫn dùng được trang bị phòng thủ."
    },
    {
      "id": "EQUIP_CAV_ATK_001",
      "visual": { "card": "./assets/equipment/cav/001/card-800x1200.png" },
      "group": "CAV",
      "name": "Thương Kỵ Sĩ",
      "category": "ATTACK",
      "star": 1,
      "count": 3,
      "effects": [
        "EFFECT_PIERCE_PLUS_1"
      ],
      "text": "Đòn thường/skill Attack hạ mục tiêu chính sẽ lan sát thương bằng đòn chính lên tối đa 2 đơn vị ở hai hex nối tiếp thẳng phía sau; không mở phản ứng phòng thủ cho sát thương lan."
    },
    {
      "id": "EQUIP_COMMON_ATK_001",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_001.png" },
      "name": "Triệu Gọi Ám Kỵ",
      "group": "COMMON",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "text": "Tạo 1 lính Kỵ binh mới ở hex hợp lệ cạnh Hero còn sống. Lính được đi và đánh ngay; không mất HP, không commit Hero.",
      "effects": [
        "EFFECT_SUMMON_CAV"
      ]
    },
    {
      "id": "EQUIP_COMMON_ATK_002",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_002.png" },
      "name": "Kèn Gọi Quân",
      "group": "COMMON",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "text": "Tạo 1 lính Cung thủ mới ở hex hợp lệ cạnh Hero còn sống. Lính được đi và đánh ngay; không cần lính chết.",
      "effects": [
        "EFFECT_SUMMON_ARCH"
      ]
    },
    {
      "id": "EQUIP_COMMON_BOTH_001",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_BOTH_001.png" },
      "name": "Bình Máu",
      "group": "COMMON",
      "category": "BOTH",
      "star": 4,
      "count": 4,
      "text": "Hồi 1 HP cho Bộ binh hoặc Hero đồng đội còn sống, thiếu HP ở bất kỳ đâu. Khi đang nhận đòn phải hồi đủ để sống.",
      "effects": [
        "EFFECT_HEAL_1"
      ]
    },
    {
      "id": "EQUIP_COMMON_ATK_005",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_005.png" },
      "name": "Thuốc Tăng Lực",
      "group": "COMMON",
      "category": "ATTACK",
      "star": 1,
      "count": 2,
      "text": "Cho 1 đồng đội chưa Attack thêm số ô bằng di chuyển cơ bản, kể cả đã di chuyển. Hết lượt công thì hết buff.",
      "effects": [
        "EFFECT_EQUIPMENT_BASE_MOVE"
      ]
    },
    {
      "id": "EQUIP_COMMON_BOTH_002",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_BOTH_002.png" },
      "name": "Dây Chuyền May Mắn",
      "group": "COMMON",
      "category": "BOTH",
      "star": 5,
      "count": 2,
      "text": "Hủy toàn bộ hiệu ứng của 1 card địch vừa dùng trước khi xử lý. Card bị hủy vẫn rời tay và tiêu hao ngân sách.",
      "effects": [
        "EFFECT_CANCEL_EQUIPMENT"
      ]
    },
    {
      "id": "EQUIP_COMMON_BOTH_003",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_BOTH_003.png" },
      "name": "Đánh Cắp",
      "group": "COMMON",
      "category": "BOTH",
      "star": 4,
      "count": 2,
      "text": "Xem tay địch và chọn lấy 1 card chưa dùng. Được dùng ngay nếu còn ngân sách.",
      "effects": [
        "EFFECT_STEAL_EQUIPMENT"
      ]
    },
    {
      "id": "EQUIP_COMMON_BOTH_004",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_BOTH_004.png" },
      "name": "Nhẫn Dịch Chuyển",
      "group": "COMMON",
      "category": "BOTH",
      "star": 3,
      "count": 2,
      "text": "Chỉ Hero đồng đội còn sống; lượt công phải chưa Attack. Dịch chuyển đến hex hợp lệ khác trong tối đa 4 ô, bỏ qua quân/vật cản và không tiêu hao di chuyển thường. Lượt thủ: chỉ khi Hero đang bị đánh, đủ 3 sao để hủy sát thương và hiệu ứng đòn.",
      "effects": [
        "EFFECT_EQUIPMENT_TELEPORT_4"
      ]
    },
    {
      "id": "EQUIP_COMMON_ATK_006",
      "visual": { "card": "./assets/card-gallery/common/EQUIP_COMMON_ATK_006.png" },
      "group": "COMMON",
      "name": "Thích Khách",
      "category": "ATTACK",
      "star": 4,
      "count": 2,
      "text": "Gây 1 sát thương cho 1 Hero địch trên toàn bản đồ. Bộ binh có thể đỡ đòn. Không tiêu hao quyền Attack.",
      "effects": [
        "EFFECT_ASSASSIN_HERO_1"
      ]
    }
  ]
};
// Stable card IDs belong to designs; instance IDs distinguish copies in players' hands.
function equipmentCatalogDefinition(card){
  const group=EQUIPMENT_GROUPS[card.group],category=EQUIPMENT_CATEGORIES[card.category];
  if(!group||!category)throw new Error('Invalid equipment group/category: '+card.id);
  if(!/^EQUIP_(INF|ARCH|CAV|COMMON)_(ATK|DEF|BOTH)_[A-Z0-9_]+$/.test(card.id)||!card.id.startsWith('EQUIP_'+card.group+'_'+(card.category==='ATTACK'?'ATK':card.category==='DEFENSE'?'DEF':'BOTH')+'_'))throw new Error('Invalid equipment ID: '+card.id);
  if(typeof card.name!=='string'||!card.name.trim()||typeof card.text!=='string'||!card.text.trim())throw new Error('Equipment needs name/text: '+card.id);
  if(!Number.isInteger(card.star)||card.star<1||!Number.isInteger(card.count)||card.count<0||!Array.isArray(card.effects))throw new Error('Invalid equipment stars/count/effects: '+card.id);
  const assets={};
  for(const [slot,prefix] of Object.entries({art:'IMG_',frame:'IMG_',icon:'ICON_'})){
    const assetId=prefix+card.id+'_'+slot.toUpperCase();assets[slot]=assetId;
    RAW_ASSETS[assetId]={id:assetId,type:'IMAGE',usage:slot==='art'&&card.visual?.card?'CARD_FULL':'CARD_'+slot.toUpperCase(),source:card.visual?.[slot]||(slot==='art'?card.visual?.card:'')||'',fallbackGlyph:slot==='icon'?(card.category==='ATTACK'?'⚔':card.category==='DEFENSE'?'🛡':'⚔🛡'):''};
  }
  const nameKey=card.id+'_NAME',textKey=card.id+'_TEXT';
  RAW_LOCALES['vi-VN'][nameKey]=card.name;RAW_LOCALES['vi-VN'][textKey]=card.text;
  return {id:card.id,version:card.version||1,nameKey,textKey,class:group.classId,groupId:group.id,category:card.category,categoryId:category.id,star:card.star,timing:Array.isArray(category.timing)?category.timing:[category.timing],effects:card.effects,assets};
}
for(const group of Object.values(EQUIPMENT_GROUPS))RAW_ASSETS[group.assetId]={id:group.assetId,type:'IMAGE',usage:'CARD_GROUP',source:'',fallbackGlyph:group.name};
for(const category of Object.values(EQUIPMENT_CATEGORIES))RAW_ASSETS[category.assetId]={id:category.assetId,type:'IMAGE',usage:'CARD_CATEGORY',source:'',fallbackGlyph:category.name};
const RAW_CARD_DB={};
for(const card of NEW_EQUIPMENT_CATALOG.cards){if(RAW_CARD_DB[card.id])throw new Error('Duplicate equipment ID: '+card.id);RAW_CARD_DB[card.id]=equipmentCatalogDefinition(card)}


// Confirmed 12-Hero roster; effects are resolved by generic Core primitives.
Object.assign(RAW_SKILLS,{
  "SKILL_HERO_EST_S1": {
    "id": "SKILL_HERO_EST_S1",
    "nameKey": "SKILL_HERO_EST_S1_NAME",
    "descriptionKey": "SKILL_HERO_EST_S1_DESC",
    "class": "INF",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "unitType": "TROOP",
      "range": 3
    },
    "effects": [],
    "mechanic": "SWAP",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_EST_S2": {
    "id": "SKILL_HERO_EST_S2",
    "nameKey": "SKILL_HERO_EST_S2_NAME",
    "descriptionKey": "SKILL_HERO_EST_S2_DESC",
    "class": "INF",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 2,
      "side": "ENEMY",
      "range": 99
    },
    "effects": [],
    "mechanic": "REVENGE",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_EST_S3": {
    "id": "SKILL_HERO_EST_S3",
    "nameKey": "SKILL_HERO_EST_S3_NAME",
    "descriptionKey": "SKILL_HERO_EST_S3_DESC",
    "class": "INF",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "move": 2,
      "targets": 3
    },
    "version": 2
  },
  "SKILL_HERO_KAZU_S1": {
    "id": "SKILL_HERO_KAZU_S1",
    "nameKey": "SKILL_HERO_KAZU_S1_NAME",
    "descriptionKey": "SKILL_HERO_KAZU_S1_DESC",
    "class": "INF",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "range": 1
    },
    "effects": [],
    "mechanic": "CANCEL",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_KAZU_S2": {
    "id": "SKILL_HERO_KAZU_S2",
    "nameKey": "SKILL_HERO_KAZU_S2_NAME",
    "descriptionKey": "SKILL_HERO_KAZU_S2_DESC",
    "class": "INF",
    "star": 2,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "range": 3,
      "pattern": "LINE"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 2,
      "status": "STUN",
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_KAZU_S3": {
    "id": "SKILL_HERO_KAZU_S3",
    "nameKey": "SKILL_HERO_KAZU_S3_NAME",
    "descriptionKey": "SKILL_HERO_KAZU_S3_DESC",
    "class": "INF",
    "star": 3,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "range": 4,
      "pattern": "LINE"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 1,
      "pull": true,
      "ignoreGuard": true,
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_RODOC_S1": {
    "id": "SKILL_HERO_RODOC_S1",
    "nameKey": "SKILL_HERO_RODOC_S1_NAME",
    "descriptionKey": "SKILL_HERO_RODOC_S1_DESC",
    "class": "INF",
    "star": 3,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "class": "INF",
      "range": 3,
      "requireMissingHp": true
    },
    "effects": [],
    "mechanic": "HEAL",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_RODOC_S2": {
    "id": "SKILL_HERO_RODOC_S2",
    "nameKey": "SKILL_HERO_RODOC_S2_NAME",
    "descriptionKey": "SKILL_HERO_RODOC_S2_DESC",
    "class": "INF",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 2,
      "side": "ALLY",
      "class": "INF",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "move": 2
    },
    "version": 2
  },
  "SKILL_HERO_RODOC_S3": {
    "id": "SKILL_HERO_RODOC_S3",
    "nameKey": "SKILL_HERO_RODOC_S3_NAME",
    "descriptionKey": "SKILL_HERO_RODOC_S3_DESC",
    "class": "INF",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 4,
      "side": "ENEMY",
      "range": 4,
      "pattern": "LINE",
      "selection": {
        "lineLock": true
      }
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "blockedByTerrain": true,
      "damage": 1,
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_MASK_S1": {
    "id": "SKILL_HERO_MASK_S1",
    "nameKey": "SKILL_HERO_MASK_S1_NAME",
    "descriptionKey": "SKILL_HERO_MASK_S1_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 2,
      "side": "ENEMY",
      "range": 3,
      "pattern": "LINE",
      "selection": {
        "lineLock": true
      }
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "blockedByTerrain": true,
      "damage": 1,
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_MASK_S2": {
    "id": "SKILL_HERO_MASK_S2",
    "nameKey": "SKILL_HERO_MASK_S2_NAME",
    "descriptionKey": "SKILL_HERO_MASK_S2_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "class": "CAV",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "attacks": 1
    },
    "version": 2
  },
  "SKILL_HERO_MASK_S3": {
    "id": "SKILL_HERO_MASK_S3",
    "nameKey": "SKILL_HERO_MASK_S3_NAME",
    "descriptionKey": "SKILL_HERO_MASK_S3_DESC",
    "class": "CAV",
    "star": 4,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "unitType": "HERO",
      "range": 3,
      "pattern": "LINE"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "diceDrain": true,
      "damage": 1,
      "ignoreGuard": true,
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_SOUL_S1": {
    "id": "SKILL_HERO_SOUL_S1",
    "nameKey": "SKILL_HERO_SOUL_S1_NAME",
    "descriptionKey": "SKILL_HERO_SOUL_S1_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "damage": 1,
      "move": 1
    },
    "version": 2
  },
  "SKILL_HERO_SOUL_S2": {
    "id": "SKILL_HERO_SOUL_S2",
    "nameKey": "SKILL_HERO_SOUL_S2_NAME",
    "descriptionKey": "SKILL_HERO_SOUL_S2_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "SUMMON",
    "heroAttack": false,
    "parameters": {
      "summonClass": "CAV",
      "hpCost": 1
    },
    "version": 2
  },
  "SKILL_HERO_SOUL_S3": {
    "id": "SKILL_HERO_SOUL_S3",
    "nameKey": "SKILL_HERO_SOUL_S3_NAME",
    "descriptionKey": "SKILL_HERO_SOUL_S3_DESC",
    "class": "CAV",
    "star": 3,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "unitType": "TROOP",
      "range": 3
    },
    "effects": [],
    "mechanic": "SWAP",
    "heroAttack": false,
    "parameters": {
      "directRetaliation": 1
    },
    "version": 2
  },
  "SKILL_HERO_SIRI_S1": {
    "id": "SKILL_HERO_SIRI_S1",
    "nameKey": "SKILL_HERO_SIRI_S1_NAME",
    "descriptionKey": "SKILL_HERO_SIRI_S1_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "ignoreGuard": true
    },
    "version": 2
  },
  "SKILL_HERO_SIRI_S2": {
    "id": "SKILL_HERO_SIRI_S2",
    "nameKey": "SKILL_HERO_SIRI_S2_NAME",
    "descriptionKey": "SKILL_HERO_SIRI_S2_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "ESCAPE",
    "heroAttack": false,
    "parameters": {
      "escapeRange": 3,
      "teleport": false
    },
    "version": 2
  },
  "SKILL_HERO_SIRI_S3": {
    "id": "SKILL_HERO_SIRI_S3",
    "nameKey": "SKILL_HERO_SIRI_S3_NAME",
    "descriptionKey": "SKILL_HERO_SIRI_S3_DESC",
    "class": "CAV",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "move": 3
    },
    "version": 2
  },
  "SKILL_HERO_RAEN_S1": {
    "id": "SKILL_HERO_RAEN_S1",
    "nameKey": "SKILL_HERO_RAEN_S1_NAME",
    "descriptionKey": "SKILL_HERO_RAEN_S1_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "class": "ARCH",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "range": 1
    },
    "version": 2
  },
  "SKILL_HERO_RAEN_S2": {
    "id": "SKILL_HERO_RAEN_S2",
    "nameKey": "SKILL_HERO_RAEN_S2_NAME",
    "descriptionKey": "SKILL_HERO_RAEN_S2_DESC",
    "class": "ARCH",
    "star": 2,
    "timing": "DEFENSE_REACTION",
    "target": {
        "pattern": "LINE",
      "maxTargets": 1,
      "side": "ENEMY",
      "range": "ATTACK"
    },
    "effects": [],
    "mechanic": "PUSH",
    "heroAttack": false,
    "parameters": {
      "push": 4
    },
    "version": 2
  },
  "SKILL_HERO_RAEN_S3": {
    "id": "SKILL_HERO_RAEN_S3",
    "nameKey": "SKILL_HERO_RAEN_S3_NAME",
    "descriptionKey": "SKILL_HERO_RAEN_S3_DESC",
    "class": "ARCH",
    "star": 3,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "range": 4,
      "pattern": "LINE"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 1,
      "attack": true,
      "status": "FREEZE",
      "ignoreGuard": true,
      "throughTerrain": true
    },
    "version": 2
  },
  "SKILL_HERO_XACNAS_S1": {
    "id": "SKILL_HERO_XACNAS_S1",
    "nameKey": "SKILL_HERO_XACNAS_S1_NAME",
    "descriptionKey": "SKILL_HERO_XACNAS_S1_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "class": "ARCH",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "damage": 1
    },
    "version": 2
  },
  "SKILL_HERO_XACNAS_S2": {
    "id": "SKILL_HERO_XACNAS_S2",
    "nameKey": "SKILL_HERO_XACNAS_S2_NAME",
    "descriptionKey": "SKILL_HERO_XACNAS_S2_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 2,
      "side": "ENEMY",
      "range": "ATTACK"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 1,
      "attack": true
    },
    "version": 2
  },
  "SKILL_HERO_XACNAS_S3": {
    "id": "SKILL_HERO_XACNAS_S3",
    "nameKey": "SKILL_HERO_XACNAS_S3_NAME",
    "descriptionKey": "SKILL_HERO_XACNAS_S3_DESC",
    "class": "ARCH",
    "star": 3,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "DICE_WARD",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_LUCY_S1": {
    "id": "SKILL_HERO_LUCY_S1",
    "nameKey": "SKILL_HERO_LUCY_S1_NAME",
    "descriptionKey": "SKILL_HERO_LUCY_S1_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "CANCEL",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_LUCY_S2": {
    "id": "SKILL_HERO_LUCY_S2",
    "nameKey": "SKILL_HERO_LUCY_S2_NAME",
    "descriptionKey": "SKILL_HERO_LUCY_S2_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "DEFENSE_REACTION",
    "target": {
        "pattern": "LINE",
      "maxTargets": 2,
      "side": "ENEMY",
      "range": "BASE_ATTACK"
    },
    "effects": [],
    "mechanic": "COUNTER",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_LUCY_S3": {
    "id": "SKILL_HERO_LUCY_S3",
    "nameKey": "SKILL_HERO_LUCY_S3_NAME",
    "descriptionKey": "SKILL_HERO_LUCY_S3_DESC",
    "class": "ARCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "range": "ATTACK",
      "pattern": "LINE"
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 2,
      "attack": true,
      "repeats": 2
    },
    "version": 3
  },
  "SKILL_HERO_GRIM_S1": {
    "id": "SKILL_HERO_GRIM_S1",
    "nameKey": "SKILL_HERO_GRIM_S1_NAME",
    "descriptionKey": "SKILL_HERO_GRIM_S1_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "BOTH",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "MORPH",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_GRIM_S2": {
    "id": "SKILL_HERO_GRIM_S2",
    "nameKey": "SKILL_HERO_GRIM_S2_NAME",
    "descriptionKey": "SKILL_HERO_GRIM_S2_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "BOTH",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "unitType": "TROOP",
      "range": 3
    },
    "effects": [],
    "mechanic": "CONVERT",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_GRIM_S3": {
    "id": "SKILL_HERO_GRIM_S3",
    "nameKey": "SKILL_HERO_GRIM_S3_NAME",
    "descriptionKey": "SKILL_HERO_GRIM_S3_DESC",
    "class": "ALCH",
    "star": 3,
    "timing": "BOTH",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "COPY",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_NEURO_S1": {
    "id": "SKILL_HERO_NEURO_S1",
    "nameKey": "SKILL_HERO_NEURO_S1_NAME",
    "descriptionKey": "SKILL_HERO_NEURO_S1_DESC",
    "class": "ALCH",
    "star": 4,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ENEMY",
      "unitType": "HERO",
      "range": 3
    },
    "effects": [],
    "mechanic": "SILENCE",
    "heroAttack": false,
    "parameters": {},
    "version": 2
  },
  "SKILL_HERO_NEURO_S2": {
    "id": "SKILL_HERO_NEURO_S2",
    "nameKey": "SKILL_HERO_NEURO_S2_NAME",
    "descriptionKey": "SKILL_HERO_NEURO_S2_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "BOTH",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "SUMMON",
    "heroAttack": false,
    "parameters": {
      "requiresDeath": true
    },
    "version": 2
  },
  "SKILL_HERO_NEURO_S3": {
    "id": "SKILL_HERO_NEURO_S3",
    "nameKey": "SKILL_HERO_NEURO_S3_NAME",
    "descriptionKey": "SKILL_HERO_NEURO_S3_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 2,
      "side": "ALLY",
      "range": 3
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "move": 2
    },
    "version": 2
  },
  "SKILL_HERO_RANUS_S1": {
    "id": "SKILL_HERO_RANUS_S1",
    "nameKey": "SKILL_HERO_RANUS_S1_NAME",
    "descriptionKey": "SKILL_HERO_RANUS_S1_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "BOTH",
    "target": {
      "maxTargets": 1,
      "side": "SELF"
    },
    "effects": [],
    "mechanic": "ESCAPE",
    "heroAttack": false,
    "parameters": {
      "escapeRange": 4,
      "teleport": true
    },
    "version": 2
  },
  "SKILL_HERO_RANUS_S2": {
    "id": "SKILL_HERO_RANUS_S2",
    "nameKey": "SKILL_HERO_RANUS_S2_NAME",
    "descriptionKey": "SKILL_HERO_RANUS_S2_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 1,
      "side": "ALLY",
      "range": 2
    },
    "effects": [],
    "mechanic": "BUFF",
    "heroAttack": false,
    "parameters": {
      "attacks": 1,
      "move": 1
    },
    "version": 2
  },
  "SKILL_HERO_RANUS_S3": {
    "id": "SKILL_HERO_RANUS_S3",
    "nameKey": "SKILL_HERO_RANUS_S3_NAME",
    "descriptionKey": "SKILL_HERO_RANUS_S3_DESC",
    "class": "ALCH",
    "star": 1,
    "timing": "ACTIVE",
    "target": {
      "maxTargets": 4,
      "side": "ENEMY",
      "range": 2
    },
    "effects": [],
    "mechanic": "STRIKE",
    "heroAttack": true,
    "parameters": {
      "damage": 1,
      "attack": true,
      "throughTerrain": true
    },
    "version": 2
  }
});
Object.assign(RAW_HERO_DB,{
  "HERO_INF_EST": {
    "id": "HERO_INF_EST",
    "nameKey": "HERO_INF_EST_NAME",
    "class": "INF",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_EST_S1",
      "SKILL_HERO_EST_S2",
      "SKILL_HERO_EST_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_INF_KAZU": {
    "id": "HERO_INF_KAZU",
    "nameKey": "HERO_INF_KAZU_NAME",
    "class": "INF",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_KAZU_S1",
      "SKILL_HERO_KAZU_S2",
      "SKILL_HERO_KAZU_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_INF_RODOC": {
    "id": "HERO_INF_RODOC",
    "nameKey": "HERO_INF_RODOC_NAME",
    "class": "INF",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_RODOC_S1",
      "SKILL_HERO_RODOC_S2",
      "SKILL_HERO_RODOC_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_CAV_MASK": {
    "id": "HERO_CAV_MASK",
    "nameKey": "HERO_CAV_MASK_NAME",
    "class": "CAV",
    "stats": {
      "hp": 3,
      "move": 3,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_MASK_S1",
      "SKILL_HERO_MASK_S2",
      "SKILL_HERO_MASK_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_CAV_SOUL": {
    "id": "HERO_CAV_SOUL",
    "nameKey": "HERO_CAV_SOUL_NAME",
    "class": "CAV",
    "stats": {
      "hp": 3,
      "move": 3,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_SOUL_S1",
      "SKILL_HERO_SOUL_S2",
      "SKILL_HERO_SOUL_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_CAV_SIRI": {
    "id": "HERO_CAV_SIRI",
    "nameKey": "HERO_CAV_SIRI_NAME",
    "class": "CAV",
    "stats": {
      "hp": 3,
      "move": 3,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_SIRI_S1",
      "SKILL_HERO_SIRI_S2",
      "SKILL_HERO_SIRI_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ARCH_RAEN": {
    "id": "HERO_ARCH_RAEN",
    "nameKey": "HERO_ARCH_RAEN_NAME",
    "class": "ARCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 3
    },
    "attackPattern": "LINE",
    "skillIds": [
      "SKILL_HERO_RAEN_S1",
      "SKILL_HERO_RAEN_S2",
      "SKILL_HERO_RAEN_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ARCH_XACNAS": {
    "id": "HERO_ARCH_XACNAS",
    "nameKey": "HERO_ARCH_XACNAS_NAME",
    "class": "ARCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 3
    },
    "attackPattern": "LINE",
    "skillIds": [
      "SKILL_HERO_XACNAS_S1",
      "SKILL_HERO_XACNAS_S2",
      "SKILL_HERO_XACNAS_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ARCH_LUCY": {
    "id": "HERO_ARCH_LUCY",
    "nameKey": "HERO_ARCH_LUCY_NAME",
    "class": "ARCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 3
    },
    "attackPattern": "LINE",
    "skillIds": [
      "SKILL_HERO_LUCY_S1",
      "SKILL_HERO_LUCY_S2",
      "SKILL_HERO_LUCY_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ALCH_GRIM": {
    "id": "HERO_ALCH_GRIM",
    "nameKey": "HERO_ALCH_GRIM_NAME",
    "class": "ALCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_GRIM_S1",
      "SKILL_HERO_GRIM_S2",
      "SKILL_HERO_GRIM_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ALCH_NEURO": {
    "id": "HERO_ALCH_NEURO",
    "nameKey": "HERO_ALCH_NEURO_NAME",
    "class": "ALCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_NEURO_S1",
      "SKILL_HERO_NEURO_S2",
      "SKILL_HERO_NEURO_S3"
    ],
    "assets": {},
    "version": 2
  },
  "HERO_ALCH_RANUS": {
    "id": "HERO_ALCH_RANUS",
    "nameKey": "HERO_ALCH_RANUS_NAME",
    "class": "ALCH",
    "stats": {
      "hp": 3,
      "move": 1,
      "attackRange": 1
    },
    "attackPattern": "RANGE",
    "skillIds": [
      "SKILL_HERO_RANUS_S1",
      "SKILL_HERO_RANUS_S2",
      "SKILL_HERO_RANUS_S3"
    ],
    "assets": {},
    "version": 2
  }
});
Object.assign(RAW_LOCALES["vi-VN"],{
  "SKILL_HERO_EST_S1_NAME": "Phi Thân",
  "SKILL_HERO_EST_S1_DESC": "Phi Thân · ★ · Đổi chỗ với một lính đồng đội cách 3 ô; lính nhận đòn thay và được phòng thủ.",
  "SKILL_HERO_EST_S2_NAME": "Phục Thù",
  "SKILL_HERO_EST_S2_DESC": "Phục Thù · ★ · Gây 1 sát thương lên tối đa 2 địch đã đánh đồng đội cách Est 3 ô trong lượt công này, kể cả đồng đội đã chết.",
  "SKILL_HERO_EST_S3_NAME": "Ác Mộng Phía Đông",
  "SKILL_HERO_EST_S3_DESC": "Ác Mộng Phía Đông · ★ · +2 Move, +3 mục tiêu cho đòn đánh; dùng sát thương cơ bản và trang bị. Hết lượt công.",
  "HERO_INF_EST_NAME": "Est",
  "SKILL_HERO_KAZU_S1_NAME": "Khiên Rồng",
  "SKILL_HERO_KAZU_S1_DESC": "Khiên Rồng · ★ · Hủy sát thương và hiệu ứng lên Kazu hoặc một lính cách 1 ô.",
  "SKILL_HERO_KAZU_S2_NAME": "Khóa Xích",
  "SKILL_HERO_KAZU_S2_DESC": "Khóa Xích · ★★ · Gây 2 sát thương, stun đến hết lượt công kế tiếp của bên bị stun.",
  "SKILL_HERO_KAZU_S3_NAME": "Xích Quỷ Kazu",
  "SKILL_HERO_KAZU_S3_DESC": "Xích Quỷ Kazu · ★★★ · Gây 1 sát thương rồi kéo 1 địch còn sống về hex trước mặt; đường và ô đích trống. Cấm Guard bộ binh.",
  "HERO_INF_KAZU_NAME": "Kazu",
  "SKILL_HERO_RODOC_S1_NAME": "Hồi Sức",
  "SKILL_HERO_RODOC_S1_DESC": "Hồi Sức · ★★★ · Hồi 1 HP cho bộ binh còn sống. Khi nhận đòn, HP sau tổng hồi phải lớn hơn sát thương sẽ nhận.",
  "SKILL_HERO_RODOC_S2_NAME": "Tiếng Thét Xung Trận",
  "SKILL_HERO_RODOC_S2_DESC": "Tiếng Thét Xung Trận · ★ · +2 Move cho tối đa 2 bộ binh chưa Attack, được đi thêm ngay. Hết lượt công.",
  "SKILL_HERO_RODOC_S3_NAME": "Chiến Thần",
  "SKILL_HERO_RODOC_S3_DESC": "Chiến Thần · ★ · Gây 1 sát thương mỗi mục tiêu, tối đa 4 địch cùng đường thẳng; chọn qua lính/Hero nhưng không qua vật cản địa hình, không có xuyên mặc định.",
  "HERO_INF_RODOC_NAME": "Rodoc",
  "SKILL_HERO_MASK_S1_NAME": "Ma Kích",
  "SKILL_HERO_MASK_S1_DESC": "Ma Kích · ★ · Gây 1 sát thương lên tối đa 2 địch cùng đường thẳng cách 3 ô; chọn qua lính/Hero nhưng không qua vật cản địa hình, không lan.",
  "SKILL_HERO_MASK_S2_NAME": "Phán Quyết",
  "SKILL_HERO_MASK_S2_DESC": "Phán Quyết · ★ · +1 lần đánh cho kỵ binh chưa Attack; mỗi lần có phòng thủ riêng. Hết lượt công.",
  "SKILL_HERO_MASK_S3_NAME": "Cán Cân Công Lý",
  "SKILL_HERO_MASK_S3_DESC": "Cán Cân Công Lý · ★★★★ · Roll chẵn: 2 sát thương/hồi 2 HP; lẻ: 1/1. Mask vẫn hồi khi đòn bị né/hủy. Cấm Guard bộ binh.",
  "HERO_CAV_MASK_NAME": "Mask",
  "SKILL_HERO_SOUL_S1_NAME": "Ám Kỵ",
  "SKILL_HERO_SOUL_S1_DESC": "Ám Kỵ · ★ · +1 sát thương và +1 Move trong lượt công; chưa Attack được đi thêm ngay.",
  "SKILL_HERO_SOUL_S2_NAME": "Triệu Gọi Ám Hồn",
  "SKILL_HERO_SOUL_S2_DESC": "Triệu Gọi Ám Hồn · ★ · Trả 1 HP, tạo kỵ binh mới tại hex trống cạnh Soul. Lính hành động ngay. Soul trả HP cuối vẫn chết/thua Duel.",
  "SKILL_HERO_SOUL_S3_NAME": "Thây Độc",
  "SKILL_HERO_SOUL_S3_DESC": "Thây Độc · ★★★ · Đổi chỗ với lính đồng đội, lính được phòng thủ. Kẻ đánh mất trực tiếp 1 HP kể cả đòn bị né/hủy.",
  "HERO_CAV_SOUL_NAME": "Soul",
  "SKILL_HERO_SIRI_S1_NAME": "Săn Người",
  "SKILL_HERO_SIRI_S1_DESC": "Săn Người · ★ · Các đòn thường và skill Attack của Siri cấm Guard bộ binh trong lượt công.",
  "SKILL_HERO_SIRI_S2_NAME": "Phong Bộ",
  "SKILL_HERO_SIRI_S2_DESC": "Phong Bộ · ★ · Di chuyển tối đa 3 ô, xuyên quân, tuân địa hình; đổi ô đích hợp lệ để hủy sát thương và hiệu ứng.",
  "SKILL_HERO_SIRI_S3_NAME": "Ám Phong",
  "SKILL_HERO_SIRI_S3_DESC": "Ám Phong · ★ · +3 Move cho 1 đồng đội chưa Attack, gồm Siri; đi thêm ngay. Hết lượt công.",
  "HERO_CAV_SIRI_NAME": "Siri",
  "SKILL_HERO_RAEN_S1_NAME": "Viễn Tiễn",
  "SKILL_HERO_RAEN_S1_DESC": "Viễn Tiễn · ★ · +1 tầm cho đòn thường và skill Attack của cung thủ chưa Attack. Hết lượt công.",
  "SKILL_HERO_RAEN_S2_NAME": "Tên Lưới",
  "SKILL_HERO_RAEN_S2_DESC": "Tên Lưới · ★★ · Sau khi đồng đội/Raen bị đánh, chọn địch trong tầm, đẩy tối đa 4 ô rồi trói hết lượt công đối phương. Vẫn được dùng trang bị.",
  "SKILL_HERO_RAEN_S3_NAME": "Hàn Tiễn",
  "SKILL_HERO_RAEN_S3_DESC": "Hàn Tiễn · ★★★ · Gây 1 sát thương, đóng băng tới hết lượt hiện tại khi trúng kể cả 0 damage; xuyên quân/vật cản. Cấm Guard bộ binh.",
  "HERO_ARCH_RAEN_NAME": "Raen",
  "SKILL_HERO_XACNAS_S1_NAME": "Lời Chào Của Quỷ",
  "SKILL_HERO_XACNAS_S1_DESC": "Lời Chào Của Quỷ · ★ · +1 sát thương cho cung thủ chưa Attack, áp dụng đòn thường/skill Attack. Hết lượt công.",
  "SKILL_HERO_XACNAS_S2_NAME": "Bão Phi Đao",
  "SKILL_HERO_XACNAS_S2_DESC": "Bão Phi Đao · ★ · Gây 1 sát thương mỗi mục tiêu, tối đa 2 địch trong tầm hiện tại, không cần cùng đường thẳng.",
  "SKILL_HERO_XACNAS_S3_NAME": "Phân Bóng",
  "SKILL_HERO_XACNAS_S3_DESC": "Phân Bóng · ★★★ · Chọn 2 số xúc xắc cho cả lượt thủ; mỗi lần đánh roll riêng, sai số hủy đòn và hiệu ứng. Kết hợp Guard/skill/trang bị hợp lệ.",
  "HERO_ARCH_XACNAS_NAME": "Xacnas",
  "SKILL_HERO_LUCY_S1_NAME": "Phân Ảnh",
  "SKILL_HERO_LUCY_S1_DESC": "Phân Ảnh · ★ · Hủy sát thương và hiệu ứng của một đòn nhắm Lucy, không ảnh hưởng mục tiêu khác.",
  "SKILL_HERO_LUCY_S2_NAME": "Bắn Trả",
  "SKILL_HERO_LUCY_S2_DESC": "Bắn Trả · ★ · Sau sát thương, nếu Lucy sống, bắn tối đa 2 địch bằng tầm/sát thương cơ bản, không buff/trang bị; địch không được thủ.",
  "SKILL_HERO_LUCY_S3_NAME": "Điên Cuồng",
  "SKILL_HERO_LUCY_S3_DESC": "Điên Cuồng · ★ · Dùng tầm đánh cung thủ: cơ bản 3 ô theo đường thẳng, được tăng tầm bởi buff/trang bị. Bắn 2 lần trong cùng commit, mỗi lần 2 sát thương; chọn mục tiêu riêng, mở thủ riêng, được thêm buff/trang bị.",
  "HERO_ARCH_LUCY_NAME": "Lucy",
  "SKILL_HERO_GRIM_S1_NAME": "Giả Dạng",
  "SKILL_HERO_GRIM_S1_DESC": "Giả Dạng · ★ · Biến thành chủng lính hợp mode tới lần biến tiếp; giữ Hero và HP. Trang bị không hợp chủng trả về hand.",
  "SKILL_HERO_GRIM_S2_NAME": "Cải Tạo Nhanh",
  "SKILL_HERO_GRIM_S2_DESC": "Cải Tạo Nhanh · ★ · Đổi vĩnh viễn chủng 1 lính đồng đội, đầy HP chủng mới, giữ trạng thái hành động; được dùng thủ của chủng mới.",
  "SKILL_HERO_GRIM_S3_NAME": "Sao Chép",
  "SKILL_HERO_GRIM_S3_DESC": "Sao Chép · ★★★ · Dùng skill Hero địch đã dùng trong trận, kể cả Hero chết; dùng chỉ số/vị trí Grim, sao hiệu lực min(sao gốc,3).",
  "HERO_ALCH_GRIM_NAME": "Grim",
  "SKILL_HERO_NEURO_S1_NAME": "Thuốc Câm",
  "SKILL_HERO_NEURO_S1_DESC": "Thuốc Câm · ★★★★ · Khóa skill thủ 1 Hero tới hết lượt thủ hiện tại, không damage/commit; được né/hủy trước khi khóa, Guard/trang bị vẫn hợp lệ.",
  "SKILL_HERO_NEURO_S2_NAME": "Triệu Gọi",
  "SKILL_HERO_NEURO_S2_DESC": "Triệu Gọi · ★ · Sau khi từng có lính đồng đội chết, tạo mới lính đầy HP cạnh Neuro. Không tiêu thụ xác; giới hạn theo mode.",
  "SKILL_HERO_NEURO_S3_NAME": "Thuốc Cấm",
  "SKILL_HERO_NEURO_S3_DESC": "Thuốc Cấm · ★ · +2 Move cho tối đa 2 đồng đội chưa Attack, gồm Neuro; đi thêm ngay. Hết lượt công.",
  "HERO_ALCH_NEURO_NAME": "Neuro",
  "SKILL_HERO_RANUS_S1_NAME": "Dịch Chuyển",
  "SKILL_HERO_RANUS_S1_DESC": "Dịch Chuyển · ★ · Dịch chuyển tới ô khác cách 4 ô, bỏ qua đường/quân/vật cản. Lượt thủ hủy đòn/hiệu ứng. Không tốn Move thường.",
  "SKILL_HERO_RANUS_S2_NAME": "Thuật Cường Hóa",
  "SKILL_HERO_RANUS_S2_DESC": "Thuật Cường Hóa · ★ · +1 lần đánh và +1 Move cho đồng đội chưa Attack, gồm Ranus; áp dụng đòn thường/skill Attack. Hết lượt công.",
  "SKILL_HERO_RANUS_S3_NAME": "Bùng Cháy",
  "SKILL_HERO_RANUS_S3_DESC": "Bùng Cháy · ★ · Gây 1 sát thương lên tối đa 4 địch quanh 2 ô, chọn qua quân/vật cản; được thêm chỉ số trang bị.",
  "HERO_ALCH_RANUS_NAME": "Ranus"
});

// Every Hero has a distinct, readable fallback token until portraits are supplied.
for(const h of Object.values(RAW_HERO_DB)){
  const name=RAW_LOCALES['vi-VN'][h.nameKey];const token='IMG_'+h.id+'_ROSTER_TOKEN';
  RAW_ASSETS[token]={type:'IMAGE',usage:'TOKEN',source:'HERO_INITIALS',fallbackGlyph:name.slice(0,2).toUpperCase()};
  h.assets={...h.assets,token};
}

// ===== CONTENT SCHEMA v1.5 / PART 12.5 CONTENT MIGRATION + BACKWARD COMPATIBILITY =====
// Canonical, data-driven content boundary shared by offline engine and future online server.
// v1.5 keeps the manifest/handshake architecture and adds explicit schema migration, historical content resolution, persistence envelopes, and backward-compatibility policies.
// Gameplay behavior remains unchanged; legacy adapters are localized views over canonical definitions.
const CONTENT_SCHEMA_VERSION='1.5';
const CONTENT_TYPES=Object.freeze({
  ASSET:'ASSET', EFFECT:'EFFECT', STATUS:'STATUS', SKILL:'SKILL', HERO:'HERO', UNIT:'UNIT', EQUIPMENT:'EQUIPMENT', DECK:'DECK'
});

function deepFreeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

const LocalizationRegistry=Object.freeze({
  id:'LOCALIZATION_REGISTRY',version:1,defaultLocale:'vi-VN',locales:deepFreeze(RAW_LOCALES),
  hasLocale(locale){return !!this.locales[locale]},
  t(key,{locale=this.defaultLocale,fallback=key}={}){return this.locales[locale]?.[key]??this.locales[this.defaultLocale]?.[key]??fallback}
});
let ACTIVE_LOCALE='vi-VN';
function setActiveLocale(locale){if(!LocalizationRegistry.hasLocale(locale))return false;ACTIVE_LOCALE=locale;return true}
function tContent(key,fallback=key){return LocalizationRegistry.t(key,{locale:ACTIVE_LOCALE,fallback})}

function normalizeContentTable(rawTable,contentType,normalizer=null){
  return Object.freeze(Object.fromEntries(Object.entries(rawTable).map(([key,raw])=>{
    const id=raw.id||key;
    let record={...raw,id,version:Number.isInteger(raw.version)?raw.version:1,schemaVersion:CONTENT_SCHEMA_VERSION,contentType,enabled:raw.enabled!==false,tags:Array.isArray(raw.tags)?raw.tags:[]};
    if(normalizer)record=normalizer(record);
    return [key,deepFreeze(record)];
  })));
}

function equipmentEligibility(record){
  if(record.eligibility)return record.eligibility;
  if(record.class===CLASS.NEU)return {mode:'ANY',classIds:Object.values(CLASS)};
  return {mode:'CLASS_LIST',classIds:[record.class]};
}

function skillEligibility(record){
  if(record.eligibility)return record.eligibility;
  return {mode:'CLASS_LIST',classIds:[record.class]};
}

// No persistent Status Definition is currently required by the stable Duel build.
// Runtime move/damage buffs remain compatibility runtime modifiers until exact status duration
// content is explicitly locked. Keeping this registry empty avoids inventing gameplay rules.
const RAW_STATUS_DB=Object.freeze({});

const ASSETS=normalizeContentTable(RAW_ASSETS,CONTENT_TYPES.ASSET);
const EFFECTS=normalizeContentTable(RAW_EFFECTS,CONTENT_TYPES.EFFECT);
const STATUS_DB=normalizeContentTable(RAW_STATUS_DB,CONTENT_TYPES.STATUS);
const SKILLS=normalizeContentTable(RAW_SKILLS,CONTENT_TYPES.SKILL,s=>({...s,eligibility:skillEligibility(s)}));
const HERO_DB=normalizeContentTable(RAW_HERO_DB,CONTENT_TYPES.HERO,h=>{
  const rule=HERO_CLASS_RULES[h.class];
  return rule?{...h,stats:{...rule.defaultStats,...h.stats},attackPattern:h.attackPattern||rule.attackPattern}:h;
});
const UNIT_DB=normalizeContentTable(RAW_UNIT_DB,CONTENT_TYPES.UNIT);
const EQUIPMENT_DB=normalizeContentTable(RAW_CARD_DB,CONTENT_TYPES.EQUIPMENT,e=>({...e,eligibility:equipmentEligibility(e)}));

// Explicit per-card quantities; an empty catalog is a valid equipment-free transition.
const RAW_DECK_DB=Object.freeze({
  DECK_DUEL_STANDARD_001:{
    id:'DECK_DUEL_STANDARD_001',version:3,declaredSize:null,
    compositionStatus:NEW_EQUIPMENT_CATALOG.cards.some(c=>c.count>0)?'LOCKED':'EMPTY',
    allowedEquipmentIds:NEW_EQUIPMENT_CATALOG.cards.filter(c=>c.count>0).map(c=>c.id),
    entries:NEW_EQUIPMENT_CATALOG.cards.filter(c=>c.count>0).map(c=>({equipmentId:c.id,count:c.count}))
  }
});
const DECK_DB=normalizeContentTable(RAW_DECK_DB,CONTENT_TYPES.DECK);
// Legacy alias retained so existing stable Duel code continues to run unchanged.
const CARD_DB=EQUIPMENT_DB;

function createTypedRegistry(id,table){
  return Object.freeze({
    id,version:CONTENT_SCHEMA_VERSION,
    get(contentId){return table[contentId]||null},
    has(contentId){return !!table[contentId]},
    list({enabledOnly=true}={}){const rows=Object.values(table);return enabledOnly?rows.filter(x=>x.enabled!==false):rows},
    byClass(classId,{enabledOnly=true}={}){return this.list({enabledOnly}).filter(x=>x.class===classId||x.eligibility?.classIds?.includes(classId))},
    ids(){return Object.keys(table)}
  });
}

const AssetRegistry=createTypedRegistry('ASSET_REGISTRY',ASSETS);
const EffectRegistry=createTypedRegistry('EFFECT_REGISTRY',EFFECTS);
const StatusRegistry=createTypedRegistry('STATUS_REGISTRY',STATUS_DB);
const SkillRegistry=createTypedRegistry('SKILL_REGISTRY',SKILLS);
const HeroRegistry=createTypedRegistry('HERO_REGISTRY',HERO_DB);
const UnitRegistry=createTypedRegistry('UNIT_REGISTRY',UNIT_DB);
const EquipmentRegistry=createTypedRegistry('EQUIPMENT_REGISTRY',EQUIPMENT_DB);
const DeckRegistry=createTypedRegistry('DECK_REGISTRY',DECK_DB);

const CONTENT_TYPE_TABLE_KEY=Object.freeze({
  [CONTENT_TYPES.ASSET]:'assets',[CONTENT_TYPES.EFFECT]:'effects',[CONTENT_TYPES.STATUS]:'statuses',[CONTENT_TYPES.SKILL]:'skills',[CONTENT_TYPES.HERO]:'heroes',[CONTENT_TYPES.UNIT]:'units',[CONTENT_TYPES.EQUIPMENT]:'equipment',[CONTENT_TYPES.DECK]:'decks'
});
const ContentRegistry=Object.freeze({
  id:'CORE_CONTENT_REGISTRY',version:CONTENT_SCHEMA_VERSION,
  tables:Object.freeze({assets:ASSETS,effects:EFFECTS,statuses:STATUS_DB,skills:SKILLS,heroes:HERO_DB,units:UNIT_DB,equipment:EQUIPMENT_DB,cards:EQUIPMENT_DB,decks:DECK_DB}),
  registries:Object.freeze({assets:AssetRegistry,effects:EffectRegistry,statuses:StatusRegistry,skills:SkillRegistry,heroes:HeroRegistry,units:UnitRegistry,equipment:EquipmentRegistry,cards:EquipmentRegistry,decks:DeckRegistry}),
  tableKey(type){return CONTENT_TYPE_TABLE_KEY[type]||type},
  get(type,id){return this.tables[this.tableKey(type)]?.[id]||null},
  has(type,id){return !!this.get(type,id)},
  list(type,{enabledOnly=true}={}){const rows=Object.values(this.tables[this.tableKey(type)]||{});return enabledOnly?rows.filter(x=>x.enabled!==false):rows}
});

const CONTENT_SCHEMA=deepFreeze({
  version:CONTENT_SCHEMA_VERSION,
  HERO:{idPrefix:'HERO_',required:['id','version','nameKey','class','stats','skillIds','assets']},
  UNIT:{idPrefix:'UNIT_',required:['id','version','nameKey','class','stats','passives','assets']},
  SKILL:{idPrefix:'SKILL_',required:['id','version','nameKey','descriptionKey','class','timing','target','effects','eligibility']},
  EQUIPMENT:{idPrefixes:['CARD_','EQUIP_'],required:['id','version','nameKey','textKey','class','category','star','timing','effects','eligibility']},
  STATUS:{idPrefix:'STATUS_',required:['id','version']},
  EFFECT:{idPrefix:'EFFECT_',required:['id','version','type']},
  ASSET:{idPrefixes:['IMG_','VFX_','ANIM_'],required:['version','type']},
  DECK:{idPrefix:'DECK_',required:['id','version','compositionStatus','allowedEquipmentIds'],optional:['declaredSize','entries','runtimeCompatibility']}
});

const CONTENT_PACK_DUEL_001=deepFreeze({
  id:'CONTENT_PACK_DUEL_001',version:1,schemaVersion:CONTENT_SCHEMA_VERSION,
  heroes:Object.keys(HERO_DB),units:Object.keys(UNIT_DB),skills:Object.keys(SKILLS),equipment:Object.keys(EQUIPMENT_DB),decks:Object.keys(DECK_DB),statuses:Object.keys(STATUS_DB),effects:Object.keys(EFFECTS),assets:Object.keys(ASSETS)
});
const ContentPackRegistry=Object.freeze({
  id:'CONTENT_PACK_REGISTRY',version:1,
  packs:Object.freeze({CONTENT_PACK_DUEL_001}),
  get(id){return this.packs[id]||null},
  has(id){return !!this.get(id)}
});

function validateContentSchema(){
  const errors=[],warnings=[],validClass=new Set(Object.values(CLASS));
  for(const [id,e] of Object.entries(EQUIPMENT_DB))if(HERO_CLASS_RULES[e.class]?.equipmentClassIds&&!HERO_CLASS_RULES[e.class].equipmentClassIds.includes(e.class))errors.push(`${id}: class ${e.class} uses common equipment only`);
  const req=(record,spec,label)=>{for(const field of spec.required||[])if(record[field]===undefined||record[field]===null)errors.push(`${label}: missing ${field}`)};
  const keyId=(key,record,label)=>{if(record.id!==key)errors.push(`${label}: key/id mismatch (${key} != ${record.id})`)};
  const prefixAny=(record,prefixes,label)=>{if(!prefixes.some(p=>record.id.startsWith(p)))errors.push(`${label}: invalid id prefix`)};
  const positiveVersion=(record,label)=>{if(!Number.isInteger(record.version)||record.version<1)errors.push(`${label}: invalid version`)};
  const validateEligibility=(record,label)=>{
    const e=record.eligibility;
    if(!e||!Array.isArray(e.classIds)||!e.classIds.length)errors.push(`${label}: invalid eligibility`);
    else for(const classId of e.classIds)if(!validClass.has(classId))errors.push(`${label}: invalid eligibility class ${classId}`);
  };
  for(const [id,e] of Object.entries(EFFECTS)){keyId(id,e,id);req(e,CONTENT_SCHEMA.EFFECT,id);prefixAny(e,['EFFECT_'],id);positiveVersion(e,id)}
  for(const [id,s] of Object.entries(STATUS_DB)){keyId(id,s,id);req(s,CONTENT_SCHEMA.STATUS,id);prefixAny(s,['STATUS_'],id);positiveVersion(s,id)}
  for(const [id,s] of Object.entries(SKILLS)){keyId(id,s,id);req(s,CONTENT_SCHEMA.SKILL,id);prefixAny(s,['SKILL_'],id);positiveVersion(s,id);if(!validClass.has(s.class))errors.push(`${id}: invalid class ${s.class}`);validateEligibility(s,id);if(s.star!==undefined&&s.star!==null&&(!Number.isInteger(s.star)||s.star<0))errors.push(`${id}: invalid star`);for(const effectId of s.effects||[])if(!EFFECTS[effectId])errors.push(`${id}: missing effect ${effectId}`)}
  for(const [id,h] of Object.entries(HERO_DB)){keyId(id,h,id);req(h,CONTENT_SCHEMA.HERO,id);prefixAny(h,['HERO_'],id);positiveVersion(h,id);if(!validClass.has(h.class))errors.push(`${id}: invalid class ${h.class}`);if(!Number.isFinite(h.stats?.hp)||h.stats.hp<=0)errors.push(`${id}: invalid stats.hp`);if(!Number.isFinite(h.stats?.move)||h.stats.move<0)errors.push(`${id}: invalid stats.move`);if(!Number.isFinite(h.stats?.attackRange)||h.stats.attackRange<1)errors.push(`${id}: invalid stats.attackRange`);for(const skillId of h.skillIds||[])if(!SKILLS[skillId])errors.push(`${id}: missing skill ${skillId}`);for(const assetId of Object.values(h.assets||{}))if(assetId&&!ASSETS[assetId])errors.push(`${id}: missing asset ${assetId}`)}
  for(const [id,u] of Object.entries(UNIT_DB))for(const assetId of Object.values(u.assets||{}))if(assetId&&!ASSETS[assetId])errors.push(`${id}: missing asset ${assetId}`);
  const locale=RAW_LOCALES['vi-VN']||{};for(const r of [...Object.values(HERO_DB),...Object.values(UNIT_DB)])if(!locale[r.nameKey])errors.push(`${r.id}: missing locale key ${r.nameKey}`);for(const r of Object.values(SKILLS)){if(!locale[r.nameKey])errors.push(`${r.id}: missing locale key ${r.nameKey}`);if(!locale[r.descriptionKey])errors.push(`${r.id}: missing locale key ${r.descriptionKey}`)}for(const r of Object.values(EQUIPMENT_DB)){if(!locale[r.nameKey])errors.push(`${r.id}: missing locale key ${r.nameKey}`);if(!locale[r.textKey])errors.push(`${r.id}: missing locale key ${r.textKey}`)}
  for(const [id,u] of Object.entries(UNIT_DB)){keyId(id,u,id);req(u,CONTENT_SCHEMA.UNIT,id);prefixAny(u,['UNIT_'],id);positiveVersion(u,id);if(!validClass.has(u.class))errors.push(`${id}: invalid class ${u.class}`);if(HERO_CLASS_RULES[u.class]?.heroOnly)errors.push(`${id}: class ${u.class} is Hero-only`);if(!Number.isFinite(u.stats?.hp)||u.stats.hp<=0)errors.push(`${id}: invalid stats.hp`);if(!Number.isFinite(u.stats?.move)||u.stats.move<0)errors.push(`${id}: invalid stats.move`);if(!Number.isFinite(u.stats?.attackRange)||u.stats.attackRange<1)errors.push(`${id}: invalid stats.attackRange`)}
  for(const [id,c] of Object.entries(EQUIPMENT_DB)){keyId(id,c,id);req(c,CONTENT_SCHEMA.EQUIPMENT,id);prefixAny(c,CONTENT_SCHEMA.EQUIPMENT.idPrefixes,id);positiveVersion(c,id);if(!validClass.has(c.class))errors.push(`${id}: invalid class ${c.class}`);validateEligibility(c,id);if(!Number.isInteger(c.star)||c.star<1)errors.push(`${id}: invalid star`);for(const effectId of c.effects||[])if(!EFFECTS[effectId])errors.push(`${id}: missing effect ${effectId}`)}
  for(const [id,a] of Object.entries(ASSETS)){keyId(id,a,id);req(a,CONTENT_SCHEMA.ASSET,id);positiveVersion(a,id);if(!CONTENT_SCHEMA.ASSET.idPrefixes.some(p=>id.startsWith(p)))warnings.push(`${id}: non-standard asset prefix`)}
  for(const [id,d] of Object.entries(DECK_DB)){
    keyId(id,d,id);req(d,CONTENT_SCHEMA.DECK,id);prefixAny(d,['DECK_'],id);positiveVersion(d,id);
    if(d.declaredSize!==null&&d.declaredSize!==undefined&&(!Number.isInteger(d.declaredSize)||d.declaredSize<1))errors.push(`${id}: invalid declaredSize`);
    if(!Array.isArray(d.allowedEquipmentIds)||(!d.allowedEquipmentIds.length&&d.compositionStatus!=='EMPTY'))errors.push(`${id}: no allowed equipment`);
    else for(const equipmentId of d.allowedEquipmentIds)if(!EQUIPMENT_DB[equipmentId])errors.push(`${id}: missing equipment ${equipmentId}`);
    if(d.compositionStatus==='EMPTY'){
      if(d.entries?.length||d.allowedEquipmentIds?.length)errors.push(`${id}: EMPTY deck must contain no equipment`);
    }else if(d.compositionStatus==='LOCKED'){
      if(!Array.isArray(d.entries)||!d.entries.length)errors.push(`${id}: LOCKED deck requires entries`);
      else{
        let total=0;
        for(const entry of d.entries){
          if(!EQUIPMENT_DB[entry.equipmentId])errors.push(`${id}: missing equipment ${entry.equipmentId}`);
          if(!Number.isInteger(entry.count)||entry.count<1)errors.push(`${id}: invalid count for ${entry.equipmentId}`);
          else total+=entry.count;
        }
        if(d.declaredSize!==null&&d.declaredSize!==undefined&&total!==d.declaredSize)errors.push(`${id}: declaredSize ${d.declaredSize} != entries total ${total}`);
      }
    }else warnings.push(`${id}: deck size/copy distribution is ${d.compositionStatus}; compatibility pool is non-authoritative`);
  }
  const pack=CONTENT_PACK_DUEL_001;
  for(const id of pack.heroes)if(!HERO_DB[id])errors.push(`${pack.id}: missing hero ${id}`);
  for(const id of pack.units)if(!UNIT_DB[id])errors.push(`${pack.id}: missing unit ${id}`);
  for(const id of pack.skills)if(!SKILLS[id])errors.push(`${pack.id}: missing skill ${id}`);
  for(const id of pack.equipment)if(!EQUIPMENT_DB[id])errors.push(`${pack.id}: missing equipment ${id}`);
  for(const id of pack.decks)if(!DECK_DB[id])errors.push(`${pack.id}: missing deck ${id}`);
  return deepFreeze({ok:errors.length===0,errors,warnings,counts:{heroes:Object.keys(HERO_DB).length,units:Object.keys(UNIT_DB).length,skills:Object.keys(SKILLS).length,equipment:Object.keys(EQUIPMENT_DB).length,decks:Object.keys(DECK_DB).length,statuses:Object.keys(STATUS_DB).length,effects:Object.keys(EFFECTS).length,assets:Object.keys(ASSETS).length}});
}

const CONTENT_VALIDATION=validateContentSchema();
if(!CONTENT_VALIDATION.ok){console.error('[CONTENT SCHEMA INVALID]',CONTENT_VALIDATION.errors);throw new Error('CONTENT_SCHEMA_v1.5 validation failed')}

function effectOf(entity,effectId){return !!entity?.effects?.includes(effectId)}
function effectValue(entity,effectId){return effectOf(entity,effectId)?(EFFECTS[effectId]?.value||0):0}
function equipmentEligibleForClass(equipment,classId){return !!equipment?.eligibility?.classIds?.includes(classId)}
function skillEligibleForClass(skill,classId){return !!skill?.eligibility?.classIds?.includes(classId)}

const AssetResolver=Object.freeze({
  get(assetId){return AssetRegistry.get(assetId)},
  glyph(assetId,fallback='?'){return this.get(assetId)?.fallbackGlyph||fallback},
  source(assetId){return this.get(assetId)?.source||null}
});
// Class mechanics come from the canonical soldier definition; Hero stats and skills remain their own.
function inheritedClassTraits(def){
  const rule=HERO_CLASS_RULES[def.class];
  if(rule)return {attackPattern:def.attackPattern||rule.attackPattern,passives:Object.freeze([...rule.passives,...(def.passives||[])]),equipmentClassIds:rule.equipmentClassIds};
  const classUnitId={INF:'UNIT_INF_001',ARCH:'UNIT_ARCH_001',CAV:'UNIT_CAV_001'};
  const soldier=UnitRegistry.get(classUnitId[def.class]);
  return {attackPattern:def.attackPattern||soldier?.attackPattern||'RANGE',
    passives:Object.freeze([...new Set([...(soldier?.passives||[]),...(def.passives||[])])])};
}
const ContentViews=Object.freeze({
  hero(id){const h=HeroRegistry.get(id);return h?Object.freeze({...h,...inheritedClassTraits(h),name:tContent(h.nameKey),sym:AssetResolver.glyph(h.assets?.token,'?')}):null},
  unit(id){const u=UnitRegistry.get(id);return u?Object.freeze({...u,name:tContent(u.nameKey),sym:AssetResolver.glyph(u.assets?.token,'?')}):null},
  skill(id){const sk=SkillRegistry.get(id);return sk?Object.freeze({...sk,name:tContent(sk.nameKey),description:tContent(sk.descriptionKey)}):null},
  equipment(id){const e=EquipmentRegistry.get(id);return e?Object.freeze({...e,name:tContent(e.nameKey),text:tContent(e.textKey)}):null}
});

function canonicalJson(value){
  if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalJson(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function fnv1a32(text){let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16).padStart(8,'0')}

const DeckRuntimeBuilder=Object.freeze({
  buildEquipmentIds(deckId){
    const deck=DeckRegistry.get(deckId);if(!deck)throw new Error(`Unknown deck definition: ${deckId}`);
    if(deck.compositionStatus==='EMPTY')return [];
    if(deck.compositionStatus==='LOCKED'&&Array.isArray(deck.entries)){
      const ids=[];for(const entry of deck.entries){for(let i=0;i<entry.count;i++)ids.push(entry.equipmentId)}return ids;
    }
    const compat=deck.runtimeCompatibility;
    if(compat?.model==='REPEAT_ALL_EQUIPMENT'){
      const ids=[];for(let i=0;i<compat.copiesPerEquipment;i++)ids.push(...deck.allowedEquipmentIds);return ids;
    }
    throw new Error(`Deck ${deckId} has no executable composition policy`);
  },
  shuffledIds(deckId,rng=Math.random){const ids=this.buildEquipmentIds(deckId).slice();for(let i=ids.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}return ids},
  dealStartingHand(deckId,ownerPlayerId,count,rng=Math.random){return this.shuffledIds(deckId,rng).slice(0,count).map(id=>createEquipmentCardInstance(id,ownerPlayerId))}
});

function contentVersionMap(ids,registry){return Object.freeze(Object.fromEntries(ids.map(id=>[id,registry.get(id)?.version??null])))}

// PART 12.4: gameplay integrity is strict; presentation drift is non-blocking.
// The server will eventually be authoritative for this handshake. The local build exposes the same contract now.
const CONTENT_MANIFEST_PROTOCOL_VERSION='1.0';
const CONTENT_COMPATIBILITY_CODES=deepFreeze({
  READY:'READY',
  INVALID_MANIFEST:'INVALID_MANIFEST',
  PROTOCOL_VERSION_MISMATCH:'PROTOCOL_VERSION_MISMATCH',
  MODE_MISMATCH:'MODE_MISMATCH',
  GAMEPLAY_CONTENT_MISMATCH:'GAMEPLAY_CONTENT_MISMATCH',
  PRESENTATION_CONTENT_MISMATCH:'PRESENTATION_CONTENT_MISMATCH'
});

function modeContentRefs(mode){
  if(!mode)throw new Error('Mode is required for content manifest');
  return {
    packId:mode.contentPolicy?.packId||'CONTENT_PACK_DUEL_001',
    deckId:mode.contentPolicy?.deckId||'DECK_DUEL_STANDARD_001',
    mapId:mode.mapPolicy?.mapId||null
  };
}

const ContentManifestBuilder=Object.freeze({
  buildGameplay(modeId){
    const mode=DW_MODES.get(modeId);if(!mode)throw new Error(`Unknown mode for gameplay manifest: ${modeId}`);
    const {packId,deckId,mapId}=modeContentRefs(mode);
    const pack=ContentPackRegistry.get(packId);const deck=DeckRegistry.get(deckId);
    if(!pack)throw new Error(`Unknown content pack: ${packId}`);if(!deck)throw new Error(`Unknown deck: ${deckId}`);
    // Map content is still legacy/unversioned in the current single-file prototype.
    // Keep the map ID in the strict manifest now; Part 13 modularization can attach a dedicated Map Definition version without changing this contract.
    const payload={
      protocolVersion:CONTENT_MANIFEST_PROTOCOL_VERSION,
      schemaVersion:CONTENT_SCHEMA_VERSION,
      runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,
      mode:{id:mode.id,version:mode.version},
      map:{id:mapId,version:null,versionStatus:'LEGACY_UNVERSIONED'},
      pack:{id:pack.id,version:pack.version},
      deck:{id:deck.id,version:deck.version,declaredSize:deck.declaredSize,compositionStatus:deck.compositionStatus},
      definitions:{
        heroes:contentVersionMap(pack.heroes,HeroRegistry),
        units:contentVersionMap(pack.units,UnitRegistry),
        skills:contentVersionMap(pack.skills,SkillRegistry),
        equipment:contentVersionMap(pack.equipment,EquipmentRegistry),
        decks:contentVersionMap(pack.decks,DeckRegistry),
        statuses:contentVersionMap(pack.statuses,StatusRegistry),
        effects:contentVersionMap(pack.effects,EffectRegistry)
      }
    };
    return deepFreeze({...payload,gameplayHash:'fnv1a32:'+fnv1a32(canonicalJson(payload))});
  },
  buildPresentation(modeId){
    const mode=DW_MODES.get(modeId);if(!mode)throw new Error(`Unknown mode for presentation manifest: ${modeId}`);
    const {packId}=modeContentRefs(mode);const pack=ContentPackRegistry.get(packId);if(!pack)throw new Error(`Unknown content pack: ${packId}`);
    const payload={
      protocolVersion:CONTENT_MANIFEST_PROTOCOL_VERSION,
      modeId:mode.id,
      pack:{id:pack.id,version:pack.version},
      localization:{registryVersion:LocalizationRegistry.version,defaultLocale:LocalizationRegistry.defaultLocale,availableLocales:Object.keys(LocalizationRegistry.locales).sort()},
      assets:contentVersionMap(pack.assets,AssetRegistry)
    };
    return deepFreeze({...payload,presentationHash:'fnv1a32:'+fnv1a32(canonicalJson(payload))});
  },
  build(modeId){
    const gameplay=this.buildGameplay(modeId),presentation=this.buildPresentation(modeId);
    return deepFreeze({protocolVersion:CONTENT_MANIFEST_PROTOCOL_VERSION,modeId,gameplay,presentation});
  }
});

const ContentCompatibilityValidator=Object.freeze({
  validatePair(localManifest,remoteManifest){
    const warnings=[];
    if(!localManifest?.gameplay?.gameplayHash||!remoteManifest?.gameplay?.gameplayHash){return deepFreeze({ok:false,code:CONTENT_COMPATIBILITY_CODES.INVALID_MANIFEST,blocking:true,warnings})}
    if(localManifest.protocolVersion!==remoteManifest.protocolVersion){return deepFreeze({ok:false,code:CONTENT_COMPATIBILITY_CODES.PROTOCOL_VERSION_MISMATCH,blocking:true,warnings})}
    if(localManifest.modeId!==remoteManifest.modeId){return deepFreeze({ok:false,code:CONTENT_COMPATIBILITY_CODES.MODE_MISMATCH,blocking:true,warnings})}
    if(localManifest.gameplay.gameplayHash!==remoteManifest.gameplay.gameplayHash){return deepFreeze({ok:false,code:CONTENT_COMPATIBILITY_CODES.GAMEPLAY_CONTENT_MISMATCH,blocking:true,warnings,localGameplayHash:localManifest.gameplay.gameplayHash,remoteGameplayHash:remoteManifest.gameplay.gameplayHash})}
    if(localManifest.presentation?.presentationHash!==remoteManifest.presentation?.presentationHash){warnings.push(CONTENT_COMPATIBILITY_CODES.PRESENTATION_CONTENT_MISMATCH)}
    return deepFreeze({ok:true,code:CONTENT_COMPATIBILITY_CODES.READY,blocking:false,warnings,gameplayHash:localManifest.gameplay.gameplayHash,presentationMatch:warnings.length===0});
  }
});

const MatchContentHandshake=Object.freeze({
  createPeerInfo(modeId,role='CLIENT'){return deepFreeze({role,createdFrom:'LOCAL_CONTENT_REGISTRY',manifest:ContentManifestBuilder.build(modeId)})},
  createClientInfo(modeId){return this.createPeerInfo(modeId,'CLIENT')},
  createServerInfo(modeId){return this.createPeerInfo(modeId,'SERVER')},
  evaluate(clientInfo,serverInfo){return ContentCompatibilityValidator.validatePair(clientInfo?.manifest,serverInfo?.manifest)}
});

const MatchContentSnapshotBuilder=Object.freeze({
  create(modeId){
    const manifest=ContentManifestBuilder.build(modeId);
    const gameplay=manifest.gameplay,presentation=manifest.presentation;
    // manifestHash remains as a legacy alias so existing UI/debug flows do not break.
    return deepFreeze({
      ...gameplay,
      definitions:{...gameplay.definitions,assets:presentation.assets},
      presentation,
      manifestProtocolVersion:manifest.protocolVersion,
      manifestHash:gameplay.gameplayHash,
      gameplayHash:gameplay.gameplayHash,
      presentationHash:presentation.presentationHash
    });
  },
  verify(snapshot){if(!snapshot?.mode?.id)return false;const current=this.create(snapshot.mode.id);return current.gameplayHash===snapshot.gameplayHash&&current.manifestHash===snapshot.manifestHash}
});

const RUNTIME_SCHEMA_VERSION='1.0';
function runtimeId(prefix){return (crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`)}
function createRuntimeEntityInstance({definitionId,side,hero=false,kind=null,q,r,instanceId=null}){
  const def=hero?HeroRegistry.get(definitionId):UnitRegistry.get(definitionId);
  if(!def)throw new Error(`Unknown entity definition: ${definitionId}`);
  const classId=def.class;
  const classKind=CLASS_KIND[classId]||kind;
  return {
    runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,runtimeType:'COMBAT_ENTITY',instanceId:instanceId||runtimeId(hero?'HERO':'UNIT'),
    definitionId,contentVersion:def.version,side,hero,classId,kind:kind||classKind,q,r,
    hp:def.stats.hp,moved:false,movementCostSpent:0,attacked:false,moveBuff:0,damageBuff:0,
    // Stable-build alias. Entity identity is instanceId; content identity is definitionId.
    get id(){return this.instanceId}
  };
}
function createEquipmentCardInstance(equipmentId,ownerPlayerId,instanceId=null){
  const def=ContentViews.equipment(equipmentId);if(!def)throw new Error(`Unknown equipment definition: ${equipmentId}`);
  const uid=instanceId||runtimeId('CARD');
  return {...def,runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,runtimeType:'EQUIPMENT_CARD',instanceId:uid,equipmentId:def.id,ownerPlayerId,zone:'HAND',state:'UNSELECTED',uid,canonicalId:def.id,
    cls:CLASS_RUNTIME[def.class],classId:def.class,type:def.category==='ATTACK'?'atk':def.category==='DEFENSE'?'def':'neu'};
}
function createRuntimeStatusInstance({statusId,sourceEntityId,targetEntityId,ownerPlayerId=null,durationState=null,instanceId=null}){
  const def=StatusRegistry.get(statusId);if(!def)throw new Error(`Unknown status definition: ${statusId}`);
  return {runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,runtimeType:'STATUS_INSTANCE',instanceId:instanceId||runtimeId('STATUS'),statusId,contentVersion:def.version,sourceEntityId,targetEntityId,ownerPlayerId,durationState};
}
const RuntimeInstanceSchema=Object.freeze({version:RUNTIME_SCHEMA_VERSION,createEntity:createRuntimeEntityInstance,createEquipmentCard:createEquipmentCardInstance,createStatus:createRuntimeStatusInstance});


// PART 12.5: persisted-data migration and backward compatibility.
// Important policy: schema migration may transform document structure, but it must never silently rebalance historical gameplay.
// Replays require the exact historical gameplay definitions referenced by their captured snapshot.
// Player saves may move to current content only through explicit, registered content-version migrations.
const PERSISTED_DATA_SCHEMA_VERSION='1.0';
const CONTENT_MIGRATION_PROTOCOL_VERSION='1.0';
const PERSISTED_DOCUMENT_KIND=deepFreeze({
  PLAYER_SAVE:'PLAYER_SAVE',
  REPLAY:'REPLAY',
  MATCH_HISTORY:'MATCH_HISTORY'
});
const BACKWARD_COMPATIBILITY_POLICY=deepFreeze({
  [PERSISTED_DOCUMENT_KIND.PLAYER_SAVE]:{schema:'EXPLICIT_MIGRATION_TO_CURRENT',content:'EXPLICIT_CONTENT_MIGRATION_TO_CURRENT'},
  [PERSISTED_DOCUMENT_KIND.REPLAY]:{schema:'EXPLICIT_MIGRATION_TO_CURRENT',content:'EXACT_HISTORICAL_CONTENT'},
  [PERSISTED_DOCUMENT_KIND.MATCH_HISTORY]:{schema:'EXPLICIT_MIGRATION_TO_CURRENT',content:'SNAPSHOT_METADATA_ONLY'}
});
const BACKWARD_COMPATIBILITY_CODES=deepFreeze({
  READY:'READY',
  MIGRATED:'MIGRATED',
  INVALID_ENVELOPE:'INVALID_ENVELOPE',
  UNKNOWN_DOCUMENT_KIND:'UNKNOWN_DOCUMENT_KIND',
  SCHEMA_MIGRATION_REQUIRED:'SCHEMA_MIGRATION_REQUIRED',
  SCHEMA_MIGRATION_PATH_MISSING:'SCHEMA_MIGRATION_PATH_MISSING',
  CONTENT_MIGRATION_REQUIRED:'CONTENT_MIGRATION_REQUIRED',
  CONTENT_MIGRATION_PATH_MISSING:'CONTENT_MIGRATION_PATH_MISSING',
  HISTORICAL_CONTENT_UNAVAILABLE:'HISTORICAL_CONTENT_UNAVAILABLE',
  EXACT_HISTORICAL_READY:'EXACT_HISTORICAL_READY',
  HISTORY_METADATA_READY:'HISTORY_METADATA_READY'
});
function clonePersistedData(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value))}

function createDirectedMigrationRegistry(registryId){
  const steps=new Map();
  const byFrom=new Map();
  const stepKey=(fromVersion,toVersion)=>`${fromVersion}->${toVersion}`;
  return Object.freeze({
    id:registryId,protocolVersion:CONTENT_MIGRATION_PROTOCOL_VERSION,
    register({id,fromVersion,toVersion,migrate}){
      if(!id||!fromVersion||!toVersion||typeof migrate!=='function')throw new Error(`${registryId}: invalid migration step`);
      const key=stepKey(fromVersion,toVersion);if(steps.has(key))throw new Error(`${registryId}: duplicate migration ${key}`);
      const step=Object.freeze({id,fromVersion,toVersion,migrate});steps.set(key,step);
      if(!byFrom.has(fromVersion))byFrom.set(fromVersion,[]);byFrom.get(fromVersion).push(step);return step;
    },
    plan(fromVersion,toVersion){
      if(fromVersion===toVersion)return Object.freeze([]);
      const queue=[{version:fromVersion,path:[]}],visited=new Set([fromVersion]);
      while(queue.length){const current=queue.shift();for(const step of byFrom.get(current.version)||[]){const path=[...current.path,step];if(step.toVersion===toVersion)return Object.freeze(path);if(!visited.has(step.toVersion)){visited.add(step.toVersion);queue.push({version:step.toVersion,path})}}}
      return null;
    },
    canMigrate(fromVersion,toVersion){return !!this.plan(fromVersion,toVersion)},
    migrate(document,fromVersion,toVersion,context={}){
      const plan=this.plan(fromVersion,toVersion);if(plan===null)throw new Error(`${registryId}: no migration path ${fromVersion} -> ${toVersion}`);
      let value=clonePersistedData(document);const trace=[];
      for(const step of plan){value=step.migrate(value,Object.freeze({...context,fromVersion:step.fromVersion,toVersion:step.toVersion,migrationId:step.id}));trace.push(step.id)}
      return {document:value,trace:Object.freeze(trace)};
    },
    list(){return Object.freeze(Array.from(steps.values()))}
  });
}

// No legacy save/replay schema has been formally published yet, so no fake migration step is registered here.
// Future migrations must be explicit, deterministic, and individually testable before registration.
const PersistedSchemaMigrationRegistry=createDirectedMigrationRegistry('PERSISTED_SCHEMA_MIGRATION_REGISTRY');

function createContentVersionMigrationRegistry(){
  const registries=new Map();
  const key=(contentType,contentId)=>`${contentType}:${contentId}`;
  return Object.freeze({
    id:'CONTENT_VERSION_MIGRATION_REGISTRY',protocolVersion:CONTENT_MIGRATION_PROTOCOL_VERSION,
    register({contentType,contentId,id,fromVersion,toVersion,migrate}){
      if(!contentType||!contentId)throw new Error('Content migration requires contentType + contentId');
      const k=key(contentType,contentId);if(!registries.has(k))registries.set(k,createDirectedMigrationRegistry(`CONTENT_MIGRATION:${k}`));
      return registries.get(k).register({id,fromVersion:String(fromVersion),toVersion:String(toVersion),migrate});
    },
    plan(contentType,contentId,fromVersion,toVersion){return registries.get(key(contentType,contentId))?.plan(String(fromVersion),String(toVersion))??null},
    canMigrate(contentType,contentId,fromVersion,toVersion){return !!this.plan(contentType,contentId,fromVersion,toVersion)},
    migrate(contentType,contentId,payload,fromVersion,toVersion,context={}){
      const r=registries.get(key(contentType,contentId));if(!r)throw new Error(`No content migration registry for ${contentType}:${contentId}`);
      return r.migrate(payload,String(fromVersion),String(toVersion),{...context,contentType,contentId});
    },
    list(contentType,contentId){return registries.get(key(contentType,contentId))?.list()??Object.freeze([])}
  });
}
const ContentVersionMigrationRegistry=createContentVersionMigrationRegistry();

// Historical definitions are keyed by type + stable ID + version. Only real definitions are stored.
// At v1.25 the archive is bootstrapped with current definitions; future releases may retain older real definitions here.
const HistoricalContentRegistry=(()=>{
  const store=new Map();const key=(contentType,id,version)=>`${contentType}:${id}@${version}`;
  return Object.freeze({
    id:'HISTORICAL_CONTENT_REGISTRY',
    register(contentType,record){if(!contentType||!record?.id||!Number.isInteger(record.version))throw new Error('Historical content requires type/id/version');const k=key(contentType,record.id,record.version);if(!store.has(k))store.set(k,record);return store.get(k)},
    get(contentType,id,version){return store.get(key(contentType,id,version))||null},
    has(contentType,id,version){return !!this.get(contentType,id,version)},
    list(){return Object.freeze(Array.from(store.entries()).map(([archiveKey,record])=>Object.freeze({archiveKey,contentType:record.contentType,id:record.id,version:record.version})))}
  });
})();
const CURRENT_CONTENT_REGISTRY_BY_TYPE=Object.freeze({
  [CONTENT_TYPES.ASSET]:AssetRegistry,[CONTENT_TYPES.EFFECT]:EffectRegistry,[CONTENT_TYPES.STATUS]:StatusRegistry,[CONTENT_TYPES.SKILL]:SkillRegistry,
  [CONTENT_TYPES.HERO]:HeroRegistry,[CONTENT_TYPES.UNIT]:UnitRegistry,[CONTENT_TYPES.EQUIPMENT]:EquipmentRegistry,[CONTENT_TYPES.DECK]:DeckRegistry
});
for(const [contentType,registry] of Object.entries(CURRENT_CONTENT_REGISTRY_BY_TYPE))for(const record of registry.list({enabledOnly:false}))HistoricalContentRegistry.register(contentType,record);

const ContentVersionResolver=Object.freeze({
  resolve(contentType,id,version){const current=CURRENT_CONTENT_REGISTRY_BY_TYPE[contentType]?.get(id);if(current?.version===version)return current;return HistoricalContentRegistry.get(contentType,id,version)},
  has(contentType,id,version){return !!this.resolve(contentType,id,version)},
  current(contentType,id){return CURRENT_CONTENT_REGISTRY_BY_TYPE[contentType]?.get(id)||null}
});
const SNAPSHOT_DEFINITION_TYPE=Object.freeze({
  heroes:CONTENT_TYPES.HERO,units:CONTENT_TYPES.UNIT,skills:CONTENT_TYPES.SKILL,equipment:CONTENT_TYPES.EQUIPMENT,decks:CONTENT_TYPES.DECK,statuses:CONTENT_TYPES.STATUS,effects:CONTENT_TYPES.EFFECT
});
const HistoricalContentAvailability=Object.freeze({
  check(snapshot){
    const missing=[];
    if(!snapshot?.mode?.id)return deepFreeze({ok:false,missing:[{scope:'SNAPSHOT',reason:'MISSING_MODE'}]});
    const currentMode=DW_MODES.get(snapshot.mode.id);if(!currentMode||currentMode.version!==snapshot.mode.version)missing.push({scope:'MODE',id:snapshot.mode.id,version:snapshot.mode.version,reason:'MODE_VERSION_UNAVAILABLE'});
    for(const [group,contentType] of Object.entries(SNAPSHOT_DEFINITION_TYPE))for(const [id,version] of Object.entries(snapshot.definitions?.[group]||{}))if(version!==null&&!ContentVersionResolver.has(contentType,id,version))missing.push({scope:group,contentType,id,version,reason:'DEFINITION_VERSION_UNAVAILABLE'});
    return deepFreeze({ok:missing.length===0,missing});
  }
});

const PersistenceEnvelopeBuilder=Object.freeze({
  create({kind,modeId,payload={},contentSnapshot=null,documentId=null}){
    if(!Object.values(PERSISTED_DOCUMENT_KIND).includes(kind))throw new Error(`Unknown persisted document kind: ${kind}`);
    const snapshot=contentSnapshot||MatchContentSnapshotBuilder.create(modeId);
    return deepFreeze({
      kind,documentId:documentId||null,persistenceSchemaVersion:PERSISTED_DATA_SCHEMA_VERSION,runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,
      migrationProtocolVersion:CONTENT_MIGRATION_PROTOCOL_VERSION,modeId:modeId||snapshot?.mode?.id||null,contentSnapshot:snapshot,payload:clonePersistedData(payload)
    });
  }
});

const BackwardCompatibilityLoader=Object.freeze({
  inspect(envelope){
    if(!envelope||typeof envelope!=='object'||!envelope.kind||!envelope.persistenceSchemaVersion)return deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.INVALID_ENVELOPE,blocking:true});
    if(!Object.values(PERSISTED_DOCUMENT_KIND).includes(envelope.kind))return deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.UNKNOWN_DOCUMENT_KIND,blocking:true});
    const schemaCurrent=envelope.persistenceSchemaVersion===PERSISTED_DATA_SCHEMA_VERSION;
    const schemaPlan=schemaCurrent?[]:PersistedSchemaMigrationRegistry.plan(envelope.persistenceSchemaVersion,PERSISTED_DATA_SCHEMA_VERSION);
    if(!schemaCurrent&&!schemaPlan)return deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.SCHEMA_MIGRATION_PATH_MISSING,blocking:true,fromVersion:envelope.persistenceSchemaVersion,toVersion:PERSISTED_DATA_SCHEMA_VERSION});
    if(!schemaCurrent)return deepFreeze({ok:true,code:BACKWARD_COMPATIBILITY_CODES.SCHEMA_MIGRATION_REQUIRED,blocking:false,migrationIds:schemaPlan.map(x=>x.id)});
    if(envelope.kind===PERSISTED_DOCUMENT_KIND.REPLAY){const exact=HistoricalContentAvailability.check(envelope.contentSnapshot);return exact.ok?deepFreeze({ok:true,code:BACKWARD_COMPATIBILITY_CODES.EXACT_HISTORICAL_READY,blocking:false}):deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.HISTORICAL_CONTENT_UNAVAILABLE,blocking:true,missing:exact.missing})}
    if(envelope.kind===PERSISTED_DOCUMENT_KIND.MATCH_HISTORY)return deepFreeze({ok:true,code:BACKWARD_COMPATIBILITY_CODES.HISTORY_METADATA_READY,blocking:false});
    if(envelope.kind===PERSISTED_DOCUMENT_KIND.PLAYER_SAVE){
      const modeId=envelope.modeId||envelope.contentSnapshot?.mode?.id;if(!modeId)return deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.INVALID_ENVELOPE,blocking:true});
      const current=MatchContentSnapshotBuilder.create(modeId);if(envelope.contentSnapshot?.gameplayHash!==current.gameplayHash)return deepFreeze({ok:false,code:BACKWARD_COMPATIBILITY_CODES.CONTENT_MIGRATION_REQUIRED,blocking:true,fromGameplayHash:envelope.contentSnapshot?.gameplayHash||null,toGameplayHash:current.gameplayHash});
    }
    return deepFreeze({ok:true,code:BACKWARD_COMPATIBILITY_CODES.READY,blocking:false});
  },
  load(envelope){
    const initial=this.inspect(envelope);
    if(!initial.ok&&initial.code!==BACKWARD_COMPATIBILITY_CODES.SCHEMA_MIGRATION_REQUIRED)return initial;
    let document=clonePersistedData(envelope),trace=[];
    if(document.persistenceSchemaVersion!==PERSISTED_DATA_SCHEMA_VERSION){const result=PersistedSchemaMigrationRegistry.migrate(document,document.persistenceSchemaVersion,PERSISTED_DATA_SCHEMA_VERSION,{kind:document.kind});document=result.document;document.persistenceSchemaVersion=PERSISTED_DATA_SCHEMA_VERSION;trace=[...result.trace]}
    const final=this.inspect(document);if(!final.ok)return deepFreeze({...final,migrationTrace:Object.freeze(trace)});
    return deepFreeze({ok:true,code:trace.length?BACKWARD_COMPATIBILITY_CODES.MIGRATED:final.code,blocking:false,document:deepFreeze(document),migrationTrace:Object.freeze(trace),compatibility:final});
  }
});

// Runtime adapters keep stable Duel gameplay unchanged while canonical registries become the source boundary.
const HERO_KEY={rodoc:'HERO_INF_RODOC',est:'HERO_INF_EST'};
const UNIT_KEY={inf:'UNIT_INF_001',arch:'UNIT_ARCH_001',cav:'UNIT_CAV_001'};
const HEROES=Object.fromEntries(Object.entries(HERO_KEY).map(([k,id])=>{let h=ContentViews.hero(id);return [k,{canonicalId:id,name:h.name,sym:h.sym,base:CLASS_RUNTIME[h.class],classId:h.class,hp:h.stats.hp,move:h.stats.move,range:h.stats.attackRange,attackPattern:h.attackPattern,passives:h.passives,skillIds:h.skillIds,skills:h.skillIds.map(s=>ContentViews.skill(s).description)}]}));
const TROOPS=Object.fromEntries(Object.entries(UNIT_KEY).map(([k,id])=>{let u=ContentViews.unit(id);return [k,{canonicalId:id,name:u.name,sym:u.sym,base:CLASS_RUNTIME[u.class],classId:u.class,hp:u.stats.hp,move:u.stats.move,range:u.stats.attackRange,passives:u.passives}]}));
const CARDS=EquipmentRegistry.list().map(c=>{const v=ContentViews.equipment(c.id);return {id:v.id,canonicalId:v.id,name:v.name,cls:CLASS_RUNTIME[v.class],classId:v.class,type:v.category==='ATTACK'?'atk':v.category==='DEFENSE'?'def':'neu',star:v.star,timing:v.timing,effects:v.effects,eligibility:v.eligibility,text:v.text,assets:v.assets,groupId:v.groupId}});

window.DOZEN_DATA={EQUIPMENT_GROUPS,EQUIPMENT_CATEGORIES,NEW_EQUIPMENT_CATALOG,CLASS,CLASS_KIND,HERO_CLASS_RULES,ASSETS,EFFECTS,STATUS_DB,SKILLS,HERO_DB,UNIT_DB,EQUIPMENT_DB,CARD_DB,RAW_LOCALES,CONTENT_SCHEMA,CONTENT_SCHEMA_VERSION,CONTENT_TYPES,ContentRegistry,HeroRegistry,UnitRegistry,SkillRegistry,EquipmentRegistry,DeckRegistry,StatusRegistry,EffectRegistry,AssetRegistry,ContentPackRegistry,LocalizationRegistry,AssetResolver,ContentViews,RuntimeInstanceSchema,DeckRuntimeBuilder,ContentManifestBuilder,ContentCompatibilityValidator,MatchContentHandshake,MatchContentSnapshotBuilder,CONTENT_MANIFEST_PROTOCOL_VERSION,CONTENT_COMPATIBILITY_CODES,PERSISTED_DATA_SCHEMA_VERSION,CONTENT_MIGRATION_PROTOCOL_VERSION,PERSISTED_DOCUMENT_KIND,BACKWARD_COMPATIBILITY_POLICY,BACKWARD_COMPATIBILITY_CODES,PersistedSchemaMigrationRegistry,ContentVersionMigrationRegistry,HistoricalContentRegistry,ContentVersionResolver,HistoricalContentAvailability,PersistenceEnvelopeBuilder,BackwardCompatibilityLoader,DECK_DB,CONTENT_PACK_DUEL_001,CONTENT_VALIDATION};
window.DOZEN_CONTENT=Object.freeze({
  schemaVersion:CONTENT_SCHEMA_VERSION,runtimeSchemaVersion:RUNTIME_SCHEMA_VERSION,registry:ContentRegistry,locale:()=>ACTIVE_LOCALE,setLocale:setActiveLocale,t:tContent,
  registries:Object.freeze({heroes:HeroRegistry,units:UnitRegistry,skills:SkillRegistry,equipment:EquipmentRegistry,decks:DeckRegistry,statuses:StatusRegistry,effects:EffectRegistry,assets:AssetRegistry,packs:ContentPackRegistry}),
  validate:validateContentSchema,
  getHero:id=>HeroRegistry.get(id),getUnit:id=>UnitRegistry.get(id),getSkill:id=>SkillRegistry.get(id),getEquipment:id=>EquipmentRegistry.get(id),getCard:id=>EquipmentRegistry.get(id),getDeck:id=>DeckRegistry.get(id),getStatus:id=>StatusRegistry.get(id),getEffect:id=>EffectRegistry.get(id),getAsset:id=>AssetRegistry.get(id),getContentPack:id=>ContentPackRegistry.get(id),
  isEquipmentEligible:(equipmentId,classId)=>equipmentEligibleForClass(EquipmentRegistry.get(equipmentId),classId),
  isSkillEligible:(skillId,classId)=>skillEligibleForClass(SkillRegistry.get(skillId),classId),
  views:ContentViews,assets:AssetResolver,runtime:RuntimeInstanceSchema,decks:DeckRuntimeBuilder,manifest:ContentManifestBuilder,compatibility:ContentCompatibilityValidator,handshake:MatchContentHandshake,matchSnapshot:MatchContentSnapshotBuilder,
  migration:Object.freeze({persistedSchema:PersistedSchemaMigrationRegistry,contentVersion:ContentVersionMigrationRegistry,historical:HistoricalContentRegistry,versionResolver:ContentVersionResolver,historicalAvailability:HistoricalContentAvailability,envelope:PersistenceEnvelopeBuilder,loader:BackwardCompatibilityLoader,documentKinds:PERSISTED_DOCUMENT_KIND,policy:BACKWARD_COMPATIBILITY_POLICY,codes:BACKWARD_COMPATIBILITY_CODES,persistedSchemaVersion:PERSISTED_DATA_SCHEMA_VERSION,protocolVersion:CONTENT_MIGRATION_PROTOCOL_VERSION})
});


;
/* CORE FOUNDATION: locked Star/Power self-audit + shared axial directions. */
const CORE_STAR_POWER_AUDIT=(()=>{
  const failures=[];
  const eq=CorePowerResolver.resolve(2,2);
  const hi=CorePowerResolver.resolve(3,2);
  const low=CorePowerResolver.resolve(1,2);
  if(CorePowerResolver.finalPower([])!==0)failures.push('Normal action must be ★0');
  if(CorePowerResolver.finalPower([{sourceType:'HERO_SKILL',star:1},{sourceType:'EQUIPMENT',star:3}])!==3)failures.push('Skill+Equipment must use MAX star');
  if(CorePowerResolver.finalPower([{sourceType:'BUFF',star:9},{sourceType:'HERO_SKILL',star:1}])!==1)failures.push('Only Skill/Equipment may contribute Star');
  if(eq.winner!=='RESPONSE'||eq.reason!=='EQUAL_POWER_LATEST_WINS')failures.push('Equal power must let later response win');
  if(hi.winner!=='SOURCE')failures.push('Higher source power must win');
  if(low.winner!=='RESPONSE')failures.push('Higher response power must win');
  if(CORE_DEFENSE_RESPONSE_POLICY.mergeDefensiveSkillAndEquipment!==false)failures.push('Defense Skill + Equipment must not merge');
  if(CORE_EQUIP_COUNTER.responseSeconds!==10||CORE_EQUIP_COUNTER.destroyTargetSeconds!==20)failures.push('EQUIP-COUNTER timers mismatch');
  const result=Object.freeze({ok:failures.length===0,failures});
  if(!result.ok){console.error('[CORE STAR/POWER AUDIT FAILED]',failures);throw new Error('CORE_STAR_POWER_SYSTEM_v1.0 invariant failure')}
  return result;
})();

const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];


;
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
  ShellDOM.dice.rule.textContent='Hai phe nhận trang bị trước. P'+S.loser+' chọn đội và xếp quân trước. P'+S.winner+' đi lượt đầu.';
  ShellDOM.dice.continueButton.style.display='inline-block';
}
ShellDOM.dice.continueButton.onclick=()=>dealCards();

let tempHeroDefinitionId='HERO_INF_RODOC', tempTroops={inf:0,arch:0,cav:0};
function beginTeam(p){
  S.phase='team';S.selecting=p;show('team');
  ShellDOM.team.title.textContent='PLAYER '+p+' — CHỌN ĐỘI HÌNH';
  ShellDOM.team.subtitle.textContent=(p===S.loser?'Người đi sau chọn trước':'Người đi trước chọn sau')+' · 1 Hero + đúng 5 lính';
  if(S.teams[p]){tempHeroDefinitionId=S.teams[p].heroDefinitionId||HERO_KEY[S.teams[p].hero]||'HERO_INF_RODOC';tempTroops={...S.teams[p].troops};}
  else{tempHeroDefinitionId='HERO_INF_RODOC';tempTroops={inf:0,arch:0,cav:0};}
  const hand=document.getElementById('teamEquipmentHand');if(hand)hand.innerHTML=(S.hands[p]||[]).map(c=>cardHTML(c)).join('');
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
  if(S.selecting===S.loser)beginTeam(S.winner);else beginDeploy();
};
function cardHTML(c,dim=false,sel=false){
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeSource=id=>{const source=AssetResolver.source(id);return typeof source==='string'&&/^(?:\.\/|assets\/|https:\/\/|data:image\/)/.test(source)?source:''};
  const fullCard=AssetResolver.get(c.assets?.art)?.usage==='CARD_FULL'?safeSource(c.assets?.art):'';
  const art=fullCard?'':safeSource(c.assets?.art),frame=safeSource(c.assets?.frame),icon=safeSource(c.assets?.icon);
  const group=Object.values(EQUIPMENT_GROUPS).find(g=>g.id===c.groupId||g.classId===c.classId||CLASS_RUNTIME[g.classId]===c.cls);
  const image=(src,cls)=>src?'<img class="'+cls+'" src="'+esc(src)+'" alt="" loading="lazy" onerror="this.hidden=true">':'';
  return '<div class="card '+esc(c.type)+(dim?' dim':'')+(sel?' sel':'')+'" data-equipment-id="'+esc(c.equipmentId||c.canonicalId||c.id)+'" data-equipment-group="'+esc(group?.id)+'">'+(fullCard?'<img class="equipmentFullCard" src="'+esc(fullCard)+'" alt="'+esc(c.name+' · '+c.star+' sao · '+c.text)+'" title="'+esc(c.name+' · '+c.text)+'" loading="lazy" onerror="this.hidden=true">':'')+image(frame,'equipmentFrame')+image(art,'equipmentArt')+'<div class="equipmentLabel">'+image(icon,'equipmentIcon')+'<b>'+esc(c.name)+'</b><div class="star">'+('★'.repeat(c.star))+'</div><div class="muted">'+esc(group?.name)+' · '+(c.type==='atk'?'Tấn công':c.type==='def'?'Phòng thủ':'Công và thủ')+'</div></div><div class="muted equipmentText">'+esc(c.text)+'</div></div>';
}

function dealCards(){
  S.phase='deal';show('deal');
  const mode=DW_MODES.get(S.selectedMode);const deckId=S.matchSession?.contentSnapshot?.deck?.id||mode?.contentPolicy?.deckId||'DECK_DUEL_STANDARD_001';const startingHand=mode?.cardRules?.startingHand??5;
  for(let p of [S.loser,S.winner])S.hands[p]=DeckRuntimeBuilder.dealStartingHand(deckId,p,startingHand);
  ShellDOM.deal.p1Hand.innerHTML=S.hands[1].map(c=>cardHTML(c)).join('');
  ShellDOM.deal.p2Hand.innerHTML=S.hands[2].map(c=>cardHTML(c)).join('');
  summary.textContent=DeckRuntimeBuilder.buildEquipmentIds(deckId).length?'Mỗi Player nhận tối đa '+startingHand+' trang bị. Không rút thêm.':'Bộ trang bị mới đang được xây dựng. Hiện tại hai bên bắt đầu với tay bài trống.'
}
ShellDOM.deal.toDeployButton.onclick=()=>beginTeam(S.loser);


;
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
function validCardFor(c,u,context){if(c?.effects?.includes('EFFECT_EQUIPMENT_TELEPORT_4')&&!u?.hero)return false;if(S.selectedMode==='MODE_DUEL_001'){const usage=duelUsage();if(context==='atk'&&usage.attackCard[u.side]>=1)return false;if(context==='def'&&(usage.defenseCard[u.side]>=1||S.pending?.isCounterattack||u.side===S.battleSide))return false}let spec=unitSpec(u),base=spec.base||u.kind;if(spec.equipmentClassIds&&!spec.equipmentClassIds.some(id=>CLASS_RUNTIME[id]===c.cls))return false;if(c.cls!=='neutral'&&c.cls!==base)return false;if(context==='atk')return c.type==='atk'||c.type==='neu';if(context==='def')return c.type==='def'||c.type==='neu';return false}
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
  if(S.equipmentReaction||S.postHitReaction)return false;if(typeof HeroCore!=='undefined'&&HeroCore.selection){HeroCore.selection=null;HeroCore.draw()}
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
  const finish=()=>{
  if(p.reflect&&defenseWon&&p.hitResult==='HIT'&&appliedDamage>0){a.hp=Math.max(0,a.hp-appliedDamage);lg('↩️ Reflect trả '+appliedDamage+' damage về '+unitSpec(a).name+' — vẫn resolve kể cả Defender lethal.')}
  if(p.retaliationTargetIds)for(const id of p.retaliationTargetIds){const foe=S.units.find(u=>u.id===id&&u.hp>0);if(foe){const retaliation=1+(dc?effectValue(dc,'EFFECT_DAMAGE_PLUS_1'):0);foe.hp=Math.max(0,foe.hp-retaliation);lg('✨ Phục thù gây '+retaliation+' sát thương cho '+unitSpec(foe).name+'.')}}
  if(typeof HeroCore!=='undefined')HeroCore.afterHit(p,a,finalTarget,appliedDamage);
  if(p.sourceType!=='SKILL')a.attacked=true;
  lg(p.hitResult==='MISS'?'✨ Kết quả: MISS (Dodge).':p.hitResult==='CANCELLED'?'⛔ Attack bị CANCEL.':'⚔️ Damage resolve: '+appliedDamage);
  const passives=unitSpec(a).passives||[];
  const lance=effectOf(p.atkCard,'EFFECT_PIERCE_PLUS_1')&&unitSpec(a).classId==='CAV';
  if((p.sourceType!=='SKILL'&&passives.includes('PIERCE_ONE_HEX')||lance&&p.heroMechanic?.heroAttack)&&originalTarget.hp<=0&&appliedDamage>0)doPierce(a,originalTarget,appliedDamage,lance?2:1);
  const seq=S.skillSequence;
  S.pending=null;reactionBox.style.display='none';hideDefensePopup();S.selected=null;S.mode=null;
  const result=checkWin();
  if(S.matchEnded){S.skillSequence=null;S.heroSequence=null;}
  renderBoard();updateUI();
  if(!S.matchEnded&&seq)resolveNextSkillSequenceTarget();
  return result;
  };
  if(typeof EquipmentCore!=='undefined'&&EquipmentCore.offerPostHit&&EquipmentCore.offerPostHit(p,a,finalTarget,appliedDamage,finish))return true;
  return finish();
}
function doPierce(a,d,dmg,length=1){const [aq,ar]=axial(a),[dq,dr]=axial(d),distance=Math.max(Math.abs(dq-aq),Math.abs(dr-ar),Math.abs((dq+dr)-(aq+ar)));if(!distance)return;const vq=(dq-aq)/distance,vr=(dr-ar)/distance;for(let n=1;n<=length;n++){const cell=cells.find(c=>c.q===dq+vq*n&&c.r===dr+vr*n);if(!cell||cell.blocked||cell.impassable||cell.terrain?.blocked)break;const u=unitAt(cell.q,cell.r);if(u?.side===a.side)break;if(u&&u.side!==a.side){u.hp=Math.max(0,u.hp-dmg);lg('🐎 Pierce lan '+dmg+' damage.')}}}

function guardCandidates(d){return S.units.filter(u=>u.side===d.side&&u.hp>0&&(unitSpec(u)?.passives||[]).includes('INF_GUARD')&&u.id!==d.id&&distU(u,d)<=1)}
function findGuard(d){return guardCandidates(d)[0]||null}
guardBtn.style.display='none';guardBtn.onclick=()=>{};
skipReact.onclick=()=>{if(!S.pending)return;let a=S.units.find(x=>x.id===S.pending.a),d=S.units.find(x=>x.id===S.pending.d);if(reactionInfo.textContent.startsWith('Attacker'))showReaction(true);else resolveCombat()};
function renderSkills(){skillBar.innerHTML='';if(!S.selected||!S.selected.hero){for(let i=0;i<3;i++){let b=document.createElement('button');b.className='btn skill';b.disabled=true;b.textContent='Skill '+(i+1);skillBar.appendChild(b)}return}let h=unitSpec(S.selected);h.skills.forEach((s,i)=>{let b=document.createElement('button');b.className='btn skill';b.innerHTML='<b>S'+(i+1)+'</b><br><span class="muted">'+s+'</span>';let defensive=heroSkill(S.selected,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(S.selected,i+1)||(!defensive&&S.selected.attacked)||(defensive&&!S.pending);b.onclick=()=>useSkill(i+1);skillBar.appendChild(b)})}
function useSkill(n){return CoreSkillController.begin(n)}
function lineSkill(h,len,maxT,dmg){for(let dir of dirs){let hits=[];for(let n=1;n<=len;n++){let targetCell=findCellAxialStep(h,dir,n);if(!targetCell)continue;let u=unitAt(targetCell.q,targetCell.r);if(u&&u.side!==h.side)hits.push(u)}if(hits.length){hits.slice(0,maxT).forEach(u=>u.hp=Math.max(0,u.hp-dmg));lg('✨ Skill đường thẳng trúng '+Math.min(maxT,hits.length)+' mục tiêu');return}}lg('Skill không tìm thấy mục tiêu trên đường thẳng.')}
function findCellAxialStep(u,dir,n){let [aq,ar]=axial(u),tq=aq+dir[0]*n,tr=ar+dir[1]*n;return cells.find(c=>{let [q,r]=axial(c);return q===tq&&r===tr})}
function renderHand(p,context){handOwner.textContent='PLAYER '+p+' · '+(context==='atk'?'ATTACK':'DEFENSE')+' WINDOW';handBar.innerHTML='';S.hands[p].forEach(c=>{let u=context==='atk'?S.units.find(x=>x.id===S.pending?.a):S.units.find(x=>x.id===S.pending?.d);let ok=u&&validCardFor(c,u,context);let d=document.createElement('button');d.className='card '+c.type+(ok?'':' dim');d.innerHTML=cardHTML(c);d.disabled=!ok;d.onclick=()=>{if(context==='atk'&&typeof EquipmentCore!=='undefined'){if(EquipmentCore.standalone(c))return;return EquipmentCore.play(u,c,'atk',accepted=>{S.pending.atkCard=accepted?c:null;S.pending.ignoreGuard=!!u.ignoreInfGuard||accepted&&effectOf(c,'EFFECT_IGNORE_INF_GUARD');showReaction(false);updateUI()})}if(context==='atk'){S.pending.atkCard=c;if(effectOf(c,'EFFECT_IGNORE_INF_GUARD'))S.pending.ignoreGuard=true}else{if(typeof EquipmentCore!=='undefined')return EquipmentCore.useDefense(u,c);S.pending.defCard=c}S.hands[p]=S.hands[p].filter(x=>x.uid!==c.uid);markDuelCardUsed(p,context);lg('🎴 Player '+p+' dùng '+c.name+' ['+c.canonicalId+']');showReaction(context==='def')};handBar.appendChild(d)})} 
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
      if(typeof EquipmentCore!=='undefined')return EquipmentCore.useDefense(target,card);
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
    if(S.equipmentReaction)return false;
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
    if(S.equipmentReaction||S.postHitReaction)return false;if(typeof HeroCore!=='undefined'&&HeroCore.selection)return HeroCore.inputUnit(unit);
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
    if(S.equipmentReaction||S.postHitReaction)return false;if(typeof HeroCore!=='undefined'&&HeroCore.selection)return HeroCore.inputHex(cell);
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


;

// Static sprite facing is presentation-only; no combat or movement flags change.
const TroopVisual={
  source(unit){
    if(unit.hero||!['inf','arch','cav'].includes(unit.kind))return null;
    const sides={1:'blue',2:'red',3:'gold',4:'silver'};
    const faction=['red','blue','gold','silver'].includes(unit.visualFaction)?unit.visualFaction:(sides[unit.side]||'red');
    const view=Number.isInteger(unit.visualView)&&unit.visualView>=1&&unit.visualView<=8?unit.visualView:(unit.side===1?5:1);
    return './assets/troops-v3/'+unit.kind+'-'+faction+'-'+view+'.webp';
  },
  render(group,unit,cell,symbol){
    const src=this.source(unit);if(!src)return;
    const ns='http://www.w3.org/2000/svg',baseSize=unit.kind==='cav'?110:92,size=baseSize*.8,yOffset=baseSize*.1;
    const image=document.createElementNS(ns,'image');
    image.setAttribute('href',src);image.setAttribute('x',cell.x-size/2);image.setAttribute('y',cell.y+10+yOffset-size*248/256);
    image.setAttribute('width',size);image.setAttribute('height',size);image.setAttribute('class','troopSprite');
    image.setAttribute('pointer-events','none');symbol.setAttribute('visibility','hidden');
    image.addEventListener('error',()=>{image.setAttribute('visibility','hidden');symbol.setAttribute('visibility','visible')});
    group.appendChild(image);
    const hit=document.createElementNS(ns,'rect');
    hit.setAttribute('x',cell.x-27);hit.setAttribute('y',cell.y-52);hit.setAttribute('width',54);hit.setAttribute('height',66);
    hit.setAttribute('fill','transparent');hit.setAttribute('pointer-events','all');hit.setAttribute('class','troopHit');group.appendChild(hit);
  }
};
const CoreBoardRenderer = {
  id: "CORE_BOARD_RENDERER",
  layers: [],

  registerLayer(id, priority, layer){
    if(this.layers.some(x=>x.id===id))return;
    this.layers.push({id,priority,layer});
    this.layers.sort((a,b)=>a.priority-b.priority);
  },

  hexClass(cell){
    let cls="hex "+(cell.zone===1?"zoneBottom":cell.zone===2?"zoneTop":"border");
    if(isHighlight(cell))cls+=" hl";
    if(isAttackHL(cell))cls+=" attack";
    let unit=unitAt(cell.q,cell.r);
    for(const entry of this.layers){
      if(typeof entry.layer.hexClasses==="function"){
        cls+=entry.layer.hexClasses(cell,unit)||"";
      }
    }
    return cls;
  },

  unitClass(unit){
    let cls="unit";
    if(S.phase==="deploy"&&currentDeployPlayer()!==S.botSide&&unit.side===currentDeployPlayer())cls+=" deployDraggable";
    for(const entry of this.layers){
      if(typeof entry.layer.unitClasses==="function"){
        cls+=entry.layer.unitClasses(unit)||"";
      }
    }
    return cls;
  },

  render(){
    boardSvg.innerHTML="";

    // BASE HEX LAYER
    for(const cell of cells){
      let polygon=document.createElementNS("http://www.w3.org/2000/svg","polygon");
      polygon.setAttribute("points",hexPts(cell.x,cell.y));
      polygon.setAttribute("stroke","#fff");
      polygon.setAttribute("stroke-width","1.2");
      polygon.setAttribute("vector-effect","non-scaling-stroke");
      polygon.setAttribute("class",this.hexClass(cell));
      polygon.dataset.q=cell.q;polygon.dataset.r=cell.r;
      polygon.addEventListener("click",()=>typeof DirectBoardFlow!=="undefined"?DirectBoardFlow.hex(cell):CoreInputRouter.handleHexClick(cell));
      boardSvg.appendChild(polygon);
    }

    // UNIT LAYER + REGISTERED VISUAL LAYERS
    for(const unit of S.units.filter(x=>x.hp>0)){
      let cell=cells.find(c=>c.q===unit.q&&c.r===unit.r);
      if(!cell)continue;

      let group=document.createElementNS("http://www.w3.org/2000/svg","g");
      group.setAttribute("class",this.unitClass(unit));
      group.dataset.unitId=unit.id;

      for(const entry of this.layers){
        entry.layer.renderBeforeUnit?.(group,unit,cell);
      }

      let circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("cx",cell.x);circle.setAttribute("cy",cell.y);circle.setAttribute("r",28);
      circle.setAttribute("fill",unit.side===1?"#2f86c7":"#c54b4b");
      if(TroopVisual.source(unit)){circle.setAttribute('fill-opacity','.22');circle.setAttribute('class','troopTeamRing team'+unit.side);}
      group.appendChild(circle);

      let symbol=document.createElementNS("http://www.w3.org/2000/svg","text");
      symbol.setAttribute("x",cell.x);symbol.setAttribute("y",cell.y-2);
      symbol.textContent=unitSpec(unit).sym;
      symbol.setAttribute("font-size","24");
      group.appendChild(symbol);
      TroopVisual.render(group,unit,cell,symbol);

      let hp=document.createElementNS("http://www.w3.org/2000/svg","text");
      hp.setAttribute("x",cell.x);hp.setAttribute("y",cell.y+(TroopVisual.source(unit)?29:20));
      if(TroopVisual.source(unit))hp.setAttribute('class','troopHP');
      hp.textContent="❤"+unit.hp;hp.setAttribute("fill","#fff");
      group.appendChild(hp);

      for(const entry of this.layers){
        entry.layer.renderAfterUnit?.(group,unit,cell);
      }

      group.addEventListener("click",e=>{
        e.stopPropagation();
        if(typeof DirectBoardFlow!=="undefined")DirectBoardFlow.unit(unit);else CoreInputRouter.handleUnitClick(unit);
      });

      if(S.phase==="deploy"&&currentDeployPlayer()!==S.botSide&&unit.side===currentDeployPlayer())bindDeployDrag(group,unit);
      boardSvg.appendChild(group);
    }
  }
};

// Visual layers are registered once. New mechanics add a layer instead of
// replacing renderBoard().
// This layer reads Core action flags without intercepting targeting clicks.
const CoreActionStatusLayer = {
  status(unit){
    if(S.phase!=="battle")return null;
    if(unit.attacked)return "complete";
    return unit.moved||unit.movementCostSpent>0?"moved":null;
  },
  renderAfterUnit(group,unit,cell){
    const status=this.status(unit);
    if(!status)return;
    const ns="http://www.w3.org/2000/svg";
    const icon=document.createElementNS(ns,"g");
    icon.setAttribute("class","unitActionStatus "+status);
    icon.setAttribute("aria-label",status==="complete"?"Đã kết thúc hành động":"Đã di chuyển");
    icon.setAttribute("transform",`translate(${cell.x+30} ${cell.y-27})`);
    const badge=document.createElementNS(ns,"circle");
    badge.setAttribute("r","13");badge.setAttribute("class","unitActionBadge");
    icon.appendChild(badge);
    const mark=document.createElementNS(ns,"path");
    mark.setAttribute("class","unitActionMark");
    mark.setAttribute("d",status==="complete"
      ?"M -5 -5 L 5 5 M 5 -5 L -5 5"
      :"M -7 -3 L -2 -3 L 0 1 L 6 2 L 7 5 L -7 5 Z M -7 -7 L 7 7");
    icon.appendChild(mark);
    group.appendChild(icon);
  }
};
// Read the active damage recipient from combat state; no input or combat mutations.
const CoreIncomingAttackLayer = {
  targetId(){
    const p=S.pending;
    if(S.phase!=="battle"||S.matchEnded||!p)return null;
    const redirect=p.replacementTargetId||(!p.ignoreGuard&&p.guard?p.guardUnitId:null);
    return S.units.some(u=>u.id===redirect&&u.hp>0)?redirect:p.d;
  },
  isTarget(unit){return !!unit&&unit.hp>0&&unit.id===this.targetId()},
  hexClasses(cell,unit){return this.isTarget(unit)?" incomingAttackHex":""},
  unitClasses(unit){return this.isTarget(unit)?" incomingAttackTarget":""},
  renderAfterUnit(group,unit,cell){
    if(!this.isTarget(unit))return;
    const ns="http://www.w3.org/2000/svg",visual=document.createElementNS(ns,"g");
    visual.setAttribute("class","incomingAttackVisual");
    visual.setAttribute("aria-label","Đang bị tấn công");
    const ring=document.createElementNS(ns,"circle");
    ring.setAttribute("cx",cell.x);ring.setAttribute("cy",cell.y);ring.setAttribute("r",34);
    ring.setAttribute("class","incomingAttackRing");visual.appendChild(ring);
    const badge=document.createElementNS(ns,"circle");
    badge.setAttribute("cx",cell.x-30);badge.setAttribute("cy",cell.y-27);badge.setAttribute("r",12);
    badge.setAttribute("class","incomingAttackBadge");visual.appendChild(badge);
    const mark=document.createElementNS(ns,"path");
    mark.setAttribute("d","M -7 0 H 7 M 0 -7 V 7");
    mark.setAttribute("transform",`translate(${cell.x-30} ${cell.y-27})`);
    mark.setAttribute("class","incomingAttackCrosshair");visual.appendChild(mark);
    const label=document.createElementNS(ns,"text");
    label.setAttribute("x",cell.x);label.setAttribute("y",cell.y-45);
    label.setAttribute("class","incomingAttackLabel");label.textContent="BỊ TẤN CÔNG";
    visual.appendChild(label);group.appendChild(visual);
  }
};
CoreBoardRenderer.registerLayer("CORE_RENDER_INCOMING_ATTACK",70,CoreIncomingAttackLayer);
CoreBoardRenderer.registerLayer("CORE_RENDER_BUFF",30,CoreBuffController);
CoreBoardRenderer.registerLayer("CORE_RENDER_SKILL",40,CoreSkillController);
CoreBoardRenderer.registerLayer("CORE_RENDER_GUARD",50,CoreGuardController);
CoreBoardRenderer.registerLayer("CORE_RENDER_ACTION_STATUS",60,CoreActionStatusLayer);

// Single authoritative renderer entry point.
function renderBoard(){ const result=CoreBoardRenderer.render();if(typeof DuelBoardLayout!=='undefined')DuelBoardLayout.schedule();return result; }

// Compatibility entry point for any legacy code that still calls cellClick().
function cellClick(cell){ return CoreInputRouter.handleHexClick(cell); }

;
// Presentation-only fit: the board and SVG share one square coordinate frame.
const DuelBoardLayout = {
  frame:null,
  mounted:false,
  mount(){
    if(this.mounted||typeof document==='undefined')return;
    const screen=document.getElementById('gameScreen'),board=CoreDOM.board.wrap;
    if(!screen||!board)return;
    const stage=document.createElement('div');stage.className='duelMapStage';
    board.before(stage);stage.appendChild(board);
    const dock=document.createElement('div');dock.className='duelControlDock';dock.setAttribute('aria-label','Điều khiển Hero, Skill và Card');
    screen.appendChild(dock);
    for(const [id,cls,title] of [['unitPanel','dockHero','ĐƠN VỊ ĐANG CHỌN'],['skillBar','dockSkills','HERO SKILLS'],['handBar','dockCards','TRANG BỊ']]){
      const node=document.getElementById(id),box=id==='unitPanel'?node:node.closest('.box');
      box.classList.add(cls);box.querySelector('h3').textContent=title;dock.appendChild(box);
    }
    const portrait=document.createElement('div');portrait.className='dockPortrait';portrait.setAttribute('aria-hidden','true');
    document.getElementById('unitInfo').before(portrait);this.portrait=portrait;
    const info=document.createElement('details');info.className='duelMatchDetails';
    const label=document.createElement('summary');label.textContent='Thông tin trận / Combat log';info.appendChild(label);
    info.appendChild(document.getElementById('summary').closest('.box'));
    info.appendChild(document.getElementById('log').closest('.box'));stage.appendChild(info);
    stage.appendChild(document.getElementById('reactionBox'));
    this.stage=stage;this.mounted=true;
  },
  decorateSkills(){
    if(!this.mounted)return;
    document.querySelectorAll('#skillBar button').forEach((button,i)=>{
      const actor=S.units?.find(u=>String(u.id)===button.dataset?.heroId)||S.selected;if(!actor?.hero)return;
      const skill=ContentViews.skill(unitSpec(actor).skillIds[(Number(button.dataset?.skillNo)||i+1)-1]);if(!skill)return;
      if(!button.title)button.title=skill.description;
      button.setAttribute('aria-label',skill.name+' · '+button.title);
      const title=document.createElement('strong');title.textContent=skill.name;
      const stars=document.createElement('span');stars.className='dockSkillStars';stars.textContent='★'.repeat(skill.star||0);
      const timing=document.createElement('small');timing.textContent=skill.timing==='BOTH'?'CÔNG / THỦ':skill.timing==='DEFENSE_REACTION'?'PHÒNG THỦ':'CHỦ ĐỘNG';
      const target=document.createElement('small');target.textContent=S.skillTarget?.skillNo===i+1?'ĐANG CHỌN MỤC TIÊU':'';
      button.replaceChildren(title,stars,timing,target);
    });
  },
  dockHeight(viewportHeight){return Math.round(Math.max(190,Math.min(260,190+(viewportHeight-768)*70/312)))},
  fit(){
    const board=CoreDOM.board.wrap;
    if(!board)return;
    this.mount();
    // Background and hit cells are presentation-only and scoped to 1vs1.
    const cleanDuel=S.selectedMode==='MODE_DUEL_001'||typeof DW_MODES!=='undefined'&&DW_MODES.get(S.selectedMode)?.mapPolicy?.mapId==='MAP_DUEL_001';
    CoreDOM.board.svg?.classList?.toggle('duelCleanMap',cleanDuel);
    board.classList?.toggle('darkFantasyMap',cleanDuel);
    const img=board.querySelector?.('.boardBg');
    if(img){
      if(!img.dataset.defaultSrc)img.dataset.defaultSrc=img.getAttribute('src');
      const src=cleanDuel?img.dataset.duelSrc:img.dataset.defaultSrc;
      if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src);
      const backdrop=board.querySelector('.duelMapBackdrop');
      const backdropSrc=cleanDuel?(img.dataset.backdropSrc||src):src;
      if(backdrop&&backdropSrc)backdrop.style.backgroundImage='url("'+backdropSrc+'")';
    }
    const desktop=window.innerWidth>=900;
    const active=cleanDuel&&(S.phase==='deploy'||S.phase==='battle');
    if(typeof document!=='undefined'){
      document.body.classList.toggle('duelDesktopLayout',desktop&&active);
      if(this.portrait){const hero=typeof HeroSkillUI!=='undefined'?HeroSkillUI.actor():S.selected;this.portrait.textContent=hero?unitSpec(hero).sym:'♟';}
      if(desktop&&active)this.decorateSkills();
      document.documentElement.style.setProperty('--duel-dock-height',this.dockHeight(window.innerHeight)+'px');
    }
    if(!active){board.style.removeProperty('width');if(typeof DuelCamera!=='undefined')DuelCamera.disable();return}
    if(!desktop){board.style.removeProperty('width');if(this.stage&&typeof DuelCamera!=='undefined'){const bounds=this.stage.getBoundingClientRect();DuelCamera.mount(this.stage,board);DuelCamera.resize(bounds.width,bounds.height)}return}
    if(this.stage){
      const bounds=this.stage.getBoundingClientRect();
      if(typeof DuelCamera!=='undefined'){board.style.width='100%';DuelCamera.mount(this.stage,board);DuelCamera.resize(bounds.width,bounds.height)}
      else board.style.width=Math.floor(Math.max(0,Math.min(bounds.width,bounds.height)))+'px';
      return;
    }
    const parent=board.parentElement;
    if(!parent||!parent.clientWidth)return;
    // Use document position so scrolling never enlarges or shrinks the board.
    const top=board.getBoundingClientRect().top+(window.scrollY||0);
    const availableHeight=window.innerHeight-top-24;
    if(availableHeight<=0){board.style.removeProperty('width');return}
    board.style.width=Math.floor(Math.min(parent.clientWidth,availableHeight))+'px';
  },
  schedule(){
    if(this.frame!==null)return;
    this.frame=requestAnimationFrame(()=>{this.frame=null;this.fit()});
  }
};
window.addEventListener('resize',()=>DuelBoardLayout.schedule());
if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(()=>DuelBoardLayout.schedule());
  observer.observe(CoreDOM.board.wrap.parentElement);
}
// Called by the authoritative renderer after deployment/turn state changes.
DuelBoardLayout.schedule();


;
/* Camera transforms presentation only. Logical cells and gameplay state stay unchanged. */
const DuelCamera={
  enabled:false,stage:null,board:null,scene:null,base:1000,width:0,height:0,
  zoom:1.4,panX:0,panY:0,minZoom:1.4,maxZoom:2.6,panMode:false,
  drag:null,suppressUntil:0,popups:new Map(),matchId:null,reactionKey:null,
  mount(stage,board){
    if(this.scene)return;
    this.stage=stage;this.board=board;
    const scene=document.createElement('div');scene.className='duelWorld';
    const img=board.querySelector('.boardBg');
    img.draggable=false;
    stage.addEventListener('dragstart',e=>{if(!this.isUI(e.target))e.preventDefault()});
    const backdrop=document.createElement('div');backdrop.className='duelMapBackdrop';
    backdrop.style.backgroundImage='url("'+(img.dataset.backdropSrc||img.getAttribute('src'))+'")';
    board.prepend(backdrop,scene);scene.append(img,CoreDOM.board.svg);this.scene=scene;
    const controls=document.createElement('div');controls.className='duelCameraControls';controls.setAttribute('aria-label','Điều khiển camera');
    for(const [name,label,action] of [['zoom-out','−',()=>this.zoomAt(this.zoom/1.18)],['zoom-in','+',()=>this.zoomAt(this.zoom*1.18)],['reset','Về giữa',()=>this.reset()]]){
      const b=document.createElement('button');b.type='button';b.className='btn';b.dataset.cameraAction=name;
      b.setAttribute('aria-label',{'zoom-out':'Thu nhỏ map','zoom-in':'Phóng to map',pan:'Bật chế độ kéo map',reset:'Về góc nhìn mặc định'}[name]);
      b.textContent=label;b.onclick=action;controls.appendChild(b);
    }
    const hint=document.createElement('small');hint.textContent='Con lăn: zoom · Kéo / vuốt map: pan';controls.appendChild(hint);stage.appendChild(controls);this.controls=controls;
    stage.addEventListener('wheel',e=>{
      if(!this.enabled||this.isUI(e.target))return;
      e.preventDefault();const r=stage.getBoundingClientRect();
      this.zoomAt(this.zoom*Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);
    },{passive:false});
    stage.addEventListener('pointerdown',e=>{
      if(!this.enabled||this.isUI(e.target)||!(e.button===0||e.button===1))return;
      const force=this.panMode||e.button===1;
      if(!force&&S.phase==='deploy'&&e.target.closest('.unit'))return;
      this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:this.panX,py:this.panY,active:force};
      if(force){e.preventDefault();e.stopImmediatePropagation();stage.setPointerCapture(e.pointerId);stage.classList.add('cameraDragging')}
    },true);
    stage.addEventListener('pointermove',e=>{
      const d=this.drag;if(!d||d.id!==e.pointerId)return;
      if(!d.active&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>6){d.active=true;stage.setPointerCapture(e.pointerId);stage.classList.add('cameraDragging')}
      if(!d.active)return;
      e.preventDefault();e.stopImmediatePropagation();this.panX=d.px+e.clientX-d.x;this.panY=d.py+e.clientY-d.y;this.clampPan();this.apply();
    },true);
    const finish=e=>{
      if(!this.drag||this.drag.id!==e.pointerId)return;
      if(this.drag.active){this.suppressUntil=Date.now()+300;e.preventDefault();e.stopImmediatePropagation()}
      if(stage.hasPointerCapture?.(e.pointerId))stage.releasePointerCapture(e.pointerId);
      this.drag=null;stage.classList.remove('cameraDragging');
    };
    stage.addEventListener('pointerup',finish,true);stage.addEventListener('pointercancel',finish,true);
    stage.addEventListener('click',e=>{
      if(!this.isUI(e.target)&&Date.now()<this.suppressUntil){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  },
  isUI(target){return !!target.closest('button,select,input,details,.unitMenu,.deployMenu,.attackPopup,.defensePopup,.skillTargetPanel,.guardTargetHint,.reaction,.duelCameraControls')},
  resize(width,height){
    const id=S.matchSession?.matchId||null;
    if(id!==this.matchId){this.matchId=id;this.zoom=1.4;this.panX=this.panY=0;this.reactionKey=null;this.panMode=false}
    this.enabled=true;this.width=width;this.height=height;this.base=Math.max(1,Math.min(width,height));
    this.stage.classList.add('cameraEnabled');this.clampPan();this.apply();
    const p=S.pending,key=p?(p.a+':'+p.d+':'+(p.replacementTargetId||p.guardUnitId||'')):null;
    if(key&&key!==this.reactionKey){
      const id=p.replacementTargetId||(!p.ignoreGuard&&p.guardUnitId)||p.d;
      const unit=S.units.find(u=>u.id===id),cell=unit&&cells.find(c=>c.q===unit.q&&c.r===unit.r);
      if(cell)this.ensureVisible(cell);
    }
    this.reactionKey=key;
  },
  disable(){
    this.enabled=false;if(!this.scene)return;
    this.stage.classList.remove('cameraEnabled','cameraPanMode','cameraDragging');this.drag=null;
    this.scene.style.width=this.scene.style.height='100%';this.scene.style.transform='none';
    for(const popup of this.popups.keys())popup.classList.remove('cameraAnchored');
  },
  point(x,y){const size=this.base*this.zoom;return{x:this.width/2+this.panX+(x/1000-.5)*size,y:this.height/2+this.panY+(y/1000-.5)*size}},
  zoomAt(next,x=this.width/2,y=this.height/2){
    const z=Math.max(this.minZoom,Math.min(this.maxZoom,next)),ratio=z/this.zoom;
    this.panX=x-this.width/2-(x-this.width/2-this.panX)*ratio;
    this.panY=y-this.height/2-(y-this.height/2-this.panY)*ratio;
    this.zoom=z;if(z===this.minZoom){this.panX=this.panY=0}this.clampPan();this.apply();
  },
  clampPan(){const limit=this.base*this.zoom*.55;this.panX=Math.max(-limit,Math.min(limit,this.panX));this.panY=Math.max(-limit,Math.min(limit,this.panY))},
  reset(){this.zoom=1.4;this.panX=this.panY=0;this.panMode=false;this.apply()},
  ensureVisible(cell){
    const p=this.point(cell.x,cell.y),margin=Math.min(140,this.height*.25);
    if(p.x<margin)this.panX+=margin-p.x;else if(p.x>this.width-margin)this.panX+=this.width-margin-p.x;
    if(p.y<margin)this.panY+=margin-p.y;else if(p.y>this.height-margin)this.panY+=this.height-margin-p.y;
    this.clampPan();this.apply();
  },
  apply(){
    if(!this.enabled||!this.scene)return;
    this.scene.style.width=this.scene.style.height=this.base+'px';
    this.scene.style.transform='translate('+(this.width/2-this.base*this.zoom/2+this.panX)+'px,'+(this.height/2-this.base*this.zoom/2+this.panY)+'px) scale('+this.zoom+')';
    this.updateControls();for(const [popup,cell] of this.popups)if(popup.classList.contains('show'))this.placePopup(popup,cell);
  },
  updateControls(){
    if(!this.controls)return;
    this.stage.classList.toggle('cameraPanMode',this.panMode);
    const pan=this.controls.querySelector('[data-camera-action="pan"]');pan?.setAttribute('aria-pressed',String(this.panMode));
    this.controls.querySelector('[data-camera-action="zoom-in"]').disabled=this.zoom>=this.maxZoom;
    this.controls.querySelector('[data-camera-action="zoom-out"]').disabled=this.zoom<=this.minZoom;
    this.controls.dataset.zoom=Math.round(this.zoom*100)+'%';
  },
  placePopup(popup,cell){
    if(!this.enabled)return;
    popup.classList.remove('below','left','right');popup.classList.add('show','cameraAnchored');this.popups.set(popup,cell);
    const p=this.point(cell.x,cell.y),w=popup.offsetWidth,h=popup.offsetHeight;
    const x=Math.max(8,Math.min(this.width-w-8,p.x-w/2));
    const top=p.y-h-42,y=Math.max(8,Math.min(this.height-h-8,top>=8?top:p.y+42));
    popup.style.left=x+'px';popup.style.top=y+'px';
  }
};


;

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
startAttack=function(a,d){hideUnitMenu();hideAttackPopup();S.mode=null;let choice=S.attackChoice||{type:'normal',card:null};let base=1+(a.damageBuff||0),queued=a.queuedAttackEquipment||null,card=queued||choice.card||null;if(choice.card&&queued)return false;if(choice.card&&(!validCardFor(choice.card,a,'atk')||!(typeof EquipmentCore!=='undefined'?EquipmentCore.owned(a,choice.card):(S.hands[a.side]||[]).some(c=>c.uid===choice.card.uid))))return false;S.pending={a:a.id,d:d.id,base,sourceType:'ATTACK',skillId:null,skillStar:null,atkCard:card,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:effectOf(card,'EFFECT_IGNORE_INF_GUARD'),isPropagationTarget:false};if(card&&typeof EquipmentCore!=='undefined'){S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;return EquipmentCore.play(a,card,'atk',accepted=>{if(queued)a.queuedAttackEquipment=null;S.pending.atkCard=accepted?card:null;S.pending.ignoreGuard=!!a.ignoreInfGuard||accepted&&effectOf(card,'EFFECT_IGNORE_INF_GUARD');return EquipmentCore.resumeNormal(a,d,accepted?card:null)})}if(card){if(queued)a.queuedAttackEquipment=null;else{S.hands[a.side]=S.hands[a.side].filter(x=>x.uid!==card.uid);markDuelCardUsed(a.side,'atk')}lg('🎴 Player '+a.side+' dùng '+card.name+' cho đòn tấn công.')}S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;showReaction(true);updateUI()};

// Attack-target cancellation is now owned by CORE_INPUT_ROUTER.
// Keep attack UI state clean on turn/reset/skill changes.
// v1.13: legacy beginSkillTarget wrapper removed.
// Skill entry always goes through CoreSkillController so UI cannot bypass controller checks.
const _beginSkillFromAttackPopup=(n)=>{S.attackChoice=null;hideAttackPopup();return CoreSkillController.begin(n)};


;
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


;
// A small tactical search over legal targets and reachable hexes.
// Scores estimate this action only; Core still validates and resolves every move.
function botLearningProfile(){return S.botProfile??=( {attacks:0,heroAttacks:0,defenses:0,guards:0,defenseCards:0,attackCards:0} )}
function botObserveResolvedHit(p,attacker,defender){
  if(!S.botSide||!p||!attacker||!defender)return;
  const profile=botLearningProfile();
  if(attacker.side!==S.botSide&&defender.side===S.botSide){
    profile.attacks++;if(defender.hero)profile.heroAttacks++;
    if(p.atkCard)profile.attackCards++;
  }
  if(defender.side!==S.botSide&&attacker.side===S.botSide){
    profile.defenses++;if(p.guard)profile.guards++;
    if(p.defCard)profile.defenseCards++;
  }
}
function botChooseClose(candidates,margin=12){
  if(!candidates.length)return null;
  const best=candidates[0].score;
  const near=candidates.slice(0,3).filter(x=>best-x.score<=margin);
  const chance=S.botDifficulty==='hard'?.12:.28;
  return near.length>1&&Math.random()<chance?near[1+Math.floor(Math.random()*(near.length-1))]:near[0];
}
function botAttackCard(u,t){
  const cards=attackCardsFor(u);
  if(!cards.length)return null;
  if(S.botDifficulty==='easy')return Math.random()<.18?cards[Math.floor(Math.random()*cards.length)]:null;
  const base=1+(u.damageBuff||0);
  const ranked=cards.map(card=>({card,damage:effectValue(card,'EFFECT_DAMAGE_PLUS_1'),
    guardBypass:effectOf(card,'EFFECT_IGNORE_INF_GUARD')}))
    .sort((a,b)=>b.damage-a.damage||b.guardBypass-a.guardBypass||b.card.star-a.card.star);
  const best=ranked[0];
  const guards=guardCandidates(t).length&&!best.guardBypass;
  if(S.botDifficulty==='hard')return best.damage&&base<Math.min(t.hp,3)||
    base+best.damage>=t.hp&&(!guards||t.hero)||best.guardBypass&&guardCandidates(t).length?best.card:null;
  const profile=botLearningProfile();
  const bypass=ranked.find(entry=>entry.guardBypass);
  if(guardCandidates(t).length&&profile.defenses>=3&&profile.guards/profile.defenses>=.45&&bypass)return bypass.card;
  if(profile.defenses>=3&&profile.defenseCards/profile.defenses>=.45&&t.hero&&best.card.star>=2)return best.card;
  return base<t.hp&&base+best.damage>=t.hp?best.card:null;
}
function botAttackScore(u,t,card=null){
  const damage=1+(u.damageBuff||0)+(card?effectValue(card,'EFFECT_DAMAGE_PLUS_1'):0);
  const bypass=card&&effectOf(card,'EFFECT_IGNORE_INF_GUARD');
  const guarded=!bypass&&guardCandidates(t).length>0;
  let score=Math.min(t.hp,damage)*12+(damage>=t.hp?28:0);
  if(t.hero)score+=18+(damage>=t.hp?130:0);
  if(guarded)score-=t.hero?40:16;
  if(t.attacked)score-=2;
  if(card)score-=4;
  return score;
}
function pickAttackTarget(u){
  const targets=S.units.filter(t=>t.hp>0&&t.side!==u.side&&canAttack(u,t));
  if(!targets.length)return null;
  if(S.botDifficulty==='easy')return targets[Math.floor(Math.random()*targets.length)];
  const ranked=targets.map(t=>({t,score:botAttackScore(u,t,botAttackCard(u,t))}))
    .sort((a,b)=>b.score-a.score||String(a.t.id).localeCompare(String(b.t.id)));
  return botChooseClose(ranked)?.t||null;
}
function chooseMoveCell(u){
  const keys=[...reachableCells(u)];if(!keys.length)return null;
  const enemies=S.units.filter(t=>t.hp>0&&t.side!==u.side);
  if(!enemies.length)return null;
  const ownHero=S.units.find(t=>t.hp>0&&t.side===u.side&&t.hero);
  const positions=keys.map(key=>{const [q,r]=key.split(',').map(Number);return cells.find(c=>c.q===q&&c.r===r)}).filter(Boolean);
  const scoreCell=c=>{
    const probe={...u,q:c.q,r:c.r};
    const opportunities=enemies.filter(t=>canAttack(probe,t));
    const nearest=Math.min(...enemies.map(t=>distU(c,t)));
    const danger=enemies.filter(t=>!t.attacked&&canAttack(t,probe)).length;
    let score=opportunities.length?Math.max(...opportunities.map(t=>botAttackScore(u,t,botAttackCard(u,t))))+25:-nearest*9;
    if(u.hero){const p=botLearningProfile();const heroHunted=p.attacks>=3&&p.heroAttacks/p.attacks>=.5;score-=danger*(u.hp<=1?110:heroHunted?34:20);if(ownHero?.id===u.id&&u.hp<=1)score-=Math.max(0,3-nearest)*8}
    else if(unitSpec(u).base==='archer')score-=danger*13;
    else score-=danger*4;
    if(ownHero&&u.kind==='inf'&&u.id!==ownHero.id&&distU(c,ownHero)===1){const p=botLearningProfile();score+=ownHero.hp<=1?25:p.attacks>=3&&p.heroAttacks/p.attacks>=.5?20:8}
    score-=movementCostToCell(u,c)*.5;
    return score;
  };
  positions.sort((a,b)=>scoreCell(b)-scoreCell(a)||a.q-b.q||a.r-b.r);
  if(S.botDifficulty==='easy')return positions[Math.floor(Math.random()*Math.min(3,positions.length))]||null;
  if(positions.length>1&&scoreCell(positions[0])-scoreCell(positions[1])<=12&&Math.random()<(S.botDifficulty==='hard'?.12:.25))return positions[1];
  return positions[0]||null;
}
function planBotSkill(u){
  if(!u.hero||S.botDifficulty==='easy'||u.attacked)return null;
  const skills=heroDefinition(u)?.skillIds||[];
  const plans=[];
  skills.forEach((id,i)=>{
    const skill=heroSkill(u,i+1);
    if(!skill||!['ACTIVE','BOTH'].includes(skill.timing)||isSkillUsed(u,i+1))return;
    const origins=[{q:u.q,r:u.r,cost:0}];
    if(skill.maneuver){
      u.moveBuff=(u.moveBuff||0)+skill.maneuver.moveBonus;
      try{for(const [key,cost] of reachableCellCosts(u)){const [q,r]=key.split(',').map(Number);origins.push({q,r,cost})}}
      finally{u.moveBuff-=skill.maneuver.moveBonus}
    }
    const damage=skillDamageValue(skill),max=skill.target?.maxTargets||1;
    for(const origin of origins){
    const from={...u,q:origin.q,r:origin.r};
    const valid=S.units.filter(t=>baseSkillCandidate(from,skill,t));
    if(!valid.length)continue;
    let groups=skillNeedsLineLock(skill)?valid.map(first=>valid.filter(t=>onRay(from,t,rayFrom(from,first),skill.target.range))):[valid];
    for(const group of groups){
      const targets=group.slice().sort((a,b)=>damage?
        botAttackScore(u,a)-botAttackScore(u,b):
        (a.hero&&a.hp<=1?100:0)+(unitSpec(a).hp-a.hp)*20-(b.hero&&b.hp<=1?100:0)-(unitSpec(b).hp-b.hp)*20).reverse().slice(0,max);
      if(!targets.length)continue;
      let score;
      if(damage)score=targets.reduce((sum,t)=>sum+Math.min(t.hp,damage)*12+(damage>=t.hp?28:0)+(t.hero?18+(damage>=t.hp?130:0):0),0)-9;
      else if(effectOf(skill,'EFFECT_HEAL_1'))score=targets[0].hp<unitSpec(targets[0]).hp?(targets[0].hero?36:20)+(targets[0].hp===1?30:0):0;
      else if(effectOf(skill,'EFFECT_DAMAGE_PLUS_1'))score=targets[0].attacked?0:24;
      else score=targets[0].attacked?0:Math.max(0,20-distU(targets[0],S.units.find(t=>t.side!==u.side&&t.hp>0)||targets[0])*2);
      if(score>0)plans.push({skill,skillNo:i+1,targets,score:score-origin.cost*.5,moveCell:origin.cost?origin:null});
    }
    }
  });
  return botChooseClose(plans.sort((a,b)=>b.score-a.score),10);
}
function botUseSkill(u,plan){
  S.selected=u;
  const card=skillDamageValue(plan.skill)>0?botAttackCard(u,plan.targets[0]):null;
  let maneuverStart=null;
  if(plan.skill.maneuver){
    maneuverStart={q:u.q,r:u.r,movementCostSpent:u.movementCostSpent||0,moved:!!u.moved,moveBuff:u.moveBuff||0};
    u.moveBuff=(u.moveBuff||0)+plan.skill.maneuver.moveBonus;
    if(plan.moveCell){u.q=plan.moveCell.q;u.r=plan.moveCell.r;u.movementCostSpent=(u.movementCostSpent||0)+plan.moveCell.cost;u.moved=true}
  }
  S.skillTarget={heroId:u.id,skillNo:plan.skillNo,skillId:plan.skill.id,
    selected:plan.targets.map(t=>t.id),cardUid:card?.uid||null,ray:skillNeedsLineLock(plan.skill)?rayFrom(u,plan.targets[0]):null,maneuverStart};
  const used=applySkillTarget();
  if(used===false||!isSkillUsed(u,plan.skillNo)){
    if(maneuverStart)Object.assign(u,maneuverStart);
    S.skillTarget=null;return false;
  }
  hideUnitMenu();
  if(!S.pending&&!S.skillSequence){if(!u.attacked)S.botQueue?.unshift(u.id);S.selected=null;updateUI()}
  return true;
}
function botAttack(u,t){const use=botAttackCard(u,t);S.selected=u;S.attackChoice={type:use?'card':'normal',card:use};return startAttack(u,t)!==false}
function botActNext(){
  if(S.phase!=='battle'||!isBotSide(S.battleSide)||S.matchEnded){S.botRunning=false;aiThinking.classList.remove('show');return}
  if(S.skillSequence&&!S.pending)resolveNextSkillSequenceTarget();
  if(S.pending||S.skillSequence){S.botRunning=false;aiThinking.classList.remove('show');return}
  if(!S.botQueue){const ids=S.units.filter(u=>u.side===S.botSide&&u.hp>0).map(u=>u.id);const start=Math.floor((S.turn||1)/2)%Math.max(1,ids.length);S.botQueue=ids.slice(start).concat(ids.slice(0,start))}
  const id=S.botQueue.shift();
  if(!id){S.botRunning=false;aiThinking.classList.remove('show');const side=S.battleSide,turn=S.turn;setTimeout(()=>{if(S.phase!=='battle'||S.matchEnded||S.battleSide!==side||S.turn!==turn)return;if(!endTurn()&&!S.pending&&!S.skillSequence&&S.skillTarget){S.skillTarget=null;skillTargetPanel.classList.remove('show');updateUI();scheduleBotTurn()}},450);return}
  const u=S.units.find(x=>x.id===id&&x.hp>0);
  if(!u||u.attacked){setTimeout(botActNext,100);return}
  let t=pickAttackTarget(u);
  let plan=planBotSkill(u);
  if(plan&&(plan.score>(t?botAttackScore(u,t,botAttackCard(u,t))+12:15))){
    if(botUseSkill(u,plan)){
      S.botRunning=false;aiThinking.classList.remove('show');
      if(!S.pending&&!S.skillSequence)setTimeout(scheduleBotTurn,180);
      return;
    }
  }
  if(t){if(botAttack(u,t)){S.botRunning=false;aiThinking.classList.remove('show');return}setTimeout(botActNext,100);return}
  if(canMoveFurther(u)){
    const c=chooseMoveCell(u);
    if(c){let cost=movementCostToCell(u,c);u.q=c.q;u.r=c.r;u.movementCostSpent=movementCostSpent(u)+(cost||0);u.moved=u.movementCostSpent>0;lg('🤖 '+unitSpec(u).name+' di chuyển '+(cost||0)+' bước.');renderBoard();updateUI();t=pickAttackTarget(u);plan=planBotSkill(u);if(plan&&plan.score>(t?botAttackScore(u,t,botAttackCard(u,t))+12:15)){if(botUseSkill(u,plan)){S.botRunning=false;aiThinking.classList.remove('show');if(!S.pending&&!S.skillSequence)setTimeout(scheduleBotTurn,180);return}}if(t){setTimeout(()=>{if(botAttack(u,t)){S.botRunning=false;aiThinking.classList.remove('show')}else setTimeout(botActNext,100)},280);return}}
  }
  u.attacked=true;setTimeout(botActNext,180);
}
function scheduleBotTurn(){if(S.matchEnded||S.phase!=='battle'||!isBotSide(S.battleSide)||S.pending||S.botRunning)return;if(S.skillSequence){resolveNextSkillSequenceTarget();if(S.pending||S.skillSequence)return}S.botRunning=true;aiThinking.classList.add('show');setTimeout(botActNext,S.botDifficulty==='easy'?650:S.botDifficulty==='normal'?450:300)}
function botDefense(){
  const pending=S.pending;
  if(!pending)return;
  const d=S.units.find(x=>x.id===pending.d);
  if(!d||!isBotSide(d.side))return;
  setTimeout(()=>{
    if(S.pending!==pending||S.matchEnded||S.equipmentReaction)return;
    const guards=guardCandidates(d),cards=defenseCards(d);
    const incoming=pending.base+(pending.atkCard?effectValue(pending.atkCard,'EFFECT_DAMAGE_PLUS_1'):0);
    if(S.botDifficulty!=='easy'){
      const choices=defenseSkillChoices(d);
      const choice=choices.find(c=>effectOf(c.skill,'EFFECT_EVADE_ATTACK'))||
        choices.find(c=>effectOf(c.skill,'EFFECT_SWAP_ALLY')&&incoming>=d.hp&&c.targets.some(u=>u.hp>incoming))||
        choices.find(c=>effectOf(c.skill,'EFFECT_HEAL_1')&&c.targets.some(u=>u.id===d.id)&&incoming>=d.hp)||
        choices.find(c=>effectOf(c.skill,'EFFECT_RETALIATE_1')&&c.targets.some(u=>u.hp<=1)&&incoming<d.hp);
      if(choice){const target=effectOf(choice.skill,'EFFECT_RETALIATE_1')?choice.targets.slice(0,2):
        choice.targets.find(u=>u.id===d.id)||choice.targets.find(u=>u.hp>incoming)||choice.targets[0];
        if(useDefenseSkill(choice,target))return}
    }
    const guardAvailable=guards.length&&!pending.ignoreGuard&&S.botDifficulty!=='easy';
    const effectiveCards=cards.filter(c=>defenseEquipmentWins(pending,c));
    const usefulCards=effectiveCards.filter(c=>effectOf(c,'EFFECT_CANCEL_ATTACK')||
      effectOf(c,'EFFECT_DAMAGE_REDUCE_1')||effectOf(c,'EFFECT_REFLECT_DAMAGE'));
    if(usefulCards.length&&(incoming>=d.hp||S.botDifficulty==='hard'&&!guardAvailable)){
      const c=usefulCards.find(x=>effectOf(x,'EFFECT_CANCEL_ATTACK'))||
        usefulCards.find(x=>effectOf(x,'EFFECT_DAMAGE_REDUCE_1'))||usefulCards[0];
      if(typeof EquipmentCore!=='undefined'){EquipmentCore.useDefense(d,c);return}
      pending.defCard=c;S.hands[d.side]=S.hands[d.side].filter(x=>x.uid!==c.uid);markDuelCardUsed(d.side,'def');lg('🤖 Bot dùng '+c.name+' để phòng thủ.');resolveCombat();return
    }
    if(guardAvailable){
      const g=guards.sort((a,b)=>b.hp-a.hp)[0];pending.guard=true;pending.guardUnitId=g.id;lg('🤖 Bot chọn Infantry Guard.');resolveCombat();return
    }
    lg('🤖 Bot không phòng thủ.');resolveCombat();
  },180);
}
const _showDefensePopup_v12=showDefensePopup;
showDefensePopup=function(d){
  if(isBotSide(d.side)){hideDefensePopup();botDefense();return}
  _showDefensePopup_v12(d);
  // There is no meaningful defense decision when the player has no response.
  const defensiveSkills=defenseSkillChoices(d);
  if(!guardCandidates(d).length&&!defenseCards(d).length&&!defensiveSkills.length){
    hideDefensePopup();setTimeout(()=>{if(S.pending?.d===d.id&&!(typeof CombatFlowUI!=='undefined'&&CombatFlowUI.state)&&!S.postHitReaction)resolveCombat()},0);
  }
};
const _resolveCombat_v12=resolveCombat;
resolveCombat=function(){const pending=S.pending;if(!pending)return;const attacker=S.units.find(u=>u.id===pending.a),defender=S.units.find(u=>u.id===pending.d);const result=_resolveCombat_v12();if(S.pending===pending)return result;botObserveResolvedHit(pending,attacker,defender);if(!S.matchEnded)setTimeout(scheduleBotTurn,180);return result};
const _resolveNextSkillSequenceTarget_v12=resolveNextSkillSequenceTarget;
resolveNextSkillSequenceTarget=function(){const result=_resolveNextSkillSequenceTarget_v12();if(!S.pending&&!S.skillSequence&&!S.matchEnded)setTimeout(scheduleBotTurn,180);return result};


;
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


;
/* MODE_DUEL_001 owns its clocks and per-turn budgets. Core still resolves actions. */
const duelTimerBadge=document.createElement('div');
duelTimerBadge.className='duelTimers';
duelTimerBadge.setAttribute('aria-live','off');
CoreDOM.board.wrap.appendChild(duelTimerBadge);
const DuelTurnClock={
  turnRemainingMs:0,lastTickMs:0,defenseRemainingMs:0,defenseLastTickMs:0,defensePending:null,interval:null,timeoutHandled:false,defenseTimeoutPending:null,
  policy(){return DW_MODES.get(S.selectedMode)?.turnPolicy},
  enabled(){return S.selectedMode==='MODE_DUEL_001'&&S.phase==='battle'&&!S.matchEnded},
  display(){
    if(!this.enabled()){duelTimerBadge.style.display='none';return}
    duelTimerBadge.style.display='block';
    const attack=Math.max(0,Math.ceil(this.turnRemainingMs/1000));
    const defense=this.defensePending?'<span class="defenseClock">PHÒNG THỦ '+Math.max(0,Math.ceil(this.defenseRemainingMs/1000))+'s</span>':'';
    duelTimerBadge.innerHTML='<span>LƯỢT P'+S.battleSide+' · '+attack+'s'+(this.defensePending?' · TẠM DỪNG':'')+'</span>'+defense;
  },
  stop(){if(this.interval){clearInterval(this.interval);this.interval=null}this.defensePending=null;this.defenseTimeoutPending=null;this.timeoutHandled=false;this.turnRemainingMs=0;this.display()},
  startTurn(){
    if(!this.enabled())return this.stop();
    this.turnRemainingMs=(this.policy()?.turnTimerSeconds||180)*1000;
    this.lastTickMs=Date.now();this.defensePending=null;this.defenseTimeoutPending=null;this.defenseRemainingMs=0;this.timeoutHandled=false;
    if(!this.interval)this.interval=setInterval(()=>this.tick(),200);
    this.display();
  },
  openDefense(p){
    if(!this.enabled()||!p||this.defensePending===p)return;
    const now=Date.now();
    if(!this.defensePending)this.turnRemainingMs=Math.max(0,this.turnRemainingMs-(now-this.lastTickMs));
    this.defensePending=p;this.defenseTimeoutPending=null;this.defenseRemainingMs=(this.policy()?.defenseTimerSeconds||30)*1000;
    this.defenseLastTickMs=now;this.display();
  },
  afterResolve(){
    if(!this.enabled())return this.stop();
    if(S.pending){if(S.pending!==this.defensePending)this.openDefense(S.pending);return}
    this.defensePending=null;this.defenseTimeoutPending=null;this.defenseRemainingMs=0;this.lastTickMs=Date.now();this.display();
    if(this.turnRemainingMs<=0)this.autoEndTurn();
  },
  autoEndTurn(){
    if(!this.enabled()||S.pending||this.timeoutHandled)return;
    this.timeoutHandled=true;
    if(typeof HeroCore!=='undefined'&&HeroCore.selection){if(HeroCore.selection.equipmentRecovery){EquipmentCore.skipRecovery()}else if(HeroCore.selection.continuation){HeroCore.selection=null;S.heroSequence=null;S.skillSequence=null;HeroCore.draw()}else HeroCore.cancel()}
    if(S.skillTarget)cancelSkillTarget();
    if(S.guardTargeting)hideGuardTargeting();
    // A timed-out multi-target selection cannot keep the turn blocked forever.
    if(S.skillSequence&&!S.pending)S.skillSequence=null;
    if(S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
    if(S.matchEnded)return this.stop();
    lg('⏱️ Hết 180 giây · tự động kết thúc lượt Player '+S.battleSide+'.');
    endTurn();
  },
  tick(){
    if(S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
    if(!this.enabled())return this.stop();
    const now=Date.now();
    if(S.equipmentReaction){const r=S.equipmentReaction;r.remainingMs=Math.max(0,r.remainingMs-(now-r.lastTick));r.lastTick=now;this.lastTickMs=now;this.defenseLastTickMs=now;duelTimerBadge.textContent='PHẢN ỨNG CARD P'+r.side+' · '+Math.ceil(r.remainingMs/1000)+'s';if(!r.remainingMs)EquipmentCore.passEquipment();return}
    if(S.pending){
      if(S.pending!==this.defensePending)this.openDefense(S.pending);
      this.defenseRemainingMs=Math.max(0,this.defenseRemainingMs-(now-this.defenseLastTickMs));
      this.defenseLastTickMs=now;this.display();
      if(this.defenseRemainingMs<=0&&S.pending===this.defensePending&&this.defenseTimeoutPending!==S.pending){
        this.defenseTimeoutPending=S.pending;
        lg('⏱️ Hết 30 giây phòng thủ · tự động bỏ qua phòng thủ.');
        hideGuardTargeting();resolveCombat();
      }
      return;
    }
    if(this.defensePending){this.afterResolve();return}
    this.turnRemainingMs=Math.max(0,this.turnRemainingMs-(now-this.lastTickMs));
    this.lastTickMs=now;this.display();
    if(this.turnRemainingMs<=0)this.autoEndTurn();
  }
};
const _duelMainAction=mainAction;
mainAction=function(){const was=S.phase;const result=_duelMainAction();if(was==='deploy'&&S.phase==='battle')DuelTurnClock.startTurn();return result};
const _duelEndTurn=endTurn;
endTurn=function(){
  if(S.selectedMode==='MODE_DUEL_001'&&S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();
  if(S.matchEnded)return false;
  const side=S.battleSide;
  const changed=_duelEndTurn();
  if(!changed)return false;
  if(S.selectedMode==='MODE_DUEL_001'){
    if(side===S.winner){
      S.firstPlayerNoAttackTurns=S.firstPlayerAttackedThisTurn?0:(S.firstPlayerNoAttackTurns||0)+1;
    }
    S.firstPlayerAttackedThisTurn=false;
    S.duelUsage={activeSkill:{1:0,2:0},defenseSkill:{1:0,2:0},attackCard:{1:0,2:0},defenseCard:{1:0,2:0}};
    if(side===S.winner&&S.firstPlayerNoAttackTurns>=5){
      DW_CORE.emitGameEvent({type:'CORE_EVENT_FIRST_PLAYER_INACTIVITY',side,count:S.firstPlayerNoAttackTurns});
    }
    if(!S.matchEnded)DuelTurnClock.startTurn();else DuelTurnClock.stop();
    updateUI();
  }
  return true;
};
const _duelShowReaction=showReaction;
showReaction=function(defPhase){
  const p=S.pending;
  if(S.selectedMode==='MODE_DUEL_001'&&p&&S.units.find(u=>u.id===p.a)?.side===S.winner&&
     (p.sourceType==='ATTACK'||p.sourceType==='SKILL'&&(!p.heroMechanic||p.heroMechanic.heroAttack)))S.firstPlayerAttackedThisTurn=true;
  const result=_duelShowReaction(defPhase);
  if(defPhase&&p)DuelTurnClock.openDefense(p);
  return result;
};
const _duelResolveCombat=resolveCombat;
resolveCombat=function(){const p=S.pending;const result=_duelResolveCombat();if(p&&S.pending!==p)DuelTurnClock.afterResolve();return result};
const _duelResetMatchState=resetMatchState;
resetMatchState=function(){DuelTurnClock.stop();const result=_duelResetMatchState();S.duelUsage=null;S.firstPlayerNoAttackTurns=0;S.firstPlayerAttackedThisTurn=false;return result};


;

/* STABLE_DUEL_BASELINE: v1.20 | source: v1.19.1 STEP 2 REGRESSION FIX | gameplay rules unchanged */
/* ===== v1.20 STABLE BASELINE QA API ===== */
window.DOZEN_QA=Object.freeze({
  evaluateDuel(p1hp,p2hp){
    return DW_MODES.evaluate('MODE_DUEL_001',{type:'CORE_EVENT_HERO_STATE_SNAPSHOT',transactionState:'RESOLVED',heroes:[{side:1,hp:p1hp},{side:2,hp:p2hp}]});
  },
  run(){
    const tests=[]; const t=(name,ok,detail='')=>tests.push({name,ok:!!ok,detail});
    let r=this.evaluateDuel(3,0);t('Duel P2 hero <=0 => P1 win',r?.winnerSide===1&&r?.resultType==='WIN_LOSE',JSON.stringify(r));
    r=this.evaluateDuel(0,3);t('Duel P1 hero <=0 => P2 win',r?.winnerSide===2&&r?.resultType==='WIN_LOSE',JSON.stringify(r));
    r=this.evaluateDuel(0,0);t('Duel simultaneous hero death => DRAW',r?.resultType==='DRAW'&&r?.winnerSide==null,JSON.stringify(r));
    r=this.evaluateDuel(3,3);t('No hero death => match continues',r===null,JSON.stringify(r));
    const eq=CorePowerResolver.resolve(2,2);t('Equal Star => later response wins',eq.winner==='RESPONSE'&&eq.reason==='EQUAL_POWER_LATEST_WINS',JSON.stringify(eq));
    const hi=CorePowerResolver.resolve(3,2);t('Higher source Star wins',hi.winner==='SOURCE',JSON.stringify(hi));
    t('EQUIP-COUNTER timers 10s/20s',CORE_EQUIP_COUNTER.responseSeconds===10&&CORE_EQUIP_COUNTER.destroyTargetSeconds===20);
    t('Duel skill policy = 1 use per skill per match',DW_MODES.get('MODE_DUEL_001')?.skillUsagePolicy?.scope==='MATCH'&&DW_MODES.get('MODE_DUEL_001')?.skillUsagePolicy?.maxUsesPerSkill===1);
    t('War God skill policy resets by round',DW_MODES.get('MODE_WAR_GOD_001')?.skillUsagePolicy?.scope==='ROUND');
    t('Enemy hex sharing forbidden in Core architecture',CORE_ARCHITECTURE_V18.map.enemySideSharing===false);
    t('Damage minimum = 0',CORE_ARCHITECTURE_V18.combat.damageMinimum===0);
    t('Propagation targets cannot defend',CORE_ARCHITECTURE_V18.combat.propagationTargetsCanDefend===false);
    const fakeInf={hero:false,kind:'inf',moveBuff:2,movementCostSpent:1,attacked:false,hp:2};
    t('Move buff increases total budget without resetting spent',movementBudgetTotal(fakeInf)===3&&remainingMove(fakeInf)===2,JSON.stringify({total:movementBudgetTotal(fakeInf),spent:movementCostSpent(fakeInf),remaining:remainingMove(fakeInf)}));
    const pendingNormal={sourceType:'ATTACK',skillStar:null,atkCard:{star:2}};
    t('Defense lower Star loses effect',CorePowerResolver.resolve(pendingAttackPower(pendingNormal),1).winner==='SOURCE');
    t('Defense equal Star wins as later response',CorePowerResolver.resolve(pendingAttackPower(pendingNormal),2).winner==='RESPONSE');
    t('Duel timers = 180s attack / 30s defense',DW_MODES.get('MODE_DUEL_001')?.turnPolicy?.turnTimerSeconds===180&&DW_MODES.get('MODE_DUEL_001')?.turnPolicy?.defenseTimerSeconds===30);
    return {ok:tests.every(x=>x.ok),tests};
  }
});


;
/* Confirmed Hero mechanics. Content supplies primitives, Mode supplies budgets/map rules.
   This module extends the existing combat transaction; mandatory effects finish before victory. */
const HeroCore={
  selection:null,
  notice:'',
  mode(){return DW_MODES.get(S.selectedMode)},
  alive(u){return !!u&&u.hp>0},
  statuses(u){return (u?.heroStatuses||[]).filter(s=>s.endTurn>=S.turn)},
  blocked(u,type){return this.statuses(u).some(s=>s.kind==='STUN'||s.kind==='FREEZE'||s.kind==='ROOT'&&['move','attack','active'].includes(type)||s.kind==='SILENCE'&&type==='defense')},
  status(u,kind){const endTurn=kind==='STUN'?S.turn+1:S.turn;(u.heroStatuses??=[]).push({kind,endTurn});},
  troopDefs(){const ids=this.mode()?.contentPolicy?.unitIds;return UnitRegistry.list().filter(d=>!ids||ids.includes(d.id))},
  spec(u){return unitSpec(u)},
  skillRange(h,sk){const r=sk.target?.range;return r==='ATTACK'?this.spec(h).range:r==='BASE_ATTACK'?HeroRegistry.get(h.definitionId).stats.attackRange:Number.isFinite(r)?r:99},
  cardBonus(card,type){return (card?.effects||[]).reduce((n,id)=>{const e=EffectRegistry.get(id);return n+(e?.type===type&&e.operation!=='SUBTRACT'?(e.value||0):0)},0)},
  targetLimit(h,sk,card){if(sk.parameters?.pull)return 1;return Math.max(1,(sk.target?.maxTargets||1)+(sk.heroAttack?(h.targetBuff||0)+this.cardBonus(card,'MODIFY_TARGET_COUNT'):0))},
  candidate(h,sk,u){
    if(!this.alive(u))return false;const t=sk.target||{};if(t.excludeSelf&&u.id===h.id)return false;
    if(t.side==='SELF'&&u.id!==h.id||t.side==='ALLY'&&u.side!==h.side||t.side==='ENEMY'&&u.side===h.side)return false;
    if(t.unitType==='TROOP'&&u.hero||t.unitType==='HERO'&&!u.hero||t.class&&this.spec(u).classId!==t.class)return false;
    let range=this.skillRange(h,sk)+(sk.heroAttack&&typeof t.range==='number'?(h.rangeBuff||0):0);
    if(!t.global&&distU(h,u)>range||t.pattern==='LINE'&&!aligned(h,u,range))return false;
    if(sk.parameters?.blockedByTerrain&&!this.terrainLineClear(h,u))return false;
    if(t.healable&&!u.hero&&this.spec(u).classId!=='INF')return false;
    if(t.requireMissingHp&&u.hp>=this.spec(u).hp)return false;
    if(['BUFF','BASE_MOVE'].includes(sk.mechanic)&&u.attacked)return false;
    if(sk.parameters?.pull&&!this.pullAttackAllowed(h,u,sk))return false;
    if(sk.mechanic==='CANCEL'&&sk.target.side!=='SELF'&&u.hero&&u.id!==h.id)return false;
    if(sk.mechanic==='REVENGE')return (S.attackHistory||[]).some(e=>e.turn===S.turn&&e.attacker===u.id&&e.targetSide===h.side&&distU(h,e.targetPosition)<=3);
    return true;
  },
  pullAttackAllowed(h,u,sk){return !!(sk.parameters?.allowAdjacentPullHit&&distU(h,u)===1&&aligned(h,u,1)||this.pullDestination(h,u))},
  pullDestination(h,u){const ray=rayFrom(h,u);if(!ray)return null;const dest=findCellAxialStep(h,ray,1);if(!dest||unitAt(dest.q,dest.r))return null;
    for(let n=1;n<distU(h,u);n++){const c=findCellAxialStep(h,ray,n);if(!c||this.terrainBlocked(c)||unitAt(c.q,c.r))return null}return dest;
  },
  terrainLineClear(h,u){const ray=rayFrom(h,u);if(!ray)return false;for(let n=1;n<=distU(h,u);n++){const c=findCellAxialStep(h,ray,n);if(!c||this.terrainBlocked(c))return false}return true},
  terrainBlocked(c){return !!(c.blocked||c.impassable||c.terrain?.blocked)},
  cellAllowed(h,c){const policy=this.mode()?.mapPolicy;const occupied=S.units.filter(u=>this.alive(u)&&u.q===c.q&&u.r===c.r&&u.id!==h.id);
    if(this.terrainBlocked(c))return false;
    if(policy?.occupancyMode!=='FORMATION')return !occupied.length;
    if(occupied.some(u=>u.side!==h.side))return false;
    return h.hero?occupied.filter(u=>u.hero).length<(policy.maxHeroesPerHex??1):occupied.filter(u=>!u.hero).length<(policy.maxTroopsPerHex??5);
  },
  escapeCells(h,sk){const range=sk.parameters.escapeRange;if(sk.parameters.teleport)return cells.filter(c=>distU(h,c)>0&&distU(h,c)<=range&&this.cellAllowed(h,c));
    const seen=new Set([h.q+','+h.r]),queue=[{c:h,d:0}],out=[];
    while(queue.length){const {c,d}=queue.shift();if(d>=range)continue;for(const n of cellNeighbors(c)){const k=n.q+','+n.r;if(seen.has(k)||this.terrainBlocked(n))continue;seen.add(k);queue.push({c:n,d:d+1});if(this.cellAllowed(h,n))out.push(n)}}return out;
  },
  canUse(h,n,sk=heroSkill(h,n),pending=S.pending){
    if(S.equipmentReaction)return false;
    if(sk?.equipmentAction)return EquipmentCore.canUse(h,sk.equipmentCard);
    if(S.phase!=='battle'||S.matchEnded||!this.alive(h)||!sk||isSkillUsed(h,n))return false;
    const defense=h.side!==S.battleSide;
    if(defense){if(pending?.defenseEquipmentUsed&&!pending?.wardAllowsDefense)return false;if(!['DEFENSE_REACTION','BOTH'].includes(sk.timing)||this.blocked(h,'defense'))return false;
      const d=pending&&S.units.find(u=>u.id===(pending.guard?pending.guardUnitId:pending.replacementTargetId||pending.d));
      if(pending&&pending.isCounterattack)return false;
      if(['SWAP','ESCAPE','DICE_WARD'].includes(sk.mechanic)&&(!d||d.id!==h.id))return false;
      if(sk.mechanic==='CANCEL'&&(!d||!this.candidate(h,sk,d)))return false;
      if(['PUSH','COUNTER'].includes(sk.mechanic)&&!(S.attackHistory||[]).some(e=>e.turn===S.turn&&e.targetSide===h.side))return false;
      if(sk.mechanic==='COUNTER'&&!pending)return false;
      if(sk.mechanic==='REVENGE'&&!this.targets(h,sk).length)return false;
      if(pending&&CorePowerResolver.resolve(pendingAttackPower(pending),sk.star||0).winner!=='RESPONSE'&&!(sk.mechanic==='HEAL'&&(S.hands[h.side]||[]).some(c=>effectOf(c,'EFFECT_HEAL_1')&&validCardFor(c,h,'def')&&CorePowerResolver.resolve(pendingAttackPower(pending),Math.max(sk.star||0,c.star||0)).winner==='RESPONSE')))return false;
    }else if(sk.timing==='DEFENSE_REACTION'||h.attacked||this.blocked(h,'active')||pending)return false;
    if(sk.parameters.requiresDeath&&!(S.troopDeaths||[]).some(e=>e.side===h.side))return false;
    if(sk.mechanic==='SUMMON'&&!cells.some(c=>distU(h,c)===1&&this.cellAllowed({side:h.side,hero:false,id:null},c)))return false;
    if(sk.mechanic==='ESCAPE'&&!this.escapeCells(h,sk).length)return false;
    if(sk.mechanic==='COPY'&&!this.copyChoices(h).length)return false;
    return true;
  },
  targets(h,sk){return S.units.filter(u=>this.candidate(h,sk,u))},
  copyChoices(h){const defense=h.side!==S.battleSide;return [...new Set((S.heroSkillHistory||[]).filter(e=>e.side!==h.side).map(e=>e.skillId))].map(id=>ContentViews.skill(id)).filter(sk=>sk&&(defense?['DEFENSE_REACTION','BOTH']:['ACTIVE','BOTH']).includes(sk.timing))},
  remember(h,sk,n){if(sk.equipmentAction)return;markSkillUsed(h,n);if(sk.copied)(S.heroSkillHistory??=[]).push({side:h.side,skillId:'SKILL_HERO_GRIM_S3',turn:S.turn});(S.heroSkillHistory??=[]).push({side:h.side,skillId:sk.id,turn:S.turn})},
  begin(h,n,override=null,continuation=false){
    if(S.equipmentReaction)return false;
    const sk=override||heroSkill(h,n);if(!continuation&&!this.canUse(h,n,sk))return false;
    this.selection={h,n,sk,selected:[],cell:null,kind:this.troopDefs()[0]?.id,copyId:null,dice:[1,2],cardUid:S.equipPendingActorId===h.id?S.equipSelectedCard?.uid:null,continuation};
    hideUnitMenu();hideAttackPopup();hideDefensePopup();S.mode='hero-skill';this.draw();renderBoard();return true;
  },
  cancel(){if(this.selection?.equipmentRecovery)return EquipmentCore.skipRecovery();if(this.selection?.continuation&&S.heroSequence)return false;this.selection=null;S.mode=null;this.draw();updateUI();if(S.pending)showDefensePopup(S.units.find(u=>u.id===S.pending.d));return true},
  select(u){const s=this.selection;if(!s||!this.candidate(s.h,s.sk,u))return false;
    const i=s.selected.indexOf(u.id);if(i>=0)s.selected.splice(i,1);else{const max=this.targetLimit(s.h,s.sk,this.selectedCard());if(s.sk.target.selection?.lineLock&&s.selected.length&&!onRay(s.h,u,rayFrom(s.h,S.units.find(x=>x.id===s.selected[0])),this.skillRange(s.h,s.sk)))return false;if(max===1)s.selected=[u.id];else if(s.selected.length<max)s.selected.push(u.id)}this.draw();renderBoard();return true;
  },
  selectCell(c){const s=this.selection;if(!s||!c)return false;const allowed=s.sk.mechanic==='ESCAPE'?this.escapeCells(s.h,s.sk):s.sk.mechanic==='SUMMON'?cells.filter(c=>distU(s.h,c)===1&&this.cellAllowed({side:s.h.side,hero:false,id:null},c)):[];if(!allowed.some(x=>x.q===c.q&&x.r===c.r))return false;s.cell=c;this.draw();renderBoard();return true},
  selectedCard(){const s=this.selection;return s&&(s.equipmentBundle||(S.hands[s.h.side]||[]).find(c=>c.uid===s.cardUid)||(s.continuation?S.heroSequence?.card:null))||null},
  equip(card,h,context){if(!card)return true;if(!validCardFor(card,h,context)||!(S.hands[h.side]||[]).some(c=>c.uid===card.uid))return false;S.hands[h.side]=S.hands[h.side].filter(c=>c.uid!==card.uid);markDuelCardUsed(h.side,context);if(context==='def'&&S.pending)S.pending.defenseEquipmentUsed=true;return true},
  buff(u,p){for(const [field,key] of [['move','moveBuff'],['damage','damageBuff'],['range','rangeBuff'],['targets','targetBuff'],['attacks','attackCountBuff']])if(p[field]){u[key]=(u[key]||0)+p[field];(u.turnModifiers??={})[key]=(u.turnModifiers[key]||0)+p[field]}if(p.move)u.extraMoveGranted=(u.extraMoveGranted||0)+p.move;if(p.ignoreGuard){u.ignoreInfGuard=true;(u.turnModifiers??={}).ignoreInfGuard=true}},
  transform(u,id,hero){const def=UnitRegistry.get(id);if(!def)return false;if(hero){u.morphDefinitionId=id;u.classId=def.class;u.kind=CLASS_KIND[def.class];for(const key of ['equipment','equipmentCards','equipmentIds']){if(Array.isArray(u[key])){const kept=[];for(const c of u[key]){const card=typeof c==='string'?createEquipmentCardInstance(c,u.side):c;if(card&&equipmentEligibleForClass(card,def.class))kept.push(c);else if(card)(S.hands[u.side]??=[]).push({...card,uid:card.uid||crypto.randomUUID(),cls:CLASS_RUNTIME[card.class],type:card.category==='ATTACK'?'atk':card.category==='DEFENSE'?'def':'neu'})}u[key]=kept}}if(u.queuedAttackEquipment&&!equipmentEligibleForClass(u.queuedAttackEquipment,def.class)){S.hands[u.side].push(u.queuedAttackEquipment);u.queuedAttackEquipment=null}}else{u.definitionId=id;u.classId=def.class;u.kind=CLASS_KIND[def.class];u.hp=def.stats.hp}return true},
  incoming(p){let v=Math.max(0,p.base||0)+effectValue(p.atkCard,'EFFECT_DAMAGE_PLUS_1');if(p.defCard&&defenseEquipmentWins(p,p.defCard)){if(effectOf(p.defCard,'EFFECT_CANCEL_ATTACK'))return 0;v=Math.max(0,v-effectValue(p.defCard,'EFFECT_DAMAGE_REDUCE_1'))}return v},
  commit(){
    const s=this.selection;if(!s)return false;const {h,n,sk}=s,defense=h.side!==S.battleSide,p=sk.parameters||{},card=this.selectedCard();
    if(defense&&card&&!sk.equipmentAction&&!(sk.mechanic==='HEAL'&&(card.equipmentCards?card.equipmentCards.every(c=>effectOf(c,'EFFECT_HEAL_1')):effectOf(card,'EFFECT_HEAL_1'))))return this.message('Skill thủ không được kết hợp trang bị thủ trong cùng một lần phòng thủ.');
    if(sk.equipmentAction&&card?.uid!==sk.equipmentCard?.uid)return false;
    if(!s.continuation&&!this.canUse(h,n,sk)||s.cardUid&&!card&&!S.heroSequence?.normal)return false;
    let ts=s.selected.map(id=>S.units.find(u=>u.id===id));const cellSkill=['SUMMON','ESCAPE'].includes(sk.mechanic),optionSkill=['MORPH','COPY','DICE_WARD','STEAL'].includes(sk.mechanic);
    if(!cellSkill&&!optionSkill&&!ts.length&&sk.target.side==='SELF')ts=[h];
    if(sk.target.selection?.lineLock&&ts.length>1&&!ts.every(t=>onRay(h,t,rayFrom(h,ts[0]),this.skillRange(h,sk)+(h.rangeBuff||0))))return false;
    if(!cellSkill&&!optionSkill&&(!ts.length||ts.some(t=>!this.candidate(h,sk,t))||ts.length>this.targetLimit(h,sk,card)))return false;
    if(cellSkill&&(!s.cell||!(sk.mechanic==='ESCAPE'?this.escapeCells(h,sk):cells.filter(c=>distU(h,c)===1&&this.cellAllowed({side:h.side,hero:false,id:null},c))).some(c=>c.q===s.cell.q&&c.r===s.cell.r)))return false;
    if(sk.mechanic==='DICE_WARD'&&(s.dice.length!==2||new Set(s.dice).size!==2))return false;
    if(sk.mechanic==='STEAL'&&!(S.hands[h.side===1?2:1]||[]).some(c=>c.uid===s.stealUid))return false;
    if(defense&&S.pending&&!sk.independentDefense&&CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(sk.star||0,card?.star||0)).winner!=='RESPONSE')return false;
    if(sk.mechanic==='COPY'){const original=this.copyChoices(h).find(k=>k.id===s.copyId);if(!original)return false;const copy={...original,star:Math.min(original.star||0,3),copied:true};this.selection=null;return this.begin(h,n,copy,true)}
    if(card&&!sk.equipmentAction&&EquipmentCore.independent(card)&&!(defense&&sk.mechanic==='HEAL'&&effectOf(card,'EFFECT_HEAL_1')))return this.message('Card này phải dùng độc lập.');
    if(card&&!defense&&!sk.equipmentAction&&(!sk.heroAttack||typeof EquipmentCore!=='undefined'&&EquipmentCore.standalone(card)))return this.message('Card này phải dùng đúng hành động trang bị hoặc kết hợp skill Attack.');
    if(sk.mechanic==='HEAL'&&sk.equipmentAction&&card?.equipmentCards&&ts[0].hp+this.cardBonus(card,'HEAL')>this.spec(ts[0]).hp)return this.message('Tổng HP sau hồi không được vượt HP tối đa.');
    if(sk.mechanic==='HEAL'&&!sk.equipmentAction&&card&&effectOf(card,'EFFECT_HEAL_1')&&ts[0].hp+1+this.cardBonus(card,'HEAL')>this.spec(ts[0]).hp)return this.message('Tổng HP sau hồi không được vượt HP tối đa.');
    if(sk.mechanic==='HEAL'&&S.pending&&ts[0].id===(S.pending.guardUnitId||S.pending.replacementTargetId||S.pending.d)){const total=sk.equipmentAction?(this.cardBonus(card,'HEAL')||1):1+this.cardBonus(card,'HEAL');if(Math.min(this.spec(ts[0]).hp,ts[0].hp+total)<=this.incoming({...S.pending,defCard:card||S.pending.defCard}))return this.message('Hồi máu chưa đủ để sống sau đòn đánh.')}
    if(card&&!s.equipmentRecovery&&!(s.continuation&&S.heroSequence)&&(!validCardFor(card,h,defense?'def':'atk')||!(typeof EquipmentCore!=='undefined'?EquipmentCore.owned(h,card):(S.hands[h.side]||[]).some(c=>c.uid===card.uid))))return false;
    if(s.equipmentRecovery){this.selection=null;this.notice='';S.mode=null;return s.resume(ts)}
    save();
    const freshCard=card&&(!s.continuation||!S.heroSequence||S.heroSequence.normal&&S.heroSequence.round===0);
    const chosenCardCount=card?.equipmentCards?.length||1;
    if(freshCard&&typeof EquipmentCore!=='undefined'){
      this.selection=null;S.mode=null;this.draw();
      return EquipmentCore.play(h,card,defense?'def':'atk',accepted=>{
        const primaryEffect={ESCAPE:'EFFECT_EQUIPMENT_TELEPORT_4',HEAL:'EFFECT_HEAL_1',REDIRECT:'EFFECT_REDIRECT_ALLY',STRIKE:'EFFECT_EQUIPMENT_PULL_3',BUFF:'EFFECT_EQUIPMENT_MOVE_PLUS_1'}[sk.mechanic];
        const primaryCanceled=sk.equipmentAction&&card?.equipmentCards&&primaryEffect&&!effectOf(card,primaryEffect);
        if(primaryCanceled&&accepted&&defense&&S.pending){S.pending.defCard=card;this.selection=null;S.mode=null;resolveCombat();return}
        if(card?.equipmentCards&&sk.equipmentAction)sk.star=card.star;
        if((!accepted||primaryCanceled)&&sk.equipmentAction){if(S.heroSequence?.h===h.id){S.heroSequence=null;S.skillSequence=null}renderBoard();updateUI();if(S.pending)showDefensePopup(S.units.find(u=>u.id===S.pending.d));return}
        if(s.continuation&&S.heroSequence?.normal&&S.heroSequence.round===0){S.heroSequence.card=accepted?card:null;S.heroSequence.count=1+(h.attackCountBuff||0)+this.cardBonus(accepted?card:null,'MODIFY_ATTACK_COUNT');h.queuedAttackEquipment=null}
        if((!accepted||card?.equipmentCards&&card.equipmentCards.length<chosenCardCount)&&sk.heroAttack&&EquipmentCore.recoverTargets(s,ts,targets=>this.applySelection(s,targets,accepted?card:null),accepted?card:null))return;
        this.applySelection(s,ts,accepted?card:null);
      });
    }
    return this.applySelection(s,ts,card);
  },
  applySelection(s,ts,card){
    const {h,n,sk}=s,defense=h.side!==S.battleSide,p=sk.parameters||{};
    if(defense&&sk.mechanic==='HEAL'&&S.pending&&ts[0]?.id===(S.pending.guardUnitId||S.pending.replacementTargetId||S.pending.d)&&Math.min(this.spec(ts[0]).hp,ts[0].hp+(sk.equipmentAction?(this.cardBonus(card,'HEAL')||1):1+this.cardBonus(card,'HEAL')))<=this.incoming({...S.pending,defCard:card||S.pending.defCard})){
      this.notice='Hồi máu chưa đủ để sống sau đòn đánh; trang bị có thể đã bị hủy.';this.selection=null;S.mode=null;this.draw();renderBoard();updateUI();showDefensePopup(S.units.find(u=>u.id===S.pending.d));return false;
    }
    if(defense&&S.pending&&!sk.equipmentAction)S.pending.defenseSkillUsed=!['SWAP','MORPH','CONVERT','DICE_WARD'].includes(sk.mechanic);
    if(!s.continuation)this.remember(h,sk,n);else if(!S.heroSequence)this.remember(h,sk,n);
    if(defense&&S.pending&&card&&(!sk.independentDefense||card.equipmentCards)){S.pending.defCard=card;S.pending.defenseSkillStar=sk.star}
    this.selection=null;S.mode=null;this.draw();
    if(defense&&S.pending&&!sk.independentDefense&&CorePowerResolver.resolve(pendingAttackPower(S.pending),Math.max(sk.star||0,card?.star||0)).winner!=='RESPONSE'){renderBoard();updateUI();showDefensePopup(S.units.find(u=>u.id===S.pending.d));return true}
    switch(sk.mechanic){
      case 'BUFF':for(const t of ts)this.buff(t,p);if(card&&!sk.equipmentAction)h.queuedAttackEquipment=card;break;
      case 'MORPH':this.transform(h,s.kind,true);break;
      case 'CONVERT':this.transform(ts[0],s.kind,false);break;
      case 'SUMMON':h.hp=Math.max(0,h.hp-(p.hpCost||0));S.units.push(createRuntimeEntityInstance({definitionId:p.summonClass?this.troopDefs().find(d=>d.class===p.summonClass).id:s.kind,side:h.side,hero:false,q:s.cell.q,r:s.cell.r}));break;
      case 'ESCAPE':h.q=s.cell.q;h.r=s.cell.r;if(defense&&S.pending){S.pending.cancel=true;S.pending.cancelReason='DODGE'}break;
      case 'HEAL':ts[0].hp=Math.min(this.spec(ts[0]).hp,ts[0].hp+(sk.equipmentAction?(this.cardBonus(card,'HEAL')||1):1+this.cardBonus(card,'HEAL')));break;
      case 'STEAL':{const enemy=h.side===1?2:1,c=S.hands[enemy].find(c=>c.uid===s.stealUid);if(c){S.hands[enemy]=S.hands[enemy].filter(x=>x.uid!==c.uid);c.ownerPlayerId=h.side;c.zone='HAND';c.state='UNSELECTED';S.hands[h.side].push(c)}break}
      case 'BASE_MOVE':this.buff(ts[0],{move:EquipmentCore.baseMove(ts[0])});break;
      case 'ROOT':this.status(ts[0],'ROOT');break;
      case 'REDIRECT':EquipmentCore.redirect(h,ts[0]);break;
      case 'CANCEL':if(S.pending){S.pending.cancel=true;S.pending.cancelReason='HERO_CANCEL'}break;
      case 'SWAP':if(S.pending){const ally=ts[0];[h.q,ally.q]=[ally.q,h.q];[h.r,ally.r]=[ally.r,h.r];S.pending.replacementTargetId=ally.id;S.pending.directRetaliation=p.directRetaliation||0;S.pending.d=ally.id;S.selected=null;renderBoard();showDefensePopup(ally);updateUI();return true}break;
      case 'REVENGE':for(const t of ts)t.hp=Math.max(0,t.hp-1);break;
      case 'PUSH':{const t=ts[0],ray=rayFrom(h,t);if(ray)for(let i=0;i<p.push;i++){const c=findCellAxialStep(t,ray,1);if(!c||this.terrainBlocked(c)||unitAt(c.q,c.r))break;t.q=c.q;t.r=c.r}this.status(t,'ROOT');break}
      case 'DICE_WARD':if(S.pending)S.pending.wardAllowsDefense=true;h.diceWard={numbers:[...s.dice],endTurn:S.turn};if(S.pending)this.rollWard(S.pending);break;
      case 'COUNTER':if(S.pending)S.pending.lucyCounter={heroId:h.id,targets:ts.map(t=>t.id)};break;
      case 'STRIKE':case 'SILENCE':{
        if(s.continuation&&S.heroSequence){const seq=S.heroSequence;if(seq.normal&&seq.round===0){h.queuedAttackEquipment=null;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null}S.heroSequence.targets=ts.map(t=>t.id);S.heroSequence.index=0;S.heroSequence.round++;this.next();return true}
        if(sk.heroAttack)h.attacked=true;
        const count=(p.repeats||1)+(sk.heroAttack?h.attackCountBuff||0:0)+this.cardBonus(card,'MODIFY_ATTACK_COUNT');
        S.heroSequence={h:h.id,sk,n,targets:ts.map(t=>t.id),index:0,round:1,count,card};S.skillSequence={roster:true};this.next();return true;
      }
    }
    if(sk.equipmentAction&&sk.mechanic==='ESCAPE'&&defense&&S.pending){resolveCombat();return true}
    this.captureDeaths();checkWin();renderBoard();updateUI();if(S.pending&&!S.matchEnded)showDefensePopup(S.units.find(u=>u.id===S.pending.d));return true;
  },
  next(){const seq=S.heroSequence;if(!seq||S.pending)return;if(S.matchEnded){S.heroSequence=null;S.skillSequence=null;return}const h=S.units.find(u=>u.id===seq.h);if(!this.alive(h)){S.heroSequence=null;S.skillSequence=null;return}
    while(seq.index<seq.targets.length){const targetId=seq.targets[seq.index++];const d=S.units.find(u=>u.id===targetId);if(!this.alive(d)||seq.sk.parameters?.blockedByTerrain&&!this.terrainLineClear(h,d)||seq.sk.parameters?.pull&&!this.pullAttackAllowed(h,d,seq.sk))continue;
      const p=seq.sk.parameters||{};let damage=seq.sk.mechanic==='SILENCE'?0:(p.damage||1)+(p.fixedCardAttack?0:h.damageBuff||0);
      let drain=0;if(p.diceDrain){const die=this.roll();drain=die%2===0?2:1;damage=drain+(h.damageBuff||0);lg('🎲 '+seq.sk.name+': '+die+' → '+drain+' HP')}
      S.pending={a:h.id,d:d.id,base:damage,sourceType:seq.normal?'ATTACK':'SKILL',skillId:seq.normal?null:seq.sk.id,skillStar:seq.normal?null:seq.sk.star,atkCard:seq.card,defCard:null,guard:false,cancel:false,reflect:false,ignoreGuard:p.ignoreGuard||!p.fixedCardAttack&&h.ignoreInfGuard||effectOf(seq.card,'EFFECT_IGNORE_INF_GUARD'),heroMechanic:seq.sk,drain,hitResult:'PENDING'};showReaction(true);updateUI();return;
    }
    if(seq.round<seq.count&&this.targets(h,seq.sk).length){this.begin(h,seq.n,seq.sk,true);this.notice='Chọn mục tiêu cho lần đánh '+(seq.round+1)+'/'+seq.count;this.draw();if(h.side===S.botSide)this.autoSelect();return}
    S.heroSequence=null;S.skillSequence=null;S.selected=null;renderBoard();updateUI();
  },
  roll(){return 1+Math.floor(Math.random()*6)},
  rollWard(p){const d=S.units.find(u=>u.id===p.d);if(!d?.diceWard||d.diceWard.endTurn<S.turn||p.wardRolled)return;p.wardRolled=true;const n=this.roll();lg('🎲 Phân Bóng: '+n);if(!d.diceWard.numbers.includes(n)){p.cancel=true;p.cancelReason='DICE_WARD'}},
  record(p){if(p.historyRecorded)return;p.historyRecorded=true;const a=S.units.find(u=>u.id===p.a),d=S.units.find(u=>u.id===p.d);if(a&&d)(S.attackHistory??=[]).push({turn:S.turn,attacker:a.id,target:d.id,targetSide:d.side,targetPosition:{q:d.q,r:d.r}})},
  afterHit(p,a,d,damage){if(p.drain&&!p.drainApplied)a.hp=Math.min(this.spec(a).hp,a.hp+p.drain);
    const sk=p.heroMechanic,meta=sk?.parameters||{};
    if(p.hitResult==='HIT'&&this.alive(d)){
      if(meta.status)this.status(d,meta.status);
      if(sk?.mechanic==='SILENCE')this.status(d,'SILENCE');
      if(meta.pull){const c=this.pullDestination(a,d);if(c){d.q=c.q;d.r=c.r}}
    }
    if(p.directRetaliation)a.hp=Math.max(0,a.hp-p.directRetaliation);
    if(p.lucyCounter){const h=S.units.find(u=>u.id===p.lucyCounter.heroId);if(this.alive(h)){const base=HeroRegistry.get(h.definitionId).stats;for(const id of p.lucyCounter.targets){const t=S.units.find(u=>u.id===id);if(this.alive(t)&&t.side!==h.side&&aligned(h,t,base.attackRange))t.hp=Math.max(0,t.hp-1)}}}
    if(typeof EquipmentCore!=='undefined')EquipmentCore.afterHit(p,a,d);
    this.captureDeaths();
  },
  captureDeaths(){for(const u of S.units.filter(u=>!u.hero&&u.hp<=0)){S.troopDeaths??=[];if(!S.troopDeaths.some(e=>e.id===u.id))S.troopDeaths.push({id:u.id,side:u.side,turn:S.turn})}},
  boundary(side){for(const u of S.units){if(u.side===side){for(const [key,v] of Object.entries(u.turnModifiers||{})){if(key==='ignoreInfGuard')u[key]=false;else u[key]=Math.max(0,(u[key]||0)-v)}u.turnModifiers={};u.extraMoveGranted=0}u.heroStatuses=(u.heroStatuses||[]).filter(s=>s.endTurn>S.turn);if(u.diceWard?.endTurn<=S.turn)u.diceWard=null}},
  message(t){this.notice=t;this.draw();return false},
  draw(){if(typeof HeroSkillUI!=='undefined')HeroSkillUI.render()},
  inputUnit(u){return this.selection?this.select(u)||true:false},
  inputHex(c){return this.selection?this.selectCell(c)||true:false}
};

// Extend specs without changing content identity (especially Grim's Hero identity).
const _rosterSpec=unitSpec;
unitSpec=function(u){const spec=_rosterSpec(u);if(!spec)return spec;let out={...spec};if(u.morphDefinitionId){const d=ContentViews.unit(u.morphDefinitionId);if(d)out={...out,base:CLASS_RUNTIME[d.class],classId:d.class,move:d.stats.move,range:d.stats.attackRange,attackPattern:d.attackPattern,passives:d.passives,equipmentClassIds:[d.class,CLASS.NEU],sym:d.sym}}out.range+=(u.rangeBuff||0);return out};
const _rosterMove=canMoveFurther;
canMoveFurther=function(u){return !HeroCore.blocked(u,'move')&&(_rosterMove(u)||!!(u&&u.hp>0&&!u.attacked&&u.extraMoveGranted&&remainingMove(u)>0))};
const _rosterAttack=canAttack;
canAttack=function(a,d){return HeroCore.alive(a)&&!HeroCore.blocked(a,'attack')&&_rosterAttack(a,d)};
const _rosterSelect=selectUnit;
selectUnit=function(u){if(HeroCore.selection)return HeroCore.inputUnit(u);if(HeroCore.blocked(u,'active'))return false;return _rosterSelect(u)};
const _rosterBeginSkill=_beginSkillTargetInternal;
_beginSkillTargetInternal=function(n){const sk=heroSkill(S.selected,n);return sk?.mechanic?HeroCore.begin(S.selected,n):_rosterBeginSkill(n)};
const _rosterNextSkill=resolveNextSkillSequenceTarget;
resolveNextSkillSequenceTarget=function(){return S.skillSequence?.roster?HeroCore.next():_rosterNextSkill()};
const _rosterShowReaction=showReaction;
showReaction=function(def){if(S.pending&&def){HeroCore.record(S.pending);HeroCore.rollWard(S.pending)}return _rosterShowReaction(def)};
const _rosterDefenseChoices=defenseSkillChoices;
defenseSkillChoices=function(d){const old=_rosterDefenseChoices(d).filter(c=>!c.skill.mechanic);if(!d)return old;const added=S.units.filter(h=>h.hero&&h.side===d.side&&h.hp>0).flatMap(h=>heroDefenseReactionSkills(h).filter(e=>e.skill.mechanic&&HeroCore.canUse(h,e.skillNo,e.skill)).map(e=>({hero:h,...e,targets:HeroCore.targets(h,e.skill)})));return old.concat(added)};
const _rosterUseDefense=useDefenseSkill;
useDefenseSkill=function(choice,target,card=null,defer=false){if(!choice?.skill.mechanic)return _rosterUseDefense(choice,target,card,defer);if(!HeroCore.begin(choice.hero,choice.skillNo))return false;if(target)HeroCore.selection.selected=(Array.isArray(target)?target:[target]).map(u=>u.id);HeroCore.selection.cardUid=card?.uid||null;if(['MORPH','CONVERT','COPY','ESCAPE','SUMMON','DICE_WARD'].includes(choice.skill.mechanic))return true;return HeroCore.commit()};
const _rosterStartAttack=startAttack;
startAttack=function(a,d){if(!HeroCore.alive(a)||a.attacked||HeroCore.blocked(a,'attack')||!canAttack(a,d))return false;
  if(a.targetBuff||a.attackCountBuff||HeroCore.cardBonus(a.queuedAttackEquipment||S.attackChoice?.card,'MODIFY_ATTACK_COUNT')){const card=a.queuedAttackEquipment||S.attackChoice?.card||null;const sk={id:'NORMAL_ATTACK',name:'Đánh thường',star:0,heroAttack:true,mechanic:'STRIKE',target:{side:'ENEMY',range:'ATTACK',maxTargets:1,pattern:unitSpec(a).attackPattern},parameters:{damage:1,attack:true}};HeroCore.selection={h:a,n:0,sk,selected:[d.id],continuation:true,cardUid:card?.uid};S.heroSequence={h:a.id,sk,n:0,targets:[],index:0,round:0,count:1+(a.attackCountBuff||0)+HeroCore.cardBonus(card,'MODIFY_ATTACK_COUNT'),card,normal:true};S.skillSequence={roster:true};a.attacked=true;S.mode='hero-skill';HeroCore.draw();if(a.side===S.botSide)HeroCore.autoSelect();return true}
  const result=_rosterStartAttack(a,d);if(S.pending)S.pending.ignoreGuard ||=!!a.ignoreInfGuard;return result};
const _rosterEndTurn=endTurn;
endTurn=function(){if(HeroCore.selection||S.heroSequence)return false;const side=S.battleSide,turn=S.turn;const snapshot=S.units.map(u=>[u,{...u,heroStatuses:[...(u.heroStatuses||[])]}]);HeroCore.boundary(side);const result=_rosterEndTurn();if(S.turn===turn){for(const [u,data] of snapshot)Object.assign(u,data)}return result};
const _rosterReset=resetMatchState;
resetMatchState=function(){HeroCore.selection=null;HeroCore.notice='';const result=_rosterReset();S.attackHistory=[];S.heroSkillHistory=[];S.troopDeaths=[];S.heroSequence=null;return result};
const _heroGuardCandidates=guardCandidates;
guardCandidates=function(d){return HeroCore.blocked(d,'defense')?[]:_heroGuardCandidates(d).filter(u=>!HeroCore.blocked(u,'defense'))};
HeroCore.autoSelect=function(){const s=this.selection;if(!s)return false;
  if(s.sk.mechanic==='COPY'){s.copyId=this.copyChoices(s.h).sort((a,b)=>(b.parameters?.damage||0)-(a.parameters?.damage||0))[0]?.id;return this.commit()&&this.autoSelect()}
  if(s.sk.mechanic==='ESCAPE')s.cell=this.escapeCells(s.h,s.sk).sort((a,b)=>S.units.filter(u=>u.side!==s.h.side&&u.hp>0).reduce((n,u)=>n+distU(b,u)-distU(a,u),0))[0];
  else if(s.sk.mechanic==='SUMMON')s.cell=cells.find(c=>distU(s.h,c)===1&&this.cellAllowed({side:s.h.side,hero:false,id:null},c));
  else{let targets=this.targets(s.h,s.sk).sort((a,b)=>s.sk.target.side==='ENEMY'?(b.hero?50:0)-(a.hero?50:0)+a.hp-b.hp:(b.hero?20:0)-(a.hero?20:0));if(s.sk.target.selection?.lineLock&&targets[0])targets=targets.filter(t=>onRay(s.h,t,rayFrom(s.h,targets[0]),this.skillRange(s.h,s.sk)));s.selected=targets.slice(0,this.targetLimit(s.h,s.sk,null)).map(u=>u.id)}
  return this.commit();
};
const _heroPlanBot=planBotSkill;
planBotSkill=function(u){if(!u.hero||u.attacked||HeroCore.blocked(u,'active'))return null;const plans=[];for(let n=1;n<=3;n++){const sk=heroSkill(u,n);if(!sk?.mechanic||!HeroCore.canUse(u,n,sk))continue;if(['STRIKE','SILENCE'].includes(sk.mechanic)&&!HeroCore.targets(u,sk).length)continue;if(sk.parameters?.hpCost&&u.hp<=sk.parameters.hpCost)continue;plans.push({skill:sk,skillNo:n,targets:HeroCore.targets(u,sk),score:sk.heroAttack?60:sk.mechanic==='SUMMON'?40:sk.mechanic==='BUFF'?25:10})}return plans.sort((a,b)=>b.score-a.score)[0]||null};
const _heroBotUse=botUseSkill;
botUseSkill=function(u,plan){if(!plan.skill.mechanic)return _heroBotUse(u,plan);S.selected=u;if(!HeroCore.begin(u,plan.skillNo))return false;const result=HeroCore.autoSelect();if(!S.pending&&!S.skillSequence&&!u.attacked)S.botQueue?.unshift(u.id);return result};
const _heroBotDefense=botDefense;
botDefense=function(){const pending=S.pending,d=pending&&S.units.find(u=>u.id===pending.d);if(!d||d.side!==S.botSide||S.botDifficulty==='easy')return _heroBotDefense();
  const choices=defenseSkillChoices(d).filter(c=>c.skill.mechanic).sort((a,b)=>['CANCEL','ESCAPE','DICE_WARD','SWAP'].includes(b.skill.mechanic)-['CANCEL','ESCAPE','DICE_WARD','SWAP'].includes(a.skill.mechanic));
  for(const c of choices){if(!HeroCore.begin(c.hero,c.skillNo))continue;if(CorePowerResolver.resolve(pendingAttackPower(pending),c.skill.star||0).winner!=='RESPONSE')HeroCore.selection.cardUid=(S.hands[c.hero.side]||[]).find(card=>(!EquipmentCore.independent(card)||c.skill.mechanic==='HEAL'&&effectOf(card,'EFFECT_HEAL_1'))&&validCardFor(card,c.hero,'def')&&CorePowerResolver.resolve(pendingAttackPower(pending),Math.max(card.star,c.skill.star||0)).winner==='RESPONSE')?.uid||null;
    if(HeroCore.autoSelect()){if(S.pending===pending&&c.skill.mechanic!=='SWAP')resolveCombat();return}HeroCore.selection=null;HeroCore.draw();
  }return _heroBotDefense();
};

;
/* Hero targeting is displayed as a reviewable selection; map clicks and buttons share Core validation. */
const HeroSkillUI={
  panel:document.createElement('section'),bar:document.createElement('div'),
  button(text,action,disabled=false){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=text;b.disabled=disabled;b.onclick=action;return b},
  render(){
    this.panel.replaceChildren();const s=HeroCore.selection;this.panel.hidden=!s;
    if(s){const title=document.createElement('h3');title.textContent=unitSpec(s.h).name+' · '+s.sk.name+' · '+'★'.repeat(s.sk.star||0);this.panel.append(title);
      const desc=document.createElement('p');desc.textContent=s.sk.description||s.sk.name;this.panel.append(desc);
      if(HeroCore.notice){const note=document.createElement('p');note.textContent=HeroCore.notice;this.panel.append(note)}
      const m=s.sk.mechanic;
      if(m==='STEAL'){const list=document.createElement('div');list.className='heroTargetList';for(const c of S.hands[s.h.side===1?2:1]||[]){const b=this.button((s.stealUid===c.uid?'✓ ':'')+c.name+' · '+'★'.repeat(c.star),()=>{s.stealUid=c.uid;this.render()});b.title=c.text;list.append(b)}this.panel.append(list)}
      if(['MORPH','CONVERT','SUMMON'].includes(m)&&!s.sk.parameters?.summonClass){const select=document.createElement('select');select.setAttribute('aria-label','Chủng lính');for(const d of HeroCore.troopDefs())select.add(new Option(ContentViews.unit(d.id).name,d.id));select.value=s.kind;select.onchange=()=>s.kind=select.value;this.panel.append(select)}
      if(m==='COPY'){const select=document.createElement('select');select.setAttribute('aria-label','Skill sao chép');select.add(new Option('Chọn skill đã dùng',''));for(const k of HeroCore.copyChoices(s.h))select.add(new Option(k.name+' · '+'★'.repeat(Math.min(k.star||0,3)),k.id));select.value=s.copyId||'';select.onchange=()=>s.copyId=select.value;this.panel.append(select)}
      if(m==='DICE_WARD'){const label=document.createElement('p');label.textContent='Chọn hai số khác nhau:';this.panel.append(label);for(let i=1;i<=6;i++)this.panel.append(this.button((s.dice.includes(i)?'✓ ':'')+i,()=>{if(s.dice.includes(i))s.dice=s.dice.filter(n=>n!==i);else if(s.dice.length<2)s.dice.push(i);this.render()}))}
      if(['ESCAPE','SUMMON'].includes(m)){const hint=document.createElement('p');hint.textContent='Chọn hex đích trên map hoặc trong danh sách:';this.panel.append(hint);const list=document.createElement('div');list.className='heroTargetList';const options=m==='ESCAPE'?HeroCore.escapeCells(s.h,s.sk):cells.filter(c=>distU(s.h,c)===1&&HeroCore.cellAllowed({side:s.h.side,hero:false,id:null},c));for(const c of options)list.append(this.button((s.cell?.q===c.q&&s.cell?.r===c.r?'✓ ':'')+'Hex '+c.q+','+c.r,()=>HeroCore.selectCell(c)));this.panel.append(list)}
      else if(!['MORPH','COPY','DICE_WARD','STEAL'].includes(m)){const list=document.createElement('div');list.className='heroTargetList';for(const u of HeroCore.targets(s.h,s.sk))list.append(this.button((s.selected.includes(u.id)?'✓ ':'')+unitSpec(u).name+' · HP '+u.hp+' · '+u.q+','+u.r,()=>HeroCore.select(u)));this.panel.append(list)}
      const defense=s.h.side!==S.battleSide,cards=defense||s.sk.equipmentAction||s.equipmentRecovery||s.continuation&&S.heroSequence?[]:(S.hands[s.h.side]||[]).filter(c=>validCardFor(c,s.h,defense?'def':'atk')&&(defense&&(!EquipmentCore.independent(c)||effectOf(c,'EFFECT_HEAL_1')&&s.sk.mechanic==='HEAL')&&!effectOf(c,'EFFECT_REDIRECT_ALLY')&&!effectOf(c,'EFFECT_EQUIPMENT_ROOT_2')||s.sk.heroAttack&&!s.sk.equipmentAction&&!EquipmentCore.standalone(c)));
      if(cards.length){const select=document.createElement('select');select.setAttribute('aria-label','Trang bị kết hợp');select.add(new Option('Không dùng trang bị',''));for(const c of cards)select.add(new Option(c.name+' · '+'★'.repeat(c.star),c.uid));select.value=s.cardUid||'';select.onchange=()=>{s.cardUid=select.value||null;this.render()};this.panel.append(select)}
      this.panel.append(this.button('XÁC NHẬN',()=>HeroCore.commit(),m==='DICE_WARD'&&s.dice.length!==2),this.button(s.equipmentRecovery?'BỎ QUA':'HỦY',()=>s.equipmentRecovery?EquipmentCore.skipRecovery():HeroCore.cancel(),!s.equipmentRecovery&&!!s.continuation&&!!S.heroSequence));
    }
    this.bar.replaceChildren();this.bar.hidden=S.phase!=='battle'||S.matchEnded||!!s;
    if(!this.bar.hidden){for(const h of S.units.filter(u=>u.hero&&u.hp>0&&u.side!==S.battleSide&&u.side!==S.botSide))for(let n=1;n<=3;n++){const sk=heroSkill(h,n);if(sk?.mechanic&&HeroCore.canUse(h,n,sk))this.bar.append(this.button('🛡️ '+unitSpec(h).name+' · '+sk.name,()=>HeroCore.begin(h,n)))}}
  }
};
HeroSkillUI.panel.className='heroSkillPanel';HeroSkillUI.panel.hidden=true;HeroSkillUI.panel.setAttribute('aria-label','Chọn skill Hero');HeroSkillUI.bar.className='heroDefenseBar';CoreDOM.board.wrap.append(HeroSkillUI.panel,HeroSkillUI.bar);
const _heroUIUpdate=updateUI;
updateUI=function(){const result=_heroUIUpdate();HeroSkillUI.render();if(HeroCore.selection)mainBtn.disabled=true;undoBtn.disabled=!!(HeroCore.selection||S.pending||S.heroSequence||S.matchEnded);return result};
const _heroRenderSkills=renderSkills;
HeroSkillUI.actor=function(){
  if(S.postHitReaction?.d.hero)return S.postHitReaction.d;
  const p=S.pending,receiver=p&&S.units.find(u=>u.id===(p.guard?p.guardUnitId:p.replacementTargetId||p.d));
  const side=receiver?.side||S.battleSide;
  const heroes=S.units.filter(u=>u.hero&&u.hp>0&&u.side===side);
  return heroes.find(u=>u.id===S.selected?.id)||heroes.find(h=>[1,2,3].some(n=>HeroCore.canUse(h,n,heroSkill(h,n))))||heroes[0];
};
renderSkills=function(){
  const h=HeroSkillUI.actor();if(!h)return _heroRenderSkills();
  const heading=skillBar.closest('.box')?.querySelector('h3');if(heading)heading.textContent='HERO SKILLS · '+unitSpec(h).name;
  skillBar.replaceChildren();
  for(let n=1;n<=3;n++){
    const sk=heroSkill(h,n);if(!sk)continue;
    const locked=S.matchEnded||h.side===S.botSide||!!S.equipmentReaction||!!HeroCore.selection||!HeroCore.canUse(h,n,sk);
    const reason=locked?(HeroCore.selection?'Hoàn tất hoặc hủy lựa chọn hiện tại':'Chưa đủ điều kiện sử dụng: kiểm tra lượt, trạng thái và giới hạn skill'):'';
    const b=HeroSkillUI.button(sk.name+' · '+'★'.repeat(sk.star||0)+' · '+(sk.timing==='BOTH'?'⚔️🛡️':sk.timing==='DEFENSE_REACTION'?'🛡️':'⚔️')+(sk.heroAttack?' 👊':''),()=>{
      if(S.equipmentReaction||HeroCore.selection||S.matchEnded||h.side===S.botSide||!HeroCore.canUse(h,n,sk))return;
      S.selected=h;hideAttackPopup();hideDefensePopup();HeroCore.begin(h,n);updateUI();
    },locked);
    b.classList.add('skill');b.dataset.heroId=h.id;b.dataset.skillNo=n;
    b.title=sk.description+(reason?' · '+reason:'');b.setAttribute('aria-label',sk.name+' · '+b.title);skillBar.append(b);
  }
};
const _heroPopup=showDefensePopup;
showDefensePopup=function(d){if(HeroCore.selection)return;const result=_heroPopup(d);if(HeroCore.blocked(d,'defense'))defGuardChoice.disabled=true;return result};
defHeroSkillChoice.onclick=()=>{if(!S.pending)return;const d=S.units.find(u=>u.id===S.pending.d);defCardList.replaceChildren();for(const c of defenseSkillChoices(d))defCardList.append(HeroSkillUI.button(unitSpec(c.hero).name+' · '+c.skill.name,()=>HeroCore.begin(c.hero,c.skillNo)));defCardList.classList.add('show')};
atkSkillBtn.onclick=()=>{if(!S.selected?.hero)return;atkSkillList.replaceChildren();for(let n=1;n<=3;n++){const h=S.selected,sk=heroSkill(h,n);atkSkillList.append(HeroSkillUI.button(sk.name+' · '+'★'.repeat(sk.star||0),()=>{hideAttackPopup();HeroCore.begin(h,n)},!HeroCore.canUse(h,n,sk)))}atkSkillList.classList.toggle('show')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&HeroCore.selection){if(HeroCore.selection.equipmentRecovery)EquipmentCore.skipRecovery();else HeroCore.cancel()}});
CoreBoardRenderer.registerLayer('HERO_SKILL_STATE',45,{
  hexClasses(c,u){const s=HeroCore.selection;if(!s||s.uiEquipmentStep)return '';if(u&&HeroCore.candidate(s.h,s.sk,u))return s.selected.includes(u.id)?' skill-selected':' skill-valid';if(!u&&['ESCAPE','SUMMON'].includes(s.sk.mechanic)){const valid=s.sk.mechanic==='ESCAPE'?HeroCore.escapeCells(s.h,s.sk).some(x=>x.q===c.q&&x.r===c.r):distU(s.h,c)===1&&HeroCore.cellAllowed({side:s.h.side,hero:false,id:null},c);if(valid)return ' hl'}return ''},
  renderAfterUnit(g,u,c){const statuses=HeroCore.statuses(u);if(!statuses.length&&!u.morphDefinitionId)return;const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.setAttribute('x',c.x);text.setAttribute('y',c.y-40);text.setAttribute('class','buffTag');text.textContent=[...statuses.map(s=>({STUN:'STUN',ROOT:'TRÓI',FREEZE:'BĂNG',SILENCE:'CÂM'})[s.kind]),u.morphDefinitionId?'BIẾN HÌNH':''].filter(Boolean).join(' · ');g.appendChild(text)}
});

const _heroUndo=undo;
undo=function(){if(S.equipmentReaction||HeroCore.selection||S.pending||S.heroSequence||S.matchEnded)return false;return _heroUndo()};
undoBtn.onclick=()=>undo();

;
/* Equipment effects are scoped to a combat commit. Movement cards are separate pre-Attack actions. */
const EquipmentCore={
  parts(c){return c?.equipmentCards||(c?[c]:[])},
  standalone(c){return this.independent(c)||effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1')||effectOf(c,'EFFECT_EQUIPMENT_PULL_3')},
  independent(c){return ['EFFECT_ASSASSIN_HERO_1','EFFECT_EQUIPMENT_TELEPORT_4','EFFECT_SUMMON_CAV','EFFECT_SUMMON_ARCH','EFFECT_HEAL_1','EFFECT_EQUIPMENT_BASE_MOVE','EFFECT_CANCEL_EQUIPMENT','EFFECT_STEAL_EQUIPMENT'].some(id=>effectOf(c,id))},
  context(h){return h.side===S.battleSide?'atk':'def'},
  baseMove(u){const d=u.morphDefinitionId?UnitRegistry.get(u.morphDefinitionId):u.hero?HeroRegistry.get(u.definitionId):UnitRegistry.get(u.definitionId);return d?.stats.move||0},
  responders(side,c){return S.units.filter(u=>u.side===side&&u.hp>0).flatMap(h=>(S.hands[side]||[]).filter(x=>effectOf(x,'EFFECT_CANCEL_EQUIPMENT')&&x.star>=c.star&&validCardFor(x,h,this.context(h))).map(card=>({h,card}))).filter((x,i,a)=>a.findIndex(y=>y.card.uid===x.card.uid)===i)},
  play(h,c,context,done){
    if(S.equipmentReaction)return false;
    if(h.queuedAttackEquipment!==c&&!HeroCore.equip(c,h,context))return false;
    c.zone='DISCARD';c.state='USED';
    return this.offer(h,c,done);
  },
  offer(h,c,done){
    const side=h.side===1?2:1,choices=this.responders(side,c);
    if(!choices.length){done(true);return true}
    S.equipmentReaction={h,c,side,done,choices,remainingMs:(HeroCore.mode()?.turnPolicy?.defenseTimerSeconds||30)*1000,lastTick:Date.now()};hideAttackPopup();hideDefensePopup();hideUnitMenu();
    if(side===S.botSide){this.counterEquipment(choices[0].h,choices[0].card);return true}
    updateUI();return true;
  },
  passEquipment(){const reaction=S.equipmentReaction;if(!reaction)return false;S.equipmentReaction=null;reaction.done(true);this.resumeClock();updateUI();return true},
  counterEquipment(h,c){
    const reaction=S.equipmentReaction;if(!reaction||h.side!==reaction.side||!this.responders(h.side,reaction.c).some(x=>x.card.uid===c.uid))return false;
    S.equipmentReaction=null;
    if(!HeroCore.equip(c,h,this.context(h))){S.equipmentReaction=reaction;return false}
    c.zone='DISCARD';c.state='USED';
    return this.offer(h,c,accepted=>{if(accepted)lg('🍀 '+reaction.c.name+' bị hủy toàn bộ hiệu ứng.');reaction.done(!accepted);this.resumeClock();updateUI()});
  },
  resumeClock(){if(typeof DuelTurnClock!=='undefined'){DuelTurnClock.lastTickMs=Date.now();DuelTurnClock.defenseLastTickMs=Date.now()}},
  beginIndependent(h,c){
    if(!this.canUse(h,c)||HeroCore.selection)return false;
    const defense=h.side!==S.battleSide;
    let mechanic,target={side:'ALLY',global:true,range:99,maxTargets:1},parameters={};
    if(effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4')){mechanic='ESCAPE';target={side:'SELF',unitType:'HERO'};parameters={escapeRange:4,teleport:true}}
    else if(effectOf(c,'EFFECT_SUMMON_CAV')||effectOf(c,'EFFECT_SUMMON_ARCH')){mechanic='SUMMON';parameters.summonClass=effectOf(c,'EFFECT_SUMMON_CAV')?'CAV':'ARCH'}
    else if(effectOf(c,'EFFECT_HEAL_1')){mechanic='HEAL';target={...target,healable:true,requireMissingHp:true}}
    else if(effectOf(c,'EFFECT_EQUIPMENT_BASE_MOVE'))mechanic='BASE_MOVE';
    else if(effectOf(c,'EFFECT_STEAL_EQUIPMENT'))mechanic='STEAL';
    else if(effectOf(c,'EFFECT_ASSASSIN_HERO_1')){mechanic='STRIKE';target={side:'ENEMY',unitType:'HERO',global:true,range:99,maxTargets:1};parameters={damage:1,fixedCardAttack:true}}
    else return false;
    const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:defense?'DEFENSE_REACTION':'ACTIVE',heroAttack:false,equipmentAction:true,equipmentCard:c,independentDefense:defense,mechanic,target,parameters};
    if(!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();updateUI();return true;
  },
  recoverTargets(s,targets,resume,remainingCard=null){
    const {h,sk}=s;
    const previous=HeroCore.selection;HeroCore.selection={...s,cardUid:null,equipmentBundle:remainingCard};
    const legalTargets=targets.filter(t=>HeroCore.candidate(h,sk,t));HeroCore.selection=previous;
    if(legalTargets.length===targets.length)return false;
    S.pending=null;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;h.queuedAttackEquipment=null;
    if(sk.heroAttack)h.attacked=true;
    HeroCore.selection={...s,selected:legalTargets.map(t=>t.id),cardUid:null,equipmentBundle:remainingCard,continuation:true,equipmentRecovery:true,resume};
    HeroCore.notice='Trang bị tăng tầm đã bị hủy. Chọn mục tiêu hợp lệ khác hoặc BỎ QUA đòn này.';
    S.mode='hero-skill';hideDefensePopup();HeroCore.draw();renderBoard();updateUI();
    if(h.side===S.botSide){if(HeroCore.targets(h,sk).length)HeroCore.autoSelect();else this.skipRecovery()}
    return true;
  },
  skipRecovery(){
    const s=HeroCore.selection;if(!s?.equipmentRecovery)return false;
    if(s.n>0)HeroCore.remember(s.h,s.sk,s.n);
    HeroCore.selection=null;HeroCore.notice='';S.pending=null;S.heroSequence=null;S.skillSequence=null;S.mode=null;S.selected=null;
    lg('⏭ Bỏ qua đòn sau khi trang bị tăng tầm bị hủy.');HeroCore.draw();renderBoard();updateUI();return true;
  },
  resumeNormal(a,d,remainingCard=null){
    if(canAttack(a,d)){showReaction(true);updateUI();return}
    const original=S.pending;
    const sk={id:'NORMAL_ATTACK',name:'Đánh thường',star:0,heroAttack:true,mechanic:'STRIKE',target:{side:'ENEMY',range:'ATTACK',maxTargets:1,pattern:unitSpec(a).attackPattern},parameters:{damage:1,attack:true}};
    this.recoverTargets({h:a,n:0,sk},[d],targets=>{
      HeroCore.selection=null;S.mode=null;S.pending={...original,d:targets[0].id,atkCard:remainingCard};showReaction(true);updateUI();return true;
    },remainingCard);
  },
  owned(h,c){return !!h&&!!c&&(S.hands[h.side]||[]).some(x=>x.uid===c.uid)},
  canUse(h,c){if(S.equipmentReaction||h?.side!==S.battleSide&&S.pending?.defenseSkillUsed)return false;if(this.independent(c)){if(effectOf(c,'EFFECT_ASSASSIN_HERO_1')&&(h?.attacked||HeroCore.blocked(h,'active')||!S.units.some(u=>u.hero&&u.hp>0&&u.side!==h?.side)))return false;if(effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4')){if(!h?.hero||h.hp<=0||h.side===S.battleSide&&h.attacked||!HeroCore.escapeCells(h,{parameters:{escapeRange:4,teleport:true}}).length)return false;if(h.side!==S.battleSide){const p=S.pending;if(!p||p.isCounterattack||(p.guard?p.guardUnitId:p.replacementTargetId||p.d)!==h.id||!defenseEquipmentWins(p,c))return false}}if(!h||h.hp<=0||S.phase!=='battle'||S.matchEnded||!this.owned(h,c)||!validCardFor(c,h,this.context(h))||effectOf(c,'EFFECT_CANCEL_EQUIPMENT')||S.heroSequence&&!S.pending)return false;if(h.side!==S.battleSide&&c.type!=='neu'||h.side===S.battleSide&&(S.pending||S.heroSequence))return false;if(effectOf(c,'EFFECT_SUMMON_CAV')||effectOf(c,'EFFECT_SUMMON_ARCH'))return h.hero&&HeroCore.troopDefs().some(d=>d.class===(effectOf(c,'EFFECT_SUMMON_CAV')?'CAV':'ARCH'))&&cells.some(cell=>distU(h,cell)===1&&HeroCore.cellAllowed({side:h.side,hero:false,id:null},cell));if(effectOf(c,'EFFECT_STEAL_EQUIPMENT'))return (S.hands[h.side===1?2:1]||[]).length>0;return true}if(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'))return this.canUseNet(h,c);if(c?.type==='def')return this.canDefend(h,c);return S.phase==='battle'&&!S.matchEnded&&!S.pending&&!S.heroSequence&&h?.side===S.battleSide&&h.hp>0&&!h.attacked&&!HeroCore.blocked(h,'active')&&this.owned(h,c)&&validCardFor(c,h,'atk')},
  cardFor(u){
    if(S.heroSequence?.h===u.id)return S.heroSequence.card;
    if(S.pending?.a===u.id)return S.pending.atkCard;
    const s=HeroCore.selection;if(s?.h.id===u.id&&s.sk.heroAttack)return HeroCore.selectedCard();
    if(u.queuedAttackEquipment)return u.queuedAttackEquipment;
    if(S.equipPendingActorId===u.id&&this.owned(u,S.equipSelectedCard))return S.equipSelectedCard;
    if(S.selected?.id===u.id&&this.owned(u,S.attackChoice?.card))return S.attackChoice.card;
    return null;
  },
  begin(h,c){
    if(this.independent(c))return this.beginIndependent(h,c);
    if(!this.canUse(h,c)||HeroCore.selection)return false;
    S.selected=h;hideAttackPopup();
    if(!this.standalone(c)){S.equipSelectedCard=c;S.equipPendingActorId=h.id;S.attackChoice=null;showAttackPopup(h);return true}
    const move=effectOf(c,'EFFECT_EQUIPMENT_MOVE_PLUS_1');
    const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'ACTIVE',heroAttack:!move,equipmentAction:true,equipmentCard:c,
      mechanic:move?'BUFF':'STRIKE',target:move?{side:'ALLY',class:'INF',range:99,maxTargets:2}:{side:'ENEMY',range:3,pattern:'LINE',maxTargets:1},
      parameters:move?{move:1}:{damage:1,pull:true,allowAdjacentPullHit:true,ignoreGuard:true,attack:true}};
    if(!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true;
  },
  canUseNet(h,c){return !S.pending?.defenseSkillUsed&&!S.equipmentReaction&&S.phase==='battle'&&!S.matchEnded&&h?.hp>0&&h.side!==S.battleSide&&this.owned(h,c)&&validCardFor(c,h,'def')&&(!S.pending||!S.pending.isCounterattack)},
  beginNet(h,c){if(!this.canUseNet(h,c)||HeroCore.selection)return false;const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'DEFENSE_REACTION',heroAttack:false,equipmentAction:true,equipmentCard:c,independentDefense:true,mechanic:'ROOT',target:{side:'ENEMY',range:2,maxTargets:1},parameters:{}};if(!HeroCore.targets(h,sk).length||!HeroCore.begin(h,0,sk))return false;HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true},
  canDefend(h,c){if(effectOf(c,'EFFECT_REFLECT_DAMAGE'))return false;if(this.independent(c))return this.canUse(h,c);const p=S.pending;return !S.equipmentReaction&&!p?.defenseSkillUsed&&S.phase==='battle'&&!S.matchEnded&&!!p&&!p.isCounterattack&&h?.hp>0&&h.side!==S.battleSide&&(p.d===h.id||p.guard&&p.guardUnitId===h.id)&&this.owned(h,c)&&validCardFor(c,h,'def')&&defenseEquipmentWins(p,c)},
  useDefense(h,c){
    if(this.independent(c))return this.beginIndependent(h,c);
    if(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'))return this.beginNet(h,c);
    if(!this.canDefend(h,c)||HeroCore.selection)return false;
    if(effectOf(c,'EFFECT_REDIRECT_ALLY')){
      const sk={id:c.id,name:c.name,description:c.text,star:c.star,timing:'DEFENSE_REACTION',heroAttack:false,equipmentAction:true,equipmentCard:c,mechanic:'REDIRECT',target:{side:'ALLY',global:true,range:99,maxTargets:1,excludeSelf:true},parameters:{}};
      if(!HeroCore.targets(h,sk).length||!HeroCore.begin(h,0,sk))return false;
      HeroCore.selection.cardUid=c.uid;HeroCore.draw();renderBoard();return true;
    }
    return this.play(h,c,'def',accepted=>{S.pending.defCard=accepted?c:null;resolveCombat()});
  },
  redirect(h,target){
    const p=S.pending;if(!p||target.hp<=0||target.side!==h.side||target.id===h.id)return false;
    (p.redirectHistory??=[]).push(h.id);p.d=target.id;p.guard=false;p.guardUnitId=null;delete p.replacementTargetId;
    p.defCard=null;p.defenseSkillStar=null;delete p.wardRolled;
    // The same incoming action resumes on its new target, with a fresh legal defense choice.
    HeroCore.rollWard(p);lg('↪ Áo Choàng chuyển đòn sang '+unitSpec(target).name+'.');return true;
  },
  postHitChoices(p,d){return (S.hands[d.side]||[]).filter(c=>effectOf(c,'EFFECT_REFLECT_DAMAGE')&&validCardFor(c,d,'def')&&defenseEquipmentWins(p,c))},
  offerPostHit(p,a,d,damage,finish){
    if(p.hitResult!=='HIT'||damage<=0||effectOf(p.defCard,'EFFECT_REFLECT_DAMAGE')||!this.postHitChoices(p,d).length)return false;
    const r={p,a,d,damage,finish,remainingMs:(HeroCore.mode()?.turnPolicy?.defenseTimerSeconds||30)*1000,lastTick:Date.now()};S.postHitReaction=r;
    if(d.side===S.botSide){this.finishPostHit(this.postHitChoices(p,d)[0]);return true}
    if(typeof CombatFlowUI!=='undefined'){CombatFlowUI.close();CombatFlowUI.open(d,'post',{done:c=>this.finishPostHit(c)});renderBoard();updateUI();return true}
    S.postHitReaction=null;return false;
  },
  finishPostHit(c=null){
    const r=S.postHitReaction;if(!r||S.equipmentReaction)return false;
    const finish=accepted=>{if(S.postHitReaction!==r)return;if(accepted&&c){const reflected=r.damage*this.parts(c).filter(x=>effectOf(x,'EFFECT_REFLECT_DAMAGE')).length;r.a.hp=Math.max(0,r.a.hp-reflected);lg('↩️ Khiên Ma Thuật phản '+reflected+' sát thương sau khi nhận đòn.')}S.postHitReaction=null;r.finish();if(typeof DuelTurnClock!=='undefined')DuelTurnClock.afterResolve();if(typeof botObserveResolvedHit==='function')botObserveResolvedHit(r.p,r.a,r.d);if(!S.matchEnded&&typeof scheduleBotTurn==='function')setTimeout(scheduleBotTurn,180);this.resumeClock();updateUI()};
    if(!c){finish(false);return true}
    if(!this.parts(c).every(part=>this.postHitChoices(r.p,r.d).some(x=>x.uid===part.uid)))return false;
    return this.play(r.d,c,'def',finish);
  },
  afterHit(p,a,d){
    if(!effectOf(p.defCard,'EFFECT_COUNTER_BASE_ATTACK')||!defenseEquipmentWins(p,p.defCard)||a.hp<=0)return;
    const def=d.morphDefinitionId?UnitRegistry.get(d.morphDefinitionId):d.hero?HeroRegistry.get(d.definitionId):UnitRegistry.get(d.definitionId);
    if(!def)return;const range=def.stats.attackRange,pattern=def.attackPattern||'RANGE';
    if(distU(d,a)>range||pattern==='LINE'&&!aligned(d,a,range))return;
    const damage=def.stats.damage??1;a.hp=Math.max(0,a.hp-damage);
    lg('🗡 Dao Găm trả '+damage+' sát thương vào '+unitSpec(a).name+' — không mở phòng thủ, kể cả người dùng đã chết.');
  },
  guardReaction(g){
    hideDefensePopup();defPopupTitle.textContent='PLAYER '+g.side+' · ĐỠ ĐÒN CHO ĐỒNG ĐỘI';
    defPopupTarget.textContent=unitSpec(g).name+' · HP '+g.hp+' · Chọn trang bị hoặc nhận đòn';
    defGuardChoice.style.display='none';defHeroSkillChoice.style.display='none';defEquipChoice.style.display='none';
    defCardList.replaceChildren();const pending=S.pending;
    for(const card of defenseCards(g)){const b=HeroSkillUI.button(card.name+' · '+'★'.repeat(card.star),()=>{
      if(S.pending!==pending||!this.owned(g,card)||!validCardFor(card,g,'def'))return;
      this.useDefense(g,card);
    },!this.canDefend(g,card));defCardList.append(b)}
    defCardList.classList.add('show');defPopupHint.textContent='Trang bị áp dụng cho Bộ binh đang nhận đòn thay. Không nhận sát thương thì không phản.';positionDefensePopup(g);
  },
  renderDockHand(){
    if(typeof handBar==='undefined'||typeof handOwner==='undefined')return;
    const reaction=S.equipmentReaction,p=S.pending;
    const receiver=p&&S.units.find(u=>u.id===(p.guard?p.guardUnitId:p.replacementTargetId||p.d));
    const side=reaction?.side||receiver?.side||S.battleSide;
    handOwner.textContent='PLAYER '+side+' · '+(reaction?'HỦY TRANG BỊ':receiver?'TRANG BỊ PHÒNG THỦ':'TRANG BỊ');
    handBar.replaceChildren();if(S.phase!=='battle'||side===S.botSide)return;
    for(const c of S.hands[side]||[]){
      const eligible=reaction?this.responders(side,reaction.c).filter(x=>x.card.uid===c.uid).map(x=>x.h):S.units.filter(u=>u.side===side&&this.canUse(u,c));
      const h=eligible.find(u=>u.id===S.selected?.id)||(reaction?eligible[0]:null);
      const skillGear=typeof DirectBoardFlow!=='undefined'&&HeroCore.selection?.uiFlow&&HeroCore.selection.h.side===S.battleSide&&HeroCore.selection.sk.heroAttack&&!this.standalone(c)&&validCardFor(c,HeroCore.selection.h,'atk');
      const locked=S.matchEnded||!!HeroCore.selection&&!skillGear||!eligible.length;
      const b=document.createElement('button'),tmp=document.createElement('div');tmp.innerHTML=cardHTML(c);
      b.type='button';b.className=tmp.firstElementChild.className;b.append(...tmp.firstElementChild.childNodes);
      b.dataset.equipmentId=c.equipmentId;b.dataset.cardUid=c.uid;b.disabled=locked;
      const reason=S.matchEnded?'Trận đã kết thúc':HeroCore.selection?'Hoàn tất hoặc hủy lựa chọn hiện tại':!h?'Chọn đơn vị để sử dụng':'Dùng cho '+unitSpec(h).name;
      b.title=c.text+' · '+reason;b.setAttribute('aria-label',c.name+' · '+reason);
      b.onclick=()=>{if(S.matchEnded||HeroCore.selection&&!skillGear)return;if(reaction){if(S.equipmentReaction===reaction)this.counterEquipment(h,c)}else if(typeof CombatFlowUI!=='undefined'){CombatFlowUI.startEquipment(h||null,c);updateUI()}else if(this.canUse(h,c)){if(typeof CombatFlowUI!=='undefined')CombatFlowUI.startEquipment(h,c);else if(h.side!==S.battleSide)this.useDefense(h,c);else this.begin(h,c);updateUI()}};
      handBar.append(b);
    }
  },
  render(){
    const host=CoreDOM.board.wrap.closest?.('.duelMapStage')||CoreDOM.board.wrap;if(this.bar.parentElement!==host)host.append(this.bar);
    this.bar.replaceChildren();
    const reaction=S.equipmentReaction;if(reaction){this.bar.hidden=false;const title=document.createElement('p');title.textContent='PLAYER '+reaction.side+' · Địch vừa dùng '+reaction.c.name+' · Hủy card?';this.bar.append(title);for(const {h,card} of this.responders(reaction.side,reaction.c))this.bar.append(HeroSkillUI.button(card.name+' · '+'★'.repeat(card.star),()=>this.counterEquipment(h,card)));this.bar.append(HeroSkillUI.button('BỎ QUA',()=>this.passEquipment()));return}
    if(S.phase==='battle'&&!S.matchEnded&&!HeroCore.selection){
      const seen=new Set();
      for(const h of S.units.filter(u=>u.side!==S.battleSide&&u.side!==S.botSide&&u.hp>0))for(const c of S.hands[h.side]||[]){
        if(!(effectOf(c,'EFFECT_EQUIPMENT_ROOT_2')&&this.canUseNet(h,c)||this.independent(c)&&this.canUse(h,c)))continue;
        if(this.independent(c)&&seen.has(c.uid))continue;seen.add(c.uid);
        const b=HeroSkillUI.button('🛡 P'+h.side+' · '+c.name+' · '+unitSpec(h).name,()=>typeof CombatFlowUI!=='undefined'?CombatFlowUI.startEquipment(h,c):this.independent(c)?this.beginIndependent(h,c):this.beginNet(h,c));b.title=c.text;b.dataset.equipmentId=c.equipmentId;this.bar.append(b);
      }
      if(!S.pending&&!S.heroSequence&&S.battleSide!==S.botSide){
        for(const c of S.hands[S.battleSide]||[]){
          const eligible=S.units.filter(u=>u.side===S.battleSide&&this.canUse(u,c));
          const chosen=eligible.find(u=>u.id===S.selected?.id)||eligible[0];
          for(const h of eligible){const b=HeroSkillUI.button('🎴 P'+h.side+' · '+c.name+' · '+unitSpec(h).name,()=>typeof CombatFlowUI!=='undefined'?CombatFlowUI.startEquipment(h,c):this.begin(h,c));b.title=c.text;b.dataset.equipmentId=c.equipmentId;this.bar.append(b)}
        }
      }
    }
    this.bar.hidden=!this.bar.childElementCount;
  },
  bar:document.createElement('div')
};
EquipmentCore.bar.className='heroDefenseBar equipmentActionBar';EquipmentCore.bar.setAttribute('aria-label','Trang bị lượt công');CoreDOM.board.wrap.append(EquipmentCore.bar);
const _equipmentSpec=unitSpec;
unitSpec=function(u){const spec=_equipmentSpec(u);return spec?{...spec,range:spec.range+HeroCore.cardBonus(EquipmentCore.cardFor(u),'MODIFY_ATTACK_RANGE')}:spec};
const _equipmentSkillRange=HeroCore.skillRange;
HeroCore.skillRange=function(h,sk){const range=_equipmentSkillRange.call(this,h,sk);return range+(sk.heroAttack&&typeof sk.target?.range==='number'?this.cardBonus(EquipmentCore.cardFor(h),'MODIFY_ATTACK_RANGE'):0)};
const _equipmentStart=startAttack;
startAttack=function(a,d){if(S.equipmentReaction)return false;const c=a.queuedAttackEquipment||S.attackChoice?.card;if(c&&EquipmentCore.standalone(c)){if(!EquipmentCore.begin(a,c))return false;if(!HeroCore.select(d)){HeroCore.cancel();return false}return HeroCore.commit()}return _equipmentStart(a,d)};
const _equipmentUpdate=updateUI;
updateUI=function(){const r=_equipmentUpdate();EquipmentCore.render();EquipmentCore.renderDockHand();if(S.equipmentReaction){if(typeof mainBtn!=='undefined')mainBtn.disabled=true;if(typeof undoBtn!=='undefined')undoBtn.disabled=true;if(typeof moveBtn!=='undefined')moveBtn.disabled=true;if(typeof attackBtn!=='undefined')attackBtn.disabled=true;if(typeof skillBar!=='undefined')for(const b of skillBar.querySelectorAll('button'))b.disabled=true;if(typeof gameHint!=='undefined')gameHint.textContent='Player '+S.equipmentReaction.side+' đang quyết định hủy card địch vừa dùng.';hideAttackPopup();hideDefensePopup();if(HeroSkillUI.bar)HeroSkillUI.bar.hidden=true}return r};
const _equipmentSelect=renderEquipmentSelect;
renderEquipmentSelect=function(){_equipmentSelect();const ok=atkCardList.querySelector('.equipSelectFooter .gold');if(!ok)return;const previous=ok.onclick;ok.onclick=()=>{const c=S.equipSelectedCard;if(c&&EquipmentCore.standalone(c))return EquipmentCore.begin(S.selected,c);const r=previous();showAttackPopup(S.selected);return r}};
const _equipmentBotCard=botAttackCard;
botAttackCard=function(u,t){const card=_equipmentBotCard(u,t);return card&&EquipmentCore.standalone(card)?null:card};
window.DOZEN_EQUIPMENT=EquipmentCore;

// All manual defense-card entry points share selection/consumption validation.
defEquipChoice.onclick=()=>{if(!S.pending)return;const d=S.units.find(u=>u.id===S.pending.d);defGuardList.classList.remove('show');clearGuardHighlights();defCardList.replaceChildren();for(const c of defenseCards(d)){const b=HeroSkillUI.button(c.name+' · '+'★'.repeat(c.star),()=>EquipmentCore.useDefense(d,c),!EquipmentCore.canDefend(d,c));b.innerHTML=cardHTML(c);b.title=c.text;defCardList.append(b)}defCardList.classList.toggle('show');positionDefensePopup(d)};

const _equipmentBotDefense=botDefense;
botDefense=function(){
  const p=S.pending,d=p&&S.units.find(u=>u.id===p.d);
  if(d?.side===S.botSide&&S.botDifficulty!=='easy'){
    const cards=defenseCards(d).filter(c=>EquipmentCore.canDefend(d,c));
    const ring=cards.find(c=>effectOf(c,'EFFECT_EQUIPMENT_TELEPORT_4'));if(ring&&HeroCore.incoming(p)>=d.hp&&EquipmentCore.useDefense(d,ring)){if(HeroCore.autoSelect())return;HeroCore.cancel()}
    const incoming=HeroCore.incoming(p),dagger=cards.find(c=>effectOf(c,'EFFECT_COUNTER_BASE_ATTACK'));
    if(dagger&&incoming>=d.hp){if(EquipmentCore.useDefense(d,dagger))return}
    const cloak=cards.find(c=>effectOf(c,'EFFECT_REDIRECT_ALLY'));
    const target=S.units.filter(u=>u.side===d.side&&u.id!==d.id&&u.hp>0).sort((a,b)=>(a.hero?20:0)-(b.hero?20:0)||b.hp-a.hp)[0];
    if(cloak&&target&&incoming>=d.hp&&EquipmentCore.useDefense(d,cloak)){HeroCore.select(target);if(HeroCore.commit())return;HeroCore.cancel()}
  }
  return _equipmentBotDefense();
};

// Equipment reactions are a locked transaction, including independent card actions.
const _equipmentResolve=resolveCombat;
resolveCombat=function(){if(S.equipmentReaction)return false;return _equipmentResolve()};
const _equipmentEnd=endTurn;
endTurn=function(){if(S.equipmentReaction)return false;return _equipmentEnd()};
const _equipmentReset=resetMatchState;
resetMatchState=function(){S.equipmentReaction=null;S.postHitReaction=null;return _equipmentReset()};

;
/* Multiple equipment is a Mode policy. Each physical card keeps its Core checks and counter window. */
EquipmentCore.multipleAllowed=function(){return DW_MODES.get(S.selectedMode)?.equipmentRules?.allowMultiple===true};
EquipmentCore.combine=function(cards){
  if(!cards.length)return null;if(cards.length===1)return cards[0];
  if(!this.multipleAllowed()||new Set(cards.map(c=>c.uid)).size!==cards.length)return null;
  const pack={uid:'equipment-set:'+cards.map(c=>c.uid).join('|'),type:'neu',cls:'neutral',equipmentCards:[...cards]};this.refreshCombination(pack);return pack;
};
EquipmentCore.refreshCombination=function(pack){
  pack.name=pack.equipmentCards.map(c=>c.name).join(' + ');pack.star=Math.max(0,...pack.equipmentCards.map(c=>c.star||0));pack.effects=pack.equipmentCards.flatMap(c=>c.effects||[]);return pack;
};
EquipmentCore.canCombine=function(cards){
  if(cards.length<=1)return true;if(!this.multipleAllowed()||new Set(cards.map(c=>c.uid)).size!==cards.length)return false;
  const actions=cards.filter(c=>this.standalone(c)||effectOf(c,'EFFECT_REDIRECT_ALLY')||effectOf(c,'EFFECT_EQUIPMENT_ROOT_2'));
  // Independent actions with different target choices remain separate Core actions.
  if(actions.length>1)return cards.every(c=>effectOf(c,'EFFECT_HEAL_1'));
  if(actions.length===1&&!effectOf(actions[0],'EFFECT_EQUIPMENT_PULL_3')&&cards.some(c=>c.type==='atk'))return false;
  if(actions.some(c=>effectOf(c,'EFFECT_EQUIPMENT_ROOT_2')))return false;
  return true;
};
const _multiValidCard=validCardFor;
validCardFor=function(c,h,context){if(c?.equipmentCards)return EquipmentCore.multipleAllowed()&&EquipmentCore.canCombine(c.equipmentCards)&&c.equipmentCards.length>0&&c.equipmentCards.every(x=>_multiValidCard(x,h,context));return _multiValidCard(c,h,context)};
const _multiEffectValue=effectValue;
effectValue=function(c,id){return c?.equipmentCards?c.equipmentCards.reduce((n,x)=>n+_multiEffectValue(x,id),0):_multiEffectValue(c,id)};
const _multiOwned=EquipmentCore.owned;
EquipmentCore.owned=function(h,c){return c?.equipmentCards?this.multipleAllowed()&&c.equipmentCards.length>0&&new Set(c.equipmentCards.map(x=>x.uid)).size===c.equipmentCards.length&&c.equipmentCards.every(x=>_multiOwned.call(this,h,x)):_multiOwned.call(this,h,c)};
const _multiCanUse=EquipmentCore.canUse,_multiCanDefend=EquipmentCore.canDefend;
EquipmentCore.canUse=function(h,c){if(c?.equipmentCards)return this.canCombine(c.equipmentCards)&&this.owned(h,c)&&c.equipmentCards.every(x=>_multiCanUse.call(this,h,x));return _multiCanUse.call(this,h,c)};
EquipmentCore.canDefend=function(h,c){if(c?.equipmentCards)return this.canCombine(c.equipmentCards)&&this.owned(h,c)&&c.equipmentCards.every(x=>_multiCanDefend.call(this,h,x));return _multiCanDefend.call(this,h,c)};
const _multiSelectedCard=HeroCore.selectedCard;
HeroCore.selectedCard=function(){const s=this.selection;if(s?.equipmentBundle)return s.equipmentBundle;if(s?.cardUid&&S.equipSelectedCard?.equipmentCards&&s.cardUid===S.equipSelectedCard.uid)return S.equipSelectedCard;return _multiSelectedCard.call(this)};
const _multiEquip=HeroCore.equip;
HeroCore.equip=function(c,h,context){if(!c?.equipmentCards)return _multiEquip.call(this,c,h,context);if(!validCardFor(c,h,context)||!EquipmentCore.owned(h,c))return false;for(const x of c.equipmentCards)_multiEquip.call(this,x,h,context);return true};
const _multiPlay=EquipmentCore.play;
EquipmentCore.play=function(h,c,context,done){
  if(!c?.equipmentCards)return _multiPlay.call(this,h,c,context,done);
  if(!this.multipleAllowed()||!this.canCombine(c.equipmentCards)||S.equipmentReaction||h.queuedAttackEquipment!==c&&(!this.owned(h,c)||!validCardFor(c,h,context)))return false;
  const chosen=[...c.equipmentCards],accepted=[];let index=0;
  const advance=()=>{if(index===chosen.length){c.equipmentCards=accepted;this.refreshCombination(c);done(accepted.length>0);return}
    const next=chosen[index++];if(h.queuedAttackEquipment===c){accepted.push(next);advance();return}
    _multiPlay.call(this,h,next,context,ok=>{if(ok)accepted.push(next);advance()});
  };advance();return true;
};
const _multiAfterHit=EquipmentCore.afterHit;
EquipmentCore.afterHit=function(p,a,d){if(!p.defCard?.equipmentCards)return _multiAfterHit.call(this,p,a,d);for(const c of p.defCard.equipmentCards)if(effectOf(c,'EFFECT_COUNTER_BASE_ATTACK'))_multiAfterHit.call(this,{...p,defCard:c},a,d)};

const _multiRedirect=EquipmentCore.redirect;
EquipmentCore.redirect=function(h,target){const selected=HeroCore.selection?.equipmentBundle||S.pending?.defCard;const r=_multiRedirect.call(this,h,target);if(r&&selected?.equipmentCards){const remaining=selected.equipmentCards.filter(c=>!effectOf(c,'EFFECT_REDIRECT_ALLY')&&validCardFor(c,target,'def')&&defenseEquipmentWins(S.pending,c));S.pending.defCard=this.combine(remaining)}return r};
const _multiCandidate=HeroCore.candidate;
HeroCore.candidate=function(h,sk,u){if(!_multiCandidate.call(this,h,sk,u))return false;const c=this.selection?.h.id===h.id?this.selectedCard():null;if(sk.mechanic==='REDIRECT'&&c?.equipmentCards)return c.equipmentCards.filter(x=>!effectOf(x,'EFFECT_REDIRECT_ALLY')).every(x=>validCardFor(x,u,'def')&&defenseEquipmentWins(S.pending,x));return true};
const _multiBegin=HeroCore.begin;
HeroCore.begin=function(h,n,sk=null,continuation=false){const r=_multiBegin.call(this,h,n,sk,continuation);if(r&&sk?.equipmentCard?.equipmentCards)this.selection.equipmentBundle=sk.equipmentCard;return r};

;
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
    if(result&&defense&&S.pending===pending&&!HeroCore.selection&&!S.equipmentReaction&&!S.postHitReaction&&!S.pending?.replacementTargetId&&!['REDIRECT','MORPH','CONVERT','DICE_WARD'].includes(s.sk.mechanic))resolveCombat();
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
HeroCore.applySelection=function(s,targets,card){const pending=S.pending,r=_flowApplySelection.call(this,s,targets,card);if(r&&s.uiFlow&&s.h.side!==S.battleSide&&pending&&S.pending===pending&&!this.selection&&!S.equipmentReaction&&!S.postHitReaction&&!S.pending.replacementTargetId&&!['REDIRECT','MORPH','CONVERT','DICE_WARD'].includes(s.sk.mechanic))resolveCombat();return r};
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

;
// Keep manual reset useful during playtest.
resetBtn.onclick=()=>{if(confirm('Reset Match hiện tại để test? Room vẫn được giữ nguyên.')){if(S.roomSession)beginNewMatchInRoom()}};
mainBtn.onclick=()=>mainAction();
// v1.11: boot through ShellFlowController only.
S.selectedMode=null;
ShellFlowController.openModeSelect();
if(new URLSearchParams(location.search).get('qa')==='1'){
  setTimeout(()=>{const result=window.DOZEN_QA.run();const pre=document.createElement('pre');pre.id='DOZEN_QA_RESULT';pre.textContent=JSON.stringify(result,null,2);document.body.appendChild(pre);document.title=result.ok?'DOZEN_QA_PASS':'DOZEN_QA_FAIL';},50);
}


;
/* Training controls configure scenarios; normal Core still resolves every action. */
const TrainingMode={
  id:'MODE_TRAINING_001',placement:null,unlocked:{1:new Set(),2:new Set()},quota:{1:{},2:{}},
  active(){return S.selectedMode===this.id&&S.phase==='battle'},
  busy(){return !!(S.pending||S.heroSequence||HeroCore.selection||S.equipmentReaction||S.postHitReaction||CombatFlowUI.state)},
  start(){
    CombatFlowUI.close();resetMatchState();ShellGameOverController.close();closeHub();
    S.selectedMode=this.id;S.roomSession=null;S.matchSession=null;S.phase='battle';S.botSide=null;S.playType='local';S.battleSide=1;S.winner=1;S.loser=2;S.turn=1;S.round=1;
    this.placement=null;this.unlocked={1:new Set(),2:new Set()};this.quota={1:{},2:{}};buildCells();show('game');renderBoard();updateUI();this.configure('unit');
  },
  configure(kind){
    if(!this.active()||this.busy())return false;
    this.dialog.replaceChildren();const title=document.createElement('h2');title.textContent=kind==='unit'?'THÊM HERO / LÍNH':'THÊM TRANG BỊ';this.dialog.append(title);
    const side=document.createElement('select');side.setAttribute('aria-label','Phe');for(const p of [1,2])side.add(new Option('Phe '+p,p));
    const choice=document.createElement('select');choice.setAttribute('aria-label',kind==='unit'?'Hero hoặc lính':'Trang bị');
    const defs=kind==='unit'?[...HeroRegistry.list().map(d=>({id:d.id,name:ContentViews.hero(d.id).name,hero:true})),...UnitRegistry.list().map(d=>({id:d.id,name:ContentViews.unit(d.id).name,hero:false}))]:EquipmentRegistry.list().map(d=>({id:d.id,name:ContentViews.equipment(d.id)?.name||d.id}));
    for(const d of defs)choice.add(new Option((kind==='unit'?(d.hero?'Hero · ':'Lính · '):'')+d.name,d.id));
    this.dialog.append(side,choice,HeroSkillUI.button(kind==='unit'?'CHỌN Ô TRIỂN KHAI':'THÊM',()=>{const p=Number(side.value),def=defs.find(d=>d.id===choice.value);this.dialog.close();if(kind==='unit'){this.placement={side:p,...def};hideUnitMenu();S.selected=null;S.mode=null}else{this.unlocked[p].add(def.id);this.quota[p][def.id]=S.hands[p].filter(c=>c.equipmentId===def.id).length+1;this.refill()}updateUI()}),HeroSkillUI.button('HỦY',()=>this.dialog.close()));this.dialog.showModal();return true;
  },
  place(cell){
    const d=this.placement;if(!d||!this.active()||unitAt(cell.q,cell.r)||cell.blocked)return false;
    S.units.push(createRuntimeEntityInstance({definitionId:d.id,hero:d.hero,side:d.side,q:cell.q,r:cell.r}));this.placement=null;renderBoard();updateUI();return true;
  },
  refill(){if(!this.active())return;for(const side of [1,2])for(const id of this.unlocked[side]){const wanted=this.quota[side][id]||1;for(let n=S.hands[side].filter(c=>c.equipmentId===id).length;n<wanted;n++)S.hands[side].push(createEquipmentCardInstance(id,side))}},
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

;
/* Direct offensive input; all action validation and resolution stays in Core. */
const DirectBoardFlow={
  actorCard:null,
  active(){return S.phase==='battle'&&!S.matchEnded&&!S.pending&&!S.heroSequence&&!S.equipmentReaction&&!S.postHitReaction&&!HeroCore.selection&&!CombatFlowUI.state&&S.battleSide!==S.botSide},
  clear(){this.actorCard=null;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null},
  warning(text){this.warningNode.textContent=text;this.warningNode.hidden=false;this.warningNode.classList.remove('flash');void this.warningNode.offsetWidth;this.warningNode.classList.add('flash');clearTimeout(this.warningTimer);this.warningTimer=setTimeout(()=>this.warningNode.hidden=true,2600)},
  deselect(){if(!this.active())return;this.clear();S.selected=null;S.mode=null;hideUnitMenu();hideAttackPopup();renderBoard();updateUI()},
  select(u){if(!u||u.side!==S.battleSide||u.hp<=0||u.attacked||HeroCore.blocked(u,'active'))return false;if(S.selected?.id!==u.id){const card=this.actorCard;this.clear();if(card){S.selected=u;return this.equipment(u,card)}}S.selected=u;S.mode='direct';hideUnitMenu();hideAttackPopup();renderBoard();updateUI();return true},
  unit(u){if(!this.active())return CoreInputRouter.handleUnitClick(u);if(u.side===S.battleSide)return this.select(u);const a=S.selected;if(!a||a.side!==S.battleSide||a.attacked||a.hp<=0)return false;if(!canAttack(a,u)){this.warning('Ngoài tầm đánh');return false}const result=startAttack(a,u);if(S.heroSequence?.normal&&HeroCore.selection){const skill=HeroCore.selection;skill.uiFlow=true;skill.sk={...skill.sk,uiFlow:true};S.heroSequence.sk=skill.sk;if(HeroCore.targetLimit(a,skill.sk,HeroCore.selectedCard())===1)CombatFlowUI.commit(skill);else CombatFlowUI.prepare(skill)}return result},
  hex(c){if(!this.active())return CoreInputRouter.handleHexClick(c);const u=unitAt(c.q,c.r);if(u)return this.unit(u);const a=S.selected;if(!a||a.side!==S.battleSide||a.attacked||a.hp<=0)return false;const cost=canMoveFurther(a)?movementCostToCell(a,c):null;if(cost==null||cost>remainingMove(a)){this.warning('Ngoài tầm di chuyển');return false}save();a.q=c.q;a.r=c.r;a.movementCostSpent=movementCostSpent(a)+cost;a.moved=a.movementCostSpent>0;S.mode='direct';renderBoard();updateUI();return true},
  equipment(h,c){const skill=HeroCore.selection;if(skill?.uiFlow&&skill.h.side===S.battleSide&&skill.sk.heroAttack&&!EquipmentCore.standalone(c)&&validCardFor(c,skill.h,'atk')){const current=EquipmentCore.parts(HeroCore.selectedCard());const cards=EquipmentCore.multipleAllowed()?current.filter(x=>x.uid!==c.uid).concat(current.some(x=>x.uid===c.uid)?[]:[c]):current.some(x=>x.uid===c.uid)?[]:[c];if(!EquipmentCore.canCombine(cards))return false;const pack=EquipmentCore.combine(cards);skill.cardUid=pack?.uid||null;skill.equipmentBundle=pack?.equipmentCards?pack:null;skill.selected=[];return CombatFlowUI.prepare(skill)}if(!this.active())return this.oldEquipment(h,c);if(!h){this.clear();this.actorCard=c;S.selected=null;S.mode='direct';renderBoard();updateUI();return true}if(!EquipmentCore.canUse(h,c))return false;this.actorCard=null;S.selected=h;hideUnitMenu();hideAttackPopup();if(EquipmentCore.standalone(c)){this.clear();const result=EquipmentCore.begin(h,c);if(result&&HeroCore.selection){const s=HeroCore.selection;s.uiFlow=true;s.sk={...s.sk,uiFlow:true};CombatFlowUI.prepare(s)}return result}let cards=EquipmentCore.parts(S.attackChoice?.card);cards=EquipmentCore.multipleAllowed()?cards.filter(x=>x.uid!==c.uid).concat(cards.some(x=>x.uid===c.uid)?[]:[c]):cards.some(x=>x.uid===c.uid)?[]:[c];if(!EquipmentCore.canCombine(cards))return false;const pack=EquipmentCore.combine(cards);S.attackChoice={type:pack?'card':'normal',card:pack};S.equipSelectedCard=pack;S.equipPendingActorId=pack?h.id:null;S.mode='direct';renderBoard();updateUI();return true}
};
DirectBoardFlow.oldEquipment=CombatFlowUI.startEquipment.bind(CombatFlowUI);
CombatFlowUI.startEquipment=(h,c)=>DirectBoardFlow.equipment(h,c);
const _directSelect=selectUnit;
selectUnit=function(u){return DirectBoardFlow.active()?DirectBoardFlow.select(u):_directSelect(u)};
const _directMenu=renderUnitMenu;
renderUnitMenu=function(){if(DirectBoardFlow.active()){hideUnitMenu();return}return _directMenu()};
const _directMoveHL=isHighlight,_directAttackHL=isAttackHL;
isHighlight=function(c){return DirectBoardFlow.active()&&S.mode==='direct'&&S.selected?canMoveFurther(S.selected)&&reachableCells(S.selected).has(c.q+','+c.r):_directMoveHL(c)};
isAttackHL=function(c){if(DirectBoardFlow.active()&&S.mode==='direct'&&S.selected){const u=unitAt(c.q,c.r);return !!u&&u.side!==S.selected.side&&canAttack(S.selected,u)}return _directAttackHL(c)};
CoreBoardRenderer.registerLayer('DIRECT_EQUIPMENT_ACTOR',80,{unitClasses(u){return DirectBoardFlow.actorCard&&EquipmentCore.canUse(u,DirectBoardFlow.actorCard)?' directEligibleActor':''}});
const _directSkill=CombatFlowUI.startSkill.bind(CombatFlowUI);
CombatFlowUI.startSkill=function(h,n){if(h.side!==S.battleSide)return _directSkill(h,n);if(!DirectBoardFlow.active()||!HeroCore.canUse(h,n,heroSkill(h,n)))return false;const card=S.selected?.id===h.id?S.attackChoice?.card:null;if(card&&(!heroSkill(h,n).heroAttack||EquipmentCore.parts(card).some(c=>!validCardFor(c,h,'atk')||EquipmentCore.standalone(c))))return false;DirectBoardFlow.clear();S.selected=h;if(!HeroCore.begin(h,n))return false;const s=HeroCore.selection;s.uiFlow=true;s.sk={...s.sk,uiFlow:true};s.cardUid=card?.uid||null;s.equipmentBundle=card?.equipmentCards?card:null;return this.prepare(s)};
moveBtn.onclick=attackBtn.onclick=()=>{if(DirectBoardFlow.active()&&S.selected)DirectBoardFlow.select(S.selected)};
DirectBoardFlow.warningNode=document.createElement('div');DirectBoardFlow.warningNode.className='directFlowWarning';DirectBoardFlow.warningNode.setAttribute('role','alert');DirectBoardFlow.warningNode.hidden=true;CoreDOM.board.wrap.append(DirectBoardFlow.warningNode);
boardSvg.addEventListener('click',e=>{if(e.target===boardSvg)DirectBoardFlow.deselect()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&DirectBoardFlow.active())DirectBoardFlow.deselect()});
const _directSync=CombatFlowUI.sync.bind(CombatFlowUI);
CombatFlowUI.sync=function(){_directSync();if(!DirectBoardFlow.active())return;if(DirectBoardFlow.actorCard)gameHint.textContent=DirectBoardFlow.actorCard.name+' · Chọn quân được highlight để dùng trang bị.';else if(S.selected&&S.mode==='direct')gameHint.textContent=unitSpec(S.selected).name+' · '+(S.attackChoice?.card?S.attackChoice.card.name+' đang chờ · ':'')+'Click ô để di chuyển hoặc địch trong tầm để đánh.'};

CoreDOM.board.wrap.addEventListener('click',e=>{if(e.target===CoreDOM.board.wrap)DirectBoardFlow.deselect()});

const _directReset=resetMatchState;resetMatchState=function(){DirectBoardFlow.clear();DirectBoardFlow.warningNode.hidden=true;return _directReset()};

;
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

;
/* DOZEN WAR II v1.37 - Hero / Skill Content Readiness bootstrap boundary */
(function(){
  'use strict';
  window.DWBootstrap = Object.freeze({
    version: '1.8',
    projectVersion: '1.37',
    modularizationPhase: 'HERO_SKILL_CONTENT_READINESS',
    legacyRuntimePreserved: true,
    extractedLayers: Object.freeze(['CONTENT','CORE','MODE','SHELL','UI','PRESENTATION','ASSET','LOCALIZATION','DEBUG_QA']),
    buildPipeline: 'DEV_PROD_BUNDLE',
    productionOutput: 'dist/',
    nextExtractionTarget: 'CONTENT_EXPANSION'
  });
})();

