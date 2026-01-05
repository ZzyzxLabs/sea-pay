import Link from "next/link";
import { buildDeeplinkUrl, generateQr } from "@seapay/deeplink";

export default async function QrTestPage() {
  const deeplinkUrl = buildDeeplinkUrl();
  const qrSvg = await generateQr({ text: deeplinkUrl, format: "svg" });

  if (typeof qrSvg !== "string") {
    throw new Error("Unexpected QR output format.");
  }

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
          className="modal-qr"
          role="img"
          aria-label="SeaPay deeplink QR code"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </section>
    </main>
  );
}
