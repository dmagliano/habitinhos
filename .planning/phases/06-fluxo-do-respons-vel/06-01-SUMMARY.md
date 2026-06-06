---
phase: 06-fluxo-do-respons-vel
plan: 01
subsystem: api-ui
tags: [spring-boot, expo, react-native, dashboard, responsible-flow, tdd]
requires:
  - phase: 05-fluxo-da-crian-a
    provides: Mobile auth/session, child flow navigation patterns, reusable UI components, and real API service conventions
provides:
  - GET /dashboard/responsible family-scoped backend aggregate
  - responsibleService typed mobile API access
  - ResponsibleTabs shell replacing ResponsibleStub
  - ResponsibleHome dashboard over backend data
  - ResponsibleChildDetail operational child summary
affects: [06-02-children-management, 06-03-missions-approvals, 06-04-rewards-management]
tech-stack:
  added: []
  patterns: [TDD red-green commits, backend dashboard aggregate, mobile screen-owned loading/error states]
key-files:
  created:
    - backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardController.java
    - backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardService.java
    - mobile/src/features/responsible/responsibleService.ts
    - mobile/src/features/responsible/ResponsibleHomeScreen.tsx
    - mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx
  modified:
    - mobile/src/navigation/RootNavigator.tsx
    - mobile/src/navigation/routes.ts
    - mobile/src/api/types.ts
key-decisions:
  - "Backend dashboard aggregate is the source of truth for responsible metrics; mobile renders counts and balances without recomputing authority."
  - "ResponsibleStubScreen was removed after ResponsibleTabs became the real responsible entry route."
patterns-established:
  - "Responsible mobile services call apiRequest with Bearer token and never send familyUnitId."
  - "Responsible screens use explicit loading, empty, error, and retry states instead of mock/offline fallback data."
requirements-completed: [MOBL-03, DASH-01, DASH-02, DASH-03, DASH-04]
duration: 92min
completed: 2026-06-03
---

# Phase 06 Plan 01: Responsible Dashboard and Child Detail Summary

**Family-scoped responsible dashboard API with mobile tabs, real-data overview, and child detail summary**

## Performance

- **Duration:** 92 min
- **Started:** 2026-06-03T00:43:35Z
- **Completed:** 2026-06-03T01:12:03Z
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments

- Added `GET /dashboard/responsible`, deriving family from `CurrentUserProvider` and returning children, wallet balances, mission status counts, pending approval preview/count, and recent redemptions.
- Added responsible mobile DTOs, `responsibleService`, real `ResponsibleTabs`, and route wiring from `FamilyHub`.
- Built `ResponsibleHomeScreen` and `ResponsibleChildDetailScreen` over backend dashboard data with PT-BR loading, empty, error, retry, metric, child, approval, and redemption states.
- Added focused backend and mobile tests for family isolation, no client `familyUnitId`, responsible navigation, dashboard rendering, and child detail rendering.

## Task Commits

1. **Task 1: Add responsible dashboard backend contract**
   - `5ec106a` test(06-01): add failing responsible dashboard contract test
   - `a45bf24` feat(06-01): implement responsible dashboard endpoint
2. **Task 2: Create responsible mobile service, DTOs, and navigation shell**
   - `84c4136` test(06-01): add failing responsible service navigation tests
   - `e489697` feat(06-01): add responsible service and tabs shell
