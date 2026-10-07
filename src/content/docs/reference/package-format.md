---
title: Package format and protocol
description: The package hash, signature, diff, and binary patch formats, and the SDK HTTP API.
sidebar:
  order: 4
---

This page specifies what the server, CLI, and SDKs must agree on. If you write your own client or SDK, implement it against this page and test it with the shared fixtures (`fixtures/` in [patchkite/patchkite](https://github.com/patchkite/patchkite)), which contain sample files with their expected hash, signed and tampered JWTs, malicious zips, and a bsdiff patch.

## Package

A package is a zip file. For React Native it contains the JS bundle and assets; for Flutter, `lib/<abi>/libapp.so` per ABI. Paths use `/` as the separator.

These entries are **ignored** everywhere — excluded from the hash and deleted by the SDK before verification: any path segment equal to `.DS_Store`, `__MACOSX`, or `.patchkiterelease` (except the signature at the root).

## Package hash

1. For every non-ignored file, compute the SHA-256 of its contents as lowercase hex.
2. Normalize each path to Unicode **NFC** (iOS stores file names as NFD).
3. Build the strings `"<path>:<fileHash>"` and sort them by path, comparing UTF-16 code units (JavaScript's default string order).
4. Serialize the sorted list as a compact JSON array (`JSON.stringify`, no whitespace) and take the SHA-256 of its UTF-8 bytes, as lowercase hex.

```js
sha256(JSON.stringify(entries.sort(byPath).map(([path, hash]) => `${path.normalize("NFC")}:${hash}`)))
```

## Signature

When signed, the package contains `.patchkiterelease` at its root: a compact JWT (`header.payload.signature`) with header `{"alg":"RS256","typ":"JWT"}` and payload:

```json
{ "claimVersion": "1.0.0", "contentHash": "<package hash>", "iat": 1790000000 }
```

A client with a configured public key must reject the package if the file is missing, the algorithm isn't `RS256`, the signature doesn't verify, or `contentHash` differs from the hash it computed.

## Diff packages

For devices that already run a recent release, the server serves a diff zip instead of the full package:

- Files that changed or were added, at their normal paths.
- `patchkite-diff.json` with `{ "deletedFiles": ["path", …] }`. Clients must ignore paths that resolve outside the package directory.
- Optional binary patches at `.patchkite-patches/<path>` for large changed files (only if the client advertised `bsdiff`).

The client starts from a copy of the currently installed package, applies the diff, and then verifies the hash and signature of the result as if it were a full package.

## Binary patch (bsdiff)

A patch is uncompressed (the zip already deflates it), little-endian:

```
"PATCHK01"          8 bytes magic
newSize             int64
repeat until newSize bytes are written:
  x                 int64   length of the diff block: new[i] = old[oldPos + i] + diff[i] (mod 256)
  y                 int64   length of the extra block, copied verbatim
  z                 int64   seek in old after the diff block (may be negative)
  x diff bytes, then y extra bytes
```

The algorithm is a port of bsdiff 4.3 with qsufsort.

## SDK HTTP API

All endpoints are under `/v1/public`. They are authenticated only by the deployment key, which is embedded in apps and should be considered public.

### `GET /update_check`

| Query | Description |
|---|---|
| `deployment_key` | Required. |
| `app_version` | Required. The binary's version, e.g. `1.4.0`. |
| `package_hash`, `label` | The currently installed update, if any. |
| `client_unique_id` | Stable per-install ID, used for deterministic rollouts. |
| `binary_hash` | Hash of the binary's built-in bundle, to receive a patch against it (React Native). |
| `client_features` | Comma-separated features. `bsdiff` means the client can apply binary patches. |
| `engine_revision` | Flutter engine revision of the binary. |

The response is `{ "update_info": { … } }` with `is_available`, `is_mandatory`, `should_run_binary_version`, `update_app_version`, `target_binary_range`, `app_version`, and, when an update is available, `download_url`, `package_hash`, `label`, `package_size`, `description`, and `is_diff`.

### `GET /download/*`

Serves package and diff blobs, either directly or by redirecting to a presigned storage URL.

### `POST /report_status/download`

`{ "deployment_key", "label", "client_unique_id"? }` — sent after a package is downloaded.

### `POST /report_status/deploy`

`{ "deployment_key", "app_version", "label"?, "status"?: "DeploymentSucceeded" | "DeploymentFailed", "previous_label_or_app_version"?, "previous_deployment_key"?, "client_unique_id"? }` — sent after an update starts successfully or is rolled back.
