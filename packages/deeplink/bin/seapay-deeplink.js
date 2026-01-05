#!/usr/bin/env node
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const pkgRoot = resolve(__dirname, "..");

const distCli = resolve(pkgRoot, "dist", "cli.js");
const srcCli = resolve(pkgRoot, "src", "cli.ts");

const argv = process.argv.slice(2);

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

// Prefer built JS if available
if (existsSync(distCli)) {
  run(process.execPath, [distCli, ...argv]);
}

// Dev fallback: run TS via tsx
// Uses Node's `--import` hook so we don't require a separate `tsx` binary.
run(process.execPath, ["--import", "tsx", srcCli, ...argv]);


