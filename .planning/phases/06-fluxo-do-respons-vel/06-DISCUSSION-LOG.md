# Phase 06: Fluxo do responsável - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02T19:57:47-03:00
**Phase:** 06-Fluxo do responsável
**Areas discussed:** Ritmo do dashboard, Criação e atribuição de missões

---

## Ritmo do Dashboard

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Foco principal | Pendências primeiro | Coloca aprovações e itens que precisam de ação no topo. | |
| Foco principal | Visão da família | Mostra crianças, saldos e resumo geral antes das pendências. | ✓ |
| Foco principal | Ações rápidas | Prioriza criar missão, criar recompensa e adicionar criança. | |

**User's choice:** Visão da família seguida de ações rápidas.
**Notes:** O dashboard deve abrir calmo e panorâmico, sem esconder atalhos de criação.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Resumo principal | Cards por criança | Avatar, saldo, missões e ação `Ver detalhes`. | ✓ |
| Resumo principal | Métricas gerais primeiro | Números agregados antes da lista de crianças. | |
| Resumo principal | Lista simples de crianças | Nome, saldo e status principal. | |

**User's choice:** Cards por criança.
**Notes:** Cards devem conectar diretamente com dashboard e detalhe da criança.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Ações rápidas | Missão, recompensa, criança | `Nova missão`, `Nova recompensa`, `Adicionar criança`. | ✓ |
| Ações rápidas | Missão e aprovação | `Nova missão`, `Ver aprovações`, `Adicionar criança`. | |
| Ações rápidas | Somente criação | Apenas `Nova missão` em destaque. | |

**User's choice:** Missão, recompensa, criança.
**Notes:** As três ações principais da fase devem ficar logo depois da visão da família.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Aprovações no dashboard | Seção compacta | Mostra 2 ou 3 aprovações e link para ver mais. | |
| Aprovações no dashboard | Badge/contador apenas | Mostra contador e leva para tela de aprovações. | ✓ |
| Aprovações no dashboard | Lista completa | Todas as aprovações aparecem no dashboard. | |

**User's choice:** Badge/contador apenas.
**Notes:** Aprovações devem ter tela própria e não competir com visão da família.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Prioridade no card | Saldo de moedas | Mostra como cada criança está indo. | |
| Prioridade no card | Missões de hoje/pendentes | Foca no que precisa de ação agora. | ✓ |
| Prioridade no card | Última atividade | Mostra movimento recente. | |

**User's choice:** Missões de hoje/pendentes.
**Notes:** Saldo continua visível, mas como apoio.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Detalhe da criança | Resumo operacional | Missões, saldo, recompensas recentes e editar criança. | ✓ |
| Detalhe da criança | Histórico primeiro | Timeline de missões e resgates. | |
| Detalhe da criança | Gestão da criança | Editar dados e desativar perfil como foco. | |

**User's choice:** Resumo operacional.
**Notes:** Detalhe deve ajudar o responsável a entender e agir, não apenas administrar cadastro.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Resgates recentes | Seção curta no fim | Mostra 2 ou 3 resgates recentes. | ✓ |
| Resgates recentes | Dentro do card da criança | Cada card mostra o resgate mais recente. | |
| Resgates recentes | Só no detalhe da criança | Dashboard fica mais limpo. | |

**User's choice:** Seção curta no fim.
**Notes:** Cumpre `DASH-04` sem deslocar foco dos cards e ações.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Estado vazio | Guiar criação inicial | Orienta adicionar criança, missão e recompensa. | |
| Estado vazio | Explicar o sistema | Explica crianças, missões, moedas e recompensas antes dos botões. | ✓ |
| Estado vazio | Minimalista | Só mostra botões essenciais. | |

**User's choice:** Explicar o sistema.
**Notes:** Famílias novas devem entender o ciclo antes de começar a criar dados.

---

## Criação e Atribuição de Missões

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Fluxo principal | Fluxo guiado único | Criar missão e escolher crianças no mesmo caminho. | ✓ |
| Fluxo principal | Criar primeiro, atribuir depois | Salvar modelo e abrir etapa separada de atribuição. | |
| Fluxo principal | Atribuir só pela lista | Atribuição acontece depois em `Gerenciar missões`. | |

