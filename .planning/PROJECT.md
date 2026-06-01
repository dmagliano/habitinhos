# Habitinhos

## What This Is

Habitinhos is a mobile-first SaaS MVP for organizing children's household tasks with simple coin-based gamification. Each family is an isolated tenant where a responsible adult manages children, missions, rewards, approvals, balances, and history while children use a playful mobile flow to complete missions and redeem rewards.

The product is built as a monorepo with a Java 17 + Spring Boot backend, PostgreSQL persistence, and a React Native + Expo + TypeScript mobile app. The current priority is an executable technical MVP for a TCC demonstration, not the academic rationale around habit formation.

## Core Value

The complete family flow must work end to end: responsible adult creates missions and rewards, child completes missions and redeems rewards, and the backend preserves family isolation, wallet integrity, and coin history.

## Requirements

### Validated

- [x] Phase 1 backend foundation: Spring Boot, PostgreSQL/Flyway, auth, JWT-derived family context, child profiles, automatic wallets, tenant isolation, and OpenAPI baseline.
- [x] Phase 2 mission/coin backend slice: mission CRUD, assignment, child completion, responsible approval/rejection, transactional mission credits, wallet balance endpoint, and OpenAPI coverage.
- [x] Phase 3 backend reward/redemption slice: responsible reward CRUD, active family reward listing, sufficient-balance redemption, insufficient-balance rejection, wallet debit, `RewardRedemption`/`CoinTransaction` linkage, wallet statement, and OpenAPI coverage.

### Active

- [ ] Responsible adult can register/login and work inside an isolated family unit.
- [ ] Responsible adult can create and manage child profiles, each with an automatically created wallet.
- [ ] Responsible adult can create missions, assign them to children, and approve or reject completion when required.
- [ ] Child can view pending missions, complete them, see coin balance, browse rewards, and redeem when balance is sufficient.
- [ ] Backend credits and debits coins transactionally and records every wallet operation in `CoinTransaction`.
- [ ] Responsible adult can view a dashboard with children, balances, mission progress, approvals, and recent redemptions.
- [ ] Mobile app demonstrates the complete MVP flow against the real REST API.
- [ ] Critical backend rules have automated tests.

### Out of Scope

- Real payments and SaaS subscription — not needed for the MVP/TCC demonstration.
- Marketplace, public ranking, chat, social network, or AI-generated missions — new product capabilities outside the core family flow.
- Complex push notifications and advanced reports — useful later, not required to prove the MVP.
- Separate web admin panel — responsible flow lives in the mobile app for MVP.
- Sophisticated production deployment — local/demo readiness is enough initially.
- Multi-language UI — interface is PT-BR only for MVP.

## Context

The backend is the source of truth for authentication, authorization, family isolation, mission rules, approvals, wallet balance, coin credits/debits, reward redemption, and audit history. The mobile app owns screens, navigation, forms, visual feedback, UX validation, and REST API consumption.

Repository shape is a monorepo:

- `backend/` — Java 17, Spring Boot 3.x, REST API, PostgreSQL, Flyway, Spring Security or a simple equivalent, JPA/Hibernate, OpenAPI/Swagger, unit and integration tests.
- `mobile/` — React Native, Expo, TypeScript, React Navigation, PT-BR interface, API client, responsible and child flows.
- `docs/` — technical architecture, data model, API contract, decisions, and testing strategy.
- `.planning/` — GSD planning artifacts.

The MVP must stay simple enough for a TCC demo while preserving the important backend guarantees: tenant isolation, atomic wallet operations, no plaintext passwords/PINs, soft deactivation instead of physical deletion for mission/reward history, and no trust in client-supplied `familyUnitId` when it can be derived from the authenticated user.

## Constraints

- **Monorepo**: Backend, mobile, docs, and planning live in one repository — keeps TCC delivery and cross-stack planning simple.
- **Backend stack**: Java 17, Spring Boot 3.x, PostgreSQL, Flyway, JPA/Hibernate, OpenAPI/Swagger — preferred default unless a later plan documents a strong reason to change.
- **Mobile stack**: React Native + Expo + TypeScript + React Navigation — mobile-first MVP with PT-BR UI and English technical names in code.
- **Security**: Passwords, PINs, and access codes must never be stored in plaintext — protects family and child-related data.
- **Data integrity**: Wallet balance changes must be atomic and must always write a `CoinTransaction` — prevents inconsistent balances.
- **Scope**: Avoid overengineering; choose the simplest option that preserves family isolation, balance integrity, coin history, clear responsible/child flows, and demo readiness.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use one monorepo with `backend/`, `mobile/`, `docs/`, and `.planning/` | Simplifies TCC delivery and keeps backend/mobile phases coordinated | — Pending |
| Treat `FamilyUnit` as the tenant boundary | Every domain entity belongs to a family and must be isolated by backend authorization | — Pending |
| Keep critical rules in the backend even when mobile validates for UX | Backend is the source of truth for money-like coin operations and child/family data | — Pending |
| Use integer coin values only | Avoids decimal money complexity and fits simple gamification | — Pending |
| Preserve history with soft deactivation and ledger records | Demonstration needs auditability for missions, rewards, credits, debits, approvals, and redemptions | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-01 after Phase 3 backend reward/redemption verification*
