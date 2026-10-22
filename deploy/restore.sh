#!/bin/sh
# Explicitly destructive: restores the supplied backup into the current database.
set -eu
if [ "$#" -ne 2 ] || [ "$1" != '--replace-database' ]; then
    printf 'Usage: %s --replace-database backup.dump\n' "$0" >&2
    exit 1
fi
[ -s "$2" ] || { printf 'Backup missing or empty\n' >&2; exit 1; }
compose_file="$(dirname "$0")/compose.yml"
config_file="$(dirname "$0")/.env"
docker compose --env-file "$config_file" -f "$compose_file" stop app
docker compose --env-file "$config_file" -f "$compose_file" exec -T db pg_restore -U dozenwar -d dozenwar --clean --if-exists --single-transaction < "$2"
docker compose --env-file "$config_file" -f "$compose_file" start app
