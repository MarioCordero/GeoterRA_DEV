#!/bin/bash

# ============================================================
# Login User Endpoint Test Script
# Endpoint: POST /api/public/login
# ============================================================

API_URL="http://localhost/api/public/auth/login"
HEADER="Content-Type: application/json"

# ------------------------------------------------------------
# Helper function to run a single test case
# ------------------------------------------------------------
run_test() {
  local description="$1"
  local payload="$2"

  echo ""
  echo "============================================================"
  echo "TEST: $description"
  echo "============================================================"

  curl -s -X POST "$API_URL" \
    -H "$HEADER" \
    -d "$payload" | jq .

  echo ""
}

# ------------------------------------------------------------
# TEST CASES
# ------------------------------------------------------------

# 1. Missing email
run_test "Missing email" \
'{
  "password": "StrongPassword123!"
}'

# 2. Invalid email format
run_test "Invalid email format" \
'{
  "email": "invalid-email",
  "password": "StrongPassword123!"
}'

# 3. Missing password
run_test "Missing password" \
'{
  "email": "test4@test.com"
}'

# 4. Weak password
run_test "Weak password" \
'{
  "email": "test4@test.com",
  "password": "123"
}'

# 5. Invalid credentials
run_test "Invalid credentials" \
'{
  "email": "test4@test.com",
  "password": "WrongPassword123!"
}'

# 6. Successful login
run_test "Successful login" \
'{
  "email": "test4@test.com",
  "password": "StrongPassword123!"
}'
