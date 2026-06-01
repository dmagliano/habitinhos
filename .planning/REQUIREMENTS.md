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

### Children

- [x] **CHLD-01**: Responsible adult can create a child profile without requiring child email.
- [x] **CHLD-02**: System creates a wallet automatically when a child is created.
- [x] **CHLD-03**: Responsible adult can list, view, edit, and deactivate children in the family.
- [x] **CHLD-04**: Child profile supports optional avatar key and optional hashed access PIN.

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

### Responsible Dashboard

- [ ] **DASH-01**: Responsible dashboard lists children in the family.
- [ ] **DASH-02**: Dashboard shows balance by child.
- [ ] **DASH-03**: Dashboard shows pending, awaiting approval, and completed missions.
- [ ] **DASH-04**: Dashboard shows recent reward redemptions.

### Mobile App

- [ ] **MOBL-01**: Mobile app is created with Expo, React Native, TypeScript, and React Navigation.
- [ ] **MOBL-02**: Mobile app has PT-BR screens and English technical names in code.
- [ ] **MOBL-03**: Responsible flow includes login, family onboarding, dashboard, children, missions, assignments, approvals, rewards, and child details.
- [ ] **MOBL-04**: Child flow includes profile selection/access, home with balance, missions, completion feedback, reward catalog, redemption feedback, and insufficient balance message.
- [ ] **MOBL-05**: Mobile app consumes the real backend API for the demo flow.
- [ ] **MOBL-06**: Mobile screens from Phase 4 onward follow `docs/design/mobile-design-contract.md`, use `docs/design/phase-design-map.md` for visual references, and do not copy Stitch HTML/CSS exports.

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
| CHLD-01..CHLD-04 | Phase 1 | Complete |
| DOCS-01 | Phases 1, 2, 3 | Complete |
| MISS-01..MISS-09 | Phase 2 | Complete |
| WALT-01, WALT-02, WALT-04, WALT-06 | Phase 2 | Complete |
| REWD-01..REWD-06 | Phase 3 | Complete |
| WALT-03, WALT-05 | Phase 3 | Complete |
| MOBL-01, MOBL-02 | Phase 4 | Pending |
| AUTH-02, AUTH-04 | Phase 4 | Pending |
| MOBL-04, MOBL-05 | Phase 5 | Pending |
| CHLD-03, MISS-04..MISS-05, REWD-03..REWD-05, WALT-01 | Phase 5 | Pending |
| MOBL-03, DASH-01..DASH-04 | Phase 6 | Pending |
| MOBL-06 | Phases 4, 5, 6, 7 | Pending |
| DOCS-02..DOCS-04 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-05-26*
*Last updated: 2026-05-27 after adding Swagger/OpenAPI as a backend-phase requirement*
