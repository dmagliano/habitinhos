# Phase 07: Polimento para demonstração do TCC - Research

**Researched:** 2026-06-18
**Status:** Complete

## Research Goal

Answer: what must be known to plan Phase 7 well?

Phase 7 is not a single feature. It is a demo-readiness pass across seed/demo data, final mobile polish, documentation, presentation script, and final verification. Planning should avoid a vague "polish everything" plan and instead split work into concrete, verifiable deliverables.

## Phase Scope from ROADMAP

Phase 7 success criteria require:

- Demo data or seed instructions create a responsible user, family, children, missions, rewards, and history.
- README explains local backend, mobile, and database setup.
- Docs describe architecture, data model, API contract, and testing strategy.
- TCC presentation script walks through the complete MVP flow.
- Final tests pass and demo flow works against the real API.
- Final mobile polish verifies screens against `docs/design/mobile-design-contract.md` and `docs/design/phase-design-map.md`.

Mapped requirement IDs: `DOCS-02`, `DOCS-03`, `DOCS-04`.

## Current Artifact State

### Existing Docs

- `README.md` already covers repository shape, stack, local PostgreSQL, backend run, email delivery, Swagger testing, mobile API configuration, mobile scripts, and test commands.
- `docs/architecture.md`, `docs/data-model.md`, `docs/api-contract.md`, and `docs/testing-strategy.md` already exist and cover the major `DOCS-02` topics.
- `docs/design/README.md`, `docs/design/mobile-design-contract.md`, and `docs/design/phase-design-map.md` define mobile design rules and Phase 7 visual verification responsibilities.
- `bruno/README-BRUNO.md` documents Bruno/OpenAPI manual API usage.
- Three docs files are currently untracked in the worktree and should not be blindly overwritten by Phase 7 plans: `docs/habitinhos-er-diagram.drawio`, `docs/habitinhos.md`, `docs/habitinhos.plantuml`.

### Existing Demo/Seed Support

- No dedicated backend demo seed component, SQL seed file, or demo script was found.
- Local backend profile is configured in `backend/src/main/resources/application.yml` and defaults to PostgreSQL at `jdbc:postgresql://localhost:5432/habitinhos`.
- Backend domain services already create the core records needed for a demo through APIs, but a repeatable demo seed path should avoid requiring long manual setup.
- Existing repositories/entities support local seed creation without migrations:
  - `FamilyUnit`
  - `AppUser`
  - `ChildProfile`
  - `Wallet`
  - `Mission`
  - `AssignedMission`
  - `Reward`
  - `RewardRedemption`
  - `CoinTransaction`
- `WalletService.createForChild`, `creditForMission`, and `debitForRewardRedemption` preserve wallet/ledger invariants and should be preferred over direct wallet balance mutation when seed history matters.

### Existing Mobile/Auth State

- `mobile/src/features/auth/RegisterScreen.tsx` currently has no `Confirmar senha`, uses password placeholder `Crie uma senha`, and always allows pressing `Criar conta` unless loading.
- `mobile/src/features/auth/__tests__/login-screen.test.tsx` has RegisterScreen tests but uses short sample password `secret`. These tests must be updated for the new 8+ character local validity rule.
- `07-CONTEXT.md` and `07-UI-SPEC.md` lock exact registration polish decisions:
  - Add `Confirmar senha` below `Senha`.
  - Password placeholder: `Mínimo de 8 caracteres`.
  - Primary action disabled until required fields are valid.
  - Disabled explanation: `Complete os campos obrigatórios para criar a conta.`
  - Mismatch text: `As senhas precisam ser iguais.`

### Existing Test Commands

Backend:

- `cd backend && ./mvnw test`

Mobile:

- `cd mobile && npm run lint`
- `cd mobile && npm run typecheck`
- `cd mobile && npm run test:ci`

Integration tests use Testcontainers PostgreSQL. Full backend verification needs Docker/Colima availability.

## Recommended Plan Shape

Keep the roadmap's three-plan structure:

1. **07-01: Demo seeds/data and final visual polish**
   - Add local/demo seed support.
   - Implement the registration polish from `07-UI-SPEC.md`.
   - Add focused backend/mobile tests.

2. **07-02: README, architecture docs, API/data model docs, presentation script**
   - Update/verify existing docs rather than recreating them.
   - Add a TCC demo script that references the repeatable seed data and intended mobile journey.
   - Document seed credentials and reset/delete caveats without exposing real secrets.

3. **07-03: Final test pass and demo rehearsal fixes**
   - Run full backend/mobile verification.
   - Add a final verification/rehearsal artifact.
   - Apply only small fixes discovered by final checks; major new features should not enter this plan.

