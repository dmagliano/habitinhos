---
phase: 02-dom-nio-de-miss-es-e-moedas
plan: 03
subsystem: wallet
tags: [wallet, ledger, jpa, pessimistic-lock, openapi, integration-test]
requires:
  - phase: 02-dom-nio-de-miss-es-e-moedas
    provides: V2 mission/assignment/coin transaction schema and mission assignment API
provides:
  - Transactional mission coin credit with auditable CoinTransaction ledger
  - Pessimistic wallet locking for balance mutation
  - Child wallet balance endpoint with tenant isolation
affects: [02-02, rewards-redemption, wallet-api]
tech-stack:
  added: []
  patterns: [transactional wallet mutation, family-scoped wallet reads, ledger duplicate guard]
key-files:
  created:
    - backend/src/main/java/br/com/habitinhos/wallet/CoinTransaction.java
    - backend/src/main/java/br/com/habitinhos/wallet/CoinTransactionRepository.java
    - backend/src/main/java/br/com/habitinhos/wallet/CoinTransactionType.java
    - backend/src/main/java/br/com/habitinhos/wallet/CoinTransactionSourceType.java
    - backend/src/main/java/br/com/habitinhos/wallet/WalletController.java
    - backend/src/main/java/br/com/habitinhos/wallet/dto/WalletResponse.java
    - backend/src/test/java/br/com/habitinhos/missions/MissionWalletTransactionIntegrationTest.java
    - backend/src/test/java/br/com/habitinhos/wallet/WalletIntegrationTest.java
  modified:
    - backend/src/main/java/br/com/habitinhos/wallet/Wallet.java
    - backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java
    - backend/src/main/java/br/com/habitinhos/wallet/WalletService.java
    - backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java
key-decisions:
  - "Wallet balance mutation is exposed through WalletService.creditForMission and persists CoinTransaction in the same transaction."
  - "Duplicate mission credit is blocked before wallet mutation and backed by the V2 unique index."
  - "Wallet reads validate child ownership before returning balance and never expose familyUnitId."
patterns-established:
  - "Use @Lock(PESSIMISTIC_WRITE) repository methods for wallet writes."
  - "Ledger entities use explicit factory methods instead of broad setters."
requirements-completed: [WALT-01, WALT-02, WALT-04, WALT-06, DOCS-01]
duration: 10 min
completed: 2026-05-30
---

# Phase 02 Plan 03: Wallet Ledger Summary

**Transactional wallet credits now write an auditable coin ledger under pessimistic wallet locking, with a family-scoped balance endpoint.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-05-30T13:03:00Z
- **Completed:** 2026-05-30T13:13:00Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Added RED coverage for wallet balance reads, tenant isolation, mission credit ledger writes, duplicate replay rollback, and lock metadata.
- Implemented `CoinTransaction` persistence with `CREDIT`/`MISSION_COMPLETION` support and duplicate credit guard.
- Added `WalletService.creditForMission(...)` with transactional wallet update + ledger insert under `PESSIMISTIC_WRITE`.
- Exposed `GET /children/{childId}/wallet` and included it in OpenAPI coverage.

## Task Commits

Each task was committed atomically:

1. **Task 02-03-01: Criar Wave 0 dos testes de wallet, ledger e atomicidade** - `acf7363` (test)
2. **Task 02-03-02: Implementar CoinTransaction e crédito transacional com lock** - `4e65278` (feat)
3. **Task 02-03-03: Implementar endpoint de saldo e exposição OpenAPI** - `557680b` (feat)

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/wallet/CoinTransaction.java` - ledger entity aligned to V2 schema.
- `backend/src/main/java/br/com/habitinhos/wallet/CoinTransactionRepository.java` - duplicate mission credit query contract.
- `backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java` - wallet lookup with pessimistic write lock.
- `backend/src/main/java/br/com/habitinhos/wallet/WalletService.java` - transactional credit and wallet read orchestration.
- `backend/src/main/java/br/com/habitinhos/wallet/WalletController.java` - balance endpoint for child wallet.
- `backend/src/main/java/br/com/habitinhos/wallet/dto/WalletResponse.java` - tenant-safe wallet response.
- `backend/src/test/java/br/com/habitinhos/missions/MissionWalletTransactionIntegrationTest.java` - transaction/ledger/lock coverage.
- `backend/src/test/java/br/com/habitinhos/wallet/WalletIntegrationTest.java` - wallet API tenant isolation coverage.
- `backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java` - OpenAPI path coverage.

## Decisions Made

- Kept wallet mutation centralized in `WalletService`; mission services will consume this API instead of touching balances directly.
- Used a repository-level `@Lock(PESSIMISTIC_WRITE)` method for write paths and normal family-scoped lookup for reads.
- Returned safe 404 for cross-family wallet reads by validating child ownership first.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Java 17-compatible test list access**
- **Found during:** Task 02-03-02 verification
- **Issue:** Initial RED tests used `List.getFirst()`, which is not available under Java 17 release compilation.
- **Fix:** Replaced calls with `get(0)`.
- **Files modified:** `MissionWalletTransactionIntegrationTest`
- **Verification:** `./mvnw test -Dtest=MissionWalletTransactionIntegrationTest` passed.
- **Committed in:** `4e65278`

---

**Total deviations:** 1 auto-fixed
**Impact on plan:** No scope change; compatibility fix required for the declared Java 17 target.

## Issues Encountered

None.

## Verification

- `cd backend && ./mvnw test -Dtest=MissionWalletTransactionIntegrationTest`
- `cd backend && ./mvnw test -Dtest=WalletIntegrationTest,OpenApiIntegrationTest`
- `cd backend && ./mvnw test -Dtest=MissionWalletTransactionIntegrationTest,WalletIntegrationTest,OpenApiIntegrationTest`
- `cd backend && ./mvnw test` — 26 tests, 0 failures

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan `02-02` can now wire assignment completion and approval into `WalletService.creditForMission(...)` for automatic and approval-based coin credits.

## Self-Check: PASSED

---
*Phase: 02-dom-nio-de-miss-es-e-moedas*
*Completed: 2026-05-30*
