@echo off
title Laundry Shop Management System
cd /d "%~dp0"
echo ============================================
echo  Laundry Shop Management System
echo  Starting local server on port 8080...
echo  Press Ctrl+C to stop the server.
echo ============================================
echo.
java -Xmx512m -jar laundryms.jar --spring.profiles.active=prod --spring.config.additional-location=config/application-prod.properties
pause
