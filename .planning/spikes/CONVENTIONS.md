# Spike Conventions

Patterns and stack choices established across spike sessions. New spikes follow these unless the question requires otherwise.

## Stack

- Use the existing React Native 0.85, Expo 56, TypeScript, Jest, and React Native Testing Library stack.
- Avoid new dependencies when React Native primitives and project theme tokens cover the interaction.

## Structure

- Promote validated reusable UI behavior into `mobile/src/components/`.
- Keep spike evidence in numbered `.planning/spikes/NNN-name/README.md` files and index verdicts in `MANIFEST.md`.
- Validate shared behavior at component level, then verify each consuming flow with existing feature suites.

## Patterns

- Sensitive values start masked and use an independent persistent toggle button per field.
- Toggle controls expose action-specific accessible names, toggle semantics, and checked state.
- New credential confirmation is local to the frontend and never changes established backend payloads.
- Validation combines color with explicit text or symbols and uses existing theme tokens.
- Password fields use platform autofill hints; application PINs opt out of password autofill.

## Tools & Libraries

- Prefer `Pressable`, `TextInput`, `accessibilityRole`, and `accessibilityState` from React Native.
- Use React Native Testing Library for interaction and accessibility assertions.
- Do not add icon libraries solely for credential visibility; use explicit text until a shared icon system exists.
