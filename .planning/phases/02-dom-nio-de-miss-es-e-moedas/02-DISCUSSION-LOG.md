# Phase 2: Domínio de missões e moedas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-29
**Phase:** 2-Domínio de missões e moedas
**Areas discussed:** Modelo missão/atribuição

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Modelo missão/atribuição | Missão como template reutilizável, snapshots por criança, prazo, recorrência. | ✓ |
| Conclusão/aprovação | Auto-crédito, aprovação obrigatória, rejeição, repetição/idempotência. | |
| Acesso da criança | Como listar/concluir missões enquanto crianças ainda são `ChildProfile`, não `User`. | |
| Carteira/ledger | Formato de `CoinTransaction`, travamento de saldo e histórico auditável. | |

**User's choice:** 1
**Notes:** The user chose to discuss only the mission/assignment model.

---

## Modelo missão/atribuição

### Assignment Snapshot

| Option | Description | Selected |
|--------|-------------|----------|
| Snapshot parcial | `AssignedMission` guarda `coinValue`, title/description or enough data at assignment time. Preserves history if the mission is edited later. | ✓ |
| Referência dinâmica | `AssignedMission` always uses current `Mission` data. Simpler, but edits can rewrite historical meaning. | |
| Snapshot só do valor em moedas | Store only assignment coin value; title/description stay dynamic. | |

**User's choice:** 1
**Notes:** Lock partial assignment snapshots for historical correctness.

### Recurrence Automation

| Option | Description | Selected |
|--------|-------------|----------|
| Sem recorrência automática agora | Keep assignments explicit in Phase 2; no backend generation of repeated assignments. | ✓ |
| Recorrência manual por tipo | `DAILY/WEEKLY` appears as organizational metadata only. | |
| Gerar atribuições recorrentes já na Fase 2 | Backend creates new assignments according to recurrence. More scope and risk. | |

**User's choice:** 1
**Notes:** Phase 2 should not implement automatic recurrence generation.

### Duplicate Assignments

| Option | Description | Selected |
|--------|-------------|----------|
| Bloquear duplicata ativa | Same mission cannot have two active/open assignments for the same child at once. | ✓ |
| Permitir duplicatas | Responsible can assign the same mission multiple times to the same child; each is separate. | |
| Permitir só depois de concluída/cancelada | Block while open; allow after closed. | |

**User's choice:** 1
**Notes:** Block active duplicates to avoid accidental duplicate credits.

### Initial Mission Fields

| Option | Description | Selected |
|--------|-------------|----------|
| Essencial para MVP | `title`, `description`, `coinValue`, `requiresApproval`, `active`, `createdByUserId`, timestamps; optional due date on assignment. | |
| Incluir organização extra | Add category/color/icon now for future UI. | |
| Incluir recorrência como enum inativo | Add `recurrenceType` as non-automated future metadata. | ✓ |

**User's choice:** 3
**Notes:** Include `recurrenceType`, but plans must document that it does not trigger automatic assignment generation in Phase 2.

---

## the agent's Discretion

- Completion, approval, rejection, child-access endpoint details, wallet locking strategy, and exact `CoinTransaction` field names remain open for researcher/planner discretion within locked requirements.

## Deferred Ideas

- Automatic recurring mission generation belongs to a future phase.
