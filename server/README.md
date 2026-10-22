# Authoritative Duel server (protocol 1)

The server hosts real private 1v1 rooms over Socket.IO. The existing offline shell stays independent; `/online/` is the first network client. Deployment and Vietnamese setup instructions are in `deploy/README.md`.

## Rule reuse and boundaries

`runtime-source.cjs` parses trusted repository files with Acorn and selects the existing Core/Mode/Content rule implementations, excluding DOM renderers and Bot orchestration. `headless-ports.js` supplies state and explicit output ports. `engine-runtime.js` is the allowlisted command boundary, setup flow, personalized projection and authoritative clock. The VM accepts JSON intent data, never user scripts. Code generation and browser timers are disabled; rule invocation has a time limit. Node VM is **not** relied upon as a sandbox for untrusted code.

This is a transitional headless adapter around the offline rules, not a claim that the legacy Core has been completely refactored into a pure shared library. Extraction boundaries fail closed if source declarations/markers move. Future rule changes need both offline gates and server tests. The gameplay manifest is still `fnv1a32:5873bec7` for Duel.

`rooms.cjs` owns per-room serialization, seat authentication, revisions, duplicate receipts and persistence. A client supplies `commandId`, `expectedRevision` and an allowlisted `command`. The authenticated seat comes from its session token; client HP, randomness, clocks, damage and raw state are ignored. Invalid or failed commands rebuild the previous accepted journal, restoring partial mutations and RNG position. Writes with ambiguous responses are reconciled against storage before subsequent commands. Room creation/join can also be retried with a browser-generated 256-bit token saved before the request.

`store.cjs` has development file storage and production PostgreSQL. Each accepted command, its receipt and room revision are saved atomically as one room document. PostgreSQL updates use compare-and-swap; **one app process is required**, CAS does not provide multi-replica routing or synchronization. The guest seat token is stored only as SHA-256, while the seed/journal are private database contents. Do not expose backups.

## Replay and timers

A seeded HMAC stream supplies UUIDs and random numbers. The server timestamp is injected into rules. A journal of accepted commands reconstructs callbacks for counter chains, multi-hit actions and post-hit reflection after restart. Replaying requires the exact rule/adapter/engine hash. Mismatches are retained but not resumed. Protocol v1 stores full bounded journals rather than durable function snapshots.

A scheduler checks deadlines independently of clients, including after restart. Setup has a five-minute timeout per step; turn time is 180 seconds; defense and nested reactions have 30 seconds. Paused parent defense windows resume with the remaining time, not a new allocation. Disconnects do not freeze time. A player can forfeit; both seats must vote for a rematch. Ended rooms expire after 24 hours.

## Transport

- Events: `room:create`, `room:join`, `room:resume`, `room:sync`, `command`; all require acknowledgment callbacks.
- Replies: `{ok:true,...}` or `{ok:false,error}`. Room create/join return the private `resumeToken`; clients must preserve it. An optional pre-generated `resumeToken` makes creation/join retryable.
- `state` is personalized for the socket's authenticated seat, with `revision` and `serverTime`. No raw `S`, opponent hand, seed, journal or token hashes are sent.
- Public metadata: `/api/catalog`; database readiness: `/api/health`.
- Origin allowlist, per-IP room/connection limits, per-socket event rate and 16 KiB message limit. Put the app behind Caddy; set `TRUST_PROXY=1` only when direct external access to the app port is blocked.
- Browser localStorage persists the pending envelope before send; reconnect uses the same ID, not a new action. No optimistic application of game state.

## Verification

`npm run test:server` exercises deterministic setup, all twelve heroes' projections, legal active skill paths, private hands, clock pause/guard behavior, counter payment, lethal reflect/draw, authorization, stale/duplicate commands, partial rollback/RNG, database failures/uncertain commits, room handshake retry, restart/replay, rematches, old-build rejection and two real WebSocket clients. The PostgreSQL test is conditional on `POSTGRES_TEST_URL` and is visibly skipped when unavailable.

`npm run test:online-browser` drives two independent browser profiles through setup, a skill attack, server restart during defense, damage resolution, turn switch, reload/resume and movement. Existing `npm run build` runs the offline gameplay and production-asset gates. These checks are an MVP regression suite, not exhaustive coverage of every combination of 36 skills and 30 equipment cards. Internet latency, sustained concurrency and OCI failover have not been established by these tests.

Before a public launch, complete the VM-specific HTTPS/firewall check, off-VM backup/restore drill and a measured load test. Guest rooms and one server process are the supported scope; online ranked accounts, matchmaking queues, spectating and multi-region replication are not implemented.
