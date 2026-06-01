# PRD: Habitinhos - Transforme tarefas em pequenas conquistas

## 1. Visão Geral do Projeto
O **Habitinhos** é um aplicativo mobile desenvolvido para ajudar famílias a gerenciar rotinas domésticas de forma lúdica e organizada. Utilizando conceitos leves de gamificação (moedas e recompensas), o app motiva crianças a realizarem tarefas diárias enquanto oferece aos pais uma ferramenta robusta de gestão e acompanhamento.

---

## 2. Objetivos Estratégicos
- **Engajamento Infantil**: Motivar crianças através de um sistema de recompensas tangíveis e feedback positivo.
- **Gestão Parental**: Oferecer um painel de controle calmo e eficiente para supervisão de tarefas.
- **Educação Financeira Básica**: Introduzir conceitos de ganho, acúmulo e troca (redemption) de moedas virtuais.
- **Implementação Facilitada**: Design otimizado para React Native + Expo, utilizando apenas elementos nativos e emojis (zero assets externos).

---

## 3. Personas e Modos de Uso
### A. Modo Infantil (Joaquim/Maria)
- **Perfil**: Crianças de 5 a 12 anos.
- **Necessidades**: Instruções claras, visualização de progresso e gratificação.
- **Tom de Voz**: Playful, motivador e simples.

### B. Modo Responsável (Pais/Guardiões)
- **Perfil**: Pais que buscam organizar a rotina familiar.
- **Necessidades**: Rapidez na aprovação, facilidade na criação de missões e visão geral da família.
- **Tom de Voz**: Calmo, organizado e confiável.

---

## 4. Requisitos Funcionais (Principais Fluxos)
1. **Onboarding**: Apresentação da proposta de valor e acesso à conta.
2. **Dashboard Infantil**: Visualização do "Tesouro" (saldo) e progresso diário de missões.
3. **Lista de Missões**: Visualização de tarefas pendentes, aguardando aprovação e concluídas.
4. **Detalhes da Missão**: Informações sobre recorrência, valor e botão de conclusão.
5. **Catálogo de Recompensas**: Visualização e resgate de prêmios definidos pela família.
6. **Dashboard Parental**: Resumo da família (total de crianças, missões ativas e pendências).
7. **Gestão de Missões**: CRUD de tarefas com atribuição de valores e recorrência.
8. **Aprovações**: Fluxo de revisão de tarefas enviadas pelas crianças antes da liberação das moedas.
9. **Troca de Perfil**: Alternância segura entre os modos infantil e parental.

---

## 5. Especificações de Design (Design System)
O sistema visual foi construído sob o **Habitinhos Family Design System**, focado em performance e facilidade de desenvolvimento.

- **Paleta de Cores**:
  - **Primária**: Menta Soft (`#4fd1c5`) - traz calma e modernidade.
  - **Destaque**: Ouro/Moedas (`#f6ad55`) - associado a conquista e valor.
  - **Superfícies**: Off-white e tons pastéis para manter a interface leve.
- **Tipografia**: *Plus Jakarta Sans* (ou fontes de sistema sans-serif).
- **Componentes**: Cards arredondados (24px/32px), sombras suaves, botões grandes (touch targets > 48dp) e barras de progresso lineares.
- **Iconografia**: Uso exclusivo de **Emojis** para representar categorias, recompensas e avatares, eliminando a carga de ativos gráficos pesados.

---

## 6. Restrições de Implementação (React Native + Expo)
- **UI Code-Only**: Não utilizar arquivos de imagem (PNG/JPG), SVGs externos ou animações complexas (Lottie).
- **Layout**: Flexbox nativo, garantindo responsividade em larguras de 360px a 430px (Android-first).
- **Navegação**: Bottom Tab Navigation (4 destinos principais) e Stack Navigation para detalhes e formulários.
- **Dados**: Estrutura de dados preparada para persistência local ou via API simples (JSON).

---

## 7. Mapa de Telas
1. **Boas-vindas**: `SCREEN_20`
2. **Dashboard Infantil**: `SCREEN_9`, `SCREEN_11`
3. **Minhas Missões (Lista)**: `SCREEN_4`, `SCREEN_17`
4. **Detalhes da Missão**: `SCREEN_14`
5. **Recompensas (Catálogo)**: `SCREEN_12`, `SCREEN_25`
6. **Dashboard Parental**: `SCREEN_7`, `SCREEN_13`, `SCREEN_24`
7. **Gerenciar Missões**: `SCREEN_19`, `SCREEN_22`
8. **Nova Missão (Form)**: `SCREEN_10`, `SCREEN_16`
9. **Gerenciar Recompensas**: `SCREEN_2`, `SCREEN_8`
10. **Aprovações**: `SCREEN_23`, `SCREEN_28`
11. **Perfil e Ajustes**: `SCREEN_6`, `SCREEN_27`
