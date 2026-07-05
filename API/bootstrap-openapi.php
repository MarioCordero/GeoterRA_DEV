<?php
/**
 * Bootstrap file for swagger-php OpenAPI generation
 * Ensures proper autoloading of all classes before annotation parsing
 */

// Load Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Set error handling for better debugging
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Optional: Define any constants or configuration here if needed