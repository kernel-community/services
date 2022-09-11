#!/usr/bin/env bash

PROJECT="$1"
MEMBER="serviceAccount:github-prod@kernel-services-prod.iam.gserviceaccount.com"

declare -a ROLES=(
	"roles/appengine.appAdmin"
  "roles/cloudbuild.builds.editor"
  "roles/iam.serviceAccountUser"
  "roles/storage.admin"
)

echo "Adding roles for ${PROJECT} ${ROLES}"
for ROLE in "${ROLES[@]}"
do
  gcloud projects add-iam-policy-binding "${PROJECT}" --member="${MEMBER}" --role="${ROLE}"
done
