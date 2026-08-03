---
phase: 08
slug: permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
status: complete
created: 2026-06-21
---

# Phase 8 Pattern Map

## Files to Modify and Existing Analogs

| Target | Role | Closest analog / pattern |
|--------|------|--------------------------|
| `backend/src/main/resources/db/migration/V11__active_user_email_uniqueness.sql` | Flyway schema migration | `V8__mission_completion_window_and_schedule.sql` drops/replaces an old unique index; `V2__create_mission_coin_schema.sql` uses partial unique indexes. |
| `backend/src/main/java/br/com/habitinhos/auth/AppUser.java` | Entity mapping | Existing `active` soft-deactivation pattern in `AppUser`, `Mission`, `Reward`, and `ChildProfile`. |
| `backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java` | Tenant entity lifecycle | Add `deactivate()` matching `AppUser.deactivate()`, `Mission.deactivate()`, `Reward.deactivate()`, and `ChildProfile.deactivate()`. |
| `backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java` | Repository lookup boundary | Spring Data derived methods already used throughout repositories; add active-explicit e-mail lookup/existence methods. |
| `backend/src/main/java/br/com/habitinhos/auth/AuthService.java` | Business logic | Existing transactional registration/login/reset/delete methods; reuse `normalizeEmail`, structured exceptions, and token invalidation. |
| `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java` | Demo data bootstrap | Existing idempotency guard should become active-only. |
| `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` | End-to-end auth coverage | Existing deletion test already exercises real account-deletion endpoints and e-mail code capture. Extend it rather than creating isolated unit tests only. |
| `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java` | Seed idempotency coverage | Existing test verifies idempotency and active demo family; add inactive historical account scenario if needed. |
| `docs/data-model.md`, `docs/api-contract.md`, `bruno/habitinhos-openapi.yaml` | Technical docs/API artifact | Phase 7 docs update style: small targeted edits backed by source assertions. |

## Code Patterns to Preserve

- Service methods are transactional at the service layer, not at controller level.
- Public auth errors avoid revealing account existence or historical account state.
- Password/PIN/reset tokens are never stored in plaintext.
- Soft deactivation preserves historical records.
- Family isolation stays derived from authenticated `CurrentUser`, never from request payloads.
- Tests use `MockMvc`, `ObjectMapper`, `ArgumentCaptor`, and `@MockBean AccountEmailSender`.

## Plan Constraints

- Use one wave and one plan. The changes touch overlapping auth/database/docs files, so parallel plans would create avoidable coordination overhead.
- Include a `<threat_model>` block in the plan because this phase changes authentication and account lifecycle behavior.
- Keep docs updates in the same plan so implementation and contract notes cannot drift.
