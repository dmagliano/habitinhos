---
quick_id: 260605-hif
slug: corrigir-listagem-para-ocultar-missoes-e
mode: quick
status: planned
created_at: 2026-06-05T15:36:30.579Z
---

# Quick Plan: Ocultar Missoes Expiradas Da Crianca

## Objetivo

Corrigir a listagem de missoes da crianca para nao exibir missoes pendentes
cujo prazo ja passou. Nesta entrega, missoes expiradas nao recebem novo status;
apenas deixam de aparecer para a crianca.

## Decisoes

- Missao expirada significa `dueDate < hoje`.
- Missao com `dueDate` igual a hoje continua visivel.
- Missao sem `dueDate` continua visivel.
- A regra fica no backend, no endpoint `GET /children/{childId}/missions`.
- Nao alterar status, reatribuicao, dashboard do responsavel ou historico nesta
  quick task.

## Tarefas

1. Backend
   - Filtrar a busca de missoes pendentes da crianca por `dueDate is null OR dueDate >= hoje`.
   - Manter ordenacao atual por prazo e criacao.

2. Testes
   - Adicionar cobertura para missao vencida pendente nao aparecer na listagem.
   - Garantir que missao de hoje, futura e sem prazo continuam visiveis.
   - Confirmar que a missao vencida continua `PENDING` no banco.

3. Documentacao
   - Atualizar contrato/documentacao para registrar que missoes expiradas sao
     omitidas da listagem infantil.
