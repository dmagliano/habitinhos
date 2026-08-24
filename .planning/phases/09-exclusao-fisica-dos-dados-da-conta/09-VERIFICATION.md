---
phase: 09-exclusao-fisica-dos-dados-da-conta
verified: 2026-08-21T02:35:12Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
---

# Fase 09: Exclusão física dos dados da conta — Relatório de Verificação

**Objetivo da fase:** Um usuário pode solicitar exclusão permanente por e-mail e confirmá-la por um token de e-mail de uso único; a confirmação remove todas as contas e famílias associadas ao e-mail normalizado, ativas ou inativas, mantendo separado o fluxo existente de desativação.
**Verificado em:** 2026-08-21T02:35:12Z
**Status:** passed
**Reverificação:** Não — verificação inicial

## Alcance do objetivo

### Verdades observáveis

| # | Verdade | Status | Evidência real |
|---|---|---|---|
| 1 | A solicitação aceita e-mail normalizado, não exclui dados e produz resposta indistinguível para e-mail conhecido ou desconhecido. | ✓ VERIFICADO | `AuthController.java:122-135` responde 202 sem corpo; `AuthService.java:228-250` normaliza e apenas emite token; `AuthIntegrationTest.java:256-290` compara status/corpo para desconhecido e para duas contas ativa/inativa, sem DML. |
| 2 | Havendo uma ou mais contas, um token expirável e de uso único é enviado somente por `AccountEmailSender`. | ✓ VERIFICADO | `AuthService.java:231-249` busca todas as contas sem filtro `active`, invalida tokens permanentes anteriores, cria um token de 30 minutos e chama `sendPermanentAccountDeletionConfirmation`; `AccountEmailSender.java:15` é a abstração, com implementações em `LoggingAccountEmailSender.java:34-37` e `ResendAccountEmailSender.java:119-140`. O controller retorna `void`, portanto não expõe o token. |
| 3 | O token permanente tem propósito dedicado, hash, validade, uso único e consumo protegido contra concorrência. | ✓ VERIFICADO | Enum e constraint incluem `PERMANENT_ACCOUNT_DELETION` (`AuthResetPurpose.java:3-8`, migration V12). `AuthService.java:300-310,334-362` gera código aleatório, armazena SHA-256/Base64 e define expiração. `PermanentAccountDeletionService.java:92-111` seleciona propósito/hash/e-mail/validade/uso com `FOR UPDATE OF token`; linhas 51-55 fazem consumo condicional na mesma transação. Uma segunda confirmação não pode atravessar o lock com o mesmo token. |
| 4 | A confirmação pública exige e-mail + token válido, sem JWT ou senha; entradas inválidas, expiradas, usadas ou associadas a outro e-mail não executam exclusão. | ✓ VERIFICADO | DTO em `PermanentDeletionConfirmRequest.java:9-24` contém somente `email` e `token`; `SecurityConfig.java:33-44` permite ambos os endpoints permanentes; `PermanentAccountDeletionService.java:94-109` vincula hash, propósito, validade, `used_at` e e-mail antes do primeiro DML destrutivo. Testes cobrem chamada sem JWT e token inválido/expirado/usado (`AuthIntegrationTest.java:293-352`). |
| 5 | A confirmação válida remove todas as contas ativa/inativas correspondentes e todos os dados das famílias capturadas em ordem compatível com FKs. | ✓ VERIFICADO | `PermanentAccountDeletionService.java:38-49` captura todos os usuários e famílias pelo e-mail normalizado sem filtro de atividade. Linhas 58-85 removem tokens e, por família, nulificam `reward_redemptions.coin_transaction_id`, removem `coin_transactions`, `reward_redemptions`, missões atribuídas, carteiras, crianças, recompensas, missões, usuários e famílias. A ordem trata explicitamente o ciclo `reward_redemptions`/`coin_transactions`. `AuthIntegrationTest.java:355-405,710-810` comprova ausência física em duas famílias e preservação de uma família vizinha. |
| 6 | Uma falha após DML reverte o purge completo e também restaura o estado do token. | ✓ VERIFICADO | `confirm` é `@Transactional` (`PermanentAccountDeletionService.java:34-35`); o injetor é chamado após o primeiro delete familiar (`:62-71`). `AuthIntegrationTest.java:408-448` provoca falha, comprova ambas as famílias e os dois lados do ciclo preservados, `used_at IS NULL`, e depois reutiliza o token com sucesso. |
| 7 | JWTs/credenciais antigos deixam de funcionar e o e-mail pode ser registrado novamente. | ✓ VERIFICADO | A remoção física de `app_users` torna `/me` e login inválidos; `AuthIntegrationTest.java:384-404` comprova JWT antigo 401, login antigo 401, replay 400 e novo registro 201. |
| 8 | Testes PostgreSQL cobrem ausência completa, múltiplas famílias, rollback, resposta enumeration-safe e contrato OpenAPI. | ✓ VERIFICADO | `AbstractIntegrationTest.java:14-25` usa Testcontainers PostgreSQL 16. Execução independente: `./mvnw -Dtest=AuthIntegrationTest,OpenApiIntegrationTest test` passou com 20/20; `./mvnw test` passou com 76/76. Os testes relevantes estão em `AuthIntegrationTest.java:256-448` e `OpenApiIntegrationTest.java:51-74`. |
| 9 | O fluxo de desativação soft continua funcional e separado, e OpenAPI/Bruno/docs distinguem os contratos. | ✓ VERIFICADO | Soft usa endpoints autenticados e `ACCOUNT_DELETION` em `AuthController.java:106-120` e `AuthService.java:190-225`, apenas desativando usuário/família; teste em `AuthIntegrationTest.java:507-614`. Permanente usa rotas públicas e propósito separado. OpenAPI gerado é testado em `OpenApiIntegrationTest.java:51-74`; contrato manual em `bruno/habitinhos-openapi.yaml:131-203,722-769`; distinção explícita em `docs/api-contract.md:37-46` e `bruno/README-BRUNO.md:30-38`. |

