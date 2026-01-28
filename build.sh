#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

cd client
npm install
npm run build
cd ..

export FLASK_APP=server.app
flask db upgrade
