#!/usr/bin/env bash

PROJECT="$1"
DOMAIN="$2"
REGION="us-central"

echo "Creating new App Engine app for ${PROJECT} in region ${REGION}"
gcloud app create --region="${REGION}" --project "${PROJECT}"

echo "Creating domain mapping ${DOMAIN}"
gcloud app domain-mappings create "${DOMAIN}" --project "${PROJECT}"
