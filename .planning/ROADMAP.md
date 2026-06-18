# Roadmap: Habitinhos

## Overview

Habitinhos will be built as a monorepo MVP in seven phases: backend foundation, mission/coin domain, reward redemption, mobile base, child flow, responsible flow, and TCC demo polish. Backend phases come first because family isolation, wallet integrity, and coin history are the core guarantees the mobile app depends on.

## Phases

- [x] **Phase 1: Fundação do backend** - Create Spring Boot backend foundation, PostgreSQL/Flyway setup, authentication, family isolation, children, wallets, and baseline tests.
- [x] **Phase 2: Domínio de missões e moedas** - Implement missions, assignments, completion, approval/rejection, coin credits, ledger transactions, and transactional tests. (completed 2026-05-30)
- [x] **Phase 3: Recompensas e resgates** - Implement rewards, redemptions, sufficient-balance validation, coin debits, ledger transactions, and balance tests. (completed 2026-06-01)
- [x] **Phase 4: Mobile base** - Create Expo app foundation, navigation, API client, login flow, and base visual structure. (completed 2026-06-01)
- [x] **Phase 5: Fluxo da criança** - Build child home, balance, missions, completion feedback, rewards catalog, and redemption flow. (completed 2026-06-02)
- [x] **Phase 6: Fluxo do responsável** - Build dashboard, children, missions, assignments, rewards, approvals, and child detail views. (completed 2026-06-03)
- [x] **Phase 06.1: Ajustes pós-UAT dos fluxos de entrada, troca de modo e entrega de resgates** - Refine unauthenticated entry, login/register/session persistence, child-first mode switching, dashboard links, and delivered reward redemptions. (INSERTED) (completed 2026-06-03)
- [x] **Phase 06.2: Ajustes pós-UAT de cadastro, seletor de crianças e navegação responsável** - Remove registration stale-session copy, clarify child creation copy, eliminate entry-mode selection, add family-management access from child selector, and add responsible-home return to children. (INSERTED) (completed 2026-06-04)
- [x] **Phase 06.3: Recuperação de acesso e exclusão de conta** - Add password reset by email, responsible PIN reset by email, and deliberate account deletion from API through mobile UI. (INSERTED) (completed 2026-06-08)
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

- [x] 05-03-PLAN.md — Missions list, detail, completion, backend-tied feedback, and mission tests

**Wave 4** *(blocked on 05-03 completion)*

- [x] 05-04-PLAN.md — Rewards catalog, confirmation, redemption, insufficient balance, final validation, and manual smoke

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
**Wave 1**

- [x] 06-01: Responsible dashboard and child detail

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-02: Children management screens

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 06-03: Mission management, assignment, and approval queue

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 06-04: Reward management screens

### Phase 06.1: Ajustes pós-UAT dos fluxos de entrada, troca de modo e entrega de resgates (INSERTED)

**Goal:** The post-Phase-6 app entry and family-mode flow are demo-ready, with opt-in session persistence, direct child-mode access, responsible management switching, actionable dashboard links, and delivered reward-redemption tracking.
**Requirements**: AUTH-07, MOBL-05, MOBL-06, MOBL-07, DASH-05, REWD-07
**Depends on:** Phase 6
**Success Criteria** (what must be TRUE):

  1. When unauthenticated, the app shows a welcome entry with clear Login and Registro options instead of opening directly into a login-only form.
  2. Login and registration are both available from the mobile entry flow and consume the real backend auth endpoints.
  3. The login flow includes an explicit "mantenha-me conectado" option, and token persistence follows that choice.
  4. After entering child mode, the app no longer shows the mandatory "Sou responsável" / "Sou criança" hub; the child profile exposes a "Gerenciar família" action to enter responsible management.
  5. The responsible area exposes a clear "Voltar para o modo criança" path when a child context is known.
  6. The dashboard approval card opens the pending approvals screen, and the recent-redemptions metric/card opens or scrolls to recent redemptions.
  7. Recent redemption cards show an "Entregue" checkbox; marking it persists the delivered state, greys the card text, and displays `Entregue em: {data}`.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**

- [x] 06.1-01: Entrada deslogada, registro e manter sessao conectado

**Wave 2** *(blocked on 06.1-01 completion)*

- [x] 06.1-02: Troca de modo child-first e atalhos do dashboard

**Wave 3** *(blocked on 06.1-02 completion)*

- [x] 06.1-03: Persistencia e UI de entrega de resgates

