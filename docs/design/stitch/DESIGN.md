# Design System — Habitinhos

Documento refinado para orientar a implementação mobile do **Habitinhos** em **React Native + Expo + TypeScript**, com foco inicial em Android.

O objetivo é transformar o design exportado pelo Stitch em uma referência prática para desenvolvimento, mantendo a identidade visual leve, lúdica e familiar, mas sem depender de imagens externas, SVGs complexos, Lottie, fontes externas obrigatórias ou assets pesados.

---

## 1. Direção do produto

O Habitinhos é um app de tarefas e recompensas para famílias.

Ele deve ser entendido por dois públicos ao mesmo tempo:

- **Crianças**, que precisam de uma experiência visual motivadora, simples e divertida.
- **Responsáveis**, que precisam de clareza, organização e confiança para acompanhar tarefas, moedas e recompensas.

A interface deve parecer:

- acolhedora;
- alegre;
- organizada;
- segura;
- leve;
- fácil de usar com uma mão;
- amigável para crianças, mas sem parecer excessivamente infantilizada.

Evitar uma estética muito “brinquedo” ou “jogo infantil”. A proposta é uma interface familiar, com energia positiva, cards claros, emojis bem aplicados e recompensas visuais simples.

---

## 2. Stack e restrições técnicas

### Stack

- React Native
- Expo
- TypeScript
- Android-first
- Componentes próprios reutilizáveis
- Navegação mobile com bottom tabs

### Restrições obrigatórias

- Não usar imagens externas.
- Não usar fotos de perfil.
- Não usar SVG complexo.
- Não usar Lottie.
- Não usar ilustrações pesadas.
- Não criar dependências novas sem necessidade.
- Não usar HTML/CSS web diretamente.
- Não depender de fontes externas.
- Não usar animações pesadas.
- Usar emojis como ícones visuais sempre que resolver bem o problema.
- Usar componentes React Native reais: `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`, `SafeAreaView`.
- Centralizar estilos em tokens e componentes reutilizáveis.

### Diretriz de implementação

O design deve ser implementado com:

- tokens de cor, espaçamento, raio, sombra e tipografia;
- componentes reutilizáveis;
- props simples e previsíveis;
- estilos declarativos;
- suporte a estados: default, pressed, disabled, completed, selected, error.

---

## 3. Princípios visuais

### 3.1 Leve e lúdico

A ludicidade deve vir de:

- emojis;
- microcopy positivo;
- cards arredondados;
- cores suaves;
- badges de status;
- moedas e recompensas em destaque;
- feedback visual simples ao concluir tarefas.

Não usar elementos gráficos complexos para transmitir diversão. O app deve continuar funcional mesmo com poucos recursos visuais.

### 3.2 Familiar, não infantilizado

A criança deve achar o app divertido, mas o responsável também deve sentir que a interface é confiável.

Evitar:

- excesso de cores fortes;
- muitas ilustrações;
- telas com aparência de jogo arcade;
- textos longos;
- efeitos visuais exagerados.

Preferir:

- hierarquia clara;
- cards limpos;
- linguagem positiva;
- emojis pontuais;
- botões grandes;
- estados visuais fáceis de reconhecer.

### 3.3 Android-first

Considerar:

- toque com polegar;
- telas pequenas;
- densidade visual moderada;
- área segura inferior para bottom tab;
- botões com altura mínima confortável;
- listas roláveis;
- responsividade simples.

---

## 4. Tokens de design

Os valores abaixo devem ser usados como base única para a implementação.

### 4.1 Cores

```ts
export const colors = {
  background: '#F5FBF8',
  surface: '#FFFFFF',
  surfaceSoft: '#EFF5F3',
  surfaceMuted: '#E9EFED',

  primary: '#4FD1C5',
  primaryDark: '#006A63',
  primarySoft: '#D9FAF6',
  onPrimary: '#FFFFFF',

  secondary: '#C0E5FA',
  secondaryDark: '#3F6375',
  secondarySoft: '#EAF7FE',

  accent: '#F6AD55',
  accentSoft: '#FFF3DF',
  accentDark: '#8E4E11',

  success: '#38A169',
  successSoft: '#E6F7ED',

  warning: '#F6AD55',
  warningSoft: '#FFF3DF',

  error: '#BA1A1A',
  errorSoft: '#FFDAD6',

  textPrimary: '#171D1C',
  textSecondary: '#3C4947',
  textMuted: '#6C7A77',
  textInverse: '#FFFFFF',

  border: '#DEE4E2',
  borderStrong: '#BBC9C7',

  tabInactive: '#6C7A77',
  tabActive: '#006A63',
};
```

