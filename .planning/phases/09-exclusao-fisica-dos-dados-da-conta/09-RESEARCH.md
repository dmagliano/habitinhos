# Fase 9: Exclusão física por e-mail - Pesquisa

**Pesquisado:** 2026-08-20
**Confiança geral:** HIGH

## Decisões consolidadas

- O fluxo permanente será separado do soft delete existente: `POST /auth/account-deletion/permanent/request` e `POST /auth/account-deletion/permanent/confirm`.
- O request recebe e-mail e responde de forma enumeration-safe. Se houver qualquer conta ativa ou inativa com o e-mail normalizado, um token novo, único e expirável é enviado ao próprio e-mail.
- A confirmação usa e-mail + token, sem senha ou JWT, porque contas inativas não conseguem autenticar.
- O token terá novo propósito `PERMANENT_ACCOUNT_DELETION`; `ACCOUNT_DELETION` continua significando apenas desativação soft.
- A confirmação procura todas as `app_users` com `lower(trim(email))` equivalente ao e-mail normalizado, captura todas as famílias distintas e purga todas na mesma transação.

## Findings do código

- `AuthService.requestAccountDeletion` e `confirmAccountDeletion` já implementam o padrão de token enviado por e-mail para desativação soft. Esse fluxo não pode ser alterado semanticamente.
- `AuthService.requestPasswordReset` já é enumeration-safe para e-mail inexistente e usa `AccountEmailSender`; a nova solicitação deve seguir o mesmo padrão, mas aceitar contas inativas na busca.
- `AppUserRepository.findByEmailIgnoreCaseAndActiveTrue` não serve para o purge: a busca precisa retornar uma lista de todas as contas, incluindo inativas. Adicionar método explícito, como `findAllByEmailIgnoreCase`, ou uma query por e-mail normalizado.
- A coluna `app_users.email` é normalizada no cadastro para `trim().toLowerCase(Locale.ROOT)`, e V11 restringe unicidade apenas a contas ativas. Histórico inativo pode conter o mesmo e-mail em múltiplas linhas.
- `AuthResetToken.user_id` referencia `app_users`; o token precisa ser associado a uma conta representante existente, enquanto a confirmação deve usar o e-mail confirmado para expandir o conjunto completo de contas. O purge apaga o token junto com todos os usuários.
- `AccountEmailSender` já possui métodos específicos para password reset e soft account deletion. Adicionar `sendPermanentAccountDeletionConfirmation(email, token, expiresAt)` evita confundir templates, logs e propósitos.
- Após a remoção física, `CurrentUserProvider` não encontra nenhum `app_users.id` de JWT antigo, então os tokens antigos falham sem blacklist adicional.

## Matriz de tabelas e ordem FK-safe

| Ordem | Tabela | Escopo |
|---:|---|---|
| 1 | `auth_reset_tokens` | `user_id IN (matching user IDs)` |
| 2 | `reward_redemptions` update | `SET coin_transaction_id = NULL` para todas as famílias |
| 3 | `coin_transactions` | `family_unit_id IN (matched family IDs)` |
| 4 | `reward_redemptions` | `family_unit_id IN (...)` |
| 5 | `assigned_missions` | `family_unit_id IN (...)` |
| 6 | `wallets` | `family_unit_id IN (...)` |
| 7 | `child_profiles` | `family_unit_id IN (...)` |
| 8 | `rewards` | `family_unit_id IN (...)` |
| 9 | `missions` | `family_unit_id IN (...)` |
| 10 | `app_users` | `id IN (matching user IDs)` |
| 11 | `family_units` | `id IN (matched family IDs)` |

The redemption/transaction cycle requires the nullifying update before deleting either table. Every statement must be parameterized; IDs must be derived inside the transaction from the confirmed e-mail, never from JSON.

## Recommended implementation

1. Add `PERMANENT_ACCOUNT_DELETION` to `AuthResetPurpose` and a Flyway migration after V11 updating the purpose check constraint.
2. Add a request DTO with e-mail and a confirmation DTO with e-mail + token. Keep request response identical for zero/one/many matches.
3. Add a repository query returning all matching accounts regardless of `active`, and issue one token against a representative matched user while binding the confirmed normalized e-mail to the token request/confirmation flow.
4. Add the new email-sender method to logging and Resend implementations. Do not expose raw token in HTTP or ordinary logs.
5. Implement a public `@Transactional` purge service using JDBC. Validate token purpose, expiration, used state, and e-mail match before DML, then snapshot all matching user/family IDs and execute the matrix.
6. Lock and mark the permanent token used inside the same transaction before deletion to prevent concurrent replay; any failure rolls back both deletion and token consumption, while a committed purge leaves the token consumed before its owning rows are removed.

## Security and pitfalls

- Never return a different response for an unknown e-mail, including whether a token was sent.
- Do not require active status during request lookup; doing so would make inactive historical data impossible to delete.
- Do not let confirmation purge by only the representative token's `user_id`; it must expand to every matching e-mail row and every distinct family.
- Do not reuse `ACCOUNT_DELETION`, because that purpose is already consumed by soft deactivation.
- If multiple accounts match the e-mail, invalidating older permanent tokens must cover the whole matching set or use a token lookup that is explicitly scoped to normalized e-mail; otherwise a stale token tied to one historical user may remain usable.
- Do not use JPA `deleteAll` or generic `ON DELETE CASCADE`; the schema has independent UUID columns and a redemption/transaction cycle.
- Validate token and capture the full target set before the first delete. Test that an unrelated family sharing no e-mail remains intact.
- Email delivery failure for an existing e-mail must not leave an effective deletion token with no delivery; follow the existing reset sender failure policy and test it.

## Validation strategy

Use `AuthIntegrationTest` with PostgreSQL/Testcontainers, MockMvc and JdbcTemplate. Required scenarios:

- Unknown e-mail returns the same accepted response and sends no email.
- One active account receives a token; wrong/expired/used token performs no DML.
- One inactive account receives a token and can be purged despite being unable to login.
- Two or more active/inactive accounts with the same normalized e-mail, pointing to distinct families, are all physically removed.
- A neighboring family and an account with another e-mail remain intact.
- A deterministic failure after the first delete restores every table, all accounts/families, the cycle link and token used state.
- After success, all captured JWTs fail, all old credentials fail, and registration with the same e-mail creates a new active account/family.
- Existing soft request/confirm still deactivates and preserves rows.
- OpenAPI generated/manual contracts expose both permanent request/confirm routes, Bearer only where applicable, enumeration-safe request semantics, token body and 204 confirmation response.

## Requirement mapping

| Requirement | Evidence |
|---|---|
| AUTH-12 | New token flow, all matching active/inactive accounts, multi-family JDBC purge, rollback and PostgreSQL integration tests |
| DOCS-01 | Controller/OpenAPI annotations, Bruno YAML, API docs and OpenAPI integration assertions |

## Research Complete

The previous authenticated/password + literal confirmation design is superseded. The executable plans must implement e-mail request/confirmation and multi-account expansion before deletion.
