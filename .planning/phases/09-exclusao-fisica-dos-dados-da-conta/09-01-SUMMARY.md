---
phase: 09-exclusao-fisica-dos-dados-da-conta
plan: 01
subsystem: auth
tags: [spring-boot, postgresql, flyway, jdbc, account-deletion]

requires:
  - phase: 08-permitir-recadastro-com-e-mail-de-conta-exclu-da-inativa
    provides: active-only e-mail uniqueness and recadastro after soft deletion
provides:
  - Enumeration-safe permanent deletion request with e-mail token delivery
  - Atomic FK-safe purge of all matching accounts and families
  - PostgreSQL proof of token lifecycle, isolation, replay prevention and rollback
affects: [09-02-openapi-documentation, authentication, data-retention]

tech-stack:
  added: []
  patterns: [dedicated destructive token purpose, transactional parameterized JDBC purge, deterministic failure injection]

key-files:
  created:
    - backend/src/main/java/br/com/habitinhos/auth/PermanentAccountDeletionService.java
    - backend/src/main/java/br/com/habitinhos/auth/PermanentDeletionFailureInjector.java
    - backend/src/main/resources/db/migration/V12__permanent_account_deletion_tokens.sql
  modified:
    - backend/src/main/java/br/com/habitinhos/auth/AuthController.java
    - backend/src/main/java/br/com/habitinhos/auth/AuthService.java
    - backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java

key-decisions:
  - "Permanent deletion uses PERMANENT_ACCOUNT_DELETION and never accepts the soft ACCOUNT_DELETION purpose."
  - "The token is locked and consumed in the same transaction before any DELETE, so rollback restores used_at."
  - "Purge scope is captured from normalized e-mail and executed explicitly per distinct family in FK-safe order."

patterns-established:
  - "Destructive public confirmation: enumeration-safe request, e-mail plus dedicated single-use token, no JWT or password."
  - "Deterministic rollback test: concrete production no-op component replaced by a test mock after first family DML."

requirements-completed: [AUTH-12]

duration: 25min
completed: 2026-08-20
---

# Phase 09 Plan 01: Exclusão física dos dados da conta Summary

**Fluxo público por e-mail com token dedicado e purge PostgreSQL atômico de todas as contas e famílias históricas correspondentes**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-21T01:29:42Z
- **Completed:** 2026-08-21T01:55:02Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Criou request `202` enumeration-safe e confirmação `204` sem Bearer, senha ou token no HTTP de resposta.
- Purga contas ativas/inativas e famílias distintas em ordem FK-safe, quebrando o ciclo entre resgates e transações.
- Comprovou rollback integral após DML, uso único/expiração/propósito do token, isolamento, JWT inválido e recadastro.

## Task Commits

Each task was committed atomically:

1. **Task 1: Criar token permanente, request/confirm e entrega de e-mail** - `db92c0b` (feat)
2. **Task 2: Executar purge multi-conta/multi-família e provar atomicidade** - `a8c2992` (test)

**Plan metadata:** committed with this summary.

## Files Created/Modified

- `backend/src/main/java/br/com/habitinhos/auth/PermanentAccountDeletionService.java` - Bloqueio/consumo do token e purge JDBC transacional.
- `backend/src/main/java/br/com/habitinhos/auth/PermanentDeletionFailureInjector.java` - Bean concreto no-op substituível por mock.
- `backend/src/main/resources/db/migration/V12__permanent_account_deletion_tokens.sql` - Novo propósito no constraint PostgreSQL.
- `backend/src/main/java/br/com/habitinhos/auth/dto/PermanentDeletionRequest.java` - Corpo público de solicitação por e-mail.
- `backend/src/main/java/br/com/habitinhos/auth/dto/PermanentDeletionConfirmRequest.java` - Corpo público de confirmação por e-mail e token.
- `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` - Provas de lifecycle, purge, isolamento e rollback.

## Decisions Made

- O token fica associado a uma conta representante, mas o escopo destrutivo é sempre expandido pelo e-mail normalizado dentro da transação.
- O registro do token é apagado no sucesso junto aos usuários; em falha, a transação restaura tanto o registro quanto `used_at`.
- O sender de produção não registra destinatário nos logs, reduzindo exposição de e-mail no novo fluxo destrutivo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Serviço de purge criado durante a Task 1**
- **Found during:** Task 1 (contrato de request/confirm)
- **Issue:** A rota de confirmação não compilava nem podia ser funcional sem a classe transacional prevista na Task 2.
- **Fix:** A base completa do serviço foi criada com o contrato; a Task 2 adicionou o injetor e as provas de atomicidade.
- **Files modified:** `PermanentAccountDeletionService.java`
- **Verification:** compilação e `AuthIntegrationTest` passaram após cada task.
- **Committed in:** `db92c0b`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Apenas reordenou a criação de um artefato já planejado; escopo e commits por task permaneceram separados.

## Issues Encountered

- `@Email` rejeitava espaços antes da normalização. Os DTOs passaram a aplicar `trim()` no construtor antes da validação.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd backend && ./mvnw -DskipTests compile` - PASS
- `cd backend && ./mvnw -Dtest=AuthIntegrationTest#permanentDeletionRemovesAllMatchingFamilies test` - PASS
- `cd backend && ./mvnw -Dtest=AuthIntegrationTest#permanentDeletionRollsBackAllMatchingFamilies test` - PASS
- `cd backend && ./mvnw -Dtest=AuthIntegrationTest test` - PASS, 18 tests
- `cd backend && ./mvnw test` - PASS, 75 tests

## Next Phase Readiness

- Backend e testes estão prontos para o plano 09-02 alinhar OpenAPI, Bruno e documentação.
- Nenhum blocker conhecido.

## Self-Check: PASSED

---
*Phase: 09-exclusao-fisica-dos-dados-da-conta*
*Completed: 2026-08-20*
