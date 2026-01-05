---
name: gh-issue-edit
description: Edit GitHub issues (title, body, labels, assignees, milestones, projects) using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View Issue
    agent: gh-issue-view
    prompt: View this issue before editing
    send: true
---

# GitHub Issue Edit

## When to use
- The user asks to update issue metadata or content.
- You need to add/remove labels, assignees, milestones, or projects.

## Inputs to confirm
- Issue number(s) or URL(s).
- Changes to apply (title/body/labels/etc.).
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Apply edits:
   ```bash
   gh issue edit 123 --title "New title" --body "Updated body"
   gh issue edit 123 --add-label "bug" --remove-label "triage"
   gh issue edit 123 --add-assignee "@me"
   ```
3) Verify:
   ```bash
   gh issue view 123
   ```

## Examples
```bash
# Add labels and assign yourself
~ gh issue edit 123 --add-label "help wanted" --add-assignee "@me"
```

## Notes
- `--add-assignee`/`--remove-assignee` support `@me` and `@copilot` (GitHub.com only).
- Project edits may require `gh auth refresh -s project`.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh issue edit --help`
