---
title: Releasing from CI
description: Automate releases with access keys, and register store builds for smaller first updates.
sidebar:
  order: 5
---

## Create an access key

Don't use your login session in CI. Create a dedicated access key with an expiry:

```bash
patchkite access-key add "CI MyApp" --ttl 365d
```

Store it as a secret named `PATCHKITE_ACCESS_KEY`. The CLI picks up these environment variables, so no `patchkite login` is needed:

| Variable | Value |
|---|---|
| `PATCHKITE_ACCESS_KEY` | The access key |
| `PATCHKITE_SERVER_URL` | Your server, e.g. `https://patchkite.example.com` |

Revoke keys you no longer use with `patchkite access-key rm`.

## GitHub Actions example

```yaml
name: Patchkite Staging
on:
  push:
    branches: [develop]

jobs:
  release:
    runs-on: ubuntu-latest
    env:
      PATCHKITE_ACCESS_KEY: ${{ secrets.PATCHKITE_ACCESS_KEY }}
      PATCHKITE_SERVER_URL: https://patchkite.example.com
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npm install -g @patchkite/cli
      - run: echo "${{ secrets.PATCHKITE_PRIVATE_KEY }}" > private.pem
      - run: patchkite release-react MyApp-Android android -d Staging --description "${{ github.event.head_commit.message }}" -k private.pem
```

Add `--noDuplicateReleaseError` if the job may run without code changes; the CLI then exits successfully instead of failing when the package is identical to the latest release.

For Flutter, install Flutter with the **same version as your store build** (for example with `subosito/flutter-action` and a pinned `flutter-version`) and use `release-flutter`.

## Register store binaries (React Native)

The first update a freshly installed app receives is normally the full bundle. If you register the bundle inside your store build, Patchkite sends a binary patch against it instead:

```bash
patchkite binary add MyApp-Android android/app/build/outputs/bundle/release/app-release.aab
patchkite binary add MyApp-iOS build/MyApp.ipa
```

Run this in the CI job that produces the store artifact. Patches are smallest when `release-react` uses the same React Native version and Hermes configuration as the store build. List and remove registered binaries with `patchkite binary ls` and `patchkite binary rm`.
