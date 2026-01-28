#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

cd client
npm install
npm run build
cd ..

export FLASK_APP=server.app
flask db upgrade

# Create admin user from env vars if set (skips if user already exists)
if [ -n "$ADMIN_USERNAME" ] && [ -n "$ADMIN_PASSWORD" ]; then
  python -m server.cli create-user "$ADMIN_USERNAME" "$ADMIN_PASSWORD" || true
fi
