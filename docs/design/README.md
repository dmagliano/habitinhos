# Habitinhos Design Documentation

This directory is the design entrypoint for the Habitinhos mobile phases.
Before planning or implementing any mobile UI from Phase 4 onward, read this
file and then follow `docs/design/mobile-design-contract.md`.

## Canonical Sources

Read these sources in this order:

1. `docs/design/mobile-design-contract.md` - practical implementation contract for mobile UI decisions.
2. `docs/design/phase-design-map.md` - which visual references apply to each roadmap phase.
3. `docs/design/stitch/DESIGN.md` - full Stitch-derived design system details.
4. `docs/design/stitch/prd_habitinhos_project_brief.md` - product/design intent and screen map.
5. `docs/design/folder.txt` - reference folder structure.
6. `docs/design/stitch/*/screen.png` - visual references for screens and layouts.

The `docs/design/stitch/*/code.html` files are reference exports only. Do not
copy their HTML, CSS, Tailwind classes, JavaScript, DOM structure, or web-only
implementation patterns into the React Native app.

## How To Use The References

- Use screenshots to understand hierarchy, spacing, tone, component shapes,
  navigation, and visual rhythm.
- Use `DESIGN.md` for tokens, component expectations, accessibility, microcopy,
  and implementation constraints.
- Use `phase-design-map.md` to decide which screenshots are relevant to the
  current phase.
- Implement with React Native + Expo + TypeScript components, not HTML/CSS.
- Keep all visible interface text in PT-BR and code identifiers in English.

## Phase Reading Guide

| Phase | Required design reading |
|---|---|
| Phase 4: Mobile base | `mobile-design-contract.md`, `phase-design-map.md`, `stitch/boas_vindas/screen.png` |
| Phase 5: Fluxo da criança | Phase 4 docs plus child references: `painel_do_joaquim`, `minhas_missoes`, `detalhes_da_missao`, `recompensas`, `perfil_e_troca_de_modo` |
| Phase 6: Fluxo do responsável | Phase 4 docs plus responsible references: `painel_do_responsavel`, `aprovacoes`, `gerenciar_missoes`, `gerenciar_recompensas`, `nova_missao_1`, `nova_missao_2` |
| Phase 7: Polimento para demonstração do TCC | All design docs and screenshots; verify consistency, demo polish, loading, empty, error, disabled, and accessibility states |

## Reference Screen Inventory

Every screen listed in `folder.txt` must remain represented in the design
contract or phase map:

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

