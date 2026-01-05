---
name: gh-pr-ready
description: Mark a pull request as ready for review (or convert back to draft) using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View PR
    agent: gh-pr-view
    prompt: View this PR
    send: true
---

# GitHub PR Ready

## When to use
- The user asks to mark a draft PR as ready for review.
- You need to convert a PR back to draft (`--undo`).

## Inputs to confirm
- PR number/URL/branch (or use current branch PR).
- Whether to mark ready or undo.

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Mark ready or undo:
   ```bash
   gh pr ready 123
   gh pr ready 123 --undo
   ```

## Examples
```bash
# Mark current branch PR as ready
~ gh pr ready
```

## Notes
- Without an argument, `gh pr ready` targets the PR for the current branch.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh pr ready --help`
