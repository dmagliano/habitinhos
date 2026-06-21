# Phase 8: Permitir recadastro com e-mail de conta excluída/inativa - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21T16:33:05-03:00
**Phase:** 8-Permitir recadastro com e-mail de conta excluída/inativa
**Areas discussed:** Histórico e recadastro, Login/reset e API, Banco e migração, Testes e documentação

---

## Histórico e recadastro

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| What happens to the old `FamilyUnit` after account deletion? | Desativar também a família antiga | Keep domain coherent: no active responsible account means the old family becomes historical/inactive. | yes |
| What happens to old JWT/session tokens? | Invalidar por estado ativo apenas | Do not add JWT blacklist; old tokens fail because old user is inactive. | yes |
| Should recadastro reuse old data? | Não reaproveitar nada | Create new user, family, credentials, token, and family data. | yes |
| How should e-mail normalization work? | Manter normalização atual | Continue `trim().toLowerCase(...)`. | yes |

**User's choices:** Selected the recommended option for all four questions.
**Notes:** The user wants a clean new account identity while preserving the old account/family as historical inactive data.

---

## Login/reset e API

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Which account receives password reset when inactive and active accounts share an e-mail? | Somente a conta ativa | Password reset targets only the current active account. | yes |
| If only inactive accounts exist, should reset remain enumeration-safe? | Sim, tratar como desconhecido | Return accepted response and send no e-mail. | yes |
| Should registration add special recadastro message/code? | Não mudar contrato público | Active duplicate still returns `EMAIL_ALREADY_REGISTERED`; inactive-only duplicate creates normal account. | yes |
| How should login respond for inactive-only e-mail? | `INVALID_CREDENTIALS` | Keep privacy and match invalid credentials behavior. | yes |

**User's choices:** Selected the recommended option for all four questions.
**Notes:** Public API should not expose historical account state.

---

## Banco e migração

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| How should active e-mail uniqueness be enforced? | Partial unique index on `lower(email)` where `active = true` | Database enforces case-insensitive active-account uniqueness. | yes |
| How should conflicting active duplicates be handled? | Falhar se houver mais de uma ativa por e-mail normalizado | Migration must not mutate real account state automatically. | yes |
| Should JPA remove `unique = true` from `AppUser.email`? | Sim, remover | Avoid model/database mismatch. | yes |
| Should auth flows use explicit active-account repository methods? | Usar métodos explícitos `ActiveTrue` | Avoid ambiguous `Optional` behavior with historical duplicates. | yes |

**User's choices:** Selected the recommended option for all four questions.
**Notes:** The database rule is now partial and belongs in Flyway migration, not as a full-table JPA uniqueness hint.

---

## Testes e documentação

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| What minimum coverage is required? | Integração backend focada + docs | Cover real backend flows and technical docs. | yes |
| How should recadastro be tested? | Usar endpoint real de exclusão | Proves account deletion leaves the correct state before recadastro. | yes |
| Should data/API docs explain active-only uniqueness? | Sim, docs técnicos mínimos | Make the model rule visible. | yes |
| Should `DemoDataSeeder` check active demo accounts only? | Sim, considerar apenas conta ativa | Inactive demo account should not block fresh active seed. | yes |

**User's choices:** Selected the recommended option for all four questions.
**Notes:** No mobile/UI testing was selected because the public registration response and UI behavior do not change.

---

## the agent's Discretion

- Exact migration/index/constraint names.
- Exact repository method names or use of explicit `@Query`, as long as auth flows resolve active accounts deterministically.
- Small helper methods for active account lookup if useful.

## Deferred Ideas

None.
