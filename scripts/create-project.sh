#!/usr/bin/env bash

PROJECT="$1"
ORG="50376584578" # kernel.community
BILLING_ACCOUNT="0158B6-CE1444-36F37D"

echo "Creating new project ${PROJECT}"
gcloud projects create "${PROJECT}" --organization="${ORG}"

echo "Linking default billing account"
gcloud beta billing projects link "${PROJECT}" --billing-account="${BILLING_ACCOUNT}"
