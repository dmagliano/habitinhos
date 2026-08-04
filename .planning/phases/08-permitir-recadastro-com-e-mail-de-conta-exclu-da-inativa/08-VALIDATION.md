---
phase: 08
slug: permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-21
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | JUnit 5 + Spring Boot + MockMvc + PostgreSQL Testcontainers |
| **Config file** | `backend/pom.xml` |
| **Quick run command** | `cd backend && ./mvnw test -Dtest=AuthIntegrationTest,DemoDataSeederTest` |
| **Full suite command** | `cd backend && ./mvnw test` |
| **Estimated runtime** | ~120-240 seconds depending on Docker/Testcontainers startup |

---

## Sampling Rate

- **After every task commit:** Run the task-specific focused test command.
- **After every plan wave:** Run `cd backend && ./mvnw test`.
- **Before `$gsd-verify-work`:** Full backend suite must be green.
- **Max feedback latency:** 240 seconds after Testcontainers is warm.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | AUTH-11 | T-08-01-01 | Active e-mail uniqueness enforced by PostgreSQL partial index | integration | `cd backend && ./mvnw test -Dtest=AuthIntegrationTest` | ✅ | pending |
| 08-01-02 | 01 | 1 | AUTH-11 | T-08-01-02 | Login/reset resolve only active accounts and deletion deactivates old family | integration | `cd backend && ./mvnw test -Dtest=AuthIntegrationTest` | ✅ | pending |
| 08-01-03 | 01 | 1 | AUTH-11 | T-08-01-03 | Demo seed ignores inactive historical demo account only | integration | `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` | ✅ | pending |
| 08-01-04 | 01 | 1 | DOCS-01 | T-08-01-04 | Docs describe active-only uniqueness without exposing historical account state through API | source assertion | `rg -n "active|ativa|unique|únic|recadastro|email" docs/data-model.md docs/api-contract.md bruno/habitinhos-openapi.yaml` | ✅ | pending |
| 08-01-05 | 01 | 1 | AUTH-11, DOCS-01 | — | Full regression suite passes | integration | `cd backend && ./mvnw test` | ✅ | pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All Phase 8 behaviors have automated backend verification. No mobile/manual-only validation is required for this phase.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 240 seconds after container startup.

**Approval:** approved 2026-06-21
