# @seapay/qr-generator

Generate QR codes for **Ethereum address URIs** (ERC-681 base form), e.g. `ethereum:0x...` or `ethereum:vitalik.eth`.

## ERC-681 request format (as used here)

For now we only generate the simplest form:

- `ethereum:<target_address>`

Examples:

- `ethereum:0x0000000000000000000000000000000000000000`
- `ethereum:vitalik.eth`

## CLI

This package exposes a CLI:

- **Binary**: `seapay-qr` (via pnpm script)

### Generate a terminal QR

```bash
pnpm seapay-qr -- \
  --to 0x0000000000000000000000000000000000000000 \
  --format terminal
```

### Generate an SVG QR

```bash
pnpm seapay-qr -- \
  --to vitalik.eth \
  --format svg \
  --out ./address.svg
```

### Generate a PNG QR

```bash
pnpm seapay-qr -- \
  --to 0x0000000000000000000000000000000000000000 \
  --format png \
  --width 512 \
  --out ./address.png
```

## Library usage

```ts
import { buildErc681Request } from "@seapay/qr-generator";

const uri = buildErc681Request({
  schemaPrefix: "ethereum:",
  targetAddress: "0x0000000000000000000000000000000000000000",
});

console.log(uri);
```
