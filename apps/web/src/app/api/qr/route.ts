import { NextResponse } from "next/server";
import { buildErc681Request, generateQr } from "@seapay/qr-generator";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { address?: string } | null = null;
  try {
    body = (await req.json()) as { address?: string };
  } catch {
    body = null;
  }

  const address = body?.address?.trim();
  if (!address) {
    return NextResponse.json(
      { error: "address is required" },
      { status: 400 }
    );
  }

  try {
    const uri = buildErc681Request({
      schemaPrefix: "ethereum:",
      targetAddress: "0xf08A50178dfcDe18524640EA6618a1f965821715", // ETH Sepolia USDC contract address
      chainId: 8453, // Sepolia
      functionName: "transfer",
      parameters: {
        value: 1e18,
        address: address,
      },
    });
    console.log("Generated URI:", uri);
    const svg = await generateQr({ text: uri, format: "svg" });

    return NextResponse.json({
      uri,
      svg: String(svg),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate QR code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
