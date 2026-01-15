import express, { type Request, type Response } from "express";
import cors from "cors";
import { Contract, Signature } from "ethers";
import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";
import { KoraClient } from "@solana/kora";
import {
  verifySignature,
  registry,
  type EIP712Domain,
  type TransferWithAuthorization,
} from "@seapay-ai/erc3009";
import {
  ERC3009_ABI,
  ERC20_ABI,
  SUPPORTED_CHAINS,
  isAllowedToken,
} from "./config.js";
import {
  getProvider,
  getRelayer,
  getRpcUrl,
  isSupportedChain,
  initializeChains,
} from "./providers.js";
import { normalizeAddress, nonceKey } from "./utils.js";

console.log("cwd:", process.cwd());
console.log("PORT:", process.env.PORT);

// --- Solana relay defaults ---
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
const SOLANA_WS_URL =
  process.env.SOLANA_WS_URL || SOLANA_RPC_URL.replace("http", "ws");
const SOLANA_FEE_PAYER_SECRET = process.env.SOLANA_FEE_PAYER_SECRET || "";
const solanaFeePayerKeypair = SOLANA_FEE_PAYER_SECRET
  ? Keypair.fromSecretKey(bs58.decode(SOLANA_FEE_PAYER_SECRET))
  : null;
const solanaConnection = new Connection(SOLANA_RPC_URL, "confirmed");
const koraClient = process.env.KORA_RPC_URL
  ? new KoraClient({ rpcUrl: process.env.KORA_RPC_URL })
  : null;

const app = express();

// CORS configuration - must be before routes
app.use(
  cors({
    origin: [
      "https://seapay.ai",
      "https://app.seapay.ai",
      "https://sea-pay-app.vercel.app",
      /^https:\/\/.*\.seapay\.ai$/,
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-API-Key",
    ],
    credentials: false,
  })
);

// JSON body parser - must be after CORS
app.use(express.json());

const usedNonces = new Set<string>(); // key: chainId|token|from|nonce

// Initialize and log supported chains
initializeChains();

function decodeSolanaTransaction(encoded: string): Uint8Array {
  // Accept base64 (preferred) or bs58 inputs
  try {
    return Buffer.from(encoded, "base64");
  } catch {
    // fallback to bs58
    return bs58.decode(encoded);
  }
}

function deserializeSolanaTransaction(
  raw: Uint8Array
): VersionedTransaction | Transaction {
  try {
    return VersionedTransaction.deserialize(raw);
  } catch {
    return Transaction.from(raw);
  }
}

/**
 * GET /api/tokenDomain?token=<address>&chainId=<chainId>
 *
 * Returns the EIP-712 domain for a token.
 * - First checks registry for known tokens
 * - Falls back to querying on-chain name() and version()
 */
