# cli-agent-skills

Cross-platform agent skills and prompts for AI coding assistants.

## Overview

This repository provides reusable skills and templates for multiple agent runtimes:

- **Claude Code** - Skills in `.claude/skills/`
- **GitHub Copilot CLI** - Skills in `.codex/skills/` (copilot-\*)
- **Codex CLI** - Skills in `.codex/skills/` (codex-_, claude-_)
- **Spec Kit** - Spec-Driven Development workflow skills (`speckit-*`)

Each skill lives in a folder with a `SKILL.md` that documents how to run it.

### Spec Kit Workflow

This repository implements the **Spec-Driven Development** methodology via Spec Kit skills. The canonical workflow:

1. **Constitution** → Define project principles
2. **Specify** → Capture feature requirements (what/why)
3. **Clarify** (optional) → Resolve ambiguities
4. **Plan** → Create technical strategy (how)
5. **Analyze** (optional) → Validate consistency
6. **Tasks** → Generate ordered work items
7. **Implement** → Execute development

See **[AGENTS.md](./AGENTS.md#spec-kit-workflow)** for the complete workflow guide with examples and best practices.

## Quick start

1. Clone the repo:

   ```bash
   git clone git@github.com:dceoy/cli-agent-skills.git
   ```

2. Pick a runtime and open a skill's `SKILL.md`:
   - Claude Code skills: `.claude/skills/`
   - Codex CLI skills: `.codex/skills/`

3. Follow the instructions in that `SKILL.md` to invoke the skill from your agent.

## Skills by runtime

### Claude Code (in `.claude/skills/`)

- `copilot-ask`, `copilot-exec`, `copilot-review`
- `codex-ask`, `codex-exec`, `codex-review`
- `speckit-*` workflow skills

### Codex CLI (in `.codex/skills/`)

- `claude-ask`, `claude-exec`, `claude-review`
- `copilot-ask`, `copilot-exec`, `copilot-review`
- `speckit-*` workflow skills

## Structure

```
.
├── .claude/
│   ├── agents/          # Claude Code agent definitions
│   ├── commands/        # Claude Code command prompts (Spec Kit)
│   └── skills/          # Claude Code skill definitions
├── .codex/
│   ├── prompts/         # Codex CLI prompt content (mirrors Spec Kit)
│   └── skills/          # Codex CLI skill definitions
├── .github/
│   ├── agents/          # GitHub automation agents
│   ├── prompts/         # GitHub workflow prompts
│   └── workflows/       # CI workflows
└── .specify/            # Spec Kit templates and memory files
```

## Prerequisites

You need the matching CLI tool installed and authenticated before running a skill.
Refer to each tool's official documentation for installation and login steps.

- Claude Code CLI
- GitHub Copilot CLI
- Codex CLI
- Spec Kit

## Usage notes

- Skills do not always auto-run; use your agent's skill invocation flow or ask for the skill explicitly.
- If a skill fails, open its `SKILL.md` and verify prerequisites and command syntax.
- For Spec Kit workflows, see [AGENTS.md](./AGENTS.md#spec-kit-workflow) for the canonical command sequence and usage guide.

### Quick Spec Kit Example

```bash
# 1. First time: establish project principles
/speckit.constitution

# 2. For each feature: specify what to build
/speckit.specify Add user authentication with email login

# 3. Plan how to build it
/speckit.plan I'm using Node.js with Express and PostgreSQL

# 4. Break into tasks
/speckit.tasks

# 5. Implement
/speckit.implement
```

## Troubleshooting

- Skill not found: confirm the skill directory exists and the name matches the request.
- CLI not in PATH: ensure the tool installs into your shell PATH.
- Auth errors: re-run the tool's login/auth command per its docs.

## Contributing

See `AGENTS.md` for repository guidelines and agent-specific rules.

## License

See `LICENSE` for details.
