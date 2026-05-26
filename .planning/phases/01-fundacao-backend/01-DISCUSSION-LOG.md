# Discussion Log: Phase 1 — Fundação do backend

**Created:** 2026-05-26

## Source

The user provided a complete project briefing covering product vision, monorepo structure, backend/mobile stack, MVP scope, entities, business rules, functional requirements, non-functional requirements, suggested endpoints, mobile screens, out-of-scope items, implementation phases, and general acceptance criteria.

Because the briefing included explicit defaults and the instruction to prioritize the simplest option that preserves family isolation, balance integrity, coin history, responsible/child flow clarity, and TCC demo readiness, no additional clarification questions were required before creating the initial context.

## Decisions Captured

### 2026-05-26 Directed Phase 1 Discussion

The user narrowed Phase 1 to backend foundation only and explicitly excluded mobile implementation, missions, rewards, and later flows. The discussion closed seven implementation decisions:

1. Auth uses email/password for MVP, not passwordless.
2. Responsible auth uses a simple JWT Bearer flow.
3. Child remains `ChildProfile` only, not `User`, in Phase 1.
4. `familyUnitId` is propagated from the authenticated principal into services.
5. Tenant isolation is enforced with explicit family-scoped service/repository queries and ownership checks.
6. Backend package structure is domain-oriented: `auth`, `family`, `children`, `wallet`, `shared`, and config/security support.
7. Phase 1 endpoints and required tests are limited to backend foundation, auth, `/me`, children, automatic wallet creation, and cross-family blocking.

### Backend Foundation

- Java 17 + Spring Boot 3.x backend in `backend/`.
- PostgreSQL with Flyway migrations.
- JPA/Hibernate as default persistence option.
- REST API with OpenAPI/Swagger documentation.

### Auth and Family Isolation

- Responsible adult is the initial authenticatable role.
- MVP authentication is email/password with JWT Bearer tokens.
- `FamilyUnit` is the tenant boundary.
- Backend derives `familyUnitId` from authenticated user context and passes it explicitly into service/repository operations.
- Passwords/PINs/codes must never be stored in plaintext.
- Tenant isolation is done with explicit `familyUnitId` filters and cross-family tests; no DB RLS/Hibernate filters in Phase 1 by default.

### Phase 1 Scope

- Create `FamilyUnit`, `User`, `ChildProfile`, and `Wallet`.
- Registration/login and `/me`.
- Child creation/listing.
- Automatic wallet creation when child is created.
- Baseline tests for auth, wallet creation, and tenant isolation.
- No mobile, mission, reward, dashboard, or coin-ledger implementation.

## Deferred or Pending

- Child PIN enforcement can wait until mobile child access requires it.
- Admin role is reserved for future use.
- Password reset, email verification, refresh tokens, OAuth, MFA, and passwordless are out of Phase 1.

## Next Step

Run `$gsd-plan-phase 1`.
