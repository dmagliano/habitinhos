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
| 02-01-01 | 01 | 1 | MISS-01, MISS-02, MISS-03, WALT-04, WALT-06 | T-02-01, T-02-02, T-02-03 | V2 schema defines missions, assigned_missions, concrete coin_transactions ledger, duplicate-open assignment constraint, and duplicate mission-credit constraint | migration/compile | `cd backend && ./mvnw -DskipTests compile` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | MISS-01, MISS-03 | T-02-04 | Mission/AssignedMission entities use Lombok boilerplate safely and expose family-scoped repository contracts consumed by later plans | compile | `cd backend && ./mvnw -DskipTests compile` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | MISS-01, MISS-02, MISS-03, DOCS-01 | T-02-05, T-02-06 | Mission CRUD and assignment tests prove tenant isolation, positive coins, snapshot, duplicate-open guard, and OpenAPI paths | integration | `cd backend && ./mvnw test -Dtest=MissionIntegrationTest,MissionAssignmentIntegrationTest,OpenApiIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 2 | MISS-01, MISS-02, MISS-03, DOCS-01 | T-02-05, T-02-06, T-02-07, T-02-08 | Mission CRUD and assignment endpoints are responsible-only, family-scoped, snapshot-preserving, and visible in OpenAPI | integration | `cd backend && ./mvnw test -Dtest=MissionIntegrationTest,MissionAssignmentIntegrationTest,OpenApiIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | WALT-01, WALT-02, WALT-04, WALT-06 | T-02-09, T-02-10, T-02-11 | Wallet balance and `CoinTransaction` ledger update atomically under locked wallet mutation | transaction | `cd backend && ./mvnw test -Dtest=MissionWalletTransactionIntegrationTest,WalletIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | WALT-02, WALT-04, WALT-06 | T-02-09, T-02-10, T-02-11 | `creditForMission` writes wallet and ledger in one transaction and blocks duplicate mission credit | transaction | `cd backend && ./mvnw test -Dtest=MissionWalletTransactionIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 3 | WALT-01, DOCS-01 | T-02-12, T-02-13 | Wallet balance endpoint is family-scoped and exposed in OpenAPI | integration | `cd backend && ./mvnw test -Dtest=WalletIntegrationTest,OpenApiIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 4 | MISS-04, MISS-05, MISS-06, MISS-07 | T-02-05, T-02-06 | Child-scoped mission listing/completion stays inside the authenticated family and credits only no-approval completions | integration/transaction | `cd backend && ./mvnw test -Dtest=AssignedMissionIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 4 | MISS-04, MISS-05, MISS-06, MISS-07 | T-02-05, T-02-06, T-02-07 | Completion state machine integrates with wallet credit without duplicate ledger writes | integration/transaction | `cd backend && ./mvnw test -Dtest=AssignedMissionIntegrationTest` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 4 | MISS-08, MISS-09, DOCS-01 | T-02-05, T-02-06, T-02-07 | Approval credits exactly once; rejection preserves history and all Phase 2 endpoints appear in generated OpenAPI | integration/transaction | `cd backend && ./mvnw test -Dtest=MissionApprovalIntegrationTest,AssignedMissionIntegrationTest,OpenApiIntegrationTest` | ❌ W0 | ⬜ pending |

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

## Execution Waves

| Wave | Plans | Dependency |
|------|-------|------------|
| 1 | 02-01 | Schema, entities, repositories, cleanup |
| 2 | 02-04 | Mission CRUD/assignment API depends on 02-01 |
| 3 | 02-03 | Wallet/ledger service and balance endpoint depends on 02-01 and 02-04 |
| 4 | 02-02 | Completion/approval/rejection depends on 02-04 and 02-03 |

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
