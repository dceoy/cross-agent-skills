---
name: gh-pr-review
description: Submit pull request reviews (approve, comment, or request changes) using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View PR
    agent: gh-pr-view
    prompt: View this PR before reviewing
    send: true
---

# GitHub PR Review

## When to use
- The user asks to approve, comment on, or request changes for a PR.

## Inputs to confirm
- PR number/URL/branch (or use current branch PR).
- Review type: approve, comment, or request changes.
- Review body text (or file).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Submit review:
   ```bash
   gh pr review 123 --approve --body "LGTM"
   gh pr review 123 --comment --body "Looks good, minor nits below"
   gh pr review 123 --request-changes --body "Please add tests"
   ```
3) Confirm status:
   ```bash
   gh pr view 123 --json reviewDecision
   ```

## Examples
```bash
# Approve current branch PR
~ gh pr review --approve --body "LGTM"
```

## Notes
- You cannot approve your own PR.
- Use `--body-file` to provide longer feedback.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh pr review --help`
