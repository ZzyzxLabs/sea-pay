import {
  randomBytes,
  hexlify,
  type TypedDataDomain,
  type TypedDataField,
  Wallet,
} from "ethers";

export type TransferWithAuthorization = {
  from: string;
  to: string;
  value: bigint;
  validAfter: bigint;
  validBefore: bigint;
  nonce: string;
};

export type EIP712Domain = {
  name: string;
  version: string;
  chainId: bigint | number;
  verifyingContract: string;
};

const TRANSFER_WITH_AUTHORIZATION_FIELDS: TypedDataField[] = [
  { name: "from", type: "address" },
  { name: "to", type: "address" },
  { name: "value", type: "uint256" },
  { name: "validAfter", type: "uint256" },
  { name: "validBefore", type: "uint256" },
  { name: "nonce", type: "bytes32" },
];

export const TRANSFER_WITH_AUTHORIZATION_TYPE = "TransferWithAuthorization";

export function buildDomain(domain: EIP712Domain): TypedDataDomain {
  return {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract,
  };
}

export function USDC_Domain(): EIP712Domain {
  return {
    name: "USD Coin",
    version: "2",
    chainId: 84532,
    verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  };
}

export function message_5_minutes(
  from: string,
  to: string,
  value: bigint
): TransferWithAuthorization {
  return {
    from: from,
    to: to,
    value: value,
    validAfter: 0n,
    validBefore: BigInt(Math.floor(Date.now() / 1000) + 300),
    nonce: hexlify(randomBytes(32)),
  };
}

export function buildTypes(): Record<string, TypedDataField[]> {
  return {
    [TRANSFER_WITH_AUTHORIZATION_TYPE]: TRANSFER_WITH_AUTHORIZATION_FIELDS,
  };
}

export function buildMessage(
  message: TransferWithAuthorization
): TransferWithAuthorization {
  return {
    ...message,
    value: BigInt(message.value),
    validAfter: BigInt(message.validAfter),
    validBefore: BigInt(message.validBefore),
  };
}

/**
 * Produce the parameters needed for EIP-712 signing (domain, types, message).
 */
export function buildTypedData(params: {
  domain: EIP712Domain;
  message: TransferWithAuthorization;
}): {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  message: TransferWithAuthorization;
} {
  return {
    domain: buildDomain(params.domain),
    types: buildTypes(),
    message: buildMessage(params.message),
  };
}

/**
 * Convenience helper to sign the ERC-3009 TransferWithAuthorization payload.
 * Requires an ethers Wallet (or Signer with signTypedData support).
 */
export async function signTransferWithAuthorization(
  wallet: Wallet,
  domain: EIP712Domain,
  message: TransferWithAuthorization
): Promise<string> {
  const typed = buildTypedData({ domain, message });
  return await wallet.signTypedData(typed.domain, typed.types, typed.message);
}
