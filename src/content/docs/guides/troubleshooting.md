---
title: Troubleshooting
description: Common problems and how to fix them.
sidebar:
  order: 6
---

Start by streaming the SDK's logs while the app runs on a device or emulator:

```bash
patchkite debug android   # or: patchkite debug ios
```

| Symptom | What to check |
|---|---|
| The app never receives an update | Run `patchkite deployment history MyApp Staging`. Does the release's target binary version match the app's version? Is the key in the build the key of the deployment you released to? Is the release disabled, or is the device outside the rollout? Are you testing a release build? |
| The update downloads but doesn't show up | The default install mode is `ON_NEXT_RESTART`: close the app completely and open it again. |
| The app goes back to the old version | Automatic rollback: the update crashed or never called `notifyAppReady()`. Check the rollback count in the dashboard, fix the bug, and release a new label. |
| `Package hash mismatch` | The package was corrupted in transit or storage. Check proxies or CDNs in front of your storage. |
| `Invalid package signature` | The release was signed with a different private key, or not signed while the app has `PatchkitePublicKey`. Check that CI uses the private key matching the public key in the app. |
| Flutter app never receives an update | The engine revision must match: the binary and the update must be built with exactly the same Flutter version. |
| Release fails with an "identical" error | The package is the same as the latest release. Use `--noDuplicateReleaseError` in CI. |
| `429 Too Many Requests` | Per-IP rate limiting. If many devices share one NAT (offices, carrier networks), raise `RATE_LIMIT_PUBLIC_PER_MINUTE` on the server. |
| Android emulator can't reach a local server | Use `http://10.0.2.2:3000` instead of `localhost`. |
