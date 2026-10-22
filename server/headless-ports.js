// Server-only output ports. No DOM, browser, timers or network are available here.
const S = {
  phase: "ready",
  selectedMode: "MODE_DUEL_001",
  units: [],
  teams: { 1: null, 2: null },
  hands: { 1: [], 2: [] },
  skillUsed: {},
  turn: 1,
  round: 1,
  cardUsed: { 1: false, 2: false },
  history: [],
  botSide: null,
  battleSide: null,
  matchEnded: false,
  windowSerial: 0,
};
const dirs = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, -1],
];
const cells = [];
for (let r = -4; r <= 4; r++)
  for (let q = Math.max(-4, -r - 4); q <= Math.min(4, -r + 4); q++)
    cells.push({ q, r, zone: r < 0 ? 2 : r > 0 ? 1 : 0 });
const noop = () => {};
const hideUnitMenu = noop,
  hideAttackPopup = noop,
  hideDefensePopup = noop,
  showDefensePopup = noop,
  showAttackPopup = noop,
  renderBoard = noop,
  save = noop,
  clearDefenseSkillTarget = noop;
const reactionBox = { style: {} },
  skillTargetPanel = { classList: { remove: noop } };
const CombatFlowUI = { close: noop, open: noop };
let updateUI = noop,
  selectUnit = noop,
  _beginSkillTargetInternal = noop,
  resolveNextSkillSequenceTarget = noop,
  defenseSkillChoices = () => [],
  useDefenseSkill = noop,
  resetMatchState = noop;
const lg = (message) => {
  (S.events ??= []).push({ turn: S.turn, message });
  if (S.events.length > 40) S.events.shift();
};
const DW_SHELL = {
  onMatchEnd(result) {
    if (!S.matchEnded) {
      S.matchEnded = true;
      S.result = { ...result };
      S.phase = "ended";
    }
  },
};
function checkWin() {
  if (S.postHitReaction || S.equipmentReaction) return null;
  return DW_MODES.onCoreEvent({
    type: "CORE_EVENT_HERO_STATE_SNAPSHOT",
    heroes: S.units
      .filter((u) => u.hero)
      .map((u) => ({ side: u.side, hp: u.hp })),
  });
}
function showReaction(defense) {
  if (!S.pending || !defense) return;
  S.pending.onlineId ??= ++S.windowSerial;
  if (
    S.units.find((u) => u.id === S.pending.a)?.side === S.winner &&
    (S.pending.sourceType === "ATTACK" || S.pending.heroMechanic?.heroAttack)
  )
    S.firstPlayerAttackedThisTurn = true;
}
