# Phase 06: Fluxo do responsável - Research

**Researched:** 2026-06-02  
**Domain:** Expo React Native responsible-management flow over Spring Boot REST API  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

Source: `.planning/phases/06-fluxo-do-respons-vel/06-CONTEXT.md` [CITED: .planning/phases/06-fluxo-do-respons-vel/06-CONTEXT.md]

### Locked Decisions

## Implementation Decisions

### Ritmo do Dashboard
- **D-01:** The responsible dashboard opens with a family overview, not an
  approvals-first admin queue.
- **D-02:** The family overview uses cards per child as the main summary
  pattern. Each card should show avatar/name, mission status, balance context,
  and a `Ver detalhes` path.
- **D-03:** Inside child cards, missions for today or pending missions are the
  primary signal after name/avatar. Coin balance remains visible but secondary.
- **D-04:** Quick actions appear immediately after the family overview:
  `Nova missão`, `Nova recompensa`, and `Adicionar criança`.
- **D-05:** Pending approvals appear as a badge/counter and navigation affordance
  to a dedicated approvals screen. Do not list approval cards inline on the
  dashboard.
- **D-06:** Child detail is an operational summary: missions, balance, recent
  rewards/redemptions, and action to edit the child.
- **D-07:** Recent redemptions appear as a short section near the end of the
  dashboard, limited to 2 or 3 items.
- **D-08:** Empty dashboard states should briefly explain the system before
  buttons, orienting new families around children, missions, coins, and
  rewards.

### Criação e Atribuição de Missões
- **D-09:** `Nova missão` is a guided two-step flow from the user's point of
  view: mission data first, then child assignment. Implementation may call
  `POST /missions` followed by `POST /missions/{id}/assign`, but the UI should
  feel like one coherent flow.
- **D-10:** The assignment step shows all active children in the family with
  avatar/name and multi-select affordances.
- **D-11:** No child is pre-selected by default. The responsible adult manually
  chooses one or more children to avoid accidental assignment.
- **D-12:** Mission due date is optional and simple. If the field is empty, the
  mission has no due date.
- **D-13:** Approval behavior is a highlighted choice, not a hidden default.
  Use clear copy such as `Precisa aprovar antes de pagar moedas?` and explain
  the consequence.
- **D-14:** After successful creation and assignment, show a confirmation
  summary with the mission, selected children, and approval rule.
- **D-15:** If mission creation succeeds but assignment fails, the app must be
  honest: show that the mission was created, assignment is pending, and offer a
  retry path for assignment. Do not claim the whole operation failed if the
  backend already saved the mission.
- **D-16:** `Gerenciar missões` lists active missions first and inactive
  missions separately at the end or inside a collapsed section.
- **D-17:** Editing a mission changes the template from that point forward.
  Already-created assigned missions preserve their snapshot values.
- **D-18:** Mission deactivation requires explicit confirmation explaining that
  the mission disappears from new assignments while history and existing
  assignments remain.
- **D-19:** Active missions keep an `Atribuir crianças` action from the mission
  detail or list item so the responsible adult can assign the mission to more
  children later.

### Carry Forward From Locked Project Decisions
- **D-20:** Mobile implementation uses Expo, React Native, TypeScript, React
  Navigation, PT-BR visible text, and English technical identifiers.
- **D-21:** Backend remains the source of truth for family isolation, child
  data, mission rules, approvals, rewards, wallet balances, and history.
- **D-22:** Phase 6 must consume the real backend API and must not silently
  switch to local mock/offline responsible data when the backend is unavailable.
- **D-23:** Phase 6 must follow `06-UI-SPEC.md`,
  `docs/design/mobile-design-contract.md`, and
  `docs/design/phase-design-map.md`. Stitch screenshots are visual references
  only; `code.html` exports must not be copied into React Native.
- **D-24:** Soft deactivation preserves history for children, missions, and
  rewards. The mobile UI should explain deactivation instead of presenting it
  as destructive deletion.

### the agent's Discretion

- The user chose to discuss dashboard rhythm and mission creation/assignment.
  Detailed mobile management patterns for children/rewards and the dedicated
  approval/rejection screen were not deep-dived here. Researcher/planner may
  choose pragmatic defaults that preserve the roadmap scope, approved UI-SPEC,
  backend API contracts, and decisions D-01 through D-24.
- Exact component decomposition, route names, loading/refetch cadence, and
  secondary sorting are left to the researcher/planner.
- If current backend response shapes do not expose every dashboard aggregate or
  recent-redemption field desired by the UI, the planner should decide whether
  to compose the dashboard from existing endpoints or create minimal backend
  support within Phase 6 scope. Do not invent client-only family truth.

### Deferred Ideas (OUT OF SCOPE)

