---
phase: 01-fundacao-backend
created: 2026-05-26
status: complete
---

# Phase 1 Patterns

## Existing Codebase Pattern Map

This repository is currently greenfield for application code. There are no existing backend controllers, services, entities, repositories, tests, or mobile screens to mirror.

## Patterns to Establish

### Backend Package Boundary

Use `br.com.habitinhos` as the root package and keep the first backend modules domain-oriented:

- `auth`
- `family`
- `children`
- `wallet`
- `shared`
- `config`

### Layering

Within each module, use simple Spring layers:

- `*Controller` for REST endpoints.
- `*Service` for transactions and business rules.
- `*Repository` for Spring Data access.
- DTO records for request/response shapes.
- Entities limited to persistence state, not HTTP concerns.

### Tenant Isolation

Use explicit family-scoped methods as the default pattern:

- Controllers derive `CurrentUser`.
- Services receive `CurrentUser`.
- Repositories query by `id` and `familyUnitId`.
- Cross-family record access is handled as not found.

### Testing

Use integration tests for behavior that crosses HTTP, security, persistence, and tenant boundaries. Unit tests are optional in Phase 1 unless a pure domain rule becomes non-trivial.

