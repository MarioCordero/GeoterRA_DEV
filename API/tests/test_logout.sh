#!/bin/bash

# ============================================================
# Logout Endpoint Test Script
# Endpoint: POST /api/public/auth/logout
# ============================================================

BASE_URL="http://localhost/api/public"
LOGIN_URL="$BASE_URL/auth/login"
LOGOUT_URL="$BASE_URL/auth/logout"
ME_URL="$BASE_URL/users/me"

JSON_HEADER="Content-Type: application/json"

EMAIL="test4@test.com"
PASSWORD="StrongPassword123!"

# ------------------------------------------------------------
# Helper: login and extract token
# ------------------------------------------------------------
login_and_get_token() {
  echo ""
  echo "Logging in to obtain token..."

  TOKEN=$(curl -s -X POST "$LOGIN_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }" | jq -r '.data.token')

  echo "Token obtained: $TOKEN"
}

# ------------------------------------------------------------
# Helper: run POST logout test
# ------------------------------------------------------------
run_logout_test() {
  local description="$1"
  local auth_header="$2"

  echo ""
  echo "============================================================"
  echo "TEST: $description"
  echo "============================================================"

  curl -s -X POST "$LOGOUT_URL" \
    -H "$auth_header" | jq .

  echo ""
}

# ------------------------------------------------------------
# Helper: call /users/me
# ------------------------------------------------------------
run_me_test() {
  local description="$1"
  local auth_header="$2"

  echo ""
  echo "------------------------------------------------------------"
  echo "CHECK: $description"
  echo "------------------------------------------------------------"

  curl -s -X GET "$ME_URL" \
    -H "$auth_header" | jq .

  echo ""
}

# ------------------------------------------------------------
# PRECONDITION
# ------------------------------------------------------------
login_and_get_token

# ------------------------------------------------------------
# TEST CASES
# ------------------------------------------------------------

# 1. Successful logout
run_logout_test "Successful logout" "Authorization: Bearer $TOKEN"

# 2. Token should no longer work
run_me_test "Access /users/me after logout (should fail)" \
  "Authorization: Bearer $TOKEN"

# 3. Logout with already revoked token
run_logout_test "Logout with revoked token" \
  "Authorization: Bearer $TOKEN"

# 4. Logout without token
run_logout_test "Logout without token" ""

# 5. Logout with invalid token
run_logout_test "Logout with invalid token" \
  "Authorization: Bearer invalid_token_456"
