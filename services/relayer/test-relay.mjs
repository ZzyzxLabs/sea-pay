#!/usr/bin/env node

/**
 * Test script for ERC-3009 Relayer Service
 *
 * Usage:
 *   node test-relay.mjs
 *
 * Environment variables:
 *   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
 *   TOKEN - Token contract address (default: USDC on Ethereum)
 *   TO - Recipient address
 *   VALUE - Amount to transfer (default: 1000000 = 1 USDC with 6 decimals)
 *   FROM_PK - Private key of the sender (required)
 */

import { Wallet, JsonRpcProvider } from "ethers";

const RELAY_BASE_URL = process.env.RELAY_BASE_URL || "http://localhost:3001";
const TOKEN = process.env.TOKEN || "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TO = process.env.TO || "0x8ba1f109551bD432803012645Hac136c22C3e0";
const VALUE = process.env.VALUE || "1000000";
const FROM_PK = process.env.FROM_PK;

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

    // 2. Get token domain
    console.log("2️⃣  Fetching token domain...");
    const domainRes = await fetch(
      `${RELAY_BASE_URL}/api/tokenDomain?token=${TOKEN}`
    );
    if (!domainRes.ok) {
      const error = await domainRes.json();
      throw new Error(`Failed to get domain: ${error.error}`);
    }
    const domain = await domainRes.json();
    console.log("✅ Domain:", JSON.stringify(domain, null, 2));
    console.log("");

    // 3. Create and sign authorization
    console.log("3️⃣  Creating signed authorization...");
    const wallet = new Wallet(FROM_PK);
    const from = wallet.address;
    console.log(`   From: ${from}`);

    // Calculate validity window (5 minutes from now)
    const now = BigInt(Math.floor(Date.now() / 1000));
    const validAfter = now;
    const validBefore = now + BigInt(300); // 5 minutes

    // Generate a random nonce (in production, use a proper nonce management system)
    const nonce =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

    const message = {
      from,
      to: TO,
      value: BigInt(VALUE),
      validAfter,
      validBefore,
      nonce,
    };

    const types = {
      TransferWithAuthorization: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "validAfter", type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    };

    const signature = await wallet.signTypedData(domain, types, message);
    console.log("✅ Signature created");
    console.log("");

    // 4. Relay the transaction
    console.log("4️⃣  Relaying transaction...");
    const relayPayload = {
      token: TOKEN,
      from,
      to: TO,
      value: VALUE,
      validAfter: validAfter.toString(),
      validBefore: validBefore.toString(),
      nonce,
      signature,
      domain,
    };

    const relayRes = await fetch(`${RELAY_BASE_URL}/api/relay`, {
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
