# Initial Data Model

## Entities

### FamilyUnit

Represents the family/tenant.

| Field | Notes |
|-------|-------|
| id | Primary key |
| name | Family display name |
| active | Soft activation flag |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### User

Authenticatable user, initially responsible adults.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| name | Display name |
| email | Login identifier; normalized email is unique among active users, while inactive historical accounts may retain the same email for a future registration |
| role | `RESPONSIBLE`; `ADMIN` reserved for future |
| passwordHash | Hashed password only |
| responsiblePinHash | Hashed 4-digit responsible PIN used to enter responsible mode |
| active | Soft activation flag |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### ChildProfile

Child profile inside a family. Children do not need email for MVP.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| name | Child display name |
| age | Optional age for display/context |
| avatarKey | Optional avatar identifier |
| accessPinHash | Optional hashed child PIN |
| active | Soft activation flag |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### Wallet

Coin balance for a child.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| childId | Child owner; one wallet per child |
| balance | Integer balance, starts at zero |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### Mission

Mission/task template created by a responsible adult.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| title | Required title |
| description | Optional detail |
| coinValue | Positive integer |
| recurrenceType | `ONCE`, `DAILY`, `WEEKLY`, `CUSTOM` |
| completionWindowDays | Days allowed to complete each recurring occurrence |
| requiresApproval | Whether responsible approval is needed |
| active | Soft activation flag |
| createdByUserId | Responsible creator |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### AssignedMission

Mission assigned to a specific child.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| missionId | Mission reference |
| childId | Child assignee |
| status | `PENDING`, `AWAITING_APPROVAL`, `COMPLETED`, `REJECTED`, `CANCELLED` |
| scheduledDate | Date this occurrence belongs to |
| dueDate | Optional due date; for recurrence, `scheduledDate + snapshotCompletionWindowDays` |
| completedAt | Completion timestamp |
| approvedAt | Approval timestamp |
| rejectedAt | Rejection timestamp |
| rejectionReason | Optional rejection note |
| snapshotTitle | Mission title copied at assignment time |
| snapshotDescription | Mission description copied at assignment time |
| snapshotCoinValue | Coin value copied at assignment time |
| snapshotRequiresApproval | Approval rule copied at assignment time |
| snapshotRecurrenceType | Recurrence rule copied at assignment time |
| snapshotCompletionWindowDays | Completion window copied at assignment time |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### Reward

Reward configured by a responsible adult.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| title | Required title |
| description | Optional detail |
| cost | Positive integer coin cost |
| active | Soft activation flag |
| createdByUserId | Responsible creator |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

### RewardRedemption

Reward redemption by a child.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| rewardId | Reward reference |
| childId | Child requester |
| walletId | Wallet debited for the redemption |
| status | `REDEEMED`, `DELIVERED`, `CANCELLED` |
| snapshotTitle | Reward title copied at redemption time |
| snapshotCost | Reward cost copied at redemption time |
| coinTransactionId | Debit transaction linked after wallet debit |
| deliveredAt | Delivery timestamp when responsible marks as delivered |
| createdAt | Creation timestamp |
| updatedAt | Update timestamp |

For MVP, successful redemption may be written directly as `REDEEMED`.

### CoinTransaction

Ledger entry for wallet operations.

| Field | Notes |
|-------|-------|
| id | Primary key |
| familyUnitId | Tenant reference |
| walletId | Wallet reference |
| childId | Child owner |
| type | `CREDIT`, `DEBIT`, `ADJUSTMENT` |
| amount | Positive integer amount |
| sourceType | `MISSION_COMPLETION`, `REWARD_REDEMPTION`, `MANUAL_ADJUSTMENT` |
| assignedMissionId | Optional source mission assignment |
| rewardRedemptionId | Optional source redemption |
| createdByUserId | Optional responsible/admin actor |
| description | Optional description |
| createdAt | Creation timestamp |

### AuthResetToken

Short-lived token record for account recovery and destructive account actions.

| Field | Notes |
|-------|-------|
| id | Primary key |
| userId | Responsible user receiving the code |
| purpose | `PASSWORD`, `RESPONSIBLE_PIN`, or `ACCOUNT_DELETION` |
| tokenHash | SHA-256 hash of the emailed/logged code, never the raw code |
| expiresAt | Expiration timestamp |
| usedAt | Set when the token is consumed or invalidated |
| createdAt | Creation timestamp |

## Integrity Rules

- Every family-scoped entity stores `familyUnitId`.
- All wallet balance changes happen through transactional services.
- Every credit/debit writes a matching `CoinTransaction`.
- Mission/reward deactivation preserves historical rows.
- Active users have unique normalized email values through a partial unique index on `lower(email)` where `active = true`.
- Account deletion deactivates the responsible user and family unit, invalidates active reset tokens, and preserves historical rows for audit/history.
- Reward delivery updates `RewardRedemption.deliveredAt` without changing the linked coin transaction.
- `auth_reset_tokens` stores only token hashes and supports password-reset, responsible-pin reset, and account-deletion purposes.
- Coin values and costs are positive integers.
- Backend checks relationships belong to the same family before mutating data.
