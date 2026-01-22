import { formatUnits, parseAbiItem } from "viem";
import { getPublicClient } from "./client";
import { ChainConfig } from "./chains";

export interface TransferEvent {
  id: string;
  amount: number;
  timestamp: number;
  direction: "in" | "out";
}

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

export async function getRecentUsdcTransfers(
  chain: ChainConfig,
  address: `0x${string}`,
  lookbackBlocks = 7200
) {
  const client = getPublicClient(chain);
  const latestBlock = await client.getBlockNumber();
  const fromBlock = latestBlock - BigInt(lookbackBlocks);

  const [sentLogs, receivedLogs] = await Promise.all([
    client.getLogs({
      address: chain.usdcAddress,
      event: transferEvent,
      fromBlock,
      toBlock: latestBlock,
      args: { from: address },
    }),
    client.getLogs({
      address: chain.usdcAddress,
      event: transferEvent,
      fromBlock,
      toBlock: latestBlock,
      args: { to: address },
    }),
  ]);

  const logs = [...sentLogs, ...receivedLogs];
  return logs.map((log) => ({
    id: `${log.transactionHash}-${log.logIndex}`,
    amount: Number(formatUnits(log.args.value ?? 0n, 6)),
    timestamp: Date.now(),
    direction:
      log.args.from?.toLowerCase() === address.toLowerCase() ? "out" : "in",
  }));
}
