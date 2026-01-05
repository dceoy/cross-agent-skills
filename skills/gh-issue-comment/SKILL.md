---
name: gh-issue-comment
description: Add, edit, or delete GitHub issue comments using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View Issue
    agent: gh-issue-view
    prompt: View this issue with all comments
    send: true
  - label: Close Issue
    agent: gh-issue-close
    prompt: Close this resolved issue
    send: true
---

# GitHub Issue Comment

## When to use
- The user asks to comment on an issue or post an update.
- You need to edit or delete your last comment.

## Inputs to confirm
- Issue number or URL.
- Comment body (or file path).
- Whether to edit/delete the last comment.

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Post a comment:
   ```bash
   gh issue comment 123 --body "Status update: fix in progress"
   gh issue comment 123 --body-file update.md
   ```
3) Edit or delete last comment if requested:
   ```bash
   gh issue comment 123 --edit-last --body "Updated info"
   gh issue comment 123 --delete-last --yes
   ```
4) Confirm:
   ```bash
   gh issue view 123 --comments
   ```

## Examples
```bash
# Quick update
~ gh issue comment 123 --body "Working on this now."

# Edit last comment
~ gh issue comment 123 --edit-last --body "Revised ETA: tomorrow."
```

## Notes
- Without `--body`/`--body-file`, `gh` opens an interactive prompt.
- `--web` opens the browser for composing a comment.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh issue comment --help`
