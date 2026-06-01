# Phase Design Map

This map tells downstream GSD phases which design references to use. It keeps
the Stitch material visible to planners and executors without allowing exported
HTML/CSS to become implementation code.

## Global Rule For All Mobile Phases

Every mobile plan from Phase 4 onward must read:

- `docs/design/README.md`
- `docs/design/mobile-design-contract.md`
- `docs/design/stitch/DESIGN.md`
- `docs/design/stitch/prd_habitinhos_project_brief.md`

Screenshots in `docs/design/stitch/*/screen.png` are visual references.
`docs/design/stitch/*/code.html` files are not implementation sources.

## Phase 4: Mobile Base

Goal: establish the Expo foundation, navigation, API/auth shape, login flow,
and base visual structure.

Design responsibilities:

- create design tokens and base components before screen-specific UI;
- establish `AppScreen`, `AppHeader`, `Card`, button, badge, avatar, and tab
  patterns;
- implement welcome/login/access screens with the same calm, friendly product
  tone;
- create navigation areas for auth, responsible, and child flows without
  prematurely building full Phase 5 or Phase 6 screens;
- keep the visual baseline PT-BR, Android-first, and free of external assets.

Primary references:

- `docs/design/stitch/boas_vindas/screen.png`
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png`

Phase 4 should not implement the complete child mission/reward loop or the
complete responsible management flow.

## Phase 5: Fluxo Da Criança

Goal: child can demonstrate the core mission and reward loop on mobile using
the real API.

Design responsibilities:

- make the child home motivating and simple;
- highlight current coin balance and daily mission progress;
- use mission cards with status, coin value, and clear completion action;
- provide success, waiting approval, insufficient balance, empty, loading, and
  error states with friendly PT-BR microcopy;
- make reward redemption clear, especially when balance is insufficient.

Primary references:

- `docs/design/stitch/painel_do_joaquim/screen.png`
- `docs/design/stitch/minhas_missoes/screen.png`
- `docs/design/stitch/detalhes_da_missao/screen.png`
- `docs/design/stitch/recompensas/screen.png`
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png`

## Phase 6: Fluxo Do Responsável

Goal: responsible adult can manage family data and observe progress from the
mobile app.

Design responsibilities:

- keep the responsible experience calm, organized, and trustworthy;
- show children, balances, mission states, approvals, and recent redemptions
  with scannable cards and sections;
- make mission/reward creation forms touch-friendly and readable on Android;
- preserve the same design system while using fewer decorative emojis than the
  child flow;
- make approve/reject actions clear and difficult to confuse.

Primary references:

- `docs/design/stitch/painel_do_responsavel/screen.png`
- `docs/design/stitch/aprovacoes/screen.png`
- `docs/design/stitch/gerenciar_missoes/screen.png`
- `docs/design/stitch/gerenciar_recompensas/screen.png`
- `docs/design/stitch/nova_missao_1/screen.png`
- `docs/design/stitch/nova_missao_2/screen.png`
- `docs/design/stitch/perfil_e_troca_de_modo/screen.png`

## Phase 7: Polimento Para Demonstração Do TCC

Goal: make the MVP demo-ready with repeatable data, documentation, visual
polish, and final verification.

Design responsibilities:

- verify every mobile screen against `mobile-design-contract.md`;
- check visual consistency across child and responsible flows;
- polish loading, empty, error, disabled, success, and insufficient-balance
  states;
- confirm demo data produces screens that look complete and representative;
- ensure README/demo script points reviewers to the intended mobile journey.

Primary references:

- all screenshots under `docs/design/stitch/*/screen.png`;
- `docs/design/stitch/DESIGN.md` section "Critérios de aceite para implementação visual";
- `docs/design/stitch/prd_habitinhos_project_brief.md` section "Mapa de Telas".

## Complete Reference Inventory

The design folder currently includes these screen reference folders:

- `aprovacoes`
- `boas_vindas`
- `detalhes_da_missao`
- `gerenciar_missoes`
- `gerenciar_recompensas`
- `minhas_missoes`
- `nova_missao_1`
- `nova_missao_2`
- `painel_do_joaquim`
- `painel_do_responsavel`
- `perfil_e_troca_de_modo`
- `recompensas`

