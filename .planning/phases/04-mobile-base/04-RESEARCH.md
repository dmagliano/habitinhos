# Phase 04 Research - Mobile Base

**Date:** 2026-06-01
**Domain:** Expo React Native foundation, auth/session, navigation, API client, and mobile design baseline
**Confidence:** High - official Expo and React Navigation docs checked on 2026-06-01; backend auth contract already implemented

<user_constraints>
Locked decisions and constraints from Phase 4 context:

- Use Expo, React Native, TypeScript, and React Navigation.
- Keep visible interface text in PT-BR and code identifiers in English.
- Login must call the real backend `POST /auth/login`; session restoration must verify `GET /me`.
- Backend remains the source of truth for family context and authorization. Mobile must not invent or trust client-side `familyUnitId`.
- Successful login lands on `FamilyHub`, with PT-BR choices `Sou responsável` and `Sou criança`.
- Phase 4 creates auth and internal stub routes only: `Auth`, `FamilyHub`, `ResponsibleStub`, and `ChildStub`.
- Stub routes must be honest visual landings with `AppHeader`, `Card`, preparation/next-step copy, `Trocar modo`, and visible logout.
- API base URL must use a public Expo env var such as `EXPO_PUBLIC_API_BASE_URL`, with a documented local backend fallback.
- Backend unavailable states must show friendly PT-BR copy and `Tentar novamente`; no silent fake/mock fallback.
- Follow `docs/design/mobile-design-contract.md` and `docs/design/phase-design-map.md`; do not copy Stitch `code.html` HTML/CSS.
</user_constraints>

<phase_requirements>

| Req ID | Description | Research Support |
|--------|-------------|------------------|
| MOBL-01 | Expo, React Native, TypeScript, and React Navigation app foundation | [VERIFIED] - Expo supports TypeScript templates; React Navigation docs support Expo install and native-stack auth flows |
| MOBL-02 | PT-BR screens, English technical names in code | [VERIFIED] - project convention; no external dependency needed |
| AUTH-02 | Responsible adult can log in and receive authenticated token/session | [VERIFIED] - backend `POST /auth/login` returns `token`, `user`, and `family` |
| AUTH-04 | Authenticated responsible can retrieve `/me` with user/family context | [VERIFIED] - backend `GET /me` returns user and family fields |
| MOBL-06 | Phase 4+ mobile screens follow design contract and avoid Stitch HTML/CSS copy | [VERIFIED] - docs/design contract exists and maps Phase 4 references |

</phase_requirements>

## Source Review

| Topic | Source | Relevant Finding | Phase 4 Impact |
|-------|--------|------------------|----------------|
| Expo app creation | https://docs.expo.dev/more/create-expo/ | `create-expo-app` is the official scaffold path and supports templates; current default templates may include routing opinions. | Prefer a TypeScript scaffold that does not force Expo Router, or immediately align generated structure to React Navigation. Avoid overwriting the existing untracked `mobile/AGENTS.md`. |
| Expo TypeScript | https://docs.expo.dev/guides/typescript/ | Expo has first-class TypeScript support and can run TypeScript checks through project scripts. | Phase 4 should establish strict enough TS scripts early, before auth/navigation code grows. |
| Expo env vars | https://docs.expo.dev/guides/environment-variables/ | Expo exposes only variables prefixed with `EXPO_PUBLIC_` to app code; these values are public in the client bundle. | Use `EXPO_PUBLIC_API_BASE_URL` only for non-secret API URL. Do not store secrets in env vars. Document local fallback. |
| Expo SecureStore | https://docs.expo.dev/versions/latest/sdk/securestore/ | SecureStore persists small sensitive key-value data using platform secure storage mechanisms. | Store JWT in `expo-secure-store`, not plain AsyncStorage, and centralize token read/write/remove. |
| React Navigation setup | https://reactnavigation.org/docs/getting-started/ | Expo projects need React Navigation core package plus compatible native dependencies. | Add React Navigation deliberately and keep dependencies minimal. |
| React Navigation auth flow | https://reactnavigation.org/docs/auth-flow/ | Authenticated and unauthenticated screens should be conditionally rendered from auth state; users should not manually navigate between auth branches. | Implement session bootstrap state, unauthenticated `Auth`, authenticated `FamilyHub`, and authenticated stubs as a conditional root stack. |
| React Navigation native stack | https://reactnavigation.org/docs/native-stack-navigator/ | Native stack is the standard stack navigator backed by native primitives. | Use native stack for Phase 4 root/auth/stub screens; defer bottom tabs until real child/responsible flows. |
| Expo unit testing | https://docs.expo.dev/develop/unit-testing/ | Expo supports Jest through `jest-expo`. | Add test infrastructure in Wave 0/04-01 so API/session and component behavior can be verified automatically. |

