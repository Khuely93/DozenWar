
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
