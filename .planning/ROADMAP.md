# Roadmap: Habitinhos

## Overview

Habitinhos will be built as a monorepo MVP in seven phases: backend foundation, mission/coin domain, reward redemption, mobile base, child flow, responsible flow, and TCC demo polish. Backend phases come first because family isolation, wallet integrity, and coin history are the core guarantees the mobile app depends on.

## Phases

- [x] **Phase 1: Fundação do backend** - Create Spring Boot backend foundation, PostgreSQL/Flyway setup, authentication, family isolation, children, wallets, and baseline tests.
- [x] **Phase 2: Domínio de missões e moedas** - Implement missions, assignments, completion, approval/rejection, coin credits, ledger transactions, and transactional tests. (completed 2026-05-30)
- [x] **Phase 3: Recompensas e resgates** - Implement rewards, redemptions, sufficient-balance validation, coin debits, ledger transactions, and balance tests. (completed 2026-06-01)
- [x] **Phase 4: Mobile base** - Create Expo app foundation, navigation, API client, login flow, and base visual structure. (completed 2026-06-01)
- [ ] **Phase 5: Fluxo da criança** - Build child home, balance, missions, completion feedback, rewards catalog, and redemption flow.
- [ ] **Phase 6: Fluxo do responsável** - Build dashboard, children, missions, assignments, rewards, approvals, and child detail views.
- [ ] **Phase 7: Polimento para demonstração do TCC** - Add demo seeds, visual polish, README, architecture docs, presentation script, and final testing.

## Phase Details

### Phase 1: Fundação do backend

**Goal**: A runnable Spring Boot backend with persistence, migrations, initial auth, tenant isolation, family/user/child/wallet model, and basic tests.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, CHLD-01, CHLD-02, CHLD-03, CHLD-04, DOCS-01
**Success Criteria** (what must be TRUE):

  1. Backend starts locally and connects to PostgreSQL from `docker-compose.yml`.
  2. Flyway creates tables for `FamilyUnit`, `User`, `ChildProfile`, and `Wallet`.
  3. Responsible adult can register/login and retrieve `/me`.
  4. Responsible adult can create/list children and each child receives a wallet.
  5. Protected endpoints enforce family isolation and do not trust client-supplied `familyUnitId`.
  6. Basic unit/integration tests cover auth, child creation, wallet creation, and tenant isolation.
  7. Swagger/OpenAPI exposes Phase 1 endpoints and Bearer JWT authorization for manual endpoint testing.

**Plans**: 4 plans

Plans:
**Wave 1**

- [x] 01-01: Spring Boot project, PostgreSQL, Flyway, health/config baseline

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Core family/user/child/wallet entities, repositories, migrations

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03: Initial authentication, `/me`, authorization context, family isolation

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04: Children API, automatic wallet creation, baseline tests, OpenAPI setup

### Phase 2: Domínio de missões e moedas

**Goal**: Mission assignment and completion flow can credit coins through an auditable transaction ledger.
**Depends on**: Phase 1
**Requirements**: MISS-01, MISS-02, MISS-03, MISS-04, MISS-05, MISS-06, MISS-07, MISS-08, MISS-09, WALT-01, WALT-02, WALT-04, WALT-06, DOCS-01
**Success Criteria** (what must be TRUE):

  1. Responsible adult can create/edit/deactivate missions and assign them to children.
  2. Child can complete assigned missions from the same family only.
  3. Missions without approval credit coins automatically.
  4. Missions requiring approval credit coins only after responsible approval.
  5. Rejection preserves history and does not credit coins.
  6. Transactional tests prove wallet balance and `CoinTransaction` stay consistent.
  7. Swagger/OpenAPI exposes mission, assignment, approval, and wallet endpoints implemented in this phase.

**Plans**: 4 plans

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Mission, AssignedMission, and CoinTransaction schema/model/repository contracts

**Wave 2** *(blocked on 02-01 completion)*

- [x] 02-04-PLAN.md — Mission CRUD, explicit assignment API, assignment tests, and initial OpenAPI coverage

**Wave 3** *(blocked on 02-01 and 02-04 completion)*

- [x] 02-03-PLAN.md — Wallet credit service, CoinTransaction ledger, wallet balance endpoint, transactional tests

**Wave 4** *(blocked on 02-04 and 02-03 completion)*

- [x] 02-02-PLAN.md — Completion, approval, rejection, status transitions, authorization rules, and full Phase 2 OpenAPI coverage

### Phase 3: Recompensas e resgates

**Goal**: Children can redeem active family rewards when they have enough coins, with transactional debits and history.
**Depends on**: Phase 2
**Requirements**: REWD-01, REWD-02, REWD-03, REWD-04, REWD-05, REWD-06, WALT-03, WALT-05, DOCS-01
**Success Criteria** (what must be TRUE):

  1. Responsible adult can create/edit/deactivate rewards.
  2. Child can list active rewards from their own family.
  3. Child can redeem a reward when wallet balance is sufficient.
  4. System blocks redemption when balance is insufficient.
  5. Successful redemption debits wallet and writes `RewardRedemption` plus `CoinTransaction`.
  6. Tests cover sufficient balance, insufficient balance, debit, and ledger consistency.
  7. Swagger/OpenAPI exposes reward, redemption, and wallet statement endpoints implemented in this phase.

**Plans**: 3 plans

Plans:

