import { verifyTypedData } from "ethers";
import type { EIP712Domain, TransferWithAuthorization } from "../types/index.js";
import { buildTypes } from "./buildTypes.js";
import { normalizeAddress } from "../utils/hex.js";

/**
 * Recover the signer address from a signature
 */
export function recoverSigner(
  domain: EIP712Domain,
  message: TransferWithAuthorization,
  signature: string
): string {
  const types = buildTypes();
  return verifyTypedData(domain, types, message, signature);
}

/**
 * Verify that a signature was signed by the expected address
 */
export function verifySignature(
  domain: EIP712Domain,
  message: TransferWithAuthorization,
  signature: string,
  expectedSigner: string
): boolean {
  const recovered = recoverSigner(domain, message, signature);
  return (
    normalizeAddress(recovered) === normalizeAddress(expectedSigner)
  );
}

