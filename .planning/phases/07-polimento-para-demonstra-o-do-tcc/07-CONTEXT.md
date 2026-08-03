# Phase 7: Polimento para demonstração do TCC - Context

**Gathered:** 2026-06-18
**Status:** Ready for UI design contract

<domain>
## Phase Boundary

Phase 7 makes the MVP demo-ready through repeatable demo data, documentation, visual polish, and final verification. This context captures a focused authentication-polish decision for the mobile registration screen: make account creation clearer by adding password confirmation, communicating the password length rule, and explaining why the disabled submit action is unavailable.

This is a mobile UI/UX polish item. It must not change backend authentication contracts, session persistence semantics, family isolation, token storage, account recovery, or responsible/child navigation.

</domain>

<decisions>
## Implementation Decisions

### Registration Password Confirmation
- **D-01:** Add a `Confirmar senha` field directly below `Senha` on the mobile registration screen.
- **D-02:** The confirmation mismatch message appears inline only after the confirmation field has content. Avoid showing a mismatch error before the user has started confirming the password.
- **D-03:** The `Criar conta` action must not call `register` until the password has at least 8 characters and the confirmation matches.

### Registration Password Rule Copy
- **D-04:** Communicate the minimum password length in the password placeholder instead of a fixed helper line. Preferred copy: `Mínimo de 8 caracteres`.
- **D-05:** Keep the backend as the source of truth for password constraints. Mobile validation exists for friendly UX and demo clarity.

### Disabled Create Account State
- **D-06:** Keep `Criar conta` disabled until the form is valid.
- **D-07:** Form validity for enabling `Criar conta` includes required visible fields: name, email, password with at least 8 characters, matching password confirmation, family name, and 4-digit responsible PIN.
- **D-08:** When `Criar conta` is disabled, show a generic explanation near the disabled button. Preferred copy: `Complete os campos obrigatórios para criar a conta.`
- **D-09:** Do not use a detailed checklist for missing fields in this pass. The explanation should stay compact and generic.

### Registration Screen Scope
- **D-10:** Preserve the current registration card structure, base components, PT-BR copy style, and existing stale-session filtering behavior from Phase 06.2.
- **D-11:** Do not add recovery CTAs to registration. Phase 06.3 already locked that recovery links belong on login/PIN flows, not account creation.
- **D-12:** This polish should be covered by focused mobile tests proving field rendering, disabled submit behavior, inline mismatch feedback, and successful submit only when the form is valid.

### the agent's Discretion
- Exact internal helper function names, local state shape, and test organization are left to the planner/executor.
- The executor may slightly adjust the generic disabled-button copy if needed for layout or existing tone, as long as it remains compact, PT-BR, and near the disabled action.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and Requirements
- `.planning/ROADMAP.md` — Phase 7 goal and success criteria for TCC demo polish.
- `.planning/REQUIREMENTS.md` — Authentication/mobile requirements, especially AUTH-01, AUTH-08, MOBL-02, MOBL-05, and MOBL-06.
- `.planning/PROJECT.md` — Product constraints: PT-BR mobile MVP, backend as source of truth, simple demo-ready scope.

### Prior Auth/UI Decisions
- `.planning/phases/06.2-ajustes-p-s-uat-de-cadastro-seletor-de-crian-as-e-navega-o-r/06.2-CONTEXT.md` — Registration must not show expired-session recovery copy; no backend changes in registration polish.
- `.planning/phases/06.2-ajustes-p-s-uat-de-cadastro-seletor-de-crian-as-e-navega-o-r/06.2-UI-SPEC.md` — Register screen should keep current card form structure, `Criar conta`, and `Já tenho conta`.
- `.planning/phases/06.3-recuperacao-de-acesso-e-exclusao-de-conta/06.3-CONTEXT.md` — Do not show recovery CTAs on registration.
- `.planning/phases/06.3-recuperacao-de-acesso-e-exclusao-de-conta/06.3-UI-SPEC.md` — Auth recovery tone: calm, private, short PT-BR copy, no visual redesign of auth screens.

### Design Contract
- `docs/design/mobile-design-contract.md` — Mobile UI rules: PT-BR text, centralized tokens, accessible fields/actions, Android-first widths, friendly validation/error copy.
- `docs/design/phase-design-map.md` — Phase 7 design responsibility: verify mobile screens against the design contract and polish disabled/error/success states.

### Code Touchpoints
- `mobile/src/features/auth/RegisterScreen.tsx` — Primary screen to update.
- `mobile/src/features/auth/__tests__/login-screen.test.tsx` — Existing `RegisterScreen` tests to extend.
- `backend/src/main/java/br/com/habitinhos/auth/dto/RegisterRequest.java` — Backend password rule is already 8 to 120 characters; mobile copy must match the minimum.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AppScreen`, `Card`, `PrimaryButton`, and `SecondaryButton`: already used by `RegisterScreen`; reuse them rather than introducing new UI primitives.
- Existing `styles.helper` / `styles.error` text patterns in `RegisterScreen.tsx`: can support the disabled explanation and inline mismatch message with current tokens.

### Established Patterns
- Auth screens use local `useState`, `KeyboardAvoidingView`, shared tokens from `mobile/src/theme`, and PT-BR labels/accessibility labels.
- Registration already filters stale-session recovery errors so the screen shows only registration-specific errors.
- Password reset confirmation already disables submit while the new password is shorter than 8 characters; registration should align with that minimum.

### Integration Points
- `RegisterScreen.handleSubmit` currently calls `useAuth().register` directly. Planning should add local validation before this call and keep the API payload unchanged.
- `RegisterRequest.password` remains a single backend field. `Confirmar senha` is mobile-only and must not be sent to the backend.
- Existing `login-screen.test.tsx` register tests should be updated from short sample passwords like `secret` to valid 8+ character examples.

</code_context>

<specifics>
## Specific Ideas

- Password placeholder: `Mínimo de 8 caracteres`.
- Disabled button explanation: `Complete os campos obrigatórios para criar a conta.`
- Confirmation field label/accessibility label: `Confirmar senha`.
- Preferred field order around credentials: `Senha`, then `Confirmar senha`, then `Nome da família`, then `PIN do responsável`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 7 registration polish scope.

</deferred>

---

*Phase: 7-Polimento para demonstração do TCC*
*Context gathered: 2026-06-18*
