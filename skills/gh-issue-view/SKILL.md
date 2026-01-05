---
name: gh-issue-view
description: View GitHub issue details, comments, and JSON fields using gh CLI.
allowed-tools: Bash, Read, Grep
handoffs:
  - label: Comment
    agent: gh-issue-comment
    prompt: Add a comment to this issue
    send: true
  - label: Edit
    agent: gh-issue-edit
    prompt: Edit this issue
    send: true
---

# GitHub Issue View

## When to use
- The user asks to see an issue's status, details, or comments.

## Inputs to confirm
- Issue number or URL.
- Whether comments or JSON output are needed.
- Target repo if not current (`--repo OWNER/REPO`).

## Workflow
1) Verify auth:
   ```bash
   gh --version
   gh auth status
   ```
2) View issue summary:
   ```bash
   gh issue view 123
   ```
3) View comments or JSON:
   ```bash
   gh issue view 123 --comments
   gh issue view 123 --json number,title,state,labels --jq '.title'
   ```
4) Optional web view:
   ```bash
   gh issue view 123 --web
   ```

## Examples
```bash
# Get title and state via JSON
~ gh issue view 123 --json title,state --jq '"\(.title) (\(.state))"'
```

## Notes
- `--template` supports Go templates; see `gh help formatting`.

## References
- GitHub CLI manual: https://cli.github.com/manual/
- `gh issue view --help`
