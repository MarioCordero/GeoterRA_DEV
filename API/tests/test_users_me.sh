#!/bin/bash

# ============================================================
# Users Me Endpoint Test Script
# Endpoint: GET /api/public/users/me
# ============================================================

BASE_URL="http://localhost/api/public"
LOGIN_URL="$BASE_URL/auth/login"
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
# Helper: run test
# ------------------------------------------------------------
run_test() {
  local description="$1"
  local auth_header="$2"

  echo ""
  echo "============================================================"
  echo "TEST: $description"
  echo "============================================================"

  curl -s -X GET "$ME_URL" \
    -H "$auth_header" | jq .

  echo ""
}

# ------------------------------------------------------------
# PRECONDITION
# Ensure user exists (manual or via register script)
# ------------------------------------------------------------
login_and_get_token

# ------------------------------------------------------------
# TEST CASES
# ------------------------------------------------------------

# 1. Missing Authorization header
run_test "Missing Authorization header" ""

# 2. Invalid token
run_test "Invalid token" "Authorization: Bearer invalid_token_123"

# 3. Valid token
run_test "Valid token" "Authorization: Bearer $TOKEN"
