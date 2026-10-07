---
title: Code signing
description: Sign update packages so devices reject anything you didn't release.
sidebar:
  order: 4
---

With code signing, the CLI signs each package with your RSA private key, and the SDK verifies the signature with the public key built into your app. Once a public key is configured, the SDK rejects unsigned packages and packages whose signature doesn't match — even if your server or storage is compromised.

## 1. Generate a key pair

```bash
openssl genrsa -out private.pem 2048
openssl rsa -pubout -in private.pem -out public.pem
```

Keep `private.pem` secret: store it in your CI secret store and never commit it.

## 2. Add the public key to the app

| Platform | Where | Key |
|---|---|---|
| React Native — Android | `res/values/strings.xml` | `PatchkitePublicKey` |
| React Native — iOS | `Info.plist` | `PatchkitePublicKey` |
| Flutter — Android | `AndroidManifest.xml` `<meta-data>` | `PatchkitePublicKey` |

In `strings.xml` and `<meta-data>`, put the PEM on one line with `\n` between lines. In `Info.plist`, the PEM can span multiple lines.

The public key is native configuration, so adding or changing it requires a store release.

## 3. Sign releases

Pass the private key to any release command:

```bash
patchkite release-react MyApp-Android android -k private.pem
patchkite release-flutter MyApp-Android android -k private.pem
patchkite release MyApp-Android ./build 1.0.0 -k private.pem
```

`promote` and `rollback` reuse the already signed package, so they don't need the key.

## How it works

The signature is a JWT signed with RS256 and stored in the package as `.patchkiterelease`. Its `contentHash` claim is the [package hash](../../reference/package-format/). On the device, the SDK recomputes the hash from the extracted files and accepts the package only if the JWT verifies against the public key and its `contentHash` matches. Other algorithms, including `none`, are rejected.

:::caution
A signature binds the package contents, not the release label or target version. Always serve Patchkite over HTTPS so `update_check` responses can't be tampered with.
:::
