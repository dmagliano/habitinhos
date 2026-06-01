# Phase 4: Mobile base - Context

**Gathered:** 2026-06-01T12:00:44-03:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the mobile foundation: Expo + React Native + TypeScript scaffold in `mobile/`, authentication against the real backend, persisted session/token handling, shared API/environment structure, initial authenticated navigation, and the base visual structure required by the Habitinhos mobile design contract.

This phase does not implement the complete child mission/reward loop, the complete responsible management/dashboard flow, real bottom tabs for Phase 5/6 destinations, demo seed data, or production deployment polish.

</domain>

<decisions>
## Implementation Decisions

### Navegacao Inicial
- **D-01:** Successful login lands on a simple family hub, not directly in a child or responsible flow.
- **D-02:** The family hub must show two visible PT-BR choices: `Sou responsável` and `Sou criança`.
- **D-03:** Phase 4 creates auth plus internal stub routes only; real bottom tabs for child and responsible flows are deferred to Phases 5 and 6.
- **D-04:** Internal route names for planning should be `Auth`, `FamilyHub`, `ResponsibleStub`, and `ChildStub`.
- **D-05:** `ResponsibleStub` and `ChildStub` are visual landing stubs with `AppHeader`, `Card`, and a preparation/next-steps message. They must not expose real future-flow actions or mock data pretending to be functional.
- **D-06:** Stub landings include a `Trocar modo` action that returns to `FamilyHub`.
- **D-07:** Stub landings include a simple visible logout action in the header/menu so session persistence and return-to-login can be tested without external tooling.

### Ambiente e API
- **D-08:** The API base URL must be configured through a public Expo environment variable such as `EXPO_PUBLIC_API_BASE_URL`, with a documented local backend fallback.
- **D-09:** API errors shown to users must be friendly PT-BR messages. Backend `code` and technical details may be preserved only in development logs/console.
- **D-10:** Phase 4 must implement loading/error states for auth, session restoration, and network failure only. Generic list/card loading-empty-error states are deferred until the real list flows in Phases 5 and 6.
- **D-11:** If the backend is unavailable during local/demo use, the app shows a recoverable error with `Tentar novamente`; it must not silently switch to a fake offline/mock mode.

### Carry Forward From Locked Project Decisions
- **D-12:** Mobile implementation uses Expo, React Native, TypeScript, and React Navigation.
- **D-13:** Visible interface text is PT-BR; code identifiers and technical names remain English.
- **D-14:** Backend remains the source of truth for authentication, family context, authorization, wallet balance, mission/reward rules, and history.
- **D-15:** Phase 4 auth must consume the real backend `/auth/login` and `/me` contracts; mobile must not accept or invent client-side `familyUnitId` authorization truth.
- **D-16:** Mobile design from Phase 4 onward follows `docs/design/mobile-design-contract.md` and `docs/design/phase-design-map.md`. Stitch screenshots are visual references; `code.html` exports must not be copied.

### the agent's Discretion
- Login form layout details, session storage library choice, bootstrap/splash behavior while restoring a session, API client shape, and exact component file organization were not discussed in depth. Researcher and planner may choose pragmatic Expo-compatible defaults that preserve D-01 through D-16, the roadmap scope, backend contracts, and the mobile design contract.
- Base visual implementation details not discussed here should follow `docs/design/mobile-design-contract.md`: create tokens first, build reusable base components before screen-specific UI, avoid external visual assets, and keep Android-first touch/readability constraints.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — product context, mobile stack, backend source-of-truth rule, scope boundaries, and Phase 4+ design constraint.
- `.planning/REQUIREMENTS.md` — Phase 4 requirements `MOBL-01`, `MOBL-02`, `AUTH-02`, `AUTH-04`, and cross-phase design requirement `MOBL-06`.
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and plan split.
- `.planning/DECISIONS.md` — accepted ADRs, especially ADR-005, ADR-010, ADR-011, and ADR-018.
- `.planning/STATE.md` — current project position and prior accumulated decisions.

