# Quick Task 260605-gr5: Recorrencia e reprovar para refazer - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Task Boundary

Criar recorrencia simples de tarefas e permitir que o responsavel reprove uma
missao enviada pela crianca com opcao de devolver a mesma missao como pendente
para refazer. A justificativa da reprova deve ficar visivel para a crianca
quando a tarefa voltar como pendente.

Esta quick task deve ficar dentro do MVP/TCC: sem scheduler, calendario
avancado, notificacoes, historico detalhado de multiplas tentativas, ou
recorrencia customizada complexa.

</domain>

<decisions>
## Implementation Decisions

### Recorrencia MVP
- A UI do responsavel deve expor apenas `ONCE`, `DAILY` e `WEEKLY`.
- `CUSTOM` continua no contrato/tipo existente, mas fica fora da UI do MVP.
- A proxima ocorrencia recorrente deve nascer a partir de uma acao real:
  conclusao com credito automatico ou aprovacao do responsavel. Nao criar
  scheduler nesta quick task.
- Para `DAILY`, a proxima ocorrencia usa `dueDate + 1 dia` quando houver
  `dueDate`; sem `dueDate`, usa a data atual + 1 dia.
- Para `WEEKLY`, a proxima ocorrencia usa `dueDate + 7 dias` quando houver
  `dueDate`; sem `dueDate`, usa a data atual + 7 dias.
- Antes de criar a proxima ocorrencia, o backend deve evitar duplicar se ja
  houver missao aberta (`PENDING` ou `AWAITING_APPROVAL`) para a mesma crianca
  e a mesma missao.

### Reprovar e devolver para refazer
- O modal de reprova do responsavel deve incluir um toggle/checkbox
  `Devolver para refazer`.
- O toggle deve vir marcado por padrao.
- Quando marcado, a reprova salva a justificativa, zera os timestamps de envio
  da tentativa atual conforme necessario, e devolve a atribuicao para `PENDING`
  sem creditar moedas.
- Quando desmarcado, a missao permanece `REJECTED` e nao volta para a lista de
  pendencias da crianca.
- A justificativa continua opcional no backend para compatibilidade, mas a UI
  deve incentivar o responsavel a explicar o que precisa ser ajustado.

### Mensagem para a crianca
- Quando uma missao `PENDING` tiver `rejectionReason`, o card e o detalhe da
  crianca devem mostrar a mensagem de reprova com copia amigavel, por exemplo:
  `Responsavel pediu ajuste: {motivo}`.
- Quando a crianca reenviar a missao, a mensagem de reprova deve sumir da
  resposta e do estado da missao. A nova revisao volta ao fluxo normal:
  `AWAITING_APPROVAL` se exige aprovacao, ou `COMPLETED` com credito automatico
  se nao exige aprovacao.

### the agent's Discretion
- Nomes internos exatos de metodos, helpers e estilos ficam a criterio da
  implementacao, mantendo os padroes existentes do projeto.
- A UI pode usar checkbox, switch simples ou controle equivalente, desde que
  fique claro que devolver para refazer e a escolha padrao.

</decisions>

<specifics>
## Specific Ideas

- Aproveitar `Mission.recurrenceType`, `RecurrenceType`, `AssignedMission.rejectionReason`
  e o DTO `AssignedMissionResponse`, que ja existem.
- Preferir uma migration pequena para snapshot de recorrencia em
  `assigned_missions`, se a implementacao precisar preservar a regra da missao
  atribuida independentemente de edicoes futuras na missao modelo.
- A crianca nao deve ver missoes definitivamente `REJECTED`; ela so ve a
  mensagem quando a missao foi devolvida para `PENDING`.
- Textos visiveis seguem PT-BR; nomes tecnicos seguem em ingles.

</specifics>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` - backend como fonte da verdade, escopo MVP/TCC,
  mobile PT-BR.
- `.planning/REQUIREMENTS.md` - missoes, aprovacao/rejeicao, wallet/ledger,
  fluxo child/responsible.
- `.planning/phases/06-fluxo-do-respons-vel/06-CONTEXT.md` - decisoes do fluxo
  responsavel e criacao/atribuicao de missoes.
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMission.java`
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionService.java`
- `backend/src/main/java/br/com/habitinhos/missions/dto/RejectAssignedMissionRequest.java`
- `backend/src/main/java/br/com/habitinhos/missions/dto/AssignedMissionResponse.java`
- `mobile/src/features/responsible/ResponsibleApprovalsScreen.tsx`
- `mobile/src/features/responsible/ResponsibleMissionFormScreen.tsx`
- `mobile/src/features/child/ChildMissionsScreen.tsx`
- `mobile/src/features/child/ChildMissionDetailScreen.tsx`
- `mobile/src/features/child/components/MissionCard.tsx`
- `mobile/src/api/types.ts`

</canonical_refs>