**Pontuação:** 9/9 verdades verificadas

## Artefatos obrigatórios

| Artefato | Esperado | Status | Detalhes |
|---|---|---|---|
| `backend/src/main/java/br/com/habitinhos/auth/PermanentAccountDeletionService.java` | Validação/lock do token e purge transacional multi-família | ✓ VERIFICADO | Existe, é substantivo, é chamado pelo controller e usa dados reais do PostgreSQL via `JdbcTemplate`. |
| `backend/src/main/resources/db/migration/V12__permanent_account_deletion_tokens.sql` | Suporte ao propósito dedicado | ✓ VERIFICADO | Migration altera a constraint e foi aplicada com sucesso pelo Flyway durante os testes. |
| `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` | Provas PostgreSQL do ciclo de token, purge e rollback | ✓ VERIFICADO | 18 testes passaram; casos permanentes verificam resposta uniforme, lifecycle, duas famílias, isolamento, rollback e recadastro. |
| `backend/src/main/java/br/com/habitinhos/auth/PermanentDeletionFailureInjector.java` | Bean no-op substituível no teste | ✓ VERIFICADO | `@Component` concreto; substituído por `@MockBean` e acionado no ponto de falha determinístico. |
| `backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java` | Contrato gerado permanente e retenção das rotas soft | ✓ VERIFICADO | Assertions estruturais para paths, `security: []`, schemas e respostas; 2 testes passaram. |
| `bruno/habitinhos-openapi.yaml` | Contrato manual dos endpoints permanentes | ✓ VERIFICADO | Paths, schemas e status 202/204/400 presentes; sem senha/JWT no fluxo permanente. |
| `docs/api-contract.md` | Contrato público e distinção soft/permanente | ✓ VERIFICADO | Documenta resposta uniforme, irreversibilidade, escopo ativo/inativo, propósito e erros. |

## Verificação dos links críticos

| Origem | Destino | Via | Status | Detalhes |
|---|---|---|---|---|
| `AuthController` | `AuthService` / `PermanentAccountDeletionService` | rotas request/confirm | ✓ CONECTADO | Request chama `authService.requestPermanentAccountDeletion`; confirm chama `permanentAccountDeletionService.confirm`. |
| `AuthService` | `AccountEmailSender` | entrega do token | ✓ CONECTADO | Chamada ocorre somente após lookup não vazio e entrega e-mail normalizado, token bruto e expiração. |
| `PermanentAccountDeletionService` | `app_users.email` e famílias | SQL parametrizado por e-mail normalizado | ✓ CONECTADO | IDs de usuários/famílias vêm do banco; nenhuma ID é aceita no payload. |
| Token | purge | lock/consumo dentro da transação | ✓ CONECTADO | `SELECT ... FOR UPDATE` e `UPDATE ... WHERE used_at IS NULL` antecedem deletes; rollback restaura consumo. |
| Controller annotations | `/v3/api-docs` | springdoc + teste | ✓ CONECTADO | `@SecurityRequirements`, DTOs e respostas são observados no JSON gerado pelo teste. |
| OpenAPI manual | docs/Bruno | paths, corpos, status e semântica | ✓ ALINHADO | Todos usam e-mail no request, e-mail+token no confirm, 202/204 e distinção do soft delete. |

