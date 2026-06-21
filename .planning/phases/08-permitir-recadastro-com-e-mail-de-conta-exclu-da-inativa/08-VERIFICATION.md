---
phase: "08"
name: "permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa"
created: 2026-06-21
verified: 2026-06-21
status: passed
automated_checks:
  - "cd backend && ./mvnw test -Dtest=AuthIntegrationTest"
  - "cd backend && ./mvnw test -Dtest=DemoDataSeederTest"
  - "cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest"
  - "cd backend && ./mvnw test -Dtest=AuthIntegrationTest,DemoDataSeederTest,OpenApiIntegrationTest"
  - "cd backend && ./mvnw test"
  - "rg -n \"active|ativa|inativa|unique|únic|recadastro|e-mail|email\" docs/data-model.md docs/api-contract.md bruno/habitinhos-openapi.yaml"
tests:
  focused_auth: 13
  focused_demo_seed: 2
  focused_openapi: 1
  focused_combined: 16
  full_backend: 70
  failures: 0
  errors: 0
  skipped: 0
human_verification: []
manual_smoke_recommended: []
---

# Phase 08: Recadastro com E-mail Inativo — Verification

## Goal-Backward Verification

**Phase Goal:** Permitir que uma pessoa responsável crie uma nova conta independente usando um e-mail que só existe em contas históricas inativas, sem quebrar login, reset de senha, seed demo, isolamento por família ou documentação.

**Result:** Passed. O backend aceita recadastro somente quando não há conta ativa com o e-mail normalizado, cria novos ids de usuário/família, mantém login/reset privados para histórico inativo e preserva unicidade ativa no PostgreSQL.

## Requirement Checks

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | AUTH-11 | Passed | `AuthIntegrationTest` cobre exclusão real de conta, família antiga inativa, login antigo inválido, reset inactive-only sem e-mail, recadastro com novos ids e reset da nova conta ativa. |
| 2 | DOCS-01 | Passed | `docs/data-model.md`, `docs/api-contract.md` e `bruno/habitinhos-openapi.yaml` documentam unicidade ativa sem alterar contrato público. |

## Success Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Active duplicate registration is still rejected | Passed | `registerRejectsDuplicateEmail` and active-only repository check. |
| 2 | Inactive-only duplicate e-mail registers normally | Passed | `deleteAccountDeactivatesUserAndFamilyThenAllowsFreshRegistration`. |
| 3 | Recadastro creates new user/family IDs | Passed | Test asserts fresh user and family ids differ from old ids. |
| 4 | Account deletion deactivates old user and family | Passed | Test asserts both old records are inactive. |
| 5 | Login and reset resolve only active accounts | Passed | Auth test covers inactive-only login/reset behavior and reset for fresh active account. |
| 6 | PostgreSQL enforces active-only uniqueness | Passed | V11 migration and DB-level integration test with duplicate active insert. |
| 7 | Demo seed skips only active demo account | Passed | `DemoDataSeederTest` covers active idempotency and inactive historical demo account. |
| 8 | No mobile scope changes | Passed | Phase diff contains no files under `mobile/`. |

## Automated Evidence

| Command | Result |
|---------|--------|
| `cd backend && ./mvnw test -Dtest=AuthIntegrationTest` | Passed: 13 tests, 0 failures. |
| `cd backend && ./mvnw test -Dtest=DemoDataSeederTest` | Passed: 2 tests, 0 failures. |
| `cd backend && ./mvnw test -Dtest=OpenApiIntegrationTest` | Passed: 1 test, 0 failures. |
| `cd backend && ./mvnw test -Dtest=AuthIntegrationTest,DemoDataSeederTest,OpenApiIntegrationTest` | Passed: 16 tests, 0 failures. |
| `cd backend && ./mvnw test` | Passed: 70 tests, 0 failures. |
| `git diff --check HEAD~7..HEAD` | Passed. |
| `git diff --name-only HEAD~7..HEAD` | Passed: no `mobile/` files. |

## Regression Coverage

The changed surfaces are backend auth lifecycle, PostgreSQL migration, demo seed idempotency, and technical docs. Focused tests cover the new behavior, and the full backend suite covers regressions across children, missions, rewards, wallet, dashboard, tenant isolation, email sender tests, and OpenAPI generation.

## Manual Smoke Recommended

None required for this backend-only phase.

## Result

Phase 08 is verified as passed and ready for merge management.
