---
phase: 06-fluxo-do-respons-vel
plan: 02
subsystem: api-ui
tags: [spring-boot, expo, react-native, children-management, responsible-flow, tdd]
requires:
  - phase: 06-01
    provides: ResponsibleTabs, responsibleService, dashboard child detail, and responsible UI components
provides:
  - GET /children?includeInactive=true management support
  - ResponsibleChildren management list
  - ResponsibleChildForm create/edit/deactivate flow
  - history-preserving child deactivation confirmation
affects: [06-03-missions-approvals, 06-04-rewards-management]
tech-stack:
  added: []
  patterns: [TDD red-green commits, includeInactive management lists, single-column mobile forms]
key-files:
  created:
    - mobile/src/features/responsible/ResponsibleChildrenScreen.tsx
    - mobile/src/features/responsible/ResponsibleChildFormScreen.tsx
    - mobile/src/features/responsible/components/ManageListItem.tsx
    - mobile/src/features/responsible/components/ResponsibleFormSection.tsx
    - mobile/src/features/responsible/components/EmojiPicker.tsx
    - mobile/src/features/responsible/components/ConfirmActionSheet.tsx
  modified:
    - backend/src/main/java/br/com/habitinhos/children/ChildController.java
    - backend/src/main/java/br/com/habitinhos/children/ChildService.java
    - backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java
    - backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java
    - mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx
    - mobile/src/features/responsible/responsibleService.ts
    - mobile/src/navigation/routes.ts
key-decisions:
  - "Child management lists active and inactive records only in responsible management context; default child list remains active-only."
  - "Child deactivation is always presented as history-preserving, never as deletion."
patterns-established:
  - "Responsible management screens use `includeInactive=true` through responsibleService for administrative visibility."
  - "Responsible forms keep single-column Android-friendly layout with visible labels and backend-tied submit feedback."
requirements-completed: [CHLD-03]
duration: 48min
completed: 2026-06-03
---

# Phase 06 Plan 02: Children Management Summary

**Responsible child management with inactive-list support, create/edit form, and safe deactivation**

## Performance

- **Duration:** 48 min
- **Completed:** 2026-06-03
- **Tasks:** 4
- **Files modified:** 14

## Accomplishments

- Added backend support for `GET /children?includeInactive=true` while preserving active-only default behavior for existing child-facing flows.
- Built `ResponsibleChildrenScreen` to list active children first, inactive children second, with create/edit navigation and empty/error states.
- Added `ResponsibleChildFormScreen`, `ResponsibleFormSection`, `EmojiPicker`, and responsible child service methods for create/edit.
- Wired child deactivation through a history-preserving confirmation sheet and backend `PATCH /children/{id}/deactivate`.
- Connected `Editar criança` from `ResponsibleChildDetailScreen` to the edit form.

## Task Commits

1. **Task 1: Add inactive child list backend support**
   - `a4e3872` test(06-02): add failing inactive children list coverage
   - `b2525f4` feat(06-02): support inactive children management list
2. **Task 2: Add child management service methods and list screen**
   - `8319728` test(06-02): add failing responsible children screen tests
   - `399b858` feat(06-02): add responsible children management list
3. **Task 3: Build create/edit child form**
   - `550123e` test(06-02): add failing child form coverage
   - `f473353` feat(06-02): implement responsible child form
4. **Task 4: Wire child deactivation and detail edit action**
   - `dee5e8b` test(06-02): add failing child deactivation coverage
   - `16ca714` feat(06-02): wire responsible child deactivation

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/children/ChildController.java` - accepts `includeInactive=false` query flag on child listing.
- `backend/src/main/java/br/com/habitinhos/children/ChildService.java` - branches active-only vs management all-children list.
- `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java` - adds family-scoped all-children query.
- `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` - covers active-only default, inactive management visibility, and family isolation.
- `mobile/src/features/responsible/ResponsibleChildrenScreen.tsx` - responsible child management list.
- `mobile/src/features/responsible/ResponsibleChildFormScreen.tsx` - create/edit/deactivate child form.
- `mobile/src/features/responsible/components/ManageListItem.tsx` - reusable management row.
- `mobile/src/features/responsible/components/ResponsibleFormSection.tsx` - form grouping component.
- `mobile/src/features/responsible/components/EmojiPicker.tsx` - accessible emoji selector.
- `mobile/src/features/responsible/components/ConfirmActionSheet.tsx` - explicit deactivation confirmation.
- `mobile/src/features/responsible/responsibleService.ts` - child CRUD/deactivation methods.
- `mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx` - edit child navigation.
- `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx` - child form/list route wiring.

## Decisions Made

- Kept inactive child visibility scoped to responsible management by using `includeInactive=true`; default `GET /children` remains active-only.
- Used `PATCH /children/{id}/deactivate`, never DELETE, and copied D-24 into visible deactivation text.
- Kept child form payload to backend-supported fields: `name`, `age`, and `avatarKey`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The spawned executor stopped returning completion signals after production commits. The orchestrator closed the agent, verified the committed work, ran the plan verification commands, and completed the SUMMARY/tracking close-out manually.
- Existing unrelated dirty files remained untouched: `mobile/package.json`, `mobile/package-lock.json`, and untracked `06-PATTERNS.md`.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd backend && ./mvnw test -Dtest=ChildIntegrationTest` - passed
- `cd mobile && npm test -- responsible-children --runInBand` - passed
- `cd mobile && npm run typecheck` - passed
- `cd mobile && npm run lint` - passed

## Next Phase Readiness

Plan 06-03 can build mission management and approvals on top of `ResponsibleTabs`, shared management components, `ResponsibleFormSection`, `ConfirmActionSheet`, and `responsibleService`.

## Self-Check: PASSED

---
*Phase: 06-fluxo-do-respons-vel*
*Completed: 2026-06-03*
