---
phase: 04
slug: mobile-base
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-01
---

# Phase 04 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Expo + TypeScript + Jest via `jest-expo` + React Native Testing Library |
| **Config file** | `mobile/package.json`; Jest config may live in package config or `mobile/jest.config.*` after Wave 0 |
| **Quick run command** | `cd mobile && npm run typecheck && npm test -- --runInBand` |
| **Full suite command** | `cd mobile && npm run lint && npm run typecheck && npm test -- --runInBand` |
| **Estimated runtime** | ~60 seconds after dependencies are installed |

## Sampling Rate

- **After every task commit:** Run the smallest relevant check: `npm run typecheck`, focused Jest test, or both.
- **After every plan wave:** Run `cd mobile && npm run lint && npm run typecheck && npm test -- --runInBand`.
- **Before `$gsd-verify-work`:** Full mobile suite must be green and manual Expo smoke must pass against a local backend.
- **Max feedback latency:** 60 seconds for automated checks after the first dependency install.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 04-01 | 0 | MOBL-01 | T-04-01 / T-04-02 | Scaffold avoids unreviewed router/auth defaults and establishes auditable scripts | scaffold/static | `cd mobile && npm run lint && npm run typecheck` | ❌ W0 | ⬜ pending |
| 04-01-02 | 04-01 | 0 | MOBL-01, MOBL-02 | T-04-01 | Test infrastructure can verify React Native components and TypeScript contracts | test infra | `cd mobile && npm test -- --runInBand` | ❌ W0 | ⬜ pending |
| 04-02-01 | 04-02 | 1 | AUTH-02, AUTH-04 | T-04-03 / T-04-04 | API client injects Bearer token and maps backend/network failures to safe PT-BR messages | unit/integration | `cd mobile && npm test -- --runInBand` | ❌ W0 | ⬜ pending |
| 04-02-02 | 04-02 | 1 | AUTH-02, AUTH-04 | T-04-05 | Token storage wrapper persists, restores, and clears JWT without exposing raw details to UI | unit | `cd mobile && npm test -- --runInBand` | ❌ W0 | ⬜ pending |
| 04-02-03 | 04-02 | 1 | MOBL-01, AUTH-04 | T-04-05 / T-04-06 | Invalid or rejected `/me` session clears token and returns to auth branch | component/integration | `cd mobile && npm test -- --runInBand` | ❌ W0 | ⬜ pending |
| 04-03-01 | 04-03 | 2 | MOBL-02, MOBL-06 | T-04-07 | Base components use centralized tokens, PT-BR labels, accessible touch targets, and no external assets | component/static | `cd mobile && npm test -- --runInBand && npm run lint` | ❌ W0 | ⬜ pending |
| 04-03-02 | 04-03 | 2 | AUTH-02, AUTH-04, MOBL-02, MOBL-06 | T-04-03 / T-04-07 | Login and authenticated hub/stub screens expose safe auth state transitions without fake domain data | component/integration | `cd mobile && npm test -- --runInBand` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Wave 0 Requirements

- [ ] Expo TypeScript app scaffold exists in `mobile/`.
- [ ] `mobile/package.json` contains non-watch scripts for `lint`, `typecheck`, and `test`.
- [ ] Jest is configured for Expo/React Native tests without watch-mode defaults.
- [ ] React Native Testing Library is available for component tests.
- [ ] First smoke tests cover app render, auth/session reducer or provider, API error mapping, and a base component render.

## Execution Waves

| Wave | Plans | Dependency |
|------|-------|------------|
| 0 | 04-01 | Create mobile scaffold, scripts, and test infrastructure |
| 1 | 04-02 | Add navigation, API client, env config, token storage, and session restoration |
| 2 | 04-03 | Add visual tokens, base components, login, family hub, and responsible/child stubs |

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo app starts on Android | MOBL-01 | Requires local Expo runtime/emulator or device | Run `cd mobile && npm run start`, open on Android, confirm first screen renders without redbox. |
| Real backend login works | AUTH-02, AUTH-04 | Requires local backend, DB, and reachable device/emulator networking | Start backend, set `EXPO_PUBLIC_API_BASE_URL`, log in with a real responsible user, confirm `FamilyHub` appears. |
| Session restore and logout | AUTH-02, AUTH-04 | SecureStore and app lifecycle are platform-dependent | Log in, restart app, confirm authenticated state restores; tap logout and confirm return to auth screen. |
| Backend unavailable retry | AUTH-02 | Network failure UX needs real runtime confirmation | Stop backend, attempt login or session restore, confirm friendly PT-BR error and `Tentar novamente`. |
| Design contract review | MOBL-02, MOBL-06 | Visual/touch quality cannot be fully proven by unit tests | Compare login, hub, and stubs against `docs/design/mobile-design-contract.md`, `phase-design-map.md`, `boas_vindas`, and `perfil_e_troca_de_modo`. |

## Validation Sign-Off

- [x] All planned rows have automated verification or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verification.
- [x] Wave 0 covers all missing mobile test infrastructure references.
- [x] No watch-mode flags are required for automated verification.
- [x] Feedback latency target is less than 60s after mobile dependencies are installed.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** draft 2026-06-01; final approval requires generated Phase 4 PLAN files to keep these task IDs or update this map.
