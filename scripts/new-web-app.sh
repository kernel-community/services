#!/usr/bin/env bash

PROJECT="$1"
DOMAIN="$2"
declare -a SCRIPTS=(
  "create-project.sh"
  "create-app.sh"
  "add-roles.sh"
  "enable-apis.sh"
)

BASE_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Creating new Web app ${PROJECT}" 

for SCRIPT in "${SCRIPTS[@]}"
do
  "${BASE_DIR}/${SCRIPT}" "${PROJECT}" "${DOMAIN}"
done
