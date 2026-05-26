# Decisions: Habitinhos

**Created:** 2026-05-26

| ID | Decision | Rationale | Status |
|----|----------|-----------|--------|
| ADR-001 | Use a monorepo with `backend/`, `mobile/`, `docs/`, and `.planning/` | Keeps backend/mobile/docs coordinated for a TCC MVP and avoids repo management overhead | Accepted |
| ADR-002 | Use Java 17 + Spring Boot 3.x for the backend | Matches requested stack and gives fast REST/JPA/Security/OpenAPI delivery | Accepted |
| ADR-003 | Use PostgreSQL with Flyway migrations | Relational integrity matters for family isolation, wallet balance, assignments, and transaction history | Accepted |
| ADR-004 | Use JPA/Hibernate unless a later plan proves a better option | Simpler and idiomatic for Spring Boot CRUD-heavy MVP | Accepted |
| ADR-005 | Use React Native + Expo + TypeScript for mobile | Fastest path to a demonstrable mobile app with typed code and simple local development | Accepted |
| ADR-006 | Backend derives `familyUnitId` from auth context | Prevents clients from crossing tenant boundaries by sending arbitrary family IDs | Accepted |
| ADR-007 | Wallet operations use transactional services and a `CoinTransaction` ledger | Protects balance integrity and preserves audit history | Accepted |
| ADR-008 | Missions and rewards are soft-deactivated, not deleted | Preserves historical mission, reward, approval, transaction, and redemption records | Accepted |
| ADR-009 | MVP reward redemption records directly as `REDEEMED` | Keeps the demo simple while leaving room for fulfillment workflow later | Accepted |
| ADR-010 | Interface text is PT-BR and code names are English | Keeps user experience natural for the TCC audience and code maintainable | Accepted |
| ADR-011 | Phase 1 auth uses email/password with JWT Bearer tokens | Simpler than passwordless for a mobile REST MVP and enough for TCC demo authentication | Accepted |
| ADR-012 | Children are `ChildProfile` records, not `User` records, in Phase 1 | Children do not need email/password auth for backend foundation and this keeps auth scope small | Accepted |
| ADR-013 | Propagate tenant context from authenticated principal into services | Keeps `familyUnitId` server-derived and avoids trusting client payloads | Accepted |
| ADR-014 | Enforce tenant isolation with explicit family-scoped queries and service guards | Simpler than DB RLS/Hibernate filters while still testable and clear for MVP | Accepted |
| ADR-015 | Use domain-oriented backend packages: `auth`, `family`, `children`, `wallet`, `shared`, plus config/security | Keeps Spring code modular without overengineering early architecture | Accepted |
| ADR-016 | Phase 1 API is limited to auth, `/me`, and children CRUD/deactivation | Prevents scope bleed into missions, rewards, dashboard, wallet statement, or mobile implementation | Accepted |
| ADR-017 | Phase 1 readiness requires integration tests for registration, family creation, child creation, wallet creation, and cross-family blocking | These are the backend foundation rules most likely to break the MVP if wrong | Accepted |

## Pending Decisions

| ID | Question | Default Recommendation | Needed By |
|----|----------|------------------------|-----------|
| PEND-004 | Add optimistic locking or row-level locking for wallet updates? | Use transactional service with pessimistic or optimistic locking around wallet debit/credit | Phase 2/3 plan |
| PEND-005 | Seed strategy for demo data | Flyway/dev seed or a Spring profile command runner limited to local/demo profile | Phase 7 plan |
