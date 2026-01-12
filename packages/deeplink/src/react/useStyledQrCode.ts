"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createStyledQrCode, type StyledQrOptions } from "../qr-styled.js";
import QRCodeStyling from "qr-code-styling";

/**
 * React hook for rendering styled QR codes
 * @param data - The data to encode in the QR code
 * @param containerRef - A ref to the DOM element where the QR code will be rendered
 * @param options - Optional styling overrides
 */
export function useStyledQrCode(
  data: string | null | undefined,
  containerRef: RefObject<HTMLDivElement>,
  options?: StyledQrOptions
) {
  const qrCodeInstanceRef = useRef<ReturnType<typeof createStyledQrCode> | null>(null);

  useEffect(() => {
    if (!data || !containerRef.current) {
      return;
    }

    // Create or update QR code instance
    if (!qrCodeInstanceRef.current) {
      qrCodeInstanceRef.current = createStyledQrCode(data, options);
    } else {
      qrCodeInstanceRef.current.update({ data });
    }

    // Clear container and render QR code
    const container = containerRef.current;
    container.innerHTML = "";
    qrCodeInstanceRef.current.append(container);

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [data, containerRef, options]);

  return qrCodeInstanceRef.current;
}

export type { QRCodeStyling };
