---
phase: 08-permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
status: clean
reviewed_at: 2026-06-21T17:37:00-03:00
depth: standard
files_reviewed: 11
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
---

# Phase 08 Code Review

## Result

Clean. No open findings were identified in the Phase 08 implementation.

## Scope

- `backend/src/main/resources/db/migration/V11__active_user_email_uniqueness.sql`
- `backend/src/main/java/br/com/habitinhos/auth/AppUser.java`
- `backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java`
- `backend/src/main/java/br/com/habitinhos/auth/AuthService.java`
- `backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java`
- `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java`
- `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java`
- `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java`
- `docs/data-model.md`
- `docs/api-contract.md`
- `bruno/habitinhos-openapi.yaml`

## Checks

- Migration fails before schema change when duplicate active normalized e-mails exist, removes the old global constraint, and creates a partial unique index on `lower(email)` for active rows only.
- Auth registration, login, password reset, and account deletion use active-account lookup paths where required.
- Account deletion deactivates both the old responsible user and old family unit while preserving rows and invalidating reset tokens.
- Demo seed idempotency now skips only active demo accounts.
- Tests cover active-only database uniqueness, recadastro through real deletion endpoints, inactive-only login/reset behavior, and demo historical inactive seed behavior.
- Docs/OpenAPI describe active-account uniqueness without changing public request/response contracts.

## Findings

None.

## Verification Evidence

- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest` - passed, 13 tests.
- `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` - passed, 2 tests.
- `cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest` - passed, 1 test.
- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest,DemoDataSeederTest,OpenApiIntegrationTest` - passed, 16 tests.
- `cd backend && ./mvnw test` - passed, 70 tests.
- `git diff --check HEAD~7..HEAD` - passed.

## Open Findings

None.
