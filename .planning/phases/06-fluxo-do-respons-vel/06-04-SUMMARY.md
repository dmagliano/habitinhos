---
phase: 06-fluxo-do-respons-vel
plan: 04
subsystem: api-ui
tags: [spring-boot, expo, react-native, rewards-management, responsible-profile, responsible-flow, tdd]
requires:
  - phase: 06-01
    provides: ResponsibleTabs, dashboard, child detail, responsibleService baseline
  - phase: 06-02
    provides: shared management list/form/confirmation components
  - phase: 06-03
    provides: mission and approval navigation patterns
provides:
  - GET /rewards?includeInactive=true management support
  - responsible reward management list
  - responsible reward create/edit/deactivate form
  - responsible profile tab with mode switch and logout
  - final Phase 6 automated validation
affects: [07-demo-polish]
tech-stack:
  added: []
  patterns: [TDD red-green commits, includeInactive management lists, backend DTO-only payloads, history-preserving deactivation]
key-files:
  created:
    - mobile/src/features/responsible/ResponsibleRewardsScreen.tsx
    - mobile/src/features/responsible/ResponsibleRewardFormScreen.tsx
    - mobile/src/features/responsible/ResponsibleProfileScreen.tsx
    - mobile/src/features/responsible/__tests__/responsible-rewards.test.tsx
  modified:
    - backend/src/main/java/br/com/habitinhos/rewards/RewardController.java
    - backend/src/main/java/br/com/habitinhos/rewards/RewardService.java
    - backend/src/main/java/br/com/habitinhos/rewards/RewardRepository.java
    - backend/src/test/java/br/com/habitinhos/rewards/RewardIntegrationTest.java
    - mobile/src/api/types.ts
    - mobile/src/features/responsible/responsibleService.ts
    - mobile/src/features/responsible/ResponsibleHomeScreen.tsx
    - mobile/src/features/responsible/ResponsibleTabsScreen.tsx
    - mobile/src/features/responsible/__tests__/responsible-service.test.ts
    - mobile/src/features/responsible/__tests__/responsible-navigation.test.tsx
    - mobile/src/features/responsible/__tests__/responsible-dashboard.test.tsx
    - mobile/src/features/responsible/__tests__/responsible-children.test.tsx
    - mobile/src/features/responsible/__tests__/responsible-missions.test.tsx
    - mobile/src/navigation/routes.ts
    - mobile/src/navigation/RootNavigator.tsx
key-decisions:
  - "Reward management uses `includeInactive=true`; default `GET /rewards` remains active-only for child catalog compatibility."
  - "Reward form sends only backend-supported DTO fields: `title`, `description`, and `cost`."
  - "Reward deactivation is presented as history-preserving and uses PATCH, never DELETE."
  - "Responsible profile shows user/family identity but never token, familyUnitId, accessPin, or hashes."
patterns-established:
  - "Management tests wait for rendered cards, not only service calls, to avoid React timing races under load."
  - "Responsible profile/mode actions live in a dedicated screen rather than inline tab placeholders."
requirements-completed: [MOBL-03, REWD-01]
duration: 142min
completed: 2026-06-03
---

# Phase 06 Plan 04: Reward Management and Responsible Profile Summary

**Responsible reward workflows, profile actions, and final Phase 6 validation**

## Performance

- **Duration:** 142 min
- **Completed:** 2026-06-03
- **Tasks:** 4
- **Files modified:** 19

## Accomplishments

- Added backend support for `GET /rewards?includeInactive=true` while preserving active-only reward listing by default.
- Extended `responsibleService` with reward get/create/update/deactivate methods and DTO contract tests.
- Built `ResponsibleRewardsScreen` with active/inactive sections, cost metadata, empty/error states, and create/edit entry points.
- Built `ResponsibleRewardFormScreen` with PT-BR fields, positive-cost validation, duplicate-submit protection, edit loading, and history-preserving deactivation confirmation.
- Built `ResponsibleProfileScreen` with responsible/family identity, `Trocar modo`, and `Sair da conta`, without exposing internal session identifiers.
- Replaced reward/profile placeholders in responsible tabs and wired the dashboard `Nova recompensa` shortcut.
- Stabilized management-list tests by awaiting rendered cards instead of only service-call completion.

## Task Commits

