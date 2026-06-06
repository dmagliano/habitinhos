---
quick_id: 260604-vfp
slug: apply-phase-6-03-ui-testing-fixes
status: complete
completed_at: 2026-06-05
implementation_commit: 3adf4c3
---

# Quick Summary: Phase 6.03 UI Testing Fixes

## Completed

- Added `Retornar ao início` to the children management screen, returning the responsible user to `ResponsibleTabs`.
- Made all responsible dashboard summary cards actionable:
  - `Crianças` opens children management.
  - `Aprovações` opens pending approvals.
  - `Missões abertas` opens the missions tab.
  - `Resgates recentes` focuses the existing redemptions section.
- Reduced responsible bottom tab safe-area padding with a small capped helper to avoid the large gray band above the menu.
- Removed the non-MVP `Frequência` section from mission creation/editing while keeping API payload recurrence as `ONCE`.
- Removed direct `Sair da conta` from the child profile screen; the child flow now routes account management through `Gerenciar família`.

## Files Changed

- `mobile/src/features/responsible/ResponsibleChildrenScreen.tsx`
- `mobile/src/features/responsible/ResponsibleHomeScreen.tsx`
- `mobile/src/features/responsible/ResponsibleTabsScreen.tsx`
- `mobile/src/features/responsible/ResponsibleMissionFormScreen.tsx`
- `mobile/src/features/child/ChildTabsScreen.tsx`
- Focused tests under `mobile/src/features/**/__tests__`

## Notes

- No dedicated redemptions list route exists in the current MVP, so `Resgates recentes` continues to target the real dashboard section.
- Pre-existing workspace changes outside this quick task were not staged or committed.
