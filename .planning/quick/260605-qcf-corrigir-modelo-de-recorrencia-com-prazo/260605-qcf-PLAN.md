---
quick_id: 260605-qcf
slug: corrigir-modelo-de-recorrencia-com-prazo
status: complete
created_at: 2026-06-05
completed_at: 2026-06-05
---

# Plan: corrigir modelo de recorrencia com prazo

## Objetivo

Separar a cadencia da recorrencia do prazo de conclusao da missao. Missoes recorrentes devem repetir uma janela de conclusao em dias e gerar uma ocorrencia atual quando a anterior venceu sem ser concluida, sem mudar ainda o status da ocorrencia vencida.

## Decisoes

- `recurrenceType` continua definindo a cadencia (`ONCE`, `DAILY`, `WEEKLY`, `CUSTOM`).
- `completionWindowDays` define quantos dias a crianca tem para concluir cada ocorrencia recorrente.
- Para atribuicao recorrente sem data manual, a primeira ocorrencia e agendada para hoje e o prazo final e `scheduledDate + completionWindowDays`.
- A listagem da crianca garante uma ocorrencia corrente quando a ultima ocorrencia recorrente pendente ja expirou.
- Missoes pendentes expiradas continuam `PENDING` por enquanto; o tratamento de status fica para uma etapa posterior.

## Escopo

1. Adicionar campos de modelo e migracao para janela de conclusao e data agendada.
2. Ajustar criacao/edicao/atribuicao/listagem de missoes no backend.
3. Atualizar contrato mobile e telas do responsavel para usar prazo em dias nas recorrencias.
4. Atualizar testes e documentacao.

## Verificacao Planejada

- Backend focado de missoes.
- Backend completo.
- Mobile typecheck.
- Mobile testes focados de crianca/responsavel.
- Mobile lint.