### Phase 06.2: Ajustes pós-UAT de cadastro, seletor de crianças e navegação responsável (INSERTED)

**Goal:** The post-login mobile flow is direct and demo-ready: registration does not show stale session-recovery copy, children management uses clearer create-child wording, the intermediate entry-mode screen is removed from normal navigation, the child selector can open family management, and the responsible home can return to the children selector.
**Requirements**: AUTH-08, CHLD-05, MOBL-06, MOBL-08
**Depends on:** Phase 06.1
**Success Criteria** (what must be TRUE):

  1. The registration screen never displays "Sua sessão terminou. Entre novamente para continuar." or other expired-session recovery copy.
  2. Children management primary create actions say "Cadastrar criança" instead of "Nova criança".
  3. The "Escolha como quer entrar" screen is removed from the normal post-login app flow.
  4. The child selector screen ("Quem vai brincar agora?") shows a clear "Gerenciar família" action that opens the responsible area.
  5. The responsible home screen shows a clear "Retornar às crianças" action that returns to the standard child selector.
  6. Existing child-first login/register behavior, responsible tabs, and child profile navigation keep working.
  7. Relevant navigation/copy tests, TypeScript, and lint pass.

**Plans:** 1/1 plans complete

Plans:
**Wave 1**

- [x] 06.2-01: Ajustes de copy e navegação pós-UAT

### Phase 06.3: Recuperação de acesso e exclusão de conta (INSERTED)

**Goal:** Responsible adults can recover password access by email, recover the responsible PIN by email after password verification, and delete/deactivate their account through a deliberate mobile flow before the final TCC demo polish.
**Requirements**: AUTH-09, AUTH-10, AUTH-11, MOBL-05, MOBL-06, DOCS-01
**Depends on:** Phase 06.2
**Success Criteria** (what must be TRUE):

  1. Password login screen exposes `Esqueci minha senha` and routes to a reset request flow.
  2. Password reset request returns enumeration-safe feedback and sends recovery email when the account exists.
  3. Password reset confirmation accepts emailed code/token plus new password and allows login with the new password.
  4. Responsible PIN prompt exposes `Esqueci meu PIN` and routes to a PIN reset request flow for authenticated responsible users.
  5. PIN reset request verifies the responsible password before sending an emailed PIN recovery code/token.
  6. PIN reset confirmation accepts emailed code/token plus a new 4-digit PIN and allows responsible management with the new PIN.
  7. Account deletion/deactivation is available from the responsible profile/settings area, requires deliberate confirmation, invalidates future login, and preserves historical family data consistently with existing soft-deactivation patterns.
  8. OpenAPI/Swagger, backend integration tests, mobile service tests, navigation tests, and focused UI tests cover the new flows.

**Plans:** 2/2 plans complete

Plans:
**Wave 1**

- [x] 06.3-01: Backend reset/delete endpoints, token lifecycle, email delivery integration, OpenAPI, and integration tests

**Wave 2** *(blocked on 06.3-01 completion)*

- [x] 06.3-02: Mobile recovery/delete UI, navigation, service wiring, feedback states, and focused tests

### Phase 7: Polimento para demonstração do TCC

**Goal**: The MVP is demo-ready with repeatable data, documentation, visual polish, and final verification.
**Depends on**: Phase 06.3
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
**Wave 1**

- [x] 07-01: Demo seeds/data and final visual polish

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02: README, architecture docs, API/data model docs, presentation script

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 07-03: Final test pass and demo rehearsal fixes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 06.1 → 06.2 → 06.3 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação do backend | 4/4 | Complete | 2026-05-27 |
| 2. Domínio de missões e moedas | 4/4 | Complete   | 2026-05-30 |
| 3. Recompensas e resgates | 3/3 | Complete    | 2026-06-01 |
| 4. Mobile base | 4/4 | Complete   | 2026-06-01 |
| 5. Fluxo da criança | 4/4 | Complete   | 2026-06-02 |
| 6. Fluxo do responsável | 4/4 | Complete | 2026-06-03 |
| 06.1 Ajustes pós-UAT dos fluxos de entrada, troca de modo e entrega de resgates | 3/3 | Complete    | 2026-06-03 |
| 06.2 Ajustes pós-UAT de cadastro, seletor de crianças e navegação responsável | 1/1 | Complete    | 2026-06-04 |
| 06.3 Recuperação de acesso e exclusão de conta | 2/2 | Complete | 2026-06-08 |
| 7. Polimento para demonstração do TCC | 2/3 | In Progress|  |
