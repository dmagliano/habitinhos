# Phase 1 Context: Fundação do backend

**Created:** 2026-05-26
**Phase:** 1
**Status:** Ready for planning

## Domain

Phase 1 delivers the backend foundation for Habitinhos: project scaffold, database, migrations, initial authentication, family tenant isolation, responsible user, child profile, wallet, and baseline tests.

## Goal

Create a runnable Spring Boot backend that can authenticate a responsible adult, establish family context, manage child profiles, automatically create child wallets, and enforce family isolation for protected data.

## Decisions

### Phase Boundary

- Do not implement mobile app code in Phase 1.
- Do not implement missions, assigned missions, rewards, redemptions, coin ledger, dashboard, or child-facing flows in Phase 1.
- Mobile-related output in this phase is limited to API contracts/documentation that helps future mobile consumption.

### Backend Foundation

- Use Java 17 and Spring Boot 3.x in `backend/`.
- Use PostgreSQL as the development and test database target.
- Use Flyway migrations from the first schema change.
- Use JPA/Hibernate for persistence unless implementation planning finds a concrete reason to change.
- Expose REST endpoints and document them with OpenAPI/Swagger.
- Use a simple domain-oriented package structure:
  - `auth` for registration, login, security principal, password hashing, token handling, and `/me`.
  - `family` for `FamilyUnit` model/repository/service.
  - `children` for `ChildProfile` API and service.
  - `wallet` for `Wallet` model/repository and automatic wallet creation.
  - `shared` for common errors, validation, timestamps, base response/error shapes, and cross-cutting helpers.
  - `config` or `security` for Spring configuration when it does not naturally belong inside `auth`.

### Authentication and Tenant Context

- Use email/password for MVP authentication, not passwordless.
- Implement JWT Bearer authentication for the responsible adult.
- Keep Phase 1 auth intentionally small: registration, login, password hashing, token issuance, authenticated `/me`; no email verification, password reset, refresh token, OAuth, MFA, or passwordless code flow.
- Store password hashes only; never store passwords, PINs, or codes in plaintext.
- Include `userId`, `familyUnitId`, and `role` in the authenticated principal used by controllers/services.
- Propagate tenant context explicitly from the authenticated principal into service calls, preferably through a small `CurrentUser`/`AuthenticatedUser` object or `@AuthenticationPrincipal`.
- Avoid relying on client-sent `familyUnitId` for protected operations.
- Avoid introducing database row-level security, Hibernate filters, or request-scoped `ThreadLocal` tenant context in Phase 1 unless planning finds a very small, well-contained need. Explicit service/repository filtering is the default.
- Do not accept client-provided `familyUnitId` as authorization truth.
- Keep roles simple for MVP: `RESPONSIBLE`; reserve `ADMIN` for future use.

### Phase 1 Data Model

- Create `FamilyUnit`, `User`, `ChildProfile`, and `Wallet`.
- Every persisted domain row in Phase 1 belongs to a `FamilyUnit` where applicable.
- Creating a child profile must create a wallet in the same transaction.
- Wallet balance starts at zero.
- Children are `ChildProfile` records only in Phase 1, not authenticatable `User` records.
- Children do not require email, password, or login credentials in Phase 1.
- `accessPinHash` remains optional/deferred and should not block backend foundation work.

### Tenant Isolation

- Every family-scoped repository/service read must filter by `familyUnitId`.
- Loads by id must use the tenant boundary, for example `findByIdAndFamilyUnitId(...)`, instead of loading by id and checking later when a direct scoped query is easy.
- Create/update/deactivate child operations must verify the target child belongs to the authenticated family.
- Cross-family access should return a safe not-found or forbidden response; planners may choose one consistently, but it must not leak another family's data.
- Tests must create at least two families and prove user A cannot read or mutate user B's children/wallet data.

### Phase 1 API Surface

- `POST /auth/register` creates a responsible user and a family unit in one request. Request should include responsible name, email, password, and family name.
- `POST /auth/login` authenticates responsible user by email/password and returns a JWT.
- `GET /me` returns authenticated user, role, and family summary.
- `POST /children` creates a child profile and wallet for the authenticated family.
- `GET /children` lists active children for the authenticated family.
- `GET /children/{id}` returns one child from the authenticated family.
- `PUT /children/{id}` updates allowed child fields for the authenticated family.
- `PATCH /children/{id}/deactivate` soft-deactivates a child from the authenticated family.
- Do not add mission, reward, wallet statement, dashboard, or mobile-only endpoints in Phase 1.

### Testing

- Required tests for Phase 1 readiness:
  - Responsible registration creates `User` with role `RESPONSIBLE`.
  - Registration creates or associates exactly one `FamilyUnit` for the responsible user.
  - Login returns a usable JWT for valid credentials and rejects invalid credentials.
  - `/me` returns the authenticated responsible and family context.
  - Creating a child persists `ChildProfile` in the authenticated family.
  - Creating a child creates exactly one wallet with zero balance in the same family.
  - Listing/getting children only returns children from the authenticated family.
  - Cross-family child access/update/deactivation is blocked.
- Prefer Spring Boot integration tests with PostgreSQL-compatible behavior. Testcontainers PostgreSQL is accepted for Phase 1 if dependency/setup overhead stays reasonable.
- Keep tests focused on rules that would break the MVP if wrong.

## Acceptance Criteria

1. Backend starts locally and connects to PostgreSQL from root `docker-compose.yml`.
2. Flyway creates the Phase 1 schema.
3. Responsible adult can register/login and retrieve `/me`.
4. Responsible adult can create and list children.
5. Child creation creates a wallet atomically.
6. Protected endpoints isolate data by authenticated `familyUnitId`.
7. Phase 1 does not introduce mobile, mission, reward, dashboard, or coin-ledger implementation.
8. Required automated tests prove the core Phase 1 rules.

## Canonical Refs

- `.planning/PROJECT.md` — product context and locked project decisions.
- `.planning/REQUIREMENTS.md` — v1 requirements and traceability.
- `.planning/ROADMAP.md` — phase scope and success criteria.
- `.planning/DECISIONS.md` — accepted and pending technical decisions.
- `docs/data-model.md` — initial entity model.
- `docs/api-contract.md` — initial REST API contract.
- `docs/testing-strategy.md` — test priorities.

## Code Context

This is a greenfield repository. No reusable application code exists yet. Expected structure:

- `backend/` for Spring Boot API.
- `mobile/` for Expo app.
- `docs/` for supporting technical documents.
- `.planning/` for GSD artifacts.

## Deferred Ideas

- Child PIN enforcement can be deferred until mobile child access design needs it.
- Admin role can remain reserved, not implemented in MVP.
- Production deployment sophistication belongs after the demo MVP.

## Next Step

Run `$gsd-plan-phase 1` to create executable plans for this phase.
