import type {
  EIP712Domain,
  TransferWithAuthorization,
  ResolveDomainParams,
} from "../types/index.js";
import type { TypedData } from "../erc3009/typedData.js";
import { resolveDomain } from "../domain/resolveDomain.js";
import { buildMessageWithTTL } from "../erc3009/message.js";
import { buildTypedData } from "../erc3009/typedData.js";
import { randomNonce } from "../utils/nonce.js";

export type PrepareParams = {
  // Domain resolution
  chainId: number;
  token: string; // symbol or address
  name?: string; // override
  version?: string; // override
  verifyingContract?: string; // override

  // Message params
  from: string;
  to: string;
  value: bigint | number | string;
  ttlSeconds?: number; // default: 300 (5 minutes)
  nonce?: string; // default: random
  validAfter?: bigint | number | string; // default: 0
  validBefore?: bigint | number | string; // default: now + ttlSeconds
};

export type PrepareResult = {
  domain: EIP712Domain;
  message: TransferWithAuthorization;
  typedData: TypedData;
};

/**
 * One-call convenience helper to prepare complete ERC-3009 typed data
 * 
 * This resolves the domain from registry, builds the message with time window,
 * and returns everything needed for signing.
 * 
 * @example
 * ```ts
 * const { domain, message, typedData } = prepare({
 *   chainId: 8453,
 *   token: "USDC",
 *   from: "0x...",
 *   to: "0x...",
 *   value: 1000000n, // 1 USDC (6 decimals)
 *   ttlSeconds: 300, // 5 minutes
 * });
 * 
 * const signature = await wallet.signTypedData(
 *   typedData.domain,
 *   typedData.types,
 *   typedData.message
 * );
 * ```
 */
export function prepare(params: PrepareParams): PrepareResult {
  // Resolve domain
  const domainParams: ResolveDomainParams = {
    chainId: params.chainId,
    token: params.token,
    name: params.name,
    version: params.version,
    verifyingContract: params.verifyingContract,
  };
  const domain = resolveDomain(domainParams);

  // Build message
  const message = buildMessageWithTTL({
    from: params.from,
    to: params.to,
    value: params.value,
    ttlSeconds: params.ttlSeconds,
    nonce: params.nonce ?? randomNonce(),
  });

  // Override time window if explicitly provided
  if (params.validAfter !== undefined) {
    message.validAfter = BigInt(params.validAfter);
  }
  if (params.validBefore !== undefined) {
    message.validBefore = BigInt(params.validBefore);
  }

  // Build typed data
  const typedData = buildTypedData({ domain, message });

  return { domain, message, typedData };
}

