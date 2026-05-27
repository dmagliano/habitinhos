---
phase: "01-fundacao-backend"
plan: "01"
status: complete
completed: 2026-05-27
---

# Summary: 01-01 Spring Boot project, PostgreSQL, Flyway, health/config baseline

## What Changed

- Created Maven Spring Boot backend under `backend/` with Java 17 target and Spring Boot `3.5.14`.
- Added backend dependencies for Web, Validation, JPA, Security, OAuth2 Resource Server JWT, Actuator, PostgreSQL, Flyway, springdoc OpenAPI, Spring tests, Spring Security tests, and Testcontainers.
- Added a lightweight `backend/mvnw` that downloads Maven `3.9.11` into `backend/.mvn/` when Maven is not installed locally.
- Configured local PostgreSQL/Flyway/JPA validation defaults in `backend/src/main/resources/application.yml`.
- Added Testcontainers PostgreSQL integration-test base and a `contextLoads` smoke test.
- Added `.gitignore` entries for locally downloaded Maven artifacts.

## Verification

- `cd backend && ./mvnw test` — passed.
- `rg -n "spring-boot-starter-oauth2-resource-server|flyway-database-postgresql|springdoc-openapi" backend/pom.xml` — passed.
- `rg -n "ddl-auto: validate|HABITINHOS_JWT_SECRET" backend/src/main/resources/application.yml` — passed.

## Deviations from Plan

**[Rule 2 - Environment support] Maven wrapper bootstrap uses Maven Central distribution URL** — Found during: Task 1 | Issue: the first wrapper URL using `archive.apache.org` could not be reached from this environment | Fix: changed the Maven download URL to Maven Central, which resolved successfully | Files modified: `backend/mvnw`, `backend/.mvn/wrapper/maven-wrapper.properties` | Verification: `cd backend && ./mvnw test` passed.

**[Rule 2 - Environment support] Colima socket detection added to `mvnw`** — Found during: Task 3 | Issue: Docker CLI used the Colima context, but Testcontainers did not discover the Colima socket automatically | Fix: `backend/mvnw` exports `DOCKER_HOST` and `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` when the Colima socket exists and no explicit `DOCKER_HOST` is set | Files modified: `backend/mvnw` | Verification: `cd backend && ./mvnw test` passed with Testcontainers PostgreSQL.

**Total deviations:** 2 auto-fixed. **Impact:** local setup is more reliable in the current Codex/Colima environment without changing application behavior.

## Self-Check: PASSED

