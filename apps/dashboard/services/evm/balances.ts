import { formatUnits } from "viem";
import { getPublicClient } from "./client";
import { ChainConfig } from "./chains";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

export interface EvmBalances {
  native: number;
  usdc: number;
}

export async function getNativeBalance(chain: ChainConfig, address: `0x${string}`) {
  const client = getPublicClient(chain);
  const balance = await client.getBalance({ address });
  return Number(formatUnits(balance, 18));
}

export async function getUsdcBalance(chain: ChainConfig, address: `0x${string}`) {
  const client = getPublicClient(chain);
  const balance = await client.readContract({
    address: chain.usdcAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });
  return Number(formatUnits(balance, 6));
}
