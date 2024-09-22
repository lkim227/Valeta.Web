#!/bin/bash

# Clean any existing build artifacts
rm -rf package-lock.json node_modules

# Ensure the script works in the directory where it is run
PROJECT_DIR=$(pwd)
DOCKER_BUILD_DIR="/usr/src/app"

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t angular-app .

# Step 2: Define the files to be copied
files_to_copy=(
  "valeta-app.js"
  "valeta-lib.js"
  "index.html"
  'appCommon'
  'appCustomer'
  'appStaff'
  'deployment'
)

# Step 3: Run the Docker container and copy the build files to the host machine
echo "Running Docker container to copy build files..."

docker_command="for file in ${files_to_copy[@]}; do \
    cp -r \$DOCKER_BUILD_DIR\$file /usr/src/host/; \
done"

docker run -it --rm -v "$PROJECT_DIR:/usr/src/host" angular-app /bin/bash -c "$docker_command"
