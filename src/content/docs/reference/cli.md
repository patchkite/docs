---
title: CLI
description: Every patchkite command and its options.
sidebar:
  order: 1
---

```bash
npm install -g @patchkite/cli
```

Requires Node.js 22.12 or newer. Run `patchkite <command> --help` for the full help of any command.

## Authentication

| Command | Description |
|---|---|
| `patchkite register [serverUrl]` | Create an account in the browser, or in the terminal with `--email`. The first account on a server becomes admin. |
| `patchkite login [serverUrl]` | Log in. Opens the browser by default; `--accessKey <key>` logs in with an existing access key, `--email <email>` with email and password in the terminal. |
| `patchkite logout` | Log out of the current session. |
| `patchkite whoami` | Show the account you're logged in as. |
| `patchkite change-password` | Change your password and sign out other sessions. |
| `patchkite session rm <machineName>` | Sign out a login session on another machine. |
| `patchkite access-key add <name> [--ttl 60d]` | Create an access key for CI. `--ttl` accepts `60d`, `12h`, `30m` (maximum 10 years). |
| `patchkite access-key ls` / `rm <name>` | List or revoke access keys. |
| `patchkite access-key patch <name> [--name] [--ttl]` | Rename an access key or change its lifetime. |

In CI, set `PATCHKITE_ACCESS_KEY` and `PATCHKITE_SERVER_URL` instead of logging in. `PATCHKITE_CONFIG_PATH` overrides the config file location (default `~/.patchkite.config`).

## Apps and collaborators

| Command | Description |
|---|---|
| `patchkite app add <appName> <os> <platform>` | Register an app. `os` is `ios` or `android`; `platform` is `react-native` or `flutter`. Creates `Staging` and `Production`. |
| `patchkite app ls` | List your apps. |
| `patchkite app rename <current> <new>` | Rename an app. |
| `patchkite app transfer <appName> <email>` | Transfer ownership. |
| `patchkite app rm <appName>` | Delete an app and its releases. |
| `patchkite collaborator add <appName> <email>` | Give another user access. Collaborators can release and promote. |
| `patchkite collaborator ls` / `rm` | List or remove collaborators. |

## Deployments

| Command | Description |
|---|---|
| `patchkite deployment ls <appName> [-k]` | List deployments; `-k` shows the deployment keys. |
| `patchkite deployment add <appName> <name>` | Add a deployment. |
| `patchkite deployment rename <appName> <current> <new>` | Rename a deployment. |
| `patchkite deployment rm <appName> <name>` | Delete a deployment. |
| `patchkite deployment history <appName> <name>` | List releases with install metrics. |
| `patchkite deployment clear <appName> <name>` | Delete the entire release history. |

## Releasing

### `release-react <appName> <platform>`

Bundles your React Native JavaScript (and Hermes bytecode) and releases it.

| Option | Description |
|---|---|
| `-t, --targetBinaryVersion <range>` | Semver range of binary versions (default: from `Info.plist`/`build.gradle`). |
| `-b, --bundleName <name>` | Bundle file name. |
| `-e, --entryFile <path>` | JS entry file. |
| `--development`, `--dev` | Bundle in development mode. |
| `-o, --outputDir <dir>` | Keep the bundle output in this directory. |
| `-s, --sourcemapOutput <file>` | Write a sourcemap. |
| `--sourcemapOutputDir <dir>` | Sourcemap output directory. |
| `-g, --gradleFile <path>` | Path to `build.gradle`. |
| `-p, --plistFile <path>` | Path to `Info.plist`. |
| `--podFile <path>`, `--pod` | Path to the `Podfile`. |
| `-c, --config <path>` | Metro config. |
| `--useHermes [bool]`, `--hermes` | Force Hermes on or off (detected automatically otherwise). |
| `--extraHermesFlags <flag>`, `--hf` | Extra `hermesc` flag. |
| `--extraBundlerOptions <opt>`, `--eo` | Extra Metro bundler option. |

### `release-flutter <appName> <platform>`

Builds a release APK and releases the Dart AOT library (`libapp.so`). Android only.

| Option | Description |
|---|---|
| `-t, --targetBinaryVersion <range>` | Semver range (default: `version` in `pubspec.yaml`). |
| `--targetAbis <abis>` | Comma-separated ABIs (default `arm64-v8a,armeabi-v7a,x86_64`). |
| `--buildArgs <arg>` | Extra arguments for `flutter build apk`, e.g. `--flavor production`. |
| `--apk <path>` | Use an existing APK and skip the build. |
| `--flutterPath <path>` | Path to the `flutter` executable. |

### `release <appName> <path> <targetBinaryVersion>`

Releases a directory or file as-is.

### Options for every release command

| Option | Description |
|---|---|
| `-d, --deploymentName <name>` | Target deployment (default `Staging`). |
| `--description <text>`, `--des` | Release notes. |
| `-m, --mandatory` | Mark the update as mandatory. |
| `-x, --disabled` | Release as disabled. |
| `-r, --rollout <percent>` | Percentage of devices (1–100). |
| `-k, --privateKeyPath <path>` | RSA private key for [code signing](../../guides/code-signing/). |
| `--noDuplicateReleaseError` | Exit successfully when the package is identical to the latest release. |

## Managing releases

| Command | Description |
|---|---|
| `patchkite patch <appName> <deployment>` | Change a release: `-l <label>` (default latest), `--description`, `-m [bool]`, `-x [bool]`, `-r <percent>` (increase only), `-t <range>`. |
| `patchkite promote <appName> <source> <dest>` | Copy a release to another deployment. Takes the same options as `patch`, plus `--noDuplicateReleaseError`. |
| `patchkite rollback <appName> <deployment>` | Roll back to the previous release, or `--targetRelease <label>`. |

## Store binaries (React Native)

| Command | Description |
|---|---|
| `patchkite binary add <appName> <artifact>` | Register the JS bundle inside an APK, AAB, or IPA so the first update after install is sent as a patch. `--bundle-name` overrides the bundle name. |
| `patchkite binary ls <appName>` | List registered binaries. |
| `patchkite binary rm <appName> <hash>` | Remove one. |

## Debugging

| Command | Description |
|---|---|
| `patchkite debug android` / `ios` | Stream Patchkite SDK logs from a connected device, emulator, or simulator. |

## Administration (admins only)

| Command | Description |
|---|---|
| `patchkite admin user ls` | List users. |
| `patchkite admin user add <email> [--name] [--admin]` | Create a user and print a temporary password. |
| `patchkite admin user reset-password <email>` | Issue a new temporary password and revoke the user's sessions and access keys. |
| `patchkite admin user set-admin <email> [--revoke]` | Grant or revoke admin rights. |
| `patchkite admin user rm <email> [--transfer-to <email>]` | Delete a user, optionally transferring the apps they own. |
| `patchkite admin gc [--dry-run]` | Delete orphaned blobs from storage. |
