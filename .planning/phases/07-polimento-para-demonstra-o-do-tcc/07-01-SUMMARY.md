---
phase: 07-polimento-para-demonstra-o-do-tcc
plan: 01
subsystem: backend-demo-seed-and-mobile-auth-ui
tags: [spring-boot, testcontainers, react-native, auth, demo-data]
requires:
  - phase: 06.3
    provides: Auth reset/delete polish already completed before demo readiness.
provides:
  - Opt-in local demo seed with representative family data.
  - Registration password confirmation and disabled-submit explanation.
  - Focused backend and mobile verification for the demo polish.
affects: [backend, mobile, demo, docs]
tech-stack:
  added: []
  patterns:
    - Local-only Spring ApplicationRunner guarded by profile and explicit property.
    - UI-only password confirmation that does not alter the backend register payload.
key-files:
  created:
    - backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java
    - backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java
  modified:
    - backend/src/main/resources/application.yml
    - mobile/src/features/auth/RegisterScreen.tsx
    - mobile/src/features/auth/__tests__/login-screen.test.tsx
key-decisions:
  - "Demo seed remains local-only and opt-in through profile local plus habitinhos.demo.seed.enabled."
  - "Registration confirmation remains a mobile-only validation field and is not sent to AuthContext.register."
patterns-established:
  - "Demo data uses WalletService credit/debit paths so balances and CoinTransaction history stay consistent."
  - "Disabled registration actions explain the missing-valid-state near the primary CTA without adding new UI components."
requirements-completed: [DOCS-04]
duration: 12min
completed: 2026-06-18
---

# Phase 07 Plan 01: Demo Seed and Registration Polish Summary

**Local TCC demo seed with representative family data plus registration password confirmation and disabled-submit guidance**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-18T15:44:13Z
- **Completed:** 2026-06-18T15:56:00Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- Added an opt-in local demo seed for `demo@habitinhos.local` with responsible credentials, family, children, wallets, missions, assigned mission states, rewards, reward redemption, and coin ledger history.
- Added focused backend integration coverage proving seed credentials, representative data, wallet coverage, transaction history, and idempotency.
- Updated the registration screen with `Confirmar senha`, minimum password guidance, invalid-submit guard, disabled CTA explanation, and unchanged backend payload.
- Verified backend seed, focused mobile auth tests, and mobile TypeScript checks.

## Task Commits

Each implementation task was committed atomically:

1. **Task 1: Define demo seed behavior with an integration test** - `ebac48b` (test)
2. **Task 2: Implement local opt-in demo data seeding** - `36634e2` (feat)
3. **Task 3: Implement registration password confirmation polish** - `7a8ba97` (feat)
4. **Task 4: Run focused Phase 7 seed and registration checks** - no code commit; verification-only task

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java` - Local/profile-gated seed runner for repeatable demo data.
- `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java` - Integration test covering seeded data and idempotency.
- `backend/src/main/resources/application.yml` - Adds `habitinhos.demo.seed.enabled` mapped to `HABITINHOS_DEMO_SEED_ENABLED:false`.
- `mobile/src/features/auth/RegisterScreen.tsx` - Adds password confirmation, validity guard, and disabled-submit explanation.
- `mobile/src/features/auth/__tests__/login-screen.test.tsx` - Adds focused registration polish coverage.

## Decisions Made

- Kept demo credentials intentionally local and synthetic: `demo@habitinhos.local`, `Demo12345`, PIN `1234`.
- Used `WalletService` for mission credits and reward debit so demo data exercises the same ledger behavior as the app.
- Kept confirmation as UI-only state; `register` still receives only `name`, `email`, `password`, `familyName`, and `responsiblePin`.

## Deviations from Plan

None - plan executed exactly as written.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope creep.

## Issues Encountered

None. Docker/Testcontainers was available and the focused backend test passed.

## Verification

- `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` - PASS, 1 test, 0 failures
- `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx` - PASS, 16 tests, 0 failures
- `cd mobile && npm run typecheck` - PASS

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Wave 2 can now document the local run/demo flow using the real seed flag and demo credentials.

---
*Phase: 07-polimento-para-demonstra-o-do-tcc*
*Completed: 2026-06-18*
