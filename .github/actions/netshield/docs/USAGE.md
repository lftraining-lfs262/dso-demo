# NetShield Usage Example

## Minimal Setup

### 1. Create Workflow File

`.github/workflows/security.yml`:

```yaml
name: Security

on:
  pull_request:

jobs:
  secrets:
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

### 2. That's It

No configuration file. No policy. No settings. Just run it.

## What Happens

### ✅ When No Secrets Are Detected

```
✅ NetShield: No secrets detected
```

CI passes. PR can be merged.

### ❌ When Secrets Are Detected

```
❌ NetShield blocked: 3 secret(s) detected

File: src/config.ts
Line: 42
Rule: aws-access-token

File: scripts/deploy.sh  
Line: 15
Rule: generic-api-key

File: .env.example
Line: 8
Rule: slack-webhook-url
```

CI fails. PR cannot be merged until secrets are removed.

## Common Questions

**Q: Can I ignore false positives?**  
A: No. Remove the content or refactor to eliminate the detection.

**Q: Can I set a severity threshold?**  
A: No. Any secret blocks the PR.

**Q: Can I configure custom rules?**  
A: No. NetShield uses gitleaks defaults.

**Q: What if I need an exception?**  
A: Remove NetShield from your workflow or use a different tool.

**Q: Can I see what was detected?**  
A: Yes, but it will be redacted. You'll see the file, line, and rule type.

## Integration with Branch Protection

Recommended GitHub branch protection rules:

1. Require status checks to pass
2. Add "NetShield Secrets Scan" as a required check
3. Require branches to be up to date

This ensures no PR can merge with secrets detected.

## Debugging

If NetShield fails unexpectedly:

1. Check that the action runs only on pull requests
2. Ensure checkout uses `fetch-depth: 0`
3. Verify permissions include `contents: read` and `pull-requests: write`

## Philosophy in Action

NetShield embodies a single principle: **secrets don't belong in code**.

There are no legitimate reasons to commit secrets, so there are no configuration options to weaken enforcement. If you disagree with this philosophy, NetShield isn't for you.
