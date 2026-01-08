/**
 * ERC-3009 TransferWithAuthorization message structure
 */
export type TransferWithAuthorization = {
  from: string;
  to: string;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: string; // bytes32 hex string
};

/**
 * ERC-3009 constants
 */
export const TRANSFER_WITH_AUTHORIZATION_TYPE = "TransferWithAuthorization";

/**
 * EIP-712 type fields for TransferWithAuthorization
 */
export const TRANSFER_WITH_AUTHORIZATION_FIELDS = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "validAfter", type: "uint256" },
  { name: "validBefore", type: "uint256" },
  { name: "nonce", type: "bytes32" },
] as const;
