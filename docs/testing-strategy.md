# Testing Strategy

## Backend Priorities

Focus automated tests on rules that can corrupt tenant boundaries, balances, or history.

## Phase 1 Required Tests

Phase 1 is complete only when these automated backend tests exist:

- Responsible registration creates a `User` with role `RESPONSIBLE`.
- Responsible registration creates or associates a `FamilyUnit`.
- Login returns a usable JWT for valid credentials.
- Login rejects invalid credentials.
- `GET /me` returns authenticated user and family context.
- Creating a child persists `ChildProfile` for the authenticated family.
- Creating a child automatically creates exactly one wallet with zero balance.
- Listing/getting children only returns children from the authenticated family.
- Cross-family child read/update/deactivate attempts are blocked.

Prefer Spring Boot integration tests with PostgreSQL-compatible behavior. Testcontainers PostgreSQL is acceptable for Phase 1 if it does not make local setup painful.

### Unit Tests

- Mission status transition rules.
- Reward redemption validation.
- Coin value validation.
- Error mapping for common business failures.

### Integration Tests

- Registration/login and `/me`.
- Family isolation across users.
- Child creation creates wallet atomically.
- Mission completion without approval credits coins and writes `CoinTransaction`.
- Mission approval credits coins and writes `CoinTransaction`.
- Mission rejection does not credit coins.
- Reward redemption with sufficient balance debits coins and writes `CoinTransaction`.
- Reward redemption with insufficient balance fails without debit.

### Transaction Tests

- Wallet balance and ledger stay consistent in the same transaction.
- Failed redemption leaves wallet and ledger unchanged.
- Cross-family IDs are rejected before mutation.

## Mobile Priorities

For MVP, keep mobile testing lightweight unless time allows:

- Smoke test navigation flows manually during demo rehearsal.
- Add focused component or hook tests only where logic is non-trivial.
- Prefer backend integration tests for critical business rules.

## Demo Verification

Before TCC demo:

1. Start PostgreSQL.
2. Start backend and confirm Swagger is reachable.
3. Start mobile app.
4. Register/login responsible adult.
5. Create child, mission, assignment, reward.
6. Complete mission as child.
7. Approve mission when needed.
8. Confirm balance and statement.
9. Redeem reward.
10. Confirm insufficient balance is blocked.
