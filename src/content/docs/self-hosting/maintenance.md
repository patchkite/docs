---
title: Maintenance
description: Storage cleanup, backups, restores, and upgrades.
sidebar:
  order: 3
---

## Storage cleanup

Package files are shared between releases — promote and rollback don't copy them. When an app, deployment, or release history is deleted, files nothing uses anymore are cleaned up automatically every `GC_INTERVAL_MINUTES`. Admins can run it by hand:

```bash
patchkite admin gc --dry-run   # list the blobs that would be deleted
patchkite admin gc
```

Don't enable an automatic-deletion lifecycle rule on the bucket. Cleanup only touches the `packages/`, `manifests/`, and `diffs/` prefixes, but a dedicated bucket is still recommended.

## Backups

Back up two things: the **database** and the **bucket**. The server keeps no other state.

### PostgreSQL

A daily dump from cron on the host (for `docker-compose.prod.yml`):

```bash
# /etc/cron.d/patchkite-backup
0 2 * * * root cd /opt/patchkite/docker && docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U patchkite -Fc patchkite > /backups/patchkite-$(date +\%F).dump' \
  && find /opt/patchkite/docker/backups -name '*.dump' -mtime +14 -delete
```

For the single-host setup, `docker/backup.sh` dumps PostgreSQL and archives the RustFS volume into `backups/` (root-only, kept for 14 days):

```bash
echo "30 2 * * * root /home/<user>/patchkite/backup.sh >> /home/<user>/patchkite/backups/backup.log 2>&1" | sudo tee /etc/cron.d/patchkite-backup
```

Copy backups off the host regularly (rclone, restic, another bucket). A backup on the same disk doesn't protect you from losing the host.

Restore:

```bash
docker compose -f docker-compose.prod.yml stop server
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U patchkite -d patchkite --clean --if-exists < backups/patchkite-2026-10-01.dump
docker compose -f docker-compose.prod.yml start server
```

### Bucket

- **S3**: enable *Versioning*, with a lifecycle rule that deletes noncurrent versions after 30 days. Files removed by cleanup stay recoverable for that period.
- **R2, RustFS, MinIO**: sync to a second bucket regularly, e.g. `rclone sync r2:patchkite backup:patchkite-backup`.

After restoring an old database backup, run `patchkite admin gc --dry-run` first: blobs created after the backup will show up as orphaned. Delete them only if you don't need them.

## Upgrades

```bash
cd patchkite && git pull
cd docker && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d
```

Migrations run automatically when the server starts. Back up the database before upgrading to a new major version.

### Automated deploys (single host)

`docker/deploy.sh` deploys a given image tag: it pulls the image, runs a backup, updates `PATCHKITE_IMAGE` in `.env`, restarts the server, and switches back to the previous image if the server doesn't become healthy. Install it with a CI-only SSH key restricted to that script:

```bash
cp docker/deploy.sh ~/patchkite/deploy.sh && chmod +x ~/patchkite/deploy.sh
ssh-keygen -t ed25519 -N "" -C patchkite-ci-deploy -f patchkite-ci-deploy   # on your laptop
echo "command=\"/home/<user>/patchkite/deploy.sh\",restrict $(cat patchkite-ci-deploy.pub)" | ssh <user>@<host> 'cat >> ~/.ssh/authorized_keys'
```

Your CI then runs `ssh -i <key> <user>@<host> 1.2.0` to deploy `ghcr.io/patchkite/server:1.2.0`. Automatic rollback is only safe for migrations that add columns, not ones that drop or change them.