## Deferred Ideas

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOBL-03 | Responsible flow includes login, family onboarding, dashboard, children, missions, assignments, approvals, rewards, and child details. [CITED: .planning/REQUIREMENTS.md] | Replace `ResponsibleStub` with responsible tabs, stack detail/form routes, real API services, and PT-BR states. [VERIFIED: mobile/src/navigation/RootNavigator.tsx; 06-UI-SPEC.md] |
| DASH-01 | Responsible dashboard lists children in the family. [CITED: .planning/REQUIREMENTS.md] | Use backend family-scoped children data; dashboard should not synthesize children locally. [VERIFIED: ChildController.java; ChildService.java] |
| DASH-02 | Dashboard shows balance by child. [CITED: .planning/REQUIREMENTS.md] | Use wallet data as backend source of truth; recommend a dashboard endpoint to avoid N+1 wallet calls. [VERIFIED: WalletController.java; WalletService.java] |
| DASH-03 | Dashboard shows pending, awaiting approval, and completed missions. [CITED: .planning/REQUIREMENTS.md] | Existing mobile-accessible assigned-mission endpoints do not expose all statuses by child; plan minimal backend support. [VERIFIED: AssignedMissionController.java; AssignedMissionService.java] |
| DASH-04 | Dashboard shows recent reward redemptions. [CITED: .planning/REQUIREMENTS.md] | Current backend exposes wallet transactions but no redemption-list endpoint with reward snapshots; plan dashboard/recent-redemption support. [VERIFIED: WalletController.java; RewardController.java; docs/api-contract.md] |
| CHLD-03 | Responsible adult can list, view, edit, and deactivate children in the family. [CITED: .planning/REQUIREMENTS.md] | Existing CRUD exists, but list currently returns active children only; management needs `includeInactive` or equivalent. [VERIFIED: ChildController.java; ChildService.java] |
| MISS-01 | Responsible adult can create, edit, list, view, and deactivate missions. [CITED: .planning/REQUIREMENTS.md] | Existing CRUD exists, but list currently returns active missions only; management needs inactive visibility. [VERIFIED: MissionController.java; MissionService.java] |
| MISS-03 | Responsible adult can assign a mission to one or more children. [CITED: .planning/REQUIREMENTS.md] | Use `POST /missions/{id}/assign` with selected active child IDs and optional due date. [VERIFIED: MissionController.java; AssignMissionRequest.java] |
| MISS-08 | Responsible adult can approve awaiting mission completion. [CITED: .planning/REQUIREMENTS.md] | Use `GET /assigned-missions/pending-approval` and `POST /assigned-missions/{id}/approve`; refetch dashboard/wallet after success. [VERIFIED: AssignedMissionController.java; AssignedMissionService.java] |
| MISS-09 | Responsible adult can reject awaiting mission completion with an optional reason. [CITED: .planning/REQUIREMENTS.md] | Use `POST /assigned-missions/{id}/reject` with optional `reason`; confirmation UI required. [VERIFIED: AssignedMissionController.java; RejectAssignedMissionRequest.java; 06-UI-SPEC.md] |
| REWD-01 | Responsible adult can create, edit, list, view, and deactivate rewards. [CITED: .planning/REQUIREMENTS.md] | Existing CRUD exists, but list currently returns active rewards only; responsible management needs inactive visibility without breaking child catalog. [VERIFIED: RewardController.java; RewardService.java] |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- No `AGENTS.md` exists at the project root. [VERIFIED: codebase grep]
- `mobile/AGENTS.md` applies to the mobile subtree: build Android-first with React Native, Expo, TypeScript; follow `docs/design/`; visually recreate Stitch screenshot intent without copying web exports; use reusable components; keep the app lightweight and performant. [CITED: mobile/AGENTS.md]
- `mobile/AGENTS.md` forbids external images, Lottie, complex SVGs, heavy assets, and favors emojis for icons/categories/missions/rewards/avatars. [CITED: mobile/AGENTS.md]
- `mobile/AGENTS.md` says mock data may be used when the backend does not exist, but Phase 6 has a real backend and locked decision D-22 explicitly forbids silent mock/offline responsible data fallback. For Phase 6, D-22 takes precedence. [CITED: mobile/AGENTS.md; .planning/phases/06-fluxo-do-respons-vel/06-CONTEXT.md]
- No project-defined `.codex/skills/` or `.agents/skills/` directories with `SKILL.md` files were found. [VERIFIED: codebase grep]
- Phase 6 must honor the mobile design contract and UI-SPEC; screenshots are visual references and `code.html` exports are prohibited as implementation sources. [CITED: docs/design/mobile-design-contract.md; docs/design/phase-design-map.md; .planning/phases/06-fluxo-do-respons-vel/06-UI-SPEC.md]

## Graph Context

No `.planning/graphs/graph.json` exists and `graphify` is disabled in this workspace, so no semantic graph context was injected. Research uses direct local document/code reads instead. [VERIFIED: shell]

## Summary

Phase 6 should be planned as a responsible mobile feature slice plus minimal backend contract support. The mobile work replaces `ResponsibleStub` with responsible tabs and stack routes, follows the same real-API service pattern established in Phase 5, and composes screens from existing tokens/components plus responsible-domain components. [VERIFIED: mobile/src/navigation/RootNavigator.tsx; mobile/src/features/child/childService.ts; 06-UI-SPEC.md]

The main planning risk is trying to satisfy dashboard and administrative-list requirements only from current endpoints. Current `GET /children`, `GET /missions`, and `GET /rewards` return active records only, while Phase 6 requires management screens that can explain inactive records. Current assigned-mission endpoints expose pending-for-child and pending-approval queues, but not a complete per-child dashboard summary of pending/awaiting/completed missions. Current reward redemption data is persisted and linked to wallet transactions, but no implemented endpoint lists recent redemptions with reward snapshot details. [VERIFIED: ChildService.java; MissionService.java; RewardService.java; AssignedMissionService.java; WalletService.java]

