#!/usr/bin/env node

/**
 * Test script for ERC-3009 Relayer Service
 *
 * Uses @seapay-ai/erc3009 package for EIP-712 signing utilities.
 *
 * Usage:
 *   node test-relay.mjs
 *
 * Environment variables:
 *   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
 *   TOKEN - Token contract address (default: USDC on Base Sepolia)
 *   TO - Recipient address
 *   VALUE - Amount to transfer (default: 1000000 = 1 USDC with 6 decimals)
 *   FROM_PK - Private key of the sender (required)
 *   USE_USDC_DOMAIN - Set to "true" to use USDC_Domain() helper (default: false)
 *   CHAIN_ID - Chain ID (default: 84532 for Base Sepolia)
 *   TOKEN_NAME - Token name (default: "USD Coin")
 *   TOKEN_VERSION - Token version (default: "2")
 */

import { Wallet, verifyTypedData } from "ethers";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  USDC_Domain,
  message_5_minutes,
  buildTypedData,
  buildTypes,
} from "@seapay-ai/erc3009";

// Load root .env file if it exists (monorepo root is two levels up)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnv = resolve(__dirname, "../../.env");

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
  // .env file doesn't exist or can't be read, use defaults
}

const RELAY_BASE_URL = process.env.RELAY_BASE_URL || "http://localhost:3001";
const TOKEN = process.env.TOKEN || "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC on Base Sepolia
const TO = process.env.TO || "0x8ba1f109551bD432803012645Hac136c22C3e0";
const VALUE = process.env.VALUE || "100000"; // 0.1 USDC (6 decimals)
const FROM_PK = process.env.FROM_PK;
const CHAIN_ID = parseInt(process.env.CHAIN_ID || "84532", 10); // Base Sepolia
const TOKEN_NAME = process.env.TOKEN_NAME || "USD Coin";
const TOKEN_VERSION = process.env.TOKEN_VERSION || "2";

if (!FROM_PK) {
  console.error("Error: FROM_PK environment variable is required");
  console.error("Usage: FROM_PK=0xYourPrivateKey node test-relay.mjs");
  process.exit(1);
}

async function testRelayer() {
  console.log("🧪 Testing ERC-3009 Relayer Service");
  console.log(`Relay URL: ${RELAY_BASE_URL}`);
  console.log(`Token: ${TOKEN}`);
  console.log(`To: ${TO}`);
  console.log(`Value: ${VALUE}`);
  console.log("");

  try {
    // 1. Health check
    console.log("1️⃣  Checking health...");
    const healthRes = await fetch(`${RELAY_BASE_URL}/health`);
    const health = await healthRes.json();
    console.log("✅ Health:", health);
    console.log("");

    // 2. Build domain and create signed authorization
    console.log("2️⃣  Creating signed authorization...");
    const wallet = new Wallet(FROM_PK);
    const from = wallet.address;
    console.log(`   From: ${from}`);

    // Build EIP-712 domain - use USDC_Domain() helper or build custom domain
    const domain =
      process.env.USE_USDC_DOMAIN === "true"
        ? USDC_Domain()
        : {
            name: TOKEN_NAME,
            version: TOKEN_VERSION,
            chainId: CHAIN_ID,
            verifyingContract: TOKEN.toLowerCase(),
          };

    console.log(`   Domain: ${JSON.stringify(domain)}`);

    // Create message with 5-minute validity window using package helper
    const value = BigInt(VALUE);
    const message = message_5_minutes(from, TO, value);

    console.log(
      `   Message: ${JSON.stringify({
        ...message,
        value: message.value.toString(),
        validAfter: message.validAfter.toString(),
        validBefore: message.validBefore.toString(),
      })}`
    );

    // Sign typed data (TransferWithAuthorization per ERC-3009)
    // Use buildTypedData to ensure the domain/message are in the exact format the contract expects
    const typed = buildTypedData({ domain, message });
    const signature = await wallet.signTypedData(
      typed.domain,
      typed.types,
      typed.message
    );
    console.log("✅ Signature created");
    console.log(`   Signature: ${signature}`);

    // Verify locally before sending
    const recovered = verifyTypedData(
      typed.domain,
      typed.types,
      typed.message,
      signature
    );
    console.log(`   Recovered: ${recovered}`);
    if (recovered.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error("Signature did not recover signer");
    }
    console.log("✅ Signature verified locally");
    console.log("");

    // 3. Relay the transaction
    console.log("3️⃣  Relaying transaction...");

    // Use typed.domain (TypedDataDomain format) for relay payload
    // This matches what the server expects and what was used for verification
    const relayPayload = {
      token: TOKEN,
      from: wallet.address,
      to: message.to,
      value: message.value.toString(),
      validAfter: message.validAfter.toString(),
      validBefore: message.validBefore.toString(),
      nonce: message.nonce,
      signature,
      domain: typed.domain, // Must use TypedDataDomain format, not EIP712Domain
    };

    const relayRes = await fetch(`${RELAY_BASE_URL}/base/relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(relayPayload),
    });

    if (!relayRes.ok) {
      const error = await relayRes.json();
      throw new Error(`Relay failed: ${error.error}`);
    }

    const relayResult = await relayRes.json();
    console.log("✅ Transaction relayed!");
    console.log(`   TX Hash: ${relayResult.txHash}`);
    console.log("");

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testRelayer();
