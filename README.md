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

## Mobile API Configuration

The mobile app reads the backend URL from the public Expo variable
`EXPO_PUBLIC_API_URL`. For the deployed Render backend, configure it as:

```text
EXPO_PUBLIC_API_URL=https://habitinhos-api.onrender.com
```

For local development, you can choose the target when starting Expo:

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

If you prefer a private local env file, copy one of the examples in `mobile/` to
`mobile/.env.local`. Expo will bundle `EXPO_PUBLIC_*` variables into the mobile app, so use this only
for non-secret values such as public API URLs.

Set it in the same EAS environment used by the build profile:

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

## Swagger Endpoint Testing

Start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

By default, local backend execution uses the `local` Spring profile, connects to the PostgreSQL service from
`docker-compose.yml` at `jdbc:postgresql://localhost:5432/habitinhos` with
`habitinhos` / `habitinhos`, and uses a development-only JWT secret. Deployed environments should run with
`SPRING_PROFILES_ACTIVE=render` and provide
`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and
`SPRING_DATASOURCE_PASSWORD`; the Render Docker entrypoint normalizes Render's
`DATABASE_URL` into the JDBC URL expected by Spring. They must also provide
`HABITINHOS_JWT_SECRET`.

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
