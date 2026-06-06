---
quick_id: 260605-hif
slug: corrigir-listagem-para-ocultar-missoes-e
status: complete
completed_at: 2026-06-05T15:44:11.000Z
implementation_commit: 0c09815
---

# Summary: Ocultar Missoes Expiradas

## Resultado

A listagem infantil de missoes agora omite missoes pendentes cujo `dueDate` ja
passou. Missoes sem prazo, de hoje ou futuras continuam aparecendo normalmente.

## Mudancas Entregues

- Backend troca a consulta de `GET /children/{childId}/missions` para buscar
  apenas missoes `PENDING` visiveis: `dueDate is null` ou `dueDate >= hoje`.
- Missoes expiradas continuam com o status armazenado atual; esta quick task
  nao cria status novo nem altera o ciclo de vida delas.
- Testes de integracao cobrem vencida escondida, hoje/futura/sem prazo visiveis
  e status `PENDING` preservado no banco.
- Testes de recorrencia foram ajustados para usar datas relativas, evitando
  dependencia de datas fixas que ja poderiam estar vencidas.
- Contrato de API documenta a regra de visibilidade da listagem infantil.

## Verificacao

- `cd backend && ./mvnw test -Dtest=AssignedMissionIntegrationTest,MissionApprovalIntegrationTest` - passou, 11 testes.
- `cd backend && ./mvnw test` - passou, 55 testes.

## Observacoes

- Nenhuma alteracao foi feita no mobile; home e tela de missoes da crianca ja
  consomem o endpoint filtrado.
- Reatribuicao, status de expiracao e tratamento operacional de missoes nao
  completadas ficaram para uma etapa posterior, conforme decidido.
