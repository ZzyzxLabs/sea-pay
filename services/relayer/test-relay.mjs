#!/usr/bin/env node

/**
 * Simple ERC-3009 Signature Test
 *
 * Tests the most basic case of creating an ERC-3009 (ERC-20 transferWithAuthorization) signature.
 * Logs all parameters and the resulting signature.
 *
 * Usage:
 *   node test-relay.mjs
 *
 * Environment variables:
 *   FROM_PK - Private key of the sender (required)
 *   RELAY_BASE_URL - Base URL of the relayer (default: http://localhost:3001)
 */

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

// Load root .env file if it exists
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
  // .env file doesn't exist, use defaults
}

const FROM_PK = process.env.FROM_PK;
const RELAY_BASE_URL = process.env.RELAY_BASE_URL || "http://localhost:3001";

if (!FROM_PK) {
  console.error("❌ Error: FROM_PK environment variable is required");
  console.error("Usage: FROM_PK=0xYourPrivateKey node test-relay.mjs");
  process.exit(1);
}

async function testSimpleERC3009Signature() {
  console.log("🧪 Simple ERC-3009 Signature Test\n");
  console.log("=".repeat(80));

  try {
    // Setup wallet
    console.log("\n📝 STEP 1: Setup Wallet");
    console.log("-".repeat(80));
    const privateKey = FROM_PK.startsWith("0x") ? FROM_PK : `0x${FROM_PK}`;
    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    console.log("Wallet Address:", account.address);

    // Define EIP-712 Domain
    console.log("\n📝 STEP 2: EIP-712 Domain Parameters");
    console.log("-".repeat(80));
    const domain = {
      name: "USDC",
      version: "2",
      chainId: 84532,
      verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    };
    console.log("Domain:", JSON.stringify(domain, null, 2));

    // Define Type Structure
    console.log("\n📝 STEP 3: EIP-712 Type Structure");
    console.log("-".repeat(80));
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
    console.log("Types:", JSON.stringify(types, null, 2));

    // Create Message
    console.log("\n📝 STEP 4: Message to Sign");
    console.log("-".repeat(80));
    const nonce = "0x" + randomBytes(32).toString("hex");
    const currentTime = Math.floor(Date.now() / 1000);
    const validBefore = BigInt(currentTime + 3600); // 1 hour from now

    const message = {
      from: account.address,
      to: "0x1A6F7CbBef2AAaBa5b6689d456d3585109018592",
      value: 1000n, // 0.001 USDC (6 decimals)
      validAfter: 0n,
      validBefore: validBefore,
      nonce: nonce,
    };

    console.log("Message:");
    console.log("  from:        ", message.from);
    console.log("  to:          ", message.to);
    console.log("  value:       ", message.value.toString(), "(0.001 USDC)");
    console.log("  validAfter:  ", message.validAfter.toString());
    console.log(
      "  validBefore: ",
      message.validBefore.toString(),
      `(${new Date(Number(validBefore) * 1000).toISOString()})`
    );
    console.log("  nonce:       ", message.nonce);

    // Sign the message
    console.log("\n📝 STEP 5: Sign the Message");
    console.log("-".repeat(80));
    console.log("Signing with wallet:", account.address);

    const signature = await client.signTypedData({
      domain,
      types,
      primaryType: "TransferWithAuthorization",
      message,
    });

    console.log("\n✅ SIGNATURE CREATED!");
    console.log("Signature:", signature);
    console.log("Length:", signature.length, "characters");

    // Split signature into v, r, s components (as the contract expects)
    console.log("\n📝 STEP 5b: Split Signature Components");
    console.log("-".repeat(80));
    const v = "0x" + signature.slice(130, 132);
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);

    console.log("Signature Components (for contract call):");
    console.log("  v:", v, `(${parseInt(v, 16)})`);
    console.log("  r:", r);
    console.log("  s:", s);

    // Show what will be sent to the contract
    console.log("\n📝 STEP 5c: Contract Function Call Parameters");
    console.log("-".repeat(80));
    console.log("transferWithAuthorization(");
    console.log("  from:        ", message.from);
    console.log("  to:          ", message.to);
    console.log("  value:       ", message.value.toString());
    console.log("  validAfter:  ", message.validAfter.toString());
    console.log("  validBefore: ", message.validBefore.toString());
    console.log("  nonce:       ", message.nonce);
    console.log("  v:           ", parseInt(v, 16));
    console.log("  r:           ", r);
    console.log("  s:           ", s);
    console.log(")");

    // Prepare relay payload
    console.log("\n📝 STEP 6: Prepare Relay Payload");
    console.log("-".repeat(80));
    const relayPayload = {
      token: domain.verifyingContract,
      from: message.from,
      to: message.to,
      value: message.value.toString(),
      validAfter: message.validAfter.toString(),
      validBefore: message.validBefore.toString(),
      nonce: message.nonce,
      signature: signature,
      domain: domain,
    };

    console.log("Relay Payload:", JSON.stringify(relayPayload, null, 2));

    // Send to relayer
    console.log("\n📝 STEP 7: Send to Relayer");
    console.log("-".repeat(80));
    console.log("Relayer URL:", `${RELAY_BASE_URL}/erc3009/relay`);

    const relayRes = await fetch(`${RELAY_BASE_URL}/erc3009/relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(relayPayload),
    });

    console.log("Response Status:", relayRes.status, relayRes.statusText);

    if (!relayRes.ok) {
      const error = await relayRes.json();
      console.error("\n❌ Relay Error:");
      console.error(JSON.stringify(error, null, 2));
      throw new Error(
        `Relay failed (${relayRes.status}): ${error.error}${
          error.details ? ` - ${error.details}` : ""
        }`
      );
    }

    const relayResult = await relayRes.json();
    console.log("\n✅ TRANSACTION RELAYED SUCCESSFULLY!");
    console.log("Result:", JSON.stringify(relayResult, null, 2));
    console.log("TX Hash:", relayResult.txHash);
    console.log(
      "Explorer:",
      `https://sepolia.basescan.org/tx/${relayResult.txHash}`
    );

    console.log("\n" + "=".repeat(80));
    console.log("🎉 TEST COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(80));
    console.error("Error:", error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testSimpleERC3009Signature();
