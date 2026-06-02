---
phase: 05
slug: fluxo-da-crian-a
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-02
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Mobile: Jest 29.7.0, `jest-expo`, `@testing-library/react-native`; Backend: Spring Boot Test + MockMvc + Testcontainers |
| **Config file** | `mobile/package.json`, `mobile/jest.setup.ts`, `backend/pom.xml` |
| **Quick run command** | `cd mobile && npm test -- child --runInBand` |
| **Full suite command** | `cd mobile && npm test -- --runInBand`; `cd mobile && npm run typecheck`; `cd mobile && npm run lint`; `cd backend && ./mvnw test` |
| **Estimated runtime** | Mobile targeted: ~20-45 seconds; full mobile+backend: ~2-5 minutes |

---

## Sampling Rate

- **After every task commit:** Run `cd mobile && npm test -- child --runInBand` once Wave 0 tests exist.
- **After every mobile implementation task:** Run `cd mobile && npm run typecheck` and `cd mobile && npm run lint`.
- **After every plan wave:** Run `cd mobile && npm test -- --runInBand`.
- **Before `$gsd-verify-work`:** Run `cd mobile && npm test -- --runInBand`, `cd mobile && npm run typecheck`, `cd mobile && npm run lint`, and `cd backend && ./mvnw test`.
- **Max feedback latency:** 5 minutes for full phase validation.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-W0-01 | 05-01 | 0 | MOBL-05 | T-05-01 | Child services use Bearer token and never send `familyUnitId` | unit | `cd mobile && npm test -- child-service --runInBand` | ❌ W0 | ⬜ pending |
| 05-W0-02 | 05-01 | 0 | MOBL-04 | T-05-02 | Child route selection stays inside responsible session | component/navigation | `cd mobile && npm test -- child-navigation --runInBand` | ❌ W0 | ⬜ pending |
| 05-W0-03 | 05-01 | 0 | WALT-01, MISS-04 | T-05-03 | Home renders backend wallet balance and pending mission data only | component | `cd mobile && npm test -- child-home --runInBand` | ❌ W0 | ⬜ pending |
| 05-W0-04 | 05-02 | 0 | MISS-04, MISS-05 | T-05-04 | Completion feedback does not promise coins for approval-required missions | component + service | `cd mobile && npm test -- child-missions --runInBand` | ❌ W0 | ⬜ pending |
| 05-W0-05 | 05-03 | 0 | REWD-03, REWD-04, REWD-05 | T-05-05 | Redemption uses backend route, handles `INSUFFICIENT_BALANCE`, and refetches wallet state | component + service | `cd mobile && npm test -- child-rewards --runInBand` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mobile/src/features/child/__tests__/child-service.test.ts` — covers real API paths, token use, no `familyUnitId`, and reward route drift.
- [ ] `mobile/src/features/child/__tests__/child-navigation.test.tsx` — covers `FamilyHub` child entry, profile selection, tabs, and profile/mode switch affordance.
- [ ] `mobile/src/features/child/__tests__/child-home.test.tsx` — covers backend balance, pending missions, loading, empty, and error states.
- [ ] `mobile/src/features/child/__tests__/child-missions.test.tsx` — covers completion loading, `COMPLETED` feedback, `AWAITING_APPROVAL` feedback, and refetch behavior.
- [ ] `mobile/src/features/child/__tests__/child-rewards.test.tsx` — covers reward affordability, confirmation with remaining balance, successful redemption, disabled insufficient-balance state, and backend `INSUFFICIENT_BALANCE` mapping.
- [ ] Backend contract tests remain green. Add or update backend/docs contract coverage only if a plan changes redemption route behavior.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo child flow against a local backend with real data | MOBL-04, MOBL-05, MISS-04, MISS-05, REWD-03, REWD-04, REWD-05, WALT-01 | Phase 7 owns demo seeds, and Phase 5 still needs one real smoke pass with locally created child/mission/reward data | Start backend/PostgreSQL, log into mobile, enter `Sou criança`, select a real child, confirm balance appears, complete one approval-required and one auto-credit mission if available, redeem one affordable reward, and verify one unaffordable reward shows missing coins |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5 minutes
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
