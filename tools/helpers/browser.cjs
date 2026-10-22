"use strict";
const fs = require("node:fs");
function launchOptions() {
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  return { headless: true, executablePath, args: ["--no-sandbox"] };
}
module.exports = { launchOptions };
