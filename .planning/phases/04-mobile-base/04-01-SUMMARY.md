---
phase: 04-mobile-base
plan: 01
subsystem: mobile-foundation
tags: [expo, react-native, typescript, jest, eslint]

requires:
  - phase: 04-mobile-base
    provides: Phase 4 context, research, validation, and UI design contract
provides:
  - Expo React Native TypeScript scaffold under mobile/
  - Mobile npm scripts for start, lint, typecheck, and Jest tests
  - Initial PT-BR Habitinhos shell
  - Jest Expo and React Native Testing Library smoke test setup
affects: [mobile, phase-04, phase-05, phase-06]

tech-stack:
  added: [expo, react-native, react, typescript, jest-expo, jest, @testing-library/react-native, react-test-renderer, eslint, eslint-config-expo]
  patterns: [expo-entrypoint, pt-br-visible-copy, jest-expo-tests, expo-eslint]

key-files:
  created:
    - mobile/package.json
    - mobile/package-lock.json
    - mobile/app.json
    - mobile/tsconfig.json
    - mobile/App.tsx
    - mobile/index.ts
    - mobile/eslint.config.js
    - mobile/jest.setup.ts
    - mobile/src/__tests__/app-smoke.test.tsx
  modified: []

key-decisions:
  - "Used Expo blank TypeScript scaffold without Expo Router."
  - "Removed generated app.json image asset references instead of copying generated bitmap assets."
  - "Configured lint explicitly with Expo ESLint so `npm run lint` is reproducible."

patterns-established:
  - "Visible app text is PT-BR while code and file names stay in English."
  - "Mobile verification runs from `mobile/` through npm scripts."
  - "Stitch references are not copied into code; Phase 4 starts with native React Native primitives."

requirements-completed: [MOBL-01, MOBL-02]

duration: ~45min
completed: 2026-06-01T19:19:03Z
---

# Phase 04: Mobile Base Plan 01 Summary

**Expo TypeScript mobile scaffold with PT-BR shell, Jest Expo smoke test, and reproducible lint/typecheck/test scripts**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-06-01T18:34:00Z
- **Completed:** 2026-06-01T19:19:03Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Created the Expo React Native TypeScript app foundation in `mobile/`.
- Added PT-BR initial shell showing `Habitinhos` and `Preparando o app da familia...`.
- Added `start`, `lint`, `typecheck`, and `test` scripts.
- Configured Jest with `jest-expo` and React Native Testing Library.
- Verified there is no `mobile/app/` Expo Router route directory.

## Task Commits

1. **Task 04-01-01 and 04-01-02: scaffold and verification setup** - `b598dfc` (`feat(04-01): scaffold Expo mobile app`)

## Files Created/Modified

- `mobile/package.json` - Expo app scripts, dependencies, dev dependencies, and Jest config.
- `mobile/package-lock.json` - npm lockfile for the mobile app.
- `mobile/app.json` - Expo app metadata for Habitinhos.
- `mobile/tsconfig.json` - strict TypeScript config with Jest test globals.
- `mobile/App.tsx` - initial PT-BR app shell.
- `mobile/index.ts` - Expo root component registration.
- `mobile/eslint.config.js` - Expo ESLint flat config.
- `mobile/jest.setup.ts` - React Native Testing Library matcher setup.
- `mobile/src/__tests__/app-smoke.test.tsx` - smoke test for the initial shell.

## Decisions Made

- Used the official Expo blank TypeScript scaffold in `/tmp` and copied only the needed files into `mobile/`, preserving `mobile/AGENTS.md`.
- Kept the initial UI intentionally simple because navigation and screen composition are delivered in later Phase 4 plans.
- Removed generated image asset references from `app.json` so this plan does not introduce generated visual assets.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added explicit ESLint dependencies and config**
- **Found during:** Task 04-01-02
- **Issue:** `expo lint` attempted to install `eslint` and `eslint-config-expo` automatically during verification, which fails inside the sandbox without network access.
- **Fix:** Installed `eslint` and `eslint-config-expo`, then let Expo create `eslint.config.js`.
- **Files modified:** `mobile/package.json`, `mobile/package-lock.json`, `mobile/eslint.config.js`
- **Verification:** `cd mobile && npm run lint`
- **Committed in:** `b598dfc`

**2. [Rule 3 - Blocking] Added Jest type declarations and current matcher import**
- **Found during:** Task 04-01-02
- **Issue:** TypeScript could not resolve Jest globals, and the older `@testing-library/react-native/extend-expect` entrypoint is not present in the installed RNTL version.
- **Fix:** Installed `@types/jest`, added Jest types to `tsconfig.json`, and imported `@testing-library/react-native/matchers`.
- **Files modified:** `mobile/package.json`, `mobile/package-lock.json`, `mobile/tsconfig.json`, `mobile/jest.setup.ts`
- **Verification:** `cd mobile && npm run typecheck && npm test -- --runInBand`
- **Committed in:** `b598dfc`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes keep the planned tooling working with the scaffold's current package versions. No scope expansion beyond the verification infrastructure.

## Issues Encountered

- npm package installs require network access outside the sandbox. Dependencies were installed with the approved elevated `npm install` command.
- npm reports 10 moderate vulnerabilities in the generated dependency tree. No automatic audit fix was run because that could change Expo-managed versions outside the phase plan.

## User Setup Required

None - no external service configuration required for this scaffold plan.

## Verification

- `cd mobile && npm run lint` - passed
- `cd mobile && npm run typecheck` - passed
- `cd mobile && npm test -- --runInBand` - passed
- `test -d mobile/app` - returned non-zero, confirming no Expo Router route directory exists
- `git diff -- mobile/AGENTS.md` - empty, confirming `mobile/AGENTS.md` was preserved

## Next Phase Readiness

The mobile app can now compile, lint, and run tests from `mobile/`. Plans `04-02` and `04-03` can build auth/API/session code and the visual component foundation on top of this scaffold.

---
*Phase: 04-mobile-base*
*Completed: 2026-06-01*
