# 01-03 Summary — Authentication and Tenant Context

## Completed

- Added Spring Security configuration with stateless JWT bearer authentication.
- Implemented `POST /auth/register`, `POST /auth/login`, and `GET /me`.
- Added BCrypt password hashing through `PasswordEncoder`.
- Added JWT issuing with `user_id`, `family_unit_id`, `role`, and `email` claims.
- Added `CurrentUser` and `CurrentUserProvider` so protected controllers can derive tenant context from the authenticated JWT.
- Added auth integration tests for registration, duplicate email, login, invalid login, `/me`, and unauthenticated `/me`.

## Verification

- `cd backend && ./mvnw test` passed with 7 tests, 0 failures, 0 errors.
- `rg -n "family_unit_id|user_id|role" backend/src/main/java/br/com/habitinhos/auth` passed.
- `rg -n "BCrypt|PasswordEncoder" backend/src/main/java/br/com/habitinhos/auth backend/src/main/java/br/com/habitinhos/config` passed.
- Verified no response DTO exposes `passwordHash` or `accessPinHash`.

## Deviations

- Adjusted the shared Testcontainers base to start PostgreSQL as a singleton for the test JVM. The previous JUnit-managed container lifecycle stopped the first container between test classes while Spring reused the cached datasource.

## Self-Check

PASSED
