---
spike: 001
name: secure-input-visibility
type: standard
validates: "Given a sensitive React Native input, when the user toggles visibility, then the value remains intact and masking plus accessible state update together"
verdict: VALIDATED
related: []
tags: [react-native, accessibility, credentials, ux]
---

# Spike 001: Secure Input Visibility

## What This Validates

Given a sensitive React Native input, when the user toggles visibility, then the value remains intact and masking plus accessible state update together.

## Research

| Approach | Pros | Cons | Status |
|----------|------|------|--------|
| Persistent button beside each field | Discoverable, field-scoped, accessible state | Requires reserved input space | Chosen |
| Checkbox below the field | Familiar binary control | Visually detached and repeats poorly | Rejected |
| Press and hold | Limits exposure time | Poor discoverability and motor accessibility | Rejected |
| Radio buttons | Explicit choices | Incorrect semantics for one reversible action | Rejected |

The W3C WCAG 2.2 guidance illustrates a button beside a password field and notes that optional reveal can reduce cognitive load. GOV.UK recommends hidden-by-default password fields with explicit Show/Hide buttons. React Native provides `secureTextEntry`, `togglebutton`, and `accessibilityState.checked` for this implementation.

References:

- https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- https://design-system.service.gov.uk/components/password-input/
- https://reactnative.dev/docs/accessibility
- https://reactnative.dev/docs/textinput

**Chosen approach:** a reusable controlled `TextInput` wrapper with an internal, persistent visibility state and a text button requiring no icon dependency.

## How to Run

```bash
cd mobile
npm test -- --runInBand src/components/__tests__/SecureTextInput.test.tsx
```

## What to Expect

- The input starts with `secureTextEntry=true`.
- `Exibir senha` changes masking without changing the value.
- The control becomes `Ocultar senha` with checked accessibility state.
- A second activation restores masking.

## Investigation Trail

1. The project has no icon library and explicitly avoids heavy visual dependencies.
2. A text action is clearer than an emoji eye and provides an unambiguous accessible name.
3. An absolute trailing action preserves existing field styling while reserving space for typed text.

## Results

**Verdict: VALIDATED.** The focused Jest test passed and proved both visibility transitions, preserved value, action-specific accessible names, and synchronized checked state. No package installation or platform-specific API was required.
