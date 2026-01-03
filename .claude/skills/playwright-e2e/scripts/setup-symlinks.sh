#!/usr/bin/env bash
# setup-symlinks.sh - Create symlinks for playwright-e2e skill
set -euo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

echo "📦 Creating symlinks for playwright-e2e skill..."

# Create symlink in .codex/skills/
if [ ! -e ".codex/skills/playwright-e2e" ]; then
  ln -s ../../.claude/skills/playwright-e2e .codex/skills/playwright-e2e
  echo "✅ Created .codex/skills/playwright-e2e"
else
  echo "⏭️  .codex/skills/playwright-e2e already exists"
fi

# Create symlink in .github/skills/
if [ ! -e ".github/skills/playwright-e2e" ]; then
  ln -s ../../.claude/skills/playwright-e2e .github/skills/playwright-e2e
  echo "✅ Created .github/skills/playwright-e2e"
else
  echo "⏭️  .github/skills/playwright-e2e already exists"
fi

echo "✅ Symlinks created successfully!"
