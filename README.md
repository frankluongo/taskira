# taskira

A task/habit tracker built with React + Vite, packaged as a native desktop app with [Tauri](https://tauri.app).

## Development

```
npm install
npm run dev          # web-only, in the browser
npm run tauri:dev    # desktop app, hot-reloading
```

## Building locally

```
npm run tauri:build
```

Produces a universal macOS `.app`/`.dmg` in `src-tauri/target/release/bundle/`.

## Releasing a new desktop build

Releases are built by GitHub Actions ([.github/workflows/release.yml](.github/workflows/release.yml)) whenever a `v*` tag is pushed to `main`. The workflow builds a universal (Intel + Apple Silicon) macOS binary and publishes it to [GitHub Releases](https://github.com/frankluongo/taskira/releases).

### Automatic (recommended)

```
npm run deploy fix    # patch release for bug fixes        (0.1.0 -> 0.1.1)
npm run deploy feat   # minor release for new features     (0.1.0 -> 0.2.0)
npm run deploy break  # major release for breaking changes (0.1.0 -> 1.0.0)
```

This bumps the version in `package.json` and `src-tauri/tauri.conf.json`, commits the bump, tags it (`vX.Y.Z`), and pushes both to `origin`. GitHub Actions takes it from there — check progress with `gh run list --limit 1`.

The script refuses to run if you're not on `main` or have uncommitted changes, and pulls the latest `main` before bumping.

### Manual

1. Bump the `version` field in **both** `package.json` and `src-tauri/tauri.conf.json` to the same value — if they drift, the built app's filename won't match the git tag.
2. `git commit -am "chore: release vX.Y.Z"`
3. `git tag vX.Y.Z`
4. `git push origin main && git push origin vX.Y.Z`

### Installing on another machine

Download the `.dmg` from the [Releases page](https://github.com/frankluongo/taskira/releases), open it, and drag Taskira to Applications. The app isn't code-signed, so macOS Gatekeeper will block it on first launch — right-click the app → Open → confirm, or run:

```
xattr -cr /Applications/Taskira.app
```