3. **Task 3: Build dashboard and child detail over the dashboard contract**
   - `3042da8` test(06-01): add failing responsible dashboard screen tests
   - `d0a3cc9` feat(06-01): build responsible dashboard and child detail

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardController.java` - exposes `GET /dashboard/responsible`.
- `backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardService.java` - aggregates active children, wallets, mission counts, approvals, and recent redemptions within the authenticated family.
- `backend/src/main/java/br/com/habitinhos/dashboard/dto/ResponsibleDashboardResponse.java` - backend dashboard response contract.
- `backend/src/main/java/br/com/habitinhos/*/*Repository.java` - family-scoped helper queries for dashboard aggregation.
- `backend/src/test/java/br/com/habitinhos/dashboard/ResponsibleDashboardIntegrationTest.java` - integration coverage for tenant isolation and aggregate shape.
- `mobile/src/api/types.ts` - responsible dashboard and mission DTOs.
- `mobile/src/features/responsible/responsibleService.ts` - token-aware responsible API service.
- `mobile/src/features/responsible/ResponsibleTabsScreen.tsx` - responsible tabs shell with home, missions, rewards, and profile tabs.
- `mobile/src/features/responsible/ResponsibleHomeScreen.tsx` - responsible dashboard over real API data.
- `mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx` - selected child operational summary.
- `mobile/src/features/responsible/components/*` - metric, child summary, approval, empty, and feedback components.
- `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/features/family/FamilyHubScreen.tsx` - responsible route wiring replacing the old stub.

## Decisions Made

- Used one backend aggregate endpoint for dashboard data to avoid N+1 mobile composition and prevent client-invented balances/counts.
- Kept `includeInactive=true` support in mobile service paths for later management screens without changing backend list behavior in this plan.
- Removed `ResponsibleStubScreen` after replacing the responsible entry route so typecheck and navigation tests reflect the real shell.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Fixture] Corrected dashboard integration balance expectation**
- **Found during:** Task 1
- **Issue:** The RED test expected a child balance that ignored automatic mission credit from a completed no-approval mission.
- **Fix:** Updated the expected balance to match backend wallet ledger behavior.
- **Files modified:** `backend/src/test/java/br/com/habitinhos/dashboard/ResponsibleDashboardIntegrationTest.java`
- **Verification:** `cd backend && ./mvnw test -Dtest=ResponsibleDashboardIntegrationTest`
- **Committed in:** `a45bf24`

**2. [Rule 1 - Direct Regression] Removed stale ResponsibleStub references**
- **Found during:** Task 2
- **Issue:** Removing the `ResponsibleStub` route left stale type references and an obsolete family-navigation assertion.
- **Fix:** Removed `ResponsibleStubScreen` and updated family navigation test to expect `ResponsibleTabs`.
- **Files modified:** `mobile/src/features/family/ResponsibleStubScreen.tsx`, `mobile/src/features/family/__tests__/family-navigation.test.tsx`
- **Verification:** `cd mobile && npm test -- family-navigation --runInBand`; `cd mobile && npm run typecheck`
- **Committed in:** `e489697`

**3. [Rule 3 - Testability] Added testID support to Card**
- **Found during:** Task 3
- **Issue:** Dashboard tests needed stable selection of a specific child card without relying on duplicate visible text.
- **Fix:** Extended the base `Card` component with optional `testID` pass-through.
- **Files modified:** `mobile/src/components/Card.tsx`
- **Verification:** `cd mobile && npm test -- responsible-dashboard --runInBand`; `cd mobile && npm run typecheck`
- **Committed in:** `d0a3cc9`

---

**Total deviations:** 3 auto-fixed
**Impact on plan:** All deviations were directly required to keep the planned behavior correct, typed, and testable. No package or architecture changes were introduced.

## Known Stubs

| File | Line | Reason |
|------|------|--------|
| `mobile/src/features/responsible/ResponsibleTabsScreen.tsx` | ResponsibleMissions tab | Honest placeholder until 06-03 implements mission management and approvals. |
| `mobile/src/features/responsible/ResponsibleTabsScreen.tsx` | ResponsibleRewards tab | Honest placeholder until 06-04 implements reward management. |
| `mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx` | `Editar criança` action | Button is present for the expected flow; edit form is implemented in 06-02. |

## Issues Encountered

- Backend integration tests are slow because they boot Spring and Testcontainers, but they passed consistently.
- Existing unrelated dirty files remained untouched: `mobile/package.json`, `mobile/package-lock.json`, and untracked `06-PATTERNS.md`.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd backend && ./mvnw test -Dtest=ResponsibleDashboardIntegrationTest` - passed
- `cd mobile && npm test -- responsible-service --runInBand` - passed
- `cd mobile && npm test -- responsible-navigation --runInBand` - passed
- `cd mobile && npm test -- responsible-dashboard --runInBand` - passed
- `cd mobile && npm run typecheck` - passed
- `cd mobile && npm run lint` - passed

## Next Phase Readiness

Plan 06-02 can build children management on top of `ResponsibleTabs`, `responsibleService.listChildren(..., includeInactive)`, `ResponsibleChildDetail`, and the established responsible UI components. Plans 06-03 and 06-04 should replace the honest mission/reward tab placeholders with real management screens.

---
*Phase: 06-fluxo-do-respons-vel*
*Completed: 2026-06-03*
