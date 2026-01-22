import { createPublicClient, http } from "viem";
import { ChainConfig } from "./chains";

const clientCache = new Map<string, ReturnType<typeof createPublicClient>>();

export function getPublicClient(chain: ChainConfig) {
  if (clientCache.has(chain.key)) {
    return clientCache.get(chain.key)!;
  }
  const client = createPublicClient({
    transport: http(chain.rpcUrl),
  });
  clientCache.set(chain.key, client);
  return client;
}
