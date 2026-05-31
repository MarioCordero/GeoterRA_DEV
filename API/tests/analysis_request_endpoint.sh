#!/bin/bash

# ============================================================
# Users /me Endpoints Test Script
# Endpoints:
#   GET    /api/public/users/me
#   PUT    /api/public/users/me
#   DELETE /api/public/users/me
# ============================================================

BASE_URL="http://localhost/api/public"

LOGIN_URL="$BASE_URL/auth/login"
ME_URL="$BASE_URL/users/me"

JSON_HEADER="Content-Type: application/json"

# ------------------------------------------------------------
# Test credentials
# ------------------------------------------------------------
EMAIL="test4@test.com"
PASSWORD="StrongPassword123!"

# ------------------------------------------------------------
# Helper: login and extract token
# ------------------------------------------------------------
login_and_get_token() {
  echo ""
  echo "============================================================"
  echo "PRECONDITION: Logging in to obtain valid token"
  echo "============================================================"

  VALID_TOKEN=$(curl -s -X POST "$LOGIN_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }" | jq -r '.data.token')

  if [ "$VALID_TOKEN" == "null" ] || [ -z "$VALID_TOKEN" ]; then
    echo "❌ Failed to obtain token. Aborting tests."
    exit 1
  fi

  echo "✅ Token obtained successfully"
  echo ""
}

login_and_get_token

# ============================================================
# Analysis Request Endpoints Test Script
# Endpoints:
#   POST /api/public/analysis-request
#   GET  /api/public/analysis-request
# ============================================================

API_URL="http://localhost/api/public/analysis-request"
JSON_HEADER="Content-Type: application/json"

# ============================================================
# Helper functions
# ============================================================

run_post_test() {
  local description="$1"
  local token="$2"
  local payload="$3"

  echo ""
  echo "============================================================"
  echo "POST TEST: $description"
  echo "============================================================"

  if [ -n "$token" ]; then
    curl -s -X POST "$API_URL" \
      -H "$JSON_HEADER" \
      -H "Authorization: Bearer $token" \
      -d "$payload" | jq .
  else
    curl -s -X POST "$API_URL" \
      -H "$JSON_HEADER" \
      -d "$payload" | jq .
  fi

  echo ""
}

run_get_test() {
  local description="$1"
  local token="$2"

  echo ""
  echo "============================================================"
  echo "GET TEST: $description"
  echo "============================================================"

  if [ -n "$token" ]; then
    curl -s -X GET "$API_URL" \
      -H "Authorization: Bearer $token" | jq .
  else
    curl -s -X GET "$API_URL" | jq .
  fi

  echo ""
}

# ============================================================
# POST /analysis-request TEST CASES
# ============================================================

run_post_test "Missing Authorization header" "" '{
  "region": "San_José",
  "email": "test@test.com",
  "owner_name": "Juan Pérez",
  "latitude": 9.93,
  "longitude": -84.08
}'

run_post_test "Invalid token" "INVALID_TOKEN" '{
  "region": "San_José",
  "email": "test@test.com",
  "owner_name": "Juan Pérez",
  "latitude": 9.93,
  "longitude": -84.08
}'

run_post_test "Missing region" "$VALID_TOKEN" '{
  "email": "test@test.com",
  "owner_name": "Juan Pérez",
  "latitude": 9.93,
  "longitude": -84.08
}'

run_post_test "Invalid email" "$VALID_TOKEN" '{
  "region": "San_José",
  "email": "correo-invalido",
  "owner_name": "Juan Pérez",
  "latitude": 9.93,
  "longitude": -84.08
}'

run_post_test "Missing latitude" "$VALID_TOKEN" '{
  "region": "San_José",
  "email": "test@test.com",
  "owner_name": "Juan Pérez",
  "longitude": -84.08
}'

run_post_test "Missing longitude" "$VALID_TOKEN" '{
  "region": "San_José",
  "email": "test@test.com",
  "owner_name": "Juan Pérez",
  "latitude": 9.93
}'

run_post_test "Successful analysis request creation" "$VALID_TOKEN" '{
  "name": "Análisis de agua pozo Juan Pérez",
  "region": "San_José",
  "email": "propietario@example.com",
  "owner_contact_number": "88881234",
  "owner_name": "Juan Pérez",
  "temperature_sensation": "Frío",
  "bubbles": true,
  "details": "Se observa presencia de burbujeo cerca del pozo",
  "current_usage": "Riego agrícola",
  "latitude": 9.93333,
  "longitude": -84.08333
}'

# ============================================================
# GET /analysis-request TEST CASES
# ============================================================

run_get_test "Missing Authorization header" ""

run_get_test "Invalid token" "INVALID_TOKEN"

run_get_test "Get all analysis requests for authenticated user" "$VALID_TOKEN"
