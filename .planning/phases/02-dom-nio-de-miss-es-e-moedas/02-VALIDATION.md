---
phase: 02
slug: dom-nio-de-miss-es-e-moedas
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-29
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit Jupiter + Spring Boot Test + MockMvc + Testcontainers PostgreSQL |
| **Config file** | `backend/pom.xml`; shared base `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` |
| **Quick run command** | `cd backend && ./mvnw test -Dtest=MissionIntegrationTest,MissionAssignmentIntegrationTest,AssignedMissionIntegrationTest,MissionApprovalIntegrationTest,MissionWalletTransactionIntegrationTest,WalletIntegrationTest,OpenApiIntegrationTest` |
| **Full suite command** | `cd backend && ./mvnw test` |
| **Estimated runtime** | ~120 seconds with Docker/Colima running |

---

## Sampling Rate

- **After every task commit:** Run the smallest relevant `./mvnw test -Dtest=...` class for the touched behavior.
- **After every plan wave:** Run `cd backend && ./mvnw test`.
- **Before `$gsd-verify-work`:** Full suite must be green.
- **Max feedback latency:** 120 seconds for focused checks, longer only for the full suite.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | MISS-01, MISS-02 | T-02-01 | Mission CRUD is responsible-only and family-scoped; invalid coin values are rejected | integration | `cd backend && ./mvnw test -Dtest=MissionIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | MISS-03 | T-02-02 | Assignment validates mission/child family ownership and blocks duplicate open assignments | integration | `cd backend && ./mvnw test -Dtest=MissionAssignmentIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | DOCS-01 | — | Phase 2 mission and assignment endpoints appear in generated OpenAPI | smoke/integration | `cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | MISS-04, MISS-05, MISS-06, MISS-07 | T-02-03 | Child-scoped mission listing/completion stays inside the authenticated family and credits only no-approval completions | integration/transaction | `cd backend && ./mvnw test -Dtest=AssignedMissionIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | MISS-08, MISS-09 | T-02-04 | Approval credits exactly once; rejection preserves history and does not credit | integration/transaction | `cd backend && ./mvnw test -Dtest=MissionApprovalIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | WALT-01, WALT-02, WALT-04, WALT-06 | T-02-05 | Wallet balance and `CoinTransaction` ledger update atomically under locked wallet mutation | transaction | `cd backend && ./mvnw test -Dtest=MissionWalletTransactionIntegrationTest,WalletIntegrationTest` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/br/com/habitinhos/missions/MissionIntegrationTest.java` — covers MISS-01, MISS-02.
- [ ] `backend/src/test/java/br/com/habitinhos/missions/MissionAssignmentIntegrationTest.java` — covers MISS-03 and duplicate assignment behavior.
- [ ] `backend/src/test/java/br/com/habitinhos/missions/AssignedMissionIntegrationTest.java` — covers MISS-04, MISS-05, MISS-06, MISS-07.
- [ ] `backend/src/test/java/br/com/habitinhos/missions/MissionApprovalIntegrationTest.java` — covers MISS-08, MISS-09.
- [ ] `backend/src/test/java/br/com/habitinhos/missions/MissionWalletTransactionIntegrationTest.java` — covers WALT-02, WALT-04, WALT-06.
- [ ] `backend/src/test/java/br/com/habitinhos/wallet/WalletIntegrationTest.java` — covers WALT-01.
- [ ] `backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java` — covers DOCS-01.
- [ ] `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` cleanup includes Phase 2 tables.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swagger UI manual smoke | DOCS-01 | Automated OpenAPI path checks prove generation; manual Swagger UI confirms the demo inspection flow | Start backend, open `/swagger-ui.html`, authorize with Bearer token, and inspect mission, assignment, approval, and wallet endpoints |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers all MISSING references.
- [ ] No watch-mode flags.
- [ ] Feedback latency < 120s for focused checks once Docker/Colima is running.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
