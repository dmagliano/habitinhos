# Habitinhos Architecture

## System Shape

Habitinhos is a monorepo with two runtime applications:

- `backend/` — Spring Boot REST API and source of truth.
- `mobile/` — Expo React Native app for responsible and child flows.

Supporting files:

- `docs/` — architecture, data model, API contract, testing strategy, decisions.
- `.planning/` — GSD planning artifacts.
- `docker-compose.yml` — local PostgreSQL for backend development.

## Backend Responsibilities

The backend owns:

- Authentication and authorization.
- Family tenant isolation.
- Mission rules and status transitions.
- Mission approval/rejection.
- Wallet balance.
- Coin credits and debits.
- Reward redemption.
- Audit/history through `CoinTransaction`.

The backend must validate critical rules even when the mobile app also performs UX validation.

## Mobile Responsibilities

The mobile app owns:

- Screens and navigation.
- Responsible and child user experiences.
- Forms and client-side validation for usability.
- Positive feedback for children.
- REST API consumption.
- PT-BR interface text.

## Tenant Boundary

`FamilyUnit` is the tenant. Backend services derive tenant context from the authenticated responsible user and apply it to queries and commands. Client-supplied `familyUnitId` must not be trusted for authorization.

## Suggested Backend Package Structure

```text
backend/src/main/java/.../habitinhos/
  auth/
  family/
  children/
  wallet/
  shared/
  config/
```

Each domain package should keep controller, DTO, service, repository, and entity classes close enough to stay readable without creating a heavy architecture framework.

Phase 1 should create only `auth`, `family`, `children`, `wallet`, `shared`, and configuration/security support. Later phases add `missions`, `rewards`, and `dashboard` when their roadmap scope starts.

## Suggested Mobile Structure

```text
mobile/src/
  app/
  navigation/
  api/
  features/
    auth/
    responsible/
    child/
  components/
  theme/
  storage/
```

Use simple feature folders and avoid premature state-management complexity. Add a state library only if API/cache needs justify it during planning.
