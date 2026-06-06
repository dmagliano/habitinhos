---
quick_id: 260605-qcf
slug: corrigir-modelo-de-recorrencia-com-prazo
status: complete
completed_at: 2026-06-05T22:17:19Z
---

# Summary: corrigir modelo de recorrencia com prazo

## Entregue

- Backend ganhou `missions.completion_window_days`, `assigned_missions.scheduled_date` e `assigned_missions.snapshot_completion_window_days`.
- Missoes recorrentes agora usam `scheduledDate` para evitar duplicidade por ocorrencia e calculam `dueDate` pela janela de conclusao.
- A listagem da crianca garante uma ocorrencia atual quando a anterior recorrente venceu sem conclusao, mantendo a ocorrencia vencida como `PENDING`.
- Criacao automatica apos credito/aprovacao respeita a recorrencia atual da missao e para de gerar novas ocorrencias se a missao foi desativada ou editada para nao recorrente.
- Mobile separa recorrencia de prazo: o formulario do responsavel mostra prazo em dias para missoes recorrentes e nao pede data absoluta ao atribui-las.
- Contrato TypeScript, testes e documentacao foram atualizados para `completionWindowDays`, `scheduledDate` e `snapshotCompletionWindowDays`.

## Verificacao

- `cd backend && ./mvnw test -Dtest=AssignedMissionIntegrationTest,MissionApprovalIntegrationTest,MissionAssignmentIntegrationTest,MissionIntegrationTest` — 20 testes passaram.
- `cd backend && ./mvnw test` — 57 testes passaram.
- `cd mobile && npm run typecheck` — passou.
- `cd mobile && npm test -- responsible-missions responsible-service child-service child-home child-missions responsible-approvals` — 37 testes passaram.
- `cd mobile && npm run lint` — passou.

## Observacoes

- O status futuro de ocorrencias recorrentes expiradas e nao concluidas segue pendente para uma proxima decisao de produto.
- O worktree ja tinha mudancas sujas fora deste quick task em arquivos de smoke/navigation/base components; elas foram preservadas fora do commit desta entrega.
