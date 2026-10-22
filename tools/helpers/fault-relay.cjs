"use strict";
// Test-only loopback relay. Delay/drop actual WebSocket frames, not mock game rules.
const http = require("node:http");
const { WebSocket, WebSocketServer } = require("ws");
function packet(data) {
  const match = /^4([23])(\d*)(\[.*\])$/s.exec(String(data));
  if (!match) return null;
  try {
    const payload = JSON.parse(match[3]);
    return match[1] === "2"
      ? { kind: "event", id: match[2], event: payload[0], data: payload[1] }
      : { kind: "ack", id: match[2], data: payload[0] };
  } catch {
    return null;
  }
}
class FaultRelay {
  constructor() {
    this.target = null;
    this.offline = false;
    this.upMs = 0;
    this.downMs = 0;
    this.jitterMs = 0;
    this.upBytesPerSecond = 0;
    this.downBytesPerSecond = 0;
    this.serial = 0;
    this.links = new Set();
    this.timers = new Set();
    this.filter = null;
    this.httpFault = null;
    this.commands = [];
    this.server = http.createServer((req, res) => this.http(req, res));
    this.wss = new WebSocketServer({ noServer: true });
    this.server.on("upgrade", (req, socket, head) =>
      this.upgrade(req, socket, head),
    );
  }
  async listen() {
    await new Promise((r) => this.server.listen(0, "127.0.0.1", r));
    this.origin = "http://127.0.0.1:" + this.server.address().port;
    return this.origin;
  }
  async http(req, res) {
    if (this.offline || !this.target || this.httpFault?.(req)) {
      res.writeHead(503);
      return res.end("Network unavailable in test");
    }
    const target = new URL(req.url, this.target);
    const out = http.request(
      target,
      { method: req.method, headers: { ...req.headers, host: target.host } },
      (incoming) => {
        res.writeHead(incoming.statusCode, incoming.headers);
        incoming.pipe(res);
      },
    );
    out.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end();
    });
    req.pipe(out);
    req.on("aborted", () => out.destroy());
  }
  upgrade(req, socket, head) {
    if (this.offline || !this.target) {
      socket.destroy();
      return;
    }
    this.wss.handleUpgrade(req, socket, head, (client) => {
      const target = new URL(req.url, this.target);
      target.protocol = "ws:";
      const upstream = new WebSocket(target, {
          headers: { Origin: this.origin },
        }),
        link = { client, upstream, waiting: [] };
      this.links.add(link);
      const close = () => {
        this.links.delete(link);
        if (client.readyState < 2) client.terminate();
        if (upstream.readyState < 2) upstream.terminate();
      };
      client.on("error", () => {});
      upstream.on("error", close);
      client.on("close", close);
      upstream.on("close", close);
      upstream.on("open", () => {
        for (const [d, b] of link.waiting) this.forward("up", d, b, link);
        link.waiting = [];
      });
      client.on("message", (data, binary) => {
        const p = packet(data);
        if (p?.event === "command") this.commands.push(structuredClone(p.data));
        if (upstream.readyState === WebSocket.OPEN)
          this.forward("up", data, binary, link);
        else link.waiting.push([data, binary]);
      });
      upstream.on("message", (data, binary) =>
        this.forward("down", data, binary, link),
      );
    });
  }
  forward(direction, data, binary, link) {
    const send = (override = data) => {
      const destination = direction === "up" ? link.upstream : link.client;
      if (!this.offline && destination.readyState === WebSocket.OPEN)
        destination.send(override, { binary });
    };
    const p = binary ? null : packet(data);
    if (
      this.filter?.({
        direction,
        packet: p,
        data: String(data),
        send,
        link,
      }) === false
    )
      return;
    const ms =
      (direction === "up" ? this.upMs : this.downMs) +
      (this.jitterMs ? (this.serial++ % 3) * this.jitterMs : 0);
    const key = direction + "Due";
    const bandwidth =
      direction === "up" ? this.upBytesPerSecond : this.downBytesPerSecond;
    const wireKey = direction + "WireReady";
    const transmission = bandwidth
      ? (1000 * Buffer.byteLength(data)) / bandwidth
      : 0;
    link[wireKey] = Math.max(Date.now(), link[wireKey] || 0) + transmission;
    const due = Math.max(link[wireKey] + ms, (link[key] || 0) + 1);
    link[key] = due;
    this.later(send, Math.max(0, due - Date.now()));
  }
  later(fn, ms) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      fn();
    }, ms);
    this.timers.add(timer);
  }
  disconnect() {
    for (const { client, upstream } of this.links) {
      client.terminate();
      upstream.terminate();
    }
    this.links.clear();
  }
  setOffline(value) {
    this.offline = value;
    if (value) this.disconnect();
  }
  async close() {
    this.offline = true;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.disconnect();
    this.server.closeAllConnections();
    await new Promise((r) => this.wss.close(r));
    await new Promise((r) => this.server.close(r));
  }
}
module.exports = { FaultRelay, packet };
