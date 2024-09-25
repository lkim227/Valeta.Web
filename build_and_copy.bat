@echo off

:: Enable delayed expansion for correct variable handling in loops
setlocal enabledelayedexpansion

:: Clean any existing build artifacts
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

:: Ensure the script works in the directory where it is run
set PROJECT_DIR=%cd%
set DOCKER_BUILD_DIR=/usr/src/app

:: Step 1: Build the Docker image
echo Building Docker image...
docker build -t angular-app .

:: Step 2: Define the files to be copied
:: Use an array-like list of files for copying (manually define files and directories)
set files_to_copy=valeta-app.js valeta-lib.js index.html appCommon appCustomer appStaff deployment

:: Step 3: Build the Docker command to copy files
set docker_command=""

for %%f in (%files_to_copy%) do (
    set docker_command=!docker_command! cp -r !DOCKER_BUILD_DIR!/%%f /usr/src/host/ && 
)

:: Remove the trailing "&&" from the last copy command
set docker_command=%docker_command:~0,-3%

:: Step 4: Run the Docker container and execute the built copy command
echo Running Docker container to copy build files...
docker run -it --rm -v "%PROJECT_DIR%:/usr/src/host" angular-app /bin/bash -c "%docker_command%"

:: Step 5: Check if all files were copied successfully
set all_copied=true

for %%f in (%files_to_copy%) do (
    if not exist "%PROJECT_DIR%\%%f" (
        set all_copied=false
        echo Error: %%f was not copied.
    )
)

:: Final success message if all files are copied
if "%all_copied%" == "true" (
    echo All files copied successfully!
    echo You can find them in: %PROJECT_DIR%
) else (
    echo Some files were not copied. Please check for issues.
)

pause
