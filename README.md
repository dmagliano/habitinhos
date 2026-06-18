# Habitinhos

Habitinhos is a mobile-first MVP for helping families organize children's routines through missions,
coin rewards, approvals, and redemption history. A responsible adult manages the family account,
children, tasks, rewards, and approvals, while children use a playful PT-BR mobile flow to complete
missions, follow their coin balance, and redeem rewards.

The project is built as a monorepo with a Spring Boot REST API, PostgreSQL persistence, and a React
Native + Expo mobile app. The backend is the source of truth for family isolation, authentication,
mission rules, wallet integrity, and the coin ledger.

## Features

- Responsible adult registration, login, JWT authentication, account deletion, and password/PIN reset flows.
- Family-tenant isolation derived from the authenticated user, without trusting client-supplied family IDs.
- Child profile management with automatically created wallets.
- Mission creation, assignment, recurrence snapshots, child completion, and responsible approval/rejection.
- Transactional coin credits/debits with wallet balance and transaction history.
- Reward management, child reward browsing, redemption, insufficient-balance protection, and delivery status.
- Responsible dashboard with children, balances, mission progress, pending approvals, and recent redemptions.
- OpenAPI/Swagger documentation for backend endpoint testing.
- Expo mobile app with responsible and child flows in PT-BR.

## Repository Structure

```text
habitinhos/
  backend/          Spring Boot API, Flyway migrations, tests, Dockerfile
  mobile/           Expo React Native app, TypeScript, Jest tests
  docs/             Architecture, API, data model, testing, and design docs
  bruno/            API collection and environment files
  .planning/        GSD planning artifacts
  docker-compose.yml
  render.yaml
```

## Stack

- Backend: Java 17, Spring Boot 3.x, PostgreSQL, Flyway, JPA/Hibernate, Spring Security, OpenAPI/Swagger.
- Mobile: React Native, Expo, TypeScript, React Navigation, Jest.
- Infrastructure: Docker Compose for local PostgreSQL and Render configuration for backend deployment.
- Interface language: PT-BR.
- Code naming: English technical names.

## Local Database

PostgreSQL is defined in `docker-compose.yml` for local development.

Start the database:

```bash
docker compose up -d postgres
```

The local database defaults are:

```text
Database: habitinhos
User: habitinhos
Password: habitinhos
Port: 5432
```

## Backend

Run the backend locally:

```bash
cd backend
./mvnw spring-boot:run
```

By default, local backend execution uses the `local` Spring profile, connects to the PostgreSQL service
at `jdbc:postgresql://localhost:5432/habitinhos`, and uses a development-only JWT secret.

Deployed environments should run with `SPRING_PROFILES_ACTIVE=render` and provide:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
HABITINHOS_JWT_SECRET
```

The Render Docker entrypoint can normalize Render's `DATABASE_URL` into the JDBC URL expected by
Spring. See `render.yaml` and `backend/docker-entrypoint.sh`.

## Email Delivery

The backend sends welcome, password reset, and responsible PIN reset emails through Resend when
`RESEND_API_KEY` is configured. In Render, keep the API key as a secret environment variable:

```text
RESEND_API_KEY=...
```

Set the sender to an address from a verified Resend domain before sending to real users:

```text
HABITINHOS_EMAIL_FROM=Habitinhos <noreply@your-verified-domain.com>
```

If `RESEND_API_KEY` is absent, the backend falls back to local logging so development does not require
real email delivery.

## Swagger Endpoint Testing

Open Swagger UI after starting the backend:

```text
http://localhost:8080/swagger-ui.html
```

To test protected endpoints:

1. Call `POST /auth/register` or `POST /auth/login`.
2. Copy the `token` from the response.
3. Click `Authorize` in Swagger UI.
4. Enter `Bearer <token>`.
5. Test protected endpoints such as `GET /me`, `/children`, `/missions`, `/rewards`, and `/dashboard/responsible`.

## Mobile API Configuration

The mobile app reads the backend URL from the public Expo variable `EXPO_PUBLIC_API_URL`. For the
deployed Render backend, configure it as:

```text
EXPO_PUBLIC_API_URL=https://habitinhos-api.onrender.com
```

For local development, choose the target when starting Expo:

```bash
cd mobile
npm run android:local   # Android emulator -> backend on the host at :8080
npm run android:render  # Android emulator -> deployed Render backend
npm run ios:local       # iOS simulator -> backend at localhost:8080
npm run web:local       # browser -> backend at localhost:8080
```

The local URL depends on where the app is running:

```text
Android emulator: http://10.0.2.2:8080
iOS simulator/web: http://localhost:8080
```

If you prefer a private local env file, copy one of the examples in `mobile/` to `mobile/.env.local`.
Expo bundles `EXPO_PUBLIC_*` variables into the mobile app, so use this only for non-secret values
such as public API URLs.

Set the value in the same EAS environment used by the build profile:

- `eas build --profile preview` uses the `preview` environment.
- `eas build --profile production` uses the `production` environment.
- `eas build --profile development` uses the `development` environment.

Create the value through the Expo dashboard or with EAS CLI:

```bash
cd mobile
eas env:create --name EXPO_PUBLIC_API_URL --value https://habitinhos-api.onrender.com --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_API_URL --value https://habitinhos-api.onrender.com --environment production --visibility plaintext
```

For local emulator development, if no Expo variable is set, the app also falls back to
`http://10.0.2.2:8080`.

## Tests

Run the automated backend test suite:

```bash
cd backend
./mvnw test
```

The integration tests use PostgreSQL through Testcontainers.

Run mobile checks:

```bash
cd mobile
npm run lint
npm run typecheck
npm run test:ci
```

## License, Copyright, and Attribution

Copyright (c) 2026 Diogo Magliano.

This repository is open source under the MIT License. You may use, copy, modify, merge, publish,
distribute, sublicense, and sell copies of the software under the license terms.

When distributing copies, forks, or substantial portions of this project, keep the copyright notice,
license text, and attribution to the original Habitinhos project. See `LICENSE` for the full license
text and `NOTICE` for the project attribution notice.
