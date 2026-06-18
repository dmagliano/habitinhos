# Phase 07: Pattern Map

**Generated:** 2026-06-18
**Scope:** Demo seed, registration polish, documentation, final verification

## Files to Create or Modify

| Target | Role | Closest Existing Analog | Notes |
|--------|------|-------------------------|-------|
| `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java` | Local/demo seed component | `backend/src/main/java/br/com/habitinhos/config/EmailConfig.java`, domain services/repositories | Keep under config/support area; activate only with local/profile/property guard. |
| `backend/src/test/java/br/com/habitinhos/config/DemoDataSeederTest.java` | Seed integration test | `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java`, integration tests under domain packages | Extend existing Testcontainers setup; assert DB state and idempotency. |
| `mobile/src/features/auth/RegisterScreen.tsx` | Registration UI polish | Existing `RegisterScreen.tsx`, `PasswordResetScreen.tsx` validation disable pattern | Use local state and derived validity; keep shared components/tokens. |
| `mobile/src/features/auth/__tests__/login-screen.test.tsx` | Focused RegisterScreen tests | Existing RegisterScreen describe block in same file | Extend current tests rather than creating a new pattern. |
| `README.md` | Setup/demo instructions | Existing README sections: Local Database, Backend, Mobile API Configuration, Tests | Add seed/demo path without rewriting mature content. |
| `docs/architecture.md`, `docs/data-model.md`, `docs/api-contract.md`, `docs/testing-strategy.md` | Current docs verification/update | Existing docs headings and domain sections | Update only stale/current gaps discovered against code. |
| `docs/tcc-demo-script.md` | New demo script | `README.md`, `docs/testing-strategy.md`, `docs/design/phase-design-map.md` | Use PT-BR demo journey and seeded account details. |
| `.planning/phases/07-polimento-para-demonstra-o-do-tcc/07-FINAL-VERIFICATION.md` | Final verification evidence | Existing phase verification artifacts and `07-VALIDATION.md` | Record command results and manual smoke status. |

## Existing Patterns to Preserve

### Backend Tests

- Integration tests extend `AbstractIntegrationTest`.
- Database cleanup happens before each test through `JdbcTemplate` truncation.
- Backend tests use Testcontainers PostgreSQL and should not require a developer-managed DB.
- Assertions should inspect repositories/API behavior, not internal logs.

### Backend Domain Invariants

- Passwords and PINs use `PasswordEncoder`.
- Wallet creation uses `WalletService.createForChild`.
- Mission credits use `WalletService.creditForMission`.
- Reward debits use `WalletService.debitForRewardRedemption`.
- Family isolation comes from persisted `familyUnitId`; seed code must not introduce client-supplied tenant shortcuts.

### Mobile Auth UI

- Auth screens use `KeyboardAvoidingView`, `AppScreen`, `Card`, `PrimaryButton`, `SecondaryButton`, `TextInput`, `Text`, `View`.
- Styles use centralized `colors`, `radius`, `spacing`, and `typography`.
- Existing registration stale-session filtering must remain.
- Existing tests mock `useAuth` and assert visible labels/buttons through Testing Library.

### Docs

- README uses concise English setup instructions.
- Interface/demo copy can be PT-BR where it references visible app text or TCC script.
- Design docs prohibit copying Stitch HTML/CSS into React Native.
- Untracked docs files under `docs/` must not be deleted or overwritten by plan execution.

## Landmines

- Do not enable demo seed by default in production/render profile.
- Do not commit real API keys, real emails, or production secrets.
- Do not bypass wallet transaction creation when creating seeded history.
- Do not turn final verification into a broad feature phase; only small rehearsal fixes belong in 07-03.
- Do not introduce new mobile visual dependencies for one auth polish item.

## Recommended Verification Hooks

- Seed: `cd backend && ./mvnw test -Dtest=DemoDataSeederTest`
- Mobile auth polish: `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx`
- Full backend: `cd backend && ./mvnw test`
- Full mobile: `cd mobile && npm run lint && npm run typecheck && npm run test:ci`
