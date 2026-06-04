# Requirements: Habitinhos

**Defined:** 2026-05-26
**Core Value:** The complete family flow must work end to end with family isolation, wallet integrity, and coin history.

## v1 Requirements

### Authentication and Family

- [x] **AUTH-01**: Responsible adult can create an account with name, email, and password.
- [x] **AUTH-02**: Responsible adult can log in and receive an authenticated session/token.
- [x] **AUTH-03**: System creates or associates a `FamilyUnit` for the responsible adult.
- [x] **AUTH-04**: Authenticated responsible adult can retrieve `/me` with user and family context.
- [x] **AUTH-05**: Backend derives `familyUnitId` from authentication context for protected operations.
- [x] **AUTH-06**: Users from one family cannot access data from another family.
- [x] **AUTH-07**: Mobile unauthenticated entry shows a welcome screen with login and registration options, and session persistence is controlled by an explicit "mantenha-me conectado" choice.
- [ ] **AUTH-08**: Mobile registration screen does not show expired-session or login-only recovery messages; it only shows registration fields, actions, and registration-specific errors.

### Children

- [x] **CHLD-01**: Responsible adult can create a child profile without requiring child email.
- [x] **CHLD-02**: System creates a wallet automatically when a child is created.
- [x] **CHLD-03**: Responsible adult can list, view, edit, and deactivate children in the family.
- [x] **CHLD-04**: Child profile supports optional avatar key and optional hashed access PIN.
- [ ] **CHLD-05**: Responsible children management uses clear PT-BR copy for child creation, including "Cadastrar criança" as the primary create action.

### Missions

- [x] **MISS-01**: Responsible adult can create, edit, list, view, and deactivate missions.
- [x] **MISS-02**: Mission coin value must be a positive integer.
- [x] **MISS-03**: Responsible adult can assign a mission to one or more children.
- [x] **MISS-04**: Child can list only their own assigned pending missions.
- [x] **MISS-05**: Child can mark their own assigned mission as completed.
- [x] **MISS-06**: Mission without approval credits coins automatically on completion.
- [x] **MISS-07**: Mission requiring approval moves to `AWAITING_APPROVAL` after child completion.
- [x] **MISS-08**: Responsible adult can approve awaiting mission completion.
- [x] **MISS-09**: Responsible adult can reject awaiting mission completion with an optional reason.

### Wallet and Coins

- [x] **WALT-01**: Child wallet exposes current balance.
- [x] **WALT-02**: Mission approval or auto-completion credits the child wallet transactionally.
- [x] **WALT-03**: Reward redemption debits the child wallet transactionally.
- [x] **WALT-04**: Every credit, debit, or adjustment creates a `CoinTransaction`.
- [x] **WALT-05**: Child wallet transaction history can be listed as a simple statement.
- [x] **WALT-06**: Balance-changing operations are atomic and safe from partial updates.

### Rewards

- [x] **REWD-01**: Responsible adult can create, edit, list, view, and deactivate rewards.
- [x] **REWD-02**: Reward cost must be a positive integer.
- [x] **REWD-03**: Child can list active rewards from their family.
- [x] **REWD-04**: Child can redeem a reward when balance is sufficient.
- [x] **REWD-05**: System blocks reward redemption when balance is insufficient.
- [x] **REWD-06**: Successful MVP redemption can be recorded directly as `REDEEMED`.
- [x] **REWD-07**: Responsible adult can mark a redeemed reward as delivered, preserving a delivered timestamp in the redemption history.

### Responsible Dashboard

- [x] **DASH-01**: Responsible dashboard lists children in the family.
- [x] **DASH-02**: Dashboard shows balance by child.
- [x] **DASH-03**: Dashboard shows pending, awaiting approval, and completed missions.
- [x] **DASH-04**: Dashboard shows recent reward redemptions.
- [x] **DASH-05**: Responsible dashboard approval and recent-redemption affordances navigate to the corresponding actionable screen or section.

### Mobile App

