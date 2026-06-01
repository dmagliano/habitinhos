---
quick_task: add-structured-logging
date: 2026-06-01
status: complete
---

# Quick Summary: Structured Logging

Implemented structured logging across backend API entrypoints, service operations, and exception handling.

## Completed

- Added entry logs in controllers:
  - `AuthController`
  - `ChildController`
  - `MissionController`
  - `AssignedMissionController`
  - `RewardController`
  - `WalletController`
- Added service logs for success and failure context:
  - `AuthService`
  - `ChildService`
  - `MissionService`
  - `AssignedMissionService`
  - `RewardService`
  - `WalletService`
- Added centralized exception logs in `GlobalExceptionHandler`, including a catch-all `Exception` handler with HTTP 500 response.
- Added logging-level defaults in `backend/src/main/resources/application.yml`:
  - `root`: `${LOG_LEVEL_ROOT:INFO}`
  - `br.com.habitinhos`: `${LOG_LEVEL_APP:DEBUG}`

## Verification

- Ran `cd backend && ./mvnw -DskipTests clean compile`
- Result: `BUILD SUCCESS`
