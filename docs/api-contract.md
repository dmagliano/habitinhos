# Initial REST API Contract

Base format is JSON over REST. Endpoint names may be refined during planning, but MVP should preserve clarity over cleverness.

## OpenAPI/Swagger

The backend uses springdoc OpenAPI. Every backend phase that adds REST endpoints must expose those endpoints in `/v3/api-docs` and make them testable from Swagger UI at `/swagger-ui.html`.

Protected endpoints use Bearer JWT authorization. Manual endpoint testing flow:

1. Register or log in through `/auth/register` or `/auth/login`.
2. Copy the returned `token`.
3. Use Swagger UI's authorize action with `Bearer <token>`.
4. Test protected endpoints from the same documented contract.

## Phase 1 Boundary

Phase 1 implements only auth, `/me`, and children endpoints. Mission, reward, wallet statement, dashboard, and mobile-specific flows are documented for later phases and must not be implemented during backend foundation.

## Auth

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register` | Create responsible user and family unit from responsible name, email, password, and family name |
| POST | `/auth/login` | Authenticate responsible user by email/password and return JWT |
| GET | `/me` | Return authenticated user and family context |

## Children

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/children` | Create child and wallet |
| GET | `/children` | List family children |
| GET | `/children/{id}` | Get child |
| PUT | `/children/{id}` | Update child |
| PATCH | `/children/{id}/deactivate` | Soft deactivate child |

Phase 1 child endpoints are responsible-only. Children are not authenticatable `User` records in this phase.

## Missions

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/missions` | Create mission |
| GET | `/missions` | List missions |
| GET | `/missions/{id}` | Get mission |
| PUT | `/missions/{id}` | Update mission |
| PATCH | `/missions/{id}/deactivate` | Soft deactivate mission |
| POST | `/missions/{id}/assign` | Assign mission to one or more children |

`recurrenceType` accepts `ONCE`, `DAILY`, `WEEKLY`, and `CUSTOM`; the MVP mobile
UI exposes only `ONCE`, `DAILY`, and `WEEKLY`. For recurring missions, the next
pending occurrence is created after automatic mission credit or responsible
approval. There is no background scheduler in the MVP.

## Assigned Missions

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/children/{childId}/missions` | List child assigned missions |
| GET | `/assigned-missions/pending-approval` | List missions awaiting responsible approval |
| POST | `/assigned-missions/{id}/complete` | Child marks assigned mission complete |
| POST | `/assigned-missions/{id}/approve` | Responsible approves mission |
| POST | `/assigned-missions/{id}/reject` | Responsible rejects mission |

Assigned mission responses include snapshot fields from the assignment moment:
`snapshotTitle`, `snapshotDescription`, `snapshotCoinValue`,
`snapshotRequiresApproval`, and `snapshotRecurrenceType`.

Reject request body:

```json
{
  "reason": "Faltou guardar os carrinhos",
  "returnToPending": true
}
```

When `returnToPending` is `true`, the assignment returns to `PENDING` without
crediting coins and keeps `rejectionReason` visible to the child. When omitted
or `false`, the assignment remains `REJECTED`.

## Rewards

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/rewards` | Create reward |
| GET | `/rewards` | List rewards |
| GET | `/rewards/{id}` | Get reward |
| PUT | `/rewards/{id}` | Update reward |
| PATCH | `/rewards/{id}/deactivate` | Soft deactivate reward |

## Reward Redemptions

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/children/{childId}/reward-redemptions` | Redeem reward for child |
| GET | `/children/{childId}/reward-redemptions` | List child redemptions |

## Wallet

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/children/{childId}/wallet` | Get child balance |
| GET | `/children/{childId}/wallet/transactions` | List child coin transactions |

## Dashboard

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/responsible` | Responsible dashboard summary |

## Error Shape

Use a simple structured error body:

```json
{
  "code": "INSUFFICIENT_BALANCE",
  "message": "Saldo insuficiente para resgatar esta recompensa.",
  "details": {}
}
```

Keep user-facing messages PT-BR where returned directly to mobile; keep internal codes stable and English.
