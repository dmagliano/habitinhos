---
phase: 06
slug: fluxo-do-respons-vel
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-02
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0, jest-expo ^56.0.4, @testing-library/react-native 13.3.3; backend uses Maven/Spring Boot tests |
| **Config file** | `mobile/package.json`, `mobile/jest.setup.ts`, `backend/pom.xml` |
| **Quick run command** | `cd mobile && npm test -- --runInBand responsible` |
| **Full suite command** | `cd mobile && npm test -- --runInBand && cd ../backend && ./mvnw test` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every mobile task commit:** Run the targeted responsible Jest file for the touched screen/service.
- **After every backend contract task:** Run `cd backend && ./mvnw test`.
- **After every plan wave:** Run `cd mobile && npm test -- --runInBand` and backend tests if backend files changed.
- **Before `$gsd-verify-work`:** Full mobile suite plus backend suite must be green.
- **Max feedback latency:** 120 seconds for phase-level checks.

---

## Per-Requirement Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| MOBL-03 | Responsible navigation replaces stub with tabs, forms, details, profile actions, and real API states. | component/navigation | `cd mobile && npm test -- --runInBand responsible-navigation.test.tsx` | Missing - Wave 0 | pending |
| DASH-01..DASH-04 | Dashboard renders children, balances, mission counts, approval count/navigation, and recent redemptions from API data. | service + component | `cd mobile && npm test -- --runInBand responsible-dashboard.test.tsx` | Missing - Wave 0 | pending |
| CHLD-03 | Responsible can list, view, edit, and deactivate children, including inactive visibility for management. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-children.test.tsx` | Missing - Wave 0 | pending |
| MISS-01, MISS-03 | Responsible can create/edit/deactivate missions and assign one mission to one or more children, including partial assignment failure. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-missions.test.tsx` | Missing - Wave 0 | pending |
| MISS-08, MISS-09 | Responsible can approve/reject awaiting missions, duplicate submits are disabled, and dashboard/approval state refetches. | service + component | `cd mobile && npm test -- --runInBand responsible-approvals.test.tsx` | Missing - Wave 0 | pending |
| REWD-01 | Responsible can create/edit/deactivate rewards, including inactive visibility for management. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-rewards.test.tsx` | Missing - Wave 0 | pending |

---

## Wave 0 Requirements

- [ ] `mobile/src/features/responsible/__tests__/responsible-service.test.ts` — responsible service routes, Bearer token use, and no `familyUnitId` payloads.
- [ ] `mobile/src/features/responsible/__tests__/responsible-navigation.test.tsx` — FamilyHub opens responsible tabs and profile actions preserve mode switching/logout.
- [ ] `mobile/src/features/responsible/__tests__/responsible-dashboard.test.tsx` — covers DASH-01, DASH-02, DASH-03, and DASH-04.
- [ ] `mobile/src/features/responsible/__tests__/responsible-children.test.tsx` — covers CHLD-03 child list/detail/form/deactivation.
- [ ] `mobile/src/features/responsible/__tests__/responsible-missions.test.tsx` — covers MISS-01 and MISS-03 mission CRUD, two-step assignment, and partial failure.
- [ ] `mobile/src/features/responsible/__tests__/responsible-approvals.test.tsx` — covers MISS-08 and MISS-09 approval/rejection flows.
- [ ] `mobile/src/features/responsible/__tests__/responsible-rewards.test.tsx` — covers REWD-01 reward management.
- [ ] Backend dashboard/list tests if plans add `GET /dashboard/responsible` or inactive-list support.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Android 360px-430px visual rhythm against Stitch references and `06-UI-SPEC.md` | MOBL-03, MOBL-06 | Visual fit and density need screenshot/manual review in Expo. | Run Expo, inspect responsible dashboard, mission flow, approvals, rewards, and profile on Android-width viewport/device. |

---

## Validation Sign-Off

- [ ] All plans include automated verification for touched responsible service/screen/backend files.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verification.
- [ ] Wave 0 creates missing responsible test coverage before relying on those tests as gates.
- [ ] No watch-mode flags in verification commands.
- [ ] Feedback latency < 120s for phase-level checks.
- [ ] `nyquist_compliant: true` set after Wave 0 tests exist and are wired into plans.

**Approval:** pending
