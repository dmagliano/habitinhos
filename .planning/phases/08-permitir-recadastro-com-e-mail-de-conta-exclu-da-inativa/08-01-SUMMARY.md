---
phase: 08-permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
plan: 01
subsystem: auth
tags: [spring-boot, postgres, flyway, auth, recadastro, soft-delete]
requires:
  - phase: 06.3
    provides: Password reset, responsible PIN reset, and account deletion flows.
  - phase: 07
    provides: Demo data seed and technical documentation baseline.
provides:
  - Active-only responsible account e-mail uniqueness.
  - Recadastro after account deletion with new user and family ids.
  - Active-only login and password reset lookup behavior.
  - Demo seed idempotency aligned with inactive historical accounts.
  - Documentation for active-account e-mail uniqueness.
affects: [auth, database, demo-seed, docs, api-contract]
tech-stack:
  added: []
  patterns:
    - Active-explicit repository methods for account lookup.
    - PostgreSQL partial unique index for soft-deleted account history.
key-files:
  created:
    - backend/src/main/resources/db/migration/V11__active_user_email_uniqueness.sql
  modified:
    - backend/src/main/java/br/com/habitinhos/auth/AppUser.java
    - backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java
    - backend/src/main/java/br/com/habitinhos/auth/AuthService.java
    - backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java
    - backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java
    - backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java
    - backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java
    - docs/data-model.md
    - docs/api-contract.md
    - bruno/habitinhos-openapi.yaml
key-decisions:
  - "E-mail uniqueness applies to active users only, enforced by PostgreSQL with a partial unique index on lower(email)."
  - "Account deletion keeps historical rows, deactivates the old user and family, and allows a future registration with new ids."
  - "Login and password reset resolve only active users; inactive-only e-mails remain private through existing invalid/accepted responses."
patterns-established:
  - "Use `findByEmailIgnoreCaseAndActiveTrue` and `existsByEmailIgnoreCaseAndActiveTrue` for production auth lifecycle checks."
  - "When soft deletion preserves historical rows, database uniqueness should match the active lifecycle boundary."
requirements-completed: [AUTH-11, DOCS-01]
duration: 40min
completed: 2026-06-21
---

# Phase 08 Plan 01: Recadastro Summary

**Active-only e-mail uniqueness with normal recadastro after account deletion and fresh user/family ids**

## Performance

- **Duration:** ~40 min
- **Started:** 2026-06-21T16:57:51-03:00
- **Completed:** 2026-06-21T17:37:00-03:00
- **Tasks:** 5
- **Files modified:** 11

## Accomplishments

- Replaced global `app_users.email` uniqueness with a PostgreSQL partial unique index for active normalized e-mails.
- Updated registration, login, password reset, account deletion, and demo seed behavior to use active-account semantics.
- Added integration tests for active duplicate rejection, inactive historical recadastro, new user/family ids, inactive-only login/reset privacy, and demo seed behavior.
- Updated technical docs and Bruno OpenAPI notes to describe active-account uniqueness without changing public response contracts.
- Ran focused and full backend verification successfully.

## Task Commits

1. **Task 1: Active-only database/repository contracts** - `8334934` (test) and `f1aca63` (feat)
2. **Task 2: Auth lifecycle behavior** - `cf86811` (test) and `fd071d8` (feat)
3. **Task 3: Demo seed idempotency** - `e575371` (test) and `37fce6b` (feat)
4. **Task 4: Docs and OpenAPI notes** - `e484a50` (docs)
5. **Task 5: Focused and full backend verification** - verification-only task

## Files Created/Modified

- `backend/src/main/resources/db/migration/V11__active_user_email_uniqueness.sql` - Drops global e-mail uniqueness and creates active-only partial unique index.
- `backend/src/main/java/br/com/habitinhos/auth/AppUser.java` - Removes JPA global unique flag from e-mail.
- `backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java` - Adds active-explicit e-mail lookup/existence methods.
- `backend/src/main/java/br/com/habitinhos/auth/AuthService.java` - Uses active-only auth lookup paths and deactivates the family on account deletion.
- `backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java` - Adds soft deactivation method.
- `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java` - Skips seeding only when an active demo account exists.
- `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` - Covers active-only DB uniqueness and recadastro lifecycle.
- `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java` - Covers inactive historical demo account behavior.
- `docs/data-model.md` - Documents active-account e-mail uniqueness and family deactivation on account deletion.
- `docs/api-contract.md` - Documents register/login/reset behavior for active vs inactive historical e-mails.
- `bruno/habitinhos-openapi.yaml` - Adds active-account uniqueness description to `RegisterRequest.email`.

## Decisions Made

- No JWT blacklist or account restoration was added; old JWTs are rejected through existing active user/family checks.
- Recadastro uses the normal registration response and creates a new family dataset.
- Inactive historical e-mails are not rewritten by migration or service code.

## Deviations from Plan

None - plan executed as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope creep.

## Issues Encountered

- The planned red tests failed for the intended reasons before implementation:
  - old global DB uniqueness blocked active-only duplicate history;
  - account deletion did not deactivate the old family;
  - demo seed skipped when only an inactive historical demo account existed.
- Each failure was resolved by the corresponding implementation commit and verified with focused tests.

## Verification

- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest#databaseEnforcesEmailUniquenessOnlyForActiveUsers` - PASS.
- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest#deleteAccountDeactivatesUserAndFamilyThenAllowsFreshRegistration` - PASS.
- `cd backend && ./mvnw test -Dtest=DemoDataSeederTest#seedsFreshDemoAccountWhenOnlyHistoricalDemoAccountIsInactive` - PASS.
- `cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest` - PASS, 1 test.
- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest` - PASS, 13 tests.
- `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` - PASS, 2 tests.
- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest,DemoDataSeederTest,OpenApiIntegrationTest` - PASS, 16 tests.
- `cd backend && ./mvnw test` - PASS, 70 tests.
- `rg -n "active|ativa|inativa|unique|únic|recadastro|e-mail|email" docs/data-model.md docs/api-contract.md bruno/habitinhos-openapi.yaml` - PASS.
- `git diff --name-only HEAD~7..HEAD` - PASS: no files under `mobile/`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 8 is ready for final phase verification/sign-off and merge management from `feature/allow-reregister-inactive-account`.

---
*Phase: 08-permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa*
*Completed: 2026-06-21*
