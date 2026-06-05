---
quick_id: 260604-wme
slug: adicionar-pin-de-respons-vel-para-acessa
mode: quick
status: planned
created_at: 2026-06-05T02:29:16.246Z
---

# Quick Plan: PIN Do Responsável

## Objetivo

Exigir um PIN de 4 dígitos no cadastro do responsável e bloquear a entrada na área de gestão da família até o PIN ser informado corretamente.

## Escopo

- Backend:
  - Adicionar `responsiblePin` ao cadastro.
  - Persistir hash do PIN no usuário responsável.
  - Criar endpoint autenticado para verificar o PIN do responsável atual.
  - Validar formato de 4 dígitos.
- Mobile:
  - Adicionar campo de PIN de 4 dígitos na tela de criação de conta.
  - Criar chamada de verificação de PIN.
  - Pedir PIN antes de navegar por `Gerenciar família` a partir do seletor de crianças e do perfil infantil.

## Tarefas

1. Backend RED/GREEN
   - Atualizar testes de auth para exigir PIN no cadastro e validar endpoint de verificação.
   - Adicionar coluna `responsible_pin_hash`, DTO e serviço de verificação.

2. Mobile RED/GREEN
   - Atualizar testes de registro e navegação infantil para PIN obrigatório e gate antes de `ResponsibleTabs`.
   - Implementar campo de cadastro, serviço de verificação e prompt inline de PIN.

3. Verificação
   - Rodar testes focados backend/mobile.
   - Rodar `npm run typecheck`, `npm run lint` e testes mobile relevantes.

## Fora Do Escopo

- Recuperação/troca de PIN.
- PIN por criança.
- Biometria ou armazenamento local do PIN.
