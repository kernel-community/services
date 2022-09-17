#!/usr/bin/env bash

PROJECT="$1"
MEMBER_PROD="serviceAccount:github-prod@kernel-services-prod.iam.gserviceaccount.com"
MEMBER_STAGING="serviceAccount:github-staging@kernel-services-staging.iam.gserviceaccount.com"

declare -a ROLES=(
	"roles/appengine.appAdmin"
  "roles/cloudbuild.builds.editor"
  "roles/iam.serviceAccountUser"
  "roles/storage.admin"
)

MEMBER="${MEMBER_STAGING}"

if [[ $PROJECT =~ "prod" ]]; then
  MEMBER="${MEMBER_PROD}"
fi

echo "Adding role ${MEMBER} for ${PROJECT} ${ROLES}"
for ROLE in "${ROLES[@]}"
do
  gcloud projects add-iam-policy-binding "${PROJECT}" --member="${MEMBER}" --role="${ROLE}"
done
