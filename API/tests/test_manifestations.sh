#!/bin/bash

# ============================================================
# Registered Manifestations Endpoint Test Script
#
# Endpoints:
#   POST   /registered-manifestations
#   GET    /registered-manifestations
#   PUT    /registered-manifestations/{id}
#   DELETE /registered-manifestations/{id}
#
# Preconditions:
# - Valid ADMIN credentials
# - Auth system working
# ============================================================

BASE_URL="http://localhost/api/public"

LOGIN_URL="$BASE_URL/auth/login"
MANIFESTATIONS_URL="$BASE_URL/registered-manifestations"

JSON_HEADER="Content-Type: application/json"

# ------------------------------------------------------------
# ADMIN test credentials
# ------------------------------------------------------------
EMAIL="test4@test.com"
PASSWORD="StrongPassword123!"

# ------------------------------------------------------------
# Global state
# ------------------------------------------------------------
ACCESS_TOKEN=""
MANIFESTATION_ID=""
REGION="Guanacaste"

# ------------------------------------------------------------
# Helper: Login
# ------------------------------------------------------------
login() {
  echo ""
  echo "============================================================"
  echo "PRECONDITION: Login as ADMIN"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
    -H "$JSON_HEADER" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  echo "$RESPONSE" | jq .

  ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.access_token')

  if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo "❌ Failed to login as ADMIN"
    exit 1
  fi

  echo "✅ Login successful"
}

# ------------------------------------------------------------
# 1. Create manifestation
# ------------------------------------------------------------
create_manifestation() {
  echo ""
  echo "============================================================"
  echo "TEST: Create registered manifestation"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$MANIFESTATIONS_URL" \
    -H "$JSON_HEADER" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"name\": \"Test Manifestation 99\",
      \"region\": \"$REGION\",
      \"latitude\": 10.123456,
      \"longitude\": -85.654321,
      \"description\": \"Test geothermal manifestation\",
      \"temperature\": 95.5
    }")

  echo "$RESPONSE" | jq .

  SUCCESS=$(echo "$RESPONSE" | jq -r '.data.success')

  if [ "$SUCCESS" != "true" ]; then
    echo "❌ Failed to create manifestation"
    exit 1
  fi

  echo "✅ Manifestation created"
}

# ------------------------------------------------------------
# 2. List manifestations by region
# ------------------------------------------------------------
list_manifestations() {
  echo ""
  echo "============================================================"
  echo "TEST: List manifestations by region"
  echo "============================================================"

  RESPONSE=$(curl -s -X GET \
    "$MANIFESTATIONS_URL?region=$REGION" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "$RESPONSE" | jq .

  COUNT=$(echo "$RESPONSE" | jq '.data | length')

  if [ "$COUNT" -eq 0 ]; then
    echo "❌ No manifestations returned"
    exit 1
  fi

  MANIFESTATION_ID=$(echo "$RESPONSE" | jq -r '.data[0].id')

  if [ -z "$MANIFESTATION_ID" ] || [ "$MANIFESTATION_ID" = "null" ]; then
    echo "❌ Failed to extract manifestation ID"
    exit 1
  fi

  echo "✅ Manifestation listed (ID: $MANIFESTATION_ID)"
}

# ------------------------------------------------------------
# 3. Update manifestation
# ------------------------------------------------------------
update_manifestation() {
  echo ""
  echo "============================================================"
  echo "TEST: Update manifestation"
  echo "============================================================"

  RESPONSE=$(curl -s -X PUT \
    "$MANIFESTATIONS_URL/$MANIFESTATION_ID" \
    -H "$JSON_HEADER" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"name\": \"Test Manifestation 002 - Updated\",
      \"region\": \"$REGION\",
      \"latitude\": 10.555555,
      \"longitude\": -85.111111
    }")

  echo "$RESPONSE" | jq .

  UPDATED=$(echo "$RESPONSE" | jq -r '.meta.updated')

  if [ "$UPDATED" != "true" ]; then
    echo "❌ Failed to update manifestation"
    exit 1
  fi

  echo "✅ Manifestation updated"
}

# ------------------------------------------------------------
# 4. Duplicate creation (should fail)
# ------------------------------------------------------------
duplicate_manifestation() {
  echo ""
  echo "============================================================"
  echo "TEST: Duplicate manifestation (should fail)"
  echo "============================================================"

  RESPONSE=$(curl -s -X POST "$MANIFESTATIONS_URL" \
    -H "$JSON_HEADER" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"name\": \"Test Manifestation 002 - Updated\",
      \"region\": \"$REGION\",
      \"latitude\": 10.0,
      \"longitude\": -85.0
    }")

  echo "$RESPONSE" | jq .

  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.errors[0].code')

  if [ "$ERROR_CODE" != "CONFLICT" ]; then
    echo "⚠️ Expected conflict error, but got something else"
  else
    echo "✅ Duplicate prevention works"
  fi
}

# ------------------------------------------------------------
# 5. Delete manifestation
# ------------------------------------------------------------
delete_manifestation() {
  echo ""
  echo "============================================================"
  echo "TEST: Delete manifestation"
  echo "============================================================"

  RESPONSE=$(curl -s -X DELETE \
    "$MANIFESTATIONS_URL/$MANIFESTATION_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "$RESPONSE" | jq .

  DELETED=$(echo "$RESPONSE" | jq -r '.meta.deleted')

  if [ "$DELETED" != "true" ]; then
    echo "❌ Failed to delete manifestation"
    exit 1
  fi

  echo "✅ Manifestation deleted (soft delete)"
}

# ------------------------------------------------------------
# TEST EXECUTION
# ------------------------------------------------------------

login
create_manifestation
list_manifestations
update_manifestation
duplicate_manifestation
delete_manifestation

echo ""
echo "============================================================"
echo "REGISTERED MANIFESTATIONS TESTS COMPLETED SUCCESSFULLY"
echo "============================================================"
