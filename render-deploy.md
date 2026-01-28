# Deploying Ficcionarios to Render

## Prerequisites

- A [Render](https://render.com) account (free tier works)
- This repository pushed to GitHub

## Option A: One-Click Deploy (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and create both the web service and PostgreSQL database automatically
6. Wait for the build to complete

## Option B: Manual Setup

### 1. Create PostgreSQL Database

1. In Render Dashboard, click **New** → **PostgreSQL**
2. Name: `ficcionarios-db`
3. Plan: **Free**
4. Click **Create Database**
5. Copy the **Internal Database URL** for the next step

### 2. Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ficcionarios`
   - **Runtime**: Python
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn server.app:app`
4. Add environment variables:
   - `DATABASE_URL` = the Internal Database URL from step 1
   - `SECRET_KEY` = any random string (use `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `FLASK_ENV` = `production`
   - `PYTHON_VERSION` = `3.12`
   - `NODE_VERSION` = `20`
5. Click **Create Web Service**

### 3. Create Your First User

After the deploy succeeds:

1. Go to your web service in Render Dashboard
2. Click the **Shell** tab
3. Run:
   ```bash
   python -m server.cli create-user <username> <password>
   ```

## Notes

- **Free tier**: The service spins down after 15 minutes of inactivity. First request after idle takes ~30-50 seconds.
- **Database**: The free PostgreSQL database expires after 90 days. Render will notify you before expiration.
- **KindleGen**: The `server/bin/kindlegen.exe` binary is Windows-only. For Linux (Render), you need the Linux KindleGen binary placed at `server/bin/kindlegen`. This is only needed for `.mobi` generation.
