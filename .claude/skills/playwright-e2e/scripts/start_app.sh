#!/usr/bin/env bash
# start_app.sh - Start web app for E2E testing
set -euo pipefail

# Detect package manager
detect_package_manager() {
  if [ -f "pnpm-lock.yaml" ]; then
    echo "pnpm"
  elif [ -f "yarn.lock" ]; then
    echo "yarn"
  elif [ -f "bun.lockb" ]; then
    echo "bun"
  elif [ -f "package-lock.json" ] || [ -f "package.json" ]; then
    echo "npm"
  else
    echo "npm"
  fi
}

# Detect dev server command from package.json
detect_dev_command() {
  if command -v jq &> /dev/null; then
    # Use jq if available
    DEV_CMD=$(jq -r '.scripts.dev // .scripts.start // "start"' package.json 2>/dev/null || echo "start")
  else
    # Fallback: prefer dev, then start
    if grep -q '"dev":' package.json; then
      DEV_CMD="dev"
    elif grep -q '"start":' package.json; then
      DEV_CMD="start"
    else
      DEV_CMD="start"
    fi
  fi
  echo "$DEV_CMD"
}

PM=$(detect_package_manager)
DEV_CMD=$(detect_dev_command)

echo "📦 Package manager: $PM"
echo "🚀 Dev command: $DEV_CMD"

# Respect environment variables
export PORT="${PORT:-3000}"
export NODE_ENV="${NODE_ENV:-development}"

echo "🌐 Starting app on port $PORT..."

# Start the app
case "$PM" in
  pnpm)
    pnpm run "$DEV_CMD"
    ;;
  yarn)
    yarn "$DEV_CMD"
    ;;
  bun)
    bun run "$DEV_CMD"
    ;;
  npm)
    npm run "$DEV_CMD"
    ;;
esac
