#!/bin/bash
mkdir -p API/logs
clear
php -S localhost:8000 -t API/public/ 2>&1 | tee API/logs/system.log