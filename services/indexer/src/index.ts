import "dotenv/config";
import pLimit from "p-limit";
import { ethers } from "ethers";
import { supabase } from "./db.js";
import { getRpcUrl } from "./chains.js";

const CHAIN = process.env.CHAIN!;
const CONFIRMATIONS = parseInt(process.env.CONFIRMATIONS ?? "1", 10);
const BLOCK_BATCH_SIZE = parseInt(process.env.BLOCK_BATCH_SIZE ?? "200", 10);
const POLL_MS = parseInt(process.env.POLL_MS ?? "4000", 10);

// ERC20 Transfer(address indexed from, address indexed to, uint256 value)
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

// Conservative chunk size for topics OR lists (providers vary)
const TOPIC_ADDR_CHUNK = 50;

// concurrency limit for RPC log calls
const limit = pLimit(4);

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function toLowerAddress(a: string) {
  return a.trim().toLowerCase();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function loadWatchlist(chain: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("watchlist_addresses")
    .select("address")
    .eq("chain", chain)
    .eq("is_active", true);

  if (error) throw error;
  return (data ?? []).map((r) => toLowerAddress(r.address));
}

async function getCursor(chain: string): Promise<number> {
  const { data, error } = await supabase
    .from("chain_cursors")
    .select("last_processed_block")
    .eq("chain", chain)
    .maybeSingle();

  if (error) throw error;
  return data?.last_processed_block ?? 0;
}

async function setCursor(chain: string, block: number) {
  const { error } = await supabase.from("chain_cursors").upsert(
    {
      chain,
      last_processed_block: block,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chain" }
  );

  if (error) throw error;
}

type TransferRow = {
  chain: string;
  block_number: number;
  block_hash: string;
  tx_hash: string;
  log_index: number;
  token_address: string;
  from_address: string;
  to_address: string;
  amount_raw: string;
};

function decodeTransferLog(log: ethers.Log): TransferRow {
  // topics[1] and topics[2] are indexed from/to
  const from = ethers
    .getAddress(ethers.dataSlice(log.topics[1], 12))
    .toLowerCase();
  const to = ethers
    .getAddress(ethers.dataSlice(log.topics[2], 12))
    .toLowerCase();

  // data is uint256 value
  const value = ethers.getBigInt(log.data).toString();

  return {
    chain: CHAIN,
    block_number: Number(log.blockNumber),
    block_hash: log.blockHash!,
    tx_hash: log.transactionHash!,
    log_index: Number(log.index),
    token_address: log.address.toLowerCase(),
    from_address: from,
    to_address: to,
    amount_raw: value,
  };
}

async function upsertTransfers(rows: TransferRow[]) {
  if (rows.length === 0) return;

  const { error } = await supabase
    .from("erc20_transfers")
    .upsert(rows, { onConflict: "chain,tx_hash,log_index" });

  if (error) throw error;
}

async function fetchLogsForBatch(
  provider: ethers.JsonRpcProvider,
  fromBlock: number,
  toBlock: number,
  watched: string[]
): Promise<ethers.Log[]> {
  if (watched.length === 0) return [];

  const addrChunks = chunk(watched, TOPIC_ADDR_CHUNK);

  // Query 1: to in watched
  const toQueries = addrChunks.map((toAddrs) =>
    limit(() =>
      provider.getLogs({
        fromBlock,
        toBlock,
        topics: [TRANSFER_TOPIC, null, toAddrs],
      })
    )
  );

  // Query 2: from in watched
  const fromQueries = addrChunks.map((fromAddrs) =>
    limit(() =>
      provider.getLogs({
        fromBlock,
        toBlock,
        topics: [TRANSFER_TOPIC, fromAddrs, null],
      })
    )
  );

  const results = await Promise.all([...toQueries, ...fromQueries]);
  // flatten + dedupe by tx_hash/log_index (since same log could match both if from/to watched)
  const all = results.flat();

  const seen = new Set<string>();
  const deduped: ethers.Log[] = [];
  for (const log of all) {
    const key = `${log.transactionHash}:${log.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(log);
  }
  return deduped;
}

async function main() {
  if (!CHAIN) throw new Error("Missing env CHAIN");

  const rpc = getRpcUrl(CHAIN);
  const provider = new ethers.JsonRpcProvider(rpc);

  console.log(`[indexer] chain=${CHAIN}`);

  while (true) {
    try {
      const watched = await loadWatchlist(CHAIN);
      const last = await getCursor(CHAIN);

      const latest = await provider.getBlockNumber();
      const target = latest - CONFIRMATIONS;

      if (target <= last) {
        await sleep(POLL_MS);
        continue;
      }

      let start = last + 1;
      while (start <= target) {
        const end = Math.min(start + BLOCK_BATCH_SIZE - 1, target);

        const logs = await fetchLogsForBatch(provider, start, end, watched);
        const rows = logs.map(decodeTransferLog);

        await upsertTransfers(rows);
        await setCursor(CHAIN, end);

        console.log(
          `[${CHAIN}] blocks ${start}-${end} logs=${logs.length} rows=${rows.length}`
        );

        start = end + 1;
      }
    } catch (e: any) {
      console.error(`[indexer] error:`, e?.message ?? e);
      // backoff
      await sleep(3000);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
