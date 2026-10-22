"use strict";
const { Engine } = require("../engine.cjs");
function setup(
  engine = new Engine("a".repeat(64), 1000),
  at = 1000,
  heroes = ["HERO_INF_KAZU", "HERO_INF_RODOC"],
) {
  for (const side of [1, 2]) engine.command(side, { type: "READY" }, ++at);
  for (let i = 0; i < 2; i++) {
    const side = engine.view(1, at).selecting;
    engine.command(
      side,
      {
        type: "TEAM",
        heroId: heroes[side - 1],
        troops: { inf: 3, arch: 1, cav: 1 },
      },
      ++at,
    );
  }
  for (let i = 0; i < 2; i++) {
    const v = engine.view(1, at),
      side = v.selecting,
      cells = engine.catalog().cells.filter((c) => c.zone === side);
    const ids = [
      heroes[side - 1],
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_INF_001",
      "UNIT_ARCH_001",
      "UNIT_CAV_001",
    ];
    engine.command(
      side,
      {
        type: "DEPLOY",
        units: ids.map((definitionId, i) => ({
          definitionId,
          q: cells[i].q,
          r: cells[i].r,
        })),
      },
      ++at,
    );
  }
  return { engine, at };
}
function fixture(expression, at = 1000) {
  const e = new Engine("a".repeat(64), at);
  e.invoke("(function(){" + expression + ";syncWindow();return true})()", at);
  return e;
}
module.exports = { setup, fixture };
