---
phase: 06-fluxo-do-respons-vel
plan: 03
subsystem: api-ui
tags: [spring-boot, expo, react-native, mission-management, approvals, responsible-flow, tdd]
requires:
  - phase: 06-01
    provides: ResponsibleTabs, responsible dashboard, responsibleService baseline
  - phase: 06-02
    provides: children management, shared management/form/confirmation components
provides:
  - GET /missions?includeInactive=true management support
  - Responsible mission management list
  - guided mission create/edit and assignment flows
  - responsible approval/rejection queue
  - mission/approval service contracts
affects: [06-04-rewards-management]
tech-stack:
  added: []
  patterns: [TDD red-green commits, includeInactive management lists, backend-truth approval actions, no local wallet credit]
key-files:
  created:
    - mobile/src/features/responsible/ResponsibleMissionsScreen.tsx
    - mobile/src/features/responsible/ResponsibleMissionFormScreen.tsx
    - mobile/src/features/responsible/ResponsibleAssignmentFormScreen.tsx
    - mobile/src/features/responsible/ResponsibleApprovalsScreen.tsx
    - mobile/src/features/responsible/components/ChildPicker.tsx
    - mobile/src/features/responsible/components/CoinValueControl.tsx
    - mobile/src/features/responsible/__tests__/responsible-missions.test.tsx
    - mobile/src/features/responsible/__tests__/responsible-approvals.test.tsx
  modified:
    - backend/src/main/java/br/com/habitinhos/missions/MissionController.java
    - backend/src/main/java/br/com/habitinhos/missions/MissionService.java
    - backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java
    - backend/src/test/java/br/com/habitinhos/missions/MissionIntegrationTest.java
    - mobile/src/api/types.ts
    - mobile/src/features/responsible/responsibleService.ts
    - mobile/src/features/responsible/ResponsibleHomeScreen.tsx
    - mobile/src/features/responsible/ResponsibleTabsScreen.tsx
    - mobile/src/features/responsible/components/ApprovalCard.tsx
    - mobile/src/features/responsible/components/ManageListItem.tsx
    - mobile/src/features/responsible/__tests__/responsible-service.test.ts
    - mobile/src/navigation/routes.ts
    - mobile/src/navigation/RootNavigator.tsx
key-decisions:
  - "Mission management uses `includeInactive=true`; default `GET /missions` remains active-only for existing clients."
  - "Create mission is a guided save-then-assign flow; no child starts preselected."
  - "Approvals never update coins locally; success feedback follows backend mutation and refetch."
patterns-established:
  - "Responsible workflow screens compose small shared cards/forms rather than route-specific one-off layouts."
  - "Approval actions disable duplicate submits and refetch backend state after mutation."
requirements-completed: [MISS-01, MISS-03, MISS-08, MISS-09]
duration: 114min
completed: 2026-06-03
---

# Phase 06 Plan 03: Mission Management, Assignment, and Approval Queue Summary

**Responsible mission workflow with inactive mission management, guided assignment, and backend-backed approvals**

## Performance

- **Duration:** 114 min
- **Completed:** 2026-06-03
- **Tasks:** 5
- **Files modified:** 21

## Accomplishments

- Added backend support for `GET /missions?includeInactive=true` while preserving active-only default mission listing.
- Extended responsible mobile service contracts for mission CRUD, assignment, pending approvals, approve, and reject.
- Built `ResponsibleMissionsScreen` with active/inactive sections, approval shortcut, edit/assign/deactivate actions, and preserved-history deactivation copy.
- Built guided mission create/edit flow and separate existing-mission assignment flow with active-child picker, optional due date, and partial assignment failure feedback.
- Built `ResponsibleApprovalsScreen` with backend-loaded pending approvals, approve/reject actions, optional rejection reason, duplicate-submit protection, refetch, and empty state.
- Connected dashboard quick actions and responsible tab navigation to the new mission and approval routes.

## Task Commits

