const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const manifestPath = path.join(ROOT, 'project-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const failures = [];
const passes = [];
function check(ok, label) { (ok ? passes : failures).push(label); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

check(manifest.version === '1.40.19', 'project manifest version = 1.40.19');
check(manifest.phase === 'DUEL_RULE_MODE_1VS1_180_30', 'project manifest phase = DUEL_RULE_MODE_1VS1_180_30');
check(Array.isArray(manifest.runtimeOrder) && manifest.runtimeOrder.length > 0, 'runtimeOrder exists');
for (const rel of manifest.runtimeOrder || []) check(fs.existsSync(path.join(ROOT, rel)), `runtime file exists: ${rel}`);

const jsFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (e.isFile() && p.endsWith('.js')) jsFiles.push(p);
  }
}
walk(path.join(ROOT, 'src'));
walk(path.join(ROOT, 'locales'));
for (const f of jsFiles) {
  const r = cp.spawnSync(process.execPath, ['--check', f], {encoding:'utf8'});
  check(r.status === 0, `node --check ${path.relative(ROOT, f)}`);
}

const html = read('index.html');
const scriptRefs = [...html.matchAll(/<script\s+defer\s+src="\.\/(.*?)"><\/script>/g)].map(m => m[1].split('?')[0]);
check(JSON.stringify(scriptRefs) === JSON.stringify(manifest.runtimeOrder), 'index classic-script order matches runtimeOrder');
check(/LATEST PLAYTEST v1\.40\.19/.test(html), 'v1.40.19 banner present');
check(/HERO \/ SKILL CONTENT READINESS/.test(html), 'Hero / Skill Content Readiness banner present');

const allRuntime = (manifest.runtimeOrder || []).map(read).join('');
const locked = [
  ['CONTENT_SCHEMA', /CONTENT_SCHEMA/],
  ['RULE_DUEL_HERO_DEATH', /RULE_DUEL_HERO_DEATH/],
  ['DRAW result', /DRAW/],
  ['MATCH skill reset', /MATCH/],
  ['ROUND skill reset', /ROUND/],
  ['nullable deck', /declaredSize\s*:\s*null/],
  ['CoreInputRouter', /CoreInputRouter/],
  ['CoreBoardRenderer', /CoreBoardRenderer/],
  ['ContentManifestBuilder', /ContentManifestBuilder/],
  ['BackwardCompatibilityLoader', /BackwardCompatibilityLoader/]
];
for (const [label, re] of locked) check(re.test(allRuntime), `locked invariant token: ${label}`);


check(!fs.existsSync(path.join(ROOT, 'src/mode/mode-legacy-adapters.js')), 'legacy GAME_MODES/RULES adapter removed');
check(!fs.existsSync(path.join(ROOT, 'src/legacy/legacy-core-bridge-runtime.js')), 'legacy core bridge file removed');
check(fs.existsSync(path.join(ROOT, 'src/core/core-foundation-runtime.js')), 'core foundation runtime exists');
check(!/\bGAME_MODES\b/.test(allRuntime), 'GAME_MODES runtime dependency removed');
check(!/window\.DOZEN_CORE_RULES/.test(allRuntime), 'unused DOZEN_CORE_RULES global export removed');

check(!fs.existsSync(path.join(ROOT, 'src/legacy/legacy-prelude-a-head.js')), 'comment-only legacy prelude head removed from runtime');
check(!fs.existsSync(path.join(ROOT, 'src/legacy/legacy-prelude-b.js')), 'legacy DW_SHELL prelude file removed');
check(fs.existsSync(path.join(ROOT, 'src/shell/shell-kernel-runtime.js')), 'DW_SHELL kernel owned by SHELL');
check(/const\s+DW_SHELL\s*=/.test(read('src/shell/shell-kernel-runtime.js')), 'DW_SHELL kernel definition preserved');
check(!manifest.runtimeOrder.some(x => x.includes('legacy-prelude-a-head') || x.includes('legacy-prelude-b')), 'removed legacy prelude entries absent from runtimeOrder');