**User's choice:** Fluxo guiado único.
**Notes:** O usuário perguntou como atribuir para várias crianças; a decisão foi usar duas etapas visíveis dentro de um único fluxo.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Seleção de crianças | Selecionar manualmente | Nenhuma criança pré-marcada. | ✓ |
| Seleção de crianças | Todas pré-selecionadas | Todas as crianças ativas vêm marcadas. | |
| Seleção de crianças | Última seleção repetida | App lembra a seleção anterior na sessão. | |

**User's choice:** Selecionar manualmente.
**Notes:** Evita atribuições acidentais; selecionar uma ou mais crianças ativas.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Prazo | Prazo opcional simples | Campo opcional de data; vazio significa sem prazo. | ✓ |
| Prazo | Sempre perguntar prazo | Força escolher hoje, amanhã, semana ou sem prazo. | |
| Prazo | Sem prazo na criação inicial | Prazo fica para edição/futuro. | |

**User's choice:** Prazo opcional simples.
**Notes:** Combina com backend atual e mantém o formulário leve.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Aprovação obrigatória | Ligado por padrão | Toda missão precisa de aprovação. | |
| Aprovação obrigatória | Desligado por padrão | Conclusão credita automaticamente. | |
| Aprovação obrigatória | Escolha destacada por tipo | Pergunta com copy forte e explicação. | ✓ |

**User's choice:** Escolha destacada por tipo.
**Notes:** Usar copy como `Precisa aprovar antes de pagar moedas?`.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Feedback de sucesso | Resumo de confirmação | Mostra missão, crianças e regra de aprovação. | ✓ |
| Feedback de sucesso | Voltar direto para lista | Banner de sucesso e lista atualizada. | |
| Feedback de sucesso | Ir para detalhe da missão | Abre status e atribuições da missão criada. | |

**User's choice:** Resumo de confirmação.
**Notes:** Confirmação deve fechar o ciclo do fluxo guiado.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Falha parcial | Avisar e tentar atribuir de novo | Missão existe, mas atribuição ficou pendente. | ✓ |
| Falha parcial | Dizer que falhou tudo | Simples, mas pode mentir sobre backend. | |
| Falha parcial | Ir para detalhe da missão | Mostra missão criada e ação de atribuir. | |

**User's choice:** Avisar e tentar atribuir de novo.
**Notes:** O app deve ser honesto porque criação e atribuição são chamadas separadas.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Ativas/inativas | Lista separando ativas e inativas | Ativas primeiro, inativas em seção separada. | ✓ |
| Ativas/inativas | Filtro ativo/inativo | Alternância entre listas. | |
| Ativas/inativas | Só ativas | Inativas somem do MVP mobile. | |

**User's choice:** Lista separando ativas e inativas.
**Notes:** Mantém histórico visível sem misturar com missões acionáveis.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Edição | Edita o modelo daqui para frente | Snapshots existentes preservados. | ✓ |
| Edição | Perguntar se afeta existentes | Pode exigir backend novo. | |
| Edição | Bloquear com atribuições | Evita confusão, mas restringe demais. | |

**User's choice:** Edita o modelo daqui para frente.
**Notes:** A UI deve explicar que atribuições existentes preservam snapshot.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Desativação | Confirmação explícita | Sai de novas atribuições, histórico permanece. | ✓ |
| Desativação | Desativar direto com desfazer | Exige undo não disponível. | |
| Desativação | Bloquear se houver atribuições | Conflita com soft deactivation. | |

**User's choice:** Confirmação explícita.
**Notes:** Desativação não é exclusão.

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Atribuir depois | Sim, pelo detalhe/lista da missão | Ação continua em missões ativas. | ✓ |
| Atribuir depois | Só durante criação | MVP mais simples. | |
| Atribuir depois | Só recriando missão | Evita fluxo extra, mas ruim para o usuário. | |

**User's choice:** Sim, pelo detalhe/lista da missão.
**Notes:** `Atribuir crianças` fica disponível para missões ativas.

---

## the agent's Discretion

- Gestão em telas pequenas para crianças/recompensas e a tela dedicada de
  aprovação/rejeição não foram deep-dived. Planner pode escolher defaults
  coerentes com `06-UI-SPEC.md`, backend atual e design contract.
- Component decomposition, exact route names, refetch cadence, and secondary
  sorting are left to the researcher/planner.

## Deferred Ideas

None.
