/* global ethers */

const configElements = {
  rpcUrl: document.getElementById("cfgRpcUrl"),
  tokenAddress: document.getElementById("cfgTokenAddress"),
  watchAddress: document.getElementById("cfgWatchAddress"),
  startBlock: document.getElementById("cfgStartBlock"),
  tokenDecimals: document.getElementById("cfgTokenDecimals"),
  batchSize: document.getElementById("cfgBatchSize"),
  pollInterval: document.getElementById("cfgPollInterval"),
};

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("statusText");
const blockMeta = document.getElementById("blockMeta");
const transferCount = document.getElementById("transferCount");
const resultsHint = document.getElementById("resultsHint");
const results = document.getElementById("results");

let running = false;
let stopRequested = false;
let stopReason = "";
let lastBlock = 0;
let latestBlock = 0;
let seen = new Set();
let totalTransfers = 0;
let appConfig = null;

function setStatus(message) {
  statusText.textContent = message;
}

function updateBlockMeta() {
  if (!appConfig) {
    blockMeta.textContent = "Waiting for config";
    return;
  }
  const latest = latestBlock > 0 ? latestBlock : "?";
  blockMeta.textContent = `Last scanned ${lastBlock} | Latest ${latest}`;
}

function updateTransferCount() {
  transferCount.textContent = String(totalTransfers);
  resultsHint.textContent = totalTransfers === 0 ? "No transfers yet." : "";
}

function resetResults() {
  results.innerHTML = "";
  seen = new Set();
  totalTransfers = 0;
  updateTransferCount();
}

function setButtonsEnabled(idle) {
  startBtn.disabled = !idle;
  stopBtn.disabled = idle;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatConfigValue(value) {
  if (value === undefined || value === null || value === "") {
    return "Not set";
  }
  return String(value);
}

function applyConfig(config) {
  configElements.rpcUrl.textContent = formatConfigValue(config.rpcUrl);
  configElements.tokenAddress.textContent = formatConfigValue(config.tokenAddress);
  configElements.watchAddress.textContent = formatConfigValue(config.watchAddress);
  configElements.startBlock.textContent = formatConfigValue(config.startBlock);
  configElements.tokenDecimals.textContent = formatConfigValue(config.tokenDecimals);
  configElements.batchSize.textContent = formatConfigValue(config.batchSize);
  configElements.pollInterval.textContent = formatConfigValue(config.pollInterval);
}

async function fetchConfig() {
  const response = await fetch("/config.json", { cache: "no-store" });
  if (!response.ok) {
    let errorMessage = "Failed to load config";
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (error) {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function ensureConfig() {
  if (appConfig) {
    return appConfig;
  }
  appConfig = await fetchConfig();
  applyConfig(appConfig);
  return appConfig;
}

async function fetchPoll({ lastBlockValue, batchSize }) {
  const params = new URLSearchParams({
    lastBlock: String(lastBlockValue),
    batchSize: String(batchSize),
  });
  const response = await fetch(`/api/poll?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    let errorMessage = "Polling failed";
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (error) {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

function renderTransfer(transfer, decimals) {
  const uniqueKey = `${transfer.txHash}-${transfer.logIndex}`;
  if (seen.has(uniqueKey)) {
    return;
  }
  seen.add(uniqueKey);
  totalTransfers += 1;
  updateTransferCount();

  const formattedValue = ethers.formatUnits(transfer.value, decimals);
  const directionLabel =
    transfer.direction === "in"
      ? "IN"
      : transfer.direction === "out"
        ? "OUT"
        : "SELF";

  const card = document.createElement("article");
  card.className = "tx-card";
  card.innerHTML = `
    <div class="tx-top">
      <span class="tx-direction ${transfer.direction}">${directionLabel}</span>
      <span class="tx-hash">${transfer.txHash}</span>
    </div>
    <div class="tx-grid">
      <div>
        <div class="tx-label">Block</div>
        <div class="tx-value">${transfer.blockNumber}</div>
      </div>
      <div>
        <div class="tx-label">From</div>
        <div class="tx-value">${transfer.from}</div>
      </div>
      <div>
        <div class="tx-label">To</div>
        <div class="tx-value">${transfer.to}</div>
      </div>
      <div>
        <div class="tx-label">Amount</div>
        <div class="tx-value">${formattedValue}</div>
      </div>
      <div>
        <div class="tx-label">Raw</div>
        <div class="tx-value">${transfer.value}</div>
      </div>
    </div>
  `;

  results.appendChild(card);
}

async function startPolling() {
  if (running) {
    return;
  }

  try {
    stopReason = "";
    const config = await ensureConfig();

    const decimals = Number.isFinite(Number(config.tokenDecimals))
      ? Number(config.tokenDecimals)
      : 6;
    const batchSize = Number.isFinite(Number(config.batchSize))
      ? Number(config.batchSize)
      : 2000;
    const pollInterval = Number.isFinite(Number(config.pollInterval))
      ? Number(config.pollInterval)
      : 2000;

    resetResults();
    setStatus("Polling for transfers...");
    running = true;
    stopRequested = false;
    setButtonsEnabled(false);

    const startBlockValue = Number(config.startBlock);
    lastBlock =
      Number.isFinite(startBlockValue) && startBlockValue >= 0
        ? startBlockValue
        : 0;
    latestBlock = 0;
    updateBlockMeta();

    while (!stopRequested) {
      try {
        const response = await fetchPoll({
          lastBlockValue: lastBlock,
          batchSize,
        });

        latestBlock = Number(response.latestBlock || 0);
        const toBlock = Number(response.toBlock || lastBlock);

        if (Array.isArray(response.transfers)) {
          for (const transfer of response.transfers) {
            renderTransfer(transfer, decimals);
          }
        }

        if (Number.isFinite(toBlock)) {
          lastBlock = toBlock;
        }

        updateBlockMeta();

        if (lastBlock >= latestBlock) {
          await sleep(pollInterval);
        }
      } catch (error) {
        setStatus(`Polling error: ${error.message || error}`);
        await sleep(pollInterval);
      }
    }
  } catch (error) {
    setStatus(error.message || "Failed to start polling");
  } finally {
    running = false;
    stopRequested = false;
    if (stopReason) {
      setStatus(stopReason);
    } else if (appConfig) {
      setStatus("Idle");
    }
    setButtonsEnabled(true);
    updateBlockMeta();
  }
}

function stopPolling() {
  if (!running) {
    return;
  }
  stopRequested = true;
  stopReason = "Stopped";
  setStatus("Stopping...");
}

async function initConfig() {
  try {
    setStatus("Loading config...");
    await ensureConfig();
    setStatus("Idle");
  } catch (error) {
    setStatus(error.message || "Config load failed");
  }
}

startBtn.addEventListener("click", startPolling);
stopBtn.addEventListener("click", stopPolling);
clearBtn.addEventListener("click", resetResults);

updateBlockMeta();
updateTransferCount();
setButtonsEnabled(true);
initConfig();
