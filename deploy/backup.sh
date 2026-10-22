#!/bin/sh
# Run from the repository root. Copies should also be kept outside the VM.
set -eu
umask 077
backup_dir=${1:-backups}
mkdir -p "$backup_dir"
backup_file="$backup_dir/dozenwar-$(date -u +%Y%m%dT%H%M%SZ).dump"
compose_file="$(dirname "$0")/compose.yml"
config_file="$(dirname "$0")/.env"
docker compose --env-file "$config_file" -f "$compose_file" exec -T db pg_dump -U dozenwar -d dozenwar -Fc > "$backup_file.tmp"
mv "$backup_file.tmp" "$backup_file"
printf 'Backup saved: %s\n' "$backup_file"
