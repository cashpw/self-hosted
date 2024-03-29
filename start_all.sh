#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

services=(
  "anki-sync-server"
  "monica"
  "nginx-proxy"
)

cd "${DIR}"

for service in "${services[@]}"; do
  cd "${service}"
  docker-compose up -d
  cd ..
done
