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
| email | Unique login identifier, likely globally unique |
| role | `RESPONSIBLE`; `ADMIN` reserved for future |
| passwordHash | Hashed password only |
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
| dueDate | Optional due date |
| completedAt | Completion timestamp |
| approvedAt | Approval timestamp |
| rejectedAt | Rejection timestamp |
| rejectionReason | Optional rejection note |
| coinsCredited | Amount credited when completed/approved |
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
| costInCoins | Positive integer |
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
| childId | Child requester |
| rewardId | Reward reference |
| costInCoins | Cost snapshot at redemption time |
| status | `REQUESTED`, `REDEEMED`, `FULFILLED`, `CANCELLED` |
| requestedAt | Request timestamp |
| fulfilledAt | Future use |
| cancelledAt | Future use |
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

## Integrity Rules

- Every family-scoped entity stores `familyUnitId`.
- All wallet balance changes happen through transactional services.
- Every credit/debit writes a matching `CoinTransaction`.
- Mission/reward deactivation preserves historical rows.
- Coin values and costs are positive integers.
- Backend checks relationships belong to the same family before mutating data.