### 4.2 Uso das cores

| Token | Uso |
|---|---|
| `background` | Fundo geral das telas |
| `surface` | Cards principais |
| `surfaceSoft` | Áreas secundárias, containers internos |
| `primary` | Ação principal, progresso, seleção ativa |
| `secondary` | Apoio visual, filtros, estados neutros |
| `accent` | Moedas, recompensas, conquistas |
| `success` | Missões concluídas |
| `error` | Erros, validações e bloqueios |
| `textPrimary` | Títulos e textos principais |
| `textSecondary` | Descrições |
| `textMuted` | Metadados, labels auxiliares |

### 4.3 Tipografia

Usar **fonte padrão do sistema**.

Não carregar Plus Jakarta Sans, Inter ou qualquer fonte externa no MVP.

```ts
export const typography = {
  titleXL: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
  },
  titleLG: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  titleMD: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  bodyLG: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
  },
  bodyMD: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  labelMD: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700' as const,
  },
  labelSM: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
};
```

### 4.4 Espaçamento

Usar escala baseada em múltiplos de 4.

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  screenHorizontal: 20,
  cardPadding: 16,
  sectionGap: 24,
};
```

### 4.5 Raios

```ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
```

Uso recomendado:

- Cards: `16`
- Cards de destaque: `24`
- Botões: `16`
- Badges: `999`
- Avatar emoji: `999`
- Progress bar: `999`

### 4.6 Sombras

Usar sombras leves. No Android, priorizar `elevation`.

```ts
export const shadows = {
  card: {
    elevation: 2,
    shadowColor: '#2D3748',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  floating: {
    elevation: 4,
    shadowColor: '#2D3748',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
};
```

Não usar sombras fortes, escuras ou realistas demais.

---

## 5. Estrutura de tela

### 5.1 AppScreen

Componente base para todas as telas.

Responsabilidades:

- aplicar `SafeAreaView`;
- aplicar fundo `background`;
- controlar padding horizontal;
- garantir espaço inferior para bottom tab;
- permitir scroll quando necessário.

Props sugeridas:

```ts
type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  withHorizontalPadding?: boolean;
};
```

Diretrizes:

- usar `ScrollView` em dashboards, listas e detalhes;
- evitar conteúdo encostado nas bordas;
- manter margem horizontal padrão de `20`.

---

### 5.2 AppHeader

Cabeçalho de tela.

Deve suportar:

- saudação;
- título;
- subtítulo opcional;
- avatar emoji;
- badge de moedas;
- ação simples à direita, se necessário.

Exemplo de conteúdo:

- `Olá, Joaquim 👋`
- `Suas missões de hoje`
- `🦊` como avatar
- `🪙 120` como CoinBadge

Evitar headers muito altos ou com ilustrações grandes.

---

### 5.3 BottomTabBar

Navegação principal do app.

Abas sugeridas para o MVP:

| Aba | Emoji | Função |
|---|---:|---|
| Início | 🏠 | Visão geral |
| Missões | ✅ | Lista de tarefas |
| Recompensas | 🎁 | Catálogo de recompensas |
| Perfil | 🙂 | Criança/responsável |

Diretrizes:

- usar emojis como ícones;
- label curta;
- estado ativo com `primaryDark`;
- estado inativo com `textMuted`;
- altura confortável;
- respeitar área segura inferior;
- não usar ícones externos no MVP.

---

## 6. Componentes obrigatórios

### 6.1 Card

Componente base de agrupamento.

Uso:

- seções de dashboard;
- resumo de moedas;
- missão;
- recompensa;
- conteúdo informativo.

Estilo:

- fundo `surface`;
- raio `lg`;
- padding `md`;
- borda `border`;
- sombra leve opcional.

Props sugeridas:

```ts
type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'soft' | 'highlight';
  pressable?: boolean;
  onPress?: () => void;
};
```

---

### 6.2 MissionCard

Card para missão/tarefa atribuída.

Deve exibir:

- emoji da missão;
- título;
- descrição curta opcional;
- valor em moedas;
- status;
- progresso opcional;
- ação principal.

Estados:

| Estado | Aparência |
|---|---|
| Pendente | Card branco, badge neutro |
| Em andamento | Badge secundário, progresso visível |
| Concluída | Borda `success`, badge verde, moeda em destaque |
| Bloqueada | Opacidade reduzida, ação desabilitada |

Campos visuais sugeridos:

```ts
type MissionCardProps = {
  emoji: string;
  title: string;
  description?: string;
  coins: number;
  status: 'pending' | 'in_progress' | 'completed' | 'locked';
  progress?: number;
  onPress?: () => void;
};
```

Microcopy sugerida:

- `Fazer missão`
- `Marcar como feita`
- `Aguardando aprovação`
- `Concluída!`
- `+10 moedas`

---

### 6.3 RewardCard

Card para recompensa.

Deve exibir:

- emoji da recompensa;
- nome;
- custo em moedas;
- disponibilidade;
- botão de resgate.

Estados:

| Estado | Aparência |
|---|---|
| Disponível | Botão primário ativo |
| Sem saldo | Botão desabilitado, texto auxiliar |
| Resgatada | Badge de sucesso |
| Indisponível | Opacidade reduzida |

Props sugeridas:

```ts
type RewardCardProps = {
  emoji: string;
  title: string;
  cost: number;
  available?: boolean;
  redeemed?: boolean;
  onRedeem?: () => void;
};
```

---

### 6.4 CoinBadge

Badge para saldo ou recompensa de moedas.

Variações:

- saldo total;
- recompensa de missão;
- custo de recompensa.

Estilo:

- fundo `accentSoft`;
- texto `accentDark`;
- raio `full`;
- emoji `🪙`;
- padding horizontal confortável.

Props sugeridas:

```ts
type CoinBadgeProps = {
  amount: number;
  label?: string;
  variant?: 'balance' | 'reward' | 'cost';
};
```

Exemplos:

- `🪙 120`
- `+10 moedas`
- `Custa 80`

---

### 6.5 EmojiAvatar

Avatar sem imagem de perfil.

Deve usar:

- emoji;
- fundo circular;
- tamanho consistente;
- borda opcional.

Tamanhos:

| Tamanho | Valor |
|---|---:|
| sm | 32 |
| md | 48 |
| lg | 64 |
| xl | 88 |

Props sugeridas:

```ts
type EmojiAvatarProps = {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
};
```

Sugestões de emojis para perfis infantis:

- 🦊
- 🐼
- 🐸
- 🐵
- 🦁
- 🐰
- 🐱
- 🐶
- 🚀
- ⭐

---

### 6.6 ProgressBar

Barra de progresso simples.

Uso:

- progresso diário;
- missões concluídas;
- evolução para uma recompensa;
- metas semanais.

Estilo:

- altura entre `10` e `12`;
- formato pill;
- track `surfaceMuted`;
- fill `primary`;
- fill `accent` para recompensas.

Props sugeridas:

```ts
type ProgressBarProps = {
  value: number; // 0 a 100
  variant?: 'default' | 'reward' | 'success';
};
```

---

### 6.7 PrimaryButton

Botão principal.

Uso:

- ação principal da tela;
- confirmar missão;
- resgatar recompensa;
- avançar fluxo.

Estilo:

- altura mínima `56`;
- raio `lg`;
- fundo `primary`;
- texto branco;
- label curto;
- estado pressed com leve redução de opacidade ou escala.

Props sugeridas:

```ts
type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  emoji?: string;
};
```

Exemplos:

- `✅ Concluir missão`
- `🎁 Resgatar`
- `Continuar`

---

### 6.8 SecondaryButton

Botão secundário.

Uso:

- ações auxiliares;
- cancelar;
- ver detalhes;
- editar;
- adicionar observação.

Estilo:

- altura mínima `48`;
- raio `lg`;
- fundo `secondarySoft`;
- texto `secondaryDark`.

---

### 6.9 StatusBadge

Badge para indicar estado.

Estados sugeridos:

```ts
type StatusBadgeVariant =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'waiting_approval'
  | 'locked'
  | 'error';
