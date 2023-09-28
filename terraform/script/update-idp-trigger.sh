#!/usr/bin/env bash

set -e

PROJECT_ID=${PROJECT_ID}
BEFORE_CREATE_TRIGGER_URL=${BEFORE_CREATE_TRIGGER_URL}
BEFORE_SIGNIN_TRIGGER_URL=${BEFORE_SIGNIN_TRIGGER_URL}
AUTH_TOKEN="$(gcloud auth print-access-token)"

curl -fsSL -d "{\"blockingFunctions\":{\"triggers\":{\"beforeCreate\":{\"functionUri\":\"${BEFORE_CREATE_TRIGGER_URL}\"},\"beforeSignIn\":{\"functionUri\":\"${BEFORE_SIGNIN_TRIGGER_URL}\"}}}}" \
  -X PATCH \
  -H "X-Goog-User-Project: ${PROJECT_ID}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  https://identitytoolkit.googleapis.com/admin/v2/projects/$PROJECT_ID/config?updateMask=blockingFunctions.triggers > /dev/null
