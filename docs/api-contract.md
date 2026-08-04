# Initial REST API Contract

Base format is JSON over REST. Endpoint names may be refined during planning, but MVP should preserve clarity over cleverness.

## OpenAPI/Swagger

The backend uses springdoc OpenAPI. Every backend phase that adds REST endpoints must expose those endpoints in `/v3/api-docs` and make them testable from Swagger UI at `/swagger-ui.html`.

Protected endpoints use Bearer JWT authorization. Manual endpoint testing flow:

1. Register or log in through `/auth/register` or `/auth/login`.
2. Copy the returned `token`.
3. Use Swagger UI's authorize action with `Bearer <token>`.
4. Test protected endpoints from the same documented contract.

## Auth

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register` | Create responsible user and family unit from responsible name, email, password, and family name |
| POST | `/auth/login` | Authenticate responsible user by email/password and return JWT |
| POST | `/auth/password-reset/request` | Accept email and issue password reset instructions without revealing whether the email exists |
| POST | `/auth/password-reset/confirm` | Confirm password reset token and save a new password |
| POST | `/auth/responsible-pin/verify` | Verify the current responsible PIN for the authenticated user |
| POST | `/auth/responsible-pin/reset/request` | Issue responsible PIN reset instructions after password verification |
| POST | `/auth/responsible-pin/reset/confirm` | Confirm responsible PIN reset token and save a new PIN |
| POST | `/auth/account-deletion/request` | Issue account deletion confirmation instructions after password verification |
| POST | `/auth/account-deletion/confirm` | Confirm account deletion token and deactivate the responsible account and family unit |
| GET | `/me` | Return authenticated user and family context |

Password reset request is public. Responsible PIN and account deletion endpoints are protected and require Bearer JWT authorization. Reset codes may be delivered by Resend or logged locally when `RESEND_API_KEY` is absent.

Registration rejects an email only when the same normalized email already belongs to an active account, returning `EMAIL_ALREADY_REGISTERED`. If the email exists only on inactive historical rows, registration creates a fresh responsible user and family unit with new ids. Login and password reset lookup only active accounts; inactive-only email behaves like an invalid or unknown account, and password reset remains enumeration-safe by accepting the request without sending reset instructions.

## Children

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/children` | Create child and wallet |
| GET | `/children` | List family children |
| GET | `/children/{id}` | Get child |
| PUT | `/children/{id}` | Update child |
| PATCH | `/children/{id}/deactivate` | Soft deactivate child |

Child endpoints are family-scoped. Children are `ChildProfile` records and are not authenticatable `AppUser` records in the MVP.

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
UI exposes only `ONCE`, `DAILY`, and `WEEKLY`. `completionWindowDays` defines
how many days the child has to complete each recurring occurrence. For recurring
missions, a null assignment `dueDate` schedules the first occurrence for today
and sets `dueDate = scheduledDate + completionWindowDays`.

Recurring missions create the next occurrence after automatic mission credit or
responsible approval. They also guarantee a current occurrence when the child
mission list is loaded and the previous pending occurrence has expired without
completion. There is no background scheduler in the MVP.

## Assigned Missions

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/children/{childId}/missions` | List child assigned missions |
| GET | `/assigned-missions/pending-approval` | List missions awaiting responsible approval |
| POST | `/assigned-missions/{id}/complete` | Child marks assigned mission complete |
| POST | `/assigned-missions/{id}/approve` | Responsible approves mission |
| POST | `/assigned-missions/{id}/reject` | Responsible rejects mission |

`GET /children/{childId}/missions` returns only visible pending assignments for
the child. Assignments with no `dueDate` remain visible; assignments due today
or in the future remain visible; assignments with `dueDate` before the current
date are omitted from the child list without changing their stored status.

Assigned mission responses include `scheduledDate`, optional `dueDate`, and
snapshot fields from the assignment moment: `snapshotTitle`,
`snapshotDescription`, `snapshotCoinValue`, `snapshotRequiresApproval`,
`snapshotRecurrenceType`, and `snapshotCompletionWindowDays`.

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
| POST | `/rewards/{id}/redeem` | Redeem reward for the `childId` supplied in the request body |
| PATCH | `/reward-redemptions/{id}/delivered` | Mark a redeemed reward as delivered |

Redeem request body:

```json
{
  "childId": "00000000-0000-0000-0000-000000000000"
}
```

The response includes `rewardId`, `childId`, `walletId`, `status`, `snapshotTitle`,
`snapshotCost`, `coinTransactionId`, `deliveredAt`, `createdAt`, and `updatedAt`.

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
