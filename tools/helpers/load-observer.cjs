"use strict";
// Test-only preload, mounted only by benchmark.compose.yml; no production metrics endpoint.
const { monitorEventLoopDelay } = require("node:perf_hooks"),
  os = require("node:os");
const lag = monitorEventLoopDelay({ resolution: 10 });
lag.enable();
let lastCPU = process.cpuUsage(),
  lastAt = process.hrtime.bigint();
const timer = setInterval(() => {
  const at = process.hrtime.bigint(),
    cpu = process.cpuUsage(),
    elapsed = Number(at - lastAt) / 1e6,
    memory = process.memoryUsage();
  const data = {
    at: Date.now(),
    elapsedMs: elapsed,
    cpuPercent:
      (100 * (cpu.user - lastCPU.user + cpu.system - lastCPU.system)) /
      1000 /
      elapsed,
    rssBytes: memory.rss,
    heapBytes: memory.heapUsed,
    loopP95Ms: lag.percentile(95) / 1e6,
    loopMaxMs: lag.max / 1e6,
    node: process.version,
    arch: process.arch,
    cpuModel: os.cpus()[0]?.model,
  };
  process.stdout.write("DW_BENCH_METRIC " + JSON.stringify(data) + "\n");
  lag.reset();
  lastCPU = cpu;
  lastAt = at;
}, 500);
timer.unref();
