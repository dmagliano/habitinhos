---
phase: 05-fluxo-da-crian-a
plan: 04
subsystem: mobile-rewards
tags: [react-native, child-flow, rewards, wallet, redemption]

requires:
  - phase: 05-fluxo-da-crian-a
    provides: Child tabs shell, childService contracts, wallet access, and shared child feedback components
provides:
  - Active child reward catalog backed by `GET /rewards`
  - Reward affordability UI based on backend wallet balance
  - Confirmation flow before spending coins
  - Reward redemption through `POST /rewards/{id}/redeem`
  - Friendly success, insufficient-balance, and generic error feedback
affects: [phase-05-verification, mobile-child-flow, reward-redemption]

tech-stack:
  added: []
  patterns: [backend-refetch-after-redemption, confirmation-before-spend, affordability-progress, friendly-backend-error-mapping]

key-files:
  created:
    - mobile/src/features/child/ChildRewardsScreen.tsx
    - mobile/src/features/child/components/RewardCard.tsx
    - mobile/src/features/child/components/ProgressBar.tsx
    - mobile/src/features/child/__tests__/child-rewards.test.tsx
  modified:
    - mobile/src/features/child/ChildTabsScreen.tsx
    - mobile/src/features/child/ChildMissionDetailScreen.tsx
    - mobile/src/features/child/__tests__/child-missions.test.tsx

key-decisions:
  - "Reward affordability is a child-facing affordance only; backend redemption remains authoritative."
  - "The screen refetches wallet and rewards after successful redemption instead of subtracting balance locally."
  - "INSUFFICIENT_BALANCE receives a semantic friendly message and never renders raw backend details."

patterns-established:
  - "Reward spending must show current balance, cost, and remaining balance before calling the backend."
  - "Unavailable rewards stay visible with exact missing coins and progress toward the cost."
  - "Child mutation screens use backend refetch after success or semantic business errors."

requirements-completed: [MOBL-04, MOBL-05, REWD-03, REWD-04, REWD-05, WALT-01]

duration: ~8min
completed: 2026-06-02T14:05:09Z
---

# Phase 05: Fluxo da criança Plan 04 Summary

**Child reward catalog with affordability guidance, confirmation-before-spend, backend redemption, and wallet/reward refetch**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-02T13:57:31Z
- **Completed:** 2026-06-02T14:05:09Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added reward catalog screen that loads wallet balance and active rewards from the real child service.
- Added reusable `RewardCard` and accessible `ProgressBar` components for affordability and missing-coin guidance.
- Added confirmation before redemption with current balance, cost, and post-redemption balance preview.
- Added success, insufficient-balance, and generic error feedback with backend wallet/reward refetches.
- Wired the `Recompensas` child tab to the real reward flow.

## Task Commits

1. **Task 1/2 RED: Reward catalog and redemption tests** - `45cefa0` (`test`)
2. **Task 1/2 GREEN: Reward catalog, card, progress, confirmation, and redemption** - `664bcdc` (`feat`)
3. **Code review follow-up: Preserve child feedback when refresh fails** - `6df9bf4` (`fix`)

## Files Created/Modified

- `mobile/src/features/child/ChildTabsScreen.tsx` - renders the real reward screen in the `Recompensas` tab.
- `mobile/src/features/child/ChildMissionDetailScreen.tsx` - keeps completed mission feedback visible if post-completion refresh fails.
- `mobile/src/features/child/ChildRewardsScreen.tsx` - wallet/reward loading, confirmation, redemption, feedback, and refetch flow.
- `mobile/src/features/child/components/RewardCard.tsx` - reward cost, affordability, disabled state, missing coins, and redeem CTA.
- `mobile/src/features/child/components/ProgressBar.tsx` - clamped accessible progress indicator for reward affordability.
- `mobile/src/features/child/__tests__/child-missions.test.tsx` - mission detail refresh-failure regression coverage.
- `mobile/src/features/child/__tests__/child-rewards.test.tsx` - reward catalog, confirmation, success, insufficient-balance, and error coverage.

## Decisions Made

- Kept unaffordable rewards visible and disabled, with exact `Faltam {n} moedas` guidance.
- Used inline confirmation rather than immediate redemption so the child sees the balance impact before spending.
- Refetched wallet and rewards after success and after backend insufficient-balance responses to avoid local balance drift.

## Deviations from Plan

### Auto-fixed Issues

**1. Post-mutation refresh failures could mask already-completed child feedback**
- **Found during:** Final code review gate
- **Issue:** A follow-up wallet/list refresh failure after a successful mission completion or insufficient-balance redemption could replace the intended child-facing feedback with an error or no message.
- **Fix:** Preserved semantic success/insufficient feedback first, made non-essential refresh failures non-blocking, and added focused regression tests.
- **Files modified:** `ChildMissionDetailScreen.tsx`, `ChildRewardsScreen.tsx`, `child-missions.test.tsx`, `child-rewards.test.tsx`
- **Verification:** `child-missions`, `child-rewards`, `typecheck`, `lint`, and full mobile Jest passed.
- **Committed in:** `6df9bf4`

**Total deviations:** 1 auto-fixed review finding.
**Impact on plan:** No scope expansion; this hardens the existing Phase 5 feedback/refetch behavior.

## Issues Encountered

- Manual Expo smoke was not run in this CLI session. It requires a running Expo/mobile runtime or device plus real seeded/created backend data; this gate is recorded as blocked, not passed.
- Existing `npm install` audit output still reports 10 moderate vulnerabilities from the mobile dependency tree; no audit fix was applied during this plan.

## User Setup Required

None - no external service configuration required by the implementation itself.

## Verification

- `cd mobile && npm test -- child-service --runInBand` - passed, 1 suite / 6 tests.
- `cd mobile && npm test -- child-navigation --runInBand` - passed, 1 suite / 4 tests.
- `cd mobile && npm test -- child-home --runInBand` - passed, 1 suite / 3 tests.
- `cd mobile && npm test -- child-missions --runInBand` - passed, 1 suite / 7 tests.
- `cd mobile && npm test -- child-rewards --runInBand` - passed, 1 suite / 6 tests.
- `cd mobile && npm run typecheck` - passed.
- `cd mobile && npm run lint` - passed.
- `cd mobile && npm test -- --runInBand` - passed, 12 suites / 44 tests.
- `cd backend && ./mvnw test` - passed, 40 tests / 0 failures / 0 errors / 0 skipped.
- Manual Expo smoke - blocked/not run; requires Expo/mobile runtime or device and real backend data.

## Next Phase Readiness

The automated child loop is ready for verifier review: profile selection, home balance, pending missions, mission completion, reward affordability, and reward redemption all use real backend service contracts. Remaining human-facing validation should run through the manual Expo smoke once a runtime/device and demo data are available.

---
*Phase: 05-fluxo-da-crian-a*
*Completed: 2026-06-02*
