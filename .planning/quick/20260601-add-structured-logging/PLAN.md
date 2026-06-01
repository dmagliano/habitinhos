---
quick_task: add-structured-logging
date: 2026-06-01
status: complete
mode: gsd-quick
---

# Quick Plan: Structured Logging

## Objective

Add consistent observability logs for backend entrypoints, services, and exception handling using Spring Boot standard logging (SLF4J + Logback).

## Decisions

- Keep default Spring logging stack (no explicit Log4j dependency change).
- Use `INFO` for successful state-changing operations.
- Use `DEBUG` for read/list/lookup traces and request entry diagnostics.
- Use `WARN` for expected business/security failures.
- Use `ERROR` for unexpected/unhandled failures.

## Scope

1. Add controller entry logs for auth, child, mission, assigned mission, reward, and wallet APIs.
2. Add service-level success/failure-context logs in key operations.
3. Add global exception logs, including a fallback 500 handler.
4. Add application logging-level configuration defaults in `application.yml`.
