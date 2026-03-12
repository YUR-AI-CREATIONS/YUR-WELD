#!/usr/bin/env bash
set -euo pipefail

echo "=== Oracle Prime Elite — Production Build ==="

export NODE_ENV=production

echo "[1/3] Installing dependencies..."
npm ci --omit=dev 2>/dev/null || npm install

echo "[2/3] Building for production..."
npx vite build --outDir dist

echo "[3/3] Build complete."
echo "Output: dist/"
ls -lh dist/ 2>/dev/null || echo "(dist/ listing unavailable)"
echo "=== Done ==="
