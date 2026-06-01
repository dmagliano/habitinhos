---
phase: 03
slug: recompensas-e-resgates
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-01
verified: 2026-06-01
---

# Phase 03 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| api-to-database-schema | Reward and redemption services persist family-scoped data against V3 checks and constraints. | Reward and redemption request/response data |
| wallet-debit-boundary | Reward redemption debits must update wallet balance and ledger rows atomically. | Wallet balances, redemption ids, coin transaction rows |
| test-cleanup-to-database | Integration tests clean tables with foreign keys in safe dependency order. | Test database rows |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-03-01 | Tampering | `rewards.cost` | mitigate | DTO `@Min(1)` validation plus V3 `CHECK (cost > 0)` and integration coverage for non-positive cost rejection. | closed |
| T-03-02 | Tampering | Wallet balance on redemption | mitigate | `WalletService.debitForRewardRedemption` uses the existing pessimistic wallet lock, validates sufficient balance, and persists `balance_after >= 0` ledger evidence. | closed |
| T-03-03 | Repudiation | Redemption without `CoinTransaction` | mitigate | `RewardService.redeem` wraps redemption creation, wallet debit, ledger creation, and transaction link in one transaction; insufficient balance rollback test verifies no partial records. | closed |
| T-03-04 | Information disclosure | Cross-family reward access | mitigate | Reward, child, wallet, and statement lookups are family-scoped from `CurrentUser.familyUnitId`; cross-family tests return safe not-found responses. | closed |
| T-03-SC | Tampering | npm/pip/cargo installs | accept | No package manager installs or dependency additions were introduced in Phase 3. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-SC | Supply-chain package install risk does not apply because Phase 3 added no packages or dependency files. | Codex inline secure-phase | 2026-06-01 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-01 | 5 | 5 | 0 | Codex inline secure-phase |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-01
