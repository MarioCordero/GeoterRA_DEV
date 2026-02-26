<?php
declare(strict_types=1);

// PHP CONFIG
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// REQUEST LOGGING
file_put_contents('/tmp/debug_api.log', 
    "REQUEST_URI: {$_SERVER['REQUEST_URI']}, METHOD: {$_SERVER['REQUEST_METHOD']}\n", 
    FILE_APPEND
);