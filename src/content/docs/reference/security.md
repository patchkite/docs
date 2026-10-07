---
title: Security model
description: What Patchkite protects against, what it doesn't, and how to operate it safely.
sidebar:
  order: 5
---

## Protections

- **Code signing.** With a public key configured, the SDK only installs packages whose RS256 signature verifies and whose `contentHash` matches the recomputed [package hash](../package-format/). `alg: none` and other algorithms are rejected.
- **Safe extraction.** Zip entries that would escape the package directory (zip slip) are rejected on the server and the device; `deletedFiles` paths outside the package are ignored; extracted size is capped at 1 GB on devices.
- **Hidden files can't bypass verification.** `__MACOSX`, `.DS_Store`, and stray signature files are deleted before hashing, so an unverified bundle can't be smuggled next to a verified one.
- **Accounts.** Passwords are hashed with argon2 (max 256 characters); login takes the same time whether or not the account exists; logins and registrations are rate limited per IP.
- **Access keys.** 240 random bits, stored as SHA-256, revocable, and expiring (at most 10 years).
- **Authorization.** Every management route checks app membership; destructive actions (deleting apps or deployments, clearing history, managing collaborators) are owner-only; admin routes check the admin flag.
- **Input limits.** Lengths are bounded across all schemas; uploads are limited in size, file count, and extracted size; device reports are only recorded for labels that exist, with bounded formats.
- **Dashboard.** Strict CSP (`script-src 'self'`, `frame-ancestors 'none'`), `X-Frame-Options`, `nosniff`, and `Referrer-Policy`.
- **Container.** The server runs as a non-root user.

## Accepted risks

- **Package URLs are guessable from the hash.** Anyone who knows a package hash can download it. Hashes only appear in `update_check` responses (which need a deployment key), and package contents are sent to every device anyway. Don't put secrets in your JS or Dart code.
- **Downgrades with an old, valid package.** A signature binds the contents, not the label or target version. Use HTTPS so `update_check` responses can't be forged.
- **Collaborators can release and promote to Production.** Only add people you trust.
- **CORS is open (`*`).** Authentication uses a bearer header, not cookies, so there is no CSRF exposure.
- **Deployment keys appear in request logs.** `update_check` takes the key as a query parameter; the key is embedded in apps and is not a secret.

## Operating safely

- Always serve Patchkite over HTTPS, and enable code signing for production apps.
- Keep the signing private key in your CI's secret store, not in a repository.
- Give each CI pipeline its own access key with a reasonable TTL, and revoke unused keys.
- Close registration (`ALLOW_REGISTRATION=false`) after creating the admin account.

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub's [private vulnerability reporting](https://github.com/patchkite/patchkite/security/advisories/new) on the affected repository, not in a public issue.
