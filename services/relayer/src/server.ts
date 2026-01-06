import express, { type Request, type Response } from "express";
import cors from "cors";
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

const USDC_ERC3009_ABI = [
  "function transferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce,uint8 v,bytes32 r,bytes32 s)",
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

app.post("/base/relay", async (req: Request, res: Response) => {
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

    console.log("from:", from);
    console.log("to:", to);
    console.log("value:", value);
    console.log("validAfter:", validAfter);
    console.log("validBefore:", validBefore);
    console.log("nonce:", nonce);
    console.log("signature:", signature);
    let { v, r, s } = Signature.from(signature);

    console.log("relaying transaction...");
    const contract = new Contract(token, USDC_ERC3009_ABI, relayer);
    const tx = await contract.transferWithAuthorization(
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      v,
      r,
      s
    );

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

function requiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing env ${key}`);
  }
  return val;
}
