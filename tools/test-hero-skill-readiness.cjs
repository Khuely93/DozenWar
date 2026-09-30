const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=r=>fs.readFileSync(path.join(root,r),'utf8');
const files={
 content:read('src/content/content-runtime.js'),
 coreA:read('src/core/core-runtime-a.js'),
 coreB:read('src/core/core-runtime-b.js'),
 shellFlow:read('src/shell/shell-flow-runtime.js'),
 shellSession:read('src/shell/shell-session-runtime.js'),
 presentation:read('src/presentation/board-renderer-runtime.js'),
 ai:read('src/legacy/legacy-ai-runtime.js'),
 preludeC:read('src/legacy/legacy-prelude-c.js')
};
const failures=[]; const passes=[];
const check=(ok,label)=>(ok?passes:failures).push(label);
const playable=files.coreA+files.coreB+files.shellFlow+files.shellSession+files.presentation+files.ai+files.preludeC;
check(!/HEROES\s*\[/.test(playable),'playable runtime has zero HEROES[kind] consumers');
check(/heroDefinitionId/.test(files.shellFlow)&&/HeroRegistry\.list\(\)/.test(files.shellFlow),'team picker stores definitionId and enumerates HeroRegistry');
check(/heroDefinitionId/.test(files.shellSession),'bot team/deploy uses heroDefinitionId');
check(/definitionId,contentVersion:def\.version,side,hero,classId/.test(files.content),'runtime entity stores definitionId + classId');
check(/function unitSpec\(u\).*ContentViews\.hero\(u\.definitionId\)/s.test(files.coreA),'Core Hero spec resolves by definitionId');
check(/function heroSkill\(h,n\).*heroDefinition\(h\).*skillIds/s.test(files.coreA),'Hero Skill lookup resolves via Hero definition');
check(/requireMissingHp:true/.test(files.content),'heal missing-HP rule is Skill target metadata');
check((files.content.match(/selection:\{lineLock:true\}/g)||[]).length===3,'three same-ray Skills carry lineLock metadata');
check(/skillNeedsLineLock\(skill\)\{return !!skill\?\.target\?\.selection\?\.lineLock\}/.test(files.coreA),'line lock is metadata-driven');
check(/t\.requireMissingHp&&u\.hp>=unitSpec\(u\)\.hp/.test(files.coreA),'heal candidate rule is metadata-driven');
check(/effect\?\.type==='MODIFY_DAMAGE'&&effect\.operation==='ADD'/.test(files.coreA),'damage buff application is effect-driven');
check(/timing==='DEFENSE_REACTION'/.test(files.coreA),'defense reaction discovery is timing-driven');
check(!/skill\.id\s*===\s*['"]SKILL_HERO_/.test(files.coreA),'Core has zero explicit current Skill-ID branches');
check(!/kind==='arch'.*isSkillUsed/s.test(files.ai),'Bot defense no longer identifies defense Skill by Archer class hardcode');
check(files.content.includes("SKILL_HERO_INF_001_S1:{id:'SKILL_HERO_INF_001_S1'")&&files.content.includes("range:3,maxTargets:1,requireMissingHp:true},effects:['EFFECT_HEAL_1']"),'INF S1 range/effect unchanged');
check(files.content.includes("SKILL_HERO_INF_001_S3:{id:'SKILL_HERO_INF_001_S3'")&&files.content.includes("range:4,maxTargets:4,selection:{lineLock:true}},effects:['EFFECT_DAMAGE_1']"),'INF S3 range/targets/damage unchanged');
check(files.content.includes("SKILL_HERO_ARCH_001_S1:{id:'SKILL_HERO_ARCH_001_S1'")&&files.content.includes("star:1,timing:'DEFENSE_REACTION'")&&files.content.includes("effects:['EFFECT_EVADE_ATTACK']"),'ARCH S1 Star/timing/effect unchanged');
check(files.content.includes("SKILL_HERO_ARCH_001_S3:{id:'SKILL_HERO_ARCH_001_S3'")&&files.content.includes("pattern:'LINE',range:3,maxTargets:2},effects:['EFFECT_DAMAGE_2']"),'ARCH S3 range/targets/damage unchanged');
check(files.content.includes("SKILL_HERO_CAV_001_S3:{id:'SKILL_HERO_CAV_001_S3'")&&files.content.includes("range:1,maxTargets:1},effects:['EFFECT_DAMAGE_2','EFFECT_IGNORE_INF_GUARD']"),'CAV S3 damage/Guard bypass unchanged');
for(const id of ['HERO_INF_001','HERO_ARCH_001','HERO_CAV_001'])check(!files.content.includes('  '+id+':{'),id+' removed from playable Hero content');
for(const p of passes)console.log('PASS | '+p);
for(const f of failures)console.error('FAIL | '+f);
console.log(`Checks: ${passes.length}/${passes.length+failures.length} PASS`);
if(failures.length)process.exit(1);
