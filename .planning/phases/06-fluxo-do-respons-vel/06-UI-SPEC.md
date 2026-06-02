---
phase: 06
slug: fluxo-do-respons-vel
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-02
---

# Phase 06 - UI Design Contract

> Contrato visual e de interação para o fluxo mobile do responsável.
> Gerado pelo `gsd-ui-researcher` a partir do roadmap, requisitos,
> contrato mobile canônico, referências Stitch da Fase 6, baseline aprovado
> da Fase 5 e tokens/componentes React Native existentes.

## Escopo

A Fase 6 substitui o stub do responsável por uma jornada real de gestão
familiar no mobile:

- `06-01`: dashboard do responsável e detalhe da criança.
- `06-02`: criação, edição e desativação de crianças.
- `06-03`: gestão de missões, atribuição e fila de aprovações.
- `06-04`: gestão de recompensas.

Referências visuais primárias:

- `docs/design/stitch/painel_do_responsavel/screen.png`
- `docs/design/stitch/aprovacoes/screen.png`
- `docs/design/stitch/gerenciar_missoes/screen.png`
- `docs/design/stitch/gerenciar_recompensas/screen.png`
- `docs/design/stitch/nova_missao_1/screen.png`
- `docs/design/stitch/nova_missao_2/screen.png`
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png`

As screenshots orientam hierarquia, ritmo, tom, componentes e estados. Não
copiar HTML, CSS, Tailwind, DOM, JavaScript, fotos, SVGs, ícones externos ou
padrões web dos exports Stitch.

## Fontes Preenchidas

| Fonte | Decisões usadas |
|-------|-----------------|
| `.planning/ROADMAP.md` | Escopo, planos e critérios da Fase 6 |
| `.planning/REQUIREMENTS.md` | MOBL-03, DASH-01..DASH-04, CHLD-03, MISS-01, MISS-03, MISS-08, MISS-09, REWD-01 |
| `docs/design/mobile-design-contract.md` | Regras Android-first, componentes base, estados e acessibilidade |
| `docs/design/phase-design-map.md` | Referências visuais obrigatórias da Fase 6 |
| `docs/design/stitch/DESIGN.md` | Tokens, restrições visuais e tom do responsável |
| `.planning/phases/05-fluxo-da-crian-a/05-UI-SPEC.md` | Baseline aprovado de tokens, estados, navegação e guardrails mobile |
| `.planning/phases/05-fluxo-da-crian-a/05-PATTERNS.md` | Padrões de implementação e componentes reutilizáveis da Fase 5 |
| `mobile/src/theme/*` | Cores, espaçamento, tipografia, raios e sombras reais |
| `mobile/src/components/*` | `AppScreen`, `AppHeader`, `Card`, botões, badges e avatar existentes |
| Backend controllers/DTOs | Endpoints e dados reais para crianças, carteiras, missões, aprovações e recompensas |
| Phase 6 `CONTEXT.md` | Não presente |
| Phase 6 `RESEARCH.md` | Não presente |

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none - componentes React Native próprios |
| Icon library | none - emojis e texto apenas quando úteis |
| Font | fonte sans-serif do sistema |
| Platform target | Expo React Native, TypeScript, Android-first 360px-430px |

shadcn gate: não aplicável. O projeto é Expo/React Native, não possui
`components.json`, não possui Tailwind config e não usa registry shadcn.

## Product Feel

O fluxo do responsável deve ser calmo, organizado e confiável. Ele preserva a
leveza do Habitinhos, mas usa menos emojis decorativos que o fluxo infantil e
prioriza leitura rápida, controle e redução de erros.

Hierarquia visual obrigatória:

1. Situação da família: crianças, saldos, missões e aprovações.
2. Ações rápidas: criar missão, criar recompensa, criar criança.
3. Pendências urgentes: aprovar ou rejeitar missões aguardando revisão.
4. Gestão detalhada: crianças, missões, atribuições, recompensas e perfil.

Use no máximo um emoji principal por card. Emojis nunca substituem labels,
status ou `accessibilityLabel`.

---

## Spacing Scale

Valores declarados em `mobile/src/theme/spacing.ts`. Todos são múltiplos de 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps entre emoji/texto, badges e metadados compactos |
| sm | 8px | Espaçamento interno compacto e chips |
| md | 16px | Padding padrão de cards, listas e campos |
| lg | 24px | Espaço entre seções e header/conteúdo |
| xl | 32px | Grupos principais e respiro de formulário |
| 2xl / xxl | 48px | Separação maior em telas com pouco conteúdo |
| 3xl / xxxl | 64px | Respiro superior excepcional, somente se não prejudicar densidade |

Constantes:

| Token | Value | Usage |
|-------|-------|-------|
| screenHorizontal | 20px | Padding horizontal padrão Android 360px-430px |
| cardPadding | 16px | Padding interno de cards |
| bottomSafePadding | 24px | Respiro acima de safe area e bottom tabs |

Exceptions:

- Alvos de toque usam mínimo fixo `44x44`.
- Botões primários usam `minHeight: 56`.
- Botões secundários, chips, segmented controls e campos tocáveis usam
  `minHeight: 48`.
- Inputs de texto usam altura mínima `56`; áreas de descrição usam mínimo
  `96`.
- Barras de progresso ou sliders de moedas podem usar altura visual `12`,
  com área tocável mínima `44`.
- FAB de adicionar, quando usado na lista de missões, usa `56x56` e não deve
  cobrir conteúdo da lista ou tab bar.

Regras de layout da Fase 6:

- Dashboards e listas usam `spacing.lg` entre seções.
- Cards de lista usam `spacing.md` entre si.
- Formulários usam uma coluna em 360px-430px; nunca usar campos lado a lado
  quando labels ou valores puderem truncar.
- Cards não devem conter outros cards com sombra; painéis internos devem ser
  `surfaceSoft` sem sombra.

---

## Typography

Usar apenas fonte do sistema e exatamente estes quatro tamanhos e dois pesos.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 24px |
| Label | 14px | 700 | 20px |
| Heading | 20px | 700 | 28px |
| Display | 28px | 700 | 36px |

Regras:

- Texto principal nunca fica abaixo de 16px.
- `Label` 14px é permitido em badges, tabs, metadados, labels de campo e
  helper text.
- `Display` é reservado para títulos de tela como `Área do responsável`,
  `Missões`, `Recompensas` e `Nova missão`; não usar dentro de cards
  compactos.
- Usar somente pesos `400` e `700`; qualquer referência Stitch acima disso
  deve ser mapeada para `700`.
- Títulos longos de missão/recompensa quebram em até duas linhas; não reduzir
  fonte para forçar linha única.

---

## Color

Usar `mobile/src/theme/colors.ts` como fonte única.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F5FBF8` | Fundo do app e safe areas |
| Secondary (30%) | `#FFFFFF`, `#EFF5F3`, `#E9EFED`, `#EAF7FE` | Cards, painéis internos, tab bar, inputs e estados desabilitados |
| Accent (10%) | `#4FD1C5` | CTAs primárias, tab ativa, seleção, confirmação positiva e progresso principal |
| Coin/reward semantic | `#F6AD55`, `#FFF3DF`, `#8E4E11` | Moedas, custo de recompensa, valores de missão e dicas |
| Success semantic | `#38A169`, `#E6F7ED` | Aprovação concluída, missão concluída e recompensa ativa |
| Warning semantic | `#F6AD55`, `#FFF3DF` | Aguardando aprovação, atenção e revisão necessária |
| Destructive | `#BA1A1A`, `#FFDAD6` | Rejeitar, desativar e erros bloqueantes |

Accent reserved for:

- CTAs: `Nova missão`, `Salvar missão`, `Aprovar`, `Salvar criança`,
  `Salvar recompensa`, `Atribuir missão`;
- estado ativo de bottom tab e filtros selecionados;
- seleção de criança, avatar, recorrência e `requiresApproval`;
- barra/slider de valor de moedas quando editável;
- borda/fill de item selecionado.

O laranja de moedas não é cor genérica de ação. Ele fica restrito a
`CoinBadge`, custo/valor de moedas, dicas de recompensa e pendências com
impacto financeiro.

Status nunca deve depender apenas de cor. Todo status usa texto, badge/shape e
quando útil um emoji discreto.

---

## Component Contracts

Reaproveitar componentes existentes antes de criar novos:

| Component | Phase 6 Contract |
|-----------|------------------|
| `AppScreen` | Safe area, fundo, padding horizontal, scroll em dashboards/listas/detalhes/formulários |
| `AppHeader` | Título, subtítulo, avatar emoji do responsável/família, ação simples e `CoinBadge` quando útil |
| `Card` | Superfície padrão para métricas, crianças, filas, itens gerenciáveis e formulários |
| `PrimaryButton` | 56px, uma ação principal por tela ou card focado |
| `SecondaryButton` | 48px, cancelar, editar, trocar modo, tentar novamente |
| `CoinBadge` | Saldo da criança, valor de missão, custo de recompensa e totais |
| `StatusBadge` | Ativa, inativa, pendente, aguardando aprovação, aprovada, rejeitada |
| `EmojiAvatar` | Identidade sem foto; mapear `avatarKey` para emoji e fallback `⭐` |
| `BottomTabBar` | Quatro destinos do responsável: `Início`, `Missões`, `Recompensas`, `Perfil` |
| `EmptyState` | Emoji discreto, título, helper text e ação opcional |
| `FeedbackBanner` | Sucesso, aviso e erro para mutações e carregamento recuperável |

Novos componentes de domínio:

| Component | Contract |
|-----------|----------|
| `MetricSummaryCard` | Métrica curta com número grande, label e estado; usado no dashboard para crianças, aprovações, missões ativas e resgates recentes |
| `ChildSummaryCard` | Avatar, nome, idade opcional, saldo, missões pendentes/concluídas e ação `Ver detalhes` |
| `ApprovalCard` | Criança, missão, horário de conclusão, moedas, botões `Rejeitar` e `Aprovar`; botões separados e legíveis |
| `ManageListItem` | Item de missão/recompensa/criança com emoji, título, metadados, status e ação `Editar` |
| `ResponsibleFormSection` | Agrupa campos de formulário sem sombra interna; labels sempre visíveis |
| `EmojiPicker` | Seleção horizontal de emojis com texto acessível e estado selecionado |
| `CoinValueControl` | Entrada numérica ou stepper/slider com valor visível; mínimo 1 para missão/recompensa |
| `ChildPicker` | Seleção multi-criança para atribuição de missão; avatar, nome e check visível |
| `ConfirmActionSheet` | Confirma rejeição/desativação com copy específica e botões separados |

Regras:

- `Aprovar` e `Rejeitar` nunca aparecem como ícones soltos sem texto.
- `Rejeitar` abre confirmação ou campo de motivo opcional antes de enviar.
- `Desativar` sempre exige confirmação explícita.
- Toggling de recompensa ativa/inativa deve ter label de estado além do switch.
- Pressables devem expor `accessibilityLabel` com ação e objeto:
  `Aprovar missão Escovar os dentes de Joaquim`.

## Navigation Contract

Substituir `ResponsibleStub` por stack/tabs reais do responsável mantendo
`FamilyHub` como troca de modo.

Rotas obrigatórias:

| Route | Purpose |
|-------|---------|
| `ResponsibleTabs` | Container de tabs do responsável |
| `ResponsibleHome` | Dashboard com métricas, crianças, aprovações e resgates recentes |
| `ResponsibleChildDetail` | Detalhe de criança com saldo, missões e histórico resumido |
| `ResponsibleChildren` | Lista e gestão de crianças |
| `ResponsibleChildForm` | Criar/editar criança |
| `ResponsibleMissions` | Lista de missões, filtros e entrada para criar/editar |
| `ResponsibleMissionForm` | Criar/editar missão e selecionar atribuições |
| `ResponsibleAssignmentForm` | Atribuir missão existente a uma ou mais crianças quando separado do form |
| `ResponsibleApprovals` | Fila completa de missões aguardando aprovação |
| `ResponsibleRewards` | Lista e gestão de recompensas |
| `ResponsibleRewardForm` | Criar/editar recompensa |
| `ResponsibleProfile` | Perfil, trocar modo e sair da conta |

Bottom tabs:

| Tab | Label | Emoji | Destination |
|-----|-------|-------|-------------|
| Home | `Início` | `🏠` | Dashboard |
| Missions | `Missões` | `📋` | Gestão de missões e aprovações |
| Rewards | `Recompensas` | `🎁` | Gestão de recompensas |
| Profile | `Perfil` | `🙂` | Perfil e troca de modo |

Regras:

- `FamilyHub` item `Sou responsável` abre `ResponsibleTabs`.
- Formulários e detalhes usam stack acima das tabs.
- Botão voltar tem alvo `44x44` e label `Voltar`.
- Após criar/editar/desativar/aprovar/rejeitar, voltar ou permanecer na lista
  com dados atualizados e feedback visível.
- Não tratar modo responsável como novo login; ele usa a sessão autenticada
  existente.

## API Data Contract For UI States

A interface deve representar dados reais do backend. Não usar contadores,
saldos, crianças, missões, aprovações ou recompensas mockados quando a API
falhar.

| Backend Data | UI Use |
|--------------|--------|
| `GET /children` | Dashboard, lista de crianças, seletor de atribuição |
| `POST /children` | Criar criança |
| `GET /children/{id}` | Detalhe/edição de criança |
| `PUT /children/{id}` | Editar criança |
| `PATCH /children/{id}/deactivate` | Desativar criança |
| `GET /children/{childId}/wallet` | Saldo por criança |
| `GET /children/{childId}/wallet/transactions` | Histórico e resgates recentes |
| `GET /missions` | Gestão de missões |
| `POST /missions` | Criar missão |
| `GET /missions/{id}` | Detalhe/edição de missão |
| `PUT /missions/{id}` | Editar missão |
| `PATCH /missions/{id}/deactivate` | Desativar missão |
| `POST /missions/{id}/assign` | Atribuir missão |
| `GET /assigned-missions/pending-approval` | Dashboard e fila de aprovações |
| `POST /assigned-missions/{id}/approve` | Aprovar conclusão |
| `POST /assigned-missions/{id}/reject` | Rejeitar conclusão com motivo opcional |
| `GET /rewards` | Gestão de recompensas |
| `POST /rewards` | Criar recompensa |
| `GET /rewards/{id}` | Detalhe/edição de recompensa |
| `PUT /rewards/{id}` | Editar recompensa |
| `PATCH /rewards/{id}/deactivate` | Desativar recompensa |

Status mapping:

| Backend Status | UI Label | Visual State |
|----------------|----------|--------------|
| `PENDING` | `Pendente` | Badge neutro; ainda não concluída pela criança |
| `AWAITING_APPROVAL` | `Aguardando aprovação` | Badge warning; ações `Rejeitar` e `Aprovar` |
| `COMPLETED` | `Concluída` | Badge success; sem ação de aprovação |
| `REJECTED` | `Rejeitada` | Badge destructive/warning; mostrar motivo quando houver |
| `CANCELLED` | `Indisponível` | Muted/disabled; sem ação principal |
| reward `active=true` | `Ativa` | Success/selected badge ou switch ligado com label |
| reward `active=false` | `Inativa` | Muted; não exibir como disponível para criança |
| child `active=true` | `Ativa` | Visível em seleção e dashboard |
| child `active=false` | `Inativa` | Muted; não selecionar para novas atribuições |

Data refresh:

- Após aprovar missão, atualizar aprovações, wallet da criança e dashboard.
- Após rejeitar missão, remover da fila de aprovação e mostrar feedback.
- Após criar/editar/desativar item, atualizar a lista correspondente.
- Dashboard deve preservar dimensões enquanto atualiza e impedir submits
  duplicados.
- Se um agregado exigir múltiplas chamadas e uma delas falhar, mostrar card de
  erro localizado com `Tentar novamente` em vez de preencher com zero falso.

## Screen Contracts

### ResponsibleHome

Purpose: dar visão geral da família e levar às ações urgentes.

Visual:

- Header: `Olá, responsável 👋` e subtítulo `Visão geral da sua família hoje.`
- Primeiro bloco: `MetricSummaryCard` em linha/grade responsiva com
  `Crianças`, `Aprovar`, `Ativas` e `Resgates`.
- Ações rápidas: `Nova missão`, `Nova recompensa`, `Nova criança`.
- Seção `Suas crianças` com `ChildSummaryCard`.
- Seção `Aguardando aprovação` com até 2 `ApprovalCard` e ação `Ver todas`.
- Seção `Resgates recentes` somente com dados reais de transações/resgates.

States:

| State | Required UI |
|-------|-------------|
| Loading | Skeleton estável para métricas, 2 crianças e 1 aprovação |
| Empty children | `Nenhuma criança cadastrada` + `Crie o primeiro perfil da família.` + CTA `Nova criança` |
| Empty approvals | `Tudo revisado por enquanto` + `As missões enviadas pelas crianças aparecem aqui.` |
| Partial error | Card localizado com `Não conseguimos carregar esta seção.` + `Tentar novamente` |
| Full error | `Não conseguimos carregar o painel.` + `Tentar novamente` |

Copy:

| Element | Copy |
|---------|------|
| Title | `Olá, responsável 👋` |
| Subtitle | `Visão geral da sua família hoje.` |
| Primary CTA | `Nova missão` |
| Secondary CTA | `Nova recompensa` |
| Child CTA | `Nova criança` |
| Children section | `Suas crianças` |
| Approvals section | `Aguardando aprovação` |
| View all | `Ver todas` |

### ResponsibleChildDetail

Purpose: mostrar uma criança específica com saldo, missões, aprovações e
histórico resumido.

Visual:

- Header com avatar/nome da criança e ação `Editar`.
- Card de saldo: `{balance} moedas`.
- Métricas: pendentes, aguardando aprovação, concluídas quando os dados reais
  estiverem disponíveis.
- Lista curta de missões recentes/pendentes e resgates recentes.
- Ações: `Atribuir missão`, `Editar criança`, `Desativar criança`.

States:

| State | Required UI |
|-------|-------------|
| Loading | Skeleton de header, saldo e listas |
| Not found | `Não encontramos essa criança.` + `Voltar para crianças` |
| No missions | `Nenhuma missão para esta criança` + `Atribua uma missão para começar.` |
| No transactions | `Sem movimentações ainda` + `As moedas ganhas e resgates aparecem aqui.` |

### ResponsibleChildren

Purpose: listar, criar, editar e desativar crianças da família.

Visual:

- Título `Crianças`.
- CTA `Nova criança`.
- Lista de `ChildSummaryCard` com avatar, nome, idade, saldo e status.
- Filtro simples: `Ativas`, `Inativas` se houver inativas.

Form child:

- Campos: `Nome`, `Idade`, `Avatar`, `PIN de acesso (opcional)`.
- Avatar por `EmojiPicker`; não usar foto.
- CTA criar: `Salvar criança`.
- CTA editar: `Salvar alterações`.

Destructive:

- `Desativar criança` exige confirmação:
  `Desativar {childName}? Ela não aparecerá para novas ações, mas o histórico será preservado.`

Required copy:

| Element | Copy |
|---------|------|
| Title | `Crianças` |
| New CTA | `Nova criança` |
| Form title create | `Nova criança` |
| Form title edit | `Editar criança` |
| Empty | `Nenhuma criança cadastrada` |
| Empty body | `Crie o primeiro perfil para começar a usar o Habitinhos.` |
| Error | `Não conseguimos salvar a criança. Revise as informações e tente novamente.` |

### ResponsibleMissions

Purpose: gerenciar missões, estados e atribuições.

Visual:

- Título `Missões`.
- Subtítulo `Acompanhe e organize as tarefas da família.`
- Filtros/chips: `Todas`, `Ativas`, `Com aprovação`, `Inativas`.
- `ManageListItem` por missão: emoji, título, criança atribuída quando
  aplicável, recorrência, moedas, status e `Editar`.
- CTA principal `Nova missão`; FAB `+` permitido somente se tiver
  `accessibilityLabel="Criar nova missão"` e não cobrir lista/tab.

Mission form:

- Título `Nova missão` ou `Editar missão`.
- Campos: `Título`, `Descrição (opcional)`, `Ícone da missão`,
  `Recompensa`, `Frequência`, `Quem deve fazer?`, `Exigir aprovação?`.
- `Recompensa` usa controle numérico com mínimo 1 e label `moedas`.
- Frequência: `Única`, `Diária`, `Semanal`, `Personalizada` somente se o
  backend `CUSTOM` for suportado no fluxo.
- Crianças são multi-seleção por avatar/nome; exigir ao menos uma criança ao
  atribuir.
- `Exigir aprovação?` usa switch/toggle com helper
  `A tarefa só é concluída após você validar.`
- CTA `Salvar missão`.

Assignment:

- Ao atribuir missão existente, título `Atribuir missão`.
- CTA `Atribuir missão`.
- Data de vencimento opcional: label `Data limite (opcional)`.

Destructive:

- `Desativar missão` exige confirmação:
  `Desativar {missionTitle}? Ela não será usada em novas atribuições.`

Required copy:

| Element | Copy |
|---------|------|
| List title | `Missões` |
| List subtitle | `Acompanhe e organize as tarefas da família.` |
| New CTA | `Nova missão` |
| Form title | `Nova missão` |
| Save CTA | `Salvar missão` |
| Assign CTA | `Atribuir missão` |
| Empty | `Nenhuma missão cadastrada` |
| Empty body | `Crie uma tarefa para organizar a rotina da família.` |
| Error | `Não conseguimos salvar a missão. Revise as informações e tente novamente.` |

### ResponsibleApprovals

Purpose: revisar conclusões enviadas pelas crianças e liberar ou negar moedas.

Visual:

- Título `Aprovações pendentes`.
- Subtítulo `Revise as tarefas concluídas hoje.`
- `ApprovalCard` com avatar da criança, título da missão, horário de
  conclusão quando disponível e badge `+{coins} moedas`.
- Botões lado a lado: `Rejeitar` destrutivo suave à esquerda e `Aprovar`
  primário à direita.

Interaction:

- `Aprovar` executa mutation direta, desabilita ambos botões e mostra loading
  no card.
- `Rejeitar` abre `ConfirmActionSheet` com campo `Motivo (opcional)`.
- Após sucesso, remover o card da fila com banner:
  `Missão aprovada. +{coins} moedas para {childName}.` ou
  `Missão rejeitada.`
- Erro mantém o card e mostra:
  `Não conseguimos revisar essa missão. Tente novamente.`

States:

| State | Required UI |
|-------|-------------|
| Loading | Skeleton de 2 cards de aprovação |
| Empty | `Nenhuma aprovação pendente` + `Quando uma criança concluir uma missão com revisão, ela aparece aqui.` |
| Error | `Não conseguimos carregar as aprovações.` + `Tentar novamente` |

### ResponsibleRewards

Purpose: criar, editar e desativar recompensas que as crianças podem resgatar.

Visual:

- Título `Recompensas`.
- Subtítulo `Gerencie o que os pequenos podem resgatar.`
- CTA `Nova recompensa`.
- Cards de resumo só podem aparecer com dados reais; se não houver endpoint
  confiável para `Resgatadas este mês` ou `Mais popular`, omitir em vez de
  mockar.
- Lista `Ativas` primeiro, depois `Inativas` se existirem.
- `ManageListItem`: emoji, título, custo, status `Ativa/Inativa`, ação
  `Editar` e toggle com label.
- Dica opcional permitida:
  `Ofereça recompensas simples e combinadas com a família.`

Reward form:

- Campos: `Título`, `Descrição (opcional)`, `Ícone da recompensa`, `Custo`.
- Custo mínimo 1 moeda.
- CTA criar: `Salvar recompensa`.
- CTA editar: `Salvar alterações`.

Destructive:

- `Desativar recompensa` exige confirmação:
  `Desativar {rewardTitle}? Ela não ficará disponível para novos resgates.`

Required copy:

| Element | Copy |
|---------|------|
| Title | `Recompensas` |
| Subtitle | `Gerencie o que os pequenos podem resgatar.` |
| New CTA | `Nova recompensa` |
| Form title create | `Nova recompensa` |
| Save CTA | `Salvar recompensa` |
| Empty | `Nenhuma recompensa cadastrada` |
| Empty body | `Crie uma recompensa para as crianças resgatarem com moedas.` |
| Error | `Não conseguimos salvar a recompensa. Revise as informações e tente novamente.` |

### ResponsibleProfile

Purpose: permitir troca de modo e encerramento de sessão.

Visual:

- Card da família com `EmojiAvatar`; não usar foto de perfil mesmo que a
  referência visual tenha foto.
- Seção `Trocar de perfil` com crianças ativas.
- CTA `Entrar no modo criança` ou `Trocar para criança`.
- Seção `Ajustes` com itens disponíveis; itens não implementados não devem
  parecer clicáveis.
- Ação destrutiva de sessão `Sair da conta`.

Copy:

| Element | Copy |
|---------|------|
| Title | `Perfil` |
| Switch section | `Trocar de perfil` |
| Child mode | `Entrar no modo criança` |
| Family hub | `Voltar para família` |
| Logout | `Sair da conta` |

## Copywriting Contract

Texto visível em PT-BR. Identificadores técnicos, rotas, componentes e testes
em inglês.

| Element | Copy |
|---------|------|
| Primary CTA | `Nova missão` no dashboard; `Salvar missão`, `Aprovar`, `Salvar criança` e `Salvar recompensa` nos fluxos específicos |
| Empty state heading | `Nada por aqui ainda` |
| Empty state body | `Quando a família criar novas informações, elas aparecem aqui.` |
| Error state | `Não conseguimos carregar agora. Tente novamente.` |
| Retry CTA | `Tentar novamente` |
| Network error state | `Não conseguimos conectar ao servidor. Verifique a conexão e tente novamente.` |
| Session expired state | `Sua sessão terminou. Entre novamente para continuar.` |
| Validation state | `Revise as informações destacadas.` |
| Save success | `Informações salvas.` |
| Approve success | `Missão aprovada. +{coins} moedas para {childName}.` |
| Reject success | `Missão rejeitada.` |
| Destructive confirmation | `Desativar criança`: `Desativar {childName}? Ela não aparecerá para novas ações, mas o histórico será preservado.` |
| Destructive confirmation | `Desativar missão`: `Desativar {missionTitle}? Ela não será usada em novas atribuições.` |
| Destructive confirmation | `Desativar recompensa`: `Desativar {rewardTitle}? Ela não ficará disponível para novos resgates.` |
| Destructive confirmation | `Rejeitar missão`: `Rejeitar essa conclusão? Você pode adicionar um motivo para a criança entender.` |

Regras:

- Não exibir `familyUnitId`, HTTP status, stack traces, exception names ou enum
  cru em inglês.
- Mensagens de validação do backend podem ser exibidas se já forem amigáveis
  em PT-BR; caso contrário mapear para este contrato.
- Evitar prometer moedas antes de `approve` retornar sucesso e wallet refresh
  confirmar atualização.
- Labels de botões devem conter verbo + objeto quando a ação muda dados.

## State Contract

| State | Required UI |
|-------|-------------|
| Default | Layout estável, ação principal clara, sem salto visual |
| Pressed | Feedback por opacidade/fill sem alterar dimensões |
| Disabled | Menor ênfase e motivo textual quando necessário |
| Loading | Indicador nativo ou skeleton arredondado mantendo dimensões |
| Empty | Emoji discreto, título curto, helper text e ação opcional |
| Error | Mensagem PT-BR amigável e `Tentar novamente` quando recuperável |
| Selected | Seleção por texto, shape, borda/fill e não só cor |
| Completed | Badge success; sem ação repetida |
| Awaiting approval | Badge warning; ações de aprovar/rejeitar |
| Success feedback | Banner ou painel estável; sem animação obrigatória |
| Destructive pending | Confirmação explícita antes de desativar ou rejeitar |

## Accessibility Contract

- Botões primários têm 56px de altura.
- Botões secundários, chips, toggles e campos tocáveis têm pelo menos 48px de
  altura.
- Todo pressable tem alvo mínimo `44x44`.
- Emoji sempre acompanhado de texto e `accessibilityLabel`.
- Status combina texto, badge/shape e cor.
- Conteúdo permanece rolável e legível em Android 360px-430px.
- Tabs expõem labels como `Abrir Início`, `Abrir Missões`,
  `Abrir Recompensas`, `Abrir Perfil`.
- Ações de aprovação expõem labels como
  `Aprovar missão Escovar os dentes de Joaquim` e
  `Rejeitar missão Escovar os dentes de Joaquim`.
- Inputs têm labels persistentes; placeholders não substituem labels.
- Erros de campo são lidos perto do campo correspondente.

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable - custom React Native components only - verified 2026-06-02 |

Nenhum shadcn, registry de terceiros, asset externo, Lottie, SVG complexo, foto
de perfil, fonte externa obrigatória ou HTML/CSS Stitch copiado é permitido na
Fase 6.

## Implementation Guardrails

- Implementar com `View`, `Text`, `Pressable`, `ScrollView`, `FlatList` e
  `SafeAreaView`.
- Compor de tokens e componentes existentes antes de criar novos padrões.
- Criar componentes de domínio do responsável pequenos e reutilizáveis.
- Não importar nem copiar `docs/design/stitch/*/code.html`.
- Não criar abstrações web/Tailwind/DOM no app mobile.
- Não usar mock/offline fallback para dados do dashboard ou listas.
- Não aceitar `familyUnitId` do cliente como autorização.
- Não tratar seleção de criança como autenticação.
- Manter saldos e histórico ligados a dados atualizados do backend.
- Se o backend não expuser um agregado visual da referência, omitir o card ou
  mostrar estado indisponível amigável; nunca preencher com números fictícios.

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
