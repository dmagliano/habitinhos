# Mobile Design Contract

This contract turns the Stitch reference material into implementation rules for
the Habitinhos React Native + Expo mobile app. It applies to every mobile phase
from Phase 4 onward.

## Product Feel

Habitinhos should feel familiar, light, playful, organized, and trustworthy.
The child experience may be more cheerful and motivating; the responsible adult
experience should stay calmer and clearer. The app should never look like a
heavy game, a toy-only interface, or a dense admin panel.

Use the complete source details in:

- `docs/design/stitch/DESIGN.md`
- `docs/design/stitch/prd_habitinhos_project_brief.md`

## Required Implementation Rules

- Build with React Native + Expo + TypeScript and React Navigation.
- Target Android-first layouts, especially widths around 360px to 430px.
- Use React Native primitives such as `View`, `Text`, `Pressable`,
  `ScrollView`, `FlatList`, and `SafeAreaView`.
- Use system fonts only for the MVP.
- Use emojis as lightweight visual icons when they solve the problem well.
- Keep visible UI text in PT-BR and technical names in code in English.
- Centralize color, spacing, radius, shadow, and typography tokens before
  building screens.
- Support default, pressed, disabled, selected, completed, loading, empty, and
  error states where applicable.

## Prohibited Implementation Rules

- Do not use external images, profile photos, heavy illustrations, Lottie, or
  complex SVGs.
- Do not add visual dependencies unless a plan documents a concrete need.
- Do not copy HTML, CSS, Tailwind classes, JavaScript, DOM structure, or web
  interaction code from `docs/design/stitch/*/code.html`.
- Do not depend on external fonts.
- Do not use animation as a required part of task completion or reward feedback.
- Do not use color as the only signal for important status.

## Token Baseline

The exact baseline values live in `docs/design/stitch/DESIGN.md`.
Implementation should create mobile tokens that preserve these roles:

- Colors: background, surface, soft/muted surfaces, primary mint, primary dark,
  secondary blue, coin/reward accent, success, warning, error, text, borders,
  active and inactive tab colors.
- Typography: system font with title, body, and label scales; main readable body
  text should not drop below 16px.
- Spacing: multiples of 4, with standard screen horizontal padding around 20.
- Radius: small controls around 8-12, cards around 16, highlight cards around
  24, pills and avatars fully rounded.
- Shadows: light card/floating shadows only; Android should rely primarily on
  modest elevation.

## Required Base Components

Phase 4 should establish these as reusable building blocks. Later phases should
compose screens from them instead of creating one-off visual patterns.

| Component | Purpose |
|---|---|
| `AppScreen` | Safe area, background, horizontal padding, bottom-tab spacing, optional scroll behavior |
| `AppHeader` | Screen title, greeting, subtitle, emoji avatar, coin badge, optional simple action |
| `BottomTabBar` | Main mobile navigation with emoji-style icons/labels and clear active state |
| `Card` | Base surface for dashboards, summaries, missions, rewards, and grouped content |
| `MissionCard` | Mission title, emoji, description, coins, status, progress, and main action |
| `RewardCard` | Reward emoji, title, coin cost, availability, redemption state, and redeem action |
| `CoinBadge` | Balance, mission reward, or reward cost display |
| `EmojiAvatar` | Profile identity without photos or external images |
| `ProgressBar` | Daily progress, reward progress, or completion progress |
| `PrimaryButton` | Main action with comfortable touch target |
| `SecondaryButton` | Supporting actions such as cancel, details, edit, or notes |
| `StatusBadge` | Pending, in progress, completed, waiting approval, locked, and error states |

## Navigation Pattern

Use bottom tabs for core mobile destinations:

- Início
- Missões
- Recompensas
- Perfil

Stacks should handle detail, form, login, and modal-like flows. Phase 4 creates
the navigation areas; Phase 5 fills the child flow; Phase 6 fills the
responsible flow.

## Screen And State Rules

- Dashboards and detail screens should use cards with clear hierarchy, not dense
  tables.
- Lists should be scrollable and use cards or rows with comfortable touch
  targets.
- Loading states should use simple native indicators or rounded skeleton blocks.
- Empty states should include an emoji, short title, helper text, and optional
  action.
- Error states should use friendly PT-BR copy and a retry path when appropriate.
- Disabled states should lower emphasis and explain why the action is blocked
  when the reason matters.
- Completion feedback should update visual state immediately and show coin
  impact clearly, without heavy animation.

## Microcopy Rules

Use short, positive, human PT-BR copy. Prefer:

- "Revise as informações"
- "Faltam moedas para essa recompensa"
- "Não encontramos essa missão"
- "Aguardando aprovação"
- "Missão concluída! +10 moedas"

Avoid raw technical messages such as "Erro de validação", "Entidade não
encontrada", or backend exception details.

## Accessibility Baseline

- Buttons should be at least 48px high, with 56px preferred for primary actions.
- Touch targets should be at least 44x44.
- Main body text should be readable on small Android screens.
- Important status must combine text, badge, emoji, or shape; never color alone.
- Pressable controls should have clear labels for assistive technology.
- Content must remain usable with one hand and within safe areas.

## Acceptance Criteria

A mobile screen is aligned with this contract when:

- it uses centralized tokens rather than ad hoc visual values;
- it uses the reusable base components where applicable;
- it has PT-BR visible text and English code identifiers;
- it does not use external images, copied HTML/CSS, complex SVGs, Lottie, or
  required external fonts;
- it has clear loading, empty, error, disabled, and success states as needed;
- it keeps touch targets comfortable on Android;
- it follows the relevant screenshot references listed in
  `docs/design/phase-design-map.md` without copying their web code.

