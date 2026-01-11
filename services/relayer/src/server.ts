import express, { type Request, type Response } from "express";
import cors from "cors";
import { Contract, Signature } from "ethers";
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

    // Verify signature using erc3009 package
    const isValid = verifySignature(domain, message, signature, message.from);
    if (!isValid) {
      return res.status(400).json({ error: "invalid signature" });
    }

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
  console.log(`   Relay: POST http://localhost:${port}/erc3009/relay`);
  console.log(
    `   Domain: GET http://localhost:${port}/api/tokenDomain?token=<address>&chainId=<chainId>\n`
  );
});
