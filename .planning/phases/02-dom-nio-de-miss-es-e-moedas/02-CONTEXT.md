# Phase 2: Domínio de missões e moedas - Context

**Gathered:** 2026-05-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the backend mission and coin-credit domain: missions, mission assignments, child completion, responsible approval/rejection, wallet credits, and auditable `CoinTransaction` records. It extends the Phase 1 backend foundation and must preserve family isolation, wallet integrity, and OpenAPI visibility.

This phase does not implement rewards, reward redemptions, mobile screens, dashboard UI, recurring mission generation, reports, push notifications, or demo seed polish.

</domain>

<decisions>
## Implementation Decisions

### Mission and Assignment Model
- **D-01:** `Mission` acts as the reusable mission template created by the responsible adult.
- **D-02:** `AssignedMission` must store a partial snapshot of the mission at assignment time. At minimum, store the coin value and enough display data to preserve historical meaning when the original mission is edited later.
- **D-03:** Phase 2 must not generate recurring assignments automatically. Assignment rows are created explicitly by the responsible adult.
- **D-04:** `Mission` may include `recurrenceType` as inactive/future-facing metadata, but planners must treat it as non-automated in Phase 2.
- **D-05:** The backend must block an active duplicate assignment of the same mission to the same child. A child should not have two open assignments for the same mission at the same time.
- **D-06:** `Mission` should include the MVP fields plus inactive recurrence metadata: `title`, `description`, `coinValue`, `requiresApproval`, `recurrenceType`, `active`, `createdByUserId`, and timestamps.
- **D-07:** `AssignedMission` should include `missionId`, `childId`, status fields, optional due date, completion/approval/rejection timestamps, optional rejection reason, and snapshot fields needed for historical audit.

### Carry Forward From Prior Phases
- **D-08:** Backend remains the source of truth for mission rules, approvals, wallet balance, coin credits, and ledger history.
- **D-09:** Protected operations must derive `familyUnitId` from `CurrentUser`, never from client-supplied payloads.
- **D-10:** Family-scoped queries and service guards remain the default tenant-isolation mechanism.
- **D-11:** Cross-family access should continue using safe not-found style responses where practical, consistent with Phase 1 child APIs.
- **D-12:** Coin values are positive integers only.
- **D-13:** Wallet balance changes must happen in transactional services and must write a matching `CoinTransaction`.
- **D-14:** Missions should be soft-deactivated, not physically deleted, to preserve assignment, approval, and transaction history.

### Backend Boilerplate
- **D-15:** Use Lombok for JPA entity boilerplate in touched backend entities, including Phase 1 entities kept as analogs for Phase 2. Generate getters and protected no-args constructors with `@Getter` and `@NoArgsConstructor(access = AccessLevel.PROTECTED)`, but do not add broad class-level `@Setter` to entities whose state changes must go through explicit domain methods.

### the agent's Discretion
- Completion, approval, rejection, child-access endpoint details, wallet locking strategy, and exact `CoinTransaction` field names were not discussed by the user in this session. Researcher and planner may choose pragmatic defaults that preserve the locked requirements, family isolation, transactional wallet integrity, and auditability.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — product context, MVP constraints, backend source-of-truth rule, wallet integrity, and scope boundaries.
- `.planning/REQUIREMENTS.md` — Phase 2 requirements `MISS-01..MISS-09`, `WALT-01`, `WALT-02`, `WALT-04`, `WALT-06`, and `DOCS-01`.
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and plan split.
- `.planning/DECISIONS.md` — accepted ADRs and pending wallet-locking decision `PEND-004`.
- `.planning/phases/01-fundacao-backend/01-CONTEXT.md` — locked Phase 1 backend foundation, auth, tenant context, package structure, and testing decisions.

### Technical Docs
- `docs/architecture.md` — backend responsibilities, tenant boundary, and domain package guidance.
- `docs/data-model.md` — initial `Mission`, `AssignedMission`, `Wallet`, and `CoinTransaction` entity model.
- `docs/api-contract.md` — planned mission, assigned mission, and wallet REST endpoints plus OpenAPI expectations.
- `docs/testing-strategy.md` — required mission credit, approval, rejection, ledger, and transactional tests.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/main/java/br/com/habitinhos/auth/CurrentUser.java` and `CurrentUserProvider` — source of authenticated `userId`, `familyUnitId`, role, and email for Phase 2 service calls.
- `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java` — existing family-scoped child lookup pattern to reuse before assigning or completing missions.
- `backend/src/main/java/br/com/habitinhos/wallet/Wallet.java`, `WalletRepository.java`, and `WalletService.java` — existing wallet table/entity/service that Phase 2 must extend with credit operations and ledger writes.
- `backend/src/main/java/br/com/habitinhos/shared/error/*` — structured PT-BR error responses and stable English error codes.
- `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` — PostgreSQL Testcontainers integration test base.

### Established Patterns
- Domain packages group controller, DTO, service, repository, and entity classes close to the feature.
- Services enforce role checks and family ownership; repositories expose family-scoped query methods such as `findByIdAndFamilyUnitId`.
- Controllers use `CurrentUserProvider.getCurrentUser()` and do not accept `familyUnitId` from clients.
- Flyway migrations define tables first, with explicit tenant columns, foreign keys, checks, and indexes.
- Integration tests use MockMvc with real PostgreSQL behavior and create multiple families to prove isolation.

### Integration Points
- Add a `missions` package for mission and assignment APIs.
- Extend the `wallet` package with transactional credit behavior and `CoinTransaction` persistence.
- Update Flyway with Phase 2 tables and indexes.
- Update OpenAPI automatically through controller annotations/config so Swagger exposes Phase 2 endpoints.
- Update test database cleanup to include Phase 2 tables in dependency-safe order.

</code_context>

<specifics>
## Specific Ideas

- Keep recurrence visible as model metadata only; do not implement scheduler, recurrence expansion, or automatic assignment generation in Phase 2.
- Preserve assignment history through snapshots so edited mission templates do not rewrite the meaning or coin value of past/open assigned missions.

</specifics>

<deferred>
## Deferred Ideas

- Automatic recurring mission generation belongs to a future phase.
- Rewards, redemptions, debits, wallet statement history, mobile screens, and dashboard behavior remain in later roadmap phases.

</deferred>

---

*Phase: 2-Domínio de missões e moedas*
*Context gathered: 2026-05-29*
