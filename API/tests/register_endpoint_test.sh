#!/bin/bash

# ============================================================
# Register User Endpoint Test Script
# Endpoint: POST /api/public/auth/register
# ============================================================

API_URL="http://localhost/api/public/auth/register"
HEADER="Content-Type: application/json"

# ------------------------------------------------------------
# Helper function to execute a test case
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

# 1. Missing name
run_test "Missing name" \
'{
  "lastname": "Perez",
  "email": "missingname@test.com",
  "password": "StrongPassword123!"
}'

# 2. Missing lastname
run_test "Missing lastname" \
'{
  "name": "Carlos",
  "email": "missinglastname@test.com",
  "password": "StrongPassword123!"
}'

# 3. Missing email
run_test "Missing email" \
'{
  "name": "Carlos",
  "lastname": "Perez",
  "password": "StrongPassword123!"
}'

# 4. Invalid email format
run_test "Invalid email format" \
'{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "invalid-email",
  "password": "StrongPassword123!"
}'

# 5. Weak password
run_test "Weak password" \
'{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "weakpassword@test.com",
  "password": "123"
}'

# 6. Email already in use
run_test "Email already in use" \
'{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "test10@test.com",
  "password": "StrongPassword123!"
}'

# 7. Successful registration
run_test "Successful registration" \
'{
  "name": "Carlos",
  "lastname": "Perez",
  "email": "success_'$(date +%s)'@test.com",
  "password": "StrongPassword123!"
}'
