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
