# Dependency audit — 2026-08-19

`yarn audit` findings for this repository, and the fixes applied while keeping Expo SDK 51 (`expo ~51.0.31`) and React Native 0.74.5 unchanged.

## Result

| | Before | After |
|---|---|---|
| Distinct (package, advisory) findings | 170 | 70 |
| Fixed | — | **100** |
| New issues introduced | — | **0** |

Verified via `expo install --check` ("Dependencies are up to date") and `tsc --noEmit` (no new type errors vs. the pre-change baseline).

## What was fixed

**Removed (unused):** `appcenter`, `appcenter-link-scripts` — not imported anywhere in the app; this alone drops several advisories (including a critical one) at zero risk.

**Direct dependency bumps** (declared version ranges changed in `package.json`):
- `uuid` `^10.0.0` → `^11.1.1` — only the `v4()` export is used in this codebase; the relevant CVE only affects the deprecated `v3/v5/v6` buffer-argument path, and `v4()`'s API is unchanged across this bump.
- `axios` `^1.7.3` → `^1.18.0`, `lodash` `^4.17.21` → `^4.18.0` — same-major patch releases.

**Transitive dependencies patched via `resolutions`** (forces a newer, non-breaking version of a nested dependency without touching the package that pulls it in): `shell-quote`, `websocket-driver`, `fast-uri`, `flatted`, `http-proxy-middleware`, `nanoid`, `node-forge`, `path-to-regexp`, `postcss`, `socket.io-parser`, `svgo`, `undici`, `@babel/core`, `@babel/helpers`, `@babel/runtime`, `body-parser`, `follow-redirects`, `joi`, `launch-editor`, `morgan`, `qs`, `@tootallnate/once`, `on-headers`, `webpack`, `@xmldom/xmldom`.

Each of these had exactly one version installed across the whole tree, and the fix is a patch/minor release of that same version — no API-breaking risk to the packages that depend on them (Expo's CLI, Metro, Babel, and `@expo/webpack-config` internals).

## Deferred — and why

**Needs a major-version bump, not yet applied** (a patch-level fix doesn't exist; the safe version is a different major, which needs its own compatibility check before forcing):

| Package | Used by | Fixed at | Risk if forced |
|---|---|---|---|
| `fast-xml-parser` | `react-native`'s Android CLI tooling | 5.x | v5 changed its API surface; could break Android config parsing |
| `tar` | `expo`'s CLI (archive extraction) | 7.x | Drops old Node support; needs a real `expo run`/build test |
| `serialize-javascript` | webpack build pipeline | 7.x | Lower risk, but untested here |
| `tmp` | build tooling | 0.2.x | `0.x` releases treat minor bumps as breaking by convention |
| `webpack-dev-server` | `expo start --web` only | 5.x | v5 changed its config API; would only affect the web dev server, not mobile builds |

**Present in more than one version across the tree — a blanket fix would risk breaking whichever consumer expects the other version's API.** `yarn`'s `resolutions` field can only force one version per package name tree-wide, so these need either a scoped/per-path override or waiting for the parent tool to bump its own pinned copy:

`ws`, `glob`, `semver`, `ajv`, `js-yaml`, `minimatch`, `picomatch`, `brace-expansion`, `cross-spawn`, `form-data`, `yaml`, `cookie`, `send`

For most of these, only one of the coexisting versions is actually vulnerable (e.g. `glob`'s 5.x/7.x copies are fine — only its 10.x copy, used by `react-native`'s Metro tooling, needs the fix). None of them are reachable from the app's own runtime code.

**No fix available:**
- `xlsx` — the maintainer stopped publishing patched releases to the public npm registry after `0.18.5` (fixes exist only via their own CDN). Checked this codebase's actual usage (`src/Home/Sessions/export/index.ts`): it only **writes** spreadsheets from our own data (`json_to_sheet`/`XLSX.write`) and never parses an uploaded/external file, so the two published CVEs (prototype pollution and ReDoS, both triggered by parsing malicious input) don't apply to how this app uses it. No action needed unless a read/import feature is added later.
- `image-size` — every published version still falls in the flagged range; tracked upstream, no action available yet.

## Also worth knowing

This repository has both `yarn.lock` and a stale `package-lock.json`. `npm audit` reads the latter and reported zero improvement from this work purely because that file was never updated — `yarn audit`/`yarn.lock` (the ones actually used to install and build this app) show the real, verified fix count above. Recommend deleting `package-lock.json` to stop the two tools disagreeing; not done here since it's a repo-hygiene call rather than a security fix.