### Prior Phase Context
- `.planning/phases/01-fundacao-backend/01-CONTEXT.md` — auth, tenant context, `/auth/login`, `/me`, and family isolation decisions.
- `.planning/phases/02-dom-nio-de-miss-es-e-moedas/02-CONTEXT.md` — backend source-of-truth, family-scoped access, PT-BR error response, and wallet/mission constraints carried into mobile.
- `.planning/phases/03-recompensas-e-resgates/03-CONTEXT.md` — reward/redemption backend completion and Phase 5+ mobile exclusions.

### Technical Docs
- `docs/architecture.md` — mobile responsibilities, backend responsibilities, tenant boundary, and suggested mobile structure.
- `docs/api-contract.md` — REST paths, auth flow, Bearer JWT usage, `/auth/login`, `/me`, and API error shape.

### Mobile Design Contract
- `docs/design/README.md` — design entrypoint and canonical reading order.
- `docs/design/mobile-design-contract.md` — implementation rules, prohibited patterns, tokens, base components, navigation expectations, state rules, microcopy, accessibility, and acceptance criteria.
- `docs/design/phase-design-map.md` — Phase 4 design responsibilities and visual references.
- `docs/design/stitch/DESIGN.md` — full Stitch-derived design system details, tokens, base components, and visual acceptance criteria.
- `docs/design/stitch/prd_habitinhos_project_brief.md` — product/design intent, personas, and screen map.
- `docs/design/stitch/boas_vindas/screen.png` — visual reference for welcome/login-adjacent entry tone.
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png` — visual reference for family/profile mode switching concepts; Phase 4 uses a simpler hub/stub approach.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/main/java/br/com/habitinhos/auth/AuthController.java` — exposes `POST /auth/login`, `POST /auth/register`, and authenticated `GET /me`.
- `backend/src/main/java/br/com/habitinhos/auth/dto/LoginRequest.java` — login requires `email` and `password` with PT-BR validation messages.
- `backend/src/main/java/br/com/habitinhos/auth/dto/AuthResponse.java` — login/register return `token`, user summary, and family summary.
- `backend/src/main/java/br/com/habitinhos/auth/dto/MeResponse.java` — `/me` returns authenticated user and family context.
- `docs/design/*` — committed design contract and Stitch visual references to guide Phase 4 base UI without copying HTML/CSS.

### Established Patterns
- Backend protected operations derive family context from the authenticated user; mobile must pass Bearer JWT and consume returned context rather than sending authorization truth.
- Backend user-facing validation/error messages are PT-BR with stable English error codes; mobile should present friendly copy and retain technical details only for development diagnostics.
- Project docs already define `mobile/src/` structure suggestions: `navigation/`, `api/`, `features/`, `components/`, `theme/`, and `storage/`.
- Mobile app code is effectively greenfield in `mobile/`; Phase 4 should establish conventions carefully and avoid overbuilding Phase 5/6 flows.

### Integration Points
- `mobile/` — create the Expo app foundation here.
- `POST /auth/login` — authenticate responsible adult and receive JWT.
- `GET /me` — restore/verify authenticated session and family context after token persistence.
- `docs/design/mobile-design-contract.md` — guide tokens, base components, screen states, and acceptance checks for all Phase 4 UI.

</code_context>

<specifics>
## Specific Ideas

- Authenticated navigation should feel like a real family app even while routes are stubs: `FamilyHub` is the first authenticated screen, with `Sou responsável` and `Sou criança`.
- The stub screens should honestly communicate that the responsible/child areas are being prepared, rather than previewing fake functional data.
- Environment configuration should be demo-friendly but explicit: public Expo API base URL plus documented local fallback, retry on backend failure, no hidden mock fallback.
- Real bottom tabs are intentionally delayed until Phase 5/6 so the app does not establish misleading navigation destinations before the feature flows exist.

</specifics>

<deferred>
## Deferred Ideas

- Real child bottom tabs and child mission/reward screens belong to Phase 5.
- Real responsible bottom tabs, dashboard, approvals, and management screens belong to Phase 6.
- Generic list/card empty/loading/error state coverage belongs to the first phases that implement real lists/cards, primarily Phases 5 and 6.
- Demo seed data and final visual polish belong to Phase 7.

</deferred>

---

*Phase: 4-Mobile base*
*Context gathered: 2026-06-01T12:00:44-03:00*

