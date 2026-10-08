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
