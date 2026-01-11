import type { TypedDataDomain, TypedDataField } from "ethers";

/**
 * ERC-3009 TransferWithAuthorization message
 */
export interface TransferWithAuthorization {
  from: string;
  to: string;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: string; // bytes32 as hex string
}

/**
 * EIP-712 Domain
 */
export type EIP712Domain = TypedDataDomain;

/**
 * Token configuration
 */
export interface TokenConfig {
  symbol: string;
  chainId: number;
  address: string;
  name: string; // EIP-712 domain name
  version: string; // EIP-712 domain version
  decimals: number;
}

/**
 * Chain configuration
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  testnet: boolean;
}

/**
 * Complete EIP-712 typed data structure
 */
export interface TypedData {
  domain: EIP712Domain;
  types: Record<string, TypedDataField[]>;
  message: TransferWithAuthorization;
  primaryType: string;
}
