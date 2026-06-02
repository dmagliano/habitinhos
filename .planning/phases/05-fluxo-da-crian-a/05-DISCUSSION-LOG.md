# Phase 05: Fluxo da criança - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02T00:10:24-03:00
**Phase:** 05-Fluxo da criança
**Areas discussed:** Entrada no perfil da criança, Home da criança e prioridade do dia, Conclusão de missão e feedback, Resgate e saldo insuficiente

---

## Entrada no perfil da criança

| Option | Description | Selected |
|--------|-------------|----------|
| Seleção simples de perfil | A criança acessa um perfil existente dentro da sessão autenticada do responsável. | ✓ |
| PIN quando existir | Proteger entrada/troca com PIN quando houver suporte real. | |
| Várias crianças / nenhuma criança | Tratar famílias com múltiplos perfis ou sem perfis ativos. | |

**User's choice:** O responsável deve ter um PIN para entrar no perfil. Ao alterar do perfil infantil para o responsável, exige PIN.

**Notes:** O backend já possui `ChildProfile.accessPinHash` opcional e aceita `accessPin` em `ChildRequest`, mas não há endpoint de validação de PIN nem PIN do responsável. A decisão foi capturar a intenção e deferir essa implementação para outra task/seção GSD se a spec backend não existir.

---

## Home da criança e prioridade do dia

| Option | Description | Selected |
|--------|-------------|----------|
| Saldo em destaque | Mostrar saldo como elemento principal da home. | ✓ |
| Próxima missão / missões pendentes | Trazer missões pendentes logo em seguida. | ✓ |
| Progresso do dia | Usar progresso como elemento secundário se fizer sentido no design. | |
| Recompensas possíveis | Mostrar recompensas como navegação/área posterior. | |
| Estados vazios | Cobrir ausência de criança, missão ou dados reais. | |

**User's choice:** Home conforme a referência `painel_do_joaquim`, com destaque para saldo e missões pendentes. A lista de missões vem em seguida.

**Notes:** A sequência de missões deve ser priorizada por missões com prazo.

---

## Conclusão de missão e feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Mostrar +moedas | Para missão sem aprovação, exibir moedas/saldo recebido. | ✓ |
| Mostrar aguardando aprovação | Para missão com aprovação, mostrar somente que aguarda responsável. | ✓ |
| Atualizar saldo | Refletir saldo após resposta/refetch do backend. | ✓ |
| Retornar entre lista e detalhe | Planner decide navegação exata preservando o feedback. | |

**User's choice:** Missões que exigem aprovação devem somente mostrar `aguardando aprovação`. Missões sem aprovação devem exibir o saldo de moedas recebido. Por hora, sem animações.

**Notes:** Feedback final deve respeitar a resposta real do backend.

---

## Resgate e saldo insuficiente

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmar gasto de moedas | Exibir confirmação antes do resgate. | ✓ |
| Saldo restante | Mostrar o saldo que ficará após confirmar a troca/resgate. | ✓ |
| Desabilitar recompensas caras | Recompensas sem saldo suficiente ficam com ação bloqueada. | ✓ |
| Dica de moedas faltantes | Mostrar quantas moedas faltam para a recompensa. | ✓ |
| Mensagem amigável de erro | Erros devem usar PT-BR humano, sem detalhe técnico cru. | ✓ |

**User's choice:** Confirmar resgate apontando o saldo que ficará após confirmar aquela troca/resgate. Desabilitar o botão das recompensas de saldo insuficiente e mostrar dica de quantas moedas faltam. Em caso de erro, exibir mensagem amigável.

**Notes:** Insufficient balance should be represented both proactively in the UI and reactively if the backend returns an error.

---

## the agent's Discretion

- Exact layout of profile selection.
- Secondary sort order after due-date mission priority.
- Exact detail-vs-list navigation after mission completion.
- Exact API service decomposition and refetch strategy.
- Component decomposition, as long as approved Phase 5 UI-SPEC and existing base components are respected.

## Deferred Ideas

- Responsible PIN validation / protected switch from child profile to responsible profile. This needs a backend spec/endpoint and should not be faked locally in Phase 5.
