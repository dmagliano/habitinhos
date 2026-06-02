# Phase 05: Fluxo da criança - Research

**Researched:** 2026-06-02  
**Domain:** Expo React Native child journey over Spring Boot REST API  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

Source: `.planning/phases/05-fluxo-da-crian-a/05-CONTEXT.md` [CITED: .planning/phases/05-fluxo-da-crian-a/05-CONTEXT.md]

### Locked Decisions

## Implementation Decisions

### Entrada no Perfil da Crianca
- **D-01:** The child flow starts from the authenticated responsible session by
  selecting an existing child profile from `/children`; the app must not invent
  fake child profiles or treat a selected child as an authenticated `User`.
- **D-02:** The desired product rule is that switching from the child profile
  back to the responsible profile should require a responsible PIN.
- **D-03:** Phase 5 must not block on responsible-PIN validation. Codebase
  validation found optional `ChildProfile.accessPinHash` and `ChildRequest`
  support for `accessPin`, but no endpoint to validate a PIN and no responsible
  PIN concept. Treat the protected switch as a deferred backend/flow task.
- **D-04:** If the Phase 5 UI needs a mode-switch affordance, it should keep the
  behavior simple and honest for now: stay within the existing authenticated
  session, avoid fake local PIN checks, and preserve the deferred decision for
  a later GSD section.

### Home da Crianca e Prioridade do Dia
- **D-05:** The child home should follow the `painel_do_joaquim` reference:
  prominent child identity, prominent coin balance, and pending missions as the
  main next action.
- **D-06:** Pending missions appear immediately after the balance/home summary.
  The list is prioritized by missions with due dates first.
- **D-07:** Mission ordering should keep the child focused on what needs action
  now. Planner may choose the exact secondary sort order when missions have the
  same due-date state, as long as due-dated missions are prioritized.
- **D-08:** Empty/loading/error states for the child home are in scope because
  Phase 4 explicitly deferred real list/card states until Phase 5/6. They must
  use friendly PT-BR copy and retry paths where appropriate.

### Conclusao de Missao e Feedback
- **D-09:** When a mission requires approval, completing it should show only an
  `Aguardando aprovacao` style state. Do not imply coins were credited yet.
- **D-10:** When a mission does not require approval, completing it should show
  the received coin amount and refreshed balance.
- **D-11:** Phase 5 should not require animations for completion feedback.
  Stable banners, cards, or inline feedback are enough.
- **D-12:** Feedback must stay tied to backend results. The mobile app may show
  optimistic loading/disabled states while the request runs, but final status
  and balance come from the API response/refetch, not local invention.

### Resgate e Saldo Insuficiente
- **D-13:** Reward redemption must ask for confirmation before spending coins.
  The confirmation should show the current balance, reward cost, and the
  balance that will remain after the exchange.
- **D-14:** Rewards the child cannot afford should keep their redeem button
  disabled and show a helper such as how many coins are missing.
- **D-15:** If redemption fails, show a friendly PT-BR message. For insufficient
  balance, prefer the semantic backend message/code when available and avoid raw
  technical details.
- **D-16:** Successful redemption should show clear success feedback and refresh
  the child's balance/reward state from the backend.

### Carry Forward From Locked Project Decisions
- **D-17:** The mobile app uses Expo, React Native, TypeScript, React
  Navigation, PT-BR visible text, and English technical names in code.
- **D-18:** The backend remains the source of truth for family isolation, wallet
  balance, mission rules, reward redemption, and coin history.
- **D-19:** Phase 5 must consume the real backend API. It must not silently fall
  back to mock/offline children, balances, missions, or rewards when the backend
  is unavailable.
- **D-20:** The approved Phase 5 UI-SPEC is locked design context. Implementers
  must follow `05-UI-SPEC.md`, `docs/design/mobile-design-contract.md`, and
  `docs/design/phase-design-map.md`; Stitch screenshots are visual references
  only, and `code.html` exports must not be copied.

### the agent's Discretion
- Exact child-profile selection layout, secondary mission sort order after
  due-date priority, detail-vs-list navigation shape, caching/refetch cadence,
  and component decomposition are left to the researcher/planner as long as
  D-01 through D-20, the roadmap scope, the approved UI-SPEC, and the real API
  contracts are preserved.
- Planner should reconcile current backend routes with `docs/api-contract.md`
  before writing mobile API calls. In particular, docs mention child-scoped
  reward-redemption endpoints, while current code exposes
  `POST /rewards/{id}/redeem` with `childId` in the request body.

### Deferred Ideas (OUT OF SCOPE)

## Deferred Ideas

- Implement responsible PIN validation / protected switch from child mode back
  to responsible mode when a backend spec and endpoint exist. Do not fake this
  locally in Phase 5.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOBL-04 | Child flow includes profile selection/access, home with balance, missions, completion feedback, reward catalog, redemption feedback, and insufficient balance message. [CITED: .planning/REQUIREMENTS.md] | Implement the approved child routes, API services, domain components, and UI states documented below. [VERIFIED: 05-UI-SPEC.md + mobile code] |
