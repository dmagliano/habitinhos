---
spike: 003
name: credential-flow-integration
type: standard
validates: "Given every protected credential field in the app, when visibility is toggled, then each field behaves consistently and independently without changing authentication flows"
verdict: VALIDATED
related: [001, 002]
tags: [react-native, integration, credentials, accessibility, ux]
---

# Spike 003: Credential Flow Integration

## What This Validates

Given every protected credential field in the app, when visibility is toggled, then each field behaves consistently and independently without changing authentication flows.

## Research

The repository contained direct `secureTextEntry` usage in login, registration, password reset, responsible PIN reset, responsible PIN entry, and account deletion. A single shared component avoids interaction and accessibility drift across these contexts.

| Approach | Pros | Cons | Status |
|----------|------|------|--------|
| Shared component in every protected field | Consistent behavior and semantics | Requires cross-flow test updates | Chosen |
| Local state in each screen | Smaller immediate diff per screen | Duplicates interaction and accessibility logic | Rejected |
| Toggle only creation/reset fields | Narrow scope | Leaves inconsistent credential entry elsewhere | Rejected |

**Chosen approach:** use the validated shared control everywhere, keep each field independent, and add platform autofill hints only for passwords.

## How to Run

```bash
cd mobile
npm test -- --runInBand \
  src/components/__tests__/SecureTextInput.test.tsx \
  src/features/auth/__tests__/login-screen.test.tsx \
  src/features/child/__tests__/child-navigation.test.tsx \
  src/features/responsible/__tests__/responsible-navigation.test.tsx
```

## What to Expect

- No screen uses `secureTextEntry` directly outside `SecureTextInput`.
- Login and account-deletion passwords can be revealed and hidden.
- New password and confirmation controls remain independent.
- Responsible PIN entry can be revealed without adding a confirmation field.
- Existing service calls and navigation behavior still pass.

## Investigation Trail

1. Six production components contained protected inputs with duplicated masking behavior.
2. Password fields benefit from `current-password` or `new-password` autofill hints; PIN fields explicitly avoid password autofill.
3. The centered responsible-PIN field needs symmetric left padding so the trailing action does not visually displace four-digit content.
4. Dynamic equality feedback uses a check or explicit error text in addition to color and a polite live region on Android.

## Results

**Verdict: VALIDATED.** Four focused suites passed with 31 tests. Static search confirms direct `secureTextEntry` is isolated to the shared component, while screen-level tests prove visibility in login, password reset, responsible PIN entry, and account deletion without regressing service or navigation behavior.
