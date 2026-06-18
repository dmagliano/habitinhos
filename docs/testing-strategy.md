# Testing Strategy

## Backend Priorities

Focus automated tests on rules that can corrupt tenant boundaries, balances, or history.

## OpenAPI/Swagger Verification

Swagger is part of the backend acceptance criteria. For every backend phase that adds endpoints:

- `/v3/api-docs` must be reachable when the backend is running.
- `/swagger-ui.html` must load locally.
- Newly implemented endpoints must appear in Swagger UI.
- Protected endpoints must support Bearer JWT authorization in Swagger UI.
- At least one manual smoke test should be performed through Swagger UI for each new endpoint group.

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
- Password reset, responsible PIN reset, and account-deletion token flows.
- Family isolation across users.
- Child creation creates wallet atomically.
- Mission completion without approval credits coins and writes `CoinTransaction`.
- Mission approval credits coins and writes `CoinTransaction`.
- Mission rejection does not credit coins.
- Reward redemption with sufficient balance debits coins and writes `CoinTransaction`.
- Reward redemption with insufficient balance fails without debit.
- Responsible dashboard `/dashboard/responsible` aggregates children, balances, mission status counts, approvals, and recent redemptions.
- Local demo seed creates a repeatable family scenario and remains idempotent when `HABITINHOS_DEMO_SEED_ENABLED=true`.

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
2. Start backend with `HABITINHOS_DEMO_SEED_ENABLED=true` and confirm Swagger is reachable.
3. Start mobile app with `npm run android:local`, `npm run ios:local`, or `npm run web:local`.
4. Login with the local demo account `demo@habitinhos.local` / `Demo12345`.
5. Verify responsible dashboard cards, pending approvals, and recent redemptions.
6. Enter child flow, complete a mission, inspect wallet balance, and redeem a reward.
7. Return to responsible mode with responsible PIN `1234`.
8. Mark a reward redemption delivered and verify recent redemption history.
9. Open registration and confirm password minimum, `Confirmar senha`, and disabled-submit explanation.
10. Follow `docs/tcc-demo-script.md` once end-to-end and record the result in the final verification artifact.

Focused Phase 7 checks:

```bash
cd backend && ./mvnw test -Dtest=DemoDataSeederTest
cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx
cd mobile && npm run typecheck
```
