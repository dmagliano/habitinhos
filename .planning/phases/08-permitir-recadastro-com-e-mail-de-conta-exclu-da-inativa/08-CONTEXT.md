# Phase 8: Permitir recadastro com e-mail de conta excluída/inativa - Context

**Gathered:** 2026-06-21T16:33:05-03:00
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase changes the account lifecycle rule so an e-mail is unique only among active accounts. A responsible adult may create a new independent account with an e-mail that exists only on inactive/deleted accounts. The old account and its family data remain historical, while the new registration creates a new user, a new family, new credentials, and a new session.

This is a backend/API/data-model phase. It must not redesign the mobile registration UI, add account restoration, add JWT blacklist/session state, or physically delete historical family data.

</domain>

<decisions>
## Implementation Decisions

### Histórico e Recadastro
- **D-01:** Account deletion/deactivation must also deactivate the old `FamilyUnit`. Historical records remain preserved, but the old family is no longer active after the responsible account is deleted.
- **D-02:** Do not add JWT blacklist or server-side session state. Old tokens fail because the old `AppUser` is inactive and protected endpoints already resolve active users.
- **D-03:** A new registration with an e-mail that only exists on inactive accounts must not reuse old data. It creates a new `app_users.id`, a new `family_units.id`, a new password hash, a new responsible PIN hash, a new auth token, and a new family dataset.
- **D-04:** Keep the current e-mail normalization behavior: trim whitespace and lowercase via `trim().toLowerCase(...)`.

### Login, Reset e API
- **D-05:** Password reset by e-mail must resolve only the current active account for that normalized e-mail.
- **D-06:** If only inactive accounts exist for an e-mail, password reset remains enumeration-safe: return the accepted response and do not send a reset e-mail.
- **D-07:** The public registration contract should not add a special message for recadastro. An active duplicate still returns `EMAIL_ALREADY_REGISTERED`; an inactive-only duplicate returns the normal successful registration response.
- **D-08:** Login with an e-mail that only belongs to inactive accounts must return `INVALID_CREDENTIALS`, matching unknown/invalid credentials behavior.

### Banco e Migração
- **D-09:** PostgreSQL must enforce active-account uniqueness with a partial unique index on `lower(email)` where `active = true`.
- **D-10:** The migration must remove the old full-table unique constraint and create the new partial unique index without altering historical e-mail values.
- **D-11:** If the database contains more than one active account for the same normalized e-mail, the migration should fail rather than auto-inactivate accounts or rewrite e-mails.
- **D-12:** Remove `unique = true` from the `AppUser.email` JPA mapping. The uniqueness rule is now partial and migration-defined.
- **D-13:** Auth flows must use explicit active-account repository methods, such as `findByEmailIgnoreCaseAndActiveTrue` and `existsByEmailIgnoreCaseAndActiveTrue`, instead of general `findByEmailIgnoreCase(...).filter(AppUser::isActive)` patterns.

### Testes, Seed e Documentação
- **D-14:** Minimum coverage is focused backend integration tests plus technical documentation updates.
- **D-15:** The recadastro test should use the real account-deletion endpoints, not direct database mutation, to prove deletion leaves the correct old-user/old-family state.
- **D-16:** Tests must cover active duplicate rejection, recadastro after deletion, new user/family IDs, inactive-only login behavior, active-only password reset behavior, and the migration-backed uniqueness rule.
- **D-17:** Technical docs should explain that `app_users.email` is unique among active accounts, not globally unique across historical inactive records.
- **D-18:** `DemoDataSeeder` should check for an active demo account when deciding whether to skip seeding. An inactive historical demo account should not block creating a new active demo account.

### the agent's Discretion
- Exact migration filename/constraint/index names are left to the planner/executor, as long as they are clear, Flyway-compatible, and PostgreSQL-specific where needed.
- Exact repository method names may follow Spring Data conventions or explicit `@Query` methods, as long as auth call sites resolve active accounts deterministically.
- The executor may add small helper methods for active account lookup if that reduces duplication without changing the domain decisions above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and Requirements
- `.planning/ROADMAP.md` — Phase 8 goal and success criteria.
- `.planning/REQUIREMENTS.md` — Authentication and documentation requirements, especially AUTH-01, AUTH-02, AUTH-09, AUTH-11, and DOCS-01.
- `.planning/PROJECT.md` — Project constraints: backend is source of truth, family isolation, soft deactivation, no plaintext credentials, and MVP simplicity.
- `.planning/STATE.md` — Current project state and Phase 8 roadmap evolution entry.