| MOBL-05 | Mobile app consumes the real backend API for the demo flow. [CITED: .planning/REQUIREMENTS.md] | Use `apiRequest` with `session.token`; do not add mock/offline fallbacks. [VERIFIED: mobile/src/api/client.ts; mobile/src/features/auth/AuthContext.tsx] |
| MISS-04 | Child can list only their own assigned pending missions. [CITED: .planning/REQUIREMENTS.md] | Use `GET /children/{childId}/missions`; backend returns only `PENDING` assignments scoped to authenticated family. [VERIFIED: backend/src/main/java/br/com/habitinhos/missions/AssignedMissionController.java; AssignedMissionService.java] |
| MISS-05 | Child can mark their own assigned mission as completed. [CITED: .planning/REQUIREMENTS.md] | Use `POST /assigned-missions/{id}/complete`; handle `COMPLETED` and `AWAITING_APPROVAL`. [VERIFIED: backend/src/main/java/br/com/habitinhos/missions/AssignedMissionService.java] |
| REWD-03 | Child can list active rewards from their family. [CITED: .planning/REQUIREMENTS.md] | Use `GET /rewards`; backend returns active family rewards ordered by creation time. [VERIFIED: backend/src/main/java/br/com/habitinhos/rewards/RewardController.java; RewardRepository.java] |
| REWD-04 | Child can redeem a reward when balance is sufficient. [CITED: .planning/REQUIREMENTS.md] | Use current backend route `POST /rewards/{id}/redeem` with `{ childId }`, then refetch wallet/rewards. [VERIFIED: backend/src/main/java/br/com/habitinhos/rewards/RewardController.java; RewardRedemptionIntegrationTest.java] |
| REWD-05 | System blocks reward redemption when balance is insufficient. [CITED: .planning/REQUIREMENTS.md] | Map backend `INSUFFICIENT_BALANCE` to friendly PT-BR copy and keep UI affordability disabled from wallet data. [VERIFIED: backend/src/main/java/br/com/habitinhos/wallet/WalletService.java; mobile/src/api/types.ts] |
| WALT-01 | Child wallet exposes current balance. [CITED: .planning/REQUIREMENTS.md] | Use `GET /children/{childId}/wallet` and `WalletResponse.balance` as the only balance source. [VERIFIED: backend/src/main/java/br/com/habitinhos/wallet/WalletController.java; WalletResponse.java] |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- No `AGENTS.md` exists at the project root, so no additional project-specific directives were loaded from that file. [VERIFIED: `test -f AGENTS.md` in `/home/dmagliano/Projetos/habitinhos`]
- No project-defined `.codex/skills/` or `.agents/skills/` directories with `SKILL.md` files were found. [VERIFIED: `find .codex/skills .agents/skills -maxdepth 2 -name SKILL.md`]

## Summary

Phase 5 should be planned as a mobile-first feature slice that consumes the already-implemented backend contracts: profile selection from `/children`, wallet balance from `/children/{childId}/wallet`, pending missions from `/children/{childId}/missions`, mission completion through `/assigned-missions/{id}/complete`, rewards from `/rewards`, and redemption through the current backend route `/rewards/{id}/redeem` with `{ childId }`. [VERIFIED: backend controllers/DTOs; .planning/phases/05-fluxo-da-crian-a/05-UI-SPEC.md]

The main planning risk is not domain logic; it is contract drift. `docs/api-contract.md` documents child-scoped redemption under `/children/{childId}/reward-redemptions`, while current backend code and OpenAPI coverage expose `/rewards/{id}/redeem`. Use the current backend route for the mobile implementation unless the plan explicitly adds a backend/docs reconciliation task. [CITED: docs/api-contract.md] [VERIFIED: backend/src/main/java/br/com/habitinhos/rewards/RewardController.java; backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java]

The child flow needs one navigation dependency decision: install the official `@react-navigation/bottom-tabs` package and use a custom `tabBar` UI composed from project tokens/components. This preserves real tab navigation while satisfying the approved design contract for a custom visual BottomTabBar. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] [VERIFIED: npm registry + slopcheck]

