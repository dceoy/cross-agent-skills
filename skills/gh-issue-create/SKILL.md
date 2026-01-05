---
name: gh-issue-create
description: Create GitHub issues with gh CLI, including labels, assignees, milestones, and projects.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: View Issue
    agent: gh-issue-view
    prompt: View the newly created issue
    send: true
---

# GitHub Issue Create

## When to use
- The user asks to open a new issue.
- You need to file a bug, feature request, or task.

## Inputs to confirm
- Title and body.
- Labels, assignees, milestone, project (optional).
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) Create the issue:
   ```bash
   gh issue create --title "Bug: login fails" --body "Steps to reproduce..."
   gh issue create --label "bug" --assignee "@me"
   ```
3) Optional: use templates or open the web flow:
   ```bash
   gh issue create --template "Bug Report"
   gh issue create --web
   ```

## Examples
```bash
# Create with labels and assignee
~ gh issue create --title "Add caching" --body "Details..." --label "performance" --assignee "@me"
```

## Notes
- `--assignee @me` assigns yourself; `@copilot` is supported on GitHub.com only.
- Adding to projects may require `gh auth refresh -s project`.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh issue create --help`
