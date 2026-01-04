# Adding New Packages to SeaPay Monorepo

This guide explains how to create and initialize a new package or service in the monorepo.

## Quick Steps

### 1. Create the Folder Structure

Decide where your package belongs:

- **`apps/`** - Applications (web apps, CLI tools, etc.)
- **`packages/`** - Shared libraries/packages
- **`services/`** - Backend services
- **`tooling/`** - Development tooling

```bash
# Example: Create a new service
mkdir -p services/my-service/src
cd services/my-service
```

### 2. Initialize package.json

Create `package.json` with the proper naming convention:

```json
{
  "name": "@seapay/my-service",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    // Add your dependencies here
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

**Naming Convention:**

- Apps: `@seapay/web`, `@seapay/indexer`
- Services: `@seapay/indexer-service`, `@seapay/api-service`
- Packages: `@seapay/shared-utils`, `@seapay/types`
- Tooling: `@seapay/eslint-config`, `@seapay/prettier-config`

### 3. Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "extends": "../../packages/tsconfig/base.json",
  "compilerOptions": {
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### 4. Verify Workspace Configuration

The workspace is already configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
  - services/*
  - tooling/*
```

Your new package will be automatically included if it's in one of these directories.

### 5. Install Dependencies

From the **root** of the monorepo:

```bash
pnpm install
```

This will:

- Install all dependencies for all packages
- Link workspace packages together
- Create proper symlinks

### 6. Create Source Files

Create your entry point:

```bash
# Example for a service
touch src/index.ts
```

```typescript
// src/index.ts
export function main() {
  console.log("Hello from @seapay/my-service");
}

main();
```

### 7. Test Your Setup

```bash
# Run from root
pnpm --filter @seapay/my-service dev

# Or use the workspace script (if added to root package.json)
pnpm dev
```

## Complete Example: Creating a New Service

```bash
# 1. Create directory
mkdir -p services/api-service/src
cd services/api-service

# 2. Create package.json (copy template above)

# 3. Create tsconfig.json (copy template above)

# 4. Create source file
cat > src/index.ts << 'EOF'
export function start() {
  console.log("API Service started");
}

start();
EOF

# 5. Go back to root and install
cd ../../..
pnpm install

# 6. Test it
pnpm --filter @seapay/api-service dev
```

## Important Notes

### ES Modules (type: "module")

All packages use ES modules. When importing local files, use `.js` extensions:

```typescript
// ✅ Correct
import { helper } from "./helper.js";

// ❌ Wrong
import { helper } from "./helper";
```

### Shared Dependencies

If multiple packages need the same dependency, install it at the root level or in the specific package. pnpm will dedupe automatically.

### Workspace Dependencies

To use another package in your monorepo:

```json
{
  "dependencies": {
    "@seapay/shared-utils": "workspace:*"
  }
}
```

### Environment Variables

Create `env.example` file:

```bash
touch env.example
```

Add it to `.gitignore` (already configured at root level).

## Checklist

- [ ] Folder created in appropriate directory (`apps/`, `packages/`, `services/`, or `tooling/`)
- [ ] `package.json` created with `@seapay/` scope
- [ ] `tsconfig.json` extends base config
- [ ] Source files created in `src/` directory
- [ ] `pnpm install` run from root
- [ ] Package tested with `pnpm --filter @seapay/package-name dev`

## Troubleshooting

### Package not found

- Make sure `pnpm install` was run from root
- Verify the package name matches the folder structure
- Check `pnpm-workspace.yaml` includes your directory pattern

### TypeScript errors

- Ensure `tsconfig.json` extends the base config
- Check that `rootDir` is set correctly
- Verify imports use `.js` extensions

### Import errors

- Use `.js` extensions for local imports
- For workspace packages, use `workspace:*` version
- Run `pnpm install` after adding dependencies
