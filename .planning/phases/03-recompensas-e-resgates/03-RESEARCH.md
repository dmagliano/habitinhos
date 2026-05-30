# Phase 03 Research — Recompensas e Resgates

**Date:** 2026-05-29
**Domain:** Reward/Redemption/Wallet-Debit
**Confidence:** High — patterns established in Phase 1/2, greenfield reward domain

<user_constraints>
The following decisions are locked from CONTEXT.md and DECISIONS.md:

- ADR-007: Wallet uses transactional services + CoinTransaction ledger.
- ADR-008: Rewards soft-deactivated, not deleted.
- ADR-009: MVP redemption records directly as REDEEMED.
- D-13: Wallet balance changes must be transactional + write matching CoinTransaction.
- D-R07: Pessimistic locking for wallet mutations.
- Lombok for entity boilerplate.
- PT-BR interface text, English code names.
- Domain-oriented packages.
</user_constraints>

<phase_requirements>

| Req ID | Description | Research Support |
|--------|-------------|------------------|
| REWD-01 | Responsible CRUD for rewards | [VERIFIED] — follows ChildService/MissionService CRUD pattern |
| REWD-02 | Reward cost must be positive integer | [VERIFIED] — DB CHECK + domain validation, same pattern as Mission.coinValue |
| REWD-03 | Child lists active family rewards | [VERIFIED] — family-scoped repo query, same as MissionRepository |
| REWD-04 | Child redeems reward with sufficient balance | [VERIFIED] — pessimistic wallet lock + balance check + CoinTransaction |
| REWD-05 | System blocks insufficient balance | [VERIFIED] — DB CHECK balance_after >= 0, service-level validation, PT-BR error |
| REWD-06 | MVP redemption recorded as REDEEMED | [VERIFIED] — ADR-009, no approval workflow |
| WALT-03 | Reward debit is transactional | [VERIFIED] — @Transactional + pessimistic lock + CoinTransaction write |
| WALT-05 | Wallet statement as transaction history | [VERIFIED] — CoinTransaction list by child, family-scoped |
| DOCS-01 | OpenAPI/Swagger coverage | [VERIFIED] — springdoc auto-exposes controllers |

</phase_requirements>

## Architectural Responsibility Map

| Component | Responsibility |
|-----------|----------------|
| V3 Migration | rewards, reward_redemptions tables, FK from coin_transactions |
| Reward entity | Family-scoped reward template with cost, title, description, active |
| RewardRedemption entity | Links child + reward + wallet debit, records REDEEMED status |
| RewardRepository | Family-scoped queries for rewards |
| RewardRedemptionRepository | Family-scoped queries, child history |
| RewardService | CRUD for responsible, list for child |
| RedemptionService | Orchestrates: validate reward + check balance + debit wallet + create redemption + create CoinTransaction |
| WalletService (extended) | debitForReward() with pessimistic lock |
| WalletController (extended) | Statement endpoint for transaction history |
| RewardController | Responsible CRUD endpoints, child listing |
| RedemptionController | Child redemption endpoint |

## Standard Stack

| Library | Version | Purpose |
|---------|---------|----------|
| Spring Boot | 3.x (existing) | REST framework |
| Spring Data JPA | (existing) | Repository layer |
| Flyway | (existing) | Schema migrations |
| springdoc-openapi | (existing) | Swagger/OpenAPI |
| Lombok | (existing) | Entity boilerplate |
| Testcontainers | (existing) | Integration tests |

No new dependencies required for Phase 3.

## Key Technical Decisions

### Wallet Debit Strategy
Phase 2 establishes pessimistic locking for wallet credit via `@Lock(PESSIMISTIC_WRITE)` on `WalletRepository.findByChildIdAndFamilyUnitIdForUpdate()`. Phase 3 reuses this same lock mechanism for debit. The flow is:
1. Acquire pessimistic lock on wallet row
2. Check balance >= reward cost (service-level)
3. Decrement balance
4. Write CoinTransaction with type=DEBIT, source_type=REWARD_REDEMPTION
5. Write RewardRedemption with status=REDEEMED
6. DB CHECK balance_after >= 0 is the final safety net

### Reward Entity Design
Follows Mission pattern: family-scoped, soft-deactivatable, positive cost, created by responsible. Fields: title, description, cost, active, createdByUserId, familyUnitId.

### RewardRedemption Entity Design
Records: childId, rewardId, walletId, familyUnitId, status (MVP: always REDEEMED), snapshot of reward title/cost at redemption time, coinTransactionId for audit trail.
