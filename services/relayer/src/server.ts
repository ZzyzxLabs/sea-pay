import express, { type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Signature,
  getAddress,
} from "ethers";
import {
  verifySignature,
  registry,
  type EIP712Domain,
  type TransferWithAuthorization,
  type TypedData,
} from "@seapay-ai/erc3009";

console.log("cwd:", process.cwd());
console.log("PORT:", process.env.PORT);

// Load env from current working dir (root run) and monorepo root (when cwd is services/relayer)
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "..", "..", ".env"),
];
for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

const ERC3009_ABI = [
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)",
];

const ERC20_ABI = [
  "function name() view returns (string)",
  "function version() view returns (string)",
];

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

const provider = new JsonRpcProvider(requiredEnv("RPC_URL"));
const relayer = new Wallet(requiredEnv("RELAYER_PK"), provider);
const allowlist = parseAllowlist(process.env.TOKEN_ALLOWLIST);
const usedNonces = new Set<string>(); // key: token|from|nonce

// Get chain ID from provider (set once at startup)
let chainId: number;
provider.getNetwork().then((network) => {
  chainId = Number(network.chainId);
  console.log(`\n🚀 ERC-3009 Relay Server`);
  console.log(`   Chain: ${chainId} (${network.name})`);
  console.log(`   Relayer: ${relayer.address}`);
});

function normalizeAddress(address: string): string {
  return getAddress(address);
}

function nonceKey(token: string, from: string, nonce: string) {
  return `${normalizeAddress(token)}|${normalizeAddress(
    from
  )}|${nonce.toLowerCase()}`;
}

function isAllowedToken(token: string): boolean {
  if (!allowlist) return true;
  return allowlist.has(normalizeAddress(token));
}

/**
 * GET /api/tokenDomain?token=<address>
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

    const normalized = normalizeAddress(tokenAddress);
    if (!isAllowedToken(normalized)) {
      return res.status(400).json({ error: "token not allowed" });
    }

    // Try registry first - check all known tokens
    for (const symbol of ["USDC"]) {
      const tokenConfig = registry.getToken(symbol, chainId);
      if (tokenConfig) {
        const tokenAddress = (tokenConfig as any).address;
        if (tokenAddress && normalizeAddress(tokenAddress) === normalized) {
          const domain: EIP712Domain = {
            name: tokenConfig.name,
            version: tokenConfig.version,
            chainId: tokenConfig.chainId,
            verifyingContract: tokenAddress,
          };
          return res.json(domain);
        }
      }
    }

    // Fall back to on-chain query
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
 *
 * Request body:
 * - typedData: Complete EIP-712 typed data object containing:
 *   - domain: EIP-712 domain
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
    const rawMessage = typedData.message as TransferWithAuthorization;

    // Validate domain
    if (!domain.verifyingContract) {
      return res
        .status(400)
        .json({ error: "domain missing verifyingContract" });
    }

    const normalizedToken = normalizeAddress(domain.verifyingContract);

    // Check allowlist
    if (!isAllowedToken(normalizedToken)) {
      return res.status(400).json({ error: "token not allowed" });
    }

    // Validate primaryType
    if (typedData.primaryType !== "TransferWithAuthorization") {
      return res.status(400).json({ error: "invalid primaryType" });
    }

    const message: TransferWithAuthorization = typedData.message;

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

    // Check nonce replay protection
    const nonceTracker = nonceKey(normalizedToken, message.from, message.nonce);
    if (usedNonces.has(nonceTracker)) {
      return res.status(400).json({ error: "nonce already used" });
    }

    console.log("Relaying transaction:");
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
      `✓ Relayed tx ${tx.hash} for ${message.from} → ${
        message.to
      } (${message.value.toString()})`
    );

    return res.json({
      txHash: tx.hash,
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
  res.json({
    ok: true,
    relayer: relayer.address,
    chainId: chainId || "initializing",
  });
});

const port = parseInt(process.env.PORT || "3001", 10);
app.listen(port, () => {
  console.log(`   Port: ${port}`);
  console.log(`   Health: http://localhost:${port}/health`);
  console.log(`   Relay: POST http://localhost:${port}/erc3009/relay`);
  console.log(
    `   Domain: GET http://localhost:${port}/api/tokenDomain?token=<address>\n`
  );
});

/**
 * Parse comma-separated allowlist of token addresses
 */
function parseAllowlist(raw?: string | null): Set<string> | null {
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((v) => normalizeAddress(v.trim()))
      .filter(Boolean)
  );
}

/**
 * Get required environment variable or throw
 */
function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}