check(fs.existsSync(path.join(ROOT, 'src/presentation/hero-fallback-runtime.js')), 'hero fallback owned by PRESENTATION');
check(/^const\s+heroImg=/.test(read('src/presentation/hero-fallback-runtime.js')), 'heroImg fallback definition preserved');
check(!/^const\s+heroImg=/m.test(read('src/legacy/legacy-prelude-c.js')), 'heroImg removed from remaining legacy prelude');
check(!fs.existsSync(path.join(ROOT, 'src/legacy/legacy-post-runtime.js')), 'mixed legacy-post runtime removed');
check(fs.existsSync(path.join(ROOT, 'src/debug/playtest-qa-runtime.js')), 'playtest QA owned by DEBUG');
check(/window\.DOZEN_QA/.test(read('src/debug/playtest-qa-runtime.js')), 'DOZEN_QA API preserved');
check(fs.existsSync(path.join(ROOT, 'src/shell/shell-boot-runtime.js')), 'boot/reset wiring owned by SHELL');
check(/ShellFlowController\.openModeSelect\(\)/.test(read('src/shell/shell-boot-runtime.js')), 'Shell boot flow preserved');
check(!manifest.runtimeOrder.some(x => x.includes('legacy-post-runtime')), 'legacy-post absent from runtimeOrder');



// ===== v1.37 HERO / SKILL CONTENT READINESS GATE =====
const readiness = manifest.heroSkillReadiness || {};
check(readiness.status === 'READY_FOR_CONTENT_EXPANSION', 'Hero/Skill readiness status = READY_FOR_CONTENT_EXPANSION');
check(readiness.gameplayRuleChanges === false, 'Hero/Skill readiness changes no locked gameplay rules');
check(readiness.multipleHeroesPerClassPlayable === true, 'multiple Heroes per class runtime path enabled');
check(readiness.heroCompatibilityViewRuntimeConsumers === 0, 'HEROES compatibility view has zero playable runtime consumers');
check(fs.existsSync(path.join(ROOT, 'CONTENT_MODE_BOUNDARY_GATE.md')), 'readiness gate report exists');

const contentRuntime = read('src/content/content-runtime.js');
const modeRegistry = read('src/mode/mode-registry-runtime.js');
const modeDefs = read('src/mode/mode-definitions-runtime.js');
const coreA = read('src/core/core-runtime-a.js');
const coreB = read('src/core/core-runtime-b.js');
const shellFlow = read('src/shell/shell-flow-runtime.js');
const shellSession = read('src/shell/shell-session-runtime.js');
const presentation = read('src/presentation/board-renderer-runtime.js');
const aiRuntime = read('src/legacy/legacy-ai-runtime.js');
const preludeC = read('src/legacy/legacy-prelude-c.js');
const playableHeroRuntime = coreA + coreB + shellFlow + shellSession + presentation + aiRuntime + preludeC;

check(/const\s+HeroRegistry\s*=/.test(contentRuntime), 'HeroRegistry remains Content-owned');
check(/const\s+EquipmentRegistry\s*=/.test(contentRuntime), 'EquipmentRegistry remains Content-owned');
check(/const\s+SkillRegistry\s*=/.test(contentRuntime), 'SkillRegistry remains Content-owned');
check(/registerMode\s*\(/.test(modeRegistry) && /DW_MODES\.registerMode\s*\(/.test(modeDefs), 'Mode definitions remain registry-driven');
check(/registerRule\s*\(/.test(modeRegistry) && /DW_MODES\.registerRule\s*\(/.test(modeDefs), 'Mode Rules remain registry-driven');
check(/declaredSize\s*:\s*null/.test(contentRuntime), 'flexible deck remains unlocked at Content boundary');
check(!/HEROES\s*\[/.test(playableHeroRuntime), 'no playable HEROES[kind] Hero lookup remains');
check(/HeroRegistry\.list\(\)/.test(shellFlow) && /heroDefinitionId/.test(shellFlow), 'Hero picker is registry/definitionId driven');
check(/ContentViews\.hero\(u\.definitionId\)/.test(coreA), 'Core resolves Hero definition by definitionId');
check(/requireMissingHp:true/.test(contentRuntime), 'heal-only-missing-HP encoded in Skill data');
check(/selection:\{lineLock:true\}/.test(contentRuntime), 'same-ray line lock encoded in Skill data');
check(!/skill\.id\s*===\s*['"]SKILL_HERO_/.test(coreA), 'no explicit current Skill-ID branch remains in Core');
check(/effect\?\.type==='MODIFY_DAMAGE'&&effect\.operation==='ADD'/.test(coreA), 'Skill damage buff applies through generic effect metadata');
check(/timing==='DEFENSE_REACTION'/.test(coreA), 'defensive Skill discovery uses timing metadata');
check(/const\s+HEROES\s*=/.test(contentRuntime), 'temporary HEROES compatibility view retained only in Content');

const sha = crypto.createHash('sha256').update(allRuntime).digest('hex');
console.log(`Runtime sequence SHA256: ${sha}`);
for (const p of passes) console.log(`PASS | ${p}`);
for (const f of failures) console.error(`FAIL | ${f}`);
console.log(`Checks: ${passes.length}/${passes.length + failures.length} PASS`);
if (failures.length) process.exit(1);
