# NetShield - Developer Setup

## Build & Deploy

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Action

```bash
npm run build
```

This creates `dist/index.js` - a single bundled file with all dependencies.

### 3. Commit the Dist

```bash
git add dist/index.js
git commit -m "Build action"
```

**Important**: GitHub Actions require the compiled code to be committed.

### 4. Tag a Release

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

### 5. Update Major Version Tag

```bash
git tag -fa v1 -m "Update v1"
git push origin v1 --force
```

This allows users to reference `uses: your-org/netshield@v1`

## Directory Structure

```
netshield/
├── action.yml              # Action manifest (no inputs)
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── build.sh               # Build script
├── .gitignore             # Ignore node_modules, etc.
│
├── src/
│   ├── index.ts           # Entry point - enforces PR-only
│   ├── scanner.ts         # Gitleaks wrapper
│   ├── annotator.ts       # PR annotations & summary
│   └── types.ts           # TypeScript types
│
├── dist/
│   └── index.js           # Compiled output (must commit)
│
└── .github/
    └── workflows/
        └── example.yml    # Usage example
```

## Development Workflow

1. Make changes in `src/`
2. Run `npm run build`
3. Test locally or in a test repo
4. Commit both source and `dist/index.js`
5. Tag and release

## Testing Locally

You can't easily test GitHub Actions locally, but you can:

1. Create a test repository
2. Add NetShield as a local action:
   ```yaml
   - uses: ./
   ```
3. Open a test PR
4. Verify the action runs and behaves correctly

## No Configuration Philosophy

If you're tempted to add:
- Configuration inputs
- Ignore patterns
- Severity levels
- Override flags

**Stop.** That defeats the purpose. NetShield enforces one rule: no secrets in PRs. Adding flexibility creates security holes.

## Release Checklist

- [ ] All TypeScript compiles without errors
- [ ] `dist/index.js` is built and committed
- [ ] Version in `package.json` is updated
- [ ] Git tag matches package version
- [ ] README examples reference correct version
- [ ] Action tested in a real PR

## Publishing to GitHub Marketplace

1. Ensure `action.yml` has correct metadata
2. Tag a release: `git tag v1.0.0`
3. Push the tag: `git push origin v1.0.0`
4. Go to GitHub Releases
5. Create a release from the tag
6. Check "Publish to GitHub Marketplace"

Users can then use:
```yaml
- uses: your-org/netshield@v1
```
