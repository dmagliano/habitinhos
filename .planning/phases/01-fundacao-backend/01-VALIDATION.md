---
phase: 01
slug: fundacao-backend
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5, Spring Boot Test, MockMvc, Testcontainers PostgreSQL |
| **Config file** | `backend/pom.xml`; test container setup created in Plan 01-01 |
| **Quick run command** | `cd backend && ./mvnw test` |
| **Full suite command** | `cd backend && ./mvnw test` |
| **Estimated runtime** | ~45-90 seconds after dependencies are cached |

---

## Sampling Rate

- **After every task commit:** Run `cd backend && ./mvnw test`
- **After every plan wave:** Run `cd backend && ./mvnw test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds after local Maven/Testcontainers cache is warm

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01..AUTH-06, CHLD-01..CHLD-04 | T-04 | Backend starts with explicit config and test harness | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | AUTH-05, AUTH-06 | T-02/T-03 | PostgreSQL/Flyway config is active, Hibernate validates schema | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-02-01 | 02 | 2 | AUTH-03, AUTH-05, CHLD-01..CHLD-04 | T-02/T-03/T-06 | Schema stores family-scoped rows and no plaintext PIN/password fields | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-02-02 | 02 | 2 | AUTH-03, CHLD-01, CHLD-02 | T-03 | Repositories expose family-scoped lookup methods | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-03-01 | 03 | 3 | AUTH-01, AUTH-02, AUTH-03, AUTH-04 | T-01/T-04/T-05 | Register/login/me work with hashed passwords and signed JWT | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-03-02 | 03 | 3 | AUTH-05, AUTH-06 | T-02/T-03 | JWT-derived `familyUnitId` is the only protected-operation tenant source | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-04-01 | 04 | 4 | CHLD-01, CHLD-02, CHLD-03, CHLD-04 | T-02/T-03/T-06 | Child CRUD is family-scoped and child wallet is created atomically | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |
| 01-04-02 | 04 | 4 | AUTH-06, CHLD-03 | T-03 | Cross-family read/update/deactivate attempts are blocked | integration | `cd backend && ./mvnw test` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Plan 01-01 acts as Wave 0 for test infrastructure:

- [x] `backend/pom.xml` — adds Spring Boot test, Spring Security test, and Testcontainers dependencies.
- [x] `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` — shared PostgreSQL Testcontainers setup.
- [x] `backend/src/test/java/br/com/habitinhos/HabitinhosApplicationTests.java` — first context-load smoke test.
- [x] `backend/src/main/resources/application.yml` — sets `spring.jpa.hibernate.ddl-auto=validate`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swagger UI loads locally | DOCS-01 support | It is a local browser/docs smoke check, not a core business rule | Run backend and open `/swagger-ui.html`; verify Phase 1 endpoints are visible |

All tenant, auth, child, and wallet behaviors must have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s after cache warm-up
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-26 for planning; execution still must make every row green.
