# NetShield - Complete Directory Structure

```
netshield/
│
├── action.yml                    # GitHub Action manifest (no inputs/configuration)
├── package.json                  # Node.js dependencies
├── tsconfig.json                 # TypeScript compiler configuration
├── build.sh                      # Build script (compiles TS → JS)
├── .gitignore                    # Git ignore rules
│
├── README.md                     # Main documentation
├── USAGE.md                      # Usage examples and Q&A
├── DEVELOPMENT.md                # Developer setup guide
│
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main entry point - enforces PR-only execution
│   ├── scanner.ts                # Gitleaks wrapper - downloads and runs scanner
│   ├── annotator.ts              # Creates PR annotations and job summaries
│   └── types.ts                  # TypeScript type definitions
│
├── dist/                         # Compiled output (generated, must commit)
│   ├── index.js                  # Bundled JavaScript (created by build)
│   └── README.md                 # Explanation of dist folder
│
└── .github/
    └── workflows/
        └── example.yml           # Example workflow showing usage
```

## File Descriptions

### Root Configuration Files

- **action.yml** - GitHub Action metadata with zero configuration inputs
- **package.json** - Declares dependencies (@actions/core, @actions/exec, @actions/github)
- **tsconfig.json** - TypeScript compiler settings (target ES2022, strict mode)
- **build.sh** - Shell script to compile and bundle the action
- **.gitignore** - Excludes node_modules, gitleaks binaries, and reports

### Documentation

- **README.md** - Philosophy, usage, and what NetShield does/doesn't do
- **USAGE.md** - Practical examples, common questions, integration guide
- **DEVELOPMENT.md** - Build process, release checklist, testing guide

### Source Code (`src/`)

All TypeScript files that implement the core logic:

- **index.ts** (40 lines)
  - Entry point
  - Validates PR-only execution
  - Orchestrates scanner and annotator
  - Error handling

- **scanner.ts** (100 lines)
  - Downloads gitleaks binary
  - Runs scan on repository
  - Parses JSON report
  - Returns normalized findings

- **annotator.ts** (50 lines)
  - Creates GitHub annotations on specific lines
  - Generates job summary table
  - Calls setFailed() to block CI

- **types.ts** (10 lines)
  - SecretFinding interface
  - ScanResult interface

### Compiled Output (`dist/`)

- **index.js** - Single bundled file created by `@vercel/ncc`
  - Contains all source code + dependencies
  - Must be committed for GitHub Actions to work
  - Created by running `npm run build`

### GitHub Workflows (`.github/workflows/`)

- **example.yml** - Demonstrates minimal usage pattern
  - Shows checkout configuration
  - Shows permissions required
  - No configuration options shown (because there are none)

## What Gets Committed

✅ **Must Commit:**
- All source files (`src/`)
- Compiled output (`dist/index.js`)
- Configuration files (`action.yml`, `package.json`, `tsconfig.json`)
- Documentation files

❌ **Never Commit:**
- `node_modules/` (listed in .gitignore)
- `gitleaks` binary (downloaded at runtime)
- `gitleaks-report.json` (generated during scan)

## Build Output

When you run `npm run build`:

1. TypeScript compiles `src/*.ts` → JavaScript
2. `@vercel/ncc` bundles everything into `dist/index.js`
3. Result: Single 1MB+ file with all dependencies embedded

This single file is what GitHub Actions executes.
