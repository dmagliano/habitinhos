---
status: passed
quick_id: 260603-08s
slug: apply-phase-6-ui-testing-fixes-for-respo
verified: 2026-06-03
---

# Quick Task 260603-08s Verification

## Must-Haves

- Responsible dashboard metric cards stay readable at Android 360px-430px widths.
  - Verified by code review of `MetricSummaryCard` and `ResponsibleHomeScreen`: metric cards now wrap into two-column boxes and display short numeric values with separate labels.
  - Covered by `responsible-dashboard.test.tsx`.

- Header copy never wraps beside a CTA button or coin pill on the reported reward, mission, and form screens.
  - Verified by code review of `AppHeader`: header actions now render below the identity/copy row and align with the text column.
  - Covered indirectly by responsible/child screen render tests.

- Child reward cards show only cost and missing-coin pills; action buttons sit below those pills.
  - Verified by code review of `RewardCard`: duplicate `Custa X moedas` copy was removed, missing coins moved into the pill row, and the button remains below progress.
  - Covered by `child-rewards.test.tsx`.

- Child home mission card text gets full card width below a right-aligned coin pill.
  - Verified by code review of `ChildHomeScreen`: the reward pill moved into a dedicated top row and copy moved below it.
  - Covered by `child-home.test.tsx`.

- Reward form placeholders are visually lighter than entered text.
  - Verified by code review of `ResponsibleRewardFormScreen` and companion form inputs: placeholders use `colors.textMuted` while entered text uses `colors.textPrimary`.
  - Covered by `responsible-rewards.test.tsx`.

## Automated Verification

- Targeted Jest: passed, 5 suites / 25 tests.
- TypeScript: passed.
- Lint: passed.

## Manual Follow-Up

Manual Expo visual re-check was not rerun in this terminal session. The code changes are ready for the next Android screenshot pass.
