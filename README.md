# Habitinhos

Habitinhos is a mobile + backend MVP for organizing children's household tasks with simple coin-based gamification.

## Repository Structure

```text
habitinhos/
  backend/
  mobile/
  docs/
  .planning/
  README.md
  docker-compose.yml
```

## Planned Stack

- Backend: Java 17, Spring Boot 3.x, PostgreSQL, Flyway, JPA/Hibernate, OpenAPI/Swagger.
- Mobile: React Native, Expo, TypeScript, React Navigation.
- Interface language: PT-BR.
- Code naming: English technical names.

## Current Status

Initial GSD planning artifacts are created. Next step:

```bash
$gsd-plan-phase 1
```

## Local Database

PostgreSQL is defined in `docker-compose.yml` for local development.

Start the database:

```bash
docker compose up -d postgres
```

## Backend Tests

Run the automated backend test suite:

```bash
cd backend
./mvnw test
```

The integration tests use PostgreSQL through Testcontainers.

## Swagger Endpoint Testing

Start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

Open Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

To test protected endpoints:

1. Call `POST /auth/register` or `POST /auth/login`.
2. Copy the `token` from the response.
3. Click `Authorize` in Swagger UI.
4. Enter `Bearer <token>`.
5. Test protected endpoints such as `GET /me` and `/children`.
