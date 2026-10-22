"use strict";
const vm = require("node:vm"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const shared = require("./runtime-source.cjs");
const ports = fs.readFileSync(
  path.join(__dirname, "headless-ports.js"),
  "utf8",
);
const boundary = fs.readFileSync(
  path.join(__dirname, "engine-runtime.js"),
  "utf8",
);
const code = ports + "\n;\n" + shared.source + "\n;\n" + boundary;
const codeHash = crypto
  .createHash("sha256")
  .update(code)
  .update(fs.readFileSync(__filename))
  .digest("hex");
const script = new vm.Script(code, { filename: "dozenwar-server-rules.js" });
class Engine {
  constructor(seed, createdAt) {
    this.now = createdAt;
    let counter = 0;
    const bytes = (label) =>
      crypto
        .createHmac("sha256", Buffer.from(seed, "hex"))
        .update(label + ":" + counter++)
        .digest();
    const math = Object.create(Math);
    math.random = () => bytes("random").readUIntBE(0, 6) / 281474976710656;
    const clock = this;
    class ServerDate extends Date {
      constructor(...args) {
        super(...(args.length ? args : [clock.now]));
      }
      static now() {
        return clock.now;
      }
    }
    this.ctx = vm.createContext(
      {
        window: {},
        console: { log() {}, warn() {}, error() {} },
        Date: ServerDate,
        Math: math,
        crypto: {
          randomUUID: () => {
            const b = bytes("id");
            return b.subarray(0, 16).toString("hex");
          },
        },
        setTimeout() {
          throw Error("Browser timer reached server rules");
        },
        clearTimeout() {},
      },
      { codeGeneration: { strings: false, wasm: false } },
    );
    script.runInContext(this.ctx, { timeout: 1000 });
  }
  invoke(expression, at, input) {
    this.now = at;
    this.ctx.input = JSON.stringify(input ?? null);
    try {
      return JSON.parse(
        vm.runInContext("JSON.stringify(" + expression + ")", this.ctx, {
          timeout: 500,
        }),
      );
    } finally {
      delete this.ctx.input;
    }
  }
  command(side, command, at) {
    return this.invoke(
      "(api.command(" + side + ",JSON.parse(input)),true)",
      at,
      command,
    );
  }
  view(side, at) {
    return this.invoke("api.view(" + side + ")", at);
  }
  catalog() {
    return this.invoke("api.catalog()", this.now);
  }
  deadline() {
    return this.invoke("api.deadline()", this.now);
  }
}
module.exports = { Engine, codeHash };
