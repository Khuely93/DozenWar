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