### Prior Auth Decisions
- `.planning/phases/06.3-recuperacao-de-acesso-e-exclusao-de-conta/06.3-CONTEXT.md` — Account deletion is soft deactivation; reset tokens are hashed/single-use; recovery must not target registration.
- `.planning/phases/07-polimento-para-demonstra-o-do-tcc/07-CONTEXT.md` — Registration UI polish must not change backend auth contracts; backend remains source of truth for auth constraints.

### Backend Code Touchpoints
- `backend/src/main/java/br/com/habitinhos/auth/AuthService.java` — Registration, login, password reset, account deletion, and active-user checks.
- `backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java` — E-mail lookup/existence methods must become active-account explicit for auth flows.
- `backend/src/main/java/br/com/habitinhos/auth/AppUser.java` — Remove global JPA uniqueness from `email`.
- `backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java` — Old family should be deactivated as part of account deletion.
- `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java` — Seed skip logic should consider active demo account only.
- `backend/src/main/resources/db/migration/V1__create_foundation_schema.sql` — Original global `email VARCHAR(320) NOT NULL UNIQUE` definition.
- `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` — Main integration test surface for registration, reset, deletion, and recadastro.

### Documentation and API Artifacts
- `docs/data-model.md` — Data model should explain active-only e-mail uniqueness.
- `docs/api-contract.md` — Registration/reset behavior should stay aligned with API contract.
- `bruno/habitinhos-openapi.yaml` — OpenAPI/Bruno contract should be updated if descriptions or schema notes need to reflect active-only uniqueness.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuthService.register(...)`: already normalizes e-mail, checks duplicate e-mail, creates `FamilyUnit`, creates `AppUser`, sends welcome e-mail, and returns an auth response. This is the central recadastro path.
- `AuthService.confirmAccountDeletion(...)`: already deactivates the user and invalidates reset tokens. It should also deactivate the old family.
- `AuthService.requestPasswordReset(...)`: already returns enumeration-safe behavior. Its lookup must become active-account deterministic.
- `AbstractIntegrationTest`: uses PostgreSQL Testcontainers, so migration/index behavior can be covered through real database integration tests.

### Established Patterns
- Backend auth uses normalized lower-case e-mail, Spring service transactions, repository lookups, hashed passwords/PINs, and structured domain exceptions.
- Account deletion is soft deactivation, not physical deletion.
- Protected endpoints reject inactive users by loading `AppUser` by JWT `userId` and filtering `isActive`.
- API errors use stable codes such as `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, and `INVALID_RESET_TOKEN`.

### Integration Points
- `AppUserRepository.findByEmailIgnoreCase(...)` currently returns `Optional<AppUser>`, which becomes ambiguous when historical duplicate e-mails exist. Auth flows should move to `ActiveTrue` methods.
- `DemoDataSeeder` currently uses `existsByEmailIgnoreCase(DEMO_EMAIL)`, which would let an inactive demo account block fresh demo seed creation unless updated.
- Several tests outside auth use `findByEmailIgnoreCase(...)` only because test fixtures currently assume global uniqueness. The planner should decide whether to preserve a general helper for tests or migrate tests to active-explicit lookups where clearer.
- A new Flyway migration after `V10__auth_reset_tokens_account_deletion.sql` should handle constraint/index replacement.

</code_context>

<specifics>
## Specific Ideas

- Preferred database rule: `CREATE UNIQUE INDEX ... ON app_users (lower(email)) WHERE active = true`.
- Preferred repository intent: active auth flows read like `findByEmailIgnoreCaseAndActiveTrue(...)` / `existsByEmailIgnoreCaseAndActiveTrue(...)`.
- Preferred migration safety: explicitly detect multiple active rows for the same `lower(email)` and fail before creating the index, rather than mutating data.
- Preferred user-facing behavior: no special "recadastro" message. The new account creation feels like normal registration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 8 account lifecycle scope.

</deferred>

---

*Phase: 8-Permitir recadastro com e-mail de conta excluída/inativa*
*Context gathered: 2026-06-21T16:33:05-03:00*
