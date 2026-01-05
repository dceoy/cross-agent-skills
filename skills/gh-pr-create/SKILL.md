---
name: gh-pr-create
description: Create GitHub pull requests with gh CLI, including draft status, reviewers, labels, and projects.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View PR
    agent: gh-pr-view
    prompt: View the newly created pull request
    send: true
---

# GitHub PR Create

## When to use
- The user asks to open a pull request.
- You need to create a draft or request reviews.

## Inputs to confirm
- Base branch and head branch (if not current).
- Title/body or whether to use `--fill`.
- Draft status, reviewers, labels, assignees, milestone, project.
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Create the PR:
   ```bash
   gh pr create --title "Fix auth" --body "Fixes #123" --base main
   gh pr create --fill --draft --reviewer "alice"
   ```
3) Optional: web flow or template:
   ```bash
   gh pr create --web
   gh pr create --template "pull_request_template.md"
   ```

## Examples
```bash
# Draft PR with auto-filled title/body
~ gh pr create --fill --draft
```

## Notes
- Mention `Fixes #123` / `Closes #123` in the PR body to auto-close issues on merge.
- `--head` supports `user:branch` to target a fork.
- Adding to projects may require `gh auth refresh -s project`.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh pr create --help`