- [x] 03-01: Reward model, migrations, responsible CRUD endpoints
- [x] 03-02: Wallet debit service, transaction history, reward-redemption ledger support
- [x] 03-03: Reward redemption endpoint, status handling, insufficient-balance tests

### Phase 4: Mobile base

**Goal**: Expo mobile foundation can authenticate against the backend and provide the shared navigation/API structure for both user flows.
**Depends on**: Phase 3
**Requirements**: MOBL-01, MOBL-02, AUTH-02, AUTH-04
**Success Criteria** (what must be TRUE):

  1. Expo TypeScript app runs from `mobile/`.
  2. React Navigation defines auth, responsible, and child navigation areas.
  3. API client can call the backend and persist/use auth token/session.
  4. Login/access flow reaches a post-login landing area.
  5. PT-BR interface baseline is established.
  6. Mobile design foundation follows `docs/design/mobile-design-contract.md`; Stitch screenshots may guide visuals, but `code.html` exports are not copied.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 04-01: Expo app scaffold, TypeScript, lint/basic structure

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02: API client, environment configuration, auth storage, session state
- [x] 04-03: Visual tokens and base components

**Wave 3** *(blocked on 04-02 and 04-03 completion)*

- [x] 04-04: Navigation, login/access screens, family hub, and mode stubs

### Phase 5: Fluxo da criança

**Goal**: Child can demonstrate the core mission and reward loop on mobile using the real API.
**Depends on**: Phase 4
**Requirements**: MOBL-04, MOBL-05, MISS-04, MISS-05, REWD-03, REWD-04, REWD-05, WALT-01
**Success Criteria** (what must be TRUE):

  1. Child can select/access their profile.
  2. Child home shows balance and pending missions.
  3. Child can complete a mission and receive clear feedback.
  4. Child can browse rewards and redeem with sufficient balance.
  5. Child sees an understandable PT-BR message for insufficient balance.
  6. Screens consume backend data rather than mock-only state.
  7. Child screens follow `docs/design/mobile-design-contract.md` and the Phase 5 references in `docs/design/phase-design-map.md`.

**Plans**: 4 plans

Plans:

**Wave 1**

- [x] 05-01-PLAN.md — Child API contracts, service layer, bottom-tabs dependency, and service tests

**Wave 2** *(blocked on 05-01 completion)*

- [x] 05-02-PLAN.md — Child profile selection, tabs shell, home/profile, wallet balance, and pending missions

**Wave 3** *(blocked on 05-02 completion)*

- [ ] 05-03-PLAN.md — Missions list, detail, completion, backend-tied feedback, and mission tests

**Wave 4** *(blocked on 05-03 completion)*

- [ ] 05-04-PLAN.md — Rewards catalog, confirmation, redemption, insufficient balance, final validation, and manual smoke

### Phase 6: Fluxo do responsável

**Goal**: Responsible adult can manage family data and observe progress from the mobile app.
**Depends on**: Phase 5
**Requirements**: MOBL-03, DASH-01, DASH-02, DASH-03, DASH-04, CHLD-03, MISS-01, MISS-03, MISS-08, MISS-09, REWD-01
**Success Criteria** (what must be TRUE):

  1. Responsible dashboard shows children, balances, mission states, approvals, and recent redemptions.
  2. Responsible adult can create/edit/deactivate children from mobile.
  3. Responsible adult can create/edit/deactivate missions and assign them to children.
  4. Responsible adult can approve or reject mission completions.
  5. Responsible adult can create/edit/deactivate rewards.
  6. Responsible screens follow `docs/design/mobile-design-contract.md` and the Phase 6 references in `docs/design/phase-design-map.md`.

**Plans**: 4 plans

Plans:

- [ ] 06-01: Responsible dashboard and child detail
- [ ] 06-02: Children management screens
- [ ] 06-03: Mission management, assignment, and approval queue
- [ ] 06-04: Reward management screens

### Phase 7: Polimento para demonstração do TCC

**Goal**: The MVP is demo-ready with repeatable data, documentation, visual polish, and final verification.
**Depends on**: Phase 6
**Requirements**: DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):

  1. Demo data or seed instructions create a responsible user, family, children, missions, rewards, and history.
  2. README explains how to run backend, mobile, and database locally.
  3. Docs describe architecture, data model, API contract, and test strategy.
  4. TCC presentation script walks through the complete MVP flow.
  5. Final tests pass and demo flow works against the real API.
  6. Final mobile polish verifies all implemented screens against `docs/design/mobile-design-contract.md` and the Stitch visual references mapped in `docs/design/phase-design-map.md`.

**Plans**: 3 plans

Plans:

- [ ] 07-01: Demo seeds/data and final visual polish
- [ ] 07-02: README, architecture docs, API/data model docs, presentation script
- [ ] 07-03: Final test pass and demo rehearsal fixes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação do backend | 4/4 | Complete | 2026-05-27 |
| 2. Domínio de missões e moedas | 4/4 | Complete   | 2026-05-30 |
| 3. Recompensas e resgates | 3/3 | Complete    | 2026-06-01 |
| 4. Mobile base | 4/4 | Complete   | 2026-06-01 |
| 5. Fluxo da criança | 2/4 | In Progress|  |
| 6. Fluxo do responsável | 0/4 | Not started | - |
| 7. Polimento para demonstração do TCC | 0/3 | Not started | - |
