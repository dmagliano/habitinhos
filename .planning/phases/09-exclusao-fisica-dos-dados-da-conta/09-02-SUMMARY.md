---
phase: 09-exclusao-fisica-dos-dados-da-conta
plan: 02
subsystem: api-documentation
tags: [openapi, springdoc, bruno, account-deletion, contract-testing]

requires:
  - phase: 09-exclusao-fisica-dos-dados-da-conta
    provides: permanent e-mail/token deletion endpoints and transactional multi-family purge
provides:
  - Generated and manual OpenAPI contracts for public permanent deletion
  - Bruno and API guidance distinguishing irreversible purge from soft deactivation
  - Contract tests for public security, schemas, statuses and retained soft routes
affects: [api-clients, swagger, bruno, account-deletion]

tech-stack:
  added: []
  patterns: [explicit empty OpenAPI security override, structured generated-contract assertions]

key-files:
  created: []
  modified:
    - backend/src/main/java/br/com/habitinhos/auth/AuthController.java
    - backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java
    - bruno/habitinhos-openapi.yaml
    - bruno/README-BRUNO.md
    - docs/api-contract.md

key-decisions:
  - "Public permanent-deletion operations use @SecurityRequirements so generated OpenAPI emits security: [] instead of inheriting global Bearer auth."
  - "Permanent deletion remains a dedicated e-mail/token contract; password and literal confirmation belong to neither permanent request nor confirmation."

patterns-established:
  - "Generated OpenAPI verification: assert path method, security override, schema reference, required fields, response status and forbidden properties with JSONPath."
  - "Destructive-flow documentation: state irreversibility, full active/inactive multi-family scope, token purpose and explicit contrast with soft deactivation."

requirements-completed: [DOCS-01]

duration: 19min
completed: 2026-08-21
---

# Phase 09 Plan 02: OpenAPI, Bruno e documentação do purge permanente Summary

**Contrato público por e-mail/token publicado no OpenAPI gerado, Bruno e documentação, sem Bearer ou senha e separado da desativação soft**

## Performance

- **Duration:** 19 min
- **Started:** 2026-08-21T02:00:03Z
- **Completed:** 2026-08-21T02:19:07Z
- **Tasks:** 1
- **Files modified:** 7

## Accomplishments

- Publicou request `202` enumeration-safe por e-mail e confirmação `204` por e-mail/token, ambas com `security: []` no OpenAPI gerado e manual.
- Documentou purge irreversível de todas as contas ativas/inativas e famílias correspondentes, com token dedicado, expirável e single-use.
- Preservou e distinguiu `/auth/account-deletion/request` e `/auth/account-deletion/confirm` como desativação soft autenticada que mantém histórico.
- Adicionou assertions estruturais contra senha nos schemas permanentes e executou 20 testes focados e a suíte completa com 76 testes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Alinhar OpenAPI gerado, Bruno e documentação pública** - `c0a1cf7` (feat)

**Plan metadata:** committed with this summary.

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/auth/AuthController.java` - Desabilita explicitamente a segurança Bearer herdada nos dois endpoints públicos.
- `backend/src/main/java/br/com/habitinhos/auth/dto/PermanentDeletionRequest.java` - Publica o campo de e-mail com formato OpenAPI explícito.
- `backend/src/main/java/br/com/habitinhos/auth/dto/PermanentDeletionConfirmRequest.java` - Publica e-mail/token sem senha no schema gerado.
- `backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java` - Verifica paths permanentes e soft, segurança, schemas e respostas.
- `bruno/habitinhos-openapi.yaml` - Contrato manual importável com os dois POSTs permanentes e seus schemas.
- `bruno/README-BRUNO.md` - Orientação operacional e de segurança para distinguir soft de permanente.
- `docs/api-contract.md` - Semântica pública enumeration-safe, irreversível, multi-conta e multi-família.

## Decisions Made

- `@SecurityRequirements` vazio é o override explícito necessário no springdoc para operações públicas sob uma segurança Bearer global.
- O contrato manual replica o padrão de token emitido pelo schema gerado e não inclui password, JWT, IDs ou confirmação literal no fluxo permanente.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrigida herança indevida de Bearer no OpenAPI gerado**
- **Found during:** Task 1 (teste focado de contrato)
- **Issue:** `@Operation(security = {})` era omitido pelo springdoc como valor padrão, fazendo os endpoints permanentes herdarem a segurança Bearer global.
- **Fix:** Substituído pelo marcador explícito `@SecurityRequirements`, que gera `security: []` nas duas operações.
- **Files modified:** `backend/src/main/java/br/com/habitinhos/auth/AuthController.java`
- **Verification:** `OpenApiIntegrationTest` comprova arrays de segurança vazios nos dois paths.
- **Committed in:** `c0a1cf7`

**2. [Rule 1 - Bug] Publicado formato de e-mail nos schemas gerados**
- **Found during:** Task 1 (teste focado de contrato)
- **Issue:** Nesta versão do springdoc, `@Email` validava a entrada mas não emitia `format: email` no OpenAPI.
- **Fix:** Adicionado `format = "email"` às annotations `@Schema` dos dois DTOs permanentes.
- **Files modified:** `PermanentDeletionRequest.java`, `PermanentDeletionConfirmRequest.java`
- **Verification:** JSONPath confirma `format: email` em ambos os schemas; suíte completa passou.
- **Committed in:** `c0a1cf7`

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** As correções eram necessárias para o contrato gerado cumprir o requisito público sem Bearer e representar corretamente o e-mail; não houve expansão funcional.

## Issues Encountered

- As duas primeiras execuções focadas expuseram, respectivamente, a segurança global herdada e a ausência de `format: email`; ambas foram corrigidas e todos os gates foram repetidos com sucesso.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd backend && ./mvnw -Dtest=OpenApiIntegrationTest test` - PASS, 2 tests
- `cd backend && ./mvnw -Dtest=AuthIntegrationTest,OpenApiIntegrationTest test` - PASS, 20 tests
- `cd backend && ./mvnw test` - PASS, 76 tests
- `git diff --check` - PASS

## Next Phase Readiness

- Fase 09 completa: implementação, OpenAPI gerado/manual, Bruno e documentação pública estão alinhados.
- Nenhum blocker conhecido.

## Self-Check: PASSED

---
*Phase: 09-exclusao-fisica-dos-dados-da-conta*
*Completed: 2026-08-21*
