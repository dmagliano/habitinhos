---
quick_id: 260604-wme
slug: adicionar-pin-de-respons-vel-para-acessa
status: complete
verified_at: 2026-06-05T02:55:03.000Z
---

# Verification: PIN Do Responsável

## RED

- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest`
  - Falhou conforme esperado antes da implementação por ausência do novo campo/endpoint de PIN.
- `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx src/features/auth/__tests__/api-auth.test.ts src/features/child/__tests__/child-navigation.test.tsx`
  - Falhou conforme esperado antes da implementação por ausência do campo de PIN, serviço de verificação e prompt de navegação.

## GREEN

- `cd backend && ./mvnw test -Dtest=AuthIntegrationTest`
  - Passou: 8 testes.
- `cd mobile && npm test -- --runInBand src/features/auth/__tests__/login-screen.test.tsx src/features/auth/__tests__/api-auth.test.ts src/features/child/__tests__/child-navigation.test.tsx`
  - Passou: 3 suites, 24 testes.

## Regressão

- `cd backend && ./mvnw test`
  - Passou: 51 testes.
- `cd mobile && npm run lint`
  - Passou.
- `cd mobile && npm test -- --runInBand`
  - Passou: 18 suites, 102 testes.
- `cd mobile && npm run typecheck`
  - Passou.
- `cd mobile && npm test -- --runInBand src/features/auth/__tests__/auth-context.test.tsx`
  - Passou: 1 suite, 7 testes.
