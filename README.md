# Docker Compose Setup

## Services

* `codex` – Main application (accessible at https://localhost)
* `upload` – Upload service (accessible at https://upload.localhost)
* `db` – PostgreSQL database
* `adminer` (optional) – DB admin interface for testing (http://localhost:8080)
* `caddy` – Reverse proxy with HTTPS

## Setup (Recommended)

1. Clone the repository 

2. Start the services:
```bash
docker-compose up --build
```

3. Run DB refresh for codex:
```bash
docker-compose exec codex npm run refresh_db
```

Credentials and environment variables are managed in docker-compose.yml.

## Setup Without Docker (Not Recommended)

You can run codex and upload manually:

1. Install dependencies in both services:

```bash
cd codex && npm install
```

```bash
cd ../upload && npm install
```

2. Set up environment variables manually in .env files for both services.

3. Start the services:

```bash
npm run dev  # In codex (runs on http://localhost:3000)
```
```bash
npm run dev  # In upload (runs on http://localhost:3001)
```

4. Run DB refresh for codex:

```bash
npm run refresh_db
```

Note: You’ll need to manage HTTPS and the database connection manually in this setup.
