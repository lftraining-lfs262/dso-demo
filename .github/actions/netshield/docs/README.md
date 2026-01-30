# 🛡️ NetShield

**Zero-configuration secrets detection for GitHub pull requests.**

NetShield enforces secrets detection in CI with no escape hatches, no configuration, and no exceptions.

## Philosophy

- **Opinionated**: No configuration options
- **Strict**: If secrets are detected, CI fails
- **Simple**: One job, one verdict
- **PR-only**: Only runs on pull requests

## Usage

Add this to `.github/workflows/security.yml`:

```yaml
name: Security

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  netshield:
    name: Secrets Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: your-org/netshield@v1
```

That's it. No inputs, no configuration, no policy files.

## Behavior

1. Scans the PR diff for secrets using gitleaks
2. Annotates files with line-level findings
3. Fails CI if any secrets are detected
4. Passes if no secrets are found

## What It Detects

NetShield uses gitleaks' default ruleset to detect:

- API keys and tokens
- Private keys and certificates
- Database credentials
- Cloud provider secrets
- Generic high-entropy strings

## What It Doesn't Do

- ❌ Allow configuration
- ❌ Support ignore files
- ❌ Provide severity levels
- ❌ Offer override mechanisms
- ❌ Generate reports or dashboards

## Why No Configuration?

Secrets in code are always wrong. Adding configuration would create escape hatches that undermine security. NetShield makes one decision: block secrets or don't.

If you need flexibility, use a different tool.

## When CI Fails

Remove the secret from your code and push new commits. NetShield will re-scan automatically.

## License

MIT
