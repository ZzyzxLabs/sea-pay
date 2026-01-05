import express, { type Request, type Response } from "express";
import path from "path";
import dotenv from "dotenv";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Signature,
  verifyTypedData,
  TypedDataDomain,
} from "ethers";

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

type Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

const TYPES = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};

const ERC20_ABI = [
  "function name() view returns (string)",
  "function version() view returns (string)",
];
const ERC3009_ABI = [
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)",
];

const app = express();
app.use(express.json());

const provider = new JsonRpcProvider(requiredEnv("RPC_URL"));
const relayer = new Wallet(requiredEnv("RELAYER_PK"), provider);
const allowlist = parseAllowlist(process.env.TOKEN_ALLOWLIST);
const usedNonces = new Set<string>(); // key: token|from|nonce

function nonceKey(token: string, from: string, nonce: string) {
  return `${token.toLowerCase()}|${from.toLowerCase()}|${nonce.toLowerCase()}`;
}

function isAllowedToken(token: string): boolean {
  if (!allowlist) return true;
  return allowlist.has(token.toLowerCase());
}

app.get("/api/tokenDomain", async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || "").toLowerCase();
    if (!token) return res.status(400).json({ error: "token required" });
    if (!isAllowedToken(token))
      return res.status(400).json({ error: "token not allowed" });

    const erc20 = new Contract(token, ERC20_ABI, provider);

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

    const network = await provider.getNetwork();

    const domain: Domain = {
      name,
      version,
      chainId: Number(network.chainId),
      verifyingContract: token,
    };

    return res.json(domain);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "internal_error" });
  }
});

app.post("/api/relay", async (req: Request, res: Response) => {
  try {
    const {
      token,
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      signature,
      domain,
    } = req.body || {};

    if (
      !token ||
      !from ||
      !to ||
      !value ||
      !validAfter ||
      !validBefore ||
      !nonce ||
      !signature ||
      !domain
    ) {
      return res.status(400).json({ error: "missing fields" });
    }

    if (!isAllowedToken(token))
      return res.status(400).json({ error: "token not allowed" });

    const typedDomain = domain as TypedDataDomain;
    if (
      !typedDomain.verifyingContract ||
      typedDomain.verifyingContract.toLowerCase() !== token.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ error: "domain verifyingContract mismatch" });
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const validAfterBn = BigInt(validAfter);
    const validBeforeBn = BigInt(validBefore);
    if (now < validAfterBn || now >= validBeforeBn) {
      return res
        .status(400)
        .json({ error: "authorization not in valid window" });
    }

    const msg = {
      from,
      to,
      value: BigInt(value),
      validAfter: validAfterBn,
      validBefore: validBeforeBn,
      nonce,
    };

    const recovered = verifyTypedData(typedDomain, TYPES, msg, signature);
    if (recovered.toLowerCase() !== String(from).toLowerCase()) {
      return res.status(400).json({ error: "invalid signature" });
    }

    const nonceTracker = nonceKey(token, from, nonce);
    if (usedNonces.has(nonceTracker)) {
      return res.status(400).json({ error: "nonce already used" });
    }

    const { v, r, s } = Signature.from(signature);

    const contract = new Contract(token, ERC3009_ABI, relayer);
    const tx = await contract.transferWithAuthorization(
      from,
      to,
      msg.value,
      msg.validAfter,
      msg.validBefore,
      msg.nonce,
      v,
      r,
      s
    );
    usedNonces.add(nonceTracker);

    return res.json({ txHash: tx.hash });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "internal_error" });
  }
});

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

const port = parseInt(process.env.PORT || "3001", 10);
app.listen(port, () => {
  console.log(`erc3009 relay listening on http://localhost:${port}`);
});

function parseAllowlist(raw?: string | null) {
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
  );
}

function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing env ${key}`);
  }
  return val;
}
