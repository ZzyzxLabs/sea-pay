import QRCode from "qrcode";

export type QrOutputFormat = "png" | "svg" | "terminal";

export interface GenerateQrParams {
  text: string;
  format: QrOutputFormat;
  /**
   * Only used for PNG. If omitted, defaults to 512.
   */
  width?: number;
  /**
   * Only used for terminal format. If true, generates a smaller QR code.
   * Defaults to true for smaller terminal output.
   */
  small?: boolean;
}

export async function generateQr({
  text,
  format,
  width = 256,
  small = true,
}: GenerateQrParams): Promise<string | Buffer> {
  if (!text) throw new Error("text is required");

  if (format === "svg") {
    return await QRCode.toString(text, { type: "svg" });
  }

  if (format === "terminal") {
    // Returns an ANSI string
    // small: true makes the QR code smaller (uses 1x1 blocks instead of 2x2)
    return await QRCode.toString(text, { type: "terminal", small });
  }

  // png
  return await QRCode.toBuffer(text, { type: "png", width });
}
