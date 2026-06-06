---
quick_id: 260604-vfp
slug: apply-phase-6-03-ui-testing-fixes
mode: validate
status: planned
created_at: 2026-06-05T01:38:03.507Z
---

# Quick Plan: Phase 6.03 UI Testing Fixes

## Objective

Apply the five manual UI testing fixes from Phase 6.03 while keeping behavior consistent across responsible and child flows.

## Scope

- Add a clear return action from the children management screen to the responsible home.
- Remove non-MVP frequency/recurrence controls from mission creation/editing UI while preserving the backend default mission payload.
- Reduce the responsible bottom navigation spacing so it does not create a large dead band above the menu.
- Make all responsible dashboard summary cards act as navigation affordances.
- Remove direct logout from the child profile screen; logout remains available in responsible mode.

## Implementation Tasks

1. Responsible navigation affordances
   - Update `ResponsibleChildrenScreen` with a "Retornar ao início" action.
   - Update `ResponsibleHomeScreen` metric cards so:
     - "Crianças" opens children management.
     - "Aprovações" opens pending approvals.
     - "Missões abertas" opens the missions tab.
     - "Resgates recentes" focuses the recent redemptions section.
   - Update `ResponsibleTabsScreen` to route dashboard mission-card taps into the tab navigator.

2. Mission form and bottom tab polish
   - Remove the "Frequência" section, helper text, and recurrence option buttons from `ResponsibleMissionFormScreen`.
   - Keep the mission request recurrence as the MVP default `ONCE`.
   - Cap bottom tab safe-area padding in `ResponsibleTabsScreen` to a subtle separation.

3. Child profile logout removal
   - Remove the "Sair da conta" button from `ChildTabsScreen`.
   - Keep "Gerenciar família" as the path to responsible mode and account logout.

## Verification Plan

- Add/update focused React Native tests for each changed behavior.
- Run focused tests:
  - `cd mobile && npm test -- --runInBand src/features/responsible/__tests__/responsible-children.test.tsx src/features/responsible/__tests__/responsible-dashboard.test.tsx src/features/responsible/__tests__/responsible-navigation.test.tsx src/features/responsible/__tests__/responsible-missions.test.tsx src/features/child/__tests__/child-navigation.test.tsx`
- Run project checks:
  - `cd mobile && npm run typecheck`
  - `cd mobile && npm run lint`

## Out Of Scope

- Creating a dedicated full redemptions list route; the current MVP home section remains the target for "Resgates recentes".
- Backend API changes.