**Primary recommendation:** Plan a small backend Wave 0/Plan 06-01 support task for `GET /dashboard/responsible` plus `includeInactive`-style responsible list support for children, missions, and rewards; then implement mobile responsible screens over those real contracts. [CITED: docs/api-contract.md] [VERIFIED: backend controller/service audit]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Responsible mode navigation | Browser / Client | — | React Navigation owns route state, tabs, details, and forms in the Expo app. [CITED: https://reactnavigation.org/docs/typescript/] [VERIFIED: mobile/src/navigation/RootNavigator.tsx] |
| Dashboard aggregate | API / Backend | Browser / Client | Backend owns family isolation, balances, mission states, approvals, and redemption history; mobile renders/refetches real summaries. [CITED: docs/api-contract.md] [VERIFIED: backend services] |
| Child CRUD and deactivation | API / Backend | Browser / Client | Backend validates and soft-deactivates; mobile owns PT-BR form UX and confirmation. [VERIFIED: ChildController.java; ChildService.java; 06-UI-SPEC.md] |
| Mission CRUD and assignment | API / Backend | Browser / Client | Backend creates mission templates and assigned snapshots; mobile owns two-step guided flow and partial-failure feedback. [VERIFIED: MissionController.java; AssignedMissionService.java; 06-CONTEXT.md] |
| Approval/rejection | API / Backend | Browser / Client | Backend enforces `AWAITING_APPROVAL` transitions and wallet credits; mobile disables duplicate actions and refetches affected data. [VERIFIED: AssignedMissionService.java; WalletService.java] |
| Reward CRUD and deactivation | API / Backend | Browser / Client | Backend validates costs and soft-deactivates; mobile owns management list/form states. [VERIFIED: RewardController.java; RewardService.java] |
| Wallet balances and coin history | API / Backend | Browser / Client | Backend updates balances transactionally and returns wallet/transaction data; mobile never recalculates authority. [VERIFIED: WalletService.java; CoinTransactionResponse.java] |
| Access control and tenant isolation | API / Backend | Browser / Client | Mobile supplies Bearer JWT only; backend derives `familyUnitId` through authenticated context. [VERIFIED: mobile/src/api/client.ts; backend/src/main/java/br/com/habitinhos/auth/CurrentUserProvider.java] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Expo [VERIFIED: npm registry; CITED: https://docs.expo.dev/versions/latest/] | Project `~56.0.8`; npm latest `56.0.8`, modified 2026-05-29. [VERIFIED: mobile/package.json; npm registry] | Mobile runtime/toolchain. | Project stack is Expo; Expo SDK 56 targets React Native 0.85 and React 19.2.3. [CITED: https://docs.expo.dev/versions/latest/] |
| React Native [CITED: docs/design/mobile-design-contract.md] | Project `0.85.3`. [VERIFIED: mobile/package.json] | Native UI primitives. | Design contract requires RN primitives such as `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`, and `SafeAreaView`. [CITED: docs/design/mobile-design-contract.md] |
| TypeScript [VERIFIED: codebase grep] | Project `~6.0.3`; `strict: true`. [VERIFIED: mobile/package.json; mobile/tsconfig.json] | Type-safe DTOs, routes, and component props. | React Navigation docs require strict/null checking for reliable inference. [CITED: https://reactnavigation.org/docs/typescript/] |
| React Navigation Native [VERIFIED: npm registry; CITED: https://reactnavigation.org/docs/typescript/] | Project/latest `7.2.5`, modified 2026-05-25. [VERIFIED: npm registry; mobile/package.json] | Navigation container/core APIs. | Existing app already uses `NavigationContainer`. [VERIFIED: RootNavigator.tsx] |
| React Navigation Native Stack [VERIFIED: npm registry; CITED: https://reactnavigation.org/docs/typescript/] | Project/latest `7.16.0`, modified 2026-05-25. [VERIFIED: npm registry; mobile/package.json] | Auth/family/responsible stack screens. | Existing root stack uses `createNativeStackNavigator`; docs support typed `NativeStackScreenProps`. [VERIFIED: RootNavigator.tsx] [CITED: https://reactnavigation.org/docs/typescript/] |
| React Navigation Bottom Tabs [VERIFIED: npm registry; CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] | Project/latest `7.16.2`, modified 2026-05-25. [VERIFIED: npm registry; mobile/package.json] | Responsible tabs: `Início`, `Missões`, `Recompensas`, `Perfil`. | Existing child flow already has the dependency; official docs support a custom `tabBar` prop. [VERIFIED: mobile/package.json; ChildTabsScreen.tsx] [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |
| Existing `apiRequest` wrapper [VERIFIED: codebase grep] | Project-local. [VERIFIED: mobile/src/api/client.ts] | Bearer auth, JSON parsing, PT-BR errors, `familyUnitId` guard. | Keeps mobile API behavior consistent with prior phases. [VERIFIED: mobile/src/features/auth/authService.ts; mobile/src/features/child/childService.ts] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react-native` [VERIFIED: npm registry; CITED: https://callstack.github.io/react-native-testing-library/cookbook/basics/async-tests] | Project/latest `13.3.3`, modified 2026-05-29. [VERIFIED: npm registry; mobile/package.json] | Mobile component and interaction tests. | Use `findBy*`/`waitFor` for async loading and mutation assertions. [CITED: https://callstack.github.io/react-native-testing-library/cookbook/basics/async-tests] |
| Jest + `jest-expo` [VERIFIED: codebase grep] | Jest `29.7.0`, `jest-expo` `^56.0.4`. [VERIFIED: mobile/package.json] | Test runner for mobile screens/services. | Existing mobile tests already use this configuration. [VERIFIED: mobile/jest.setup.ts; mobile/src/features/child/__tests__] |
| Spring Boot + Maven wrapper [VERIFIED: codebase grep] | Maven wrapper `3.9.11`; runtime Java available `21.0.2` for Java 17-target backend. [VERIFIED: ./mvnw --version; java -version] | Minimal backend contract support. | Use only for dashboard/list support needed by Phase 6 success criteria. [VERIFIED: backend controllers/services] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Minimal `GET /dashboard/responsible` backend support | Compose dashboard with `GET /children`, per-child wallets, pending missions, pending approvals, and wallet transactions | Client composition causes N+1 calls and still cannot retrieve completed mission counts or reward snapshot titles from current endpoints. [VERIFIED: backend endpoint audit] |
| `includeInactive` query/default-preserving list support | Change existing list endpoints to return all records | Changing defaults would risk breaking Phase 5 child catalog/profile selection assumptions that active-only lists are used for child-facing flows. [VERIFIED: childService.ts; ChildProfileSelectScreen tests; RewardService.java] |
| Existing service/hooks pattern | Add React Query/SWR | No data-fetching library is installed; Phase 5 already works with small services plus screen-owned loading/refetch state. [VERIFIED: mobile/package.json; childService.ts; child tests] |
| Simple text/date input for due date | Add a date-picker dependency | UI-SPEC says due date is optional and simple; no new visual/native dependency is required for the MVP. [CITED: 06-CONTEXT.md; 06-UI-SPEC.md] |

**Installation:**

```bash
# No new package install is recommended for Phase 6.
```

**Version verification:** Package versions above were verified with `npm view` against the npm registry. [VERIFIED: npm registry]

## Package Legitimacy Audit

Phase 6 should install no new external packages. [VERIFIED: mobile/package.json; 06-UI-SPEC.md]

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| none | — | — | — | — | not run | No install planned |

**Packages removed due to slopcheck [SLOP] verdict:** none. [VERIFIED: no new package recommendation]  
**Packages flagged as suspicious [SUS]:** none. [VERIFIED: no new package recommendation]

## Architecture Patterns

### System Architecture Diagram

```mermaid
flowchart TD
  Auth[Authenticated responsible session] --> Hub[FamilyHub: Sou responsável]
  Hub --> Tabs[ResponsibleTabs]
  Tabs --> Home[ResponsibleHome]
  Tabs --> Missions[ResponsibleMissions]
  Tabs --> Rewards[ResponsibleRewards]
  Tabs --> Profile[ResponsibleProfile]
  Home --> ChildDetail[ResponsibleChildDetail]
  Missions --> MissionForm[ResponsibleMissionForm]
  Missions --> Approvals[ResponsibleApprovals]
  Rewards --> RewardForm[ResponsibleRewardForm]
  Home -->|GET /dashboard/responsible| DashboardApi[Dashboard API]
  MissionForm -->|POST /missions then POST /missions/{id}/assign| MissionApi[Mission APIs]
  Approvals -->|GET pending approval, approve/reject| AssignedMissionApi[Assigned Mission APIs]
  RewardForm -->|CRUD rewards| RewardApi[Reward APIs]
  ChildDetail -->|child/wallet/history| ChildWalletApi[Child + Wallet APIs]
  DashboardApi --> CurrentUser[CurrentUser family scope]
  MissionApi --> CurrentUser
  AssignedMissionApi --> CurrentUser
  RewardApi --> CurrentUser
  ChildWalletApi --> CurrentUser
  CurrentUser --> Domain[Children / Missions / Rewards / Wallet services]
  Domain --> DB[(PostgreSQL)]
  DB --> Domain --> Tabs
```

Source basis: current mobile navigation/API wrapper, backend controller/service audit, and Phase 6 UI-SPEC. [VERIFIED: RootNavigator.tsx; api/client.ts; backend controllers/services; 06-UI-SPEC.md]

### Recommended Project Structure

```text
mobile/src/
├── api/
│   └── types.ts                         # add responsible dashboard/admin DTOs
├── features/
│   └── responsible/
│       ├── responsibleService.ts         # dashboard, children, missions, approvals, rewards API calls
│       ├── responsibleTypes.ts           # UI view-model helpers only when needed
│       ├── ResponsibleTabsScreen.tsx
│       ├── ResponsibleHomeScreen.tsx
│       ├── ResponsibleChildDetailScreen.tsx
│       ├── ResponsibleChildrenScreen.tsx
│       ├── ResponsibleChildFormScreen.tsx
│       ├── ResponsibleMissionsScreen.tsx
│       ├── ResponsibleMissionFormScreen.tsx
│       ├── ResponsibleApprovalsScreen.tsx
│       ├── ResponsibleRewardsScreen.tsx
│       ├── ResponsibleRewardFormScreen.tsx
│       ├── ResponsibleProfileScreen.tsx
│       └── components/
│           ├── MetricSummaryCard.tsx
│           ├── ChildSummaryCard.tsx
│           ├── ApprovalCard.tsx
│           ├── ManageListItem.tsx
│           ├── ResponsibleFormSection.tsx
│           ├── EmojiPicker.tsx
│           ├── CoinValueControl.tsx
│           ├── ChildPicker.tsx
│           ├── ConfirmActionSheet.tsx
│           ├── EmptyState.tsx            # may reuse child component if export is generalized
│           └── FeedbackBanner.tsx        # may reuse child component if export is generalized
└── navigation/
    ├── RootNavigator.tsx                 # replace ResponsibleStub route
    └── routes.ts                         # responsible stack/tab param lists

backend/src/main/java/br/com/habitinhos/dashboard/
├── ResponsibleDashboardController.java   # GET /dashboard/responsible
├── ResponsibleDashboardService.java
└── dto/
    └── ResponsibleDashboardResponse.java
```

This structure keeps Phase 6 domain UI in `features/responsible` and preserves the existing `features/child` implementation. [VERIFIED: current mobile feature layout; 06-UI-SPEC.md]

### Pattern 1: Responsible Service Mirrors Child Service

**What:** Add a small `responsibleService` object with token-aware functions using `apiRequest`. [VERIFIED: childService.ts; authService.ts]  
**When to use:** Use for every mobile call in Phase 6; screens own loading/error/success/refetch state. [VERIFIED: child screen tests]

**Example:**

```typescript
// Source: mobile/src/features/child/childService.ts + backend controllers [VERIFIED: codebase grep]
export const responsibleService = {
  listChildren(token: string, includeInactive = false) {
    const suffix = includeInactive ? '?includeInactive=true' : '';
    return apiRequest<ChildResponse[]>(`/children${suffix}`, { token });
  },

  createMission(token: string, body: MissionRequest) {
    return apiRequest<MissionResponse>('/missions', {
      method: 'POST',
      token,
      body,
    });
  },

  assignMission(token: string, missionId: string, body: AssignMissionRequest) {
    return apiRequest<AssignedMissionResponse[]>(`/missions/${missionId}/assign`, {
      method: 'POST',
      token,
      body,
    });
  },
};
```

### Pattern 2: Honest Create-Then-Assign Partial Failure

**What:** Treat mission creation and assignment as two backend mutations with separate outcomes. [CITED: 06-CONTEXT.md]  
**When to use:** Use in `ResponsibleMissionForm` create mode when one or more children are selected. [CITED: 06-UI-SPEC.md]

**Example:**

```typescript
// Source: Phase 6 D-09 and D-15 [CITED: 06-CONTEXT.md]
const mission = await responsibleService.createMission(token, missionPayload);

try {
  const assignments = await responsibleService.assignMission(token, mission.id, {
    childIds: selectedChildIds,
    dueDate: dueDate || null,
  });
  setFeedback({ kind: 'success', message: buildCreatedAndAssignedCopy(mission, assignments) });
} catch (error) {
  setDraftAssignmentRetry({
    missionId: mission.id,
    childIds: selectedChildIds,
    dueDate: dueDate || null,
  });
  setFeedback({
    kind: 'warning',
    message: 'Missão criada. A atribuição ficou pendente; tente atribuir novamente.',
  });
}
```

### Pattern 3: Backend Dashboard Summary

**What:** Add a responsible dashboard response that contains children with balances and mission counts, pending approvals preview/count, and recent redemptions. [CITED: docs/api-contract.md]  
**When to use:** Use for `ResponsibleHome` and initial child cards to avoid client-side invented aggregates. [CITED: 06-CONTEXT.md]

**Recommended response shape:**

```typescript
// Source: derived from existing DTOs and Phase 6 DASH requirements [VERIFIED: backend DTO audit; CITED: .planning/REQUIREMENTS.md]
export type ResponsibleDashboardResponse = {
  children: Array<{
    child: ChildResponse;
    balance: number;
    missionCounts: {
      pending: number;
      awaitingApproval: number;
      completed: number;
    };
  }>;
  pendingApprovals: AssignedMissionResponse[];
  pendingApprovalCount: number;
  recentRedemptions: Array<{
    id: string;
    childId: string;
    childName: string;
    rewardTitle: string;
    cost: number;
    redeemedAt: string;
  }>;
};
```

### Anti-Patterns to Avoid

- **Mocking family truth on mobile:** If a section fails, show localized error/retry instead of zeros or fake children/rewards. [CITED: 06-CONTEXT.md; 06-UI-SPEC.md]
- **Changing list defaults globally:** Do not make `/rewards` return inactive rewards by default because Phase 5 child catalog uses the current active-only behavior. [VERIFIED: RewardService.java; childService.ts]
- **Recalculating balances on the client:** Wallet balance comes from backend wallet state after mutations. [VERIFIED: WalletService.java; WalletController.java]
- **Treating deactivation as deletion:** Copy must explain history preservation. [CITED: 06-CONTEXT.md; 06-UI-SPEC.md]
- **Copying Stitch web exports:** Use screenshots only; do not copy HTML/CSS/Tailwind/DOM. [CITED: docs/design/mobile-design-contract.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab navigation | Local `useState` tab switcher pretending to be navigation | `@react-navigation/bottom-tabs` with custom `tabBar` | Existing dependency and official navigator preserve route semantics. [VERIFIED: mobile/package.json] [CITED: https://reactnavigation.org/docs/bottom-tab-navigator/] |
| API auth/error handling | Per-screen `fetch` wrappers | Existing `apiRequest` | Centralizes Bearer token, JSON parsing, PT-BR errors, and familyUnitId guard. [VERIFIED: mobile/src/api/client.ts] |
| Dashboard counts | Client-side guessed counters | `GET /dashboard/responsible` or backend-computed DTO | Current endpoints do not expose all required mission/redemption data. [VERIFIED: backend endpoint audit] |
| Wallet mutation rules | Mobile balance math | Backend wallet services | Backend enforces transactional credits/debits and duplicate prevention. [VERIFIED: WalletService.java] |
| Form controls | New visual library/date picker | RN primitives + project tokens/components | UI-SPEC prohibits new visual dependencies unless concretely needed. [CITED: 06-UI-SPEC.md; docs/design/mobile-design-contract.md] |
| Validation authority | Client-only validation | Client UX validation plus backend Jakarta validation | Backend DTOs already define required fields and positive coin/cost constraints. [VERIFIED: ChildRequest.java; MissionRequest.java; CreateRewardRequest.java] |

**Key insight:** Phase 6 complexity is data-contract completeness, not a missing frontend library. [VERIFIED: backend endpoint audit; mobile package audit]

## Common Pitfalls

### Pitfall 1: Active-Only Lists Hide Deactivated Records

**What goes wrong:** Responsible management screens cannot show inactive children, missions, or rewards after deactivation. [VERIFIED: ChildService.java; MissionService.java; RewardService.java]  
**Why it happens:** Existing `list` services query only `ActiveTrue`. [VERIFIED: repository/service audit]  
**How to avoid:** Add default-preserving `includeInactive=true` support or separate responsible management endpoints. [ASSUMED]  
**Warning signs:** Tests can deactivate an item but cannot find it in the management list afterward. [ASSUMED]

### Pitfall 2: Dashboard N+1 Still Misses Required Data

**What goes wrong:** Mobile makes many child/wallet/mission calls but still cannot show completed counts or redemption titles reliably. [VERIFIED: AssignedMissionService.java; WalletService.java; RewardService.java]  
**Why it happens:** Current child mission endpoint returns only `PENDING`; wallet transactions expose `rewardRedemptionId` but not reward snapshot title. [VERIFIED: AssignedMissionService.java; CoinTransactionResponse.java]  
**How to avoid:** Implement a small `GET /dashboard/responsible` response aligned to DASH-01..DASH-04. [CITED: docs/api-contract.md]  
**Warning signs:** UI code maps missing data to zero or generic labels like `Resgate`. [ASSUMED]

### Pitfall 3: Mission Create Success Gets Reported as Full Failure

**What goes wrong:** `POST /missions` succeeds, `POST /missions/{id}/assign` fails, and UI says mission creation failed. [CITED: 06-CONTEXT.md]  
**Why it happens:** The guided UI feels like one flow, but backend mutations are separate. [VERIFIED: MissionController.java]  
**How to avoid:** Store retry context for assignment and show warning copy that the mission was created. [CITED: 06-CONTEXT.md]  
**Warning signs:** Error handlers wrap create+assign in one generic catch message. [ASSUMED]

### Pitfall 4: Approval Success Does Not Refresh Wallet/Dashboard

**What goes wrong:** Approval credits coins in backend but responsible dashboard still shows stale balance or pending count. [VERIFIED: AssignedMissionService.java; WalletService.java]  
**Why it happens:** Approval mutation returns assigned mission status, not the child wallet summary. [VERIFIED: AssignedMissionResponse.java; WalletService.java]  
**How to avoid:** After approve/reject, refetch approvals and affected dashboard/wallet summary. [CITED: 06-UI-SPEC.md]  
**Warning signs:** Tests assert button success but not refreshed count/balance. [ASSUMED]

### Pitfall 5: Reward Management Reuses Child Catalog Assumptions

**What goes wrong:** Responsible screen cannot edit/deactivate inactive rewards because `/rewards` is active-only. [VERIFIED: RewardService.java]  
**Why it happens:** Phase 5 child reward catalog and Phase 6 management share the same path but need different visibility. [VERIFIED: childService.ts; RewardService.java]  
**How to avoid:** Preserve active-only default and add responsible management visibility explicitly. [ASSUMED]  
**Warning signs:** Child reward screen starts showing inactive rewards after backend changes. [ASSUMED]

## Code Examples

Verified patterns from current codebase and official docs.

### Typed Responsible Routes

```typescript
// Source: React Navigation TypeScript docs + existing routes.ts [CITED: https://reactnavigation.org/docs/typescript/] [VERIFIED: mobile/src/navigation/routes.ts]
export type ResponsibleTabParamList = {
  ResponsibleHome: undefined;
  ResponsibleMissions: undefined;
  ResponsibleRewards: undefined;
  ResponsibleProfile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleTabs: undefined;
  ResponsibleChildDetail: { childId: string };
  ResponsibleChildForm: { childId?: string };
  ResponsibleMissionForm: { missionId?: string };
  ResponsibleApprovals: undefined;
  ResponsibleRewardForm: { rewardId?: string };
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
```

### Approval Mutation Pattern

```typescript
// Source: existing child mutation tests and AssignedMissionController [VERIFIED: child-missions.test.tsx; AssignedMissionController.java]
async function approveMission(assignedMissionId: string) {
  if (submittingId) return;

  setSubmittingId(assignedMissionId);
  try {
    const approved = await responsibleService.approveMission(token, assignedMissionId);
    setFeedback({
      kind: 'success',
      message: `Missão aprovada. +${approved.snapshotCoinValue} moedas.`,
    });
    await Promise.all([loadApprovals(), loadDashboard()]);
  } catch {
    setFeedback({
      kind: 'error',
      message: 'Não conseguimos revisar essa missão. Tente novamente.',
    });
  } finally {
    setSubmittingId(null);
  }
}
```

### Backend Query Shape for Inactive Visibility

```java
// Source: current active-only list services; recommended default-preserving extension [VERIFIED: ChildService.java; MissionService.java; RewardService.java] [ASSUMED]
@GetMapping
public List<ChildResponse> list(
    @RequestParam(defaultValue = "false") boolean includeInactive) {
  var currentUser = currentUserProvider.getCurrentUser();
  return childService.list(currentUser, includeInactive);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo SDK older RN pairing | Expo SDK 56 targets React Native 0.85 and React 19.2.3 | SDK 56 released 2026-05-21. [CITED: https://expo.dev/sdk/56] | Project package versions are aligned with current Expo SDK 56. [VERIFIED: mobile/package.json; npm registry] |
| Untyped route params | Explicit param-list types and navigator screen props | React Navigation 7.x docs current as of this research. [CITED: https://reactnavigation.org/docs/typescript/] | Keep responsible stack/tab params typed in `routes.ts`. [VERIFIED: mobile/src/navigation/routes.ts] |
| Raw async assertions in RN tests | `findBy*` and `waitFor` for async UI changes | Current RNTL docs recommend these helpers for waiting. [CITED: https://callstack.github.io/react-native-testing-library/cookbook/basics/async-tests] | Responsible screen tests should wait for backend-loaded UI and mutation feedback. [VERIFIED: child tests] |

**Deprecated/outdated:**
- Adding a new data-fetching dependency for simple Phase 6 CRUD is not needed because the project already has proven service/refetch patterns. [VERIFIED: mobile/package.json; childService.ts; child tests]
- Using raw React Test Renderer directly is discouraged by React Native docs in favor of component testing libraries for user-centric interaction tests. [CITED: https://reactnative.dev/docs/testing-overview]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `includeInactive=true` is the best minimal list-extension shape. | Common Pitfalls / Code Examples | Planner may choose separate management endpoints instead; tasks should still preserve active-only child defaults. |
| A2 | Dashboard should be backed by `GET /dashboard/responsible` rather than only client composition. | Summary / Patterns | If planner rejects backend work, mobile dashboard may need many calls and still have incomplete data. |
| A3 | Warning signs in pitfalls predict likely test failures. | Common Pitfalls | Planner may need to translate them into concrete tests. |

## Open Questions

1. **Exact backend shape for responsible dashboard**
   - What we know: `docs/api-contract.md` already names `GET /dashboard/responsible`, and current endpoints lack all dashboard data. [CITED: docs/api-contract.md] [VERIFIED: backend endpoint audit]
   - What's unclear: Exact DTO fields are not yet implemented. [VERIFIED: no dashboard package/controller found in backend source]
   - Recommendation: Plan the smallest DTO needed by DASH-01..DASH-04 and `ResponsibleHome`; avoid generic analytics. [ASSUMED]

2. **Inactive-list contract**
   - What we know: child/mission/reward list services are active-only today. [VERIFIED: ChildService.java; MissionService.java; RewardService.java]
   - What's unclear: Whether to use `includeInactive=true` or separate management endpoints. [ASSUMED]
   - Recommendation: Use `includeInactive=true` to preserve existing default behavior for Phase 5 screens. [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Mobile build/tests | yes | `v24.14.1` [VERIFIED: shell] | Expo SDK 56 minimum is Node 22.13.x, so current Node is sufficient. [CITED: https://docs.expo.dev/versions/latest/] |
| npm | Mobile scripts/package verification | yes | `11.11.0` [VERIFIED: shell] | — |
| Expo CLI | Mobile dev server | global CLI not found [VERIFIED: shell] | — | Use local package scripts: `cd mobile && npm run start` or `npx expo ...`. [VERIFIED: mobile/package.json] |
| Java | Backend support/tests | yes | `21.0.2` [VERIFIED: shell] | Backend targets Java 17; Java 21 can run it. [VERIFIED: backend Maven output] |
| Maven wrapper | Backend tests | yes | `3.9.11` [VERIFIED: ./mvnw --version] | Use `backend/./mvnw`; no system Maven required. [VERIFIED: shell] |
| Docker/PostgreSQL | Backend integration/local API | yes | `habitinhos-postgres` running for 27h. [VERIFIED: docker ps] | If down, use `docker compose up -d postgres`. [VERIFIED: docker-compose.yml] |
| ctx7 | Docs lookup fallback | no | — | Used official docs via web instead. [VERIFIED: shell; CITED: official docs URLs in Sources] |

**Missing dependencies with no fallback:** none found for planning. [VERIFIED: environment audit]  
**Missing dependencies with fallback:** global Expo CLI; use local npm/npx commands. [VERIFIED: environment audit]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest `29.7.0`, `jest-expo` `^56.0.4`, `@testing-library/react-native` `13.3.3`. [VERIFIED: mobile/package.json; npm registry] |
| Config file | `mobile/package.json` Jest preset and `mobile/jest.setup.ts`. [VERIFIED: codebase grep] |
| Quick run command | `cd mobile && npm test -- --runInBand responsible` [VERIFIED: package script exists] |
| Full suite command | `cd mobile && npm test -- --runInBand && cd ../backend && ./mvnw test` [VERIFIED: package script and Maven wrapper exist] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| MOBL-03 | Responsible navigation replaces stub with tabs/forms/details. | component/navigation | `cd mobile && npm test -- --runInBand responsible-navigation.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |
| DASH-01..DASH-04 | Dashboard renders children, balances, mission counts, approvals, recent redemptions from API. | service + component | `cd mobile && npm test -- --runInBand responsible-dashboard.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |
| CHLD-03 | Child list/detail/form/deactivate with inactive visibility. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-children.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |
| MISS-01, MISS-03 | Mission CRUD and create-then-assign partial-failure handling. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-missions.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |
| MISS-08, MISS-09 | Approval/rejection screen disables duplicate submits and refetches. | service + component | `cd mobile && npm test -- --runInBand responsible-approvals.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |
| REWD-01 | Reward management list/form/deactivation with inactive visibility. | service + component + backend if endpoint changes | `cd mobile && npm test -- --runInBand responsible-rewards.test.tsx` | No; Wave 0 create. [VERIFIED: no responsible tests found] |

### Sampling Rate

- **Per task commit:** run the targeted mobile Jest file for the touched screen/service. [VERIFIED: existing Phase 5 test pattern]
- **Per wave merge:** `cd mobile && npm test -- --runInBand`. [VERIFIED: mobile/package.json]
- **Backend contract task:** `cd backend && ./mvnw test`. [VERIFIED: Maven wrapper]
- **Phase gate:** full mobile suite plus backend tests if dashboard/list support is added. [ASSUMED]

### Wave 0 Gaps

- [ ] `mobile/src/features/responsible/__tests__/responsible-service.test.ts` — service routes, Bearer token, no `familyUnitId`. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-navigation.test.tsx` — FamilyHub to responsible tabs and profile actions. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-dashboard.test.tsx` — DASH-01..DASH-04. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-children.test.tsx` — CHLD-03. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-missions.test.tsx` — MISS-01, MISS-03. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-approvals.test.tsx` — MISS-08, MISS-09. [VERIFIED: no responsible tests found]
- [ ] `mobile/src/features/responsible/__tests__/responsible-rewards.test.tsx` — REWD-01. [VERIFIED: no responsible tests found]
- [ ] Backend dashboard/list tests if implementing `GET /dashboard/responsible` and inactive-list support. [VERIFIED: no dashboard controller/service found]

## Security Domain

### Applicable ASVS Categories

OWASP ASVS is a standard for web application security controls and includes authentication, session management, access control, validation, and cryptography categories. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Continue using existing responsible JWT login/session; Phase 6 must not create child/responsible pseudo-auth. [VERIFIED: AuthContext.tsx; 06-CONTEXT.md] |
| V3 Session Management | yes | Use stored responsible session token through `useAuth`; handle session-expired API errors with existing `ApiError.isSessionExpired`. [VERIFIED: AuthContext.tsx; api/types.ts] |
| V4 Access Control | yes | Backend derives family scope from `CurrentUser`; mobile must not send `familyUnitId`. [VERIFIED: api/client.ts; CurrentUserProvider.java] |
| V5 Input Validation | yes | Client validates for UX; backend DTO validation remains authoritative for names, PIN length, positive coins/costs, required recurrence/approval, and assignment child IDs. [VERIFIED: ChildRequest.java; MissionRequest.java; AssignMissionRequest.java; CreateRewardRequest.java] |
| V6 Cryptography | yes | Do not store plaintext PINs/passwords; existing child PIN hashing remains backend-only. [VERIFIED: ChildService.java; PROJECT.md] |

### Known Threat Patterns for Expo RN + Spring REST

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-family IDOR by changing child/mission/reward IDs | Elevation of privilege / Information disclosure | Backend repository methods must always scope by `familyUnitId` from `CurrentUser`. [VERIFIED: backend services] |
| Client-supplied `familyUnitId` in body/path | Spoofing / Tampering | Keep `apiRequest` guard and backend source-of-truth family context. [VERIFIED: api/client.ts; PROJECT.md] |
| Duplicate approval taps credit coins twice | Tampering | UI disables duplicate submits; backend duplicate transaction guard remains authority. [VERIFIED: WalletService.java; 06-UI-SPEC.md] |
| Inactive records still assignable/redeemable | Tampering | Backend assignment/update/deactivate methods use active record lookup; child-facing defaults stay active-only. [VERIFIED: AssignedMissionService.java; RewardService.java] |
| Raw backend errors shown to child/responsible users | Information disclosure | Map to friendly PT-BR user messages; preserve technical data only in dev logs. [VERIFIED: api/client.ts; 06-UI-SPEC.md] |

## Sources

### Primary (HIGH confidence)

- `mobile/package.json`, `mobile/src/api/client.ts`, `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/features/child/*` — existing Expo/navigation/API/test patterns. [VERIFIED: codebase grep]
- Backend controllers/services/DTOs under `backend/src/main/java/br/com/habitinhos/{children,missions,rewards,wallet}` — current REST behavior, active-only lists, wallet/approval rules. [VERIFIED: codebase grep]
- `.planning/phases/06-fluxo-do-respons-vel/06-CONTEXT.md` — locked user decisions. [CITED: local project artifact]
- `.planning/phases/06-fluxo-do-respons-vel/06-UI-SPEC.md` — approved visual/interaction contract. [CITED: local project artifact]
- `docs/design/mobile-design-contract.md`, `docs/design/phase-design-map.md`, `docs/api-contract.md` — project canonical design/API rules. [CITED: local project docs]
- Expo SDK 56 docs: https://expo.dev/sdk/56 and https://docs.expo.dev/versions/latest/ — SDK release/version mapping. [CITED: official docs]
- React Navigation 7.x docs: https://reactnavigation.org/docs/typescript/ and https://reactnavigation.org/docs/bottom-tab-navigator/ — typed routes and tabs. [CITED: official docs]
- React Native Testing Library docs: https://callstack.github.io/react-native-testing-library/cookbook/basics/async-tests — async UI testing. [CITED: official docs]
- React Native testing overview: https://reactnative.dev/docs/testing-overview — component testing guidance. [CITED: official docs]
- OWASP ASVS project: https://owasp.org/www-project-application-security-verification-standard/ — security category basis. [CITED: official docs]
- npm registry checks for Expo, React Navigation packages, RNTL, safe-area-context, and screens. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)

- `.planning/phases/05-fluxo-da-crian-a/05-PATTERNS.md` and Phase 5 tests — prior implementation pattern reference. [CITED: local planning artifact]

### Tertiary (LOW confidence)

- None used as an authoritative basis. [VERIFIED: sources audit]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package versions verified in `package.json` and npm registry; docs checked from official sources. [VERIFIED: npm registry; CITED: official docs]
- Architecture: HIGH — based on current mobile/backend code plus locked Phase 6 UI/context. [VERIFIED: codebase grep; CITED: 06-CONTEXT.md]
- Pitfalls: MEDIUM-HIGH — active-only and dashboard gaps are directly verified; exact endpoint shape is an assumption for planner choice. [VERIFIED: backend audit; ASSUMED]

**Research date:** 2026-06-02  
**Valid until:** 2026-06-09 for npm/tooling currency; backend/codebase findings remain valid until related files change. [ASSUMED]
