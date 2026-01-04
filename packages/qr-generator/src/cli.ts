import { writeFile } from "node:fs/promises";
import { buildErc681Request } from "./erc681.js";
import { generateQr } from "./qr.js";

type ArgMap = Record<string, string | boolean>;

function parseArgs(argv: string[]): ArgMap {
  const out: ArgMap = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i++;
  }
  return out;
}

function usage(): string {
  return [
    "seapay-qr",
    "",
    "Generate a QR code for an Ethereum address URI (ERC-681 base form).",
    "",
    "Required:",
    "  --ta <target address or ENS>   Target address (0x... or ENS)",
    "",
    "Optional:",
    "  --function <function name>     Function name (e.g., transfer)",
    "  --chainId <chain id>           Chain id (e.g., 1, 11155111)",
    "  --param <key=value>            Add query parameter (repeatable)",
    "  --plain                        Encode plain address/ENS (no ethereum: prefix)",
    "  --format <png|svg|terminal>    QR output format (default: terminal)",
    "  --out <path>                   Output file path (png/svg only)",
    "  --width <number>               PNG width (default: 512)",
    "  --help                         Show help",
    "",
    "Examples:",
    "  seapay-qr --ta 0xabc... --format terminal",
    "  seapay-qr --ta vitalik.eth --function transfer --chainId 1 --param address=0xdef... --format svg --out ./address.svg",
    "  seapay-qr --ta 0xabc... --chainId 11155111 --param value=0.01 --format terminal",
  ].join("\n");
}

function parseParams(values: string[]): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const v of values) {
    const idx = v.indexOf("=");
    if (idx === -1)
      throw new Error(`Invalid --param (expected key=value): ${v}`);
    const k = v.slice(0, idx);
    const val = v.slice(idx + 1);
    const existing = out[k];
    if (existing === undefined) {
      out[k] = val;
    } else if (Array.isArray(existing)) {
      existing.push(val);
    } else {
      out[k] = [existing, val];
    }
  }
  return out;
}

function toNumberMaybe(
  v: string | undefined,
  flag: string
): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid ${flag}: ${v}`);
  return n;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const ta = typeof args.ta === "string" ? args.ta : undefined;
  if (!ta) {
    console.error("Missing required --ta (target address)");
    console.log("");
    console.log(usage());
    process.exit(1);
  }

  const chainId = toNumberMaybe(
    typeof args.chainId === "string" ? args.chainId : undefined,
    "--chainId"
  );
  const functionName =
    typeof args.function === "string" ? args.function : undefined;
  const width = toNumberMaybe(
    typeof args.width === "string" ? args.width : undefined,
    "--width"
  );

  // Parse repeated --param flags
  const paramValues: string[] = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (
      process.argv[i] === "--param" &&
      typeof process.argv[i + 1] === "string"
    ) {
      paramValues.push(process.argv[i + 1] as string);
    }
  }
  const parameters =
    paramValues.length > 0 ? parseParams(paramValues) : undefined;

  const plain = Boolean(args.plain);

  const text = plain
    ? ta
    : buildErc681Request({
        schemaPrefix: "ethereum:",
        targetAddress: ta,
        chainId,
        functionName,
        parameters,
      });

  console.log("uri: ", text);

  const format = (
    typeof args.format === "string" ? args.format : "terminal"
  ) as "png" | "svg" | "terminal";
  const outPath = typeof args.out === "string" ? args.out : undefined;

  if (format === "terminal") {
    const ansi = await generateQr({ text, format: "terminal" });
    process.stdout.write(String(ansi));
    process.stdout.write("\n");
    return;
  }

  if (!outPath) {
    throw new Error(`--out is required when --format is ${format}`);
  }

  if (format === "svg") {
    const svg = await generateQr({ text, format: "svg" });
    await writeFile(outPath, String(svg), "utf8");
    return;
  }

  const png = await generateQr({ text, format: "png", width: width ?? 512 });
  await writeFile(outPath, png as Buffer);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
