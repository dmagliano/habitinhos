FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /workspace/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

COPY mvnw pom.xml ./
COPY .mvn ./.mvn

COPY src ./src
RUN ./mvnw -Dmaven.test.skip=true package

FROM eclipse-temurin:17-jre-jammy AS runtime

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

COPY --from=build /workspace/backend/target/habitinhos-backend-0.0.1-SNAPSHOT.jar /app/app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
