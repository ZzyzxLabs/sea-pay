import { alchemy, sepolia } from "@account-kit/infra";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export const chain = sepolia;

export const policyId = process.env.POLICY_ID;

/** Lazy transport to avoid initializing at module load (e.g. during Next.js build). */
export function getTransport() {
  if (!ALCHEMY_API_KEY) {
    throw new Error("ALCHEMY_API_KEY environment variable is required");
  }
  return alchemy({ apiKey: ALCHEMY_API_KEY });
}
