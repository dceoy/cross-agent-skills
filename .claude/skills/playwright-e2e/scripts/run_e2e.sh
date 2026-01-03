#!/usr/bin/env bash
# run_e2e.sh - Run Playwright E2E tests with automatic setup
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
    echo "npm"  # Default to npm
  fi
}

PM=$(detect_package_manager)
echo "📦 Detected package manager: $PM"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📥 Installing dependencies..."
  case "$PM" in
    pnpm)
      pnpm install
      ;;
    yarn)
      yarn install
      ;;
    bun)
      bun install
      ;;
    npm)
      npm ci || npm install
      ;;
  esac
fi

# Check if Playwright browsers are installed
if ! command -v playwright &> /dev/null; then
  echo "📥 Installing Playwright browsers..."
  npx playwright install chromium --with-deps
else
  # Check if browsers need update
  if [ "${CI:-false}" = "true" ]; then
    npx playwright install chromium --with-deps
  fi
fi

# Set CI-friendly environment
export CI="${CI:-false}"

# Run tests
echo "🧪 Running E2E tests..."
case "$PM" in
  pnpm)
    pnpm run test:e2e "$@"
    ;;
  yarn)
    yarn test:e2e "$@"
    ;;
  bun)
    bun run test:e2e "$@"
    ;;
  npm)
    npm run test:e2e "$@"
    ;;
esac

echo "✅ E2E tests completed!"
