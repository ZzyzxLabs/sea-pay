import type { TransferWithAuthorization } from "../types/erc3009.js";
import { randomNonce } from "../utils/nonce.js";
import { nowPlusSeconds, toBigInt } from "../utils/time.js";

export type BuildMessageParams = {
  from: string;
  to: string;
  value: bigint | number | string;
  validAfter?: bigint | number | string;
  validBefore?: bigint | number | string;
  nonce?: string;
};

/**
 * Build a TransferWithAuthorization message
 */
export function buildMessage(
  params: BuildMessageParams
): TransferWithAuthorization {
  return {
    from: params.from,
    to: params.to,
    value: toBigInt(params.value),
    validAfter: params.validAfter ? toBigInt(params.validAfter) : 0n,
    validBefore: params.validBefore
      ? toBigInt(params.validBefore)
      : nowPlusSeconds(300), // default: 5 minutes
    nonce: params.nonce || randomNonce(),
  };
}

/**
 * Build message with explicit time window (in seconds)
 * @param ttlSeconds - time-to-live in seconds (default: 300 = 5 minutes)
 */
export function buildMessageWithTTL(
  params: Omit<BuildMessageParams, "validAfter" | "validBefore"> & {
    ttlSeconds?: number;
  }
): TransferWithAuthorization {
  const ttl = params.ttlSeconds ?? 300;
  return buildMessage({
    ...params,
    validAfter: 0,
    validBefore: nowPlusSeconds(ttl),
  });
}

