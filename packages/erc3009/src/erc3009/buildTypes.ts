import type { TypedDataField } from "ethers";
import {
  TRANSFER_WITH_AUTHORIZATION_TYPE,
  TRANSFER_WITH_AUTHORIZATION_FIELDS,
} from "./constants.js";

/**
 * Build EIP-712 types object for ERC-3009
 */
export function buildTypes(): Record<string, TypedDataField[]> {
  return {
    [TRANSFER_WITH_AUTHORIZATION_TYPE]: [
      ...TRANSFER_WITH_AUTHORIZATION_FIELDS,
    ],
  };
}

