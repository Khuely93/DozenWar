"use strict";
const http = require("node:http"),
  fs = require("node:fs/promises"),
  path = require("node:path");
const { Server } = require("socket.io");
const { Engine, codeHash } = require("./engine.cjs");
const { Rooms } = require("./rooms.cjs");
const root = path.resolve(__dirname, "..");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
async function createApp({
  store,
  origins = [],
  now = Date.now,
  maxRooms = 100,
  trustProxy = false,
} = {}) {
  if (!store) throw Error("A persistence store is required");
  const rooms = new Rooms(store, { now, maxRooms });
  await rooms.init();
  const catalog = new Engine("0".repeat(64), 0).catalog(),
    sessions = new Map(),
    buckets = new Map();
  const allowed = new Set(origins.map((v) => new URL(v).origin));
  let io,
    interval,
    ticker = Promise.resolve();
  const originAllowed = (origin, host) =>
    !origin ||
    allowed.has(origin) ||
    origin === "http://" + host ||
    origin === "https://" + host;
  const handler = async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    const extra = [...allowed].join(" "),
      websockets = [...allowed].map((s) => s.replace(/^http/, "ws")).join(" ");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' " +
        extra +
        "; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; connect-src 'self' " +
        extra +
        " " +
        websockets +
        "; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    const origin = req.headers.origin;
    if (origin && allowed.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    try {
      const url = new URL(req.url, "http://local");
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        return res.end();
      }
      if (url.pathname === "/api/health") {
        try {
          await store.ping();
        } catch {
          res.writeHead(503);
          return res.end("Storage unavailable");
        }
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        return res.end(
          JSON.stringify({
            ok: true,
            protocol: 1,
            version: require("../package.json").version,
            gameplayHash: catalog.gameplayHash,
          }),
        );
      }
      if (url.pathname === "/api/catalog") {
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify(catalog));
      }
      let pathname = decodeURIComponent(url.pathname),
        base = path.join(root, "dist");
      if (pathname === "/online") {
        res.writeHead(302, { Location: "/online/" });
        return res.end();
      }
      if (pathname.startsWith("/online/")) {
        base = path.join(root, "online");
        pathname = pathname.slice("/online".length);
      }
      if (pathname.startsWith("/assets/")) base = path.join(root, "dist");
      const file = path.resolve(
        base,
        "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
      );
      if (!file.startsWith(base + path.sep) || pathname.includes("\0")) {
        res.writeHead(404);
        return res.end();
      }
      const bytes = await fs.readFile(file);
      res.setHeader(
        "Content-Type",
        mime[path.extname(file)] || "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-cache");
      res.end(req.method === "HEAD" ? undefined : bytes);
    } catch (error) {
      res.writeHead(
        error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 400,
      );
      res.end("Unavailable");
    }
  };
  const server = http.createServer(handler);
  io = new Server(server, {
    maxHttpBufferSize: 16384,
    cors: { origin: (origin, cb) => cb(null, !origin || allowed.has(origin)) },
    allowRequest: (req, cb) =>
      cb(null, originAllowed(req.headers.origin, req.headers.host)),
  });
  function rate(key, limit, period) {
    const at = now(),
      b = buckets.get(key) || { start: at, count: 0 };
    if (at - b.start >= period) {
      b.start = at;
      b.count = 0;
    }
    b.count++;
    buckets.set(key, b);
    if (b.count > limit) throw Error("RATE_LIMIT");
  }
  async function notify(code) {
    for (const socket of io.sockets.sockets.values()) {
      const s = sessions.get(socket.id);
      if (s?.code !== code) continue;
      try {
        socket.emit("state", await rooms.view(code, s.token));
      } catch (error) {
        socket.emit("notice", {
          code:
            error.message === "BUILD_MISMATCH"
              ? "BUILD_MISMATCH"
              : "SESSION_UNAVAILABLE",
        });
      }
    }
  }
  const safeError = (error) => {
    const code = /^[A-Z][A-Z0-9_]{1,70}$/.test(error.message)
      ? error.message
      : "SERVER_ERROR";
    if (code === "SERVER_ERROR")
      console.error("[online] request failed:", error.name);
    return { ok: false, error: code };
  };
  io.on("connection", (socket) => {
    const address = trustProxy
      ? String(
          socket.handshake.headers["x-forwarded-for"] ||
            socket.handshake.address,
        )
          .split(",")[0]
          .trim()
      : socket.handshake.address;
    try {
      rate("connect:" + address, 30, 60000);
    } catch {
      socket.disconnect(true);
      return;
    }
    const handle = (name, fn) =>
      socket.on(name, async (data, ack) => {
        if (typeof ack !== "function") return;
        try {
          rate("event:" + socket.id, 40, 10000);
          const entering = ["room:create", "room:join", "room:resume"].includes(
            name,
          );
          if (entering && socket.data.entering)
            throw Error("REQUEST_IN_PROGRESS");
          if (entering) socket.data.entering = true;
          try {
            ack(await fn(data || {}));
          } finally {
            if (entering) socket.data.entering = false;
          }
        } catch (error) {
          ack(safeError(error));
          if (error.message === "RATE_LIMIT") {
            socket.disconnect(true);
            return;
          }
          const s = sessions.get(socket.id);
          if (s) await notify(s.code);
        }
      });
    const attach = async (result) => {
      const previous = sessions.get(socket.id);
      if (previous && previous.code !== result.code)
        throw Error("ALREADY_IN_ROOM");
      sessions.set(socket.id, { code: result.code, token: result.resumeToken });
      return { ok: true, ...result };
    };
    handle("room:create", async (data) => {
      if (sessions.has(socket.id)) {
        const s = sessions.get(socket.id);
        if (s.token !== data.resumeToken) throw Error("ALREADY_IN_ROOM");
        return {
          ok: true,
          ...(await rooms.resume(s.code, s.token)),
          resumeToken: s.token,
        };
      }
      rate("create:" + address, 5, 60000);
      const result = await attach(
        await rooms.create(data.name, data.resumeToken),
      );
      setImmediate(() => notify(result.code));
      return result;
    });
    handle("room:join", async (data) => {
      if (sessions.has(socket.id)) {
        const s = sessions.get(socket.id);
        if (s.token !== data.resumeToken || s.code !== data.code)
          throw Error("ALREADY_IN_ROOM");
        return {
          ok: true,
          ...(await rooms.resume(s.code, s.token)),
          resumeToken: s.token,
        };
      }
      rate("join:" + address, 20, 60000);
      const result = await attach(
        await rooms.join(data.code, data.name, data.resumeToken),
      );
      setImmediate(() => notify(result.code));
      return result;
    });
    handle("room:resume", async (data) => {
      if (sessions.has(socket.id)) throw Error("ALREADY_IN_ROOM");
      const result = await rooms.resume(data.code, data.resumeToken);
      sessions.set(socket.id, { code: result.code, token: data.resumeToken });
      setImmediate(() => notify(result.code));
      return { ok: true, ...result };
    });
    handle("room:sync", async () => {
      const s = sessions.get(socket.id);
      if (!s) throw Error("UNAUTHORIZED");
      return { ok: true, state: await rooms.view(s.code, s.token) };
    });
    handle("command", async (data) => {
      const s = sessions.get(socket.id);
      if (!s) throw Error("UNAUTHORIZED");
      const result = await rooms.submit(s.code, s.token, data);
      setImmediate(() => notify(s.code));
      return result;
    });
    socket.on("disconnect", () => {
      sessions.delete(socket.id);
      buckets.delete("event:" + socket.id);
    });
  });
  let ticking = false;
  interval = setInterval(() => {
    if (ticking) return;
    ticking = true;
    ticker = (async () => {
      try {
        for (const code of await rooms.tick()) await notify(code);
        const at = now();
        for (const [key, b] of buckets)
          if (at - b.start > 120000) buckets.delete(key);
      } catch (error) {
        console.error("[online] clock/store failure:", error.message);
      } finally {
        ticking = false;
      }
    })();
  }, 500);
  interval.unref();
  return {
    server,
    io,
    rooms,
    catalog,
    codeHash,
    async listen(port = 3030, host = "127.0.0.1") {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, resolve);
      });
      return server.address();
    },
    async close() {
      clearInterval(interval);
      await new Promise((resolve) => io.close(resolve));
      await ticker;
      await rooms.close();
    },
  };
}
module.exports = { createApp };
