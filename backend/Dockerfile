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

RUN if ! getent group 1000 >/dev/null; then groupadd --gid 1000 render-secrets; fi \
    && useradd --create-home --uid 10001 appuser \
    && usermod --append --groups 1000 appuser \
    && install --directory --mode 0700 --owner appuser --group appuser /home/appuser/.ssh

COPY --from=build /workspace/backend/target/app.jar /app/app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
