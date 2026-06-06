# Phase 06: Fluxo do responsável - Context

**Gathered:** 2026-06-02T19:57:47-03:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 replaces the responsible-area stub with the real mobile management
journey. The responsible adult can see family progress, inspect children,
create/edit/deactivate children, create/edit/deactivate missions, assign
missions to children, approve or reject completed missions, and manage rewards
from the Expo mobile app against the real backend API.

This phase does not add a separate web admin panel, advanced reports, push
notifications, new backend approval semantics, billing, marketplace features,
or demo seed/presentation polish. Those remain outside the Phase 6 boundary.

</domain>

<decisions>
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — product context, mobile stack, source-of-truth
  rules, soft-deactivation/history constraints, PT-BR MVP scope, and Phase 4+
  design constraint.
- `.planning/REQUIREMENTS.md` — Phase 6 requirements `MOBL-03`, `DASH-01`,
  `DASH-02`, `DASH-03`, `DASH-04`, `CHLD-03`, `MISS-01`, `MISS-03`,
  `MISS-08`, `MISS-09`, and `REWD-01`.
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, and four-plan
  split.
- `.planning/STATE.md` — current project position and accumulated decisions.

### Prior Phase Context
- `.planning/phases/04-mobile-base/04-CONTEXT.md` — family hub, real API only,
  PT-BR mobile conventions, no hidden mock fallback, and responsible/child
  route stubs.
- `.planning/phases/05-fluxo-da-crian-a/05-CONTEXT.md` — child flow decisions,
  real API service patterns, child wallet/mission/reward behavior, and Phase 5
  carry-forward constraints.
- `.planning/phases/06-fluxo-do-respons-vel/06-UI-SPEC.md` — approved visual
  and interaction contract for the responsible flow.

### Technical Docs
- `docs/api-contract.md` — planned REST paths, Bearer JWT usage, API error
  shape, child, mission, assignment, approval, reward, redemption, and wallet
  endpoint expectations.
- `docs/design/mobile-design-contract.md` — mobile implementation rules,
  tokens, components, states, microcopy, accessibility, and prohibited
  patterns.
- `docs/design/phase-design-map.md` — Phase 6 design responsibilities and
  required Stitch visual references.
- `docs/design/stitch/DESIGN.md` — global Stitch-derived design system details.
- `docs/design/stitch/painel_do_responsavel/screen.png` — responsible
  dashboard visual reference.
- `docs/design/stitch/aprovacoes/screen.png` — approvals visual reference.
- `docs/design/stitch/gerenciar_missoes/screen.png` — mission management visual
  reference.
- `docs/design/stitch/gerenciar_recompensas/screen.png` — reward management
  visual reference.
- `docs/design/stitch/nova_missao_1/screen.png` — new mission step 1 visual
  reference.
- `docs/design/stitch/nova_missao_2/screen.png` — new mission step 2 visual
  reference.
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png` — profile/mode
  switching visual reference.

### Mobile Code
- `mobile/src/navigation/RootNavigator.tsx` — authenticated stack where
  `ResponsibleStub` is replaced by the real responsible flow.
- `mobile/src/navigation/routes.ts` — root route type definitions to extend.
- `mobile/src/features/family/ResponsibleStubScreen.tsx` — current placeholder
  to replace.
- `mobile/src/features/family/FamilyHubScreen.tsx` — mode selection entry point
  that must remain available.
- `mobile/src/features/child/ChildTabsScreen.tsx` — existing bottom-tab pattern
  reusable for responsible tabs.
- `mobile/src/features/child/childService.ts` — existing real API service style
  for children, missions, rewards, and wallet.
- `mobile/src/api/client.ts` — shared fetch wrapper, Bearer token handling,
  PT-BR error mapping, and `familyUnitId` guard.
- `mobile/src/api/types.ts` — existing mobile API type definitions to extend.
- `mobile/src/components/*` — base components reused by the responsible flow:
  `AppScreen`, `AppHeader`, `Card`, `PrimaryButton`, `SecondaryButton`,
  `CoinBadge`, `StatusBadge`, and `EmojiAvatar`.

### Backend/API Code
- `backend/src/main/java/br/com/habitinhos/children/ChildController.java` —
  child create/list/get/update/deactivate endpoints.
- `backend/src/main/java/br/com/habitinhos/missions/MissionController.java` —
  mission create/list/get/update/deactivate and assignment endpoint.
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionController.java`
  — child pending missions, completion, pending approvals, approve, and reject
  endpoints.
- `backend/src/main/java/br/com/habitinhos/rewards/RewardController.java` —
  reward create/list/get/update/deactivate and redemption endpoints.
- `backend/src/main/java/br/com/habitinhos/wallet/WalletController.java` —
  child wallet balance and transaction history endpoints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AppScreen`, `AppHeader`, `Card`, `PrimaryButton`, `SecondaryButton`,
  `CoinBadge`, `StatusBadge`, and `EmojiAvatar` provide the base responsible
  screen shell, cards, action buttons, status labels, coin display, and child
  identity patterns.
- `BottomTabBar` from the child flow can guide responsible tabs (`Início`,
  `Missões`, `Recompensas`, `Perfil`) if the planner keeps the same visual
  navigation contract.
- `childService.ts` demonstrates the current service shape: small token-aware
  functions calling `apiRequest`, then screens own loading/error/refetch state.
- Existing child screens and tests show the no-mock fallback pattern, retry
  states, disabled states while mutations run, and backend-tied success/error
  feedback.

### Established Patterns
- The authenticated family hub remains the mode-switch entry. The responsible
  flow replaces `ResponsibleStub` but should not remove `FamilyHub`.
- API calls use the responsible Bearer token. Mobile must never send
  `familyUnitId` as authorization truth.
- User-facing copy is PT-BR; technical names in code remain English.
- Loading, empty, disabled, success, and error states should be explicit and
  friendly. Final data comes from API responses/refetches, not local invention.
- Existing backend mission assignments preserve snapshot fields. Mobile copy
  for mission editing must not imply existing assigned missions are rewritten.

### Integration Points
- `GET /children`, `POST /children`, `GET /children/{id}`, `PUT /children/{id}`,
  `PATCH /children/{id}/deactivate` support child management.
- `GET /children/{childId}/wallet` supports child balance in cards/details.
- `GET /children/{childId}/wallet/transactions` may help with child detail or
  recent activity if planner chooses to use it.
- `GET /missions`, `POST /missions`, `GET /missions/{id}`, `PUT /missions/{id}`,
  `PATCH /missions/{id}/deactivate`, and `POST /missions/{id}/assign` support
  mission management and assignment.
- `GET /assigned-missions/pending-approval`,
  `POST /assigned-missions/{id}/approve`, and
  `POST /assigned-missions/{id}/reject` support the dedicated approvals screen.
- `GET /rewards`, `POST /rewards`, `GET /rewards/{id}`, `PUT /rewards/{id}`,
  and `PATCH /rewards/{id}/deactivate` support reward management.

</code_context>

<specifics>
## Specific Ideas

- Dashboard rhythm: child cards first, then quick actions, then approval badge,
  then recent redemptions.
- Child cards should make pending/today missions more prominent than balance,
  while still keeping balance visible.
- New mission flow should feel like one guided path even if the implementation
  performs create and assign as two API calls.
- Assignment UI should show all active children and allow selecting multiple
  children manually.
- Failure copy for partial mission creation must be honest: mission created,
  assignment pending.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-Fluxo do responsável*
*Context gathered: 2026-06-02T19:57:47-03:00*
