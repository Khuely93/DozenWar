"use strict";
const { execFile } = require("node:child_process"),
  { promisify } = require("node:util"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto");
const { drive } = require("./helpers/load-driver.cjs");
const execute = promisify(execFile),
  root = path.resolve(__dirname, "..");
function argumentsFor(argv) {
  const result = {
    rooms: [5, 10, 20],
    seconds: 30,
    interval: 1000,
    output: "work/online-load/report.json",
    skipBuild: false,
    maxP95: 1500,
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--skip-build") {
      result.skipBuild = true;
      continue;
    }
    if (
      !["--rooms", "--seconds", "--interval", "--output", "--max-p95"].includes(
        k,
      ) ||
      !argv[i + 1]
    )
      throw Error("Unknown/incomplete option: " + k);
    const v = argv[++i];
    if (k === "--rooms") result.rooms = v.split(",").map(Number);
    else if (k === "--output") result.output = v;
    else result[k === "--max-p95" ? "maxP95" : k.slice(2)] = Number(v);
  }
  if (
    !result.rooms.length ||
    result.rooms.some((n) => !Number.isInteger(n) || n < 1 || n > 50) ||
    !Number.isInteger(result.seconds) ||
    result.seconds < 5 ||
    result.seconds > 600 ||
    !Number.isInteger(result.interval) ||
    result.interval < 1000 ||
    result.interval > 5000 ||
    !Number.isFinite(result.maxP95) ||
    result.maxP95 <= 0
  )
    throw Error("Use 1–50 rooms, 5–600 seconds, interval 1000–5000 ms");
  return result;
}
(async () => {
  const config = argumentsFor(process.argv.slice(2)),
    output = path.resolve(root, config.output),
    log = path.join(path.dirname(output), "docker.log"),
    project =
      "dw-bench-" + process.pid + "-" + crypto.randomBytes(3).toString("hex");
  await fs.mkdir(path.dirname(output), { recursive: true });
  const env = { ...process.env };
  for (const key of [
    "DOCKER_HOST",
    "DOCKER_CONTEXT",
    "DOCKER_TLS",
    "DOCKER_TLS_VERIFY",
    "DOCKER_CERT_PATH",
  ])
    delete env[key];
  const prefix = ["--host=unix:///var/run/docker.sock"];
  const docker = async (args) => {
    try {
      return (
        await execute("docker", [...prefix, ...args], {
          cwd: root,
          env,
          maxBuffer: 20 * 1024 * 1024,
        })
      ).stdout.trim();
    } catch (e) {
      await fs.appendFile(
        log,
        (e.stdout || "") + "\n" + (e.stderr || "") + "\n",
      );
      throw Error("Docker command failed; see " + path.relative(root, log));
    }
  };
  const compose = async (args) =>
    docker([
      "compose",
      "-p",
      project,
      "-f",
      "deploy/benchmark.compose.yml",
      ...args,
    ]);
  const report = {
    createdAt: new Date().toISOString(),
    scope:
      "Local backend benchmark, real PostgreSQL, paced clients; no Internet RTT or asset downloads",
    limits: {
      appCPUs: 1,
      appMemoryMiB: 768,
      postgresCPUs: 0.5,
      postgresMemoryMiB: 512,
    },
    runs: [],
  };
  let failed = false;
  try {
    await docker(["info", "--format", "{{.ServerVersion}}"]);
    if (!config.skipBuild) {
      console.log("Building production benchmark image…");
      await fs.appendFile(log, (await compose(["build", "app"])) + "\n");
    }
    for (const rooms of config.rooms) {
      console.log("Starting isolated " + rooms + "-room case…");
      await fs.appendFile(
        log,
        (await compose([
          "up",
          "-d",
          "--no-build",
          "--wait",
          "--wait-timeout",
          "120",
        ])) + "\n",
      );
      const endpoint = await compose(["port", "app", "3030"]),
        appID = await compose(["ps", "-q", "app"]),
        dbID = await compose(["ps", "-q", "db"]);
      if (
        !/^127\.0\.0\.1:\d+$/.test(endpoint) ||
        !/^\w+$/.test(appID) ||
        !/^\w+$/.test(dbID)
      )
        throw Error("Unexpected benchmark endpoint/container");
      const inspected = JSON.parse(await docker(["inspect", appID]))[0];
      if (
        inspected.HostConfig.NanoCpus !== 1e9 ||
        inspected.HostConfig.Memory !== 768 * 1024 * 1024
      )
        throw Error("Benchmark resource limits not applied");
      const load = await drive({
        url: "http://" + endpoint,
        rooms,
        seconds: config.seconds,
        intervalMs: config.interval,
        progress: (message) => {
          if (message.phase === "measuring")
            console.log(
              "Measuring " +
                rooms +
                " rooms / " +
                2 * rooms +
                " players for " +
                config.seconds +
                " seconds…",
            );
        },
      });
      const lines = await compose(["logs", "--no-log-prefix", "app"]);
      const samples = lines
        .split("\n")
        .filter((s) => s.startsWith("DW_BENCH_METRIC "))
        .map((s) => JSON.parse(s.slice("DW_BENCH_METRIC ".length)))
        .filter(
          (m) => m.at >= load.measurementStart && m.at <= load.measurementEnd,
        );
      if (samples.length < 3) throw Error("Insufficient server metric samples");
      const cpuElapsed = samples.reduce((sum, s) => sum + s.elapsedMs, 0),
        resource = {
          samples: samples.length,
          cpuMeanPercent:
            samples.reduce((sum, s) => sum + s.cpuPercent * s.elapsedMs, 0) /
            cpuElapsed,
          cpuPeakPercent: Math.max(...samples.map((s) => s.cpuPercent)),
          rssPeakMiB: Math.max(...samples.map((s) => s.rssBytes)) / 1024 / 1024,
          heapPeakMiB:
            Math.max(...samples.map((s) => s.heapBytes)) / 1024 / 1024,
          loopWindowP95MaxMs: Math.max(...samples.map((s) => s.loopP95Ms)),
          loopMaxMs: Math.max(...samples.map((s) => s.loopMaxMs)),
          node: samples[0].node,
          arch: samples[0].arch,
          cpuModel: samples[0].cpuModel,
        };
      const stats = await docker([
        "stats",
        "--no-stream",
        "--format",
        "{{json .}}",
        appID,
        dbID,
      ]);
      const exitOK =
        load.failures.length === 0 &&
        load.unexpectedDisconnects === 0 &&
        load.missingBroadcasts === 0 &&
        load.commands >=
          rooms *
            Math.max(
              1,
              Math.floor((config.seconds / config.interval) * 1000 * 0.7),
            ) &&
        load.commandAck.p95Ms <= config.maxP95;
      report.runs.push({
        ...load,
        resources: resource,
        containerStatsAtEnd: stats.split("\n").map((s) => JSON.parse(s)),
        pass: exitOK,
      });
      failed ||= !exitOK;
      console.log(
        JSON.stringify({
          rooms,
          commands: load.commands,
          p95Ms: Number(load.commandAck.p95Ms.toFixed(1)),
          cpuMeanPercent: Number(resource.cpuMeanPercent.toFixed(1)),
          rssPeakMiB: Number(resource.rssPeakMiB.toFixed(1)),
          errors: load.failures.length,
          missingBroadcasts: load.missingBroadcasts,
          pass: exitOK,
        }),
      );
      await fs.writeFile(
        output,
        JSON.stringify({ ...report, passed: !failed }, null, 2),
      );
      await compose(["down", "--volumes", "--remove-orphans"]);
    }
  } finally {
    await compose(["down", "--volumes", "--remove-orphans"]).catch(() => {});
    await fs.writeFile(
      output,
      JSON.stringify(
        {
          ...report,
          passed: !failed && report.runs.length === config.rooms.length,
        },
        null,
        2,
      ),
    );
  }
  if (failed)
    throw Error(
      "Benchmark thresholds failed; inspect " + path.relative(root, output),
    );
  console.log("Benchmark report: " + path.relative(root, output));
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
