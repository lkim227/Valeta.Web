#!/bin/bash

# Enable debug mode for verbose output, useful for debugging
set -x

# Ensure the script works in the directory where it is run
PROJECT_DIR=$(pwd)

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t angular-app .

# Step 2: Define the files to be copied
files_to_copy=(
  "valeta-app.js"
  "valeta-lib.js"
  "index.html"
  "appCommon"
  "appCustomer"
  "appStaff"
  "deployment"
)

# Step 3: Run the Docker container and copy the build files to the host machine
echo "Running Docker container to copy build files..."
docker_command=""

# Build the copy command for each file or directory in the files_to_copy array
for file in "${files_to_copy[@]}"; do
    docker_command+="cp -r /usr/src/app/$file /usr/src/host/ && "
done

# Remove the trailing '&& ' from the last copy command
docker_command=${docker_command%&& }

# Mount the current project directory into the container as /usr/src/host and run the copy commands
docker run -it --rm -v "$PROJECT_DIR:/usr/src/host" angular-app /bin/bash -c "$docker_command"

# Step 4: Check if all files were copied successfully
all_copied=true
for file in "${files_to_copy[@]}"; do
  if [[ ! -e "$PROJECT_DIR/$file" ]]; then
    all_copied=false
    echo "Error: $file was not copied."
  fi
done

# Final success message if all files are copied
if [[ "$all_copied" == true ]]; then
    echo "All files copied successfully!"
    echo "You can find them in: $PROJECT_DIR"
else
    echo "Some files were not copied. Please check for issues."
fi