```

Labels recomendadas:

| Estado | Label |
|---|---|
| `pending` | Pendente |
| `in_progress` | Em andamento |
| `completed` | Concluída |
| `waiting_approval` | Aguardando aprovação |
| `locked` | Bloqueada |
| `error` | Atenção |

---

## 7. Telas principais do MVP

### 7.1 Início da criança

Objetivo: mostrar o que a criança pode fazer agora.

Elementos:

- AppHeader com saudação;
- CoinBadge com saldo atual;
- card de progresso do dia;
- lista curta de missões de hoje;
- destaque para próxima recompensa possível;
- BottomTabBar.

Hierarquia sugerida:

1. Saudação.
2. Saldo de moedas.
3. Progresso de hoje.
4. Missões pendentes.
5. Recompensa em destaque.

Microcopy:

- `Olá, Joaquim 👋`
- `Você tem 120 moedas`
- `3 de 5 missões concluídas hoje`
- `Falta pouco para resgatar: Cinema em família 🎬`

---

### 7.2 Lista de missões

Objetivo: permitir visualizar e concluir tarefas.

Elementos:

- título `Missões`;
- filtros simples por status;
- MissionCard em lista;
- estado vazio amigável.

Filtros sugeridos:

- `Hoje`
- `Pendentes`
- `Concluídas`

Estado vazio:

- emoji `🌈`
- texto: `Nenhuma missão por aqui agora. Aproveite o descanso!`

---

### 7.3 Recompensas

Objetivo: mostrar recompensas disponíveis para resgate.

Elementos:

- saldo de moedas em destaque;
- lista/grid simples de RewardCard;
- indicação clara de custo;
- botão de resgate;
- estado de saldo insuficiente.

Microcopy:

- `Você pode resgatar`
- `Faltam 20 moedas`
- `Resgatar recompensa`
- `Peça para um responsável aprovar`

---

### 7.4 Perfil da criança

Objetivo: mostrar identidade simples sem foto.

Elementos:

- EmojiAvatar grande;
- nome;
- saldo;
- estatísticas simples;
- conquistas futuras, se houver.

Dados possíveis:

- missões concluídas;
- moedas ganhas;
- recompensas resgatadas;
- sequência semanal.

---

### 7.5 Painel do responsável

Objetivo: permitir acompanhamento e aprovação sem parecer uma tela infantil.

Elementos:

- visão por criança;
- missões aguardando aprovação;
- recompensas solicitadas;
- ações rápidas;
- criação de missão/recompensa no futuro.

Tom visual:

- mesmo design system;
- menos emojis em excesso;
- mais foco em clareza e controle.

---

## 8. Linguagem e microcopy

### 8.1 Tom de voz

O tom deve ser:

- positivo;
- direto;
- acolhedor;
- simples;
- sem jargões técnicos.

Evitar:

- `Erro de validação`
- `Saldo insuficiente para operação`
- `Entidade não encontrada`
- `Aguardando processamento`

Preferir:

- `Revise as informações`
- `Faltam moedas para essa recompensa`
- `Não encontramos essa missão`
- `Aguardando aprovação`

### 8.2 Textos curtos

Preferir frases de uma linha sempre que possível.

Exemplos:

- `Boa missão!`
- `Você conseguiu!`
- `Falta pouco!`
- `Peça aprovação`
- `Hoje está quase completo`

### 8.3 Feedback de conclusão

Ao concluir uma missão:

- mostrar estado visual imediatamente;
- destacar moedas ganhas;
- evitar animação pesada;
- usar mudança de cor, badge e texto.

Exemplo:

- `Missão concluída! +10 moedas 🪙`

---

## 9. Acessibilidade

Regras mínimas:

- botões com altura mínima de `48`, preferencialmente `56`;
- áreas tocáveis com pelo menos `44x44`;
- contraste adequado entre texto e fundo;
- textos principais com mínimo de `16`;
- não depender apenas de cor para indicar estado;
- combinar texto + emoji + badge quando necessário;
- labels claros para leitores de tela quando possível.

Exemplo:

```tsx
<Pressable accessibilityLabel="Concluir missão Arrumar a cama">
  ...
