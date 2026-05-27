# 01-04 Summary — Children API, Wallet Creation, and Tenant Isolation

## Completed

- Implemented protected children endpoints:
  - `POST /children`
  - `GET /children`
  - `GET /children/{id}`
  - `PUT /children/{id}`
  - `PATCH /children/{id}/deactivate`
- Added `ChildService` with responsible-only access and explicit `CurrentUser.familyUnitId` scoping.
- Added `WalletService.createForChild` to create a zero-balance wallet during child creation.
- Added child request/response DTOs that omit `familyUnitId`, `accessPinHash`, and password fields.
- Added minimal OpenAPI Bearer JWT configuration.
- Added integration tests for child creation, wallet creation, update, deactivate, PIN hashing, and cross-family isolation.

## Verification

- `cd backend && ./mvnw test` passed with 11 tests, 0 failures, 0 errors.
- `rg -n "familyUnitId" backend/src/main/java/br/com/habitinhos/children backend/src/main/java/br/com/habitinhos/wallet` passed.
- `rg -n "accessPinHash|passwordHash" backend/src/main/java/br/com/habitinhos -g '*Response.java'` returned no exposed response fields.
- `rg -n "missions|rewards|dashboard|coin_transactions" backend/src/main/java backend/src/main/resources/db/migration` returned no out-of-scope implementation.

## Deviations

- Kept `GET /children/{id}` scoped by family but allowed it to return inactive children by id. Listing remains active-only. Update and deactivate require active children, so deactivation remains one-way in Phase 1.

## Self-Check

PASSED
