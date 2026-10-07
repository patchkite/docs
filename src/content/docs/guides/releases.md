---
title: Deployments and releases
description: Release, promote, roll out, and roll back updates, and target the right binary versions.
sidebar:
  order: 3
---

## Deployments

A deployment is a release channel with its own deployment key. A device only receives updates from the deployment whose key is built into the binary it runs. Every app gets `Staging` and `Production`; add more with `patchkite deployment add MyApp QA`. Deployments don't form a pipeline — you can promote from any deployment to any other.

## A typical flow

```bash
patchkite release-react MyApp-Android android                 # goes to Staging by default
# testers running a Staging build receive the update and check it
patchkite promote MyApp-Android Staging Production -r 20       # same package, 20% of devices
patchkite patch MyApp-Android Production -r 100                # finish the rollout
patchkite rollback MyApp-Android Production                    # if something goes wrong
```

| Command | What it does |
|---|---|
| `release`, `release-react`, `release-flutter` | Upload a new release (`v1`, `v2`, …) to a deployment. |
| `promote` | Copy the latest (or `--label`) release of one deployment to another, without rebuilding. |
| `patch` | Change a release's metadata: description, mandatory, disabled, rollout, target binary version. |
| `rollback` | Re-release the previous (or `--targetRelease`) release. |
| `deployment history` | List releases with their install metrics. |
| `deployment clear` | Delete a deployment's entire release history. |

## Rollouts

`-r/--rollout 20` offers a release to 20% of devices. The choice is deterministic per device, so the same devices stay in the rollout as you increase it. A rollout can only be increased, and you can't release on top of an unfinished rollout — finish it (`-r 100`) or disable it (`patch -x`) first.

## Mandatory and disabled releases

- `-m/--mandatory` makes the SDK install the update with `mandatoryInstallMode` (immediately by default) and skip the update dialog's "later" option. A device that skipped earlier releases still gets a mandatory one if any release between its version and the latest is mandatory.
- `-x/--disabled` uploads a release that no device downloads until you `patch ... -x false`.

## Target binary version

Each release targets a semver range of app versions. The server returns the newest release whose range matches the device's binary version, so several releases can be live at once for different binaries:

| Release | Target | Device on 1.0.0 | Device on 1.1.0 / 1.1.5 | Device on 1.2.0 |
|---|---|---|---|---|
| v2 | `1.0.0` | receives v2 | | |
| v3 | `1.1.x` | | receives v3 | no update |

When you ship a store binary with native changes, release JS/Dart updates targeting that binary's version (for example `-t 1.1.x`), so users on older binaries never get code that needs the new native code. `release-react` and `release-flutter` read the version from your project when `-t` is omitted. Change it later with `patchkite patch MyApp Production -l v3 -t "1.1.x"`.

## Deployment keys per build

Build internal/QA binaries with the **Staging** key and store binaries with the **Production** key, from the same code.

:::danger[Don't put deployment keys in JS or Dart]
A key in your JavaScript or Dart code (a constant, `--dart-define`, a `.env` file bundled into JS) becomes part of the update. When you promote that update from Staging to Production, Production devices switch to the Staging key. Keep keys in native configuration as shown below.
:::

### React Native — Android

Remove `PatchkiteDeploymentKey` from `strings.xml` and define it per build type in `android/app/build.gradle`:

```gradle
android {
  buildTypes {
    debug {
      resValue "string", "PatchkiteDeploymentKey", '""'
    }
    releaseStaging {
      initWith release
      matchingFallbacks = ["release"]
      resValue "string", "PatchkiteDeploymentKey", '"STAGING_KEY"'
    }
    release {
      resValue "string", "PatchkiteDeploymentKey", '"PRODUCTION_KEY"'
    }
  }
}
```

Build testers' APKs with `./gradlew assembleReleaseStaging` and the store bundle with `./gradlew bundleRelease`.

### React Native — iOS

1. In Xcode, duplicate the `Release` build configuration as `Staging` (Project → Info → Configurations).
2. Add a *User-Defined Setting* `PATCHKITE_DEPLOYMENT_KEY` to the app target, with the Staging key for `Staging` and the Production key for `Release`.
3. Set `PatchkiteDeploymentKey` in `Info.plist` to `$(PATCHKITE_DEPLOYMENT_KEY)`.
4. Map the new configuration in your `Podfile` — `project 'MyApp', 'Staging' => :release` — and run `pod install`.

### Flutter — Android

Use a manifest placeholder per flavor in `android/app/build.gradle.kts`:

```kotlin
android {
  flavorDimensions += "env"
  productFlavors {
    create("staging") { dimension = "env"; manifestPlaceholders["patchkiteKey"] = "STAGING_KEY" }
    create("production") { dimension = "env"; manifestPlaceholders["patchkiteKey"] = "PRODUCTION_KEY" }
  }
}
```

```xml
<meta-data android:name="PatchkiteDeploymentKey" android:value="${patchkiteKey}" />
```

Build with `flutter build apk --flavor staging` for testers and `flutter build appbundle --flavor production` for Google Play. Pass the same flavor to `release-flutter` with `--buildArgs "--flavor production"`.

## Diffs and binary patches

The server keeps diffs from the last five releases of a deployment. A device that already runs one of them downloads only the files that changed, and large files (the JS bundle, `libapp.so`) are sent as bsdiff binary patches — a small change usually means a download of a few kilobytes instead of hundreds.