1. **Task 1: Add inactive mission list backend support**
   - `7bdb0ec` feat(06-03): support inactive mission management list
2. **Task 2: Add mission and approval service methods**
   - `a6297eb` feat(06-03): add responsible mission service methods
3. **Tasks 3-5: Mission list, create/edit/assignment, and approvals**
   - `8505d83` feat(06-03): build responsible mission workflows

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/missions/MissionController.java` - accepts `includeInactive=false` query flag on mission listing.
- `backend/src/main/java/br/com/habitinhos/missions/MissionService.java` - branches active-only vs management all-missions list.
- `backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java` - adds family-scoped active-first all-missions query.
- `backend/src/test/java/br/com/habitinhos/missions/MissionIntegrationTest.java` - covers active-only default, inactive management visibility, and family isolation.
- `mobile/src/api/types.ts` - mission, assignment, and rejection request DTOs.
- `mobile/src/features/responsible/responsibleService.ts` - mission CRUD/assignment and approval methods.
- `mobile/src/features/responsible/ResponsibleMissionsScreen.tsx` - mission management list and deactivation flow.
- `mobile/src/features/responsible/ResponsibleMissionFormScreen.tsx` - guided create/edit mission form.
- `mobile/src/features/responsible/ResponsibleAssignmentFormScreen.tsx` - assignment flow for existing active missions.
- `mobile/src/features/responsible/ResponsibleApprovalsScreen.tsx` - full pending approval queue.
- `mobile/src/features/responsible/components/ApprovalCard.tsx` - dashboard shortcut and actionable approval queue row.
- `mobile/src/features/responsible/components/ChildPicker.tsx` - active-child multi-select.
- `mobile/src/features/responsible/components/CoinValueControl.tsx` - minimum-one coin input.
- `mobile/src/features/responsible/components/ManageListItem.tsx` - reusable management item with optional extra actions.
- `mobile/src/features/responsible/ResponsibleHomeScreen.tsx` and `ResponsibleTabsScreen.tsx` - navigation wiring for missions and approvals.
- `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx` - mission/assignment/approval routes.
- `mobile/src/features/responsible/__tests__/responsible-service.test.ts` - route and payload service contracts.
- `mobile/src/features/responsible/__tests__/responsible-missions.test.tsx` - mission list/form/assignment behavior.
- `mobile/src/features/responsible/__tests__/responsible-approvals.test.tsx` - approval/rejection behavior.

## Decisions Made

- Kept inactive mission visibility scoped to responsible management with `includeInactive=true`.
- Kept edit mode as future-template-only with explicit helper copy; existing assignments keep their snapshots.
- Sent assignment due date as `null` when empty, never as an invalid string.
- Loaded child names for approval cards through backend child data; no client family ids are sent.
- Refetched approvals after approve/reject and did not locally mutate wallet balances.

## Deviations from Plan

- The spawned executor stalled after writing the backend red test. The orchestrator closed the agent, reused the valid failing test, and completed the plan inline with atomic commits.

## Issues Encountered

- Testcontainers was slow during final backend verification, but `MissionIntegrationTest` completed successfully.
- Existing unrelated dirty files remained untouched: `mobile/package.json`, `mobile/package-lock.json`, and untracked `06-PATTERNS.md`.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd backend && ./mvnw test -Dtest=MissionIntegrationTest` - passed
- `cd mobile && npm test -- responsible-service --runInBand` - passed
- `cd mobile && npm test -- responsible-missions --runInBand` - passed
- `cd mobile && npm test -- responsible-approvals --runInBand` - passed
- `cd mobile && npm test -- responsible-dashboard --runInBand` - passed
- `cd mobile && npm run typecheck` - passed
- `cd mobile && npm run lint` - passed

## Next Phase Readiness

Plan 06-04 can build reward management on the established management-list, form-section, coin-value, confirmation, service-method, and tab-routing patterns.

## Self-Check: PASSED

---
*Phase: 06-fluxo-do-respons-vel*
*Completed: 2026-06-03*
