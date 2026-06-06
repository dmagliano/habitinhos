#!/bin/sh
set -eu

load_secret_file() {
  secret_file="${HABITINHOS_SECRETS_FILE:-/etc/secrets/habitinhos-api.secrets.env}"

  if [ ! -f "$secret_file" ]; then
    return 0
  fi

  set -a
  # shellcheck disable=SC1090
  . "$secret_file"
  set +a
}

normalize_database_url() {
  case "${DATABASE_URL:-}" in
    "")
      return 0
      ;;
    jdbc:postgresql://*)
      export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-$DATABASE_URL}"
      return 0
      ;;
    postgres://*|postgresql://*)
      database_uri="${DATABASE_URL#postgres://}"
      database_uri="${database_uri#postgresql://}"

      if [ "$database_uri" != "${database_uri#*@}" ]; then
        credentials="${database_uri%@*}"
        host_and_database="${database_uri#*@}"

        if [ -z "${SPRING_DATASOURCE_USERNAME:-}" ]; then
          export SPRING_DATASOURCE_USERNAME="${credentials%%:*}"
        fi

        if [ -z "${SPRING_DATASOURCE_PASSWORD:-}" ] && [ "$credentials" != "${credentials#*:}" ]; then
          export SPRING_DATASOURCE_PASSWORD="${credentials#*:}"
        fi
      else
        host_and_database="$database_uri"
      fi

      export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:postgresql://$host_and_database}"
      ;;
  esac
}

load_secret_file
normalize_database_url

exec java -jar /app/app.jar