app.get("/api/tokenDomain", async (req: Request, res: Response) => {
  try {
    const tokenAddress = String(req.query.token || "");
    if (!tokenAddress) {
      return res.status(400).json({ error: "token query parameter required" });
    }

    const chainIdParam = req.query.chainId;
    if (!chainIdParam) {
      return res
        .status(400)
        .json({ error: "chainId query parameter required" });
    }

    const chainId = Number(chainIdParam);
    if (!isSupportedChain(chainId)) {
      return res.status(400).json({ error: `unsupported chain: ${chainId}` });
    }

    const normalized = normalizeAddress(tokenAddress);
    if (!isAllowedToken(normalized, chainId)) {
      return res.status(400).json({ error: "token not allowed" });
    }

    // Try registry first - check all known tokens
    for (const symbol of ["USDC"]) {
      const tokenConfig = registry.getToken(symbol, chainId);
      if (tokenConfig) {
        const tokenAddr = (tokenConfig as any).address;
        if (tokenAddr && normalizeAddress(tokenAddr) === normalized) {
          const domain: EIP712Domain = {
            name: tokenConfig.name,
            version: tokenConfig.version,
            chainId: tokenConfig.chainId,
            verifyingContract: tokenAddr,
          };
          return res.json(domain);
        }
      }
    }

    // Fall back to on-chain query
    const provider = getProvider(chainId);
    const erc20 = new Contract(normalized, ERC20_ABI, provider);
    let name = "Token";
    let version = "1";

    try {
      name = await erc20.name();
    } catch {
      /* ignore */
    }
    try {
      version = await erc20.version();
    } catch {
      /* ignore; default stays "1" */
    }

    const domain: EIP712Domain = {
      name,
      version,
      chainId,
      verifyingContract: normalized,
    };

    return res.json(domain);
  } catch (err: any) {
    console.error("Error in /api/tokenDomain:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /erc3009/relay
 *
 * Relays an ERC-3009 TransferWithAuthorization transaction.
 * Extracts chain ID from typedData.domain.chainId and uses the appropriate RPC endpoint.
 *
 * Request body:
 * - typedData: Complete EIP-712 typed data object containing:
 *   - domain: EIP-712 domain (must include chainId)
 *   - types: Type definitions
 *   - message: TransferWithAuthorization message
 *   - primaryType: "TransferWithAuthorization"
 * - signature: EIP-712 signature
 */
app.post("/erc3009/relay", async (req: Request, res: Response) => {
  try {
    const { typedData, signature } = req.body || {};

    // Validate required fields
    if (!typedData || !signature) {
      return res.status(400).json({ error: "missing typedData or signature" });
    }

    // Validate typedData structure
    if (
      !typedData.domain ||
      !typedData.message ||
      !typedData.types ||
      !typedData.primaryType
    ) {
      return res.status(400).json({ error: "invalid typedData structure" });
    }

    // Extract domain and message from typedData
    const domain = typedData.domain as EIP712Domain;
    const message = typedData.message as TransferWithAuthorization;

    // Extract chain ID from domain
    if (!domain.chainId) {
      return res.status(400).json({ error: "domain missing chainId" });
    }

    const chainId = Number(domain.chainId);
    if (!isSupportedChain(chainId)) {
      return res.status(400).json({ error: `unsupported chain: ${chainId}` });
    }

    // Validate domain
    if (!domain.verifyingContract) {
      return res
        .status(400)
        .json({ error: "domain missing verifyingContract" });
    }

    const normalizedToken = normalizeAddress(domain.verifyingContract);

    // Check allowlist
    if (!isAllowedToken(normalizedToken, chainId)) {
      return res.status(400).json({ error: "token not allowed" });
    }

    // Validate primaryType
    if (typedData.primaryType !== "TransferWithAuthorization") {
      return res.status(400).json({ error: "invalid primaryType" });
    }

    // Validate message fields
    if (
      !message.from ||
      !message.to ||
      message.value == null ||
      message.validAfter == null ||
      message.validBefore == null ||
      !message.nonce
    ) {
      return res.status(400).json({ error: "invalid message structure" });
    }

    // Validate time window
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now <= message.validAfter) {
      return res.status(400).json({ error: "authorization not yet valid" });
    }

    if (now >= message.validBefore) {
      return res.status(400).json({ error: "authorization expired" });
    }

    // // Verify signature using erc3009 package
    // const isValid = verifySignature(domain, message, signature, message.from);
    // if (!isValid) {
    //   return res.status(400).json({ error: "invalid signature" });
    // }

    // Check nonce replay protection (chain-specific)
    const nonceTracker = nonceKey(
      chainId,
      normalizedToken,
      message.from,
      message.nonce
    );
    if (usedNonces.has(nonceTracker)) {
      return res.status(400).json({ error: "nonce already used" });
    }

    // Get provider and relayer for this chain
    const provider = getProvider(chainId);
    const relayer = getRelayer(chainId);

    console.log(`Relaying transaction on chain ${chainId}:`);
    console.log(`  from: ${message.from}`);
    console.log(`  to: ${message.to}`);
    console.log(`  value: ${message.value.toString()}`);
    console.log(`  validAfter: ${message.validAfter.toString()}`);
    console.log(`  validBefore: ${message.validBefore.toString()}`);
    console.log(`  nonce: ${message.nonce}`);

    // Split signature for contract call
    const { v, r, s } = Signature.from(signature);

    // Execute on-chain transaction
    const contract = new Contract(normalizedToken, ERC3009_ABI, relayer);
    const tx = await contract.transferWithAuthorization(
      message.from,
      message.to,
      message.value,
      message.validAfter,
      message.validBefore,
      message.nonce,
      v,
      r,
      s
    );

    // Mark nonce as used
    usedNonces.add(nonceTracker);

    console.log(
      `✓ Relayed tx ${tx.hash} on chain ${chainId} for ${message.from} → ${
        message.to
      } (${message.value.toString()})`
    );

    return res.json({
      txHash: tx.hash,
      chainId: chainId,
      success: true,
    });
  } catch (err: any) {
    console.error("Error in /erc3009/relay:", err);

    // Return more specific error if available
    const errorMessage = err.reason || err.message || "internal_error";
    return res.status(500).json({
      error: "relay_failed",
      details: errorMessage,
    });
  }
});

/**
 * GET /solana/fee-payer
 *
 * Returns the fee payer's public key so clients can include it as a required signer.
 */
app.get("/solana/fee-payer", (_req: Request, res: Response) => {
  if (!solanaFeePayerKeypair) {
    return res.status(400).json({
      error: "fee_payer_not_configured",
      details: "SOLANA_FEE_PAYER_SECRET is not configured",
    });
  }
  return res.json({
    feePayer: solanaFeePayerKeypair.publicKey.toBase58(),
  });
});

/**
 * POST /solana/relay
 *
 * Relays a Solana transaction using the backend fee payer.
 * The relayer co-signs the transaction and pays SOL fees.
 * Requires SOLANA_FEE_PAYER_SECRET to be configured.
 *
 * IMPORTANT: For VersionedTransaction, the fee payer must be included as a required signer.
 * Use GET /solana/fee-payer to get the fee payer's public key.
 * For legacy Transaction, the fee payer can be added via partialSign.
 *
 * Request body:
 * - transaction: string (base64 or base58 encoded)
 * - waitForConfirmation?: boolean (default true)
 * - skipPreflight?: boolean (default false)
 * - rpcUrl?: string (override cluster RPC URL, optional)
 */
app.post("/solana/relay", async (req: Request, res: Response) => {
  try {
    const {
      transaction,
      waitForConfirmation = true,
      skipPreflight = false,
      rpcUrl,
      maxRetries,
      minContextSlot,
    } = req.body || {};

    if (!transaction) {
      return res.status(400).json({ error: "transaction is required" });
    }

    if (!solanaFeePayerKeypair) {
      return res.status(400).json({
        error: "fee_payer_not_configured",
        details: "SOLANA_FEE_PAYER_SECRET is required for /solana/relay",
      });
    }

    const raw = decodeSolanaTransaction(transaction);
    const connection = new Connection(rpcUrl || SOLANA_RPC_URL, "confirmed");

    // Deserialize transaction (works with both @solana/kit and standard transactions)
    const tx = deserializeSolanaTransaction(raw);
    let signature: string;

    if (tx instanceof VersionedTransaction) {
      // For VersionedTransaction, check if fee payer is a required signer
      const message = tx.message;
      const staticAccountKeys = message.staticAccountKeys;
      const feePayerPubkey = solanaFeePayerKeypair.publicKey;

      const isRequiredSigner = staticAccountKeys.some((key) =>
        key.equals(feePayerPubkey)
      );

      if (!isRequiredSigner) {
        return res.status(400).json({
          error: "fee_payer_not_required_signer",
          details:
            "Fee payer must be included as a required signer in the transaction. " +
            "Use GET /solana/fee-payer to get the fee payer address and include it when building the transaction.",
        });
      }

      // Fee payer is a required signer, add signature
      tx.sign([solanaFeePayerKeypair]);
      signature = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight,
        maxRetries,
        minContextSlot,
      });
    } else {
      // For legacy Transaction, use partialSign
      tx.partialSign(solanaFeePayerKeypair);
      signature = await connection.sendRawTransaction(tx.serialize(), {
        skipPreflight,
        maxRetries,
        minContextSlot,
      });
    }

    if (waitForConfirmation) {
      await connection.confirmTransaction(signature, "confirmed");
    }

    return res.json({
      signature,
      cluster: connection.rpcEndpoint,
      mode: "fee-payer-sign",
      confirmed: waitForConfirmation,
    });
  } catch (err: any) {
    console.error("Error in /solana/relay:", err);
    return res.status(500).json({
      error: "relay_failed",
      details: err.message || "internal_error",
    });
  }
});

/**
 * POST /solana/kora
 *
 * Relays a Solana transaction using Kora for gasless fee payment.
 * Kora allows users to pay fees with SPL tokens instead of SOL.
 * Requires KORA_RPC_URL and KORA_SIGNER_ADDRESS to be configured.
 *
 * Request body:
 * - transaction: string (base64 or base58 encoded)
 * - koraSigner?: string (required if not set via KORA_SIGNER_ADDRESS env)
 * - waitForConfirmation?: boolean (default true)
 * - skipPreflight?: boolean (default false)
 * - rpcUrl?: string (override cluster RPC URL, optional)
 */
app.post("/solana/kora", async (req: Request, res: Response) => {
  try {
    const {
      transaction,
      koraSigner,
      waitForConfirmation = true,
      skipPreflight = false,
      rpcUrl,
      maxRetries,
      minContextSlot,
    } = req.body || {};

    if (!transaction) {
      return res.status(400).json({ error: "transaction is required" });
    }

    if (!koraClient) {
      return res.status(400).json({
        error: "kora_not_configured",
        details: "KORA_RPC_URL is required for /solana/kora",
      });
    }

    const signerKey = koraSigner || process.env.KORA_SIGNER_ADDRESS;
    if (!signerKey) {
      return res.status(400).json({
        error: "kora_signer_required",
        details:
          "koraSigner is required in request body or KORA_SIGNER_ADDRESS in environment",
      });
    }

    const raw = decodeSolanaTransaction(transaction);
    const connection = new Connection(rpcUrl || SOLANA_RPC_URL, "confirmed");

    const { signed_transaction } = await koraClient.signTransaction({
      transaction: Buffer.from(raw).toString("base64"),
      signer_key: signerKey,
    });

    const signedRaw = Buffer.from(signed_transaction, "base64");
    const signature = await connection.sendRawTransaction(signedRaw, {
      skipPreflight,
      maxRetries,
      minContextSlot,
    });

    if (waitForConfirmation) {
      await connection.confirmTransaction(signature, "confirmed");
    }

    return res.json({
      signature,
      cluster: connection.rpcEndpoint,
      mode: "kora-sign",
      confirmed: waitForConfirmation,
    });
  } catch (err: any) {
    console.error("Error in /solana/kora:", err);
    return res.status(500).json({
      error: "relay_failed",
      details: err.message || "internal_error",
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (_req: Request, res: Response) => {
  const supportedChains: Record<
    string,
    { chainId: number; configured: boolean }
  > = {};

  for (const [name, chainId] of Object.entries(SUPPORTED_CHAINS)) {
    try {
      getRpcUrl(chainId);
      supportedChains[name] = { chainId, configured: true };
    } catch {
      supportedChains[name] = { chainId, configured: false };
    }
  }

  res.json({
    ok: true,
    supportedChains,
  });
});

const port = parseInt(process.env.PORT || "3001", 10);
app.listen(port, () => {
  console.log(`   Port: ${port}`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log(`   ERC3009 Relay: POST http://localhost:${port}/erc3009/relay`);
  console.log(
    `   Domain: GET http://localhost:${port}/api/tokenDomain?token=<address>&chainId=<chainId>`
  );
  console.log(
    `   Solana Fee Payer: GET http://localhost:${port}/solana/fee-payer`
  );
  console.log(`   Solana Relay: POST http://localhost:${port}/solana/relay`);
  console.log(`   Solana Kora: POST http://localhost:${port}/solana/kora\n`);
});