**Primary recommendation:** Plan 05-01 installs/configures bottom tabs, adds child API types/services, and replaces `ChildStub` with `ChildProfileSelect` plus `ChildTabs`; Plans 05-02 and 05-03 should add mission/reward screens using the same service/refetch pattern and backend-sourced feedback. [VERIFIED: mobile/src/navigation/RootNavigator.tsx; 05-UI-SPEC.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Responsible-authenticated session and token use | Browser / Client | API / Backend | Mobile stores and supplies the responsible JWT; backend authenticates it and derives family context. [VERIFIED: mobile/src/storage/tokenStorage.ts; mobile/src/api/client.ts; backend/src/main/java/br/com/habitinhos/auth/CurrentUserProvider.java] |
| Child profile selection | Browser / Client | API / Backend | Mobile selects an existing `ChildResponse`; backend scopes `/children` to the authenticated family. [VERIFIED: ChildController.java; ChildResponse.java] |
| Selected child mode | Browser / Client | — | Selection is UI state inside the responsible session, not a new auth principal. [CITED: 05-CONTEXT.md] |
| Wallet balance display | API / Backend | Browser / Client | Backend wallet is the source of truth; mobile renders `WalletResponse.balance`. [VERIFIED: WalletController.java; WalletService.java; WalletResponse.java] |
| Pending mission ordering/listing | API / Backend | Browser / Client | Backend returns pending assignments ordered by due date and creation time; mobile may apply display grouping only after using real data. [VERIFIED: AssignedMissionRepository.java; AssignedMissionService.java] |
| Mission completion and coin credit | API / Backend | Browser / Client | Backend changes status and credits wallet transactionally; mobile disables duplicate submit and shows returned/refetched state. [VERIFIED: AssignedMissionService.java; AssignedMissionIntegrationTest.java] |
| Rewards catalog and affordability | API / Backend | Browser / Client | Backend lists active rewards; mobile compares reward cost against backend wallet balance for UI affordance. [VERIFIED: RewardController.java; RewardResponse.java; WalletResponse.java] |
| Reward redemption and insufficient-balance enforcement | API / Backend | Browser / Client | Backend debits wallet and blocks insufficient balance atomically; mobile confirms spend and maps `INSUFFICIENT_BALANCE`. [VERIFIED: RewardService.java; WalletService.java; RewardRedemptionIntegrationTest.java] |
| Child tab/detail navigation | Browser / Client | — | Navigation, tab state, and route params are React Navigation concerns in the mobile tier. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Expo | `~56.0.8` in project; npm latest `56.0.8` modified 2026-05-29. [VERIFIED: mobile/package.json; npm registry] | Mobile runtime/toolchain. | Existing app is Expo; Expo docs recommend installing compatible packages with `npx expo install`. [CITED: https://docs.expo.dev/workflow/using-libraries/] |
| React Native | `0.85.3` in project. [VERIFIED: mobile/package.json] | Native UI primitives and Android-first screens. | Required by project design contract and current app. [CITED: docs/design/mobile-design-contract.md] |
| TypeScript | `~6.0.3` in project. [VERIFIED: mobile/package.json; mobile/tsconfig.json] | Strict mobile type safety. | Current mobile config is strict TypeScript. [VERIFIED: mobile/tsconfig.json] |
| React Navigation Native | `^7.2.5`; npm current `7.2.5` modified 2026-05-25. [VERIFIED: mobile/package.json; npm registry] | Navigation container and core navigation state. | Existing root navigator already uses it. [VERIFIED: mobile/src/navigation/RootNavigator.tsx] |
| React Navigation Native Stack | `^7.16.0`; npm current `7.16.0` modified 2026-05-25. [VERIFIED: mobile/package.json; npm registry] | Auth/family/child stack and detail screens. | Existing root navigation uses `createNativeStackNavigator`. [VERIFIED: mobile/src/navigation/RootNavigator.tsx] |
| `@react-navigation/bottom-tabs` | `7.16.2`; created 2019-08-21, modified 2026-05-25. [VERIFIED: npm registry] | Real child bottom tabs: `Início`, `Missões`, `Recompensas`, `Perfil`. | Official React Navigation tab navigator package; custom `tabBar` can satisfy the UI-SPEC visual contract. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |
| Existing `apiRequest` wrapper | Project-local. [VERIFIED: mobile/src/api/client.ts] | Bearer-token fetch, JSON parsing, PT-BR errors, familyUnitId guard. | Preserves backend-as-source-of-truth and avoids duplicate auth/error code. [VERIFIED: mobile/src/features/auth/authService.ts; mobile/src/api/client.ts] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react-native` | `^13.3.3`; npm current `13.3.3` modified 2026-05-29. [VERIFIED: mobile/package.json; npm registry] | Component behavior tests. | Use for screen rendering, button press, loading/error/success assertions, and accessible labels. [CITED: https://callstack.github.io/react-native-testing-library/docs/api/misc/async] |
| Jest + `jest-expo` | Jest `29.7.0`, `jest-expo` `^56.0.4`. [VERIFIED: mobile/package.json; `npx jest --version`] | Mobile unit/component test runner. | Existing mobile tests and config already use this stack. [VERIFIED: mobile/package.json; mobile/jest.setup.ts] |
| Spring Boot + MockMvc + Testcontainers | Spring Boot `3.5.14`, Java target `17`, Maven wrapper `3.9.11`. [VERIFIED: backend/pom.xml; `./mvnw --version`] | Backend contract/integration coverage. | Use only if the plan changes or documents backend route contracts. [VERIFIED: backend/src/test/java/br/com/habitinhos/*] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-navigation/bottom-tabs` | Hand-rolled tab state inside one screen | Avoids one package but loses standard tab navigation, nested navigator behavior, route isolation, and back-stack semantics. [CITED: https://reactnavigation.org/docs/nesting-navigators/] |
| `@react-navigation/bottom-tabs` | Experimental native bottom tabs | Official docs mark native bottom tabs as experimental, so avoid for MVP planning. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |
| Existing `apiRequest` services | React Query/SWR | No data-fetching library is installed and Phase 5 can use focused load/refetch hooks without adding cache complexity. [VERIFIED: mobile/package.json; mobile/src/api/client.ts] |

**Installation:**

```bash
cd mobile
npx expo install @react-navigation/bottom-tabs
```

**Version verification:** `npm view @react-navigation/bottom-tabs version time.created time.modified repository.url scripts.postinstall` returned `7.16.2`, created `2019-08-21T22:31:45.053Z`, modified `2026-05-25T19:02:17.393Z`, GitHub repository `react-navigation/react-navigation`, and no `scripts.postinstall` value. [VERIFIED: npm registry]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@react-navigation/bottom-tabs` [VERIFIED: npm registry] | npm | Created 2019-08-21; ~5 years 9 months old on 2026-06-02. [VERIFIED: npm registry] | 4,696,586 downloads for 2026-05-25 through 2026-05-31. [VERIFIED: npm downloads API] | `https://github.com/react-navigation/react-navigation` [VERIFIED: npm registry] | OK; `slopcheck install @react-navigation/bottom-tabs` reported `[OK]`. [VERIFIED: slopcheck 0.6.1] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none. [VERIFIED: slopcheck 0.6.1]  
**Packages flagged as suspicious [SUS]:** none. [VERIFIED: slopcheck 0.6.1]  
**Audit note:** `slopcheck 0.6.1` did not support `--json`; the text-mode run was used and then the accidental `npm install` changes were removed from tracked files. [VERIFIED: shell output + git diff]

## Architecture Patterns

### System Architecture Diagram

```mermaid
flowchart TD
  Auth[Responsible authenticated session] --> Hub[FamilyHub: Sou criança]
  Hub --> Select[ChildProfileSelect]
  Select -->|GET /children + Bearer JWT| ChildApi[Children API]
  ChildApi -->|ChildResponse[]| Select
  Select -->|selected ChildResponse only| Tabs[ChildTabs]
  Tabs --> Home[ChildHome]
  Tabs --> Missions[ChildMissions]
  Missions --> Detail[ChildMissionDetail]
  Tabs --> Rewards[ChildRewards]
  Tabs --> Profile[ChildProfile]
  Home -->|GET wallet/missions/rewards| ApiServices[Mobile child services]
  Missions -->|GET /children/{childId}/missions| ApiServices
  Detail -->|POST /assigned-missions/{id}/complete| ApiServices
  Rewards -->|GET /rewards + POST /rewards/{id}/redeem| ApiServices
  ApiServices --> Backend[Spring Boot REST API]
  Backend --> Authz[CurrentUser family scope]
  Authz --> Domain[Children/Missions/Rewards/Wallet services]
  Domain --> Storage[(PostgreSQL)]
  Domain -->|status, wallet balance, redemption/error| ApiServices
  ApiServices -->|refetched backend state| Home
  ApiServices -->|feedback + refreshed lists| Missions
  ApiServices -->|success/insufficient + refreshed balance| Rewards
```

Source basis: current mobile navigation/API wrapper and backend controllers/services. [VERIFIED: mobile/src/navigation/RootNavigator.tsx; mobile/src/api/client.ts; backend controllers/services]

### Recommended Project Structure

```text
mobile/src/
├── api/
│   ├── client.ts              # existing fetch/auth/error wrapper
│   └── types.ts               # add child/wallet/mission/reward DTOs
├── features/
│   └── child/
│       ├── childService.ts    # child/wallet/mission/reward API calls
│       ├── childTypes.ts      # UI view-model helpers if needed
│       ├── ChildProfileSelectScreen.tsx
│       ├── ChildTabsScreen.tsx
│       ├── ChildHomeScreen.tsx
│       ├── ChildMissionsScreen.tsx
│       ├── ChildMissionDetailScreen.tsx
│       ├── ChildRewardsScreen.tsx
│       ├── ChildProfileScreen.tsx
│       └── components/
│           ├── BottomTabBar.tsx
│           ├── MissionCard.tsx
│           ├── RewardCard.tsx
│           ├── EmptyState.tsx
│           ├── FeedbackBanner.tsx
│           └── ProgressBar.tsx
└── navigation/
    ├── RootNavigator.tsx      # replace ChildStub route with child flow
    └── routes.ts              # add root, child stack, and child tab param lists
```

This structure keeps Phase 5 in `features/child` and leaves `features/family/ResponsibleStubScreen.tsx` untouched for Phase 6. [VERIFIED: current mobile feature layout; .planning/ROADMAP.md]

### Pattern 1: Child Stack With Official Bottom Tabs

**What:** Use a child stack for profile selection/detail flow and a bottom-tab navigator for the four child destinations. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/]  
**When to use:** Use after the responsible-authenticated user chooses `Sou criança`; selected child stays in params/context, not auth. [CITED: 05-CONTEXT.md]

**Example:**

```typescript
// Source: React Navigation bottom-tab and nesting docs.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type ChildStackParamList = {
  ChildProfileSelect: undefined;
  ChildTabs: { childId: string };
  ChildMissionDetail: { childId: string; assignedMissionId: string };
};

type ChildTabParamList = {
  ChildHome: { childId: string };
  ChildMissions: { childId: string };
  ChildRewards: { childId: string };
  ChildProfile: { childId: string };
};

const ChildStack = createNativeStackNavigator<ChildStackParamList>();
const ChildTabs = createBottomTabNavigator<ChildTabParamList>();
```

Use `tabBar={(props) => <BottomTabBar {...props} />}` to render the approved custom visual bar while keeping React Navigation state. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/]

### Pattern 2: Service Layer Over Existing `apiRequest`

**What:** Add typed functions under `features/child/childService.ts`; every call receives `token` and never sends `familyUnitId`. [VERIFIED: mobile/src/api/client.ts]  
**When to use:** Use for all Phase 5 backend reads/mutations. [CITED: 05-CONTEXT.md]

**Example:**

```typescript
// Source: current apiRequest wrapper and backend controllers.
export const childService = {
  listChildren(token: string) {
    return apiRequest<ChildResponse[]>('/children', { token });
  },
  getWallet(token: string, childId: string) {
    return apiRequest<WalletResponse>(`/children/${childId}/wallet`, { token });
  },
  listPendingMissions(token: string, childId: string) {
    return apiRequest<AssignedMissionResponse[]>(`/children/${childId}/missions`, { token });
  },
  completeMission(token: string, assignedMissionId: string) {
    return apiRequest<AssignedMissionResponse>(`/assigned-missions/${assignedMissionId}/complete`, {
      method: 'POST',
      token,
    });
  },
  listRewards(token: string) {
    return apiRequest<RewardResponse[]>('/rewards', { token });
  },
  redeemReward(token: string, rewardId: string, childId: string) {
    return apiRequest<RewardRedemptionResponse>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
      token,
      body: { childId },
    });
  },
};
```

### Pattern 3: Backend-Sourced Refetch After Mutations

**What:** After completing a mission or redeeming a reward, refetch wallet and affected list data before final balance-dependent UI. [CITED: 05-UI-SPEC.md]  
**When to use:** Use for mission completion feedback, reward success, and insufficient-balance recovery. [VERIFIED: WalletService.java; RewardService.java]

**Example:**

```typescript
// Source: UI-SPEC refresh rules + current simple fetch wrapper.
async function completeAndRefresh(assignedMissionId: string) {
  setCompletingId(assignedMissionId);
  try {
    const completed = await childService.completeMission(session.token, assignedMissionId);
    const [wallet, missions] = await Promise.all([
      childService.getWallet(session.token, child.id),
      childService.listPendingMissions(session.token, child.id),
    ]);
    setWallet(wallet);
    setMissions(mergeJustCompletedForFeedback(missions, completed));
    setFeedback(toMissionFeedback(completed));
  } finally {
    setCompletingId(null);
  }
}
```

`mergeJustCompletedForFeedback` should preserve only short-lived returned backend state because the list endpoint returns pending missions only. [VERIFIED: AssignedMissionService.java; AssignedMissionRepository.java]

### Pattern 4: Friendly API Error Mapping

**What:** Use `ApiError.code` for semantic cases and `ApiError.userMessage` for fallback; never show raw HTTP/enum/exception copy. [VERIFIED: mobile/src/api/types.ts; mobile/src/api/client.ts]  
**When to use:** Use especially for `INSUFFICIENT_BALANCE`, network errors, session expiration, and invalid mission status. [VERIFIED: GlobalExceptionHandler.java; WalletService.java]

**Example:**

```typescript
// Source: backend ApiError shape and mobile ApiError class.
function getRewardErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'INSUFFICIENT_BALANCE') {
    return 'Faltam moedas para essa recompensa.';
  }

  if (error instanceof ApiError) {
    return error.userMessage;
  }

  return 'Não conseguimos resgatar agora. Tente novamente.';
}
```

### Anti-Patterns to Avoid

- **Using `docs/api-contract.md` as the only route source:** It documents a child-scoped redemption route that current backend code does not expose. Use code/OpenAPI reality or add an explicit reconciliation task. [CITED: docs/api-contract.md] [VERIFIED: RewardController.java; OpenApiIntegrationTest.java]
- **Turning a child into an authenticated user:** Children are `ChildProfile` records in this phase, not `User` principals. [CITED: 05-CONTEXT.md] [VERIFIED: ChildResponse.java; AuthResponse types]
- **Client-only balance math after redemption:** UI may compute affordability, but final balance must come from wallet refetch. [CITED: 05-UI-SPEC.md] [VERIFIED: WalletService.java]
- **Showing completed daily progress without a real count endpoint:** Current child mission list returns pending assignments only. [VERIFIED: AssignedMissionService.java]
- **Fake local PIN for responsible switch:** The product desire is deferred because no backend validation endpoint exists. [CITED: 05-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab navigation | Local state pretending to be navigation | `@react-navigation/bottom-tabs` with custom `tabBar` [VERIFIED: npm registry] [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] | Preserves navigation state, nesting, route params, and accessibility semantics. [CITED: React Navigation docs] |
| Family isolation | Client-supplied `familyUnitId` checks | Backend `CurrentUserProvider` and family-scoped repositories [VERIFIED: backend auth/services] | Existing API derives family from JWT and mobile wrapper rejects `familyUnitId`. [VERIFIED: mobile/src/api/client.ts] |
| Wallet debit/credit | Client-side coin ledger or local balance mutation | Backend wallet services [VERIFIED: WalletService.java] | Backend operations are transactional and tested for rollback/ledger integrity. [VERIFIED: RewardRedemptionIntegrationTest.java; AssignedMissionIntegrationTest.java] |
| Mission status transitions | Mobile state machine for status changes | `POST /assigned-missions/{id}/complete` response [VERIFIED: AssignedMissionService.java] | Backend enforces `PENDING` precondition and approval/auto-credit rules. [VERIFIED: AssignedMissionService.java] |
| Insufficient-balance enforcement | Disabled button as the only control | Backend `INSUFFICIENT_BALANCE` plus UI affordance [VERIFIED: WalletService.java] | UI disable improves clarity, but backend is the security and consistency boundary. [VERIFIED: RewardRedemptionIntegrationTest.java] |
| Error display | Raw `code`, enum, exception, or HTTP text | `ApiError.userMessage` plus semantic overrides [VERIFIED: mobile/src/api/types.ts] | UI-SPEC requires friendly PT-BR and no technical details. [CITED: 05-UI-SPEC.md] |

**Key insight:** Phase 5 should hand-roll only child-specific presentation components; navigation, auth, tenant isolation, wallet arithmetic, mission transitions, redemption, and structured errors already have standard or existing owners. [VERIFIED: codebase + official docs]

## Common Pitfalls

### Pitfall 1: Reward Route Drift

**What goes wrong:** Mobile calls `/children/{childId}/reward-redemptions` because docs say so, but backend exposes `/rewards/{id}/redeem`. [CITED: docs/api-contract.md] [VERIFIED: RewardController.java]  
**Why it happens:** Planning docs and backend implementation diverged in Phase 3. [VERIFIED: OpenApiIntegrationTest.java]  
**How to avoid:** Plan mobile against current controller/OpenAPI route or add a backend/docs reconciliation task before mobile calls. [VERIFIED: RewardController.java]  
**Warning signs:** Mobile service has a `reward-redemptions` path but OpenAPI test only contains `"/rewards/{id}/redeem"`. [VERIFIED: OpenApiIntegrationTest.java]

### Pitfall 2: Completed Missions Disappear After Refetch

**What goes wrong:** User sees no feedback because the completed assignment leaves the pending-only list after refetch. [VERIFIED: AssignedMissionService.java]  
**Why it happens:** `listPendingForChild` queries only status `PENDING`. [VERIFIED: AssignedMissionService.java; AssignedMissionRepository.java]  
**How to avoid:** Preserve the returned completion response in a feedback banner/local ephemeral item, then render refreshed pending list separately. [CITED: 05-UI-SPEC.md]  
**Warning signs:** Completion succeeds, wallet updates, but the mission card vanishes with no `Missão concluída` or `Aguardando aprovação` message. [CITED: 05-UI-SPEC.md]

### Pitfall 3: Promise Coins Before Approval

**What goes wrong:** UI says the child earned coins for an approval-required mission. [CITED: 05-CONTEXT.md]  
**Why it happens:** Mobile assumes every completion credits wallet. [VERIFIED: AssignedMissionService.java]  
**How to avoid:** Branch on returned `status`; show `Aguardando aprovação` for `AWAITING_APPROVAL`, and show coin gain only for `COMPLETED` plus wallet refetch. [VERIFIED: AssignedMissionService.java]  
**Warning signs:** Feedback text includes `+{coins}` when `snapshotRequiresApproval` is true and response status is `AWAITING_APPROVAL`. [VERIFIED: AssignedMissionResponse.java]

### Pitfall 4: Treating UI Affordability as Security

**What goes wrong:** Planner relies only on disabled buttons for insufficient balance. [CITED: 05-UI-SPEC.md]  
**Why it happens:** UI can compute missing coins from balance/cost, but wallet state can change between render and submit. [VERIFIED: WalletService.java]  
**How to avoid:** Keep disabled state and confirmation, then still handle backend `INSUFFICIENT_BALANCE`. [VERIFIED: WalletService.java; RewardRedemptionIntegrationTest.java]  
**Warning signs:** Reward code has no `ApiError.code === 'INSUFFICIENT_BALANCE'` branch. [VERIFIED: mobile/src/api/types.ts]

### Pitfall 5: Adding Visual Dependencies

**What goes wrong:** Implementation imports icon/image/Lottie packages to match Stitch exports. [CITED: docs/design/mobile-design-contract.md]  
**Why it happens:** Stitch screenshots include visual richness, but exported HTML/CSS/assets are not implementation sources. [CITED: docs/design/README.md]  
**How to avoid:** Use existing tokens, RN primitives, emojis, and domain components. [CITED: 05-UI-SPEC.md]  
**Warning signs:** New imports from `docs/design/stitch/*/code.html`, external images, or animation libraries. [CITED: docs/design/mobile-design-contract.md]

## Code Examples

Verified patterns from official/current sources:

### Add DTO Types Matching Backend Responses

```typescript
// Source: backend DTO records.
export type ChildResponse = {
  id: string;
  name: string;
  age: number | null;
  avatarKey: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssignedMissionStatus =
  | 'PENDING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type AssignedMissionResponse = {
  id: string;
  missionId: string;
  childId: string;
  status: AssignedMissionStatus;
  dueDate: string | null;
  completedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  snapshotTitle: string;
  snapshotDescription: string | null;
  snapshotCoinValue: number;
  snapshotRequiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
};
```

Source: `ChildResponse.java` and `AssignedMissionResponse.java`. [VERIFIED: backend DTOs]

### Redemption Confirmation View Model

```typescript
// Source: UI-SPEC redemption confirmation + WalletResponse/RewardResponse.
function getRewardAffordance(balance: number, reward: RewardResponse) {
  const missingCoins = Math.max(0, reward.cost - balance);

  return {
    canRedeem: missingCoins === 0,
    remainingBalance: balance - reward.cost,
    helperText:
      missingCoins === 0
        ? `Depois do resgate, ficam ${balance - reward.cost} moedas.`
        : `Faltam ${missingCoins} moedas`,
  };
}
```

Source: reward UI contract and wallet/reward DTOs. [CITED: 05-UI-SPEC.md] [VERIFIED: WalletResponse.java; RewardResponse.java]

### React Native Testing Library Async Assertion

```typescript
// Source: React Native Testing Library async utilities docs.
fireEvent.press(screen.getByRole('button', { name: 'Resgatar recompensa Cinema' }));

expect(await screen.findByText('Recompensa resgatada! Mostre para um responsável.')).toBeOnTheScreen();
```

Source: `findBy*` waits for async UI updates in RNTL. [CITED: https://callstack.github.io/react-native-testing-library/docs/api/misc/async]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-navigation-tabs` / v4-era package | `@react-navigation/bottom-tabs` under React Navigation 7.x | Current project uses React Navigation 7.x packages modified 2026-05-25. [VERIFIED: npm registry] | Use the official bottom-tabs package compatible with the installed navigation major. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |
| Manual tab-like state for app destinations | Nested tab navigator inside a stack | Current React Navigation docs document nesting navigators and bottom tabs. [CITED: https://reactnavigation.org/docs/nesting-navigators/] | Lets mission detail stay stack-based while home/missions/rewards/profile stay tabbed. [CITED: React Navigation docs] |
| Copying Stitch HTML/CSS | React Native primitives and tokens | Design contract created for mobile phases. [CITED: docs/design/mobile-design-contract.md] | Screens must match hierarchy/tone, not web implementation code. [CITED: docs/design/README.md] |
| Client-created mock data for unavailable backend | Real API only with loading/error/retry states | Locked in Phase 5 context. [CITED: 05-CONTEXT.md] | No mock fallback in child screens. [CITED: 05-CONTEXT.md] |

**Deprecated/outdated:**
- Child-scoped reward-redemption path in `docs/api-contract.md`: treat as stale for implementation unless a plan explicitly reconciles backend/docs. [CITED: docs/api-contract.md] [VERIFIED: RewardController.java]
- Required animation for success feedback: not required by Phase 5; stable banners/cards are sufficient. [CITED: 05-CONTEXT.md]

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|

**If this table is empty:** All claims in this research were verified or cited; no user confirmation needed.

## Open Questions

1. **Should Phase 5 update `docs/api-contract.md` to match the current reward redemption route?**
   - What we know: backend code, OpenAPI test, and UI-SPEC use `POST /rewards/{id}/redeem` with `{ childId }`. [VERIFIED: RewardController.java; OpenApiIntegrationTest.java; 05-UI-SPEC.md]
   - What's unclear: whether documentation cleanup belongs inside Phase 5 or Phase 7 docs polish. [CITED: .planning/ROADMAP.md]
   - Recommendation: Plan mobile against current backend route now; add a small docs/contract reconciliation task only if the planner needs contract consistency for Phase 5 acceptance. [VERIFIED: current backend route]

2. **Should the backend add a child-scoped redemption endpoint instead of using the existing route?**
   - What we know: current route is tested and works transactionally. [VERIFIED: RewardRedemptionIntegrationTest.java]
   - What's unclear: whether product/API style prefers `/children/{childId}/reward-redemptions`. [CITED: docs/api-contract.md]
   - Recommendation: Do not add a new backend endpoint unless the planner explicitly scopes it; Phase 5 can satisfy requirements with the real existing endpoint. [VERIFIED: backend implementation]

3. **How will demo data be created for manual mobile validation?**
   - What we know: Phase 7 owns demo seeds/documented setup, while Phase 5 requires real API data. [CITED: .planning/ROADMAP.md]
   - What's unclear: whether local manual validation during Phase 5 will create data through Swagger/backend calls or wait for Phase 6 responsible screens. [CITED: .planning/ROADMAP.md]
   - Recommendation: Planner should include manual setup instructions or backend test fixtures for at least one child, wallet balance, mission, and reward; do not add mock fallback. [CITED: 05-CONTEXT.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Mobile scripts and Expo tooling | yes | `v24.14.1` [VERIFIED: `node --version`] | — |
| npm | Mobile install/test scripts | yes | `11.11.0` [VERIFIED: `npm --version`] | — |
| Expo CLI via `npx expo` | Mobile dev server and Expo install | yes | `56.1.13` [VERIFIED: `npx expo --version`] | Use local package scripts if global CLI differs. [VERIFIED: mobile/package.json] |
| Jest | Mobile tests | yes | `29.7.0` [VERIFIED: `npx jest --version`] | — |
| Java runtime | Backend Maven tests/run | yes | OpenJDK `21.0.2`; backend target is Java `17`. [VERIFIED: `java -version`; backend/pom.xml] | Java 21 can run Java 17 target builds; install Java 17 only if build tooling rejects 21. [VERIFIED: Maven output] |
| Maven wrapper | Backend tests/run | yes | Maven `3.9.11` [VERIFIED: `./mvnw --version`] | Use wrapper, not system Maven. [VERIFIED: backend/.mvn wrapper output] |
| Docker | Testcontainers and local PostgreSQL | yes | Docker `29.5.2`; `habitinhos-postgres` running on 5432. [VERIFIED: `docker --version`; `docker ps`] | — |
| PostgreSQL CLI (`psql`) | Optional manual DB inspection | no | — [VERIFIED: `command -v psql`] | Use `docker exec habitinhos-postgres psql ...` if manual DB inspection is needed. [VERIFIED: docker-compose.yml] |
| `ctx7` | Preferred library docs lookup | no | — [VERIFIED: `command -v ctx7`] | Used official docs via web fallback. [CITED: React Navigation/Expo/RNTL docs] |
| `slopcheck` | Package legitimacy audit | yes after research install | `0.6.1` [VERIFIED: `pip3 install slopcheck` output] | If unavailable later, planner should rerun audit or gate install. [VERIFIED: package legitimacy protocol] |

**Missing dependencies with no fallback:**
- None for planning. [VERIFIED: environment probes]

**Missing dependencies with fallback:**
- `psql` is missing; use Docker for database inspection if needed. [VERIFIED: environment probes; docker-compose.yml]
- `ctx7` is missing; official docs were used as fallback. [VERIFIED: `command -v ctx7`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Mobile: Jest `29.7.0`, `jest-expo`, `@testing-library/react-native`; Backend: Spring Boot Test + MockMvc + Testcontainers. [VERIFIED: mobile/package.json; backend/pom.xml] |
| Config file | Mobile Jest config in `mobile/package.json`; setup in `mobile/jest.setup.ts`; backend config via Maven/Spring Boot test dependencies. [VERIFIED: mobile/package.json; mobile/jest.setup.ts; backend/pom.xml] |
| Quick run command | `cd mobile && npm test -- child --runInBand` after Wave 0 adds child tests. [VERIFIED: mobile/package.json test script] |
| Full suite command | `cd mobile && npm test -- --runInBand` and `cd backend && ./mvnw test`. [VERIFIED: mobile/package.json; backend README/pom] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| MOBL-04 | Child can select profile and reach child home/tabs. [CITED: .planning/REQUIREMENTS.md] | component/navigation | `cd mobile && npm test -- child-navigation --runInBand` | No; Wave 0 should add `mobile/src/features/child/__tests__/child-navigation.test.tsx`. |
| MOBL-05 | Child services call real API paths with Bearer token and no `familyUnitId`. [CITED: .planning/REQUIREMENTS.md] | unit/API wrapper | `cd mobile && npm test -- child-service --runInBand` | No; Wave 0 should add `mobile/src/features/child/__tests__/child-service.test.ts`. |
| MISS-04 | Mission list renders backend pending missions and empty/error states. [CITED: .planning/REQUIREMENTS.md] | component | `cd mobile && npm test -- child-missions --runInBand` | No; Wave 0 should add mission screen/card tests. |
| MISS-05 | Completing mission shows `COMPLETED` or `AWAITING_APPROVAL` feedback and refetches wallet/list. [CITED: .planning/REQUIREMENTS.md] | component + service | `cd mobile && npm test -- child-missions --runInBand` | No; Wave 0 should add completion tests. Backend coverage exists. [VERIFIED: AssignedMissionIntegrationTest.java] |
| REWD-03 | Rewards catalog lists active rewards from API. [CITED: .planning/REQUIREMENTS.md] | component | `cd mobile && npm test -- child-rewards --runInBand` | No; Wave 0 should add reward catalog tests. |
| REWD-04 | Redeem confirmation submits current backend route and shows success/refetched balance. [CITED: .planning/REQUIREMENTS.md] | component + service | `cd mobile && npm test -- child-rewards --runInBand` | No; Wave 0 should add redemption tests. Backend coverage exists. [VERIFIED: RewardRedemptionIntegrationTest.java] |
| REWD-05 | Insufficient balance disables/blocks UI and maps backend code to PT-BR. [CITED: .planning/REQUIREMENTS.md] | component + service | `cd mobile && npm test -- child-rewards --runInBand` | No; Wave 0 should add insufficient-balance tests. Backend coverage exists. [VERIFIED: RewardRedemptionIntegrationTest.java] |
| WALT-01 | Home and header render `WalletResponse.balance`. [CITED: .planning/REQUIREMENTS.md] | component | `cd mobile && npm test -- child-home --runInBand` | No; Wave 0 should add home tests. Backend coverage exists. [VERIFIED: WalletIntegrationTest.java] |

### Sampling Rate

- **Per task commit:** `cd mobile && npm test -- child --runInBand` plus `cd mobile && npm run typecheck` after child code exists. [VERIFIED: mobile/package.json]
- **Per wave merge:** `cd mobile && npm test -- --runInBand`; run targeted backend tests if backend/docs route contract changed. [VERIFIED: mobile/package.json; backend tests]
- **Phase gate:** `cd mobile && npm test -- --runInBand`, `cd mobile && npm run typecheck`, `cd backend && ./mvnw test`, and manual Expo smoke against running backend. [VERIFIED: package scripts; backend README]

### Wave 0 Gaps

- [ ] `mobile/src/features/child/__tests__/child-service.test.ts` — covers real path construction, token use, no `familyUnitId`, route drift.
- [ ] `mobile/src/features/child/__tests__/child-navigation.test.tsx` — covers FamilyHub child entry, profile selection, tabs, profile switch.
- [ ] `mobile/src/features/child/__tests__/child-home.test.tsx` — covers balance, pending missions, loading/empty/error.
- [ ] `mobile/src/features/child/__tests__/child-missions.test.tsx` — covers completion loading, completed feedback, awaiting approval feedback.
- [ ] `mobile/src/features/child/__tests__/child-rewards.test.tsx` — covers affordability, confirmation, success, `INSUFFICIENT_BALANCE`.
- [ ] Backend contract update only if planner changes redemption route; otherwise existing backend tests cover current route. [VERIFIED: RewardRedemptionIntegrationTest.java; OpenApiIntegrationTest.java]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Continue responsible JWT Bearer session; do not authenticate child profile as `User`. [VERIFIED: mobile/src/api/client.ts; backend/src/main/java/br/com/habitinhos/auth/CurrentUserProvider.java; 05-CONTEXT.md] |
| V3 Session Management | yes | Continue SecureStore token persistence and AuthContext restore/logout flow. [VERIFIED: mobile/src/storage/tokenStorage.ts; mobile/src/features/auth/AuthContext.tsx] |
| V4 Access Control | yes | Backend derives `familyUnitId` from JWT and uses family-scoped lookups; mobile must not send `familyUnitId`. [VERIFIED: mobile/src/api/client.ts; backend services] |
| V5 Input Validation | yes | Backend DTO validation and service preconditions own mutation validation; mobile confirms redemption and disables duplicate submit. [VERIFIED: ChildRequest.java; RedeemRewardRequest.java; AssignedMissionService.java; WalletService.java] |
| V6 Cryptography | yes | Use existing Spring Security JWT and Expo SecureStore; do not add local PIN hashing/validation in Phase 5. [VERIFIED: backend/src/main/java/br/com/habitinhos/config/SecurityConfig.java; mobile/src/storage/tokenStorage.ts; 05-CONTEXT.md] |

### Known Threat Patterns for Expo React Native + Spring REST

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client attempts family/tenant escalation with `familyUnitId` | Elevation of Privilege | Existing mobile guard rejects `familyUnitId`; backend derives tenant from JWT. [VERIFIED: mobile/src/api/client.ts; CurrentUserProvider.java] |
| Child IDOR across families | Elevation of Privilege / Information Disclosure | Backend `findByIdAndFamilyUnitId...` and safe 404s. [VERIFIED: AssignedMissionIntegrationTest.java; RewardRedemptionIntegrationTest.java; WalletIntegrationTest.java] |
| Duplicate mission completion submits | Tampering | Disable in-flight button and rely on backend `INVALID_MISSION_STATUS`. [VERIFIED: AssignedMissionService.java; AssignedMissionIntegrationTest.java] |
| Stale wallet balance during redemption | Tampering | Confirm in UI, then rely on transactional backend debit and handle `INSUFFICIENT_BALANCE`. [VERIFIED: WalletService.java; RewardRedemptionIntegrationTest.java] |
| Token exposure in child mode | Information Disclosure | Keep session in AuthContext/SecureStore and do not display token or family IDs. [VERIFIED: mobile/src/storage/tokenStorage.ts; mobile/src/api/types.ts] |
| Raw backend error disclosure | Information Disclosure | Map `ApiError` to friendly PT-BR messages and avoid raw stack/HTTP details. [VERIFIED: mobile/src/api/client.ts; GlobalExceptionHandler.java; 05-UI-SPEC.md] |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/05-fluxo-da-crian-a/05-CONTEXT.md` — locked decisions, scope, deferred PIN, real API rule. [CITED: local file]
- `.planning/phases/05-fluxo-da-crian-a/05-UI-SPEC.md` — approved routes, UI states, copy, components, refresh rules. [CITED: local file]
- `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` — requirement IDs, Phase 5 plan split, success criteria. [CITED: local files]
- `docs/api-contract.md` — documented API contract and redemption route drift. [CITED: local file]
- Backend controllers/services/DTOs/tests under `backend/src/main/java/br/com/habitinhos/{children,missions,rewards,wallet}` and `backend/src/test/java`. [VERIFIED: codebase grep/read]
- Mobile API/navigation/auth/components/theme/tests under `mobile/src`. [VERIFIED: codebase grep/read]
- React Navigation bottom tabs docs — official bottom tab package and custom tab bar options. [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/]
- React Navigation nesting docs — nested stack/tab architecture. [CITED: https://reactnavigation.org/docs/nesting-navigators/]
- Expo docs on using libraries — `npx expo install` for compatible native packages. [CITED: https://docs.expo.dev/workflow/using-libraries]
- React Native Testing Library async docs — async UI assertions. [CITED: https://callstack.github.io/react-native-testing-library/docs/api/misc/async]
- npm registry and downloads API for `@react-navigation/bottom-tabs`, `@react-navigation/native`, `@react-navigation/native-stack`, `expo`, `@testing-library/react-native`. [VERIFIED: npm registry]
- `slopcheck 0.6.1` text-mode package audit for `@react-navigation/bottom-tabs`. [VERIFIED: slopcheck]

### Secondary (MEDIUM confidence)

- None used for core recommendations; web search results were used only to locate official documentation URLs. [VERIFIED: source selection]

### Tertiary (LOW confidence)

- None. [VERIFIED: assumptions log empty]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — current package versions were read from `mobile/package.json`, selected package was confirmed by official React Navigation docs, npm registry, npm downloads API, no postinstall output, and slopcheck `[OK]`. [VERIFIED: npm registry + docs + slopcheck]
- Architecture: HIGH — based on current mobile navigation/API/AuthContext and backend controllers/services/DTOs. [VERIFIED: codebase]
- API contract reality: HIGH — backend code and OpenAPI tests confirm current routes; docs drift is explicitly identified. [VERIFIED: backend code/tests] [CITED: docs/api-contract.md]
- UI patterns: HIGH — approved UI-SPEC and mobile design contract are direct local sources. [CITED: 05-UI-SPEC.md; docs/design/mobile-design-contract.md]
- Pitfalls: HIGH — each pitfall maps to code/doc evidence. [VERIFIED: codebase] [CITED: local docs]
- Validation: HIGH for framework detection; MEDIUM for exact new test filenames because they are planner-facing recommendations, not existing files. [VERIFIED: package scripts/tests]

**Research date:** 2026-06-02  
**Valid until:** 2026-06-09 for npm/package recommendations; 2026-07-02 for local code/API findings unless backend routes change.
