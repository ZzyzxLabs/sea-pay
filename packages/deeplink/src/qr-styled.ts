import QRCodeStylingDefault from "qr-code-styling";
import type { Options } from "qr-code-styling";

// Type assertion to work around qr-code-styling type issues
const QRCodeStyling = QRCodeStylingDefault as unknown as new (
  options?: Partial<Options>
) => {
  update(options?: Partial<Options>): void;
  append(container?: HTMLElement): void;
};

/**
 * Default styling options for SeaPay QR codes
 */
export const defaultQrStylingOptions: Partial<Options> = {
  width: 300,
  height: 300,
  margin: 4,
  qrOptions: {
    typeNumber: 0,
    mode: "Byte",
    errorCorrectionLevel: "Q",
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 8,
  },
  dotsOptions: {
    color: "#1e293b",
    type: "rounded",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  cornersSquareOptions: {
    color: "#0f172a",
    type: "extra-rounded",
  },
  cornersDotOptions: {
    color: "#0f172a",
    type: "dot",
  },
};

/**
 * Create a styled QR code instance with default SeaPay styling
 * @param data - The data to encode in the QR code
 * @param options - Optional styling overrides
 * @returns A QRCodeStyling instance
 */
export function createStyledQrCode(
  data: string,
  options?: Partial<Options>
) {
  return new QRCodeStyling({
    ...defaultQrStylingOptions,
    data,
    ...options,
  });
}

/**
 * Type for customizing QR code styling
 */
export type StyledQrOptions = Partial<Options>;