> Nota: `gsd-sdk verify.key-links` não conseguiu resolver nomes simbólicos como `AuthController` para paths e retornou “Source file not found”; os links acima foram verificados manualmente no código e por testes executados.

## Rastreamento de dados (Nível 4)

| Artefato | Dado | Fonte | Produz dado real | Status |
|---|---|---|---|---|
| `AuthService.requestPermanentAccountDeletion` | contas correspondentes | `AppUserRepository.findAllByNormalizedEmail` → query nativa em `app_users` | Sim, PostgreSQL sem filtro `active` | ✓ FLUINDO |
| `PermanentAccountDeletionService.confirm` | token, usuários e famílias | `auth_reset_tokens` + `app_users` via `JdbcTemplate` | Sim, com locks e SQL parametrizado | ✓ FLUINDO |
| `/v3/api-docs` | contrato gerado | annotations do controller e schemas dos DTOs | Sim, validado pelo MockMvc | ✓ FLUINDO |

## Verificações comportamentais

| Comportamento | Comando | Resultado | Status |
|---|---|---|---|
| Auth permanente + contrato gerado | `./mvnw -Dtest=AuthIntegrationTest,OpenApiIntegrationTest test` | 20 testes, 0 falhas/erros | ✓ PASSOU |
| Regressão completa do backend | `./mvnw test` | 76 testes, 0 falhas/erros | ✓ PASSOU |
| Migrations V1–V12 | execução Flyway durante testes PostgreSQL | 12 migrations validadas e aplicadas, schema em v12 | ✓ PASSOU |

## Execução de probes

Não há probes declarados nos planos nem arquivos `scripts/**/tests/probe-*.sh`; etapa não aplicável.

## Cobertura de requisitos

| Requisito | Plano de origem | Descrição | Status | Evidência |
|---|---|---|---|---|
| AUTH-12 | 09-01 | Exclusão permanente e transacional de todas as contas/famílias do e-mail normalizado, ativa/inativas, após token single-use e separada do soft delete | ✓ SATISFEITO | Serviço transacional, propósito/hash/lock dedicados, purge FK-safe, isolamento/rollback e testes PostgreSQL descritos acima. |
| DOCS-01 | 09-02 | Endpoints backend expostos por OpenAPI/Swagger | ✓ SATISFEITO | Annotations + `/v3/api-docs` testado, Swagger público na configuração de segurança, OpenAPI manual/Bruno/docs alinhados. |

Não há requisito órfão adicional atribuído à Fase 9 em `REQUIREMENTS.md`; AUTH-12 e DOCS-01 estão ambos contabilizados.

## Antipadrões encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---|---|---|---|---|
| — | — | Nenhum `TBD`, `FIXME`, `XXX`, placeholder ou implementação vazia relevante nos arquivos da fase | — | Nenhum blocker. |

### Observações de cobertura (não bloqueantes)

- O lock concorrente foi verificado estruturalmente (`FOR UPDATE` + consumo condicional), mas `AuthIntegrationTest` não contém uma corrida real com duas threads; o replay sequencial é coberto.
- O vínculo token/e-mail é imposto pela query SQL, mas não há um caso dedicado de teste com token válido e e-mail divergente. Esses pontos não invalidam as verdades, pois a implementação determinística foi inspecionada e a suíte cobre os caminhos adjacentes.

## Verificação humana necessária

Nenhuma. O objetivo é backend/contrato e todos os comportamentos necessários puderam ser verificados por código, SQL e testes PostgreSQL automatizados.

## Resumo de lacunas

Nenhuma lacuna bloqueante ou ligação incompleta foi encontrada. O fluxo público permanente está implementado e conectado, o purge é atômico e FK-safe, o fluxo soft permanece separado, e os contratos/documentação correspondem à API gerada.

---

_Verificado: 2026-08-21T02:35:12Z_
_Verificador: the agent (gsd-verifier)_
