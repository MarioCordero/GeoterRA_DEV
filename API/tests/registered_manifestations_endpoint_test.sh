#!/bin/bash

# ============================================================
# Registered Manifestations Endpoints Test Script
# Endpoints:
#   PUT /api/public/registered-manifestations
#   GET /api/public/registered-manifestations?region=<REGION>
# ============================================================
BASE_URL="http://localhost/api/public/registered-manifestations"
DEFAULT_REGION="all"
HEADER_JSON="Content-Type: application/json"

# ⚠️ IMPORTANTE:
# El token NO debe incluir "Bearer "
VALID_TOKEN="6c0ca1bea778814f46a545d54adfb26f7b415d9e531e11deda67a6b53a9b2e18"

# ============================================================
# Helper functions
# ============================================================

run_put_test() {
  local description="$1"
  local token="$2"
  local payload="$3"

  echo ""
  echo "============================================================"
  echo "PUT TEST: $description"
  echo "============================================================"

  if [ -n "$token" ]; then
    curl -s -X PUT "$BASE_URL" \
      -H "$HEADER_JSON" \
      -H "Authorization: Bearer $token" \
      -d "$payload" | jq .
  else
    curl -s -X PUT "$BASE_URL" \
      -H "$HEADER_JSON" \
      -d "$payload" | jq .
  fi

  echo ""
}

run_get_test() {
  local description="$1"
  local token="$2"
  local region="$3"

  local url="$BASE_URL"
  if [ -n "$region" ]; then
    url="$BASE_URL?region=$region"
  fi

  echo ""
  echo "============================================================"
  echo "GET TEST: $description"
  echo "============================================================"

  if [ -n "$token" ]; then
    curl -s -X GET "$url" \
      -H "Authorization: Bearer $token" | jq .
  else
    curl -s -X GET "$url" | jq .
  fi

  echo ""
}

# ============================================================
# PUT /registered-manifestations TEST CASES
# ============================================================

run_put_test "Missing Authorization header" "" '{
  "id": "RGM-001",
  "region": "San_José",
  "latitude": 9.93333,
  "longitude": -84.08333
}'

run_put_test "Invalid token" "INVALID_TOKEN" '{
  "id": "RGM-001",
  "region": "San_José",
  "latitude": 9.93333,
  "longitude": -84.08333
}'

run_put_test "Missing ID" "$VALID_TOKEN" '{
  "region": "San_José",
  "latitude": 9.93333,
  "longitude": -84.08333
}'

run_put_test "Invalid region (ENUM violation)" "$VALID_TOKEN" '{
  "id": "RGM-002",
  "region": "Madrid",
  "latitude": 9.93333,
  "longitude": -84.08333
}'

run_put_test "Invalid latitude range" "$VALID_TOKEN" '{
  "id": "RGM-003",
  "region": "Guanacaste",
  "latitude": 123.45,
  "longitude": -84.08333
}'

run_put_test "Invalid longitude range" "$VALID_TOKEN" '{
  "id": "RGM-004",
  "region": "Alajuela",
  "latitude": 10.12,
  "longitude": -200.00
}'

run_put_test "Missing latitude" "$VALID_TOKEN" '{
  "id": "RGM-005",
  "region": "Cartago",
  "longitude": -83.90
}'

run_put_test "Missing longitude" "$VALID_TOKEN" '{
  "id": "RGM-006",
  "region": "Heredia",
  "latitude": 10.01
}'

run_put_test "Successful registered manifestation creation" "$VALID_TOKEN" '{
  "id": "RGM-007",
  "region": "San_José",
  "latitude": 9.93333,
  "longitude": -84.08333,
  "description": "Manifestación geotérmica superficial",
  "temperature": 72.5,
  "field_pH": 6.8,
  "field_conductivity": 850.5,
  "lab_pH": 6.9,
  "lab_conductivity": 870.0,
  "cl": 120.45,
  "ca": 35.20,
  "hco3": 180.75,
  "so4": 45.10,
  "fe": 0.85,
  "si": 32.40,
  "b": 1.20,
  "li": 0.45,
  "f": 0.90,
  "na": 95.60,
  "k": 8.25,
  "mg": 18.40
}'

# ============================================================
# GET /registered-manifestations TEST CASES
# ============================================================

run_get_test "Missing Authorization header" "" "$DEFAULT_REGION"

run_get_test "Invalid token" "INVALID_TOKEN" "$DEFAULT_REGION"

run_get_test "Missing region parameter" "$VALID_TOKEN" ""

run_get_test "Get all registered manifestations (authenticated)" "$VALID_TOKEN" "$DEFAULT_REGION"
