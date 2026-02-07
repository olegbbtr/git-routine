# GitRoutine

GitRoutine is a local-first routine timer for workouts, study blocks, and repeatable workflows.
It runs entirely in the browser, stores data in LocalStorage, and can optionally sync routines/history to a GitHub repository.

## Features
- Nested routine structure (blocks + steps)
- Step units in seconds/minutes
- Pause steps that wait for manual continue
- Optional warmup before start
- Speech announcements (current/next/halfway/completion)
- Countdown beeps (3-2-1)
- History logging with rerun/edit shortcuts
- Optional GitHub backup sync (`routines/*.json`, `history.json`)

## Tech Stack
- Preact + TypeScript
- Vite build tool
- Node test runner

## Development
```bash
npm install
npm run dev
```

Open the local Vite URL and use hash routes like `#/`, `#/settings`, `#/edit/<filename>`, `#/run/<filename>`.

## Build, Output, and Static Files
```bash
npm run build
```

Project directory roles:
- `static/`: source static assets copied into builds
- `public/`: committed production build output

Build output paths are deterministic and non-minified:
- `/assets/index.js`
- `/assets/index.css`
- `/favicon.svg`

This keeps deployment paths stable across rebuilds.

## Tests
```bash
npm test
```

Current tests validate:
- example routine JSON shape and flattening behavior
- halfway announcement threshold logic
- route parsing safety
- routine validation for malformed nested data

## GitHub Sync Setup
1. Open `#/settings`.
2. Add a GitHub Personal Access Token with repository contents read/write permissions.
3. Validate token and select a repository.
4. Save or run routines to push updates.

Remote file layout:
- `routines/<filename>.json`
- `history.json`

## Project Structure
```text
src/
  services/
  views/
  types.ts
  app.tsx
  main.tsx

examples/routines/
static/
public/
test/
SPEC.md
```

## Spec
Implementation-aligned specification: `/Users/oleg/main/git-routine/SPEC.md`
