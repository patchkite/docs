---
title: Deploy to production
description: Run a Patchkite server with HTTPS, a domain, S3-compatible storage, and an admin account.
sidebar:
  order: 1
---

## Architecture

```
devices / CLI / dashboard ──HTTPS──▶ Caddy ──▶ Patchkite server ──▶ PostgreSQL
                                                     │
devices (package downloads) ◀── presigned URL ── S3 / R2
```

- **Server** (`ghcr.io/patchkite/server`): API, the dashboard at `/web/`, and the SDK endpoints at `/v1/public/*`. It is stateless and runs database migrations automatically on start.
- **PostgreSQL**: users, apps, deployments, release metadata, and metrics.
- **S3-compatible storage**: packages, manifests, and diffs. AWS S3 and Cloudflare R2 both work; R2 has no egress fees, which suits update downloads.
- **Caddy**: automatic HTTPS with Let's Encrypt.

## Requirements

- A Linux host with Docker and Docker Compose, with ports 80 and 443 open.
- A domain such as `patchkite.example.com`, with DNS A/AAAA records pointing to the host.
- An S3 or R2 bucket and an access key allowed to `GetObject`, `PutObject`, `DeleteObject`, and `ListBucket`.
- At least 1 vCPU and 1 GB of RAM. Uploads are streamed to disk, so memory doesn't grow with package size; keep free space in `/tmp` of at least twice your largest package.

## Deploy

```bash
git clone https://github.com/patchkite/patchkite.git
cd patchkite/docker
cp .env.prod.example .env
# fill in PATCHKITE_DOMAIN, POSTGRES_PASSWORD, and S3_*
docker compose -f docker-compose.prod.yml up -d
curl https://patchkite.example.com/health   # {"status":"ok"}
```

## Create the first admin

The first account on a server becomes an **admin**, even with `ALLOW_REGISTRATION=false`:

```bash
patchkite register https://patchkite.example.com --email admin@example.com
```

After that, registration is closed and admins create accounts from the dashboard (**Users**) or the CLI:

```bash
patchkite admin user add dev@example.com --name "Dev"     # prints a temporary password
patchkite admin user ls
patchkite admin user reset-password dev@example.com
patchkite admin user set-admin dev@example.com            # --revoke to remove admin rights
patchkite admin user rm dev@example.com --transfer-to admin@example.com
```

Users change their temporary password from the dashboard (**Account**) or with `patchkite change-password`.

## Alternative: a single host behind a tunnel

If HTTPS is handled elsewhere — Cloudflare Tunnel, an existing Nginx, or a load balancer — use `docker/docker-compose.selfhost.yml`. It runs the server, PostgreSQL, and RustFS on one host, exposes only the server port, and streams package downloads through the server (`BLOB_DOWNLOAD_MODE=proxy`) so storage never needs to be public.

```bash
mkdir -p ~/patchkite/backups && cd ~/patchkite
# copy docker/docker-compose.selfhost.yml here as docker-compose.yml, then create .env:
umask 077; cat > .env <<ENV
PUBLIC_URL=https://patchkite.example.com
PATCHKITE_IMAGE=ghcr.io/patchkite/server:latest
PATCHKITE_PORT=3000
ALLOW_REGISTRATION=false
POSTGRES_PASSWORD=$(openssl rand -hex 24)
S3_ACCESS_KEY_ID=patchkite
S3_SECRET_ACCESS_KEY=$(openssl rand -hex 24)
ENV
docker compose up -d
```

Then point your tunnel or proxy at `http://<host>:3000` and set `TRUST_PROXY=true`.

## Before you ship to production apps

- [ ] `https://<domain>/health` returns `{"status":"ok"}` with a valid certificate.
- [ ] `ALLOW_REGISTRATION=false`, and the admin account exists.
- [ ] CI uses an access key created with `patchkite access-key add <name> --ttl 365d`, not a login session.
- [ ] [Code signing](../../guides/code-signing/) is enabled.
- [ ] Package downloads work from a real device on a mobile network.
- [ ] Database backups are scheduled and a restore has been tested ([Maintenance](../maintenance/)).
- [ ] Bucket versioning or replication is enabled.
