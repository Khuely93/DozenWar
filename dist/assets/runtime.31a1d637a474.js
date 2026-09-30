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
const CLASS={INF:'INF',ARCH:'ARCH',CAV:'CAV',NEU:'NEU'};
const CLASS_RUNTIME={INF:'infantry',ARCH:'archer',CAV:'cavalry',NEU:'neutral'};
const CLASS_KIND={INF:'inf',ARCH:'arch',CAV:'cav',NEU:'neu'};

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
    SKILL_HERO_EST_S3_NAME:'Ác mộng phía đông',SKILL_HERO_EST_S3_DESC:'Tấn công ★1: thêm 2 Move trước khi đánh; 1 sát thương cho tối đa 4 địch kề EST; buff hết sau lượt',
    SKILL_HERO_ARCH_001_S1_NAME:'Evasion',SKILL_HERO_ARCH_001_S1_DESC:'Né Attack + Equipment ★1',
    SKILL_HERO_ARCH_001_S2_NAME:'Focus Shot',SKILL_HERO_ARCH_001_S2_DESC:'+1 Damage cho Archer',
    SKILL_HERO_ARCH_001_S3_NAME:'Double Shot',SKILL_HERO_ARCH_001_S3_DESC:'2 dmg / tối đa 2 mục tiêu',
    SKILL_HERO_CAV_001_S1_NAME:'Charge Line',SKILL_HERO_CAV_001_S1_DESC:'1 dmg / 2 mục tiêu trên 3 ô',
    SKILL_HERO_CAV_001_S2_NAME:'Cavalry Rush',SKILL_HERO_CAV_001_S2_DESC:'+3 Move cho Cavalry',
    SKILL_HERO_CAV_001_S3_NAME:'Guard Break Charge',SKILL_HERO_CAV_001_S3_DESC:'2 dmg, bỏ qua Infantry Guard',
    CARD_INF_ATK_001_NAME:'Bộ binh ATK',CARD_INF_ATK_001_TEXT:'+1 sát thương',
    CARD_ARCH_ATK_001_NAME:'Cung thủ ATK',CARD_ARCH_ATK_001_TEXT:'+1 sát thương',
    CARD_CAV_ATK_001_NAME:'Kỵ binh ATK',CARD_CAV_ATK_001_TEXT:'+1 sát thương',
    CARD_INF_DEF_001_NAME:'Bộ binh DEF',CARD_INF_DEF_001_TEXT:'Giảm 1 sát thương',
    CARD_ARCH_DEF_001_NAME:'Cung thủ DEF',CARD_ARCH_DEF_001_TEXT:'Giảm 1 sát thương',
    CARD_CAV_DEF_001_NAME:'Kỵ binh DEF',CARD_CAV_DEF_001_TEXT:'Giảm 1 sát thương',
    CARD_NEU_DEF_001_NAME:'Hủy đòn đánh',CARD_NEU_DEF_001_TEXT:'Hủy đòn đánh',
    CARD_NEU_DEF_002_NAME:'Phản sát thương',CARD_NEU_DEF_002_TEXT:'Phản toàn bộ damage, vẫn nhận damage',
    CARD_NEU_UTILITY_001_NAME:'Phá Guard',CARD_NEU_UTILITY_001_TEXT:'Bỏ qua Infantry Guard'
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
const RAW_SKILLS={
  SKILL_HERO_INF_001_S1:{id:'SKILL_HERO_INF_001_S1',nameKey:'SKILL_HERO_INF_001_S1_NAME',descriptionKey:'SKILL_HERO_INF_001_S1_DESC',class:'INF',timing:'ACTIVE',target:{side:'ALLY',range:3,maxTargets:1,requireMissingHp:true},effects:['EFFECT_HEAL_1']},
  SKILL_HERO_INF_001_S2:{id:'SKILL_HERO_INF_001_S2',nameKey:'SKILL_HERO_INF_001_S2_NAME',descriptionKey:'SKILL_HERO_INF_001_S2_DESC',class:'INF',timing:'ACTIVE',target:{side:'ALLY',class:'INF',range:3,maxTargets:1},effects:['EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_INF_001_S3:{id:'SKILL_HERO_INF_001_S3',nameKey:'SKILL_HERO_INF_001_S3_NAME',descriptionKey:'SKILL_HERO_INF_001_S3_DESC',class:'INF',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:4,maxTargets:4,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_RODOC_S1:{id:'SKILL_HERO_RODOC_S1',nameKey:'SKILL_HERO_RODOC_S1_NAME',descriptionKey:'SKILL_HERO_RODOC_S1_DESC',class:'INF',star:3,timing:'DEFENSE_REACTION',target:{side:'ALLY',class:'INF',range:3,maxTargets:1,requireMissingHp:true},effects:['EFFECT_HEAL_1']},
  SKILL_HERO_RODOC_S2:{id:'SKILL_HERO_RODOC_S2',nameKey:'SKILL_HERO_RODOC_S2_NAME',descriptionKey:'SKILL_HERO_RODOC_S2_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ALLY',class:'INF',range:3,maxTargets:2},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_RODOC_S3:{id:'SKILL_HERO_RODOC_S3',nameKey:'SKILL_HERO_RODOC_S3_NAME',descriptionKey:'SKILL_HERO_RODOC_S3_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:4,maxTargets:4,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_EST_S1:{id:'SKILL_HERO_EST_S1',nameKey:'SKILL_HERO_EST_S1_NAME',descriptionKey:'SKILL_HERO_EST_S1_DESC',class:'INF',star:1,timing:'DEFENSE_REACTION',target:{side:'ALLY',unitType:'TROOP',range:3,maxTargets:1},effects:['EFFECT_SWAP_ALLY']},
  SKILL_HERO_EST_S2:{id:'SKILL_HERO_EST_S2',nameKey:'SKILL_HERO_EST_S2_NAME',descriptionKey:'SKILL_HERO_EST_S2_DESC',class:'INF',star:1,timing:'DEFENSE_REACTION',target:{side:'ENEMY',range:3,maxTargets:2,requireRecentAttacker:true},effects:['EFFECT_RETALIATE_1']},
  SKILL_HERO_EST_S3:{id:'SKILL_HERO_EST_S3',nameKey:'SKILL_HERO_EST_S3_NAME',descriptionKey:'SKILL_HERO_EST_S3_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:4},maneuver:{moveBonus:2},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_DAMAGE_1','EFFECT_MOVE_PLUS_2']},
  SKILL_HERO_ARCH_001_S1:{id:'SKILL_HERO_ARCH_001_S1',nameKey:'SKILL_HERO_ARCH_001_S1_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S1_DESC',class:'ARCH',star:1,timing:'DEFENSE_REACTION',target:{side:'SELF'},effects:['EFFECT_EVADE_ATTACK']},
  SKILL_HERO_ARCH_001_S2:{id:'SKILL_HERO_ARCH_001_S2',nameKey:'SKILL_HERO_ARCH_001_S2_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S2_DESC',class:'ARCH',timing:'ACTIVE',target:{side:'ALLY',class:'ARCH',range:3,maxTargets:1},effects:['EFFECT_DAMAGE_PLUS_1']},
  SKILL_HERO_ARCH_001_S3:{id:'SKILL_HERO_ARCH_001_S3',nameKey:'SKILL_HERO_ARCH_001_S3_NAME',descriptionKey:'SKILL_HERO_ARCH_001_S3_DESC',class:'ARCH',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:3,maxTargets:2},effects:['EFFECT_DAMAGE_2']},
  SKILL_HERO_CAV_001_S1:{id:'SKILL_HERO_CAV_001_S1',nameKey:'SKILL_HERO_CAV_001_S1_NAME',descriptionKey:'SKILL_HERO_CAV_001_S1_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ENEMY',pattern:'LINE',range:3,maxTargets:2,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']},
  SKILL_HERO_CAV_001_S2:{id:'SKILL_HERO_CAV_001_S2',nameKey:'SKILL_HERO_CAV_001_S2_NAME',descriptionKey:'SKILL_HERO_CAV_001_S2_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ALLY',class:'CAV',range:3,maxTargets:1},effects:['EFFECT_MOVE_PLUS_3']},
  SKILL_HERO_CAV_001_S3:{id:'SKILL_HERO_CAV_001_S3',nameKey:'SKILL_HERO_CAV_001_S3_NAME',descriptionKey:'SKILL_HERO_CAV_001_S3_DESC',class:'CAV',timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:1},effects:['EFFECT_DAMAGE_2','EFFECT_IGNORE_INF_GUARD']}
};
const RAW_HERO_DB={
  HERO_INF_001:{id:'HERO_INF_001',nameKey:'HERO_INF_001_NAME',class:'INF',stats:{hp:3,move:1,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_INF_001_S1','SKILL_HERO_INF_001_S2','SKILL_HERO_INF_001_S3'],assets:{token:'IMG_HERO_INF_001_TOKEN',attackAnimation:'ANIM_HERO_INF_001_ATTACK'}},
  HERO_INF_RODOC:{id:'HERO_INF_RODOC',nameKey:'HERO_INF_RODOC_NAME',class:'INF',stats:{hp:3,move:1,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_RODOC_S1','SKILL_HERO_RODOC_S2','SKILL_HERO_RODOC_S3'],assets:{token:'IMG_HERO_RODOC_TOKEN',attackAnimation:'ANIM_HERO_RODOC_ATTACK'}},
  HERO_INF_EST:{id:'HERO_INF_EST',nameKey:'HERO_INF_EST_NAME',class:'INF',stats:{hp:3,move:1,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_EST_S1','SKILL_HERO_EST_S2','SKILL_HERO_EST_S3'],assets:{token:'IMG_HERO_EST_TOKEN',attackAnimation:'ANIM_HERO_EST_ATTACK'}},
  HERO_ARCH_001:{id:'HERO_ARCH_001',nameKey:'HERO_ARCH_001_NAME',class:'ARCH',stats:{hp:3,move:1,attackRange:3},attackPattern:'LINE',skillIds:['SKILL_HERO_ARCH_001_S1','SKILL_HERO_ARCH_001_S2','SKILL_HERO_ARCH_001_S3'],assets:{token:'IMG_HERO_ARCH_001_TOKEN',attackAnimation:'ANIM_HERO_ARCH_001_ATTACK'}},
  HERO_CAV_001:{id:'HERO_CAV_001',nameKey:'HERO_CAV_001_NAME',class:'CAV',stats:{hp:3,move:3,attackRange:1},attackPattern:'RANGE',skillIds:['SKILL_HERO_CAV_001_S1','SKILL_HERO_CAV_001_S2','SKILL_HERO_CAV_001_S3'],assets:{token:'IMG_HERO_CAV_001_TOKEN',attackAnimation:'ANIM_HERO_CAV_001_ATTACK'}}
};
const RAW_UNIT_DB={
  UNIT_INF_001:{id:'UNIT_INF_001',nameKey:'UNIT_INF_001_NAME',class:'INF',stats:{hp:2,move:1,attackRange:1},attackPattern:'RANGE',passives:['INF_GUARD'],assets:{token:'IMG_UNIT_INF_001_TOKEN'}},
  UNIT_ARCH_001:{id:'UNIT_ARCH_001',nameKey:'UNIT_ARCH_001_NAME',class:'ARCH',stats:{hp:1,move:1,attackRange:3},attackPattern:'LINE',passives:[],assets:{token:'IMG_UNIT_ARCH_001_TOKEN'}},
  UNIT_CAV_001:{id:'UNIT_CAV_001',nameKey:'UNIT_CAV_001_NAME',class:'CAV',stats:{hp:1,move:3,attackRange:1},attackPattern:'RANGE',passives:['PIERCE_ONE_HEX'],assets:{token:'IMG_UNIT_CAV_001_TOKEN'}}
};
const RAW_CARD_DB={
  CARD_INF_ATK_001:{id:'CARD_INF_ATK_001',nameKey:'CARD_INF_ATK_001_NAME',textKey:'CARD_INF_ATK_001_TEXT',class:'INF',category:'ATTACK',star:1,timing:['ATTACK'],effects:['EFFECT_DAMAGE_PLUS_1']},
  CARD_ARCH_ATK_001:{id:'CARD_ARCH_ATK_001',nameKey:'CARD_ARCH_ATK_001_NAME',textKey:'CARD_ARCH_ATK_001_TEXT',class:'ARCH',category:'ATTACK',star:1,timing:['ATTACK'],effects:['EFFECT_DAMAGE_PLUS_1']},
  CARD_CAV_ATK_001:{id:'CARD_CAV_ATK_001',nameKey:'CARD_CAV_ATK_001_NAME',textKey:'CARD_CAV_ATK_001_TEXT',class:'CAV',category:'ATTACK',star:1,timing:['ATTACK'],effects:['EFFECT_DAMAGE_PLUS_1']},
  CARD_INF_DEF_001:{id:'CARD_INF_DEF_001',nameKey:'CARD_INF_DEF_001_NAME',textKey:'CARD_INF_DEF_001_TEXT',class:'INF',category:'DEFENSE',star:1,timing:['DEFENSE'],effects:['EFFECT_DAMAGE_REDUCE_1']},
  CARD_ARCH_DEF_001:{id:'CARD_ARCH_DEF_001',nameKey:'CARD_ARCH_DEF_001_NAME',textKey:'CARD_ARCH_DEF_001_TEXT',class:'ARCH',category:'DEFENSE',star:1,timing:['DEFENSE'],effects:['EFFECT_DAMAGE_REDUCE_1']},
  CARD_CAV_DEF_001:{id:'CARD_CAV_DEF_001',nameKey:'CARD_CAV_DEF_001_NAME',textKey:'CARD_CAV_DEF_001_TEXT',class:'CAV',category:'DEFENSE',star:1,timing:['DEFENSE'],effects:['EFFECT_DAMAGE_REDUCE_1']},
  CARD_NEU_DEF_001:{id:'CARD_NEU_DEF_001',nameKey:'CARD_NEU_DEF_001_NAME',textKey:'CARD_NEU_DEF_001_TEXT',class:'NEU',category:'DEFENSE',star:2,timing:['DEFENSE'],effects:['EFFECT_CANCEL_ATTACK']},
  CARD_NEU_DEF_002:{id:'CARD_NEU_DEF_002',nameKey:'CARD_NEU_DEF_002_NAME',textKey:'CARD_NEU_DEF_002_TEXT',class:'NEU',category:'DEFENSE',star:2,timing:['DEFENSE'],effects:['EFFECT_REFLECT_DAMAGE']},
  CARD_NEU_UTILITY_001:{id:'CARD_NEU_UTILITY_001',nameKey:'CARD_NEU_UTILITY_001_NAME',textKey:'CARD_NEU_UTILITY_001_TEXT',class:'NEU',category:'UTILITY',star:1,timing:['ATTACK','DEFENSE'],effects:['EFFECT_IGNORE_INF_GUARD']}
};

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
  if(record.class===CLASS.NEU)return {mode:'ANY',classIds:[CLASS.INF,CLASS.ARCH,CLASS.CAV,CLASS.NEU]};
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
const HERO_DB=normalizeContentTable(RAW_HERO_DB,CONTENT_TYPES.HERO);
const UNIT_DB=normalizeContentTable(RAW_UNIT_DB,CONTENT_TYPES.UNIT);
const EQUIPMENT_DB=normalizeContentTable(RAW_CARD_DB,CONTENT_TYPES.EQUIPMENT,e=>({...e,eligibility:equipmentEligibility(e)}));

// Duel deck size and copy distribution are intentionally NOT fixed yet.
// Both the total number of Equipment cards and the copies per Equipment remain Mode/Deck content decisions.
// The stable prototype historically dealt from 3 copies of every current Equipment per player.
// v1.3.1 keeps that behavior only as a NON-AUTHORITATIVE compatibility policy so playable behavior
// remains unchanged until design explicitly locks the real deck composition.
const RAW_DECK_DB=Object.freeze({
  DECK_DUEL_STANDARD_001:{
    id:'DECK_DUEL_STANDARD_001',version:2,declaredSize:null,compositionStatus:'UNLOCKED',
    allowedEquipmentIds:Object.keys(RAW_CARD_DB),
    runtimeCompatibility:{model:'REPEAT_ALL_EQUIPMENT',copiesPerEquipment:3,independentPerPlayer:true,authoritative:false}
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
  for(const [id,u] of Object.entries(UNIT_DB)){keyId(id,u,id);req(u,CONTENT_SCHEMA.UNIT,id);prefixAny(u,['UNIT_'],id);positiveVersion(u,id);if(!validClass.has(u.class))errors.push(`${id}: invalid class ${u.class}`);if(!Number.isFinite(u.stats?.hp)||u.stats.hp<=0)errors.push(`${id}: invalid stats.hp`);if(!Number.isFinite(u.stats?.move)||u.stats.move<0)errors.push(`${id}: invalid stats.move`);if(!Number.isFinite(u.stats?.attackRange)||u.stats.attackRange<1)errors.push(`${id}: invalid stats.attackRange`)}
  for(const [id,c] of Object.entries(EQUIPMENT_DB)){keyId(id,c,id);req(c,CONTENT_SCHEMA.EQUIPMENT,id);prefixAny(c,CONTENT_SCHEMA.EQUIPMENT.idPrefixes,id);positiveVersion(c,id);if(!validClass.has(c.class))errors.push(`${id}: invalid class ${c.class}`);validateEligibility(c,id);if(!Number.isInteger(c.star)||c.star<1)errors.push(`${id}: invalid star`);for(const effectId of c.effects||[])if(!EFFECTS[effectId])errors.push(`${id}: missing effect ${effectId}`)}
  for(const [id,a] of Object.entries(ASSETS)){keyId(id,a,id);req(a,CONTENT_SCHEMA.ASSET,id);positiveVersion(a,id);if(!CONTENT_SCHEMA.ASSET.idPrefixes.some(p=>id.startsWith(p)))warnings.push(`${id}: non-standard asset prefix`)}
  for(const [id,d] of Object.entries(DECK_DB)){
    keyId(id,d,id);req(d,CONTENT_SCHEMA.DECK,id);prefixAny(d,['DECK_'],id);positiveVersion(d,id);
    if(d.declaredSize!==null&&d.declaredSize!==undefined&&(!Number.isInteger(d.declaredSize)||d.declaredSize<1))errors.push(`${id}: invalid declaredSize`);
    if(!Array.isArray(d.allowedEquipmentIds)||!d.allowedEquipmentIds.length)errors.push(`${id}: no allowed equipment`);
    else for(const equipmentId of d.allowedEquipmentIds)if(!EQUIPMENT_DB[equipmentId])errors.push(`${id}: missing equipment ${equipmentId}`);
    if(d.compositionStatus==='LOCKED'){
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
const ContentViews=Object.freeze({
  hero(id){const h=HeroRegistry.get(id);return h?Object.freeze({...h,name:tContent(h.nameKey),sym:AssetResolver.glyph(h.assets?.token,'?')}):null},
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
const HERO_KEY={inf:'HERO_INF_001',arch:'HERO_ARCH_001',cav:'HERO_CAV_001'};
const UNIT_KEY={inf:'UNIT_INF_001',arch:'UNIT_ARCH_001',cav:'UNIT_CAV_001'};
const HEROES=Object.fromEntries(Object.entries(HERO_KEY).map(([k,id])=>{let h=ContentViews.hero(id);return [k,{canonicalId:id,name:h.name,sym:h.sym,base:CLASS_RUNTIME[h.class],classId:h.class,hp:h.stats.hp,move:h.stats.move,range:h.stats.attackRange,skillIds:h.skillIds,skills:h.skillIds.map(s=>ContentViews.skill(s).description)}]}));
const TROOPS=Object.fromEntries(Object.entries(UNIT_KEY).map(([k,id])=>{let u=ContentViews.unit(id);return [k,{canonicalId:id,name:u.name,sym:u.sym,base:CLASS_RUNTIME[u.class],classId:u.class,hp:u.stats.hp,move:u.stats.move,range:u.stats.attackRange,passives:u.passives}]}));
const CARDS=EquipmentRegistry.list().map(c=>{const v=ContentViews.equipment(c.id);return {id:v.id,canonicalId:v.id,name:v.name,cls:CLASS_RUNTIME[v.class],classId:v.class,type:v.category==='ATTACK'?'atk':v.category==='DEFENSE'?'def':'neu',star:v.star,timing:v.timing,effects:v.effects,eligibility:v.eligibility,text:v.text}});

window.DOZEN_DATA={CLASS,CLASS_KIND,ASSETS,EFFECTS,STATUS_DB,SKILLS,HERO_DB,UNIT_DB,EQUIPMENT_DB,CARD_DB,RAW_LOCALES,CONTENT_SCHEMA,CONTENT_SCHEMA_VERSION,CONTENT_TYPES,ContentRegistry,HeroRegistry,UnitRegistry,SkillRegistry,EquipmentRegistry,DeckRegistry,StatusRegistry,EffectRegistry,AssetRegistry,ContentPackRegistry,LocalizationRegistry,AssetResolver,ContentViews,RuntimeInstanceSchema,DeckRuntimeBuilder,ContentManifestBuilder,ContentCompatibilityValidator,MatchContentHandshake,MatchContentSnapshotBuilder,CONTENT_MANIFEST_PROTOCOL_VERSION,CONTENT_COMPATIBILITY_CODES,PERSISTED_DATA_SCHEMA_VERSION,CONTENT_MIGRATION_PROTOCOL_VERSION,PERSISTED_DOCUMENT_KIND,BACKWARD_COMPATIBILITY_POLICY,BACKWARD_COMPATIBILITY_CODES,PersistedSchemaMigrationRegistry,ContentVersionMigrationRegistry,HistoricalContentRegistry,ContentVersionResolver,HistoricalContentAvailability,PersistenceEnvelopeBuilder,BackwardCompatibilityLoader,DECK_DB,CONTENT_PACK_DUEL_001,CONTENT_VALIDATION};
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
  ShellDOM.dice.rule.textContent='P'+S.loser+' chọn Hero + Equipment và xếp quân trước. P'+S.winner+' đi lượt đầu.';
  ShellDOM.dice.continueButton.style.display='inline-block';
}
ShellDOM.dice.continueButton.onclick=()=>beginTeam(S.loser);

let tempHeroDefinitionId='HERO_INF_001', tempTroops={inf:0,arch:0,cav:0};
function beginTeam(p){
  S.phase='team';S.selecting=p;show('team');
  ShellDOM.team.title.textContent='PLAYER '+p+' — CHỌN ĐỘI HÌNH';
  ShellDOM.team.subtitle.textContent=(p===S.loser?'Người đi sau chọn trước':'Người đi trước chọn sau')+' · 1 Hero + đúng 5 lính';
  if(S.teams[p]){tempHeroDefinitionId=S.teams[p].heroDefinitionId||HERO_KEY[S.teams[p].hero]||'HERO_INF_001';tempTroops={...S.teams[p].troops};}
  else{tempHeroDefinitionId='HERO_INF_001';tempTroops={inf:0,arch:0,cav:0};}
  renderTeamPicker();
}
function renderTeamPicker(){
  ShellDOM.team.heroChoices.innerHTML='';
  HeroRegistry.list().forEach(def=>{let h=ContentViews.hero(def.id);let d=document.createElement('button');d.className='choice'+(tempHeroDefinitionId===def.id?' on':'');d.innerHTML='<div class="sym">'+h.sym+'</div><b>'+h.name+'</b><div class="muted">HP '+h.stats.hp+' · '+h.class+'</div>';d.onclick=()=>{tempHeroDefinitionId=def.id;renderTeamPicker()};ShellDOM.team.heroChoices.appendChild(d)});
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
function cardHTML(c,dim=false,sel=false){return '<div class="card '+c.type+(dim?' dim':'')+(sel?' sel':'')+'"><div><b>'+c.name+'</b><div class="star">'+('★'.repeat(c.star))+'</div></div><div class="muted">'+c.text+'</div></div>'}
function dealCards(){
  S.phase='deal';show('deal');
  const mode=DW_MODES.get(S.selectedMode);const deckId=S.matchSession?.contentSnapshot?.deck?.id||mode?.contentPolicy?.deckId||'DECK_DUEL_STANDARD_001';const startingHand=mode?.cardRules?.startingHand??5;
  for(let p of [S.loser,S.winner])S.hands[p]=DeckRuntimeBuilder.dealStartingHand(deckId,p,startingHand);
  ShellDOM.deal.p1Hand.innerHTML=S.hands[1].map(c=>cardHTML(c)).join('');
  ShellDOM.deal.p2Hand.innerHTML=S.hands[2].map(c=>cardHTML(c)).join('');
  summary.textContent='Mỗi Player nhận ngẫu nhiên '+startingHand+' Equipment. Không rút thêm.'
}
ShellDOM.deal.toDeployButton.onclick=()=>beginDeploy();

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
  if(!u||S.phase!=='battle'||!canMoveFurther(u))return out;
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
function save(){S.history.push(JSON.stringify({units:S.units,deployIndex:S.deployIndex,battleSide:S.battleSide,turn:S.turn,phase:S.phase,hands:S.hands,skillUsed:S.skillUsed,cardUsed:S.cardUsed,pending:S.pending,recentAttackers:S.recentAttackers}))}
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
function positionDeployMenu(c){deployMenu.style.left=(c.x/10)+'%';deployMenu.style.top=(c.y/10)+'%';deployMenu.className='deployMenu show';if(c.y<210)deployMenu.classList.add('below');else if(c.x<180)deployMenu.classList.add('right');else if(c.x>820)deployMenu.classList.add('left')}
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
function positionUnitMenu(u){let c=cells.find(c=>c.q===u.q&&c.r===u.r);if(!c)return hideUnitMenu();unitMenu.style.left=(c.x/10)+'%';unitMenu.style.top=(c.y/10)+'%';unitMenu.className='unitMenu show';if(c.y<210)unitMenu.classList.add('below');else if(c.x<180)unitMenu.classList.add('right');else if(c.x>820)unitMenu.classList.add('left')}
function renderUnitMenu(){if(S.phase!=='battle'||!S.selected||S.pending||S.battleSide===S.botSide||S.selected.side!==S.battleSide)return hideUnitMenu();let u=S.selected,sp=unitSpec(u);unitMenuName.textContent=(u.hero?'HERO · ':'')+sp.name+'  ❤'+u.hp+'/'+sp.hp;unitMoveQuick.disabled=!canMoveFurther(u);unitAttackQuick.disabled=u.attacked||(!hasAttackTarget(u)&&(!u.hero||allHeroSkillsUsed(u)));unitSkillQuick.style.display=u.hero?'block':'none';unitSkillQuick.disabled=!u.hero||allHeroSkillsUsed(u)||u.attacked;unitMenuHint.textContent=u.attacked?'Đơn vị đã kết thúc hành động trong lượt này':movementCostSpent(u)>0?('Đã dùng '+movementCostSpent(u)+' Move · còn '+remainingMove(u)+' · có thể Skill / Attack'):'Có thể Move → Skill/Attack hoặc Attack trực tiếp';unitMenuSkills.innerHTML='';if(u.hero){unitSpec(u).skills.forEach((txt,i)=>{let b=document.createElement('button');b.type='button';b.className='btn';b.innerHTML='<b>S'+(i+1)+'</b> · '+txt;let defensive=heroSkill(u,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(u,i+1)||u.attacked||(defensive&&!S.pending);b.addEventListener('click',()=>{unitMenuSkills.classList.remove('show');useSkill(i+1);hideUnitMenu()});unitMenuSkills.appendChild(b)})}positionUnitMenu(u)}
function selectUnit(u){if(S.phase!=='battle'||S.battleSide===S.botSide||u.side!==S.battleSide||S.pending)return false;if(u.attacked)return false;S.selected=u;S.mode=null;updateUI();renderBoard();renderUnitMenu();return true}
function axial(c){return [c.q,c.r]}
function distU(a,b){let [aq,ar]=axial(a),[bq,br]=axial(b),as=-aq-ar,bs=-bq-br;return Math.max(Math.abs(aq-bq),Math.abs(ar-br),Math.abs(as-bs))}
function aligned(a,b,max=99){let [aq,ar]=axial(a),[bq,br]=axial(b);let dq=bq-aq,dr=br-ar,ds=-(dq+dr);if(Math.max(Math.abs(dq),Math.abs(dr),Math.abs(ds))>max)return false;return dq===0||dr===0||ds===0}
function moveReach(u){let max=remainingMove(u);return cells.filter(c=>!unitAt(c.q,c.r)&&distU(u,c)<=max&&distU(u,c)>0)}
function canAttack(a,d){let spec=unitSpec(a),base=spec.base||a.kind;if(base==='archer')return aligned(a,d,spec.range);return distU(a,d)<=spec.range}
unitMenuClose.onclick=()=>{S.selected=null;S.mode=null;hideUnitMenu();renderBoard();updateUI()};
unitMoveQuick.onclick=()=>{if(!S.selected||!canMoveFurther(S.selected))return;S.mode='move';hideUnitMenu();renderBoard();updateUI()};
unitAttackQuick.onclick=()=>{if(!S.selected||S.selected.attacked)return;S.mode='attack';hideUnitMenu();renderBoard();updateUI()};
unitSkillQuick.onclick=()=>{if(!S.selected||!S.selected.hero||false||S.selected.attacked)return;unitMenuSkills.classList.toggle('show')};
moveBtn.onclick=()=>{if(!S.selected||!canMoveFurther(S.selected))return;S.mode='move';hideUnitMenu();renderBoard();updateUI()};
attackBtn.onclick=()=>{if(!S.selected||S.selected.attacked)return;S.mode='attack';hideUnitMenu();renderBoard();updateUI()};
function unitSpec(u){if(!u)return null;if(u.hero){let h=ContentViews.hero(u.definitionId);return h?{canonicalId:h.id,name:h.name,sym:h.sym,base:CLASS_RUNTIME[h.class],classId:h.class,hp:h.stats.hp,move:h.stats.move,range:h.stats.attackRange,skillIds:h.skillIds,skills:h.skillIds.map(id=>ContentViews.skill(id)?.description||id)}:null}let n=ContentViews.unit(u.definitionId);return n?{canonicalId:n.id,name:n.name,sym:n.sym,base:CLASS_RUNTIME[n.class],classId:n.class,hp:n.stats.hp,move:n.stats.move,range:n.stats.attackRange,passives:n.passives}:TROOPS[u.kind]}
function markDuelCardUsed(side,context){if(S.selectedMode==='MODE_DUEL_001'){const bucket=context==='def'?duelUsage().defenseCard:duelUsage().attackCard;bucket[side]++}}
function validCardFor(c,u,context){if(S.selectedMode==='MODE_DUEL_001'){const usage=duelUsage();if(context==='atk'&&usage.attackCard[u.side]>=1)return false;if(context==='def'&&(usage.defenseCard[u.side]>=1||S.pending?.isCounterattack||u.side===S.battleSide))return false}let base=unitSpec(u).base||u.kind;if(c.cls!=='neutral'&&c.cls!==base)return false;if(context==='atk')return c.type==='atk'||c.type==='neu';if(context==='def')return c.type==='def'||c.type==='neu';return false}
function startAttack(a,d){hideUnitMenu();S.mode=null;let base=1+(a.damageBuff||0);S.pending={a:a.id,d:d.id,base,sourceType:'ATTACK',skillId:null,skillStar:null,atkCard:null,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:false,isPropagationTarget:false};showReaction(false);updateUI()}
function showReaction(defPhase){reactionBox.style.display=defPhase?'none':'block';let a=S.units.find(x=>x.id===S.pending.a),d=S.units.find(x=>x.id===S.pending.d);if(defPhase){S.selected=(d&&d.hero)?d:null;S.recentAttackers??={1:[],2:[]};const ids=S.recentAttackers[d.side]??=[];if(!ids.includes(a.id))ids.push(a.id)}else S.selected=a;reactionInfo.textContent=(defPhase?'Defender':'Attacker')+' · '+unitSpec(a).name+' → '+unitSpec(d).name+' · Base Damage '+S.pending.base;if(defPhase){handBar.innerHTML='';handOwner.textContent='PLAYER '+d.side+' · DEFENSE REACTION TRÊN BATTLEFIELD';showDefensePopup(d)}else{hideDefensePopup();renderHand(a.side,'atk');guardBtn.style.display='none';skipReact.textContent='KHÔNG DÙNG CARD';resolveBtn.textContent='CHUYỂN SANG DEFENSE';resolveBtn.onclick=()=>showReaction(true)}renderSkills()}
function pendingAttackPower(p=S.pending){
  if(!p)return 0;
  const sources=[];
  if(p.sourceType==='SKILL'&&p.skillStar!=null)sources.push({sourceType:CORE_STAR_SOURCE.HERO_SKILL,star:p.skillStar,active:true});
  if(p.atkCard)sources.push({sourceType:CORE_STAR_SOURCE.EQUIPMENT,star:p.atkCard.star,active:true});
  return CorePowerResolver.finalPower(sources);
}
function defenseEquipmentWins(p,card){return !!(card&&CorePowerResolver.resolve(pendingAttackPower(p),Math.max(card.star||0,p.defenseSkillStar||0)).winner==='RESPONSE')}
function resolveCombat(){
  hideUnitMenu();
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
  if(p.reflect&&defenseWon&&p.hitResult==='HIT'&&appliedDamage>0){a.hp=Math.max(0,a.hp-appliedDamage);lg('↩️ Reflect trả '+appliedDamage+' damage về '+unitSpec(a).name+' — vẫn resolve kể cả Defender lethal.')}
  if(p.retaliationTargetIds)for(const id of p.retaliationTargetIds){const foe=S.units.find(u=>u.id===id&&u.hp>0);if(foe){const retaliation=1+(dc?effectValue(dc,'EFFECT_DAMAGE_PLUS_1'):0);foe.hp=Math.max(0,foe.hp-retaliation);lg('✨ Phục thù gây '+retaliation+' sát thương cho '+unitSpec(foe).name+'.')}}
  if(p.sourceType!=='SKILL')a.attacked=true;
  lg(p.hitResult==='MISS'?'✨ Kết quả: MISS (Dodge).':p.hitResult==='CANCELLED'?'⛔ Attack bị CANCEL.':'⚔️ Damage resolve: '+appliedDamage);
  const passives=unitSpec(a).passives||[];
  if(p.sourceType!=='SKILL'&&passives.includes('PIERCE_ONE_HEX')&&originalTarget.hp<=0&&appliedDamage>0)doPierce(a,originalTarget,appliedDamage);
  const seq=S.skillSequence;
  S.pending=null;reactionBox.style.display='none';hideDefensePopup();S.selected=null;S.mode=null;
  const result=checkWin();
  if(S.matchEnded)S.skillSequence=null;
  renderBoard();updateUI();
  if(!S.matchEnded&&seq)resolveNextSkillSequenceTarget();
  return result;
}
function doPierce(a,d,dmg){let aq=axial(a),dq=axial(d),vq=dq[0]-aq[0],vr=dq[1]-aq[1],m=Math.max(Math.abs(vq),Math.abs(vr),Math.abs(-(vq+vr)));vq/=m;vr/=m;for(let c of cells){let [cq,cr]=axial(c);if(cq===dq[0]+vq&&cr===dq[1]+vr){let u=unitAt(c.q,c.r);if(u&&u.side!==a.side){u.hp=Math.max(0,u.hp-dmg);lg('🐎 Pierce lan '+dmg+' damage.')}}}}
function guardCandidates(d){return S.units.filter(u=>u.side===d.side&&u.hp>0&&!u.hero&&u.kind==='inf'&&u.id!==d.id&&distU(u,d)<=1)}
function findGuard(d){return guardCandidates(d)[0]||null}
guardBtn.style.display='none';guardBtn.onclick=()=>{};
skipReact.onclick=()=>{if(!S.pending)return;let a=S.units.find(x=>x.id===S.pending.a),d=S.units.find(x=>x.id===S.pending.d);if(reactionInfo.textContent.startsWith('Attacker'))showReaction(true);else resolveCombat()};
function renderSkills(){skillBar.innerHTML='';if(!S.selected||!S.selected.hero){for(let i=0;i<3;i++){let b=document.createElement('button');b.className='btn skill';b.disabled=true;b.textContent='Skill '+(i+1);skillBar.appendChild(b)}return}let h=unitSpec(S.selected);h.skills.forEach((s,i)=>{let b=document.createElement('button');b.className='btn skill';b.innerHTML='<b>S'+(i+1)+'</b><br><span class="muted">'+s+'</span>';let defensive=heroSkill(S.selected,i+1)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(S.selected,i+1)||S.selected.attacked||(defensive&&!S.pending);b.onclick=()=>useSkill(i+1);skillBar.appendChild(b)})}
function useSkill(n){return CoreSkillController.begin(n)}
function lineSkill(h,len,maxT,dmg){for(let dir of dirs){let hits=[];for(let n=1;n<=len;n++){let targetCell=findCellAxialStep(h,dir,n);if(!targetCell)continue;let u=unitAt(targetCell.q,targetCell.r);if(u&&u.side!==h.side)hits.push(u)}if(hits.length){hits.slice(0,maxT).forEach(u=>u.hp=Math.max(0,u.hp-dmg));lg('✨ Skill đường thẳng trúng '+Math.min(maxT,hits.length)+' mục tiêu');return}}lg('Skill không tìm thấy mục tiêu trên đường thẳng.')}
function findCellAxialStep(u,dir,n){let [aq,ar]=axial(u),tq=aq+dir[0]*n,tr=ar+dir[1]*n;return cells.find(c=>{let [q,r]=axial(c);return q===tq&&r===tr})}
function renderHand(p,context){handOwner.textContent='PLAYER '+p+' · '+(context==='atk'?'ATTACK':'DEFENSE')+' WINDOW';handBar.innerHTML='';S.hands[p].forEach(c=>{let u=context==='atk'?S.units.find(x=>x.id===S.pending?.a):S.units.find(x=>x.id===S.pending?.d);let ok=u&&validCardFor(c,u,context);let d=document.createElement('button');d.className='card '+c.type+(ok?'':' dim');d.innerHTML='<div><b>'+c.name+'</b><div class="star">'+('★'.repeat(c.star))+'</div></div><div class="muted">'+c.text+'</div>';d.disabled=!ok;d.onclick=()=>{if(context==='atk'){S.pending.atkCard=c;if(effectOf(c,'EFFECT_IGNORE_INF_GUARD'))S.pending.ignoreGuard=true}else{S.pending.defCard=c}S.hands[p]=S.hands[p].filter(x=>x.uid!==c.uid);markDuelCardUsed(p,context);lg('🎴 Player '+p+' dùng '+c.name+' ['+c.canonicalId+']');showReaction(context==='def')};handBar.appendChild(d)})} 
let checkWin=()=>null
function updateUI(){if(S.phase==='battle'&&S.units.filter(u=>u.hero).length===2&&S.units.some(u=>u.hero&&u.hp<=0))checkWin();if(S.phase==='deploy'){let p=currentDeployPlayer(),n=S.units.filter(u=>u.side===p).length;mainBtn.disabled=currentDeployPlayer()===S.botSide;gameTitle.textContent='DEPLOYMENT — PLAYER '+p;gameHint.textContent=(p===S.loser?'Người đi sau xếp trước':'Người đi trước xếp sau')+' · đã xếp '+n+'/6';mainBtn.textContent=n===6?(S.deployIndex===0?'XÁC NHẬN & CHUYỂN PLAYER':'BATTLE START'):'XÁC NHẬN';summary.textContent='Player '+S.loser+' chọn/xếp trước. Player '+S.winner+' đi lượt đầu.';unitInfo.textContent='Nhấn một ô hex trống trong lãnh địa → chọn HERO hoặc LÍNH. Muốn đổi vị trí: kéo trực tiếp quân bằng chuột; trên điện thoại nhấn giữ rồi kéo.';moveBtn.disabled=attackBtn.disabled=true;renderSkills();handBar.innerHTML='';handOwner.textContent='Hand sẽ dùng trong Battle.';reactionBox.style.display='none'}else if(S.phase==='battle'){gameTitle.textContent='TURN '+S.turn+' — PLAYER '+S.battleSide;gameHint.textContent='Mỗi đơn vị có 1 lần Move và 1 lần Attack mỗi lượt; Attack kết thúc hành động của đơn vị.';mainBtn.textContent='KẾT THÚC LƯỢT';mainBtn.disabled=!!(S.pending||S.skillTarget||S.skillSequence||S.guardTargeting||S.matchEnded||S.battleSide===S.botSide);if(S.battleSide===S.botSide&&!S.pending)gameHint.textContent='Bot đang thực hiện lượt của mình.';if(S.pending)gameHint.textContent='Đang chờ phản ứng phòng thủ: chọn cách phòng thủ hoặc KHÔNG ĐỠ ĐÒN để hoàn tất đòn đánh.';else if(S.skillSequence)gameHint.textContent='Đang xử lý các mục tiêu tiếp theo của Skill.';else if(S.skillTarget)gameHint.textContent='Chọn mục tiêu Skill hoặc hủy chọn mục tiêu để kết thúc lượt.';else if(S.guardTargeting)gameHint.textContent='Chọn Bộ binh đỡ đòn hoặc hủy lựa chọn phòng thủ.';summary.textContent='Lượt đầu thuộc Player '+S.winner+' (người thắng Roll Dice).';if(S.selected){let sp=unitSpec(S.selected);unitInfo.innerHTML='<b>'+sp.name+'</b><br>HP '+S.selected.hp+'/'+sp.hp+' · Move '+movementBudgetTotal(S.selected)+' (đã dùng '+movementCostSpent(S.selected)+', còn '+remainingMove(S.selected)+') · Range '+sp.range+(sp.base==='archer'?' đường thẳng 3 ô, xuyên đơn vị':'');moveBtn.disabled=S.battleSide===S.botSide||!canMoveFurther(S.selected);attackBtn.disabled=S.battleSide===S.botSide||S.selected.attacked||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected)))}else{unitInfo.textContent='Chọn một đơn vị của Player '+S.battleSide+'.';moveBtn.disabled=attackBtn.disabled=true}renderSkills();if(!S.pending){handOwner.textContent=S.battleSide===S.botSide?'BOT HAND · đang ẩn':'PLAYER '+S.battleSide+' HAND · card hợp lệ sẽ sáng theo context';handBar.innerHTML=S.battleSide===S.botSide?'':S.hands[S.battleSide].map(c=>cardHTML(c,true)).join('');reactionBox.style.display='none'}}}

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
  guardTargetHint.classList.remove('show');
  clearGuardHighlights();
  let node=boardSvg.querySelector('[data-unit-id="'+g.id+'"]');
  if(node)node.classList.add('guardChosen');
  lg('🛡️ Player '+d.side+' chọn '+unitSpec(g).name+' đỡ đòn cho '+unitSpec(d).name+'.');
  setTimeout(resolveCombat,120);
  return true;
}

function hideDefensePopup(){if(typeof defensePopup==='undefined')return;defensePopup.className='defensePopup';defGuardList.classList.remove('show');defCardList.classList.remove('show');S.guardTargeting=false;if(typeof guardTargetHint!=='undefined')guardTargetHint.classList.remove('show');clearGuardHighlights()}
function positionDefensePopup(d){let c=cells.find(c=>c.q===d.q&&c.r===d.r);if(!c)return;defensePopup.style.left=(c.x/10)+'%';defensePopup.style.top=(c.y/10)+'%';defensePopup.className='defensePopup show';if(c.y<220)defensePopup.classList.add('below');else if(c.x<190)defensePopup.classList.add('right');else if(c.x>810)defensePopup.classList.add('left')}
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
function useDefenseSkill(choice,target,card=null){
  const selected=Array.isArray(target)?target:[target];
  if(!S.pending||!choice||!selected.length||selected.length>(choice.skill.target?.maxTargets||1)||
     !defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).some(c=>c.hero.id===choice.hero.id&&c.skillNo===choice.skillNo&&selected.every(u=>c.targets.some(valid=>valid.id===u?.id))))return false;
  const {hero,skill,skillNo}=choice;
  if(card&&(!validCardFor(card,hero,'def')||!(S.hands?.[hero.side]||[]).some(c=>c.uid===card.uid)))return false;
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
  markSkillUsed(hero,skillNo);resolveCombat();return true;
}
function showDefensePopup(d){
  if(!S.pending||!d)return;if(S.pending.isPropagationTarget)return hideDefensePopup();clearGuardHighlights();defGuardList.innerHTML='';defCardList.innerHTML='';defGuardList.classList.remove('show');defCardList.classList.remove('show');
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
  cards.forEach(c=>{let b=document.createElement('button');b.className='btn mini';b.innerHTML='🎴 <b>'+c.name+'</b> '+('★'.repeat(c.star))+'<br><span class="muted">'+c.text+'</span>';b.onclick=()=>{S.pending.defCard=c;S.hands[d.side]=S.hands[d.side].filter(x=>x.uid!==c.uid);markDuelCardUsed(d.side,'def');lg('🎴 Player '+d.side+' dùng '+c.name+' để phòng thủ.');resolveCombat()};defCardList.appendChild(b)});
  defCardList.classList.toggle('show');
};
defHeroSkillChoice.onclick=()=>{
  if(!S.pending)return;
  const d=S.units.find(u=>u.id===S.pending.d),choices=defenseSkillChoices(d);
  defGuardList.classList.remove('show');defCardList.innerHTML='';
  for(const choice of choices){
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
  if(skillNeedsLineLock(skill)&&st.ray&&!onRay(hero,u,st.ray,skill.target.range))return false;
  return true;
}
function selectedSkillTarget(u){return !!S.skillTarget?.selected?.includes(u.id)}
function updateSkillTargetPanel(){
  let st=S.skillTarget;if(!st){skillTargetPanel.classList.remove('show');return}
  let hero=S.units.find(x=>x.id===st.heroId),skill=ContentViews.skill(st.skillId);if(!hero||!skill)return cancelSkillTarget();
  let count=st.selected.length,max=skill.target?.maxTargets||1;
  skillTargetName.textContent='S'+st.skillNo+' · '+skill.name;
  let rule=skill.target.side==='ALLY'?'Chọn đồng minh':'Chọn mục tiêu địch';
  if(skill.target.class)rule+=' · '+skill.target.class;
  if(skill.target.range!=null)rule+=' · phạm vi '+skill.target.range+' ô';
  if(skillNeedsLineLock(skill))rule+=' · các mục tiêu phải cùng một đường thẳng';
  const cards=skill.timing==='ACTIVE'||skill.timing==='BOTH'?attackCardsFor(hero):[];
  if(st.cardUid&&!cards.some(card=>card.uid===st.cardUid))st.cardUid=null;
  skillTargetHint.textContent=rule+' · đã chọn '+count+'/'+max+'. Click mục tiêu để chọn/bỏ chọn.'+
    (st.cardUid&&skillDamageValue(skill)===0?' Card sẽ chuyển hiệu ứng và ★ sang đòn đánh thường kế tiếp của Hero.':'');
  if(skill.maneuver){skillMoveButton.style.display='block';skillMoveButton.disabled=remainingMove(hero)<=0;skillMoveButton.textContent=st.moving?'👟 CHỌN Ô TRỐNG · HỦY CHỌN':'👟 DI CHUYỂN · còn '+remainingMove(hero)+' ô';skillTargetHint.textContent+=' Có thể di chuyển trước khi chọn mục tiêu; HỦY sẽ trả lại vị trí và Move.'}else skillMoveButton.style.display='none';
  skillEquipWrap.style.display=cards.length?'block':'none';
  skillEquipSelect.replaceChildren(new Option('Không dùng Card',''));
  cards.forEach(card=>skillEquipSelect.add(new Option(card.name+' · '+'★'.repeat(card.star)+' · '+card.text,card.uid)));
  skillEquipSelect.value=cards.some(card=>card.uid===st.cardUid)?st.cardUid:'';
  skillTargetConfirm.disabled=count===0;
  skillTargetPanel.classList.add('show');
}
skillEquipSelect.onchange=()=>{if(S.skillTarget){S.skillTarget.cardUid=skillEquipSelect.value||null;updateSkillTargetPanel()}};
skillMoveButton.onclick=()=>{if(!S.skillTarget)return;S.skillTarget.moving=!S.skillTarget.moving;updateSkillTargetPanel();renderBoard()};
function _beginSkillTargetInternal(n){
  let h=S.selected;if(!h||!h.hero||isSkillUsed(h,n)||h.attacked)return;
  let skill=heroSkill(h,n);if(!skill)return;
  if(skill.timing==='DEFENSE_REACTION'||skill.timing==='BOTH'&&S.pending){
    if(!S.pending)return;
    const d=S.units.find(u=>u.id===S.pending.d),choice=defenseSkillChoices(d).find(c=>c.hero.id===h.id&&c.skillNo===n);
    if(choice)useDefenseSkill(choice,choice.targets.find(u=>u.id===d.id)||choice.targets[0]);
    return;
  }
  let candidates=S.units.filter(u=>baseSkillCandidate(h,skill,u));
  if(!candidates.length&&!skill.maneuver)return alert('Không có mục tiêu hợp lệ cho skill này.');
  const pendingCard=S.equipPendingActorId===h.id&&attackCardsFor(h).some(c=>c.uid===S.equipSelectedCard?.uid)?S.equipSelectedCard:null;
  const maneuverStart=skill.maneuver?{q:h.q,r:h.r,movementCostSpent:h.movementCostSpent||0,moved:!!h.moved,moveBuff:h.moveBuff||0}:null;
  if(maneuverStart)h.moveBuff=(h.moveBuff||0)+skill.maneuver.moveBonus;
  S.skillTarget={heroId:h.id,skillNo:n,skillId:skill.id,selected:[],ray:null,cardUid:pendingCard?.uid||null,maneuverStart,moving:false};S.mode='skill';hideUnitMenu();updateSkillTargetPanel();renderBoard();updateUI();
}
function handleSkillTargetClick(u){
  if(!S.skillTarget||!isSkillCandidate(u))return;
  let st=S.skillTarget,skill=ContentViews.skill(st.skillId),hero=S.units.find(x=>x.id===st.heroId),max=skill.target?.maxTargets||1;
  let idx=st.selected.indexOf(u.id);
  if(idx>=0){st.selected.splice(idx,1);if(skillNeedsLineLock(skill)&&st.selected.length===0)st.ray=null}
  else{
    if(max===1)st.selected=[u.id];
    else if(st.selected.length<max){if(skillNeedsLineLock(skill)&&!st.ray)st.ray=rayFrom(hero,u);st.selected.push(u.id)}
  }
  if(skillNeedsLineLock(skill)&&st.selected.length && !st.ray){let first=S.units.find(x=>x.id===st.selected[0]);st.ray=rayFrom(hero,first)}
  updateSkillTargetPanel();renderBoard();
}
function cancelSkillTarget(){let st=S.skillTarget;if(st?.maneuverStart){let h=S.units.find(u=>u.id===st.heroId);if(h)Object.assign(h,st.maneuverStart)}S.skillTarget=null;if(S.mode==='skill')S.mode=null;skillTargetPanel.classList.remove('show');renderBoard();updateUI();if(S.selected?.hero&&!S.pending)renderUnitMenu()}
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
  let st=S.skillTarget;if(!st||!st.selected.length)return;
  let hero=S.units.find(x=>x.id===st.heroId),skill=ContentViews.skill(st.skillId),targets=st.selected.map(id=>S.units.find(u=>u.id===id)).filter(Boolean);if(!hero||!skill)return cancelSkillTarget();
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
  let h=unitSpec(S.selected);h.skills.forEach((txt,i)=>{let b=document.createElement('button');b.className='btn skill';let active=S.skillTarget?.skillNo===i+1;b.innerHTML='<b>S'+(i+1)+(active?' · TARGETING':'')+'</b><br><span class="muted">'+txt+'</span>';let defensive=heroSkill(S.selected,i+1)?.timing==='DEFENSE_REACTION';b.disabled=(S.battleSide===S.botSide&&!S.pending)||isSkillUsed(S.selected,i+1)||S.selected.attacked||(defensive&&!S.pending)||!!(S.skillTarget&&!active);b.onclick=()=>CoreSkillController.begin(i+1);skillBar.appendChild(b)})
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
    if(skill.timing==='DEFENSE_REACTION'||skill.timing==='BOTH'&&S.pending)return !!S.pending&&defenseSkillChoices(S.units.find(u=>u.id===S.pending.d)).some(c=>c.hero.id===S.selected.id&&c.skillNo===skillNo);
    if(S.pending||S.selected.side!==S.battleSide||S.selected.attacked)return false;
    return true;
  },
  cancel(){ return cancelSkillTarget(); },
  commit(){ return applySkillTarget(); },

  handleUnitClick(unit){
    if(!this.active())return false;
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
    st.selected=[];st.ray=null;st.moving=false;
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
      polygon.addEventListener("click",()=>CoreInputRouter.handleHexClick(cell));
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
      group.appendChild(circle);

      let symbol=document.createElementNS("http://www.w3.org/2000/svg","text");
      symbol.setAttribute("x",cell.x);symbol.setAttribute("y",cell.y-2);
      symbol.textContent=unitSpec(unit).sym;
      symbol.setAttribute("font-size","24");
      group.appendChild(symbol);

      let hp=document.createElementNS("http://www.w3.org/2000/svg","text");
      hp.setAttribute("x",cell.x);hp.setAttribute("y",cell.y+20);
      hp.textContent="❤"+unit.hp;hp.setAttribute("fill","#fff");
      group.appendChild(hp);

      for(const entry of this.layers){
        entry.layer.renderAfterUnit?.(group,unit,cell);
      }

      group.addEventListener("click",e=>{
        e.stopPropagation();
        CoreInputRouter.handleUnitClick(unit);
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
CoreBoardRenderer.registerLayer("CORE_RENDER_BUFF",30,CoreBuffController);
CoreBoardRenderer.registerLayer("CORE_RENDER_SKILL",40,CoreSkillController);
CoreBoardRenderer.registerLayer("CORE_RENDER_GUARD",50,CoreGuardController);
CoreBoardRenderer.registerLayer("CORE_RENDER_ACTION_STATUS",60,CoreActionStatusLayer);

// Single authoritative renderer entry point.
function renderBoard(){ return CoreBoardRenderer.render(); }

// Compatibility entry point for any legacy code that still calls cellClick().
function cellClick(cell){ return CoreInputRouter.handleHexClick(cell); }

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
  cards.forEach(c=>{let b=document.createElement('button');b.className='equipCardBtn'+(S.equipSelectedCard?.uid===c.uid?' selected':'');b.innerHTML='🎴 <b>'+c.name+'</b> '+('★'.repeat(c.star))+'<br><span class="muted">'+c.text+'</span>';b.onclick=()=>{S.equipSelectedCard=S.equipSelectedCard?.uid===c.uid?null:c;renderEquipmentSelect()};wrap.appendChild(b)});
  let foot=document.createElement('div');foot.className='equipSelectFooter';
  let back=document.createElement('button');back.className='btn';back.textContent='← QUAY LẠI';back.onclick=()=>{S.equipSelectedCard=null;S.equipPendingActorId=null;atkCardList.classList.remove('show');atkCardList.innerHTML='';};
  let ok=document.createElement('button');ok.className='btn gold';ok.textContent='XÁC NHẬN CARD';ok.disabled=!S.equipSelectedCard;ok.onclick=()=>{if(!S.equipSelectedCard||!attackCardsFor(S.selected).some(c=>c.uid===S.equipSelectedCard.uid))return;S.equipPendingActorId=S.selected.id;atkCardList.classList.remove('show');atkCardList.innerHTML='';atkPopupHint.textContent='Card đang chờ · chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.';};
  foot.append(back,ok);wrap.appendChild(foot);atkCardList.appendChild(wrap);atkCardList.classList.add('show');
  atkPopupHint.textContent=S.equipSelectedCard?'XÁC NHẬN CARD để giữ pending, sau đó chọn ĐÁNH THƯỜNG hoặc SKILL.':'Chọn 1 Card. Nhấn lại Card đang chọn để bỏ chọn.';
}
function hideAttackPopup(){attackPopup.className='attackPopup';atkSkillList.classList.remove('show');atkCardList.classList.remove('show');atkSkillList.innerHTML='';atkCardList.innerHTML=''}
function positionAttackPopup(u){let c=cells.find(c=>c.q===u.q&&c.r===u.r);if(!c)return;attackPopup.style.left=(c.x/10)+'%';attackPopup.style.top=(c.y/10)+'%';attackPopup.className='attackPopup show';if(c.y<220)attackPopup.classList.add('below');else if(c.x<190)attackPopup.classList.add('right');else if(c.x>810)attackPopup.classList.add('left')}
function showAttackPopup(u){if(!u||S.battleSide===S.botSide||S.phase!=='battle'||u.side!==S.battleSide||u.attacked||S.pending)return;S.selected=u;S.mode=null;S.attackChoice=null;hideUnitMenu();hideDefensePopup();atkSkillList.innerHTML='';atkCardList.innerHTML='';atkSkillList.classList.remove('show');atkCardList.classList.remove('show');let cards=attackCardsFor(u),pending=S.equipPendingActorId===u.id&&cards.some(c=>c.uid===S.equipSelectedCard?.uid);atkPopupTitle.textContent='PLAYER '+u.side+' · ATTACK ACTION';atkPopupInfo.textContent=(u.hero?'HERO · ':'')+unitSpec(u).name+' · Chọn cách tấn công';atkNormalBtn.disabled=!hasAttackTarget(u);atkSkillBtn.style.display=u.hero?'block':'none';atkSkillBtn.disabled=!u.hero||allHeroSkillsUsed(u)||u.attacked;atkEquipBtn.disabled=!cards.length;atkEquipBtn.textContent='🎴 '+(pending?'ĐỔI CARD ĐANG CHỜ':'CHỌN TRANG BỊ')+' ('+cards.length+')';atkPopupHint.textContent=u.queuedAttackEquipment?'Card từ Skill hỗ trợ đang chờ đòn đánh thường kế tiếp.':pending?'Card đang chờ · chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.':'Chọn Card trước, rồi chọn ĐÁNH THƯỜNG hoặc SKILL chủ động.';positionAttackPopup(u);renderBoard();updateUI()}
function _beginAttackTargetInternal(card){if(!S.selected||S.selected.attacked)return;S.attackChoice={type:card?'card':'normal',card:card||null};S.mode='attack';hideAttackPopup();renderBoard();updateUI();lg(card?'🎴 '+unitSpec(S.selected).name+' chuẩn bị tấn công với '+card.name+'.':'⚔️ '+unitSpec(S.selected).name+' chuẩn bị đánh thường.');}
atkPopupClose.onclick=()=>{S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;S.mode=null;hideAttackPopup();renderBoard();renderUnitMenu()};
atkNormalBtn.onclick=()=>{const card=S.equipPendingActorId===S.selected?.id?S.equipSelectedCard:null;CoreAttackController.begin(card)};
atkEquipBtn.onclick=()=>{if(!S.selected)return;renderEquipmentSelect()};
atkSkillBtn.onclick=()=>{if(!S.selected||!S.selected.hero)return;atkCardList.classList.remove('show');atkSkillList.innerHTML='';unitSpec(S.selected).skills.forEach((txt,i)=>{let n=i+1,b=document.createElement('button');b.className='btn';b.innerHTML='<b>S'+n+'</b> · '+txt;let defensive=heroSkill(S.selected,n)?.timing==='DEFENSE_REACTION';b.disabled=isSkillUsed(S.selected,n)||S.selected.attacked||defensive;b.onclick=()=>{hideAttackPopup();S.attackChoice=null;CoreSkillController.begin(n)};atkSkillList.appendChild(b)});atkSkillList.classList.toggle('show')};
atkSkipBtn.onclick=()=>{if(!S.selected)return;let u=S.selected;u.attacked=true;S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;S.mode=null;S.selected=null;hideAttackPopup();hideUnitMenu();lg('↪ '+unitSpec(u).name+' bỏ qua hành động tấn công trong lượt này.');renderBoard();updateUI()};

// ATTACK button now opens the contextual attack-action popup instead of immediately entering target mode.
unitAttackQuick.onclick=()=>{if(!S.selected||S.selected.attacked||S.pending||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected))))return;showAttackPopup(S.selected)};
attackBtn.onclick=()=>{if(!S.selected||S.selected.attacked||S.pending||(!hasAttackTarget(S.selected)&&(!S.selected.hero||allHeroSkillsUsed(S.selected))))return;showAttackPopup(S.selected)};

// Consume an attack card only after a legal target is actually selected; then go straight to defender reaction.
startAttack=function(a,d){hideUnitMenu();hideAttackPopup();S.mode=null;let choice=S.attackChoice||{type:'normal',card:null};let base=1+(a.damageBuff||0),queued=a.queuedAttackEquipment||null,card=queued||choice.card||null;if(choice.card&&queued)return false;if(choice.card&&(!validCardFor(choice.card,a,'atk')||!(S.hands[a.side]||[]).some(c=>c.uid===choice.card.uid)))return false;S.pending={a:a.id,d:d.id,base,sourceType:'ATTACK',skillId:null,skillStar:null,atkCard:card,defCard:null,guard:false,guardUnitId:null,cancel:false,cancelReason:null,hitResult:'PENDING',reflect:false,ignoreGuard:effectOf(card,'EFFECT_IGNORE_INF_GUARD'),isPropagationTarget:false};if(card){if(queued)a.queuedAttackEquipment=null;else{S.hands[a.side]=S.hands[a.side].filter(x=>x.uid!==card.uid);markDuelCardUsed(a.side,'atk')}lg('🎴 Player '+a.side+' dùng '+card.name+' cho đòn tấn công.')}S.attackChoice=null;S.equipSelectedCard=null;S.equipPendingActorId=null;showReaction(true);updateUI()};

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
function botTeam(){let d=S.botDifficulty,heroKey=d==='easy'?['inf','arch','cav'][Math.floor(Math.random()*3)]:(d==='hard'?'arch':['inf','cav','arch'][Math.floor(Math.random()*3)]);let troops=d==='hard'?{inf:2,arch:2,cav:1}:d==='normal'?{inf:2,arch:1,cav:2}:{inf:1,arch:2,cav:2};return{heroDefinitionId:HERO_KEY[heroKey],troops}}
const _beginTeam_v12=beginTeam;beginTeam=function(p){if(isBotSide(p)){S.phase='team';S.selecting=p;show('team');ShellDOM.team.title.textContent='BOT — ĐANG CHỌN ĐỘI HÌNH';ShellDOM.team.subtitle.textContent='AI '+S.botDifficulty.toUpperCase()+' đang xây đội…';setTimeout(()=>{S.teams[p]=botTeam();lg('🤖 Bot đã chọn đội hình.');if(p===S.loser)beginTeam(S.winner);else dealCards()},450);return}_beginTeam_v12(p)};
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
    if(S.pending!==pending||S.matchEnded)return;
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
    hideDefensePopup();setTimeout(()=>{if(S.pending?.d===d.id)resolveCombat()},0);
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
     (p.sourceType==='ATTACK'||p.sourceType==='SKILL'))S.firstPlayerAttackedThisTurn=true;
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
