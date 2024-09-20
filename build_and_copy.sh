#!/bin/bash

# Ensure the script works in the directory where it is run
PROJECT_DIR=$(pwd)

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t angular-app .

# Step 2: Run the Docker container and copy the build files to the host machine
echo "Running Docker container to copy build files..."
docker run -it --rm -v "$PROJECT_DIR:/usr/src/host" angular-app /bin/bash -c "\
  cp /usr/src/app/valeta-app.js /usr/src/host/ && \
  cp /usr/src/app/valeta-lib.js /usr/src/host/ && \
  cp /usr/src/app/index.html /usr/src/host/"

# Step 3: Check if files were copied successfully
if [[ -f "$PROJECT_DIR/valeta-app.js" && -f "$PROJECT_DIR/valeta-lib.js" && -f "$PROJECT_DIR/index.html" ]]; then
    echo "Files copied successfully!"
    echo "You can find them in: $PROJECT_DIR"
else
    echo "Error: Files not copied. Please check for issues."
fi
