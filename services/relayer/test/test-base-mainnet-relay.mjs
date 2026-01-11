#!/usr/bin/env node

/**
 * ERC-3009 Relay Test for Base Mainnet
 *
 * Tests ERC-3009 (ERC-20 transferWithAuthorization) signature creation and relay
 * using the @seapay-ai/erc3009 package.
 *
 * Usage:
 *   node test/test-base-mainnet-relay.mjs
 *
 * Environment variables:
 *   FROM_PK - Private key of the sender (required)
 *   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
 *   TO_ADDRESS - Recipient address (default: 0x1A6F7CbBef2AAaBa5b6689d456d3585109018592)
 *   VALUE - Amount in smallest unit (default: 1000000 = 1 USDC)
 */

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  buildMessage,
  buildTypedData,
  nowPlusSeconds,
} from "@seapay-ai/erc3009";

// Load root .env file if it exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnv = resolve(__dirname, "../../../.env");

try {
  const envContent = readFileSync(rootEnv, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (err) {
  // .env file doesn't exist, use defaults
}

const FROM_PK = process.env.FROM_PK;
const RELAY_BASE_URL = process.env.RELAY_BASE_URL || "http://localhost:3001";
const TO_ADDRESS =
  process.env.TO_ADDRESS || "0x1A6F7CbBef2AAaBa5b6689d456d3585109018592";
const VALUE = process.env.VALUE ? BigInt(process.env.VALUE) : 1000000n; // 1 USDC

// Base Mainnet chain configuration
const CHAIN_ID = 8453;
const CHAIN_NAME = "Base Mainnet";
const EXPLORER_BASE = "https://basescan.org";

if (!FROM_PK) {
  console.error("❌ Error: FROM_PK environment variable is required");
  console.error(
    "Usage: FROM_PK=0xYourPrivateKey node test/test-base-mainnet-relay.mjs"
  );
  process.exit(1);
}

async function testERC3009Relay() {
  console.log(`🧪 ERC-3009 Relay Test - ${CHAIN_NAME}\n`);

  try {
    // Setup wallet
    const privateKey = FROM_PK.startsWith("0x") ? FROM_PK : `0x${FROM_PK}`;
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    console.log(`Wallet: ${account.address}`);
    console.log(`Chain: ${CHAIN_NAME} (${CHAIN_ID})\n`);

    // Build message and typed data
    const message = buildMessage({
      from: account.address,
      to: TO_ADDRESS,
      value: VALUE,
      validAfter: 0n,
      validBefore: nowPlusSeconds(3600),
    });

    const typedData = buildTypedData({
      chainId: CHAIN_ID,
      token: "USDC",
      message,
    });

    console.log("📝 Transfer Details:");
    console.log(`  From: ${message.from}`);
    console.log(`  To: ${message.to}`);
    console.log(`  Value: ${message.value.toString()} (1 USDC)`);
    console.log(
      `  Valid Until: ${new Date(
        Number(message.validBefore) * 1000
      ).toISOString()}`
    );
    console.log(`  Nonce: ${message.nonce}\n`);

    // Sign the message
    console.log("🔐 Signing...");
    const signature = await client.signTypedData({
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });

    const v = parseInt("0x" + signature.slice(130, 132), 16);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    console.log(`✅ Signature created (v=${v})\n`);

    // Prepare and send relay payload
    // Convert bigint values to strings for JSON serialization
    const relayPayload = {
      typedData: {
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: {
          from: typedData.message.from,
          to: typedData.message.to,
          value: typedData.message.value.toString(),
          validAfter: typedData.message.validAfter.toString(),
          validBefore: typedData.message.validBefore.toString(),
          nonce: typedData.message.nonce,
        },
      },
      signature: signature,
    };

    console.log(`📤 Sending to relayer: ${RELAY_BASE_URL}/erc3009/relay`);
    const relayRes = await fetch(`${RELAY_BASE_URL}/erc3009/relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(relayPayload),
    });

    if (!relayRes.ok) {
      const error = await relayRes.json();
      throw new Error(
        `Relay failed (${relayRes.status}): ${error.error}${
          error.details ? ` - ${error.details}` : ""
        }`
      );
    }

    const relayResult = await relayRes.json();
    console.log(`✅ Transaction relayed successfully!`);
    console.log(`TX Hash: ${relayResult.txHash}`);
    console.log(`Explorer: ${EXPLORER_BASE}/tx/${relayResult.txHash}\n`);
    console.log("🎉 Test completed successfully!");
  } catch (error) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testERC3009Relay();
