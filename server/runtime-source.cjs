"use strict";
// Parse trusted repository source; reuse the same rule implementations as offline.
// This adapter deliberately excludes DOM rendering and Bot orchestration.
const fs = require("node:fs"),
  path = require("node:path"),
  acorn = require("acorn"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
function parsed(file) {
  const source = read(file);
  return { source, nodes: acorn.parse(source, { ecmaVersion: "latest" }).body };
}
function functions(file, names) {
  const { source, nodes } = parsed(file);
  return names
    .map((name) => {
      const n = nodes.find(
        (n) => n.type === "FunctionDeclaration" && n.id.name === name,
      );
      if (!n) throw Error("Missing shared rule " + name);
      return source.slice(n.start, n.end);
    })
    .join("\n");
}
function constants(file, names) {
  const { source, nodes } = parsed(file);
  return names
    .map((name) => {
      const n = nodes.find(
        (n) =>
          n.type === "VariableDeclaration" &&
          n.declarations.some((d) => d.id.name === name),
      );
      if (!n) throw Error("Missing constant " + name);
      return source.slice(n.start, n.end);
    })
    .join("\n");
}
function assignment(file, name) {
  const { source, nodes } = parsed(file);
  const n = nodes.find(
    (n) =>
      n.type === "ExpressionStatement" &&
      n.expression.type === "AssignmentExpression" &&
      n.expression.left.name === name,
  );
  if (!n) throw Error("Missing shared assignment " + name);
  return source.slice(n.start, n.end);
}
function objectWithout(file, name, removed) {
  const { source, nodes } = parsed(file);
  const d = nodes
    .flatMap((n) => n.declarations || [])
    .find((d) => d.id.name === name);
  if (d?.init.type !== "ObjectExpression")
    throw Error("Missing object " + name);
  return (
    "const " +
    name +
    "={" +
    d.init.properties
      .filter((p) => !removed.includes(p.key.name))
      .map((p) => source.slice(p.start, p.end))
      .join(",\n") +
    "};"
  );
}
function section(source, start, end) {
  const a = source.indexOf(start),
    b = end ? source.indexOf(end) : source.length;
  if (a < 0 || b <= a) throw Error("Shared rule boundary moved: " + start);
  return source.slice(a, b);
}
function rules() {
  const core = "src/core/core-runtime-a.js",
    hero = "src/core/hero-roster-runtime.js",
    equip = "src/core/equipment-runtime.js";
  const h = read(hero),
    e = read(equip);
  return [
    constants("src/legacy/legacy-prelude-a-tail.js", [
      "CORE_STAR_SOURCE",
      "CORE_INTERACTION_POWER",
      "CorePowerResolver",
      "CORE_DEFENSE_RESPONSE_POLICY",
      "CORE_EQUIP_COUNTER",
    ]),
    read("src/content/content-prelude-runtime.js"),
    read("src/presentation/asset-definitions-runtime.js"),
    read("locales/vi-VN-runtime.js"),
    read("src/content/content-runtime.js"),
    read("src/mode/mode-registry-runtime.js"),
    read("src/mode/mode-definitions-runtime.js"),
    functions("src/legacy/legacy-prelude-c.js", [
      "skillUsageKey",
      "duelUsage",
      "isSkillUsed",
      "markSkillUsed",
      "resetSkillUsageForModeBoundary",
    ]),
    functions(core, [
      "unitAt",
      "cellNeighbors",
      "movementBudgetTotal",
      "movementCostSpent",
      "remainingMove",
      "canMoveFurther",
      "reachableCellCosts",
      "movementCostToCell",
      "resetTurnFlags",
      "endTurn",
      "unitSpec",
      "axial",
      "distU",
      "aligned",
      "canAttack",
      "markDuelCardUsed",
      "validCardFor",
      "pendingAttackPower",
      "defenseEquipmentWins",
      "resolveCombat",
      "doPierce",
      "guardCandidates",
      "findCellAxialStep",
      "heroDefinition",
      "heroSkill",
      "heroDefenseReactionSkills",
      "rayFrom",
      "onRay",
    ]),
    assignment("src/core/core-runtime-b.js", "startAttack"),
    // All Hero mechanics and their non-Bot runtime extensions, unchanged.
    section(h, "/* Confirmed Hero mechanics.", "const _heroPlanBot="),
    objectWithout(equip, "EquipmentCore", [
      "guardReaction",
      "renderDockHand",
      "render",
      "bar",
    ]),
    section(e, "const _equipmentSpec=", "const _equipmentUpdate="),
    section(e, "const _equipmentResolve="),
    read("src/core/multi-equipment-runtime.js"),
  ].join("\n;\n");
}
const source = rules();
module.exports = {
  source,
  root,
  hash: crypto.createHash("sha256").update(source).digest("hex"),
};
