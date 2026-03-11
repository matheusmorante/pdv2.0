@echo off
echo Starting debug... > debug_log.txt
echo Npm version: >> debug_log.txt
call npm --version >> debug_log.txt 2>&1
echo Running erp... >> debug_log.txt
call npm run erp >> debug_log.txt 2>&1
