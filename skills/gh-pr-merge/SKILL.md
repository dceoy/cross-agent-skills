---
name: gh-pr-merge
description: Merge GitHub pull requests using gh CLI with merge, squash, or rebase strategies and optional auto-merge.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View PR
    agent: gh-pr-view
    prompt: View this PR before merging
    send: true
---

# GitHub PR Merge

## When to use
- The user asks to merge an approved PR.
- You need to enable auto-merge.

## Inputs to confirm
- PR number/URL/branch (or use current branch PR).
- Merge strategy: `--merge`, `--squash`, or `--rebase`.
- Whether to delete the branch, use auto-merge, or use admin override.

## Workflow
1) Verify auth and PR status:
   ```bash
   gh --version
   gh auth status
   gh pr view 123
   ```
2) Merge:
   ```bash
   gh pr merge 123 --squash
   gh pr merge 123 --merge --delete-branch
   ```
3) Enable auto-merge if required checks are pending:
   ```bash
   gh pr merge 123 --auto --squash
   ```

## Examples
```bash
# Squash merge and delete branch
~ gh pr merge 123 --squash --delete-branch
```

## Notes
- If a merge queue is required, `gh pr merge` will use it automatically.
- Use `--admin` only when you have permission to bypass requirements.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh pr merge --help`
