"use strict";
const path = require("node:path");
const { createApp } = require("./app.cjs");
const { FileStore, PostgresStore } = require("./store.cjs");
(async () => {
  const store =
    process.env.DATABASE_URL || process.env.PGHOST
      ? new PostgresStore(process.env.DATABASE_URL)
      : process.env.NODE_ENV === "production"
        ? null
        : new FileStore(
            path.resolve(process.env.DATA_DIR || "work/online-data"),
          );
  if (!store)
    throw Error("Production requires DATABASE_URL or PGHOST configuration");
  const maxRooms = Number(process.env.MAX_ROOMS || 100),
    port = Number(process.env.PORT || 3030);
  if (
    !Number.isInteger(maxRooms) ||
    maxRooms < 1 ||
    maxRooms > 1000 ||
    !Number.isInteger(port) ||
    port < 0 ||
    port > 65535
  )
    throw Error("Invalid MAX_ROOMS or PORT");
  const origins = [process.env.PUBLIC_URL, process.env.ALLOWED_ORIGINS]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const app = await createApp({
    store,
    origins,
    maxRooms,
    trustProxy: process.env.TRUST_PROXY === "1",
  });
  const address = await app.listen(port, process.env.HOST || "127.0.0.1");
  console.log("DozenWar online listening on port " + address.port);
  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      const timer = setTimeout(() => process.exit(1), 15000);
      timer.unref();
      await app.close();
      process.exit(0);
    });
})().catch((error) => {
  console.error("Online server startup failed:", error.message);
  process.exitCode = 1;
});
