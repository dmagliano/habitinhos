# Phase 03 Context — Recompensas e Resgates

## Phase Boundary

Phase 3 delivers the reward and redemption domain: responsible CRUD for rewards, child reward listing, reward redemption with wallet debit, and transaction history. Phase 3 does NOT implement mobile screens, dashboard views, reports, push notifications, or demo seeds.

## Success Criteria

1. Responsible adult can create/edit/deactivate rewards.
2. Child can list active rewards from their own family.
3. Child can redeem a reward when wallet balance is sufficient.
4. System blocks redemption when balance is insufficient.
5. Successful redemption debits wallet and writes `RewardRedemption` plus `CoinTransaction`.
6. Tests cover sufficient balance, insufficient balance, debit, and ledger consistency.
7. Swagger/OpenAPI exposes reward, redemption, and wallet statement endpoints implemented in this phase.

## Phase Dependencies

Phase 3 depends on Phase 2 being complete. The following Phase 2 deliverables are assumed available:

- `CoinTransaction` JPA entity (created by 02-03)
- `WalletService.creditForMission()` with pessimistic wallet lock (created by 02-03)
- Wallet balance endpoint (created by 02-03)
- Mission completion/approval flow (created by 02-02)
- Family-scoped repositories and tenant isolation patterns

## Key Implementation Decisions

- **D-R01:** Rewards are family-scoped templates created by the responsible adult (REWD-01).
- **D-R02:** Reward cost must be a positive integer, enforced by DB CHECK and domain validation (REWD-02).
- **D-R03:** Rewards are soft-deactivated, never deleted — consistent with ADR-008.
- **D-R04:** MVP redemptions record directly as `REDEEMED` — no approval workflow for rewards (ADR-009).
- **D-R05:** Wallet debit is transactional — must decrement balance and write `CoinTransaction` atomically (ADR-007, D-13).
- **D-R06:** `balance_after CHECK >= 0` in DB is the final guard against negative balances.
- **D-R07:** Wallet mutation uses pessimistic locking (`SELECT ... FOR UPDATE`) for safe concurrent access.
- **D-R08:** `coin_transactions.reward_redemption_id` already exists in V2 as nullable UUID — Phase 3 adds FK after creating `reward_redemptions` table.
- **D-R09:** `CoinTransaction` source_type `REWARD_REDEMPTION` and type `DEBIT` already supported by V2 CHECK constraints.
- **D-R10:** Wallet statement is a simple chronological list of `CoinTransaction` records for a child (WALT-05).

## Reusable Phase 2 Assets

| Asset | Location | Usage |
|-------|----------|-------|
| CurrentUser / CurrentUserProvider | auth package | Derive familyUnitId, userId, role |
| CoinTransaction entity | wallet package (from 02-03) | Write DEBIT transactions |
| WalletService | wallet package | Extend with debitForReward() |
| WalletRepository | wallet package | Pessimistic lock finder |
| PT-BR error responses | shared/error | ConflictException, NotFoundException |
| AbstractIntegrationTest | shared test | Testcontainers PostgreSQL base |
| Swagger/OpenAPI config | config package | Auto-expose new endpoints |

## Scope Exclusions

- Mobile reward/redemption screens (Phase 5)
- Dashboard reward management (Phase 6)
- Demo seed data (Phase 7)
- Reward images/icons (deferred)
- Redemption approval workflow (deferred, ADR-009)
- Recurring/limited-stock rewards (deferred)
