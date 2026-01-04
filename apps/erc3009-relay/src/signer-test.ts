import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { Wallet, verifyTypedData, randomBytes, TypedDataDomain } from "ethers";
import {
  message_5_minutes,
  buildTypedData,
  buildTypes,
  USDC_Domain,
} from "@seapay-ai/erc3009";

loadEnv({ path: resolve(process.cwd(), "..", "..", ".env") });
loadEnv();

type Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

async function main() {
  const relayBase = process.env.RELAY_BASE_URL || "http://localhost:3001";
  const token = required("TOKEN"); // token address (lower/upper OK)
  const to = required("TO"); // recipient
  const value = BigInt(process.env.VALUE || "100000"); // default 0.1 USDC (6 decimals)
  const pk = required("FROM_PK");

  const wallet = new Wallet(pk);
  console.log("Signer:", wallet.address);
  console.log("Relay base:", relayBase);
  console.log("Token:", token);
  console.log("To:", to);
  console.log("Value:", value);

  // 1) Fetch domain from relay (relay enforces allowlist)
  // const domain = (await httpGet(
  //   `${relayBase}/api/tokenDomain?token=${token}`
  // )) as Domain;
  // console.log("Domain:", domain);

  // Build message locally (no invoice): set validity window + nonce
  const domain = USDC_Domain();
  const message = message_5_minutes(wallet.address, to, value);
  const types = buildTypes();
  const typed = buildTypedData({ domain, message });

  // 3) Sign typed data (TransferWithAuthorization per ERC-3009)
  const signature = await wallet.signTypedData(domain, types, message);
  console.log("Signature:", signature);

  // Verify locally before sending
  const recovered = verifyTypedData(
    typed.domain as TypedDataDomain,
    types,
    typed.message,
    signature
  );
  console.log("Recovered:", recovered);
  if (recovered.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error("Signature did not recover signer");
  }

  // 4) Send to relay
  const relayResp = await httpPost(`${relayBase}/api/relay`, {
    token: token,
    from: wallet.address,
    to: message.to,
    value: message.value.toString(),
    validAfter: message.validAfter.toString(),
    validBefore: message.validBefore.toString(),
    nonce: message.nonce,
    signature,
    domain: typed.domain,
  });
  console.log("Relay response:", relayResp);
}

async function httpGet(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
  if (!res.ok)
    throw new Error(`GET ${url} failed ${res.status} ${await res.text()}`);
  return res.json();
}

async function httpPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`POST ${url} failed ${res.status} ${await res.text()}`);
  return res.json();
}

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env ${key}`);
  return v;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
