---
phase: 07-polimento-para-demonstra-o-do-tcc
status: clean
reviewed_at: 2026-06-18T13:07:44-03:00
findings_open: 0
findings_fixed: 1
---

# Phase 07 Code Review

## Result

Clean after one backend fix. No open findings remain.

## Scope

- `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java`
- `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java`
- `backend/src/main/resources/application.yml`
- `mobile/src/features/auth/RegisterScreen.tsx`
- `mobile/src/features/auth/__tests__/login-screen.test.tsx`
- `README.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/api-contract.md`
- `docs/testing-strategy.md`
- `docs/tcc-demo-script.md`

## Fixed Findings

- Warning: `DemoDataSeeder.run(ApplicationArguments)` previously delegated to `run()`, so the `@Transactional` boundary on `run()` could be bypassed by self-invocation when Spring started the application. A partial seed failure could leave the demo account created without all dependent demo data, and subsequent runs would skip seeding because the email already existed.
  - Fix: make the `ApplicationRunner` entrypoint transactional, route both public entrypoints to a private `seed()` method, and remove the unused `WalletRepository` dependency.
  - Verification: `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` passed with 1 test, 0 failures.

## Open Findings

None.
