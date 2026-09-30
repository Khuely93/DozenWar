// ===== DOZEN WAR II DATA & ASSET CONVENTION v1.0 =====
// Canonical IDs are permanent. Display names / artwork may change without changing gameplay references.
const CLASS={INF:'INF',ARCH:'ARCH',CAV:'CAV',ALCH:'ALCH',NEU:'NEU'};
const CLASS_RUNTIME={INF:'infantry',ARCH:'archer',CAV:'cavalry',ALCH:'alchemist',NEU:'neutral'};
const CLASS_KIND={INF:'inf',ARCH:'arch',CAV:'cav',ALCH:'alch',NEU:'neu'};

// Hero-only class. HP and skills must be supplied for each individual Hero.
const HERO_CLASS_RULES=Object.freeze({
  ALCH:Object.freeze({name:'Giả Kim Thuật',heroOnly:true,
    defaultStats:Object.freeze({move:1,attackRange:1}),attackPattern:'RANGE',
    passives:Object.freeze([]),equipmentClassIds:Object.freeze(['NEU'])})
});
