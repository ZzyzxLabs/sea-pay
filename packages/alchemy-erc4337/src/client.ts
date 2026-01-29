import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { chain, getTransport, policyId } from "./config.js";
import { LocalAccountSigner } from "@aa-sdk/core";
import { generatePrivateKey } from "viem/accounts";

export async function createClient() {
  return createModularAccountV2Client({
    chain,
    transport: getTransport(),
    signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    policyId,
  });
}
