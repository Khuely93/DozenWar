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
