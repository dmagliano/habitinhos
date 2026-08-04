# Phase 08 UI Review: Credential Visibility and Confirmation

**Reviewed:** 2026-08-03  
**Scope:** follow-up mobile credential flows on the Phase 08 branch  
**Method:** code audit, focused interaction tests, full mobile suite, typecheck, and lint  
**Visual automation:** unavailable; emulator verification remains a human check

## Score Summary

| Pillar | Score | Assessment |
|--------|-------|------------|
| Copywriting | 4/4 | Clear PT-BR actions identify what will be shown or hidden. |
| Visuals | 3/4 | Consistent trailing text action; final device rendering still needs human review. |
| Color | 4/4 | Existing tokens are reused and validation never relies on color alone. |
| Typography | 4/4 | Shared label typography keeps controls consistent with the auth UI. |
| Spacing | 3/4 | Touch targets and reserved input space are defined; large-font device review remains. |
| Experience Design | 4/4 | Hidden defaults, persistent per-field toggles, local confirmation, and unchanged API flows. |

**Overall: 22/24**

## 1. Copywriting — 4/4

- Visible action copy is the short pair `Exibir` and `Ocultar`.
- Accessible names identify the affected value, for example `Exibir confirmação da nova senha` and `Ocultar PIN do responsável`.
- PIN validation matches the established password language: explicit red mismatch plus green checked confirmation.
- Radio terminology is avoided because visibility is a reversible action, not a choice among mutually exclusive options.

## 2. Visuals — 3/4

- A text action is used instead of an emoji eye because the project has no icon dependency and text is unambiguous.
- The action stays attached to the field as a trailing control, preserving the existing quiet card-form language.
- The centered PIN entry receives symmetric spacing so the four digits remain visually centered.
- **Needs human review:** confirm the trailing action does not overlap long autofilled credentials on Android and iOS devices.

## 3. Color — 4/4

- Toggle text uses `colors.primaryDark`, matching existing interactive emphasis.
- Success and error feedback reuse `colors.success` and `colors.error`.
- Validation includes `✓` and explicit text, so meaning is not conveyed by green or red alone.

## 4. Typography — 4/4

- Toggle actions reuse `typography.label`.
- Existing field labels, body copy, and validation typography remain unchanged.
- No icon font, image asset, or platform-specific glyph was introduced.

## 5. Spacing — 3/4

- Toggle targets meet the project minimum of 48 px and reserve 88 px inside the input.
- Existing auth field gaps and card spacing remain intact.
- Each field owns its control, avoiding a detached checkbox row and ambiguous group-level state.
- **Needs human review:** verify 200% font scaling and narrow-screen layout on a physical device or emulator.

## 6. Experience Design — 4/4

- Credentials remain hidden by default and visibility persists until another tap.
- Each field toggles independently, letting users compare password and confirmation safely.
- Press-and-hold was rejected because it is less discoverable and requires continuous motor action.
- Checkbox was rejected because it separates the action from the affected field; radio buttons have incorrect semantics.
- New PIN confirmation is required only when creating or redefining a PIN. Existing PIN entry remains a single field.
- Password and PIN confirmations are frontend-only; backend payloads remain unchanged.
- Password fields receive `current-password` or `new-password` autofill hints; PIN fields do not impersonate password inputs.

## Accessibility Findings

- The visibility action uses `accessibilityRole="togglebutton"` with synchronized `accessibilityState.checked`.
- Action labels change between `Exibir ...` and `Ocultar ...` so VoiceOver and TalkBack announce the available action.
- Equality feedback uses `accessibilityLiveRegion="polite"` on Android.
- Copy/paste remains available because no input context menu or paste behavior is blocked.

## Verification Evidence

| Check | Result |
|-------|--------|
| Secure input component test | 1/1 passed |
| Focused cross-flow suites | 31/31 passed |
| Full mobile suite | 126/126 passed |
| TypeScript | Passed |
| Expo lint | Passed |

The full Jest run reports its existing forced-exit advisory after success; no test failed.

## Top Follow-ups

1. Perform Android-first emulator UAT for keyboard focus, cursor stability, and narrow-screen overlap.
2. Check iOS visibility toggling because native secure-field behavior can differ by platform.
3. Revisit icon-only presentation only if the project later adopts a shared icon system; retain explicit accessible labels regardless.

## References

- Phase 07 registration contract: `../07-polimento-para-demonstra-o-do-tcc/07-UI-SPEC.md`
- W3C Accessible Authentication: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- GOV.UK Password Input: https://design-system.service.gov.uk/components/password-input/
- React Native Accessibility: https://reactnative.dev/docs/accessibility
- React Native TextInput: https://reactnative.dev/docs/textinput
