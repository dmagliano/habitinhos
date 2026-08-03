---
phase: 07
slug: polimento-para-demonstra-o-do-tcc
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-18
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend framework** | Maven + Spring Boot Test + JUnit/Testcontainers |
| **Backend config file** | `backend/pom.xml` |
| **Backend quick run command** | `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` |
| **Backend full suite command** | `cd backend && ./mvnw test` |
| **Mobile framework** | Jest 29 + jest-expo + TypeScript + Expo lint |
| **Mobile config file** | `mobile/package.json` |
| **Mobile quick run command** | `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx` |
| **Mobile full suite command** | `cd mobile && npm run lint && npm run typecheck && npm run test:ci` |
| **Estimated runtime** | Quick checks ~30-90s; full suite depends on Docker/Testcontainers availability |

---

## Sampling Rate

- **After every task commit:** Run the task's focused quick command.
- **After every plan wave:** Run that plan's declared full verification commands.
- **Before `$gsd-verify-work`:** Backend full suite, mobile lint/typecheck/test suite, and final manual rehearsal artifact must be complete or explicitly marked as human-blocked.
- **Max feedback latency:** 120 seconds for mobile quick checks; backend full suite may exceed this because Testcontainers starts PostgreSQL.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | DOCS-04 | T-07-01-01 | Demo seed is local/opt-in and idempotent | integration | `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | DOCS-04 | T-07-01-02 | Registration confirmation is mobile-only and not sent to backend | component | `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx` | ✅ | ⬜ pending |
| 07-01-03 | 01 | 1 | DOCS-04 | T-07-01-03 | Seeded demo produces representative populated screens | source/manual | `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | DOCS-02 | — | Docs match current API/domain contracts | source assertions | `test -f docs/architecture.md && test -f docs/data-model.md && test -f docs/api-contract.md && test -f docs/testing-strategy.md` | ✅ | ⬜ pending |
| 07-02-02 | 02 | 2 | DOCS-03 | — | README contains local run/test/demo seed instructions | source assertions | `rg -n "demo@habitinhos.local|Demo12345|habitinhos.demo.seed.enabled|npm run android:local|./mvnw test" README.md` | ✅ | ⬜ pending |
| 07-02-03 | 02 | 2 | DOCS-04 | — | TCC demo script walks through full MVP journey | source assertions | `rg -n "Responsável|Criança|miss|recompensa|resgate|demo@habitinhos.local" docs/tcc-demo-script.md` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 3 | DOCS-02,DOCS-03,DOCS-04 | — | Final verification records automated and manual outcomes | full suite/manual | `cd backend && ./mvnw test`; `cd mobile && npm run lint && npm run typecheck && npm run test:ci` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers most phase requirements. New files expected during execution:

- [ ] `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java` — focused seed/idempotency checks for DOCS-04.
- [ ] `docs/tcc-demo-script.md` — demo script source assertions for DOCS-04.
- [ ] `.planning/phases/07-polimento-para-demonstra-o-do-tcc/07-FINAL-VERIFICATION.md` — final automated/manual verification record.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo device/emulator demo flow | DOCS-04 | Requires running Expo and a device/emulator outside normal unit tests | Start PostgreSQL, backend with seed enabled, and `cd mobile && npm run android:local`; rehearse seeded responsible/child journey. |
| Swagger smoke for seeded account | DOCS-03,DOCS-04 | Confirms local operator docs and backend seed together | Open `http://localhost:8080/swagger-ui.html`, login as seeded responsible, authorize, call `/me`, dashboard, children, missions, rewards. |
| TCC presentation timing/readiness | DOCS-04 | Requires human demo pacing and environment | Follow `docs/tcc-demo-script.md` and record result in `07-FINAL-VERIFICATION.md`. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or manual verification documented.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-06-18
