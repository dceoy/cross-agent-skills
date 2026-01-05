---
name: gh-issue-develop
description: Manage linked branches for GitHub issues using gh issue develop.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View Issue
    agent: gh-issue-view
    prompt: View this issue before creating a branch
    send: true
---

# GitHub Issue Develop

## When to use
- The user asks to create or list branches linked to an issue.
- You need a branch name tied to an issue.

## Inputs to confirm
- Issue number or URL.
- Branch name (optional) and base branch.
- Whether to checkout after creation.
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) List linked branches:
   ```bash
   gh issue develop --list 123
   ```
3) Create a branch (optionally checkout):
   ```bash
   gh issue develop 123 --name "feature/123-fix" --base main --checkout
   ```

## Examples
```bash
# Create and checkout a branch for issue 123
~ gh issue develop 123 --checkout
```

## Notes
- `--branch-repo` allows creating the branch in a fork.
- `--base` sets the remote base branch for the new branch.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh issue develop --help`
