# QR Code Structure and Publishing Strategy

## Summary

I've added styled QR code functionality to the `@seapay/deeplink` package. This standardizes QR code generation across the entire repository.

## Structure

### 1. Core Utilities (`packages/deeplink/src/qr-styled.ts`)

- **`createStyledQrCode(data, options?)`**: Creates a styled QR code instance with default SeaPay branding
- **`defaultQrStylingOptions`**: Default styling configuration (rounded dots, extra-rounded corners, SeaPay colors)
- **`StyledQrOptions`**: Type for customizing QR code styling

### 2. React Hook (`packages/deeplink/src/react/useStyledQrCode.ts`)

- **`useStyledQrCode(data, containerRef, options?)`**: React hook for rendering styled QR codes
- Automatically handles creation, updates, and cleanup
- Exported from `@seapay/deeplink/react`

## Usage Examples

### Framework-Agnostic (JavaScript/TypeScript)

```ts
import { createStyledQrCode } from "@seapay/deeplink";

const qrCode = createStyledQrCode("https://example.com", {
  width: 400,
  height: 400,
});

const container = document.getElementById("qr-container");
if (container) {
  container.innerHTML = "";
  qrCode.append(container);
}
```

### React Hook

```tsx
"use client";

import { useRef } from "react";
import { useStyledQrCode } from "@seapay/deeplink/react";

function MyComponent() {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  useStyledQrCode("https://example.com", qrContainerRef);

  return <div ref={qrContainerRef} />;
}
```

## Should This Be Published to NPM?

### Recommendation: **Keep as workspace package for now**

**Reasons:**
1. ✅ **Internal use**: Currently only used within your monorepo
2. ✅ **Flexibility**: Easier to iterate and make breaking changes
3. ✅ **No external consumers**: No need to maintain backward compatibility
4. ✅ **Simpler workflow**: No version management or publishing overhead

### When to Consider Publishing:

1. **External consumers**: If you want to share it with other projects/teams
2. **Stable API**: Once the API is stable and you want to commit to backward compatibility
3. **Open source**: If you want to open-source this as a standalone package

### If You Do Publish:

1. Remove `"private": true` from `package.json`
2. Add `publishConfig` if needed (see `packages/erc3009/package.json` for example)
3. Follow the publishing guide in `packages/erc3009/PUBLISHING.md`
4. Consider versioning strategy (semantic versioning)

## Next Steps

1. ✅ **Created structured utilities** - Done
2. ⏳ **Update existing usage** - Replace inline QR code generation in:
   - `apps/web/components/sections/hero.tsx`
   - `apps/app/src/app/qr-test/page.tsx`
   - `apps/app/src/app/receive/page.tsx` (migrate from basic to styled)
3. ⏳ **Test the new utilities** - Verify they work in all contexts
4. ⏳ **Remove duplicate code** - Clean up old QR code implementations

## Migration Guide

### Before (Inline):
```tsx
import QRCodeStyling from "qr-code-styling";

const qrCodeInstance = useRef<QRCodeStyling | null>(null);
// ... 50+ lines of styling configuration
```

### After (Standardized):
```tsx
import { useStyledQrCode } from "@seapay/deeplink/react";

const qrContainerRef = useRef<HTMLDivElement>(null);
useStyledQrCode(data, qrContainerRef);
```

Benefits:
- ✅ Consistent styling across the app
- ✅ Less code duplication
- ✅ Easier to update styling globally
- ✅ Better maintainability
