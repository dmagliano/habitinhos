---
phase: 03-recompensas-e-resgates
plan: 01
subsystem: rewards
tags: [flyway, jpa, rewards, redemption, api, integration-test]
requires:
  - phase: 02-dom-nio-de-miss-es-e-moedas
    provides: auth/current user, wallet, base entities, migration V2
provides:
  - V3 reward/redemption schema and FK bridge with coin transactions
  - Reward and RewardRedemption domain entities with family-scoped repositories
  - Reward CRUD API with soft deactivation and tenant isolation
affects: [03-02, 03-03, rewards-api]
tech-stack:
  added: []
  patterns: [family-scoped repositories, domain-method mutation, dto validation]
requirements-completed: [REWD-01, REWD-02, REWD-03, DOCS-01]
completed: 2026-05-30
---

# Phase 03 Plan 01 Summary

Implementação base de recompensas concluída com schema, modelo e API CRUD.

## Accomplishments

- Criada migration `V3__create_reward_schema.sql` com tabelas `rewards` e `reward_redemptions`, checks de custo/status, índices e FK retroativa em `coin_transactions.reward_redemption_id`.
- Atualizado cleanup de integração em `AbstractIntegrationTest` para truncar `reward_redemptions` e `rewards` na ordem correta de FKs.
- Implementadas entidades de domínio: `Reward`, `RewardRedemption`, `RewardRedemptionStatus`.
- Implementados contratos de persistência family-scoped: `RewardRepository` e `RewardRedemptionRepository`.
- Implementados endpoints de recompensas (`POST/GET/GET by id/PUT/PATCH deactivate`) via `RewardController` + `RewardService`.
- Criados DTOs de entrada/saída com validações de tamanho e custo positivo.
- Adicionado `RewardIntegrationTest` cobrindo CRUD, validação e isolamento por família.

## Verification

- `cd backend && ./mvnw -DskipTests compile` ✅
- `cd backend && ./mvnw test` ✅ (21 testes, 0 falhas)

## Notes

- `reward_redemptions.updated_at` foi mantido no schema para compatibilidade com `BaseEntity` (JPA `created_at/updated_at`).
