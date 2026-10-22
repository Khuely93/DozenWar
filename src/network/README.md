# Network boundary

Real private Duel 1v1 is implemented in `server/` and `online/`. The server validates intents, runs shared trusted Core/Mode rules and persists commands before acknowledging them. The browser receives a seat-specific projection and never resolves authoritative combat.

The existing offline shell remains separate. Its old local matchmaking/rating prototype is not an online ranking service. Use `/online/` for two human players. See `server/README.md` and `deploy/README.md` for protocol, tested behavior and deployment.
