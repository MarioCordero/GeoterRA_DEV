#!/bin/bash

# ============================================================
# Analysis Request Endpoints Test Script
# Endpoints:
#   POST /api/public/analysis-request
#   GET  /api/public/analysis-request
# ============================================================

API_URL="http://localhost/api/public/analysis-request"
HEADER_JSON="Content-Type: application/json"

# ⚠️ IMPORTANTE:
# El token NO debe incluir "Bearer "
VALID_TOKEN="6c0ca1bea778814f46a545d54adfb26f7b415d9e531e11deda67a6b53a9b2e18"

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
      -H "$HEADER_JSON" \
      -H "Authorization: Bearer $token" \
      -d "$payload" | jq .
  else
    curl -s -X POST "$API_URL" \
      -H "$HEADER_JSON" \
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
