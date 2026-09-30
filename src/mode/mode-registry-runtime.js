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
