#!/usr/bin/env node
/**
 * Simple Solana devnet relay test using @solana/kit:
 * - Builds a transfer transaction with fee payer
 * - Signs with local keypair
 * - Sends to relay backend
 */
import path from "path";
import dotenv from "dotenv";
import bs58 from "bs58";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  createKeyPairSignerFromBytes,
  getSignatureFromTransaction,
  pipe,
  appendTransactionMessageInstructions,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  getTransferInstruction,
  TOKEN_PROGRAM_ADDRESS,
  fetchToken,
} from "@solana-program/token";
import { clusterApiUrl } from "@solana/web3.js";

// Load env from service and monorepo root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

const RELAY_URL =
  process.env.SOLANA_RELAY_URL || "http://localhost:3001/solana/relay";
const USE_KORA = process.env.SOLANA_USE_KORA === "true";
const KORA_URL =
  process.env.SOLANA_KORA_URL || "http://localhost:3001/solana/kora";
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const WS_URL = process.env.SOLANA_WS_URL || RPC_URL.replace("http", "ws");

const rpc = createSolanaRpc(RPC_URL);
const rpcSubscriptions = createSolanaRpcSubscriptions(WS_URL);

function requiredEnv(key) {
  const v = process.env[key];
  if (!v) {
    throw new Error(`Missing required env ${key}`);
  }
  return v;
}

async function loadKeypairSigner(envKey) {
  const secret = requiredEnv(envKey);
  return await createKeyPairSignerFromBytes(bs58.decode(secret));
}

async function main() {
  const sender = await loadKeypairSigner("SOLANA_TEST_SENDER_SECRET");
  const recipientAddress = requiredEnv("SOLANA_TEST_RECIPIENT");
  const mintAddress = requiredEnv("SOLANA_SPL_MINT");
  const amount = BigInt(
    process.env.SOLANA_SPL_AMOUNT || requiredEnv("SOLANA_SPL_AMOUNT")
  );

  const endpoint = USE_KORA ? KORA_URL : RELAY_URL;
  const mode = USE_KORA ? "Kora (gasless)" : "Fee Payer";

  console.log("RPC URL:       ", RPC_URL);
  console.log("Endpoint:      ", endpoint);
  console.log("Mode:          ", mode);
  console.log("Sender:        ", sender.address.toString());
  console.log("Recipient:     ", recipientAddress);
  console.log("Mint:          ", mintAddress);
  console.log("Amount (raw):  ", amount.toString());

  // Get fee payer address if using fee payer mode
  let feePayerAddress = null;
  if (!USE_KORA) {
    try {
      const feePayerResp = await fetch(
        (
          process.env.SOLANA_RELAY_URL || "http://localhost:3001/solana/relay"
        ).replace("/solana/relay", "/solana/fee-payer")
      );
      if (feePayerResp.ok) {
        const feePayerData = await feePayerResp.json();
        feePayerAddress = feePayerData.feePayer;
        console.log("Fee Payer:     ", feePayerAddress);
      }
    } catch (err) {
      console.warn(
        "Could not fetch fee payer, transaction may fail:",
        err.message
      );
    }
  }

  // Derive ATAs
  const [fromAta] = await findAssociatedTokenPda({
    mint: mintAddress,
    owner: sender.address,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  const [toAta] = await findAssociatedTokenPda({
    mint: mintAddress,
    owner: recipientAddress,
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });

  // Validate source account has balance
  const fromAccount = await fetchToken(rpc, fromAta, {
    commitment: "confirmed",
  });
  if (fromAccount.data.amount < amount) {
    throw new Error(
      `Insufficient token balance: have ${fromAccount.data.amount}, need ${amount}`
    );
  }

  // Get latest blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // Create transfer instruction
  const transferInstruction = getTransferInstruction({
    source: fromAta,
    destination: toAta,
    authority: sender.address,
    amount: amount,
  });

  // Build transaction message
  // For fee payer mode: Use sender as fee payer in message
  // The backend will add the fee payer's signature if needed
  // Note: setTransactionMessageFeePayerSigner expects a signer object, not an address string
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(sender, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
  );

  // If using fee payer mode and we have the fee payer address,
  // we need to ensure it's in the required signers list
  // For @solana/kit v5, we need to add the fee payer to the accountKeys
  // But since we don't have the fee payer's private key, we'll let the backend handle it
  // The transaction will be built with sender as fee payer, and backend will co-sign

  // Sign transaction with sender (fee payer will be added by backend if using fee payer mode)
  const signedTransaction = await signTransactionMessageWithSigners(
    transactionMessage,
    [sender]
  );

  // Serialize transaction - @solana/kit signed transactions have a bytes property
  const serialized = signedTransaction.bytes;
  const base64Tx = Buffer.from(serialized).toString("base64");

  const requestBody = {
    transaction: base64Tx,
    waitForConfirmation: true,
    rpcUrl: RPC_URL,
  };

  // Add koraSigner if using Kora and provided
  if (USE_KORA && process.env.KORA_SIGNER_ADDRESS) {
    requestBody.koraSigner = process.env.KORA_SIGNER_ADDRESS;
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("Relay failed:", data);
    process.exit(1);
  }

  console.log("Relay response:", data);
  console.log(
    `Explorer: https://explorer.solana.com/tx/${data.signature}?cluster=devnet`
  );
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
