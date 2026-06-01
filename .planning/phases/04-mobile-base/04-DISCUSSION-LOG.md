# Phase 4: Mobile base - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01T12:00:44-03:00
**Phase:** 4-Mobile base
**Areas discussed:** Navegacao inicial, Ambiente e API

---

## Navegacao Inicial

### First authenticated screen

| Option | Description | Selected |
|--------|-------------|----------|
| Hub familiar | Tela simples pós-login com entrada para responsável e criança. | ✓ |
| Área do responsável direto | Login cai direto no shell do responsável. | |
| Seletor de perfil infantil direto | Login cai primeiro na escolha da criança. | |
| Other | Freeform alternative. | |

**User's choice:** Hub familiar.
**Notes:** Login bem-sucedido deve levar para um hub familiar simples.

### Authenticated navigation structure

| Option | Description | Selected |
|--------|-------------|----------|
| Shells separados por modo | Hub leva para áreas separadas de responsável e criança. | |
| Um shell compartilhado com modo ativo | Uma estrutura de tabs muda conteúdo conforme o modo. | |
| Só rotas stub na Phase 4 | Criar auth e rotas internas; bottom tabs reais ficam para fases 5 e 6. | ✓ |
| Other | Freeform alternative. | |

**User's choice:** Só rotas stub na Phase 4.
**Notes:** A fase deve ficar enxuta e não fingir que os fluxos futuros já existem.

### Stub route content

| Option | Description | Selected |
|--------|-------------|----------|
| Landing stub por modo | AppHeader, card informativo e CTA/estado em breve. | ✓ |
| Preview visual do futuro fluxo | Telas parecidas com painel infantil/responsável usando dados mockados. | |
| Tela mínima técnica | Só confirma que a rota existe. | |
| Other | Freeform alternative. | |

**User's choice:** Landing stub por modo.
**Notes:** Sem ações reais dos fluxos futuros.

### Mode switching

| Option | Description | Selected |
|--------|-------------|----------|
| Voltar sempre para o Hub | Landings têm ação Trocar modo que retorna ao hub. | ✓ |
| Perfil como troca de modo | Cria rota/aba Perfil para trocar de modo. | |
| Logout e novo login | Troca de modo só limpando a sessão. | |
| Other | Freeform alternative. | |

**User's choice:** Voltar sempre para o Hub.
**Notes:** Nada de aba Perfil nem logout forçado para alternar modo nesta fase.

### Hub labels

| Option | Description | Selected |
|--------|-------------|----------|
| Sou responsável / Sou criança | Linguagem clara e familiar. | ✓ |
| Área do responsável / Área da criança | Mais descritivo e formal. | |
| Gerenciar família / Ver minhas missões | Orientado à ação, mas antecipa capacidades futuras. | |
| Other | Freeform alternative. | |

**User's choice:** `Sou responsável` e `Sou criança`.
**Notes:** Labels visíveis devem ficar em PT-BR.

### Internal route names

| Option | Description | Selected |
|--------|-------------|----------|
| Auth, FamilyHub, ResponsibleStub, ChildStub | Nomes diretos e alinhados ao escopo stub. | ✓ |
| AuthStack, AppStack, GuardianStack, ChildStack | Mais arquitetural, mas sugere stacks completos. | |
| Deixar o planner decidir | Registrar só comportamento. | |
| Other | Freeform alternative. | |

**User's choice:** `Auth`, `FamilyHub`, `ResponsibleStub`, `ChildStub`.
**Notes:** Nomes técnicos em inglês.

### Logout visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, logout simples no header/menu | Permite testar sessão persistida e retorno ao login. | ✓ |
| Só no Hub familiar | Mantém landings mais limpas. | |
| Não nesta fase | Foca apenas em login e navegação interna. | |
| Other | Freeform alternative. | |

**User's choice:** Logout simples no header/menu.
**Notes:** Deve estar visível nas telas stub.

### Stub main content

| Option | Description | Selected |
|--------|-------------|----------|
| Mensagem de preparação + próximos passos | Card curto indicando área em preparação e próxima fase. | ✓ |
| Resumo mockado mínimo | Mostra cards fake sem ações reais. | |
| Tela quase vazia | Só título, em breve e Trocar modo. | |
| Other | Freeform alternative. | |

**User's choice:** Mensagem de preparação + próximos passos.
**Notes:** Sem dados mockados nem ações reais.

---

## Ambiente e API

### API base URL

| Option | Description | Selected |
|--------|-------------|----------|
| Variável Expo pública com fallback local | `EXPO_PUBLIC_API_BASE_URL` com fallback documentado. | ✓ |
| URL fixa no código | Mais rápido, mas frágil para emulador/dispositivo físico. | |
| Tela/configuração manual no app | Flexível, mas adiciona UI fora do core. | |
| Other | Freeform alternative. | |

**User's choice:** Variável Expo pública com fallback local.
**Notes:** Exemplo aceito: `EXPO_PUBLIC_API_BASE_URL`.

### API error handling

| Option | Description | Selected |
|--------|-------------|----------|
| Mensagem amigável + detalhe técnico discreto em dev | PT-BR para usuário; logs/console preservam `code` e detalhes. | ✓ |
| Mostrar mensagem do backend diretamente | Aproveita PT-BR do backend, mas pode ficar inconsistente. | |
| Erro genérico sempre | Seguro e simples, mas dificulta debug e UX. | |
| Other | Freeform alternative. | |

**User's choice:** Mensagem amigável + detalhe técnico discreto em dev.
**Notes:** Não expor detalhes técnicos para usuário final.

### Loading/error scope

| Option | Description | Selected |
|--------|-------------|----------|
| Auth/loading/error somente | Cobrir login, restauração de sessão e falha de rede. | ✓ |
| Estados genéricos completos | Criar loading/empty/error para listas e cards já agora. | |
| Só loading no botão de login | Mínimo, mas frágil para sessão persistida. | |
| Other | Freeform alternative. | |

**User's choice:** Auth/loading/error somente.
**Notes:** Estados de listas/cards ficam para fases 5/6.

### Backend unavailable

| Option | Description | Selected |
|--------|-------------|----------|
| Erro recuperável com Tentar novamente | Mensagem amigável e botão retry; sem modo offline fake. | ✓ |
| Modo mock fallback | App continua com dados falsos se backend cair. | |
| Falhar seco | Erro simples sem retry. | |
| Other | Freeform alternative. | |

**User's choice:** Erro recuperável com `Tentar novamente`.
**Notes:** Sem modo mock fallback.

---

## the agent's Discretion

- Entrada e sessão não foi discutida em profundidade além do que a navegação e Ambiente/API exigem. Planner pode escolher padrões Expo pragmáticos para armazenamento de token, restauração de sessão e bootstrap.
- Base visual da Phase 4 não foi discutida como área separada. Planner deve seguir `docs/design/mobile-design-contract.md` e `docs/design/phase-design-map.md`.

## Deferred Ideas

- Bottom tabs reais para criança ficam para Phase 5.
- Bottom tabs reais e dashboard/gestão do responsável ficam para Phase 6.
- Estados completos de listas/cards ficam para as fases que implementarem listas reais.
- Demo seeds e polimento final ficam para Phase 7.

