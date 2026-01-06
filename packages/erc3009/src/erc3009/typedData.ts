import type { TypedDataDomain, TypedDataField } from "ethers";
import type {
  TransferWithAuthorization,
  EIP712Domain,
} from "../types/index.js";
import { buildTypes } from "./buildTypes.js";

export type TypedData = {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  message: TransferWithAuthorization;
};

/**
 * Build complete typed data structure for EIP-712 signing
 */
export function buildTypedData(params: {
  domain: EIP712Domain;
  message: TransferWithAuthorization;
}): TypedData {
  return {
    domain: {
      name: params.domain.name,
      version: params.domain.version,
      chainId: params.domain.chainId,
      verifyingContract: params.domain.verifyingContract,
    },
    types: buildTypes(),
    message: {
      ...params.message,
      value: BigInt(params.message.value),
      validAfter: BigInt(params.message.validAfter),
      validBefore: BigInt(params.message.validBefore),
    },
  };
}

