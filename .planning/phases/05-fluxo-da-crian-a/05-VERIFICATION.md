---
phase: "05"
name: "fluxo-da-crian-a"
created: 2026-06-02
verified: 2026-06-02
status: human_needed
automated_checks:
  - "cd mobile && npm test -- child-service --runInBand"
  - "cd mobile && npm test -- child-navigation --runInBand"
  - "cd mobile && npm test -- child-home --runInBand"
  - "cd mobile && npm test -- child-missions --runInBand"
  - "cd mobile && npm test -- child-rewards --runInBand"
  - "cd mobile && npm run typecheck"
  - "cd mobile && npm run lint"
  - "cd mobile && npm test -- --runInBand"
  - "cd backend && ./mvnw test"
tests:
  mobile_total: 44
  backend_total: 40
  failures: 0
  errors: 0
  skipped: 0
human_verification:
  - "Manual Expo smoke against local backend with real child, mission, wallet, and reward data"
---

# Phase 05: fluxo-da-crian-a — Verification

## Goal-Backward Verification

**Phase Goal:** Child can demonstrate the core mission and reward loop on mobile using the real API.

**Result:** Human verification required. The automated implementation checks passed and no code-review findings remain, but the Phase 5 validation contract includes a manual Expo smoke with real backend data. That smoke was not run in this CLI session because it requires an Expo/mobile runtime or device and manually created or seeded real data.

## Checks

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | MOBL-04 | Human needed | Automated child profile, home, mission, reward, feedback, and insufficient-balance tests pass. Manual Expo smoke remains pending. |
| 2 | MOBL-05 | Human needed | `childService` route tests and screens use real API service calls with Bearer token and no mock/offline fallback. Manual real-runtime smoke remains pending. |
| 3 | MISS-04 | Passed | `child-home` and `child-missions` tests verify pending child mission data from `childService.listPendingMissions`. Backend `./mvnw test` confirms tenant-safe child mission listing. |
| 4 | MISS-05 | Passed | `child-missions` tests verify completion, duplicate-submit protection, approval-required feedback, auto-credit feedback, and post-completion refresh resilience. Backend `./mvnw test` confirms completion behavior. |
| 5 | REWD-03 | Passed | `child-rewards` tests verify active rewards are loaded from `childService.listRewards`; backend `./mvnw test` confirms family-scoped reward listing. |
| 6 | REWD-04 | Passed | `child-rewards` tests verify confirmation-before-spend and `childService.redeemReward(token, reward.id, child.id)` call shape. Backend `./mvnw test` confirms sufficient-balance redemption/debit. |
| 7 | REWD-05 | Passed | `child-rewards` tests verify disabled unaffordable rewards, exact missing coins, semantic `INSUFFICIENT_BALANCE` handling, and no raw backend code display. Backend `./mvnw test` confirms insufficient-balance rollback. |
| 8 | WALT-01 | Passed | `child-home`, `child-missions`, and `child-rewards` tests verify wallet balance display/refetch through `childService.getWallet`; backend `./mvnw test` confirms wallet exposure. |

## Success Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Child can select/access their profile | Passed | `child-navigation` verifies `Sou criança`, active child selection, and `ChildTabs` navigation. |
| 2 | Child home shows balance and pending missions | Passed | `child-home` verifies wallet balance and due-date-prioritized pending missions. |
| 3 | Child can complete a mission and receive clear feedback | Passed | `child-missions` verifies `COMPLETED` and `AWAITING_APPROVAL` feedback and duplicate-submit protection. |
| 4 | Child can browse rewards and redeem with sufficient balance | Passed | `child-rewards` verifies reward catalog, confirmation panel, redemption call, success feedback, and refetch. |
| 5 | Child sees understandable PT-BR insufficient-balance message | Passed | `child-rewards` verifies disabled missing-coin guidance and friendly backend insufficient-balance feedback. |
| 6 | Screens consume backend data rather than mock-only state | Passed | Service and screen tests mock only `childService`; production screens call real API services and do not create fake children, missions, balances, or rewards. |
| 7 | Child screens follow Phase 5 design context | Human needed | Components follow the approved child UI patterns and code review is clean; a real-runtime visual smoke remains pending. |

## Automated Evidence

| Command | Result |
|---------|--------|
| `cd mobile && npm test -- child-service --runInBand` | Passed: 1 suite, 6 tests |
| `cd mobile && npm test -- child-navigation --runInBand` | Passed: 1 suite, 4 tests |
| `cd mobile && npm test -- child-home --runInBand` | Passed: 1 suite, 3 tests |
| `cd mobile && npm test -- child-missions --runInBand` | Passed: 1 suite, 7 tests |
| `cd mobile && npm test -- child-rewards --runInBand` | Passed: 1 suite, 6 tests |
| `cd mobile && npm run typecheck` | Passed |
| `cd mobile && npm run lint` | Passed |
| `cd mobile && npm test -- --runInBand` | Passed: 12 suites, 44 tests |
| `cd backend && ./mvnw test` | Passed: 40 tests, 0 failures, 0 errors, 0 skipped |
| `gsd-sdk query verify.schema-drift 05` | Passed: no schema drift detected |
| `gsd-sdk query verify.codebase-drift 05` | Skipped non-blocking: no `STRUCTURE.md` |
| Code review | Passed: `.planning/phases/05-fluxo-da-crian-a/05-REVIEW.md` status `clean` |

## Regression Coverage

Prior phase verification artifacts for Phases 01-03 all require `cd backend && ./mvnw test`. That suite passed during Phase 5 validation after the mobile implementation. The later code-review fix touched only mobile files and was covered by targeted mobile regression tests plus the full mobile suite.

## Human Verification Required

Saved to `.planning/phases/05-fluxo-da-crian-a/05-HUMAN-UAT.md`:

1. Manual Expo smoke against local backend with real data:
   - Start backend/PostgreSQL.
   - Run Expo/mobile.
   - Log in.
   - Enter `Sou criança`.
   - Select a real child.
   - Verify balance appears.
   - Complete one approval-required and one auto-credit mission if data exists.
   - Redeem one affordable reward.
   - Verify one unaffordable reward shows missing coins.

## Result

Phase 05 is automated-green and code-review-clean, but final verification remains `human_needed` until the manual Expo smoke is completed or explicitly approved.

