---
phase: 09
slug: exclusao-fisica-dos-dados-da-conta
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-20
---

# Phase 09 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5, Spring Boot Test, MockMvc, AssertJ, PostgreSQL Testcontainers |
| **Config file** | `backend/pom.xml`, `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` |
| **Quick run command** | `cd backend && ./mvnw -Dtest=AuthIntegrationTest test` |
| **Full suite command** | `cd backend && ./mvnw test` |
| **Estimated runtime** | ~30 seconds with the PostgreSQL container warm |

## Sampling Rate

- **After every task commit:** Run `cd backend && ./mvnw -Dtest=AuthIntegrationTest test`; after Task 2 adds focused methods, use the per-task commands below
- **After the plan wave:** Run `cd backend && ./mvnw test`
- **Before verification:** Full suite must be green
- **Max feedback latency:** 30 seconds for the focused assertion; container startup is an infrastructure exception

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | AUTH-12 | T-09-01 / T-09-02 | E-mail request is enumeration-safe and token is delivered only for matching active/inactive accounts | integration | `cd backend && ./mvnw -Dtest=AuthIntegrationTest test` | ✅ existing | ✅ passed |
| 09-01-02 | 01 | 1 | AUTH-12 | T-09-03 | Confirmation purges every matching account/family and breaks the redemption/transaction cycle | integration | `cd backend && ./mvnw -Dtest=AuthIntegrationTest#permanentDeletionRemovesAllMatchingFamilies test` | ✅ Task 2 | ✅ passed |
| 09-01-03 | 01 | 1 | AUTH-12 | T-09-04 | Failure after DML rolls back all matching families and leaves token unused | integration | `cd backend && ./mvnw -Dtest=AuthIntegrationTest#permanentDeletionRollsBackAllMatchingFamilies test` | ✅ Task 2 | ✅ passed |
| 09-01-04 | 01 | 1 | AUTH-12 | T-09-02 | Invalid/expired/used token performs no DML; JWTs/credentials fail after success; soft delete remains unchanged | integration | `cd backend && ./mvnw -Dtest=AuthIntegrationTest test` | ✅ existing | ✅ passed |
| 09-02-01 | 02 | 2 | DOCS-01 | T-09-07 | Generated OpenAPI, Bruno and API docs agree on permanent request/confirm versus soft deletion | integration | `cd backend && ./mvnw -Dtest=OpenApiIntegrationTest test` | ✅ existing | ⬜ pending |

## Wave 0 Requirements

- [x] Existing `AuthIntegrationTest` and `OpenApiIntegrationTest` infrastructure covers PostgreSQL/Testcontainers and no dependency installation is required.
- [x] Task 2 creates focused multi-family purge and rollback methods before their focused commands are run.

## Manual-Only Verifications

All phase behaviors have automated verification. A manual Swagger smoke may be used as supplemental evidence for the irreversible warning.

## Validation Sign-Off

- [x] All tasks have automated verification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references; focused purge/rollback commands passed after Task 2 created those test methods
- [x] No watch-mode flags
- [x] Feedback latency < 30s for focused checks
- [x] `nyquist_compliant: true` set in frontmatter after execution

**Approval:** automated verification passed on 2026-08-20
