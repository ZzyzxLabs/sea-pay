# @seapay/deeplink

Utilities for building deeplink URLs and generating QR codes for SeaPay.

## Features

- Build Coinbase Wallet deeplink URLs
- Generate basic QR codes (PNG, SVG, terminal)
- Generate styled QR codes with custom styling
- React hooks for styled QR codes

## Installation

```bash
pnpm add @seapay/deeplink
```

## Basic Usage

### Building Deeplink URLs

```ts
import { buildDeeplinkUrl } from "@seapay/deeplink";

const paymentUrl = "https://app.seapay.ai/pay-mobile?amount=10&asset=USDC";
const deeplinkUrl = buildDeeplinkUrl(paymentUrl);
// Returns: "cbwallet://dapp?url=https%3A%2F%2Fapp.seapay.ai%2Fpay-mobile%3Famount%3D10%26asset%3DUSDC"
```

### Generating Basic QR Codes

```ts
import { generateQr } from "@seapay/deeplink";

// Generate PNG
const pngBuffer = await generateQr({
  text: "https://example.com",
  format: "png",
  width: 512,
});

// Generate SVG
const svgString = await generateQr({
  text: "https://example.com",
  format: "svg",
});

// Generate terminal output
const terminalOutput = await generateQr({
  text: "https://example.com",
  format: "terminal",
});
```

### Styled QR Codes

#### Framework-Agnostic (JavaScript/TypeScript)

```ts
import { createStyledQrCode } from "@seapay/deeplink";

const qrCode = createStyledQrCode("https://example.com", {
  width: 400,
  height: 400,
});

// Render to a DOM element
const container = document.getElementById("qr-container");
if (container) {
  container.innerHTML = "";
  qrCode.append(container);
}

// Update the QR code data
qrCode.update({ data: "https://new-url.com" });
```

#### React Hook

```tsx
"use client";

import { useRef } from "react";
import { useStyledQrCode } from "@seapay/deeplink/react";

function MyComponent() {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  useStyledQrCode(
    "https://example.com",
    qrContainerRef,
    {
      width: 400,
      height: 400,
    }
  );

  return <div ref={qrContainerRef} />;
}
```

### Custom Styling

You can customize the QR code styling by passing options:

```ts
import { createStyledQrCode } from "@seapay/deeplink";

const qrCode = createStyledQrCode("https://example.com", {
  width: 300,
  height: 300,
  dotsOptions: {
    color: "#000000",
    type: "square", // or "rounded", "dots", "classy", "classy-rounded", "extra-rounded"
  },
  cornersSquareOptions: {
    color: "#000000",
    type: "square", // or "rounded", "dot", "extra-rounded"
  },
  backgroundOptions: {
    color: "#ffffff",
  },
});
```

See the [qr-code-styling documentation](https://www.npmjs.com/package/qr-code-styling) for all available options.

## Default Styling

The package includes default SeaPay branding:

- **Dots**: Rounded, color `#1e293b`
- **Corners**: Extra-rounded, color `#0f172a`
- **Background**: White `#ffffff`
- **Size**: 300x300px
- **Margin**: 4

## API Reference

### `buildDeeplinkUrl(cb_url: string): string`

Builds a Coinbase Wallet deeplink URL.

### `generateQr(params: GenerateQrParams): Promise<string | Buffer>`

Generates a basic QR code in PNG, SVG, or terminal format.

### `createStyledQrCode(data: string, options?: StyledQrOptions): QRCodeStyling`

Creates a styled QR code instance.

### `useStyledQrCode(data: string | null | undefined, containerRef: RefObject<HTMLDivElement>, options?: StyledQrOptions): QRCodeStyling | null`

React hook for rendering styled QR codes.

## Publishing

This package is currently a workspace package. To publish to npm:

1. Update `package.json` to remove `"private": true`
2. Add `publishConfig` if needed
3. Follow the publishing guide in `packages/erc3009/PUBLISHING.md`