## Implementation Guidance

### Demo Seed Approach

Preferred approach: backend local-profile seeder behind explicit config.

Concrete recommendation:

- Create a component such as `backend/src/main/java/br/com/habitinhos/config/DemoDataSeeder.java`.
- Activate only under `local` profile and an explicit property such as `habitinhos.demo.seed.enabled`.
- Default the property to `false` unless the plan intentionally decides local startup should always seed; explicit opt-in is safer and prevents surprising local state.
- Seed a deterministic responsible account such as `demo@habitinhos.local` with password `Demo12345` and responsible PIN `1234`.
- If `AppUserRepository.existsByEmailIgnoreCase("demo@habitinhos.local")` is true, skip seeding to keep startup idempotent.
- Use `PasswordEncoder` for password/PIN.
- Use repositories/services to create:
  - one family;
  - at least two children;
  - wallets for each child;
  - active missions with mixed statuses, including pending and awaiting approval;
  - active rewards with different costs;
  - coin history sufficient for dashboard, wallet, rewards, and recent redemption screens to look populated.
- Prefer `WalletService.createForChild`, `WalletService.creditForMission`, and `WalletService.debitForRewardRedemption` to preserve ledger integrity.

Risks:

- Directly creating historical entities can bypass invariants.
- Startup seed must be idempotent.
- Seed data should be local/demo only, not Render production behavior unless intentionally configured.

### Registration Polish

Implement directly in `RegisterScreen.tsx` with local component state:

- Add `confirmPassword`.
- Derive `isFormValid`.
- Disable `PrimaryButton` when invalid or loading.
- Guard `handleSubmit` against invalid state.
- Do not send `confirmPassword` to backend.
- Place the generic disabled explanation immediately before `Criar conta`.
- Keep stale-session filtering and registration-specific backend errors.

### Docs

Docs should be treated as update/verification work:

- `README.md` already has much of DOCS-03. Add missing seed/demo script and final demo path details rather than rewriting.
- `docs/architecture.md`, `docs/data-model.md`, `docs/api-contract.md`, and `docs/testing-strategy.md` already satisfy much of DOCS-02, but must be checked against current code after Phase 06.3.
- Add a new demo/presentation document, recommended path: `docs/tcc-demo-script.md`.
- If the untracked diagram files are intentional user assets, reference them without overwriting or deleting them.

### Final Verification

The final verification plan should generate a human-readable artifact, recommended path:

- `.planning/phases/07-polimento-para-demonstra-o-do-tcc/07-FINAL-VERIFICATION.md`

It should record:

- backend test command and result;
- mobile lint/typecheck/test commands and results;
- manual demo rehearsal checklist and status;
- any accepted gaps that require human follow-up, such as inability to run Expo device smoke inside the agent environment.

## Security and Safety Notes

- Do not store plaintext secrets beyond clearly labeled local demo credentials.
- Do not put real Resend API keys, production JWT secrets, or personal emails in seed docs or commits.
- Demo seed must not trust client-supplied `familyUnitId`.
- Account deletion and recovery flows already exist; Phase 7 must not alter their backend contracts while polishing registration.
- If seed data modifies wallet balances/history, preserve `CoinTransaction` consistency.

## Validation Architecture

### Automated Validation

Backend:

- `cd backend && ./mvnw test`
- Focused seed test should prove local seed creation is idempotent and creates the required demo account/family/children/missions/rewards/history.

Mobile:

- `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx`
- `cd mobile && npm run typecheck`
- `cd mobile && npm run lint`
- `cd mobile && npm run test:ci`

Docs/static:

- Source assertions that README/docs contain seed instructions, demo credentials, run commands, and demo script sections.

### Manual Validation

- Start PostgreSQL through `docker compose up -d postgres`.
- Start backend with local profile and seed enabled.
- Open Swagger at `http://localhost:8080/swagger-ui.html`.
- Start mobile with `cd mobile && npm run android:local` or equivalent target.
- Rehearse the demo journey:
  - register/login or use seeded responsible;
  - select child;
  - inspect missions, rewards, balance, and profile;
  - enter responsible mode;
  - inspect dashboard, approvals, children, missions, rewards, recent redemptions;
  - demonstrate registration disabled state and confirmation password polish if creating a fresh account.

## Open Questions for Planner

- Whether seed enabling should be opt-in via config property or always-on in `local`. Recommendation: opt-in.
- Whether final verification can run full backend tests in the agent environment depends on Docker/Testcontainers availability.

## RESEARCH COMPLETE
