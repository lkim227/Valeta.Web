@echo off

:: Navigate to the directory containing the project
cd %~dp0

:: Run the build_and_copy.sh script in WSL2
wsl ./build_and_copy.sh

:: Wait for user input before closing (optional)
pause
