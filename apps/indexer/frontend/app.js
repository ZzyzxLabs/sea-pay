import * as React from "https://esm.sh/react@19.2.3";
import { createRoot } from "https://esm.sh/react-dom@19.2.3/client";

const { useEffect, useMemo, useRef, useState } = React;

const DEFAULTS = {
  batchSize: 2000,
  pollInterval: 2000,
  tokenDecimals: 6,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return fallback;
}

function formatConfigValue(value) {
  if (value === undefined || value === null || value === "") {
    return "Not set";
  }
  return String(value);
}

async function requestJson(url, fallbackMessage) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    let errorMessage = fallbackMessage;
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

function formatUnits(value, decimals) {
  if (window.ethers && typeof window.ethers.formatUnits === "function") {
    return window.ethers.formatUnits(value, decimals);
  }
  return String(value);
}

function App() {
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState("");
  const [status, setStatus] = useState("Loading config...");
  const [transfers, setTransfers] = useState([]);
  const [running, setRunning] = useState(false);
  const [lastBlock, setLastBlock] = useState(0);
  const [latestBlock, setLatestBlock] = useState(0);

  const runningRef = useRef(false);
  const stopRef = useRef(false);
  const stopReasonRef = useRef("");
  const seenRef = useRef(new Set());
  const lastBlockRef = useRef(0);
  const latestBlockRef = useRef(0);
  const configRef = useRef(null);
  const settingsRef = useRef({
    batchSize: DEFAULTS.batchSize,
    pollInterval: DEFAULTS.pollInterval,
    decimals: DEFAULTS.tokenDecimals,
  });

  const configLoading = !config && !configError;

  const tokenDecimals = useMemo(() => {
    if (!config) {
      return DEFAULTS.tokenDecimals;
    }
    return (
      parseNumber(config.tokenDecimals, DEFAULTS.tokenDecimals) ??
      DEFAULTS.tokenDecimals
    );
  }, [config]);

  const blockMeta = useMemo(() => {
    if (!config) {
      return "Waiting for config";
    }
    const latestValue = latestBlock > 0 ? latestBlock : "?";
    return `Last scanned ${lastBlock} | Latest ${latestValue}`;
  }, [config, lastBlock, latestBlock]);

  const resultsHint = transfers.length === 0 ? "No transfers yet." : "";

  async function fetchConfig() {
    return requestJson("/config.json", "Failed to load config");
  }

  async function ensureConfig() {
    if (configRef.current) {
      return configRef.current;
    }
    const loaded = await fetchConfig();
    configRef.current = loaded;
    setConfig(loaded);
    setConfigError("");
    return loaded;
  }

  async function fetchPoll({ lastBlockValue, batchSize }) {
    const params = new URLSearchParams({
      lastBlock: String(lastBlockValue),
      batchSize: String(batchSize),
    });
    return requestJson(`/api/poll?${params.toString()}`, "Polling failed");
  }

  function resetResults() {
    setTransfers([]);
    seenRef.current = new Set();
  }

  async function initConfig() {
    try {
      setStatus("Loading config...");
      await ensureConfig();
      if (!runningRef.current) {
        setStatus("Idle");
      }
    } catch (error) {
      const message = error?.message || "Config load failed";
      setConfigError(message);
      setStatus(message);
    }
  }

  useEffect(() => {
    initConfig();
  }, []);

  async function startPolling() {
    if (runningRef.current) {
      return;
    }

    let started = false;
    try {
      stopReasonRef.current = "";
      const loadedConfig = await ensureConfig();
      const decimals =
        parseNumber(loadedConfig.tokenDecimals, DEFAULTS.tokenDecimals) ??
        DEFAULTS.tokenDecimals;
      const batchSize =
        parseNumber(loadedConfig.batchSize, DEFAULTS.batchSize) ??
        DEFAULTS.batchSize;
      const pollInterval =
        parseNumber(loadedConfig.pollInterval, DEFAULTS.pollInterval) ??
        DEFAULTS.pollInterval;

      settingsRef.current = { batchSize, pollInterval, decimals };

      resetResults();
      setStatus("Polling for transfers...");
      stopRef.current = false;
      setRunning(true);
      runningRef.current = true;
      started = true;

      const startBlockValue = parseNumber(loadedConfig.startBlock, 0) ?? 0;
      lastBlockRef.current = startBlockValue >= 0 ? startBlockValue : 0;
      setLastBlock(lastBlockRef.current);
      latestBlockRef.current = 0;
      setLatestBlock(0);

      while (!stopRef.current) {
        try {
          const response = await fetchPoll({
            lastBlockValue: lastBlockRef.current,
            batchSize,
          });

          const latestValue = parseNumber(response.latestBlock, 0) ?? 0;
          latestBlockRef.current = latestValue;
          setLatestBlock(latestValue);

          const toBlock =
            parseNumber(response.toBlock, lastBlockRef.current) ??
            lastBlockRef.current;

          if (Array.isArray(response.transfers)) {
            const next = [];
            for (const transfer of response.transfers) {
              const uniqueKey = `${transfer.txHash}-${transfer.logIndex ?? 0}`;
              if (seenRef.current.has(uniqueKey)) {
                continue;
              }
              seenRef.current.add(uniqueKey);
              next.push(transfer);
            }

            if (next.length > 0) {
              setTransfers((prev) => prev.concat(next));
            }
          }

          if (Number.isFinite(toBlock)) {
            lastBlockRef.current = toBlock;
            setLastBlock(toBlock);
          }

          if (lastBlockRef.current >= latestBlockRef.current) {
            await sleep(pollInterval);
          }
        } catch (error) {
          const message = error?.message || error;
          setStatus(`Polling error: ${message}`);
          await sleep(pollInterval);
        }
      }
    } catch (error) {
      const message = error?.message || "Failed to start polling";
      setStatus(message);
    } finally {
      if (started) {
        runningRef.current = false;
        setRunning(false);
        stopRef.current = false;
        const finalStatus = stopReasonRef.current || "Idle";
        setStatus(finalStatus);
        stopReasonRef.current = "";
      }
    }
  }

  function stopPolling() {
    if (!runningRef.current) {
      return;
    }
    stopRef.current = true;
    stopReasonRef.current = "Stopped";
    setStatus("Stopping...");
  }

  function clearTransfers() {
    resetResults();
  }

  function renderConfigValue(value) {
    if (configLoading) {
      return "Loading...";
    }
    if (configError) {
      return "Error";
    }
    return formatConfigValue(value);
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay Indexer</p>
          <h1>Poll ERC20 transfers by address</h1>
          <p className="lede">
            Paste an EVM address and watch all related transfers stream in.
          </p>
        </div>
        <div className="hero-badge">
          <div className="pulse"></div>
          <span>Live polling console</span>
        </div>
      </header>

      <section className="panel">
        <div id="controls" className="controls">
          <div className="config-item">
            <span className="config-label">RPC URL</span>
            <span id="cfgRpcUrl" className="config-value">
              {renderConfigValue(config?.rpcUrl)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Token contract</span>
            <span id="cfgTokenAddress" className="config-value">
              {renderConfigValue(config?.tokenAddress)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Watch address</span>
            <span id="cfgWatchAddress" className="config-value">
              {renderConfigValue(config?.watchAddress)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Start block</span>
            <span id="cfgStartBlock" className="config-value">
              {renderConfigValue(config?.startBlock)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Token decimals</span>
            <span id="cfgTokenDecimals" className="config-value">
              {renderConfigValue(config?.tokenDecimals)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Batch size</span>
            <span id="cfgBatchSize" className="config-value">
              {renderConfigValue(config?.batchSize)}
            </span>
          </div>
          <div className="config-item">
            <span className="config-label">Poll interval (ms)</span>
            <span id="cfgPollInterval" className="config-value">
              {renderConfigValue(config?.pollInterval)}
            </span>
          </div>
          <div className="actions">
            <button
              id="startBtn"
              type="button"
              onClick={startPolling}
              disabled={running || configLoading || !!configError}
            >
              Start polling
            </button>
            <button
              id="stopBtn"
              type="button"
              className="secondary"
              onClick={stopPolling}
              disabled={!running}
            >
              Stop
            </button>
            <button
              id="clearBtn"
              type="button"
              className="ghost"
              onClick={clearTransfers}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="status" role="status" aria-live="polite">
          <div className="status-row">
            <span className="status-label">Status</span>
            <span id="statusText">{status}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Blocks</span>
            <span id="blockMeta">{blockMeta}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Transfers</span>
            <span id="transferCount">{transfers.length}</span>
          </div>
        </div>
      </section>

      <section className="results">
        <div className="results-header">
          <h2>Transfers</h2>
          <p className="muted" id="resultsHint">
            {resultsHint}
          </p>
        </div>
        <div id="results" className="results-list">
          {transfers.map((transfer, index) => {
            const direction =
              transfer.direction === "in" || transfer.direction === "out"
                ? transfer.direction
                : "self";
            const directionLabel =
              direction === "in" ? "IN" : direction === "out" ? "OUT" : "SELF";
            const key = `${transfer.txHash}-${transfer.logIndex ?? index}`;
            const formattedValue = formatUnits(transfer.value, tokenDecimals);

            return (
              <article key={key} className="tx-card">
                <div className="tx-top">
                  <span className={`tx-direction ${direction}`}>
                    {directionLabel}
                  </span>
                  <span className="tx-hash">{transfer.txHash}</span>
                </div>
                <div className="tx-grid">
                  <div>
                    <div className="tx-label">Block</div>
                    <div className="tx-value">{transfer.blockNumber}</div>
                  </div>
                  <div>
                    <div className="tx-label">From</div>
                    <div className="tx-value">{transfer.from}</div>
                  </div>
                  <div>
                    <div className="tx-label">To</div>
                    <div className="tx-value">{transfer.to}</div>
                  </div>
                  <div>
                    <div className="tx-label">Amount</div>
                    <div className="tx-value">{formattedValue}</div>
                  </div>
                  <div>
                    <div className="tx-label">Raw</div>
                    <div className="tx-value">{String(transfer.value)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
