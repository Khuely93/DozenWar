

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
  SKILL_HERO_EST_S3:{id:'SKILL_HERO_EST_S3',nameKey:'SKILL_HERO_EST_S3_NAME',descriptionKey:'SKILL_HERO_EST_S3_DESC',class:'INF',star:1,timing:'ACTIVE',target:{side:'ENEMY',range:1,maxTargets:4},maneuver:{moveBonus:2,attackFlow:'SELECT_ADJACENT'},duration:'CURRENT_PLAYER_TURN',effects:['EFFECT_DAMAGE_1','EFFECT_MOVE_PLUS_2']},
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
const HEROES=Object.fromEntries(Object.entries(HERO_KEY).map(([k,id])=>{let h=ContentViews.hero(id);return [k,{canonicalId:id,name:h.name,sym:h.sym,base:CLASS_RUNTIME[h.class],classId:h.class,hp:h.stats.hp,move:h.stats.move,range:h.stats.attackRange,attackPattern:h.attackPattern,passives:h.passives,skillIds:h.skillIds,skills:h.skillIds.map(s=>ContentViews.skill(s).description)}]}));
const TROOPS=Object.fromEntries(Object.entries(UNIT_KEY).map(([k,id])=>{let u=ContentViews.unit(id);return [k,{canonicalId:id,name:u.name,sym:u.sym,base:CLASS_RUNTIME[u.class],classId:u.class,hp:u.stats.hp,move:u.stats.move,range:u.stats.attackRange,passives:u.passives}]}));
const CARDS=EquipmentRegistry.list().map(c=>{const v=ContentViews.equipment(c.id);return {id:v.id,canonicalId:v.id,name:v.name,cls:CLASS_RUNTIME[v.class],classId:v.class,type:v.category==='ATTACK'?'atk':v.category==='DEFENSE'?'def':'neu',star:v.star,timing:v.timing,effects:v.effects,eligibility:v.eligibility,text:v.text}});

window.DOZEN_DATA={CLASS,CLASS_KIND,HERO_CLASS_RULES,ASSETS,EFFECTS,STATUS_DB,SKILLS,HERO_DB,UNIT_DB,EQUIPMENT_DB,CARD_DB,RAW_LOCALES,CONTENT_SCHEMA,CONTENT_SCHEMA_VERSION,CONTENT_TYPES,ContentRegistry,HeroRegistry,UnitRegistry,SkillRegistry,EquipmentRegistry,DeckRegistry,StatusRegistry,EffectRegistry,AssetRegistry,ContentPackRegistry,LocalizationRegistry,AssetResolver,ContentViews,RuntimeInstanceSchema,DeckRuntimeBuilder,ContentManifestBuilder,ContentCompatibilityValidator,MatchContentHandshake,MatchContentSnapshotBuilder,CONTENT_MANIFEST_PROTOCOL_VERSION,CONTENT_COMPATIBILITY_CODES,PERSISTED_DATA_SCHEMA_VERSION,CONTENT_MIGRATION_PROTOCOL_VERSION,PERSISTED_DOCUMENT_KIND,BACKWARD_COMPATIBILITY_POLICY,BACKWARD_COMPATIBILITY_CODES,PersistedSchemaMigrationRegistry,ContentVersionMigrationRegistry,HistoricalContentRegistry,ContentVersionResolver,HistoricalContentAvailability,PersistenceEnvelopeBuilder,BackwardCompatibilityLoader,DECK_DB,CONTENT_PACK_DUEL_001,CONTENT_VALIDATION};
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
