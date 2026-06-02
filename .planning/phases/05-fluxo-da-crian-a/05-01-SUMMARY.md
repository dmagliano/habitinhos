---
phase: 05-fluxo-da-crian-a
plan: 01
subsystem: mobile-api
tags: [expo, react-navigation, api-client, child-flow, wallet, missions, rewards]

requires:
  - phase: 04-mobile-base
    provides: Authenticated mobile shell, responsible session token, API wrapper, and navigation foundation
provides:
  - Expo-compatible bottom-tabs dependency for the child tab shell
  - Typed child, wallet, assigned mission, reward, and redemption DTO contracts
  - Backend-backed child service for Phase 5 screens
  - Route and bearer-token tests for the child service
affects: [phase-05-child-flow, phase-06-responsible-flow, mobile-api-contracts]

tech-stack:
  added: [@react-navigation/bottom-tabs]
  patterns: [typed-api-dtos, backend-service-wrapper, responsible-token-child-selection, tdd-route-contract-tests]

key-files:
  created:
    - mobile/src/features/child/childService.ts
    - mobile/src/features/child/__tests__/child-service.test.ts
  modified:
    - mobile/package.json
    - mobile/package-lock.json
    - mobile/src/api/types.ts

key-decisions:
  - "Child flow service methods use the authenticated responsible token and selected backend child ids, not child-authenticated users."
  - "Reward redemption is locked to the current backend route `POST /rewards/{id}/redeem` with body `{ childId }`."
  - "The mobile child service does not accept or send `familyUnitId`; family isolation remains backend-derived through the JWT."

patterns-established:
  - "Phase 5 screens should consume backend data through `childService` instead of direct fetch calls."
  - "Child flow tests should assert real backend route paths and payloads to prevent contract drift."
  - "Client-side selected child ids are route/body parameters only; tenant context never comes from the mobile app."

requirements-completed: [MOBL-04, MOBL-05, MISS-04, MISS-05, REWD-03, REWD-04, REWD-05, WALT-01]

duration: ~18min
completed: 2026-06-02T13:24:51Z
---

# Phase 05: Fluxo da criança Plan 01 Summary

**Typed child API foundation with bottom-tabs dependency, backend DTOs, and route-locked child service tests**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-02T13:06:00Z
- **Completed:** 2026-06-02T13:24:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Installed `@react-navigation/bottom-tabs` through Expo for the future child tab shell.
- Added mobile DTO contracts for child profiles, wallets, assigned missions, rewards, and reward redemptions.
- Created `childService` methods for all Phase 5 child/wallet/mission/reward backend paths.
- Added focused TDD route-contract tests covering bearer tokens, no `familyUnitId`, and the current reward redemption route.

## Task Commits

1. **Task 1: Add bottom-tab dependency and child DTO contracts** - `1b9dd7d` (`feat`)
2. **Task 2 RED: Child service route contract tests** - `a0659de` (`test`)
3. **Task 2 GREEN: Implement child backend service** - `9fbca20` (`feat`)

## Files Created/Modified

- `mobile/package.json` - added the official bottom-tabs dependency.
- `mobile/package-lock.json` - locked `@react-navigation/bottom-tabs`.
- `mobile/src/api/types.ts` - added child, wallet, mission, reward, and redemption DTOs.
- `mobile/src/features/child/childService.ts` - added typed backend calls for the child flow.
- `mobile/src/features/child/__tests__/child-service.test.ts` - added route/body/token contract tests.

## Decisions Made

- Used `apiRequest` for every child service call so bearer tokens, JSON handling, PT-BR error mapping, and the existing `familyUnitId` guard stay centralized.
- Kept selected child ids as explicit backend entity ids, preserving the responsible session model from Phase 5 context.
- Used the backend-real reward redemption route from research instead of the stale child-scoped route in `docs/api-contract.md`.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope changes.

## Issues Encountered

- `npm install` still reports 10 moderate vulnerabilities in the current Expo/Jest dependency tree. No audit fix was applied to avoid unmanaged dependency churn.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd mobile && npm test -- child-service --runInBand` - passed, 1 suite / 6 tests.
- `cd mobile && npm run typecheck` - passed.
- `cd mobile && npm run lint` - passed.

## Next Phase Readiness

Plan 05-02 can replace the child stub with backend child profile selection, bottom tabs, and the home/profile screens using the new `childService` and DTO contracts.

---
*Phase: 05-fluxo-da-crian-a*
*Completed: 2026-06-02*
