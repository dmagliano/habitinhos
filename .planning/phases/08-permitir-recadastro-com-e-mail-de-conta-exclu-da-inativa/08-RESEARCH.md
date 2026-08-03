---
phase: 08
slug: permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
status: complete
created: 2026-06-21
source: inline research from codebase and Phase 8 context
---

# Phase 8 Research: Active-Only Account E-mail Uniqueness

## Research Goal

Answer what the planner needs to know to implement Phase 8 without breaking authentication, account deletion, demo seed behavior, migrations, or technical documentation.

## Current Implementation Findings

### Auth service and repository

- `AuthService.register(...)` normalizes e-mail with `trim().toLowerCase(Locale.ROOT)`, blocks duplicates with `appUserRepository.existsByEmailIgnoreCase(email)`, creates a new `FamilyUnit`, creates a new `AppUser`, sends welcome e-mail, and returns the auth response.
- `AuthService.login(...)` and `AuthService.requestPasswordReset(...)` use `findByEmailIgnoreCase(email).filter(AppUser::isActive)`. This is unsafe once historical duplicate e-mails exist because a general e-mail lookup returning `Optional<AppUser>` is no longer deterministic.
- `AppUserRepository` currently exposes only:
  - `Optional<AppUser> findByEmailIgnoreCase(String email)`
  - `boolean existsByEmailIgnoreCase(String email)`
- Auth flows should move to active-explicit repository methods, e.g. `findByEmailIgnoreCaseAndActiveTrue(...)` and `existsByEmailIgnoreCaseAndActiveTrue(...)`.

### Account deletion and family state

- `AuthService.confirmAccountDeletion(...)` currently calls `user.deactivate()`, marks the account-deletion token used, and invalidates active reset tokens.
- `FamilyUnit` has an `active` field but no `deactivate()` method.
- Phase 8 context locks the decision that deletion should also deactivate the old `FamilyUnit`.
- Protected endpoints already reject inactive users by resolving the JWT `userId` and filtering `AppUser::isActive`, so no JWT blacklist is needed.

### Database and Flyway

- `V1__create_foundation_schema.sql` defines `app_users.email VARCHAR(320) NOT NULL UNIQUE`, which creates a global uniqueness constraint over all historical rows.
- Existing migrations already use partial unique indexes:
  - `V2__create_mission_coin_schema.sql` creates `uk_assigned_missions_open_mission_child ... WHERE status IN (...)`.
  - `V8__mission_completion_window_and_schedule.sql` drops an old unique index and creates revised unique indexes.
- A Phase 8 migration should:
  1. fail if more than one active row exists for the same `lower(email)`;
  2. drop the old global constraint, expected default name `app_users_email_key`;
  3. create a partial unique index on `lower(email)` where `active = true`;
  4. avoid mutating historical e-mail values.

### JPA entity mapping

- `AppUser.email` currently has `@Column(nullable = false, unique = true, length = 320)`.
- This must become `@Column(nullable = false, length = 320)` because partial uniqueness is database-specific and cannot be represented as a global JPA column uniqueness flag.

### Integration tests

- `AuthIntegrationTest` already covers:
  - registration creates family/user and normalizes e-mail;
  - duplicate registration rejects case-insensitive duplicate;
  - login success and invalid credentials;
  - enumeration-safe password reset;
  - account deletion request/confirm using the real endpoint and e-mail code.
- `AbstractIntegrationTest` uses PostgreSQL Testcontainers, so Flyway and PostgreSQL partial-index behavior are exercised by integration tests.
- Existing tests often call `appUserRepository.findByEmailIgnoreCase(...)`. After active-only uniqueness, those calls remain safe only in tests where no historical duplicate rows exist. New Phase 8 tests should use active-explicit lookup methods or `findAll()` filtering when they intentionally assert inactive + active historical duplicates.

### Demo seed

- `DemoDataSeeder` currently skips if `appUserRepository.existsByEmailIgnoreCase(DEMO_EMAIL)`.
- With active-only uniqueness, this should become active-only so an inactive historical demo account does not block a new active demo seed.
- `DemoDataSeederTest` currently asserts idempotency and expects one demo user after two runs. It should gain coverage for inactive historical demo users if the implementation makes this behavior observable.

### Docs and API artifacts

- `docs/data-model.md` currently says user e-mail is a unique login identifier, likely globally unique.
- `docs/api-contract.md` lists `/auth/register`, login, password reset, PIN reset, and account deletion endpoints.
- `bruno/habitinhos-openapi.yaml` has `RegisterRequest.email` schema with no note about active-only uniqueness. No response-shape change is required, but a schema description or docs note can explain active-account uniqueness.

## Recommended Planning Approach

Use one backend-focused plan with these tasks:

1. Update database/entity/repository foundations:
   - new Flyway migration after V10;
   - `AppUser.email` mapping;
   - active-explicit repository methods;
   - `FamilyUnit.deactivate()`.
2. Update `AuthService` registration/login/reset/deletion behavior:
   - registration blocks only active e-mail;
   - login/reset resolve only active account;
   - deletion deactivates both user and family.
3. Expand integration tests around real deletion + recadastro:
   - active duplicate still conflicts;
   - deleted account permits normal registration with new IDs;
   - inactive-only login/reset remain private;
   - old token/session fails because user is inactive.
4. Update `DemoDataSeeder` and its tests.
5. Update docs/OpenAPI/Bruno where needed.

## Implementation Pitfalls

- Do not keep `findByEmailIgnoreCase(...).filter(AppUser::isActive)` in auth flows after duplicate historical e-mails are possible.
- Do not rewrite inactive users' e-mail values during deletion. That would erase useful historical data and violate Phase 8 decisions.
- Do not return a special recadastro response; the API contract remains normal successful registration.
- Do not add JWT blacklist/session tables; the current active-user guard is sufficient.
- Do not accidentally make password reset reveal deleted-account state.
- Do not forget `DemoDataSeeder`; it is a hidden e-mail-existence path.

## Validation Architecture

Validation should run against PostgreSQL/Testcontainers, not H2 or mocked repositories, because the key behavior is a PostgreSQL partial unique index.

Minimum automated checks:

- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest`
- `cd backend && ./mvnw test -Dtest=DemoDataSeederTest`
- `cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest`
- `cd backend && ./mvnw test`

Required behavioral assertions:

- Duplicate active registration returns `EMAIL_ALREADY_REGISTERED`.
- Account deletion through `/auth/account-deletion/request` + `/auth/account-deletion/confirm` makes the old user inactive and the old family inactive.
- New registration with the same normalized e-mail after deletion succeeds and creates new `app_users.id` and `family_units.id`.
- Login with the old password after deletion returns `INVALID_CREDENTIALS`.
- Password reset for inactive-only e-mail returns accepted and sends no e-mail.
- Password reset for active account sends the reset e-mail to the active account.
- A second active row with the same normalized e-mail cannot be inserted because PostgreSQL enforces the partial unique index.

## Research Complete

Phase 8 can be planned as a single executable backend/data/docs plan. No frontend or mobile UI work is required.
