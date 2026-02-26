#!/bin/bash

# ============================================================
# Auth Refresh Token Endpoint Test Script
# Endpoint:
#   POST /api/public/auth/refresh
#
# This script validates:
# - Login token issuance
# - Refresh token rotation
# - Old refresh token invalidation
# - New access token usability
# - Error handling for invalid refresh tokens
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

# ------------------------------------------------------------
# Global tokens
# ------------------------------------------------------------
ACCESS_TOKEN=""
REFRESH_TOKEN=""
NEW_ACCESS_TOKEN=""
NEW_REFRESH_TOKEN=""

# ------------------------------------------------------------
# Helper: Login and obtain tokens
# ------------------------------------------------------------
login_and_get_tokens() {
  echo ""
  echo "============================================================"
  echo "PRECONDITION: Login and obtain access & refresh tokens"
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

  echo "✅ Login successful"
  echo "Access token obtained"
  echo "Refresh token obtained"
}

# ------------------------------------------------------------
# Helper: Call refresh endpoint
# ------------------------------------------------------------
run_refresh_test() {
  local description="$1"
  local refresh_token="$2"

  echo ""
  echo "============================================================"
  echo "REFRESH TEST: $description"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$REFRESH_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"refresh_token\": \"$refresh_token\"
    }")

  echo "$RESPONSE" | jq .

  NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.access_token')
  NEW_REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.refresh_token')
}

# ------------------------------------------------------------
# Helper: Call protected endpoint
# ------------------------------------------------------------
run_me_test() {
  local description="$1"
  local token="$2"

  echo ""
  echo "============================================================"
  echo "AUTH TEST: $description"
  echo "============================================================"

  curl -s -X GET "$ME_URL" \
    -H "Authorization: Bearer $token" | jq .
}

# ============================================================
# TEST FLOW
# ============================================================

# ------------------------------------------------------------
# 1. Login
# ------------------------------------------------------------
login_and_get_tokens

# ------------------------------------------------------------
# 2. Access protected resource with initial access token
# ------------------------------------------------------------
run_me_test "Access with initial access token (should succeed)" "$ACCESS_TOKEN"

# ------------------------------------------------------------
# 3. Refresh tokens (rotation)
# ------------------------------------------------------------
run_refresh_test "Valid refresh token rotation" "$REFRESH_TOKEN"

if [ -z "$NEW_ACCESS_TOKEN" ] || [ "$NEW_ACCESS_TOKEN" == "null" ]; then
  echo "❌ Refresh did not return new access token"
  exit 1
fi

if [ -z "$NEW_REFRESH_TOKEN" ] || [ "$NEW_REFRESH_TOKEN" == "null" ]; then
  echo "❌ Refresh did not return new refresh token"
  exit 1
fi

echo "✅ Tokens rotated successfully"

# ------------------------------------------------------------
# 4. Old refresh token reuse attempt (should fail)
# ------------------------------------------------------------
run_refresh_test "Reuse old refresh token (should fail)" "$REFRESH_TOKEN"

# ------------------------------------------------------------
# 5. Use new access token (should succeed)"
# ------------------------------------------------------------
run_me_test "Access with new access token (should succeed)" "$NEW_ACCESS_TOKEN"

# ------------------------------------------------------------
# 6. Use old access token (may fail depending on revocation policy)
# ------------------------------------------------------------
run_me_test "Access with old access token (should fail if revoked)" "$ACCESS_TOKEN"

# ------------------------------------------------------------
# 7. Invalid refresh token
# ------------------------------------------------------------
run_refresh_test "Invalid refresh token" "invalid_refresh_token_123"

# ------------------------------------------------------------
# 8. Missing refresh token
# ------------------------------------------------------------
echo ""
echo "============================================================"
echo "REFRESH TEST: Missing refresh_token parameter"
echo "============================================================"

curl -s -X POST "$REFRESH_URL" \
  -H "$JSON_HEADER" \
  -d "{}" | jq .

# ============================================================
# END OF TESTS
# ============================================================

echo ""
echo "============================================================"
echo "AUTH REFRESH TOKEN TESTS COMPLETED"
echo "============================================================"
