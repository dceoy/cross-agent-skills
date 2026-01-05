---
name: gh-pr-view
description: View GitHub pull request details, checks, and JSON fields using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: Create PR
    agent: gh-pr-create
    prompt: Create a new pull request
    send: true
  - label: Mark Ready
    agent: gh-pr-ready
    prompt: Mark this PR as ready for review
    send: true
---

# GitHub PR View

## When to use
- The user asks to inspect a PR, its checks, or reviews.

## Inputs to confirm
- PR number/URL/branch (or use current branch PR).
- Whether to show comments or JSON output.
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) View PR summary:
   ```bash
   gh pr view 123
   ```
3) View comments or JSON:
   ```bash
   gh pr view 123 --comments
   gh pr view 123 --json title,state,reviewDecision --jq '.title'
   ```
4) Optional web view:
   ```bash
   gh pr view 123 --web
   ```

## Examples
```bash
# Get review decision via JSON
~ gh pr view 123 --json reviewDecision --jq '.reviewDecision'
```

## Notes
- `--template` supports Go templates; see `gh help formatting`.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh pr view --help`
