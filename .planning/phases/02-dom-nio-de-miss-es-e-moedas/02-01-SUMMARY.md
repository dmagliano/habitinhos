---
phase: 02-dom-nio-de-miss-es-e-moedas
plan: 01
subsystem: database
tags: [flyway, jpa, missions, wallet-ledger, lombok]
requires:
  - phase: 01-fundacao-backend
    provides: base Spring Boot backend, auth/family/child/wallet entities, and V1 schema
provides:
  - V2 mission/assignment/coin transaction schema with constraints and indexes
  - Mission and AssignedMission entities with domain methods and family-scoped repositories
  - Lombok boilerplate convention aligned for touched backend entities
affects: [02-04, 02-03, 02-02, missions-api, wallet-transactions]
tech-stack:
  added: [org.projectlombok:lombok]
  patterns: [family-scoped repositories, no broad entity setters, domain-method mutation]
key-files:
  created:
    - backend/src/main/resources/db/migration/V2__create_mission_coin_schema.sql
    - backend/src/main/java/br/com/habitinhos/missions/Mission.java
    - backend/src/main/java/br/com/habitinhos/missions/AssignedMission.java
    - backend/src/main/java/br/com/habitinhos/missions/RecurrenceType.java
    - backend/src/main/java/br/com/habitinhos/missions/AssignedMissionStatus.java
    - backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java
    - backend/src/main/java/br/com/habitinhos/missions/AssignedMissionRepository.java
  modified:
    - backend/pom.xml
    - backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java
    - backend/src/main/java/br/com/habitinhos/auth/AppUser.java
    - backend/src/main/java/br/com/habitinhos/children/ChildProfile.java
    - backend/src/main/java/br/com/habitinhos/children/ChildService.java
    - backend/src/main/java/br/com/habitinhos/family/FamilyUnit.java
    - backend/src/main/java/br/com/habitinhos/shared/error/ApiException.java
    - backend/src/main/java/br/com/habitinhos/shared/model/BaseEntity.java
    - backend/src/main/java/br/com/habitinhos/wallet/Wallet.java
key-decisions:
  - "Coin transactions are persisted with explicit source/type checks and unique mission-credit prevention at DB level."
  - "Mission and assignment persistence remains family-scoped and soft-deactivation-ready."
  - "Touched backend entities adopt Lombok for getters/protected JPA constructor without broad class-level setters."
patterns-established:
  - "Entities expose state transitions through domain methods, not generic setters."
  - "Repository contracts include family-scoped finders and duplicate-guard queries."
requirements-completed: [MISS-01, MISS-02, MISS-03, WALT-04, WALT-06]
duration: 1h50m
completed: 2026-05-29
---

# Phase 02 Plan 01 Summary

**Persistent mission/assignment contracts and auditable coin ledger schema are now in place, with Lombok boilerplate conventions aligned for touched backend entities.**

## Performance

- **Duration:** 1h50m
- **Started:** 2026-05-29T14:35:00Z
- **Completed:** 2026-05-29T19:42:45Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Created `V2__create_mission_coin_schema.sql` with `missions`, `assigned_missions`, and `coin_transactions` plus checks, FKs, and duplicate guards.
- Added mission domain model (`Mission`, `AssignedMission`, enums, repositories) with family-scoped repository contracts for downstream services.
- Standardized Lombok usage for touched entities (`@Getter`, `@NoArgsConstructor(PROTECTED)`) and replaced mutable `ChildProfile` service setters with domain methods.

## Task Commits

Each task was committed atomically within the available execution history:

1. **Task 02-01-01: Criar migration V2 com contrato completo de missão e ledger** - `5118c42` (feat)
2. **Task 02-01-02: Implementar entidades, enums e repositórios de missão** - `5118c42` + `4820b26` + `27298b5` (feat/docs/refactor)

## Files Created/Modified

- `backend/src/main/resources/db/migration/V2__create_mission_coin_schema.sql` - Phase 2 persistence contract and integrity constraints.
- `backend/src/main/java/br/com/habitinhos/missions/Mission.java` - mission template aggregate root.
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMission.java` - assignment aggregate with snapshot and workflow transitions.
- `backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java` - family-scoped mission query contract.
- `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionRepository.java` - assignment query contract and duplicate-open guard.
- `backend/pom.xml` - Lombok optional dependency, excluded from runtime artifact.
- `backend/src/main/java/br/com/habitinhos/children/ChildProfile.java` - domain mutation methods replacing broad setters.
- `backend/src/main/java/br/com/habitinhos/children/ChildService.java` - switched updates/deactivation to domain methods.

## Decisions Made

- Added DB-level anti-duplication constraints for open assignments and mission credit to satisfy wallet integrity/audit requirements.
- Kept recurrence metadata persisted but inactive (`ONCE`, `DAILY`, `WEEKLY`, `CUSTOM`) to avoid premature automation scope.
- Adopted Lombok convention in touched entities without broad `@Setter`, preserving explicit mutation boundaries.

## Deviations from Plan

### Auto-fixed Issues

**1. Lombok adoption expanded to touched Phase 1 analog entities**
- **Found during:** Task 02-01-02 review
- **Issue:** Initial implementation still had manual boilerplate in analog entities while D-15 evolved to standardize touched backend entities.
- **Fix:** Refactored analog entities and `ChildService` mutation path to Lombok + domain methods.
- **Files modified:** `AppUser`, `FamilyUnit`, `Wallet`, `BaseEntity`, `ApiException`, `ChildProfile`, `ChildService`
- **Verification:** `./mvnw clean compile` and `./mvnw test` passed.
- **Committed in:** `27298b5`

---

**Total deviations:** 1 auto-fixed
**Impact on plan:** Positive alignment with updated D-15; no scope creep beyond persistence/model conventions needed by Phase 2.

## Issues Encountered

- `gsd-execute-phase` safe-resume gate detected missing `02-01-SUMMARY.md` despite delivered commits. Resolved by manual close-out with this summary.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 Wave 2 (`02-04`) can proceed with mission CRUD/assignment APIs against stable schema and repositories.
- Wallet transactional credit (`02-03`) can build directly on `coin_transactions` contract and duplicate-credit unique index.

---
*Phase: 02-dom-nio-de-miss-es-e-moedas*
*Completed: 2026-05-29*
