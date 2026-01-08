"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { buildDeeplinkUrl } from "@seapay/deeplink";
import QRCodeStyling from "qr-code-styling";

export default function QrTestPage() {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        // Example payment URL - you can customize this
        const paymentUrl = `${window.location.origin}/pay-mobile?amount=10&asset=USDC`;
        const deeplinkUrl = buildDeeplinkUrl(paymentUrl);

        // Create or update QR code with styling
        if (!qrCodeInstance.current) {
          qrCodeInstance.current = new QRCodeStyling({
            width: 300,
            height: 300,
            data: deeplinkUrl,
            margin: 10,
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
          });
        } else {
          qrCodeInstance.current.update({
            data: deeplinkUrl,
          });
        }

        // Append to DOM if ref is available
        if (qrCodeRef.current) {
          qrCodeRef.current.innerHTML = "";
          qrCodeInstance.current.append(qrCodeRef.current);
        }
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQrCode();
  }, []);

  const paymentUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pay-mobile?amount=10&asset=USDC`
    : "";
  const deeplinkUrl = buildDeeplinkUrl(paymentUrl);

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>QR Test</h1>
          <p className="lede">
            A quick sanity check for rendering QR codes in the app UI.
          </p>
          <Link href="/" className="tx-link hero-link">
            Back to activity
          </Link>
        </div>
      </header>

      <section className="panel">
        <div className="status">
          <div className="status-row status-row-stack">
            <span className="status-label">Deeplink URL</span>
            <span className="tx-value">{deeplinkUrl}</span>
          </div>
        </div>

        <div
          ref={qrCodeRef}
          className="modal-qr"
          role="img"
          aria-label="SeaPay deeplink QR code"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
          }}
        />
      </section>
    </main>
  );
}
