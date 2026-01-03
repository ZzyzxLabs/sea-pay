# Publishing Guide for @seapay-ai/erc3009

## Prerequisites

1. **npm account**: Create an account at https://www.npmjs.com
2. **npm CLI**: Install npm (comes with Node.js) or use `pnpm`
3. **Login**: Authenticate with npm

## Step-by-Step Publishing Process

### 1. Login to npm

```bash
npm login
# Enter your username, password, and email
# If you have 2FA enabled, you'll need to enter the OTP
```

Or if using a token:

```bash
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

### 2. Verify Package Configuration

Check that your package is ready:

```bash
cd packages/erc3009

# Verify package.json
cat package.json

# Check what files will be published
npm pack --dry-run
```

This shows you exactly what files will be included in the published package.

### 3. Build the Package

```bash
pnpm build
# or
npm run build
```

Verify `dist/` contains:

- `index.js`
- `index.d.ts`
- `index.d.ts.map`

### 4. Test Locally (Optional but Recommended)

Test the package locally before publishing:

```bash
# In the package directory
npm pack

# This creates a .tgz file
# In another project, test it:
npm install /path/to/@seapay-erc3009-0.1.0.tgz
```

### 5. Version Bump

Update the version in `package.json`:

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

You can also use npm version:

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
```

This automatically updates `package.json` and creates a git tag.

### 6. Publish

```bash
# Make sure you're in the package directory
cd packages/erc3009

# Publish to npm
npm publish

# Or with pnpm
pnpm publish
```

**Note**: The `prepublishOnly` script in package.json will automatically run `pnpm build` before publishing.

### 7. Verify Publication

Check npm registry:

```bash
npm view @seapay-ai/erc3009
```

Or visit: https://www.npmjs.com/package/@seapay-ai/erc3009

## Publishing Scoped Packages

Since your package is scoped (`@seapay-ai/erc3009`), you need to ensure:

1. **Access is public**: The `publishConfig.access: "public"` in package.json makes it public
2. **Organization**: If `@seapay` is an npm organization, you need to be a member

To publish a scoped package publicly:

```bash
npm publish --access public
```

(But since `publishConfig.access: "public"` is in package.json, this is automatic)

## Common Issues

### 1. "You do not have permission to publish"

- Check you're logged in: `npm whoami`
- Verify the package name isn't taken
- For scoped packages, ensure you have access to the organization

### 2. "Package name already exists"

- Change the package name in `package.json`
- Or use a different scope/organization

### 3. "Invalid package name"

- Package names must be lowercase
- Scoped packages: `@scope/package-name`
- No special characters except `-` and `_`

### 4. "Missing files"

- Check `.npmignore` isn't excluding needed files
- Verify `files` field in `package.json` includes what you need

## Updating the Package

After making changes:

1. Update version: `npm version patch|minor|major`
2. Build: `pnpm build`
3. Publish: `npm publish`

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing can break other projects. Only do this within 72 hours of publishing.

```bash
npm unpublish @seapay-ai/erc3009@0.1.0
```

After 72 hours, you cannot unpublish. You can only deprecate:

```bash
npm deprecate @seapay-ai/erc3009@0.1.0 "This version has a critical bug"
```

## Best Practices

1. **Test thoroughly** before publishing
2. **Use semantic versioning** (semver)
3. **Write a good README** (already done!)
4. **Include examples** in README
5. **Tag releases in git**: `git tag v0.1.0 && git push --tags`
6. **Keep CHANGELOG.md** (optional but recommended)

## Quick Reference

```bash
# Full publishing workflow
cd packages/erc3009
pnpm build                    # Build
npm version patch            # Bump version
pnpm build                   # Rebuild with new version
npm publish                  # Publish
npm view @seapay-ai/erc3009     # Verify
```