- [x] **MOBL-01**: Mobile app is created with Expo, React Native, TypeScript, and React Navigation.
- [x] **MOBL-02**: Mobile app has PT-BR screens and English technical names in code.
- [x] **MOBL-03**: Responsible flow includes login, family onboarding, dashboard, children, missions, assignments, approvals, rewards, and child details.
- [ ] **MOBL-04**: Child flow includes profile selection/access, home with balance, missions, completion feedback, reward catalog, redemption feedback, and insufficient balance message.
- [x] **MOBL-05**: Mobile app consumes the real backend API for the demo flow.
- [x] **MOBL-06**: Mobile screens from Phase 4 onward follow `docs/design/mobile-design-contract.md`, use `docs/design/phase-design-map.md` for visual references, and do not copy Stitch HTML/CSS exports.
- [x] **MOBL-07**: Authenticated entry can open directly into the child flow without a mandatory "sou responsável/sou criança" hub, while the child profile exposes "Gerenciar família" and the responsible area exposes a clear return path to child mode.
- [ ] **MOBL-08**: Mobile navigation removes the intermediate entry-mode selection screen from the normal flow; child selector exposes "Gerenciar família", and responsible home exposes "Retornar às crianças".

### Documentation and Demo

- [x] **DOCS-01**: Backend endpoints implemented in each backend phase are exposed through OpenAPI/Swagger and can be inspected/tested from Swagger UI.
- [ ] **DOCS-02**: `docs/` contains architecture, data model, API contract, and testing strategy.
- [ ] **DOCS-03**: README explains local setup for backend, mobile, PostgreSQL, and demo flow.
- [ ] **DOCS-04**: Demo seeds or documented setup steps create a repeatable TCC scenario.

## v2 Requirements

### Deferred Product Capabilities

- **FUTR-01**: Subscription and real SaaS billing.
- **FUTR-02**: Push notifications beyond simple MVP feedback.
- **FUTR-03**: Advanced reports and analytics.
- **FUTR-04**: Separate web admin panel.
- **FUTR-05**: AI suggestions for missions.
- **FUTR-06**: Multi-language UI.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real payments | Not needed for MVP/TCC and adds compliance/product complexity |
| Public ranking | Could expose children/family comparisons and is not core to task flow |
| Chat or social network | New product domain outside mission/reward loop |
| Marketplace | Requires commercial model and moderation outside MVP |
| Production-grade deployment | MVP needs local/demo reliability first |
| Complex push notifications | Backend/mobile flow can be demonstrated without them |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01..AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 06.1 | Complete |
| AUTH-08 | Phase 06.2 | Pending |
| CHLD-01..CHLD-04 | Phase 1 | Complete |
| CHLD-05 | Phase 06.2 | Pending |
| DOCS-01 | Phases 1, 2, 3 | Complete |
| MISS-01..MISS-09 | Phase 2 | Complete |
| WALT-01, WALT-02, WALT-04, WALT-06 | Phase 2 | Complete |
| REWD-01..REWD-06 | Phase 3 | Complete |
| REWD-07 | Phase 06.1 | Complete |
| WALT-03, WALT-05 | Phase 3 | Complete |
| MOBL-01, MOBL-02 | Phase 4 | Complete |
| AUTH-02, AUTH-04 | Phase 4 | Complete |
| MOBL-04, MOBL-05 | Phase 5 | Pending |
| CHLD-03, MISS-04..MISS-05, REWD-03..REWD-05, WALT-01 | Phase 5 | Pending |
| MOBL-03, DASH-01..DASH-04 | Phase 6 | Complete |
| DASH-05 | Phase 06.1 | Complete |
| MOBL-06 | Phases 4, 5, 6, 06.1, 7 | Complete |
| MOBL-07 | Phase 06.1 | Complete |
| MOBL-08 | Phase 06.2 | Pending |
| DOCS-02..DOCS-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

---
*Requirements defined: 2026-05-26*
*Last updated: 2026-06-03 after completing the responsible mobile flow*