1. **Task 1: Add inactive reward list backend support**
   - `f2b0b40` feat(06-04): support inactive reward management list
2. **Tasks 2-4: Reward service, reward screens, profile, and navigation**
   - `6e41eb4` feat(06-04): build responsible reward workflows
3. **Final validation stability**
   - `0f22993` test(06-04): stabilize responsible management tests

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/rewards/RewardController.java` - accepts `includeInactive=false` query flag on reward listing.
- `backend/src/main/java/br/com/habitinhos/rewards/RewardService.java` - branches active-only vs management all-rewards list.
- `backend/src/main/java/br/com/habitinhos/rewards/RewardRepository.java` - adds family-scoped active-first all-rewards query.
- `backend/src/test/java/br/com/habitinhos/rewards/RewardIntegrationTest.java` - covers active-only default, inactive management visibility, and family isolation.
- `mobile/src/api/types.ts` - reward request DTO.
- `mobile/src/features/responsible/responsibleService.ts` - reward CRUD/deactivation methods.
- `mobile/src/features/responsible/ResponsibleRewardsScreen.tsx` - reward management list.
- `mobile/src/features/responsible/ResponsibleRewardFormScreen.tsx` - create/edit/deactivate reward form.
- `mobile/src/features/responsible/ResponsibleProfileScreen.tsx` - responsible profile actions.
- `mobile/src/features/responsible/ResponsibleHomeScreen.tsx` and `ResponsibleTabsScreen.tsx` - reward/profile navigation wiring.
- `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx` - reward form route wiring.
- `mobile/src/features/responsible/__tests__/responsible-service.test.ts` - reward service contracts.
- `mobile/src/features/responsible/__tests__/responsible-rewards.test.tsx` - reward list/form/deactivation behavior.
- `mobile/src/features/responsible/__tests__/responsible-navigation.test.tsx` - tab/profile behavior.
- `mobile/src/features/responsible/__tests__/responsible-dashboard.test.tsx` - dashboard reward shortcut.
- `mobile/src/features/responsible/__tests__/responsible-children.test.tsx` and `responsible-missions.test.tsx` - management-list wait stabilization.

## Decisions Made

- Kept inactive reward visibility scoped to responsible management by using `includeInactive=true`; child reward catalog stays active-only.
- Did not add emoji/category fields to rewards because the current backend DTOs do not support them.
- Used `PATCH /rewards/{id}/deactivate`, never DELETE, and surfaced the preserved-history behavior in visible PT-BR copy.
- Kept profile actions on the existing FamilyHub/AuthContext surfaces instead of adding a new mode/session mechanism.

## Deviations from Plan

- The plan mentioned feedback banners after reward create/update/deactivate. The implemented flow navigates back to the responsible tabs after backend success and relies on tested backend mutation plus refreshed list entry points; no unsupported local success state was added.
- The manual Expo smoke at Android 360px-430px was not performed in this automated Codex session and remains a user setup item.

## Issues Encountered

- Parallel Jest execution exposed timing races in existing management-list tests. The tests now wait for rendered cards rather than only service invocation.
- Existing unrelated dirty files remained untouched: `mobile/package.json`, `mobile/package-lock.json`, and untracked `06-PATTERNS.md`.

## User Setup Required

- Manual Expo smoke at Android 360px-430px remains pending after automated checks.

## Verification

- `cd backend && ./mvnw test -Dtest=RewardIntegrationTest` - passed
- `cd mobile && npm test -- responsible-rewards --runInBand` - passed
- `cd mobile && npm test -- responsible-navigation --runInBand` - passed
- `cd mobile && npm test -- responsible-service --runInBand` - passed
- `cd mobile && npm test -- responsible-dashboard --runInBand` - passed
- `cd mobile && npm test -- responsible-children --runInBand` - passed
- `cd mobile && npm test -- responsible-missions --runInBand` - passed
- `cd mobile && npm test -- responsible-approvals --runInBand` - passed
- `cd mobile && npm run typecheck` - passed
- `cd mobile && npm run lint` - passed

## Next Phase Readiness

Phase 7 can proceed to demo seeds, documentation, visual polish, and rehearsal on top of a complete responsible/child mobile flow backed by the real API.

## Self-Check: PASSED

---
*Phase: 06-fluxo-do-respons-vel*
*Completed: 2026-06-03*
