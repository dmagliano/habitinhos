---
phase: 01-fundacao-backend
created: 2026-05-26
status: complete
research_mode: official-docs
---

# Phase 1 Research: Fundação do Backend

## Research Complete

Phase 1 should build a small, explicit Spring Boot backend foundation. The implementation should optimize for demo reliability, clear tenant boundaries, and tests that catch family-isolation regressions before mobile work begins.

## Sources Checked

- Spring Boot 3.5.14 system requirements: https://docs.spring.io/spring-boot/3.5/system-requirements.html
- Spring Boot 3.5 SQL/database initialization and Flyway behavior: https://docs.spring.io/spring-boot/3.5/how-to/data-initialization.html
- Spring Security JWT resource server: https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html
- Spring Boot 3.5 Testcontainers support: https://docs.spring.io/spring-boot/3.5/reference/testing/testcontainers.html
- Testcontainers PostgreSQL module: https://java.testcontainers.org/modules/databases/postgres/
- Flyway PostgreSQL support: https://documentation.red-gate.com/flyway/reference/database-driver-reference/postgresql-database
- springdoc-openapi: https://springdoc.org/

## Recommended Stack Choices

### Spring Boot Version

Use Spring Boot `3.5.14` for planning and implementation unless a newer Spring Boot `3.5.x` patch is available when execution starts.

Rationale:
- The user requested Spring Boot 3.x.
- As of 2026-05-26, Spring Boot 4.0.6 is the latest stable line, but Spring Boot 3.5.14 is the current stable 3.x line.
- Spring Boot 3.5.14 requires Java 17, matching the requested backend stack.

### Build Tool

Use Maven with the Maven wrapper under `backend/`.

Rationale:
- Maven is simple and widely recognizable in Spring Boot projects.
- It avoids extra Gradle DSL choices during a TCC MVP.
- Spring Boot dependency management keeps most versions centralized.

### Backend Dependencies

Use these starters/modules:

- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-oauth2-resource-server`
- `spring-boot-starter-actuator`
- `spring-boot-testcontainers`
- `org.postgresql:postgresql`
- `org.flywaydb:flyway-core`
- `org.flywaydb:flyway-database-postgresql`
- `org.springdoc:springdoc-openapi-starter-webmvc-ui` on the current `2.8.x` line for Spring Boot 3.x
- `spring-boot-starter-test`
- `spring-security-test`
- `org.testcontainers:junit-jupiter`
- `org.testcontainers:postgresql`

Avoid adding external JWT libraries such as JJWT unless Spring Security proves insufficient. Spring Security already includes JWT bearer-token support through the OAuth2 resource server and JOSE modules.

## Architecture Guidance

### Package Structure

Use package root `br.com.habitinhos` with domain-oriented packages:

- `auth`: registration, login, token service, current user extraction, `/me`.
- `family`: `FamilyUnit` entity, repository, service.
- `children`: `ChildProfile` entity, controller, service, DTOs.
- `wallet`: `Wallet` entity, repository, wallet creation service.
- `shared`: errors, timestamps, common response types, validation helpers.
- `config`: security, OpenAPI, application configuration.

This is modular enough for Phase 1 and avoids premature clean-architecture scaffolding.

### Entity Naming

Use Java entity `AppUser` mapped to table `app_users`.

Rationale:
- `User` is easy to confuse with `java.lang` and security classes.
- `user` can be awkward in SQL.
- API/domain docs can still call the concept "User/Responsible".

### Identifiers

Use UUID primary keys for all Phase 1 entities.

Rationale:
- UUIDs are safe to expose in REST paths.
- They avoid leaking record counts.
- They make cross-family test fixtures clearer.

Let the application generate UUIDs. Do not depend on PostgreSQL extensions for UUID generation in Phase 1.

### Persistence and Migrations

Use Flyway as the only schema owner. Set Hibernate `ddl-auto` to `validate`, not `update`.

Initial migration:

- `family_units`
- `app_users`
- `child_profiles`
- `wallets`

Important constraints:

- `app_users.email` unique, stored normalized in lowercase.
- `app_users.family_unit_id` foreign key to `family_units`.
- `child_profiles.family_unit_id` foreign key to `family_units`.
- `wallets.family_unit_id` foreign key to `family_units`.
- `wallets.child_id` foreign key to `child_profiles`.
- `wallets.child_id` unique to enforce one wallet per child.
- `wallets.balance >= 0`.
- `child_profiles.age` nullable but non-negative when present.

Add indexes for `family_unit_id` and common lookups:

- `idx_app_users_family_unit_id`
- `idx_child_profiles_family_unit_id`
- `idx_wallets_family_unit_id`
- `idx_wallets_child_id`

### Authentication

Use email/password with JWT Bearer tokens.

Implementation shape:

- `POST /auth/register` creates `FamilyUnit` and responsible `AppUser` in one transaction.
- Passwords are hashed with `BCryptPasswordEncoder`.
- `POST /auth/login` validates credentials and returns a short JSON payload with token and basic user/family context.
- `GET /me` reads authenticated context and returns user/family summary.
- JWT contains at least `sub`, `user_id`, `family_unit_id`, `role`, `iat`, and `exp`.
- Use HMAC secret from configuration, for example `habitinhos.security.jwt.secret`.
- Development may have a clearly labeled local default secret; production/demo secrets should come from env.

Use Spring Security's resource server support to validate `Authorization: Bearer <token>` on protected endpoints.

### Tenant Context

Use an explicit `CurrentUser` or `AuthenticatedUser` object with:

- `userId`
- `familyUnitId`
- `role`
- `email`

Controllers should derive it from the authenticated JWT/security context, then pass it to services. Services should accept `CurrentUser` and never accept `familyUnitId` from client request bodies.

Avoid for Phase 1:

- database row-level security;
- Hibernate filters;
- request-scoped `ThreadLocal` tenant state.

These are more complex than the MVP needs. Explicit repository methods are easier to read and test.

### Tenant Isolation

Use repository methods that include `familyUnitId` directly:

- `findByIdAndFamilyUnitId(...)`
- `findByIdAndFamilyUnitIdAndActiveTrue(...)`
- `findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(...)`

For cross-family child IDs, return a consistent safe error. Prefer `404 Not Found` for child read/update/deactivate because it avoids confirming whether another family's record exists.

### Children and Wallets

Child creation must be transactional:

1. Validate responsible user role.
2. Create `ChildProfile` in `currentUser.familyUnitId`.
3. Create `Wallet` with same family, same child, and `balance = 0`.
4. Commit both together.

If optional `accessPin` is accepted in create/update requests, hash it before storing `accessPinHash` and never return it in responses. It is acceptable for Phase 1 to store the nullable column and defer child PIN login behavior.

## Endpoint Shape for Phase 1

Implement only:

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `POST /children`
- `GET /children`
- `GET /children/{id}`
- `PUT /children/{id}`
- `PATCH /children/{id}/deactivate`

Do not implement missions, rewards, dashboard, wallet statements, coin transactions, or mobile code in this phase.

## Error Handling

Create a small shared error contract:

```json
{
  "code": "CHILD_NOT_FOUND",
  "message": "Criança não encontrada.",
  "details": {}
}
```

Use stable English error codes and PT-BR messages when messages may be displayed by the future mobile app.

Suggested Phase 1 codes:

- `VALIDATION_ERROR`
- `INVALID_CREDENTIALS`
- `EMAIL_ALREADY_REGISTERED`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `CHILD_NOT_FOUND`

## Security Threat Model

| ID | Threat | Mitigation |
|----|--------|------------|
| T-01 | Password stored or logged in plaintext | Use BCrypt, never return password hash, avoid logging auth payloads |
| T-02 | Client spoofs `familyUnitId` | Do not accept `familyUnitId` in protected request bodies; derive from JWT |
| T-03 | Cross-family read or mutation | Family-scoped repository methods and integration tests with two families |
| T-04 | Unauthenticated access to protected resources | Spring Security protects all non-auth endpoints except explicit public docs/health |
| T-05 | JWT forged with weak secret | Configurable HMAC secret; tests use deterministic secret, local default is clearly dev-only |
| T-06 | Child PIN stored in plaintext | Hash optional PIN if accepted; never expose `accessPinHash` |

High-severity security failures block phase completion.

## Validation Architecture

Use backend integration tests as the main safety net. The phase is small enough that MockMvc plus PostgreSQL Testcontainers should cover the critical behavior without elaborate test layers.

### Test Infrastructure

- JUnit 5 through `spring-boot-starter-test`.
- MockMvc for REST integration tests.
- Spring Security test helpers for authenticated requests where useful.
- PostgreSQL Testcontainers with Spring Boot `@ServiceConnection` or equivalent dynamic datasource configuration.
- Flyway migrations should run in tests; tests should not rely on Hibernate `create-drop`.

### Required Automated Tests

| Requirement | Test Focus |
|-------------|------------|
| AUTH-01 | Registration creates active responsible user with hashed password |
| AUTH-02 | Login returns usable JWT for valid credentials and rejects invalid credentials |
| AUTH-03 | Registration creates one active family and links user to it |
| AUTH-04 | `/me` returns authenticated user and family context |
| AUTH-05 | Protected operations derive family from JWT, not request body |
| AUTH-06 | User from family B cannot read/update/deactivate family A child |
| CHLD-01 | Responsible can create child without child email |
| CHLD-02 | Child creation creates exactly one zero-balance wallet |
| CHLD-03 | Responsible can list/view/update/deactivate own children |
| CHLD-04 | Avatar key and optional PIN hash are modeled without exposing sensitive values |

### Commands

After Plan 01-01 creates the Maven wrapper:

- Quick: `cd backend && ./mvnw test`
- Full: `cd backend && ./mvnw test`

The phase is small, so quick and full validation can be the same command until later phases introduce heavier test groups.

### Acceptance Gate

Phase 1 is ready for execution completion only when:

- all planned backend tests pass;
- OpenAPI/Swagger is reachable from the running backend;
- no Phase 2/3/4 implementation files are introduced;
- all protected Phase 1 endpoints use authenticated family context.

