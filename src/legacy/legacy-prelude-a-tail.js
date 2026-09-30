



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
