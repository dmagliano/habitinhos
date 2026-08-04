---
spike: 002
name: pin-confirmation
type: standard
validates: "Given a new responsible PIN, when creation or reset is submitted, then only matching four-digit PINs are accepted without changing API payloads"
verdict: VALIDATED
related: [001]
tags: [react-native, pin, validation, ux]
---

# Spike 002: PIN Confirmation

## What This Validates

Given a new responsible PIN, when creation or reset is submitted, then only matching four-digit PINs are accepted without changing API payloads.

## Research

The responsible PIN protects entry into family management. A mistyped PIN causes a disproportionately expensive recovery flow requiring the account password and an emailed code. Repeating four numeric digits adds little effort compared with that recovery cost.

| Approach | Pros | Cons | Status |
|----------|------|------|--------|
| Confirm on creation and reset | Prevents accidental lockout in both write paths | Adds one short field | Chosen |
| Reveal only | Lowest friction | Relies on users noticing and using reveal | Rejected |
| Confirm only on reset | Shorter registration | Leaves initial creation exposed to the same typo risk | Rejected |

**Chosen approach:** require local equality in both write flows, show red mismatch and green checked confirmation, and send only the original PIN field to the API.

## How to Run

```bash
cd mobile
npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx
```

## What to Expect

- Registration and reset stay disabled for mismatching PINs.
- Matching four-digit PINs show `✓ PINs válidos e iguais.`.
- Registration still sends `responsiblePin` only.
- Reset still sends `newPin` only.

## Investigation Trail

1. Both backend DTOs already accept exactly one four-digit PIN; confirmation belongs exclusively to the UI.
2. The established password-confirmation pattern supplies matching red/green feedback without introducing a new visual language.
3. Existing integration tests can prove both local blocking and unchanged service calls.

## Results

**Verdict: VALIDATED.** Nineteen focused authentication tests passed. Mismatching PINs keep both submission buttons disabled, matching PINs expose explicit green confirmation, and service assertions prove the existing `responsiblePin` and `newPin` payloads remain unchanged.
