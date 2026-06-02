---
phase: 05-fluxo-da-crian-a
plan: 02
subsystem: mobile-navigation
tags: [react-navigation, bottom-tabs, child-flow, profile-selection, wallet, missions]

requires:
  - phase: 05-fluxo-da-crian-a
    provides: Child API DTOs and childService from plan 05-01
provides:
  - Backend child profile selection from the authenticated responsible session
  - Child bottom-tabs shell with custom tab bar
  - Backend wallet balance and pending mission home summary
  - Child profile tab with switch/family/logout actions
affects: [phase-05-missions, phase-05-rewards, phase-06-responsible-flow]

tech-stack:
  added: []
  patterns: [route-param-child-state, custom-bottom-tab-bar, backend-loaded-home, honest-placeholder-tabs]

key-files:
  created:
    - mobile/src/features/child/ChildProfileSelectScreen.tsx
    - mobile/src/features/child/ChildTabsScreen.tsx
    - mobile/src/features/child/ChildHomeScreen.tsx
    - mobile/src/features/child/components/BottomTabBar.tsx
    - mobile/src/features/child/__tests__/child-navigation.test.tsx
    - mobile/src/features/child/__tests__/child-home.test.tsx
  modified:
    - mobile/src/navigation/routes.ts
    - mobile/src/navigation/RootNavigator.tsx
    - mobile/src/features/family/FamilyHubScreen.tsx
    - mobile/src/features/family/__tests__/family-navigation.test.tsx
    - mobile/src/features/family/ChildStubScreen.tsx

key-decisions:
  - "The child flow starts at `ChildProfileSelect`, and selected child state is passed to `ChildTabs` as route params."
  - "Mission and reward tabs in 05-02 render honest placeholders only; domain lists/actions remain owned by 05-03 and 05-04."
  - "Child home displays only backend wallet balance and pending missions loaded through `childService`."

patterns-established:
  - "Authenticated child routes live in the root stack after `FamilyHub`, with child-specific tabs nested under `ChildTabs`."
  - "Bottom tab labels use emoji plus PT-BR text and accessibility labels like `Abrir Início`."
  - "Home mission ordering prioritizes due-dated missions before undated missions, then due date and creation time."

requirements-completed: [MOBL-04, MOBL-05, MISS-04, WALT-01]

duration: ~17min
completed: 2026-06-02T13:40:35Z
---

# Phase 05: Fluxo da criança Plan 02 Summary

**Backend child profile selection with real child tabs, wallet balance home, and profile switching actions**

## Performance

- **Duration:** ~17 min
- **Started:** 2026-06-02T13:24:51Z
- **Completed:** 2026-06-02T13:40:35Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Replaced the `Sou criança` stub entry with `ChildProfileSelect`.
- Added child selection that loads active backend children through `childService.listChildren(session.token)`.
- Added `ChildTabs` with custom `BottomTabBar` and four accessible tab targets.
- Added `ChildHomeScreen` loading wallet balance and pending missions from the backend service.
- Added child profile tab actions for switching child, returning to family hub, and logging out.

## Task Commits

1. **Task 1/2 RED: Navigation and home behavior tests** - `42a63d5` (`test`)
2. **Task 1/2 GREEN: Profile selection, tabs, home, profile, and route migration** - `2fec0f8` (`feat`)

## Files Created/Modified

- `mobile/src/navigation/routes.ts` - added `ChildProfileSelect` and `ChildTabs` route contracts.
- `mobile/src/navigation/RootNavigator.tsx` - registered real child routes in the authenticated branch.
- `mobile/src/features/family/FamilyHubScreen.tsx` - routes `Sou criança` to profile selection.
- `mobile/src/features/family/ChildStubScreen.tsx` - removed obsolete child stub screen.
- `mobile/src/features/family/__tests__/family-navigation.test.tsx` - updated legacy navigation expectations.
- `mobile/src/features/child/ChildProfileSelectScreen.tsx` - backend child selection and retry states.
- `mobile/src/features/child/ChildTabsScreen.tsx` - bottom-tabs shell, honest placeholders, and profile tab.
- `mobile/src/features/child/ChildHomeScreen.tsx` - wallet/pending mission home loaded from `childService`.
- `mobile/src/features/child/components/BottomTabBar.tsx` - token-based four-tab custom tab bar.
- `mobile/src/features/child/__tests__/child-navigation.test.tsx` - child selection/tabs/profile coverage.
- `mobile/src/features/child/__tests__/child-home.test.tsx` - home balance, ordering, empty, error, and retry coverage.

## Decisions Made

- Kept mission and reward tabs as non-domain placeholders until their owning plans, preventing fake mission/reward data.
- Removed the obsolete `ChildStubScreen` instead of leaving a dead authenticated child route.
- Used route params for selected child state rather than introducing child authentication or local PIN validation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed obsolete `ChildStubScreen` and updated the legacy family navigation test**
- **Found during:** Typecheck and existing test compatibility after route migration
- **Issue:** Removing `ChildStub` from `RootStackParamList` left the old stub screen/test tied to a route that no longer exists.
- **Fix:** Deleted `ChildStubScreen` and updated `family-navigation.test.tsx` to expect `ChildProfileSelect`.
- **Files modified:** `mobile/src/features/family/ChildStubScreen.tsx`, `mobile/src/features/family/__tests__/family-navigation.test.tsx`
- **Verification:** `cd mobile && npm test -- family-navigation --runInBand`; final 05-02 focused tests/typecheck/lint all passed.
- **Committed in:** `2fec0f8`

---

**Total deviations:** 1 auto-fixed (1 blocking).
**Impact on plan:** The route migration is cleaner and prevents a dead child entry from lingering. No fake child data or extra mission/reward behavior was introduced.

## Issues Encountered

None beyond the documented route cleanup.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd mobile && npm test -- child-navigation --runInBand` - passed, 1 suite / 4 tests.
- `cd mobile && npm test -- child-home --runInBand` - passed, 1 suite / 3 tests.
- `cd mobile && npm test -- family-navigation --runInBand` - passed, 1 suite / 2 tests.
- `cd mobile && npm run typecheck` - passed.
- `cd mobile && npm run lint` - passed.

## Next Phase Readiness

Plan 05-03 can replace the honest mission placeholder with the real mission list/detail/completion loop while reusing the selected child route params, `childService`, tab shell, and home refetch pattern.

---
*Phase: 05-fluxo-da-crian-a*
*Completed: 2026-06-02*
