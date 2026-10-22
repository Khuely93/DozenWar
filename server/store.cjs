"use strict";
const fs = require("node:fs/promises"),
  path = require("node:path");
class FileStore {
  constructor(directory) {
    this.directory = directory;
    this.docs = new Map();
  }
  async init() {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
    for (const file of await fs.readdir(this.directory)) {
      if (!/^[A-Z2-9]{8}\.json$/.test(file)) continue;
      const doc = JSON.parse(
        await fs.readFile(path.join(this.directory, file), "utf8"),
      );
      this.docs.set(doc.code, doc);
    }
  }
  async all() {
    return structuredClone([...this.docs.values()]);
  }
  async get(code) {
    try {
      const doc = JSON.parse(
        await fs.readFile(path.join(this.directory, code + ".json"), "utf8"),
      );
      this.docs.set(code, doc);
      return structuredClone(doc);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  async ping() {
    return true;
  }
  async save(doc, expected) {
    const old = this.docs.get(doc.code);
    if ((old?.revision ?? null) !== expected) throw Error("STORE_CONFLICT");
    const target = path.join(this.directory, doc.code + ".json"),
      tmp = target + ".tmp";
    const handle = await fs.open(tmp, "w", 0o600);
    try {
      await handle.writeFile(JSON.stringify(doc));
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(tmp, target);
    const dir = await fs.open(this.directory, "r");
    try {
      await dir.sync();
    } finally {
      await dir.close();
    }
    this.docs.set(doc.code, structuredClone(doc));
  }
  async delete(code) {
    await fs.rm(path.join(this.directory, code + ".json"), { force: true });
    this.docs.delete(code);
  }
  async close() {}
}
class PostgresStore {
  constructor(url) {
    const { Pool } = require("pg");
    this.pool = new Pool({
      connectionString: url,
      max: 4,
      connectionTimeoutMillis: 10000,
      statement_timeout: 10000,
    });
    this.pool.on("error", () =>
      console.error("[online] PostgreSQL connection interrupted"),
    );
  }
  async init() {
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS dozenwar_rooms (code text PRIMARY KEY, revision integer NOT NULL, document jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())",
    );
  }
  async all() {
    const r = await this.pool.query("SELECT document FROM dozenwar_rooms");
    return r.rows.map((r) => r.document);
  }
  async get(code) {
    const r = await this.pool.query(
      "SELECT document FROM dozenwar_rooms WHERE code=$1",
      [code],
    );
    return r.rows[0]?.document || null;
  }
  async ping() {
    await this.pool.query("SELECT 1");
  }
  async save(doc, expected) {
    if (expected === null) {
      await this.pool.query(
        "INSERT INTO dozenwar_rooms(code,revision,document) VALUES($1,$2,$3)",
        [doc.code, doc.revision, doc],
      );
      return;
    }
    const r = await this.pool.query(
      "UPDATE dozenwar_rooms SET revision=$2,document=$3,updated_at=now() WHERE code=$1 AND revision=$4",
      [doc.code, doc.revision, doc, expected],
    );
    if (r.rowCount !== 1) throw Error("STORE_CONFLICT");
  }
  async delete(code) {
    await this.pool.query("DELETE FROM dozenwar_rooms WHERE code=$1", [code]);
  }
  async close() {
    await this.pool.end();
  }
}
module.exports = { FileStore, PostgresStore };
