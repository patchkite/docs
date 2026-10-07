---
title: Configuration
description: Every environment variable the Patchkite server reads.
sidebar:
  order: 2
---

The server is configured with environment variables. With Docker Compose, put them in `docker/.env`.

## General

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port. |
| `PUBLIC_URL` | `http://localhost:3000` | Public URL of the server, used to build download URLs in `update_check` responses. It must be reachable by devices. |
| `DATABASE_URL` | `postgres://patchkite:patchkite@localhost:5432/patchkite` | PostgreSQL connection string. |
| `DASHBOARD_DIR` | empty | Folder with the dashboard build to serve at `/web/`. Set in the Docker image. |
| `ALLOW_REGISTRATION` | `true` | `false` lets only admins create accounts. The first account can always register and becomes admin. |
| `TRUST_PROXY` | `false` | Set to `true` behind Caddy, Nginx, or a load balancer so rate limits use the real client IP. |

## Storage

| Variable | Default | Description |
|---|---|---|
| `STORAGE_DRIVER` | `s3` | `s3`, or `fs` for a local folder (single server instance only, back up the volume). |
| `S3_ENDPOINT` | | S3-compatible endpoint, e.g. `https://<account-id>.r2.cloudflarestorage.com`. |
| `S3_REGION` | | `auto` for R2. |
| `S3_BUCKET` | `patchkite` | Bucket name. Use a bucket dedicated to Patchkite. |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | | Credentials. |
| `S3_FORCE_PATH_STYLE` | `true` | Path-style addressing (needed for RustFS/MinIO). |
| `S3_PUBLIC_ENDPOINT` | empty | Endpoint used in presigned URLs, if devices reach storage at a different address than the server. |
| `BLOB_DOWNLOAD_MODE` | `redirect` | `redirect` sends devices to a presigned S3 URL (valid for 1 hour); `proxy` streams downloads through the server, for storage that isn't public. |
| `FS_STORAGE_DIR` | `./data/blobs` | Folder for `STORAGE_DRIVER=fs`. |

## Limits

| Variable | Default | Description |
|---|---|---|
| `MAX_PACKAGE_SIZE_MB` | `200` | Maximum upload (zip) size. |
| `MAX_UNCOMPRESSED_SIZE_MB` | `1024` | Maximum extracted size (zip bomb protection). |
| `RATE_LIMIT_PUBLIC_PER_MINUTE` | `300` | Requests per IP per minute to SDK endpoints. Raise it if many devices share one NAT. `0` disables the limit. |
| `RATE_LIMIT_AUTH_PER_MINUTE` | `10` | Login and registration attempts per IP per minute. |

## Diffs and binary patches

| Variable | Default | Description |
|---|---|---|
| `DIFF_HISTORY_DEPTH` | `5` | Number of previous releases to generate diffs against. |
| `BSDIFF_ENABLED` | `true` | Generate bsdiff binary patches for large changed files (JS bundle, `libapp.so`) in the background. |
| `BSDIFF_MIN_FILE_KB` | `32` | Smaller files are sent whole. |
| `BSDIFF_MAX_FILE_MB` | `64` | Larger files are sent whole. bsdiff needs about 10× the file size in memory. |

## Storage cleanup

| Variable | Default | Description |
|---|---|---|
| `GC_INTERVAL_MINUTES` | `60` | How often orphaned blobs are deleted. `0` disables it. |
| `GC_GRACE_MINUTES` | `60` | Only blobs older than this are deleted, so in-flight uploads are safe. |