## Existing Backend Contract

| Endpoint | Mobile Use | Request/Response Notes |
|----------|------------|------------------------|
| `POST /auth/login` | Login form submit | Request: `email`, `password`. Response: `token`, `user`, `family`. |
| `GET /me` | Session restoration and authenticated context refresh | Requires Bearer JWT. Response: `id`, `name`, `email`, `role`, `familyId`, `familyName`. |

API errors follow the project error shape from `docs/api-contract.md`:

| Field | Mobile Handling |
|-------|-----------------|
| `code` | Keep for development diagnostics and typed error handling. Do not show raw technical code by default. |
| `message` | Prefer backend PT-BR message when safe and user-friendly; otherwise map to Phase 4 friendly copy. |
| `details` | Preserve for logs/debug; do not expose raw validation/debug details in normal UI. |

## Recommended Technical Shape

| Area | Recommendation | Reason |
|------|----------------|--------|
| App scaffold | Create the Expo project under `mobile/` with TypeScript and without Expo Router as the primary navigation model. | Project decision is React Navigation; Phase 4 needs explicit `Auth`, `FamilyHub`, `ResponsibleStub`, `ChildStub` routes. |
| Source layout | Use `mobile/src/navigation`, `src/api`, `src/features/auth`, `src/features/family`, `src/components`, `src/theme`, `src/storage`, and `src/types`. | Matches `docs/architecture.md` and keeps greenfield mobile conventions clear. |
| Navigation | Conditional root stack driven by session state: restoring, unauthenticated, authenticated. | Matches React Navigation auth-flow guidance and prevents back-navigation into login after auth. |
| Session storage | `expo-secure-store` wrapper with `getToken`, `setToken`, `clearToken`. | JWT is sensitive enough to avoid plain async storage; wrapper isolates platform details. |
| API client | Small typed fetch wrapper that injects Bearer token, parses JSON/error shape, and maps network failures to PT-BR errors. | Avoids premature state/cache libraries and supports Phase 4 auth plus Phase 5/6 extension. |
| Environment | `EXPO_PUBLIC_API_BASE_URL` plus documented local fallback such as Android emulator host handling. | Expo public env vars are appropriate for non-secret base URLs; fallback supports local demo setup. |
| Tests | `jest-expo` + React Native Testing Library for auth reducer/session/API and base component rendering; lint/typecheck scripts in package scripts. | Gives fast feedback before visual/manual verification. |
| Visual foundation | Define tokens before screens; implement `AppScreen`, `AppHeader`, `Card`, `PrimaryButton`, `SecondaryButton`, `StatusBadge`, `CoinBadge`, and `EmojiAvatar` as reusable primitives. | Required by mobile design contract and reduces rework for Phases 5 and 6. |

## Key Planning Implications

1. Phase 4 should not implement child mission/reward data or responsible dashboard data. Stub screens should communicate preparation honestly.
2. The first authenticated route should be `FamilyHub`. Responsible and child branches exist as stubs only.
3. Bottom tabs are part of the global design contract, but Phase 4 should create only the reusable tab component/pattern if needed; real tab navigation belongs to Phases 5 and 6.
4. Token/session code must support: fresh login, app restart/session restore, invalid token cleanup, explicit logout, and backend unavailable retry.
5. API code must never send `familyUnitId` as an authorization truth. It can display family name/id returned by backend, but protected access comes from the Bearer token.
6. Design implementation must be native React Native tokens/components. Stitch screenshots guide hierarchy and tone only.

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Expo Router template conflicts with React Navigation route decisions | Navigation churn and confusing file structure | Use a blank TypeScript scaffold or remove router-specific artifacts immediately in 04-01. |
| Local Android cannot reach backend via `localhost` | Login appears broken during demo | Document emulator/device base URL behavior and make API URL explicit through `EXPO_PUBLIC_API_BASE_URL`. |
| Token persists after backend invalidates/rejects it | User stuck in authenticated UI with broken calls | On `/me` 401/403, clear token and return to `Auth` with friendly PT-BR copy. |
| Backend unavailable during demo | Ambiguous failure | Show recoverable error with `Tentar novamente`, keep technical details in dev logs only. |
| Visual work starts screen-by-screen without tokens | Phase 5/6 inconsistency | Make 04-03 build tokens/components before login/hub/stub screens. |
| Tests are deferred until after scaffold | Auth regressions become manual-only | Establish `jest-expo`, lint, and typecheck scripts in first mobile plan. |

