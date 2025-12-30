import { JsonRpcProvider, Interface, getAddress } from "ethers";

const provider = new JsonRpcProvider(process.env.RPC_URL);

// ERC20 Transfer event
const ERC20_IFACE = new Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

interface TransferEvent {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: bigint;
}

interface PollTransfersParams {
  tokenAddress: string;
  toAddress: string;
  fromBlock: number;
  toBlock: number;
}

async function pollTransfers({
  tokenAddress,
  toAddress,
  fromBlock,
  toBlock,
}: PollTransfersParams): Promise<TransferEvent[]> {
  const transferEvent = ERC20_IFACE.getEvent("Transfer");
  if (!transferEvent) {
    throw new Error("Transfer event not found in ERC20 interface");
  }
  const transferTopic = transferEvent.topicHash;

  const logs = await provider.getLogs({
    address: tokenAddress,
    fromBlock,
    toBlock,
    topics: [
      transferTopic,
      null,
      // indexed "to" topic must be 32-byte padded address
      "0x" + "0".repeat(24) + getAddress(toAddress).slice(2).toLowerCase(),
    ],
  });

  return logs.map((log) => {
    const parsed = ERC20_IFACE.parseLog(log);
    if (!parsed) {
      throw new Error(`Failed to parse log: ${log.transactionHash}`);
    }
    return {
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
      from: parsed.args.from as string,
      to: parsed.args.to as string,
      value: parsed.args.value as bigint,
    };
  });
}

async function workerLoop() {
  const startBlock = Number(process.env.START_BLOCK ?? 0);
  let lastBlock = startBlock;
  const batchSize = Number(process.env.BATCH_SIZE ?? 2000);
  const pollInterval = Number(process.env.POLL_INTERVAL_MS ?? 2000);

  const tokenAddress = process.env.USDC_ADDRESS;
  const depositAddress = process.env.DEPOSIT_ADDRESS;

  if (!tokenAddress) {
    throw new Error("USDC_ADDRESS environment variable is required");
  }
  if (!depositAddress) {
    throw new Error("DEPOSIT_ADDRESS environment variable is required");
  }
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL environment variable is required");
  }

  console.log("Starting indexer worker loop...");
  console.log({
    tokenAddress,
    depositAddress,
    startBlock,
    batchSize,
    pollInterval,
  });

  while (true) {
    try {
      const latest = await provider.getBlockNumber();
      if (lastBlock >= latest) {
        await new Promise((r) => setTimeout(r, pollInterval));
        continue;
      }

      const fromBlock = lastBlock + 1;
      const toBlock = Math.min(latest, fromBlock + batchSize);

      console.log(`Polling blocks ${fromBlock} to ${toBlock}...`);

      const transfers = await pollTransfers({
        tokenAddress,
        toAddress: depositAddress,
        fromBlock,
        toBlock,
      });

      for (const transfer of transfers) {
        // TODO: look up matching session by depositAddress + tokenAddress
        // TODO: compare amount >= requiredAmount
        // TODO: mark session PAID with txHash, paidAmount
        console.log("Detected transfer:", {
          txHash: transfer.txHash,
          blockNumber: transfer.blockNumber,
          from: transfer.from,
          to: transfer.to,
          value: transfer.value.toString(),
        });
      }

      lastBlock = toBlock;
      // TODO: Persist lastBlock in DB/Redis so restarts are safe

      if (transfers.length > 0) {
        console.log(`Found ${transfers.length} transfer(s) in this batch`);
      }
    } catch (error) {
      console.error("Error in worker loop:", error);
      // Wait before retrying on error
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  }
}

export function startPolling() {
  console.log("Indexer started");
  workerLoop().catch((error) => {
    console.error("Fatal error in worker loop:", error);
    process.exit(1);
  });
}