</Pressable>
```

---

## 10. Estados de UI

### 10.1 Loading

Usar:

- skeleton simples com blocos arredondados;
- ou indicador nativo do React Native.

Não usar animações complexas.

### 10.2 Empty state

Usar:

- emoji grande;
- título curto;
- texto auxiliar;
- ação opcional.

Exemplo:

```txt
🌱
Nenhuma missão hoje
Quando houver uma nova missão, ela aparece aqui.
```

### 10.3 Error state

Usar:

- linguagem amigável;
- botão para tentar novamente;
- sem mensagem técnica crua.

Exemplo:

```txt
Não conseguimos carregar agora.
Tente novamente em alguns instantes.
```

### 10.4 Disabled

Usar:

- opacidade reduzida;
- texto explicativo quando necessário;
- não esconder ações importantes.

---

## 11. Emojis como sistema visual

Os emojis devem funcionar como ícones leves.

### Categorias sugeridas

| Categoria | Emojis |
|---|---|
| Casa | 🛏️ 🧹 🧺 🍽️ |
| Escola | 📚 ✏️ 🎒 |
| Saúde | 🪥 🛁 🧼 💤 |
| Família | 🤝 💛 👨‍👩‍👧‍👦 |
| Recompensa | 🎁 ⭐ 🏆 🎬 |
| Moedas | 🪙 ✨ |

### Regras

- usar no máximo 1 emoji principal por card;
- evitar muitos emojis na mesma frase;
- usar emoji sempre acompanhado de texto;
- não usar emoji como única informação crítica;
- manter tamanho consistente.

---

## 12. Do / Don't

### Fazer

- Usar cards arredondados.
- Usar emojis como ícones.
- Usar cores suaves.
- Usar textos curtos.
- Usar componentes reutilizáveis.
- Usar tokens centralizados.
- Priorizar Android.
- Criar estados claros para missão, recompensa e saldo.

### Evitar

- Fotos de perfil.
- Imagens externas.
- SVGs complexos.
- Lottie.
- Fontes externas obrigatórias.
- Layout com aparência web.
- CSS copiado do Stitch.
- Telas visualmente carregadas.
- Emojis em excesso.
- Animações pesadas.

---

## 13. Estrutura sugerida de pastas

```txt
src/
  components/
    AppHeader/
    AppScreen/
    BottomTabBar/
    Card/
    CoinBadge/
    EmojiAvatar/
    MissionCard/
    PrimaryButton/
    ProgressBar/
    RewardCard/
    SecondaryButton/
    StatusBadge/
  design/
    colors.ts
    radius.ts
    shadows.ts
    spacing.ts
    typography.ts
    index.ts
  screens/
    child/
      HomeScreen.tsx
      MissionsScreen.tsx
      RewardsScreen.tsx
      ProfileScreen.tsx
    guardian/
      GuardianHomeScreen.tsx
  navigation/
    BottomTabs.tsx
  domain/
    mission.ts
    reward.ts
    user.ts
```

---

## 14. Critérios de aceite para implementação visual

Uma tela implementada está alinhada ao design system se:

- usa `AppScreen` como base;
- usa tokens centralizados;
- não possui imagens externas;
- não possui SVG complexo;
- não depende de fonte externa;
- usa emojis como ícones quando adequado;
- tem botões com tamanho confortável;
- tem cards com raio consistente;
- tem espaçamento múltiplo de 4;
- tem contraste legível;
- possui estados de loading, vazio e erro quando aplicável;
- funciona bem em Android;
- não usa HTML/CSS web diretamente.

---

## 15. Orientação final para Codex/GSD

Ao implementar as telas do Habitinhos:

1. Criar primeiro os tokens em `src/design`.
2. Criar os componentes base obrigatórios.
3. Montar as telas usando apenas esses componentes.
4. Evitar dependências visuais externas.
5. Usar dados mockados no início.
6. Manter os componentes pequenos e reutilizáveis.
7. Garantir que a interface funcione bem em Android antes de refinar detalhes.
8. Priorizar clareza, toque confortável e microcopy amigável.

A interface deve parecer um produto real de família: simples para a criança, confiável para o responsável e leve o suficiente para evoluir sem acúmulo de assets ou dependências.
