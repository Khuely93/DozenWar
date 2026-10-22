"use strict";
// Reject extra state fields and nested payloads before hashing or entering rules.
const fields = new Set([
  "type",
  "actorId",
  "cardUid",
  "heroId",
  "targetIds",
  "cell",
  "kind",
  "copyId",
  "dice",
  "troops",
  "units",
  "skillNo",
  "guardId",
  "resolve",
]);
function object(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
function check(ok) {
  if (!ok) throw Error("INVALID_COMMAND");
}
function text(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}
function coordinate(c) {
  return (
    object(c) &&
    Object.keys(c).length === 2 &&
    Number.isInteger(c.q) &&
    Number.isInteger(c.r) &&
    Math.abs(c.q) <= 4 &&
    Math.abs(c.r) <= 4
  );
}
function validateCommand(command) {
  check(
    object(command) &&
      Object.keys(command).every((k) => fields.has(k)) &&
      text(command.type),
  );
  for (const k of ["actorId", "heroId", "kind", "copyId", "guardId"])
    if (command[k] !== undefined) check(text(command[k]));
  if (command.cardUid !== undefined && command.cardUid !== null)
    check(text(command.cardUid));
  if (command.targetIds !== undefined)
    check(
      Array.isArray(command.targetIds) &&
        command.targetIds.length <= 12 &&
        command.targetIds.every(text),
    );
  if (command.cell !== undefined && command.cell !== null)
    check(coordinate(command.cell));
  if (command.dice !== undefined)
    check(
      Array.isArray(command.dice) &&
        command.dice.length === 2 &&
        command.dice.every((n) => Number.isInteger(n) && n >= 1 && n <= 6),
    );
  if (command.skillNo !== undefined)
    check(
      Number.isInteger(command.skillNo) &&
        command.skillNo >= 1 &&
        command.skillNo <= 3,
    );
  if (command.resolve !== undefined)
    check(typeof command.resolve === "boolean");
  if (command.troops !== undefined)
    check(
      object(command.troops) &&
        Object.keys(command.troops).length === 3 &&
        ["inf", "arch", "cav"].every(
          (k) =>
            Number.isInteger(command.troops[k]) &&
            command.troops[k] >= 0 &&
            command.troops[k] <= 5,
        ),
    );
  if (command.units !== undefined)
    check(
      Array.isArray(command.units) &&
        command.units.length === 6 &&
        command.units.every(
          (u) =>
            object(u) &&
            Object.keys(u).length === 3 &&
            text(u.definitionId) &&
            coordinate({ q: u.q, r: u.r }),
        ),
    );
}
module.exports = { validateCommand };
