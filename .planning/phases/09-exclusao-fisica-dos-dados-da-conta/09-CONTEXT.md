# Phase 9: Exclusão física por e-mail - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Source:** User refinement against the existing authentication and email flows

<domain>
## Phase Boundary

Implement backend permanent deletion by e-mail. A requester submits an e-mail, receives a confirmation token through the existing account-email delivery abstraction when matching accounts exist, and confirms the irreversible purge with that token. Confirmation must remove every account and family associated with the normalized e-mail, regardless of whether each account is active or inactive. The existing `/auth/account-deletion/request` and `/auth/account-deletion/confirm` soft-deactivation flow remains unchanged.

</domain>

<decisions>
## Implementation Decisions

### Request and confirmation flow
- Use dedicated endpoints, recommended as `POST /auth/account-deletion/permanent/request` and `POST /auth/account-deletion/permanent/confirm`.
- The request body contains only the e-mail. Normalize it exactly as registration/login (`trim().toLowerCase(Locale.ROOT)`).
- Request response is enumeration-safe and identical whether zero, one, active, inactive, or multiple matching accounts exist.
- If at least one matching account exists, issue one expiring, single-use token and send it to the submitted normalized e-mail through `AccountEmailSender`; never return the token in the HTTP response.
- Confirmation accepts the normalized e-mail and token. It does not require a password or JWT because inactive historical accounts cannot authenticate.
- Use a new reset-token purpose dedicated to permanent deletion; do not reuse `ACCOUNT_DELETION`, which remains the soft-deactivation purpose.

### Deletion scope
- Find all `app_users` with the normalized e-mail, active or inactive, then derive the distinct `family_units` IDs from those rows. Do not use a family/user ID from the request.
- Permanently remove all matched users and all family-owned records: reset tokens, reward redemptions, coin transactions, assigned missions, wallets, child profiles, rewards, missions, app users, and family units.
- If several historical accounts for the same e-mail point to different families, purge every family in the same transaction.
- Do not delete any account/family whose normalized e-mail does not match the confirmed e-mail.

### Transaction and security
- Resolve and validate the token and full matching-account/family set before the first deletion DML; snapshot IDs in the transaction so concurrent changes cannot expand the scope silently.
- Use parameterized JDBC SQL in FK-safe order, explicitly breaking the redemption/coin-transaction cycle. No generic JPA cascade or `deleteAll`.
- The purge is one transaction and rolls back every family if any delete fails.
- After success, old JWTs and credentials for every matched account fail, and the e-mail is available for a new registration.
- Do not log e-mail token, password, hashes, or request secrets. Logs may contain safe counts and technical IDs only.

### Documentation and validation
- Document the two permanent-deletion endpoints, token lifecycle, enumeration-safe request behavior, irreversibility, multi-account scope, and distinction from soft deactivation.
- Use PostgreSQL/Testcontainers integration tests for foreign keys, multiple families, rollback, token lifecycle, and physical absence.

</decisions>

<canonical_refs>
## Canonical References

- `backend/src/main/java/br/com/habitinhos/auth/AuthService.java` — current reset/deactivation lifecycle and e-mail token issuance
- `backend/src/main/java/br/com/habitinhos/auth/AuthController.java` — endpoint conventions
- `backend/src/main/java/br/com/habitinhos/auth/AuthResetPurpose.java` — token purposes and required new purpose
- `backend/src/main/java/br/com/habitinhos/auth/AuthResetToken.java` — token persistence constraints
- `backend/src/main/java/br/com/habitinhos/auth/AuthResetTokenRepository.java` — token lookup/invalidation
- `backend/src/main/java/br/com/habitinhos/auth/AppUserRepository.java` — active/inactive e-mail lookup changes
- `backend/src/main/java/br/com/habitinhos/auth/AccountEmailSender.java` — email delivery abstraction
- `backend/src/main/java/br/com/habitinhos/auth/LoggingAccountEmailSender.java` — local delivery behavior
- `backend/src/main/java/br/com/habitinhos/auth/ResendAccountEmailSender.java` — production delivery behavior
- `backend/src/main/resources/db/migration/V9__auth_reset_tokens.sql` — token schema
- `backend/src/main/resources/db/migration/V10__auth_reset_tokens_account_deletion.sql` — current soft-deletion purpose
- `backend/src/main/resources/db/migration/V11__active_user_email_uniqueness.sql` — active-only e-mail uniqueness
- `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` — reset/deactivation integration patterns
- `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` — PostgreSQL/Testcontainers setup
- `bruno/habitinhos-openapi.yaml` — API contract
- `docs/api-contract.md` — API documentation

</canonical_refs>

<specifics>
## Specific Ideas

The confirmation e-mail should follow the same delivery path and token safety as password recovery/account deactivation, but the new token purpose must make it impossible to confuse permanent deletion with soft deactivation. One confirmed e-mail must cover all active and inactive historical accounts sharing that e-mail.

</specifics>

<deferred>
## Deferred Ideas

Recovery/trash periods, account export, legal-retention exceptions, and external datastore deletion are outside this phase.

</deferred>

---

*Phase: 09-exclusao-fisica-dos-dados-da-conta*
*Context gathered: 2026-08-20*
