#!/usr/bin/env bash

PROJECT="$1"

declare -a APIS=(
	#"appengine.googleapis.com"
  "cloudbuild.googleapis.com"
  "containerregistry.googleapis.com"
  "pubsub.googleapis.com"
)

echo "Enabling apis for ${PROJECT} ${APIS}"
for API in "${APIS[@]}"
do
  gcloud services enable "${API}" --project "${PROJECT}" 
done
