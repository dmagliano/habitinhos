# Phase 05: Fluxo da criança - Context

**Gathered:** 2026-06-02T00:10:24-03:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 replaces the current child stub with the real child journey in the
mobile app. A responsible adult is already authenticated from Phase 4; this
phase lets the family choose a child profile, show that child's wallet balance
and pending missions, complete missions, browse active rewards, and redeem
rewards against the real backend API.

This phase does not implement the responsible management dashboard, mission or
reward creation/editing, approval queue UI, demo seed data, production
deployment polish, or a new backend PIN-validation capability.

</domain>

<decisions>
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — product context, mobile stack, backend
  source-of-truth rule, scope boundaries, and no-plaintext PIN/password
  constraint.
- `.planning/REQUIREMENTS.md` — Phase 5 requirements `MOBL-04`, `MOBL-05`,
  `MISS-04`, `MISS-05`, `REWD-03`, `REWD-04`, `REWD-05`, and `WALT-01`.
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, and three-plan
  split.
- `.planning/STATE.md` — current project position and accumulated decisions.

### Prior Phase Context
- `.planning/phases/01-fundacao-backend/01-CONTEXT.md` — auth, tenant
  isolation, child profile, and deferred child PIN enforcement context.
- `.planning/phases/02-dom-nio-de-miss-es-e-moedas/02-CONTEXT.md` — mission
  assignment, completion, approval, wallet-credit source-of-truth, and
  assignment snapshot decisions.
- `.planning/phases/03-recompensas-e-resgates/03-CONTEXT.md` — reward
  redemption, sufficient-balance, insufficient-balance, debit, and statement
  decisions.
- `.planning/phases/04-mobile-base/04-CONTEXT.md` — authenticated family hub,
  real API only, no hidden mock fallback, and mobile base decisions.
- `.planning/phases/05-fluxo-da-crian-a/05-UI-SPEC.md` — approved visual and
  interaction contract for the child flow.

### Technical Docs
- `docs/api-contract.md` — planned REST paths, Bearer JWT usage, error shape,
  child, mission, reward, redemption, and wallet endpoints.
- `docs/design/mobile-design-contract.md` — mobile implementation rules,
  prohibited patterns, components, states, microcopy, and accessibility.
- `docs/design/phase-design-map.md` — Phase 5 design responsibilities and
  screenshot references.
- `docs/design/stitch/painel_do_joaquim/screen.png` — primary visual reference
  for child home balance and pending-mission hierarchy.

### Backend/API Code
- `backend/src/main/java/br/com/habitinhos/children/ChildProfile.java` —
  child profile model with optional `accessPinHash`.
- `backend/src/main/java/br/com/habitinhos/children/ChildService.java` —
  responsible-only child listing and optional PIN hashing behavior.
- `backend/src/main/java/br/com/habitinhos/children/dto/ChildRequest.java` —
  child create/update request with optional `accessPin` validation.
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionController.java` —
  child mission listing and mission completion endpoints.
- `backend/src/main/java/br/com/habitinhos/rewards/RewardController.java` —
  active reward listing and current reward redemption endpoint shape.

### Mobile Code
- `mobile/src/features/family/ChildStubScreen.tsx` — current child placeholder
  to replace.
- `mobile/src/navigation/RootNavigator.tsx` — authenticated route structure
  where the child flow connects.
- `mobile/src/api/client.ts` — fetch wrapper, Bearer token injection, PT-BR
  error mapping, network error handling, and `familyUnitId` guard.
- `mobile/src/api/types.ts` — current mobile API types and `ApiError`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mobile/src/components/AppScreen.tsx` — safe-area screen wrapper and default
  child-flow layout shell.
- `mobile/src/components/AppHeader.tsx` — screen title/greeting/action pattern.
- `mobile/src/components/Card.tsx` — surface for balance panels, mission cards,
  reward cards, empty states, and confirmation panels.
- `mobile/src/components/CoinBadge.tsx` — balance, mission reward, reward cost,
  and missing-coins display.
- `mobile/src/components/PrimaryButton.tsx` and
  `mobile/src/components/SecondaryButton.tsx` — main and supporting actions.
- `mobile/src/components/StatusBadge.tsx` — pending, completed, waiting
  approval, success, warning, and disabled states.
- `mobile/src/components/EmojiAvatar.tsx` — child identity without external
  images.
- `mobile/src/api/client.ts` — shared API request path for child, wallet,
  mission, reward, and redemption calls.

### Established Patterns
- The mobile app keeps visible text in PT-BR and technical identifiers in
  English.
- API calls use Bearer JWT from the responsible session; client code must not
  send or trust `familyUnitId`.
- Backend responses do not expose `accessPinHash`; mobile cannot infer whether
  a child has a PIN from current child-list responses.
- Current authenticated navigation is stack-based with `FamilyHub`,
  `ResponsibleStub`, and `ChildStub`. Phase 5 can replace `ChildStub` with a
  child stack/tab area without implementing Phase 6 responsible screens.
- Loading/error states already exist for auth. Real list/card loading, empty,
  disabled, success, and error states are expected to be introduced by Phase 5.

### Integration Points
- `GET /children` lists active child profiles for selection.
- `GET /children/{childId}/wallet` returns the selected child's current balance.
- `GET /children/{childId}/missions` returns pending missions for the child.
- `POST /assigned-missions/{id}/complete` completes a pending assigned mission
  and returns the resulting mission status/snapshot.
- `GET /rewards` lists active rewards.
- Current backend code uses `POST /rewards/{id}/redeem` with `childId` in the
  body for redemption; docs also describe a child-scoped redemption path. The
  planner must verify the canonical endpoint before mobile implementation.

</code_context>

<specifics>
## Specific Ideas

- The child home should feel like `docs/design/stitch/painel_do_joaquim/`,
  especially the prominent balance and pending-mission rhythm.
- Mission cards should prioritize due-dated missions so the child sees what is
  time-sensitive first.
- Mission approval feedback should be plain and stable: `Aguardando aprovacao`
  for approval-required missions, and received coins/balance for auto-credit
  missions.
- Reward confirmation should make the coin trade explicit by showing the
  remaining balance before the child confirms.

</specifics>

<deferred>
## Deferred Ideas

- Implement responsible PIN validation / protected switch from child mode back
  to responsible mode when a backend spec and endpoint exist. Do not fake this
  locally in Phase 5.

</deferred>

---

*Phase: 05-Fluxo da criança*
*Context gathered: 2026-06-02T00:10:24-03:00*
