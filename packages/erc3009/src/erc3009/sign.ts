import type { Wallet } from "ethers";
import type { EIP712Domain, TransferWithAuthorization } from "../types/index.js";
import { buildTypedData } from "./typedData.js";

/**
 * Sign a TransferWithAuthorization message with an ethers Wallet
 */
export async function signTransferWithAuthorization(
  wallet: Wallet,
  domain: EIP712Domain,
  message: TransferWithAuthorization
): Promise<string> {
  const typed = buildTypedData({ domain, message });
  return await wallet.signTypedData(typed.domain, typed.types, typed.message);
}

