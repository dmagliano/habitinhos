# Phase 03 Discussion Log — Recompensas e Resgates

> This document is an audit trail. Items discussed and decided here inform the phase plans.

**Date:** 2026-05-29
**Phase:** 03 — Recompensas e resgates
**Areas Discussed:** Redemption workflow, wallet debit strategy, reward entity design

## Gray Area Selection

| # | Area | Selected | Notes |
|---|------|----------|-------|
| 1 | Redemption workflow complexity | ✅ | ADR-009 locks MVP to direct REDEEMED |
| 2 | Wallet locking for debit | ✅ | Reuse Phase 2 pessimistic lock pattern |
| 3 | Reward stock/limits | ❌ | Deferred — MVP rewards are unlimited |

### 1. Redemption Workflow

| Option | Selected |
|--------|----------|
| A) Direct REDEEMED (no approval) | ✅ |
| B) PENDING → APPROVED → REDEEMED | ❌ |
| C) PENDING → REDEEMED with auto-approve | ❌ |

**Choice:** Option A — per ADR-009, MVP keeps it simple. The `status` column exists for future extension.

### 2. Wallet Locking for Debit

| Option | Selected |
|--------|----------|
| A) Pessimistic lock (SELECT FOR UPDATE) | ✅ |
| B) Optimistic lock (@Version) | ❌ |
| C) Database-level CHECK only | ❌ |

**Choice:** Option A — consistent with Phase 2 credit pattern. Prevents race conditions on concurrent redemptions.

### 3. Reward Snapshot at Redemption

| Option | Selected |
|--------|----------|
| A) Snapshot title + cost in RewardRedemption | ✅ |
| B) Only reference rewardId, no snapshot | ❌ |

**Choice:** Option A — consistent with AssignedMission snapshot pattern. Preserves accurate history even if reward is later edited.

## Agent's Discretion

- CoinTransaction reference: RewardRedemption stores `coinTransactionId` for direct audit linkage.
- Reward description is optional (nullable), same pattern as Mission.
- Reward listing for child returns only active rewards from their family.

## Deferred Ideas

| Idea | Reason |
|------|--------|
| Reward stock/quantity limits | MVP complexity; all rewards unlimited |
| Reward images/icons | Deferred to Phase 7 polish or post-MVP |
| Redemption approval by responsible | ADR-009 defers this |
| Partial redemption / installment | Out of MVP scope |
