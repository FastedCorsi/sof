#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${VPS_DEPLOY_PATH:?VPS_DEPLOY_PATH is required}"
BACKEND_ENV="${BACKEND_ENV:-production}"
STAGING_DIR="$(pwd)"

mkdir -p "$APP_DIR/backend"
rsync -az --delete "$STAGING_DIR/package.json" "$STAGING_DIR/package-lock.json" "$STAGING_DIR/dist" "$APP_DIR/backend/"

cd "$APP_DIR/backend"
npm ci --omit=dev

cat > .env <<EOF
BACKEND_ENV=$BACKEND_ENV
DATABASE_URL=${DATABASE_URL:?DATABASE_URL is required}
PUBLIC_BACKEND_URL=${PUBLIC_BACKEND_URL:-}
PUBLIC_WS_URL=${PUBLIC_WS_URL:-}
EOF

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart sea-of-fire-backend
else
  pkill -f "sea-of-fire-backend" || true
  nohup npm start >/tmp/sea-of-fire-backend.log 2>&1 &
fi
