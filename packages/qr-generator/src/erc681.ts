export type Erc681SchemaPrefix = "ethereum:" | "ethereum:pay-";

export interface BuildErc681RequestParams {
  /**
   * Example: "ethereum:" (plain ERC-681) or "ethereum:pay-" (EIP-681 pay- prefix).
   * If omitted, defaults to "ethereum:".
   */
  schemaPrefix?: Erc681SchemaPrefix | "ethereum:";
  /** Ethereum address (0x...) or an ENS name. */
  targetAddress: string;
  /** Optional chain id (e.g., 1, 11155111). */
  chainId?: number;
  /** Optional function name (e.g., "transfer"). */
  functionName?: string;
  /**
   * Query string parameters.
   * Values are stringified; arrays are emitted as repeated keys.
   */
  parameters?: Record<
    string,
    string | number | bigint | Array<string | number | bigint> | undefined
  >;
}

export interface ParsedErc681Request {
  schemaPrefix: "ethereum:" | "ethereum:pay-";
  targetAddress: string;
  chainId?: number;
  functionName?: string;
  parameters: Record<string, string | string[]>;
}

const HEX_ADDR_RE = /^0x[0-9a-fA-F]{40}$/;
// Super light ENS heuristic (we don't resolve ENS here)
const ENS_RE = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

function isLikelyEthAddressOrEns(value: string): boolean {
  return HEX_ADDR_RE.test(value) || ENS_RE.test(value);
}

function toSchemaPrefix(prefix?: string): "ethereum:" | "ethereum:pay-" {
  if (!prefix || prefix === "ethereum:") return "ethereum:";
  if (prefix === "ethereum:pay-") return "ethereum:pay-";
  throw new Error(
    `Unsupported schemaPrefix (expected "ethereum:" or "ethereum:pay-"): ${prefix}`
  );
}

function encodeParamValue(v: string | number | bigint): string {
  return encodeURIComponent(String(v));
}

function buildQuery(
  params:
    | Record<
        string,
        string | number | bigint | Array<string | number | bigint> | undefined
      >
    | undefined
): string {
  if (!params) return "";
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined) continue;
    const k = encodeURIComponent(key);
    if (Array.isArray(raw)) {
      for (const v of raw) parts.push(`${k}=${encodeParamValue(v)}`);
      continue;
    }
    parts.push(`${k}=${encodeParamValue(raw)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

/**
 * Build an ERC-681 request string (no https wrapper), e.g.:
 * - ethereum:0xabc...@11155111/transfer?address=0x...&uint256=123
 * - ethereum:pay-0xabc...@1?value=1e18
 */
export function buildErc681Request({
  schemaPrefix,
  targetAddress,
  chainId,
  functionName,
  parameters,
}: BuildErc681RequestParams): string {
  const prefix = toSchemaPrefix(schemaPrefix);

  if (!isLikelyEthAddressOrEns(targetAddress)) {
    throw new Error(
      `Invalid targetAddress (expected 0x... or ENS): ${targetAddress}`
    );
  }

  const chainPart = chainId !== undefined ? `@${chainId}` : "";
  const fnPart = functionName ? `/${encodeURIComponent(functionName)}` : "";
  const query = buildQuery(parameters);

  // Prefix already includes trailing ":" or ":pay-"
  return `${prefix}${targetAddress}${chainPart}${fnPart}${query}`;
}

function parseQuery(qs: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  if (!qs) return out;
  const raw = qs.startsWith("?") ? qs.slice(1) : qs;
  if (!raw) return out;

  for (const part of raw.split("&")) {
    if (!part) continue;
    const [k, v = ""] = part.split("=");
    const key = decodeURIComponent(k);
    const val = decodeURIComponent(v);
    const existing = out[key];
    if (existing === undefined) {
      out[key] = val;
    } else if (Array.isArray(existing)) {
      existing.push(val);
    } else {
      out[key] = [existing, val];
    }
  }
  return out;
}

/**
 * Parse an ERC-681 request string (no https wrapper).
 * This is a pragmatic parser aligned with the grammar you provided.
 */
export function parseErc681Request(request: string): ParsedErc681Request {
  if (!request.startsWith("ethereum:")) {
    throw new Error(
      `Invalid ERC-681 request (must start with "ethereum:"): ${request}`
    );
  }

  const schemaPrefix: "ethereum:" | "ethereum:pay-" = request.startsWith(
    "ethereum:pay-"
  )
    ? "ethereum:pay-"
    : "ethereum:";

  const afterPrefix = request.slice(schemaPrefix.length);
  const [pathAndAddr, queryString = ""] = afterPrefix.split("?");

  // pathAndAddr := target_address [ "@" chain_id ] [ "/" function_name ]
  const [addrAndChain, fnRaw] = pathAndAddr.split("/", 2);
  const [targetAddress, chainRaw] = addrAndChain.split("@", 2);

  if (!targetAddress || !isLikelyEthAddressOrEns(targetAddress)) {
    throw new Error(`Invalid targetAddress in request: ${targetAddress}`);
  }

  const chainId =
    chainRaw !== undefined && chainRaw !== "" ? Number(chainRaw) : undefined;
  if (
    chainRaw !== undefined &&
    (Number.isNaN(chainId) || !Number.isFinite(chainId))
  ) {
    throw new Error(`Invalid chainId in request: ${chainRaw}`);
  }

  const functionName = fnRaw ? decodeURIComponent(fnRaw) : undefined;

  return {
    schemaPrefix,
    targetAddress,
    chainId,
    functionName,
    parameters: parseQuery(queryString ? `?${queryString}` : ""),
  };
}
