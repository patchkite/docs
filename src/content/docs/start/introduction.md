---
title: Introduction
description: What Patchkite is, how it works, and the concepts you'll meet in the rest of the docs.
sidebar:
  order: 1
---

Patchkite delivers over-the-air (OTA) updates to mobile apps. When you fix a bug in your JavaScript or Dart code, you release the new code to a Patchkite server, and installed apps download it the next time they check — no app store review needed.

It follows the model popularized by Microsoft CodePush, so if you've used CodePush the concepts will feel familiar.

## Components

| Component | Repository | Description |
|---|---|---|
| Server and dashboard | [patchkite/patchkite](https://github.com/patchkite/patchkite) | Fastify API with PostgreSQL and S3-compatible storage; the web dashboard is served at `/web/` |
| CLI | [patchkite/cli](https://github.com/patchkite/cli) | `@patchkite/cli` on npm, installs the `patchkite` command |
| React Native SDK | [patchkite/react-native](https://github.com/patchkite/react-native) | `@patchkite/react-native` (New Architecture / TurboModule, iOS and Android) |
| Flutter SDK | [patchkite/flutter](https://github.com/patchkite/flutter) | `patchkite` on pub.dev (Android) |

## How an update reaches a device

1. You run `patchkite release-react` (or `release-flutter`). The CLI builds your JS bundle or Dart AOT library, zips it, optionally signs it, and uploads it to a **deployment**.
2. The app, built with the SDK and a **deployment key**, asks the server for updates on start or resume.
3. The server picks the newest release whose **target binary version** matches the app's version and that the device falls into the **rollout** for, and returns a download URL. If the device already has an earlier release, it gets a diff instead of the whole package.
4. The SDK downloads the package, verifies its hash and signature, and installs it according to the **install mode** (immediately, on next restart, or on next resume).
5. Once the new code calls `notifyAppReady()`, the update is marked as successful. If the app crashes before that, the SDK rolls back to the previous version and reports the failure.

## Concepts

**App**
: One Patchkite app per platform, for example `MyApp-iOS` and `MyApp-Android`, because their bundles differ.

**Deployment**
: A release channel with its own deployment key. Every app starts with `Staging` and `Production`; you can add more, such as `QA`. A device only receives updates from the deployment whose key is built into its binary.

**Release**
: An uploaded package, labeled `v1`, `v2`, … per deployment. Releases can be mandatory, disabled, or rolled out to a percentage of devices.

**Target binary version**
: A semver range (`1.0.0`, `1.2.x`, `^1.2.3`, `*`) that says which installed app versions may receive a release.

**Promote**
: Copy a tested release from one deployment to another without rebuilding, for example from `Staging` to `Production`.

**Rollback**
: Re-release a previous release on a deployment. Devices move back on their next check.

## What can and can't be updated

You can update JavaScript (React Native), Dart (Flutter), and — for React Native — bundled assets. Anything native still needs a store release: new native modules or plugins, permissions, `Info.plist`/`AndroidManifest.xml` changes, or a new React Native or Flutter version.

Flutter updates are **Android only**. Apple doesn't allow apps to load new native code, and Flutter release builds compile Dart to native AOT code. The Flutter SDK still works on iOS, but it always reports "up to date".

:::caution[Store policies]
Make sure your use of OTA updates complies with the policies of the stores you distribute through. Google Play's *Device and Network Abuse* policy and Apple's App Review Guidelines both restrict downloading executable code; updates should fix bugs and not change the app's primary purpose.
:::
