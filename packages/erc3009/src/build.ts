import type {
  TransferWithAuthorization,
  EIP712Domain,
  TypedData,
} from "./types/index.js";
import { randomNonce } from "./utils.js";
import { resolveDomain } from "./domain.js";

/**
 * ERC-3009 TransferWithAuthorization type definition
 */
const TRANSFER_WITH_AUTHORIZATION_TYPE = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "validAfter", type: "uint256" },
  { name: "validBefore", type: "uint256" },
  { name: "nonce", type: "bytes32" },
];

/**
 * Build TransferWithAuthorization message
 */
export function buildMessage(params: {
  from: string;
  to: string;
  value: bigint;
  validAfter?: bigint;
  validBefore: bigint;
  nonce?: string;
}): TransferWithAuthorization {
  return {
    from: params.from,
    to: params.to,
    value: params.value,
    validAfter: params.validAfter ?? 0n,
    validBefore: params.validBefore,
    nonce: params.nonce ?? randomNonce(),
  };
}

/**
 * Build complete EIP-712 typed data for signing
 *
 * @param chainId - Chain ID (e.g. 8453 for Base)
 * @param token - Token symbol (e.g. "USDC") or contract address
 * @param message - TransferWithAuthorization message
 * @param domainOverrides - Optional domain parameter overrides for custom tokens
 */
export function buildTypedData(params: {
  chainId: number;
  token: string;
  message: TransferWithAuthorization;
  domainOverrides?: Partial<EIP712Domain>;
}): TypedData {
  const { chainId, token, message, domainOverrides } = params;

  // Resolve domain using the resolveDomain function
  const domain = resolveDomain(chainId, token, domainOverrides);

  return {
    domain,
    types: {
      TransferWithAuthorization: TRANSFER_WITH_AUTHORIZATION_TYPE,
    },
    message,
    primaryType: "TransferWithAuthorization",
  };
}
