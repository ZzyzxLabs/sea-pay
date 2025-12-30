import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const envPath = path.join(rootDir, ".env");
const port = Number(process.env.FRONTEND_PORT || 5173);

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function parseEnv(text: string) {
  const result: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

async function loadEnvFile() {
  const raw = await fs.readFile(envPath, "utf8");
  return parseEnv(raw);
}

function applyEnv(env: Record<string, string>) {
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function pickEnvValue(env: Record<string, string>, key: string) {
  if (process.env[key]) {
    return process.env[key];
  }
  return env[key];
}

function parseNumber(value: string | undefined | null, fallback: number | null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
}

let envFromFile: Record<string, string> = {};
try {
  envFromFile = await loadEnvFile();
} catch (error) {
  console.warn("Unable to read .env file, using process.env only");
}

applyEnv(envFromFile);

const { pollTransfersForAddress, getLatestBlock } = await import("./poller.js");

type ConfigPayload = {
  rpcUrl: string | undefined;
  tokenAddress: string | undefined;
  watchAddress: string | undefined;
  startBlock: number | null;
  batchSize: number;
  pollInterval: number;
  tokenDecimals: number;
  error?: string;
};

function buildConfig(): ConfigPayload {
  const rpcUrl = pickEnvValue(envFromFile, "RPC_URL");
  const tokenAddress = pickEnvValue(envFromFile, "USDC_ADDRESS");
  const watchAddress = pickEnvValue(envFromFile, "DEPOSIT_ADDRESS");
  const startBlock = pickEnvValue(envFromFile, "START_BLOCK");
  const batchSize = pickEnvValue(envFromFile, "BATCH_SIZE");
  const pollInterval = pickEnvValue(envFromFile, "POLL_INTERVAL_MS");
  const tokenDecimals = pickEnvValue(envFromFile, "TOKEN_DECIMALS");

  const missing: string[] = [];
  if (!rpcUrl) missing.push("RPC_URL");
  if (!tokenAddress) missing.push("USDC_ADDRESS");
  if (!watchAddress) missing.push("DEPOSIT_ADDRESS");

  if (missing.length > 0) {
    return {
      rpcUrl,
      tokenAddress,
      watchAddress,
      startBlock: null,
      batchSize: 2000,
      pollInterval: 2000,
      tokenDecimals: 6,
      error: `Missing required env values: ${missing.join(", ")}`,
    };
  }

  return {
    rpcUrl,
    tokenAddress,
    watchAddress,
    startBlock: parseNumber(startBlock, null),
    batchSize: parseNumber(batchSize, 2000) ?? 2000,
    pollInterval: parseNumber(pollInterval, 2000) ?? 2000,
    tokenDecimals: parseNumber(tokenDecimals, 6) ?? 6,
  };
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function handleConfig(_req: http.IncomingMessage, res: http.ServerResponse) {
  const config = buildConfig();
  if (config.error) {
    sendJson(res, 500, { error: config.error });
    return;
  }
  sendJson(res, 200, config);
}

async function handlePoll(req: http.IncomingMessage, res: http.ServerResponse) {
  const config = buildConfig();
  if (config.error) {
    sendJson(res, 500, { error: config.error });
    return;
  }
  if (!config.tokenAddress || !config.watchAddress) {
    sendJson(res, 500, { error: "Token or watch address is missing" });
    return;
  }

  const requestUrl = new URL(req.url || "/", "http://localhost");
  const lastBlockRaw = requestUrl.searchParams.get("lastBlock");
  const batchSizeRaw = requestUrl.searchParams.get("batchSize");

  const lastBlock = parseNumber(lastBlockRaw, null);
  if (lastBlock === null || lastBlock < 0) {
    sendJson(res, 400, { error: "lastBlock must be a non-negative number" });
    return;
  }

  const batchSize = parseNumber(batchSizeRaw, config.batchSize) ?? config.batchSize;

  try {
    const latestBlock = await getLatestBlock();
    if (lastBlock >= latestBlock) {
      sendJson(res, 200, {
        latestBlock,
        fromBlock: lastBlock,
        toBlock: lastBlock,
        transfers: [],
      });
      return;
    }

    const fromBlock = lastBlock + 1;
    const toBlock = Math.min(latestBlock, fromBlock + batchSize);

    const transfers = await pollTransfersForAddress({
      tokenAddress: config.tokenAddress,
      watchAddress: config.watchAddress,
      fromBlock,
      toBlock,
    });

    sendJson(res, 200, {
      latestBlock,
      fromBlock,
      toBlock,
      transfers: transfers.map((transfer) => ({
        txHash: transfer.txHash,
        blockNumber: transfer.blockNumber,
        logIndex: transfer.logIndex,
        from: transfer.from,
        to: transfer.to,
        value: transfer.value.toString(),
        direction: transfer.direction,
      })),
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Polling failed" });
  }
}

async function handleStatic(req: http.IncomingMessage, res: http.ServerResponse) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(frontendDir, relativePath));

  if (!filePath.startsWith(frontendDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const contentType = contentTypes[ext] || "application/octet-stream";
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch (error) {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (req.url.startsWith("/config.json")) {
    handleConfig(req, res);
    return;
  }

  if (req.url.startsWith("/api/poll")) {
    handlePoll(req, res);
    return;
  }

  handleStatic(req, res);
});

server.listen(port, () => {
  console.log(`Frontend dev server running at http://localhost:${port}`);
});