## Package Legitimacy Audit

Phase 4 installs npm packages. The planner should treat the packages below as
approved inputs when they are installed through Expo-compatible commands such as
`npx create-expo-app@latest` and `npx expo install ...`.

| Package | Classification | Evidence | Planning Instruction |
|---------|----------------|----------|----------------------|
| `create-expo-app` | VERIFIED | Official Expo scaffold package on npm; repository/homepage point to Expo docs/GitHub. | Use only for initial scaffold, preferably with `--template blank-typescript` and without Expo Router as the primary navigation model. |
| `expo` | VERIFIED | Official Expo package on npm; includes Expo CLI support and TypeScript declarations. | Use the scaffold-selected compatible version; do not pin manually unless Expo tooling requires it. |
| `expo-secure-store` | VERIFIED | Official Expo package on npm; docs describe encrypted local key-value storage. | Install with `npx expo install expo-secure-store`; store only the JWT token wrapper value, not broad app state. |
| `@react-navigation/native` | VERIFIED | Official React Navigation native integration package on npm; docs point to reactnavigation.org. | Use as the root navigation library per project decisions. |
| `@react-navigation/native-stack` | VERIFIED | Official React Navigation native-stack package on npm. | Use for `Auth`, `FamilyHub`, `ResponsibleStub`, and `ChildStub` stack routes. |
| `react-native-screens` | VERIFIED | Official dependency used by React Navigation; npm docs recommend `npx expo install react-native-screens` for Expo managed workflow. | Install via `npx expo install` so Expo selects a compatible native version. |
| `react-native-safe-area-context` | VERIFIED | Widely used React Native safe area package; npm package has TypeScript declarations and React Navigation/Expo ecosystem usage. | Install via `npx expo install`; use for safe-area support if scaffold/components need it. |
| `jest-expo` | VERIFIED | Official Expo Jest preset package; npm docs recommend `npx expo install jest-expo jest`. | Use as Jest preset for mobile tests. |
| `jest` | VERIFIED | Official Jest package on npm; required by `jest-expo`. | Install with `jest-expo` through Expo tooling. |
| `@testing-library/react-native` | VERIFIED | Official React Native Testing Library package by Callstack; npm package has TypeScript declarations. | Use for component and screen tests; avoid brittle snapshot-only tests. |
| `react-test-renderer` | VERIFIED WITH CAUTION | React package on npm; current package notes deprecation of direct renderer APIs, while RNTL may require a version matching React. | Install only if required by React Native Testing Library peer requirements; match the scaffold's React version exactly and do not write direct renderer tests. |

## Validation Architecture

Phase 4 validation should mix fast automated checks with manual mobile smoke because this phase creates a new Expo app and user-visible auth flow.

| Layer | Tooling | Coverage |
|-------|---------|----------|
| Static checks | TypeScript check and Expo/ESLint script | App scaffold, navigation typing, API/session types, no missing imports |
| Unit/component tests | Jest through `jest-expo` and React Native Testing Library | Auth/session state transitions, API error mapping, token storage wrapper mocks, base component rendering, login form states |
| Integration-style tests | Mocked fetch/API boundary inside Jest | Successful login, invalid credentials, `/me` restore success, `/me` unauthorized clears token, network error retry state |
| Manual Expo smoke | Android emulator/device with local backend | App starts, login against real backend, lands on `FamilyHub`, enters both stubs, `Trocar modo`, logout, app restart session restore |
| Design review | Manual comparison with `docs/design/mobile-design-contract.md` and Phase 4 screenshots | PT-BR text, Android touch targets, tokens, components, no external assets, no copied Stitch HTML/CSS |

Recommended validation commands after scaffold exists:

| Purpose | Command |
|---------|---------|
| Dependency/app sanity | `cd mobile && npm run lint` |
| Type safety | `cd mobile && npm run typecheck` |
| Automated tests | `cd mobile && npm test -- --runInBand` |
| Local manual run | `cd mobile && npm run start` |

Manual-only checks remain necessary for real backend connectivity, Android local networking, and final visual/touch inspection.

## Open Questions (RESOLVED)

No blocking questions remain. Planner may choose exact package-manager details
and exact local fallback URL, but must preserve the locked route/session/design
decisions above.

## Research Complete

Phase 4 can be planned once the UI design gate is satisfied with a phase-local UI spec, using this research plus:

- `.planning/phases/04-mobile-base/04-CONTEXT.md`
- `docs/design/mobile-design-contract.md`
- `docs/design/phase-design-map.md`
- `docs/api-contract.md`
