// Trusted command boundary around the shared offline rule functions.
function need(ok, code = "ILLEGAL_ACTION") {
  if (!ok) throw Error(code);
}
function own(side, id) {
  const h = S.units.find((u) => u.id === id);
  need(h && h.side === side, "NOT_YOUR_UNIT");
  return h;
}
function cardOwned(side, uid) {
  const c = S.hands[side].find((c) => c.uid === uid);
  need(c, "CARD_NOT_OWNED");
  return c;
}
function atCell(c) {
  need(c && Number.isInteger(c.q) && Number.isInteger(c.r), "INVALID_CELL");
  const out = cells.find((x) => x.q === c.q && x.r === c.r);
  need(out, "INVALID_CELL");
  return out;
}
function targets(ids = []) {
  need(
    Array.isArray(ids) && ids.length <= 12 && new Set(ids).size === ids.length,
    "INVALID_TARGETS",
  );
  return ids.map((id) => {
    const u = S.units.find((u) => u.id === id);
    need(u, "INVALID_TARGET");
    return u;
  });
}
function unlocked() {
  need(
    !S.equipmentReaction && !S.postHitReaction && !S.onlineSteal,
    "REACTION_PENDING",
  );
}
function active(side) {
  need(S.phase === "battle" && !S.matchEnded, "NOT_IN_BATTLE");
  unlocked();
  need(
    side === S.battleSide && !S.pending && !HeroCore.selection,
    "WAIT_FOR_YOUR_TURN",
  );
}
function normalizeSelection(s, p) {
  const ts = targets(p.targetIds);
  s.selected = ts.map((t) => t.id);
  if (p.cell) s.cell = atCell(p.cell);
  if (p.kind) {
    need(
      HeroCore.troopDefs().some((d) => d.id === p.kind),
      "INVALID_UNIT_KIND",
    );
    s.kind = p.kind;
  }
  if (p.copyId) s.copyId = p.copyId;
  if (p.dice) {
    need(
      Array.isArray(p.dice) &&
        p.dice.length === 2 &&
        p.dice.every((n) => Number.isInteger(n) && n >= 1 && n <= 6) &&
        p.dice[0] !== p.dice[1],
      "INVALID_DICE",
    );
    s.dice = p.dice;
  }
  return s;
}
function finishSelection(p) {
  let s = HeroCore.selection;
  need(s, "NO_SELECTION");
  normalizeSelection(s, p);
  const sk = s.sk,
    pending = S.pending;
  need(HeroCore.commit(), "INVALID_SELECTION");
  // Copy chooses an eligible skill first, then supplies that skill's targets.
  if (sk.mechanic === "COPY" && HeroCore.selection?.sk.mechanic !== "COPY") {
    need(HeroCore.selection && HeroCore.selection.sk.copied, "INVALID_COPY");
    normalizeSelection(HeroCore.selection, p);
    need(HeroCore.commit(), "INVALID_COPY_TARGETS");
  }
  if (
    pending &&
    S.pending === pending &&
    !S.equipmentReaction &&
    !S.postHitReaction &&
    !HeroCore.selection &&
    !sk.independentDefense &&
    s.h.side !== S.battleSide &&
    !["SWAP", "MORPH", "CONVERT", "DICE_WARD", "REDIRECT"].includes(sk.mechanic)
  )
    resolveCombat();
  checkWin();
}
function resetGame() {
  resetMatchState();
  Object.assign(S, {
    phase: "ready",
    ready: [false, false],
    dice: [null, null],
    winner: null,
    loser: null,
    selecting: null,
    teams: { 1: null, 2: null },
    hands: { 1: [], 2: [] },
    deployIndex: 0,
    deployOrder: [],
    units: [],
    turn: 1,
    round: 1,
    battleSide: null,
    skillUsed: {},
    cardUsed: { 1: false, 2: false },
    duelUsage: null,
    history: [],
    pending: null,
    matchEnded: false,
    result: null,
    onlineSteal: null,
    firstPlayerNoAttackTurns: 0,
    firstPlayerAttackedThisTurn: false,
    rematch: [],
    events: [],
  });
  S.matchNo = (S.matchNo || 0) + 1;
  S.setupAt = Date.now();
  S.clock = { turnMs: 180000, lastAt: Date.now(), window: null, paused: {} };
  duelUsage();
}
function startTeams() {
  do {
    S.dice = [HeroCore.roll(), HeroCore.roll()];
  } while (S.dice[0] === S.dice[1]);
  S.winner = S.dice[0] > S.dice[1] ? 1 : 2;
  S.loser = 3 - S.winner;
  S.selecting = S.loser;
  for (const side of [1, 2])
    S.hands[side] = DeckRuntimeBuilder.dealStartingHand(
      "DECK_DUEL_STANDARD_001",
      side,
      5,
    );
  S.phase = "team";
  S.setupAt = Date.now();
}
function pendingWindow() {
  if (S.phase === "ended") return null;
  if (S.phase === "ready")
    return { key: "ready:" + S.matchNo, kind: "setup", side: null, ms: 300000 };
  if (S.phase === "team" || S.phase === "deploy")
    return {
      key: S.phase + ":" + S.selecting,
      kind: "setup",
      side: S.selecting,
      ms: 300000,
    };
  const r = S.equipmentReaction;
  if (r)
    return {
      key: "counter:" + r.c.uid,
      kind: "counter",
      side: r.side,
      ms: 30000,
    };
  const post = S.postHitReaction;
  if (post)
    return {
      key: "post:" + post.p.onlineId,
      kind: "post",
      side: post.d.side,
      ms: 30000,
    };
  if (S.onlineSteal)
    return {
      key: "steal:" + S.onlineSteal.card.uid,
      kind: "steal",
      side: S.onlineSteal.h.side,
      ms: 30000,
    };
  if (S.pending)
    return {
      key: "defense:" + S.pending.onlineId,
      kind: "defense",
      side: S.units.find(
        (u) => u.id === (S.pending.guard ? S.pending.guardUnitId : S.pending.d),
      ).side,
      ms: 30000,
    };
  return {
    key: "turn:" + S.turn,
    kind: "turn",
    side: S.battleSide,
    ms: 180000,
  };
}
function advanceTime() {
  const c = S.clock,
    delta = Math.max(0, Date.now() - c.lastAt);
  if (c.window) {
    if (c.window.kind === "turn") c.turnMs = Math.max(0, c.turnMs - delta);
    else c.window.remaining = Math.max(0, c.window.remaining - delta);
  }
  c.lastAt = Date.now();
}
function syncWindow() {
  const c = S.clock,
    next = pendingWindow(),
    old = c.window;
  if (old?.key === next?.key) {
    if (old) old.side = next.side;
    return;
  }
  if (old && old.kind !== "turn") c.paused[old.key] = old.remaining;
  c.window = next
    ? { ...next, remaining: c.paused[next.key] ?? next.ms }
    : null;
  if (Object.keys(c.paused).length > 3000) throw Error("MATCH_LIMIT");
}
const _onlineEndTurn = endTurn;
endTurn = function () {
  const side = S.battleSide,
    turn = S.turn,
    result = _onlineEndTurn();
  if (S.turn !== turn) {
    if (side === S.winner)
      S.firstPlayerNoAttackTurns = S.firstPlayerAttackedThisTurn
        ? 0
        : (S.firstPlayerNoAttackTurns || 0) + 1;
    S.firstPlayerAttackedThisTurn = false;
    S.duelUsage = null;
    duelUsage();
    S.clock.turnMs = 180000;
    if (side === S.winner && S.firstPlayerNoAttackTurns >= 5)
      DW_MODES.onCoreEvent({
        type: "CORE_EVENT_FIRST_PLAYER_INACTIVITY",
        side,
        count: S.firstPlayerNoAttackTurns,
      });
  }
  return result;
};
function timeout() {
  const w = S.clock.window;
  need(w && remainingClock() <= 0, "NOT_EXPIRED");
  if (w.kind === "setup") {
    S.matchEnded = true;
    S.result = {
      ended: true,
      resultType: w.side ? "WIN_LOSE" : "DRAW",
      winnerSide: w.side ? 3 - w.side : null,
      loserSide: w.side,
      reason: "SETUP_TIMEOUT",
    };
    S.phase = "ended";
    return;
  }
  if (w.kind === "counter") return EquipmentCore.passEquipment();
  if (w.kind === "post") return EquipmentCore.finishPostHit();
  if (w.kind === "steal") {
    S.onlineSteal = null;
    return;
  }
  if (w.kind === "defense") {
    HeroCore.selection = null;
    return resolveCombat();
  }
  if (HeroCore.selection?.equipmentRecovery) EquipmentCore.skipRecovery();
  HeroCore.selection = null;
  S.heroSequence = null;
  S.skillSequence = null;
  S.skillTarget = null;
  S.guardTargeting = false;
  return endTurn();
}
function remainingClock() {
  const c = S.clock,
    w = c?.window;
  if (!w) return null;
  return Math.max(
    0,
    (w.kind === "turn" ? c.turnMs : w.remaining) -
      Math.max(0, Date.now() - c.lastAt),
  );
}
function command(side, p) {
  advanceTime();
  need([1, 2].includes(side) || p.type === "TIMEOUT", "INVALID_SIDE");
  if (p.type === "TIMEOUT") {
    timeout();
    syncWindow();
    return;
  }
  if (p.type === "SURRENDER") {
    need(S.phase !== "ended", "MATCH_ENDED");
    S.result = {
      ended: true,
      resultType: "WIN_LOSE",
      winnerSide: 3 - side,
      loserSide: side,
      reason: "SURRENDER",
    };
    S.matchEnded = true;
    S.phase = "ended";
    syncWindow();
    return;
  }
  if (p.type === "REMATCH") {
    need(S.phase === "ended", "MATCH_NOT_ENDED");
    if (!S.rematch.includes(side)) S.rematch.push(side);
    if (S.rematch.length === 2) resetGame();
    syncWindow();
    return;
  }
  need(S.phase !== "ended", "MATCH_ENDED");
  if (p.type === "READY") {
    need(S.phase === "ready", "WRONG_PHASE");
    S.ready[side - 1] = true;
    if (S.ready.every(Boolean)) startTeams();
    syncWindow();
    return;
  }
  if (p.type === "TEAM") {
    need(S.phase === "team" && S.selecting === side, "WRONG_PHASE");
    need(HeroRegistry.has(p.heroId), "INVALID_HERO");
    const t = p.troops;
    need(
      t &&
        Object.keys(t).length === 3 &&
        ["inf", "arch", "cav"].every(
          (k) => Number.isInteger(t[k]) && t[k] >= 0 && t[k] <= 5,
        ) &&
        Object.values(t).reduce((a, b) => a + b, 0) === 5,
      "INVALID_TEAM",
    );
    S.teams[side] = { heroDefinitionId: p.heroId, troops: { ...t } };
    if (side === S.loser) S.selecting = S.winner;
    else {
      S.phase = "deploy";
      S.deployOrder = [S.loser, S.winner];
      S.selecting = S.loser;
    }
    syncWindow();
    return;
  }
  if (p.type === "DEPLOY") {
    need(S.phase === "deploy" && S.selecting === side, "WRONG_PHASE");
    need(Array.isArray(p.units) && p.units.length === 6, "INVALID_DEPLOYMENT");
    const expected = [
      S.teams[side].heroDefinitionId,
      ...Object.entries(S.teams[side].troops).flatMap(([k, n]) =>
        Array(n).fill(TROOPS[k].canonicalId),
      ),
    ].sort();
    need(
      JSON.stringify(p.units.map((u) => u.definitionId).sort()) ===
        JSON.stringify(expected),
      "INVALID_DEPLOYMENT",
    );
    const used = new Set();
    for (const u of p.units) {
      const c = atCell(u),
        key = c.q + "," + c.r;
      need(
        c.zone === side && !used.has(key) && !unitAt(c.q, c.r),
        "INVALID_DEPLOYMENT",
      );
      used.add(key);
      S.units.push(
        createRuntimeEntityInstance({
          definitionId: u.definitionId,
          side,
          hero: HeroRegistry.has(u.definitionId),
          q: c.q,
          r: c.r,
        }),
      );
    }
    if (side === S.loser) S.selecting = S.winner;
    else {
      S.phase = "battle";
      S.battleSide = S.winner;
      S.selecting = null;
      resetTurnFlags();
      S.clock.turnMs = 180000;
    }
    syncWindow();
    return;
  }
  need(S.phase === "battle", "WRONG_PHASE");
  if (p.type === "COUNTER_CARD") {
    need(S.equipmentReaction?.side === side, "NO_COUNTER_WINDOW");
    const r = EquipmentCore.responders(side, S.equipmentReaction.c).find(
      (x) => x.card.uid === p.cardUid,
    );
    need(r, "INVALID_COUNTER");
    need(EquipmentCore.counterEquipment(r.h, r.card));
    syncWindow();
    return;
  }
  if (p.type === "PASS_COUNTER") {
    need(S.equipmentReaction?.side === side, "NO_COUNTER_WINDOW");
    need(EquipmentCore.passEquipment());
    syncWindow();
    return;
  }
  if (p.type === "POST_HIT") {
    need(S.postHitReaction?.d.side === side, "NO_POST_HIT_WINDOW");
    need(
      EquipmentCore.finishPostHit(
        p.cardUid ? cardOwned(side, p.cardUid) : null,
      ),
    );
    syncWindow();
    return;
  }
  unlocked();
  if (p.type === "STEAL_CHOOSE") throw Error("NO_STEAL_WINDOW");
  if (p.type === "SKIP_CONTINUE") {
    need(
      HeroCore.selection?.h.side === side &&
        HeroCore.selection.equipmentRecovery,
      "NOT_YOUR_SELECTION",
    );
    need(EquipmentCore.skipRecovery());
    syncWindow();
    return;
  }
  if (p.type === "CONTINUE") {
    need(HeroCore.selection?.h.side === side, "NOT_YOUR_SELECTION");
    finishSelection(p);
    syncWindow();
    return;
  }
  need(!HeroCore.selection, "SELECTION_PENDING");
  if (p.type === "MOVE") {
    active(side);
    const h = own(side, p.actorId),
      c = atCell(p.cell),
      cost = movementCostToCell(h, c);
    need(canMoveFurther(h) && cost != null, "INVALID_MOVE");
    h.q = c.q;
    h.r = c.r;
    h.movementCostSpent = movementCostSpent(h) + cost;
    h.moved = true;
  } else if (p.type === "END_TURN") {
    active(side);
    need(endTurn(), "TURN_LOCKED");
  } else if (p.type === "ATTACK") {
    active(side);
    const h = own(side, p.actorId),
      ts = targets(p.targetIds);
    need(h.hp > 0 && !h.attacked && ts.length > 0, "INVALID_ATTACK");
    S.selected = h;
    S.attackChoice = {
      type: p.cardUid ? "card" : "normal",
      card: p.cardUid ? cardOwned(side, p.cardUid) : null,
    };
    need(
      !S.attackChoice.card || !EquipmentCore.standalone(S.attackChoice.card),
      "USE_CARD_ACTION",
    );
    need(
      ts.every((d) => d.side !== side && d.hp > 0 && canAttack(h, d)),
      "INVALID_TARGET",
    );
    need(startAttack(h, ts[0]) !== false, "INVALID_ATTACK");
    if (HeroCore.selection) finishSelection(p);
    else need(ts.length === 1, "TOO_MANY_TARGETS");
  } else if (p.type === "SKILL") {
    const h = own(side, p.actorId);
    need(
      h.hero && Number.isInteger(p.skillNo) && p.skillNo >= 1 && p.skillNo <= 3,
      "INVALID_SKILL",
    );
    S.selected = h;
    need(HeroCore.begin(h, p.skillNo), "SKILL_UNAVAILABLE");
    if (p.cardUid) HeroCore.selection.cardUid = cardOwned(side, p.cardUid).uid;
    finishSelection(p);
  } else if (p.type === "CARD") {
    const h = own(side, p.actorId),
      c = cardOwned(side, p.cardUid);
    need(EquipmentCore.canUse(h, c), "CARD_UNAVAILABLE");
    if (effectOf(c, "EFFECT_STEAL_EQUIPMENT")) {
      need(
        EquipmentCore.play(h, c, EquipmentCore.context(h), (accepted) => {
          if (accepted) S.onlineSteal = { h, card: c };
        }),
      );
    } else {
      need(
        EquipmentCore.standalone(c) ||
          effectOf(c, "EFFECT_EQUIPMENT_ROOT_2") ||
          h.side !== S.battleSide,
        "ATTACH_CARD_TO_ATTACK",
      );
      need(
        h.side === S.battleSide
          ? EquipmentCore.begin(h, c)
          : EquipmentCore.useDefense(h, c),
        "INVALID_CARD",
      );
      if (HeroCore.selection) finishSelection(p);
    }
  } else if (p.type === "DEFEND") {
    need(
      S.pending && S.units.find((u) => u.id === S.pending.d)?.side === side,
      "NO_DEFENSE_WINDOW",
    );
    if (p.guardId) {
      const g = own(side, p.guardId),
        d = S.units.find((u) => u.id === S.pending.d);
      need(
        !S.pending.ignoreGuard &&
          !S.pending.guard &&
          !S.pending.defenseSkillUsed &&
          guardCandidates(d).some((u) => u.id === g.id),
        "INVALID_GUARD",
      );
      S.pending.guard = true;
      S.pending.guardUnitId = g.id;
    }
    if (p.cardUid) {
      const receiver = S.units.find(
        (u) => u.id === (S.pending.guard ? S.pending.guardUnitId : S.pending.d),
      );
      need(
        EquipmentCore.useDefense(receiver, cardOwned(side, p.cardUid)),
        "INVALID_DEFENSE",
      );
      if (HeroCore.selection) finishSelection(p);
    } else if (!p.guardId || p.resolve === true) resolveCombat();
  } else throw Error("UNKNOWN_COMMAND");
  checkWin();
  syncWindow();
}
// Steal reveals the opponent's hand only after payment and its counter window.
const _onlineCommand = command;
command = function (side, p) {
  if (p.type !== "STEAL_CHOOSE") return _onlineCommand(side, p);
  advanceTime();
  const r = S.onlineSteal;
  need(r?.h.side === side && !S.equipmentReaction, "NO_STEAL_WINDOW");
  const c = cardOwned(3 - side, p.cardUid);
  S.onlineSteal = null;
  HeroCore.applySelection(
    {
      h: r.h,
      n: 0,
      sk: {
        id: r.card.id,
        star: r.card.star,
        equipmentAction: true,
        mechanic: "STEAL",
        parameters: {},
      },
      stealUid: c.uid,
    },
    [],
    r.card,
  );
  syncWindow();
};
function preview(h, sk, card = null, depth = 0) {
  const previous = HeroCore.selection;
  HeroCore.selection = { h, sk, equipmentBundle: card };
  try {
    return {
      skill: sk,
      targetIds: HeroCore.targets(h, sk).map((u) => u.id),
      maxTargets: HeroCore.targetLimit(h, sk, card),
      cells:
        sk.mechanic === "ESCAPE"
          ? HeroCore.escapeCells(h, sk).map(({ q, r }) => ({ q, r }))
          : sk.mechanic === "SUMMON"
            ? cells
                .filter(
                  (c) =>
                    distU(h, c) === 1 &&
                    HeroCore.cellAllowed(
                      { side: h.side, hero: false, id: null },
                      c,
                    ),
                )
                .map(({ q, r }) => ({ q, r }))
            : [],
      kinds: HeroCore.troopDefs().map((d) => ({
        id: d.id,
        name: ContentViews.unit(d.id).name,
      })),
      copies:
        sk.mechanic === "COPY" && depth < 1
          ? HeroCore.copyChoices(h).map((copy) =>
              preview(
                h,
                { ...copy, star: Math.min(copy.star, 3), copied: true },
                card,
                depth + 1,
              ),
            )
          : [],
    };
  } finally {
    HeroCore.selection = previous;
  }
}
function cardPreview(h, c) {
  // Build the same synthetic selection as offline, restoring all selection state.
  const old = HeroCore.selection,
    selected = S.selected,
    mode = S.mode,
    choice = S.attackChoice;
  try {
    HeroCore.selection = null;
    const ok = effectOf(c, "EFFECT_EQUIPMENT_ROOT_2")
      ? EquipmentCore.beginNet(h, c)
      : effectOf(c, "EFFECT_REDIRECT_ALLY")
        ? EquipmentCore.useDefense(h, c)
        : EquipmentCore.standalone(c)
          ? EquipmentCore.begin(h, c)
          : false;
    return ok && HeroCore.selection
      ? preview(h, HeroCore.selection.sk, c)
      : null;
  } finally {
    HeroCore.selection = old;
    S.selected = selected;
    S.mode = mode;
    S.attackChoice = choice;
  }
}
function actionOptions(side) {
  if (S.phase !== "battle" || S.matchEnded) return {};
  if (S.equipmentReaction)
    return {
      counter:
        S.equipmentReaction.side === side
          ? EquipmentCore.responders(side, S.equipmentReaction.c).map((x) => ({
              actorId: x.h.id,
              cardUid: x.card.uid,
            }))
          : null,
    };
  if (S.postHitReaction)
    return {
      post:
        S.postHitReaction.d.side === side
          ? EquipmentCore.postHitChoices(
              S.postHitReaction.p,
              S.postHitReaction.d,
            ).map((c) => c.uid)
          : null,
    };
  if (S.onlineSteal)
    return S.onlineSteal.h.side === side ? { steal: S.hands[3 - side] } : {};
  if (HeroCore.selection)
    return HeroCore.selection.h.side === side
      ? {
          continuation: preview(
            HeroCore.selection.h,
            HeroCore.selection.sk,
            HeroCore.selectedCard(),
          ),
          actorId: HeroCore.selection.h.id,
          recovery: !!HeroCore.selection.equipmentRecovery,
        }
      : {};
  const actors = S.units
    .filter((u) => u.side === side && u.hp > 0)
    .map((h) => {
      const quiet = side === S.battleSide && !S.pending;
      const skills = h.hero
        ? [1, 2, 3]
            .filter((n) => HeroCore.canUse(h, n))
            .map((n) => {
              const sk = heroSkill(h, n);
              return {
                n,
                ...preview(h, sk),
                attachments: S.hands[side]
                  .filter(
                    (c) =>
                      validCardFor(
                        c,
                        h,
                        side === S.battleSide ? "atk" : "def",
                      ) &&
                      ((sk.heroAttack && !EquipmentCore.standalone(c)) ||
                        (side !== S.battleSide &&
                          sk.mechanic === "HEAL" &&
                          effectOf(c, "EFFECT_HEAL_1"))),
                  )
                  .map((c) => ({ cardUid: c.uid, ...preview(h, sk, c) })),
              };
            })
        : [];
      const cards = S.hands[side]
        .filter((c) => EquipmentCore.canUse(h, c))
        .map((c) => ({
          uid: c.uid,
          standalone:
            EquipmentCore.standalone(c) ||
            c.type === "def" ||
            effectOf(c, "EFFECT_EQUIPMENT_ROOT_2"),
          preview:
            EquipmentCore.standalone(c) ||
            c.type === "def" ||
            effectOf(c, "EFFECT_EQUIPMENT_ROOT_2")
              ? cardPreview(h, c)
              : null,
        }));
      const previous = S.selected,
        choice = S.attackChoice;
      const attacks = [];
      if (quiet && !h.attacked && !HeroCore.blocked(h, "attack"))
        for (const c of [
          null,
          ...S.hands[side].filter(
            (c) => validCardFor(c, h, "atk") && !EquipmentCore.standalone(c),
          ),
        ]) {
          S.selected = h;
          S.attackChoice = { card: c };
          attacks.push({
            cardUid: c?.uid || null,
            targetIds: S.units
              .filter((u) => u.side !== side && u.hp > 0 && canAttack(h, u))
              .map((u) => u.id),
            maxTargets:
              1 +
              (h.targetBuff || 0) +
              HeroCore.cardBonus(c, "MODIFY_TARGET_COUNT"),
          });
        }
      S.selected = previous;
      S.attackChoice = choice;
      return {
        id: h.id,
        attacks,
        moves:
          quiet && canMoveFurther(h)
            ? Array.from(reachableCellCosts(h)).map(([key]) => {
                const [q, r] = key.split(",").map(Number);
                return { q, r };
              })
            : [],
        attackTargets:
          quiet && !h.attacked
            ? S.units
                .filter((u) => u.side !== side && u.hp > 0 && canAttack(h, u))
                .map((u) => u.id)
            : [],
        skills,
        cards,
      };
    });
  return {
    actors,
    guards:
      S.pending &&
      S.units.find((u) => u.id === S.pending.d)?.side === side &&
      !S.pending.ignoreGuard &&
      !S.pending.guard &&
      !S.pending.defenseSkillUsed
        ? guardCandidates(S.units.find((u) => u.id === S.pending.d)).map(
            (u) => u.id,
          )
        : [],
    canEndTurn: side === S.battleSide && !S.pending,
  };
}
function view(side) {
  const safeCard = (c) =>
    c
      ? {
          uid: c.uid,
          id: c.equipmentId || c.canonicalId || c.id,
          name: c.name,
          star: c.star,
          cls: c.cls,
          type: c.type,
          text: c.text,
          assets: c.assets,
        }
      : null;
  const selection = HeroCore.selection;
  return {
    phase: S.phase,
    matchNo: S.matchNo,
    ready: S.ready,
    dice: S.dice,
    firstSide: S.winner,
    selecting: S.selecting,
    teams: S.teams,
    turn: S.turn,
    battleSide: S.battleSide,
    result: S.result,
    rematch: S.rematch,
    events: S.events,
    units: S.units.map((u) => ({
      id: u.id,
      definitionId: u.definitionId,
      side: u.side,
      hero: u.hero,
      q: u.q,
      r: u.r,
      hp: u.hp,
      moved: u.moved,
      attacked: u.attacked,
      statuses: HeroCore.statuses(u),
      spec: unitSpec(u),
    })),
    hand: S.hands[side].map(safeCard),
    opponentHandCount: S.hands[3 - side].length,
    pending: S.pending
      ? {
          id: S.pending.onlineId,
          a: S.pending.a,
          d: S.pending.guard ? S.pending.guardUnitId : S.pending.d,
          originalTarget: S.pending.d,
          base: S.pending.base,
          power: pendingAttackPower(),
          skill: S.pending.heroMechanic?.name,
          atkCard: safeCard(S.pending.atkCard),
          guard: !!S.pending.guard,
        }
      : null,
    reaction: S.equipmentReaction
      ? {
          side: S.equipmentReaction.side,
          card: safeCard(S.equipmentReaction.c),
        }
      : null,
    options: actionOptions(side),
    notice: selection?.h.side === side ? HeroCore.notice : "",
    clock: S.clock.window
      ? {
          kind: S.clock.window.kind,
          side: S.clock.window.side,
          remainingMs: remainingClock(),
        }
      : null,
  };
}
function catalog() {
  return {
    protocol: 1,
    modeId: "MODE_DUEL_001",
    gameplayHash:
      ContentManifestBuilder.buildGameplay("MODE_DUEL_001").gameplayHash,
    cells,
    heroes: HeroRegistry.list().map((d) => {
      const h = ContentViews.hero(d.id);
      return {
        ...h,
        avatar: AssetResolver.source(d.assets.portrait),
        board: AssetResolver.source(d.assets.token),
        skills: d.skillIds.map((id) => ContentViews.skill(id)),
      };
    }),
    troops: Object.entries(TROOPS).map(([kind, t]) => ({ ...t, kind })),
    cards: NEW_EQUIPMENT_CATALOG.cards.map((c) => ({
      ...c,
      src: c.visual.card,
    })),
  };
}
resetGame();
syncWindow();
globalThis.api = {
  command,
  view,
  catalog,
  deadline() {
    const c = S.clock;
    return c.window
      ? c.lastAt + (c.window.kind === "turn" ? c.turnMs : c.window.remaining)
      : null;
  },
};
