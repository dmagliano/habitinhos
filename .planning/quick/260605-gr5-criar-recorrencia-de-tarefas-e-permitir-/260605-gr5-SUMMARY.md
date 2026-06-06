---
quick_id: 260605-gr5
slug: criar-recorrencia-de-tarefas-e-permitir-
status: complete
completed_at: 2026-06-05T15:29:55.000Z
implementation_commit: ae7461e
---

# Summary: Recorrencia e Reprovar Para Refazer

## Resultado

Missoes agora podem ser criadas como unica, diaria ou semanal. Quando a missao
recorrente gera credito, o backend cria a proxima ocorrencia pendente para a
mesma crianca sem depender de scheduler.

O responsavel tambem pode reprovar uma conclusao e escolher, por padrao, se a
missao volta para a crianca refazer. Nesse caso, a mensagem de reprova aparece
no card e no detalhe da crianca ate a missao ser reenviada.

## Mudancas Entregues

- Backend adiciona snapshot `snapshotRecurrenceType` em atribuicoes de missao.
- Backend cria a proxima ocorrencia `DAILY` ou `WEEKLY` apos aprovacao ou
  conclusao com credito automatico, evitando duplicar missoes abertas.
- Contrato de reprova aceita `returnToPending`; quando verdadeiro, a missao
  volta para `PENDING` preservando `rejectionReason` visivel para a crianca.
- Reenvio da missao limpa rejeicao anterior e segue o fluxo normal de aprovacao
  ou credito automatico.
- Mobile responsavel expoe selecao de recorrencia na criacao/edicao de missao.
- Mobile responsavel adiciona o controle `Devolver para refazer` na reprova,
  marcado por padrao.
- Mobile crianca mostra a mensagem `Responsável pediu ajuste` em lista e
  detalhe de missoes pendentes devolvidas.
- Documentacao de API e modelo de dados atualizada para o novo contrato.

## Verificacao

- `cd backend && ./mvnw test -Dtest=MissionApprovalIntegrationTest,MissionAssignmentIntegrationTest,AssignedMissionIntegrationTest` - passou.
- `cd backend && ./mvnw test` - passou, 54 testes.
- `cd mobile && npm test -- responsible-approvals child-missions responsible-missions` - passou, 3 suites / 19 testes.
- `cd mobile && npm run typecheck` - passou.
- `cd mobile && npm run lint` - passou.

## Observacoes

- `cd mobile && npm test` completo foi executado e falhou em suites de
  navegacao/login ja afetadas por alteracoes sujas pre-existentes em
  `AppScreen`, `RootNavigator` e testes base. Esses arquivos ficaram fora do
  commit desta quick task.
- Recorrencia `CUSTOM`, scheduler, notificacoes e historico visual de multiplas
  tentativas seguem fora do escopo do MVP desta entrega.
