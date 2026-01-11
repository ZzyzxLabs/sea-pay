import { TypedDataEncoder, verifyTypedData } from "ethers";
import type {
  TransferWithAuthorization,
  EIP712Domain,
} from "./types/index.js";

/**
 * ERC-3009 type definition for signature recovery
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
 * Recover the signer address from a signature
 */
export function recoverSigner(
  domain: EIP712Domain,
  message: TransferWithAuthorization,
  signature: string
): string {
  return verifyTypedData(
    domain,
    { TransferWithAuthorization: TRANSFER_WITH_AUTHORIZATION_TYPE },
    message,
    signature
  );
}

/**
 * Verify that a signature was created by the expected signer
 */
export function verifySignature(
  domain: EIP712Domain,
  message: TransferWithAuthorization,
  signature: string,
  expectedSigner: string
): boolean {
  try {
    const recovered = recoverSigner(domain, message, signature);
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Get the EIP-712 hash for a message (useful for debugging)
 */
export function getMessageHash(
  domain: EIP712Domain,
  message: TransferWithAuthorization
): string {
  return TypedDataEncoder.hash(
    domain,
    { TransferWithAuthorization: TRANSFER_WITH_AUTHORIZATION_TYPE },
    message
  );
}
