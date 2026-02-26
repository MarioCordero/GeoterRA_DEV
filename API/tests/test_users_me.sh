#!/bin/bash

# ============================================================
# Users /me Endpoints Test Script (Access + Refresh Tokens)
# Endpoints:
#   POST   /auth/login
#   POST   /auth/refresh
#   GET    /users/me
#   PUT    /users/me
#   DELETE /users/me
# ============================================================

BASE_URL="http://localhost/api/public"

LOGIN_URL="$BASE_URL/auth/login"
REFRESH_URL="$BASE_URL/auth/refresh"
ME_URL="$BASE_URL/users/me"

JSON_HEADER="Content-Type: application/json"

# ------------------------------------------------------------
# Test credentials
# ------------------------------------------------------------
EMAIL="test4@test.com"
PASSWORD="StrongPassword123!"

ACCESS_TOKEN=""
REFRESH_TOKEN=""

# ------------------------------------------------------------
# Helper: login and extract tokens
# ------------------------------------------------------------
login_and_get_tokens() {
  echo ""
  echo "============================================================"
  echo "PRECONDITION: Logging in to obtain access & refresh tokens"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.access_token')
  REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.refresh_token')

  if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
    echo "❌ Failed to obtain access token"
    exit 1
  fi

  if [ -z "$REFRESH_TOKEN" ] || [ "$REFRESH_TOKEN" == "null" ]; then
    echo "❌ Failed to obtain refresh token"
    exit 1
  fi

  echo "✅ Tokens obtained successfully"
  echo ""
}

# ------------------------------------------------------------
# Helper: refresh access token
# ------------------------------------------------------------
refresh_access_token() {
  echo ""
  echo "============================================================"
  echo "Refreshing access token"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$REFRESH_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"refresh_token\": \"$REFRESH_TOKEN\"
    }")

  NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.access_token')

  if [ -z "$NEW_ACCESS_TOKEN" ] || [ "$NEW_ACCESS_TOKEN" == "null" ]; then
    echo "❌ Failed to refresh access token"
    exit 1
  fi

  ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
  echo "✅ Access token refreshed successfully"
  echo ""
}

# ------------------------------------------------------------
# Helper: Authorization header
# ------------------------------------------------------------
auth_header() {
  echo "Authorization: Bearer $ACCESS_TOKEN"
}

# ------------------------------------------------------------
# Helper: GET /users/me
# ------------------------------------------------------------
run_get_test() {
  local description="$1"
  local header="$2"

  echo ""
  echo "============================================================"
  echo "GET TEST: $description"
  echo "============================================================"

  curl -s -X GET "$ME_URL" \
    -H "$header" | jq .

  echo ""
}

# ------------------------------------------------------------
# Helper: PUT /users/me
# ------------------------------------------------------------
run_put_test() {
  local description="$1"
  local header="$2"
  local payload="$3"

  echo ""
  echo "============================================================"
  echo "PUT TEST: $description"
  echo "============================================================"

  curl -s -X PUT "$ME_URL" \
    -H "$JSON_HEADER" \
    -H "$header" \
    -d "$payload" | jq .

  echo ""
}

# ------------------------------------------------------------
# Helper: DELETE /users/me
# ------------------------------------------------------------
run_delete_test() {
  local description="$1"
  local header="$2"

  echo ""
  echo "============================================================"
  echo "DELETE TEST: $description"
  echo "============================================================"

  curl -s -X DELETE "$ME_URL" \
    -H "$header" | jq .

  echo ""
}

# ============================================================
# PRECONDITION
# ============================================================

login_and_get_tokens

# ============================================================
# GET /users/me TEST CASES
# ============================================================

run_get_test "Valid access token" "$(auth_header)"

run_get_test "Missing Authorization header" ""

run_get_test "Invalid access token" "Authorization: Bearer invalid_token_123"

# ============================================================
# TOKEN REFRESH FLOW
# ============================================================

refresh_access_token

run_get_test "Access with refreshed token" "$(auth_header)"

# ============================================================
# PUT /users/me TEST CASES
# ============================================================

run_put_test "Missing name" "$(auth_header)" '{
  "lastname": "Perez",
  "email": "test4@test.com",
  "phone_number": "88881234"
}'

run_put_test "Invalid email" "$(auth_header)" '{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "invalid-email",
  "phone_number": "88881234"
}'

run_put_test "Successful update" "$(auth_header)" '{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "test4@test.com",
  "phone_number": "88881234"
}'

# ============================================================
# DELETE /users/me TEST CASE
# ============================================================

run_delete_test "Delete authenticated user" "$(auth_header)"

# ============================================================
# POST-DELETION BEHAVIOR
# ============================================================

run_get_test "Access after deletion (should fail)" "$(auth_header)"
