#!/bin/bash
# Quick installation and testing script for GeoterRA API Unit Tests

set -e  # Exit on error

echo "================================"
echo "GeoterRA API Unit Testing Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}Step 1: Installing Composer Dependencies${NC}"
cd "${API_DIR}"
composer install --no-interaction

echo ""
echo -e "${BLUE}Step 2: Running All Tests${NC}"
vendor/bin/phpunit

echo ""
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""

read -p "Generate code coverage report? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vendor/bin/phpunit --coverage-html coverage/ --coverage-text
    echo -e "${GREEN}✓ Coverage report generated in coverage/index.html${NC}"
fi

echo ""
echo "================================"
echo "Quick Reference:"
echo "================================"
echo "composer test                  - Run all tests"
echo "composer run test:coverage     - Generate coverage report"
echo "composer run test:services     - Run service tests only"
echo "composer run test:dto          - Run DTO validation tests"
echo ""
echo "See docs/UNIT_TESTING.md for complete documentation"
echo "================================"