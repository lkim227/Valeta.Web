---

# Valeta Web Frontend - Docker Build Guide

## Overview

This document provides a step-by-step guide to setting up and running the **Valeta Web** frontend project using Docker. It will cover how to build the project, run it in a Docker container, and copy the generated build files (JavaScript, CSS, HTML) from the Docker container to your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

1. **Docker**: [Install Docker](https://docs.docker.com/get-docker/) if it is not already installed.
2. **Basic Command Line Knowledge**: You should be comfortable with basic terminal/command line usage.

## Project Structure

Here is an overview of the project structure:

```
Valeta.Web/
│
├── appCommon/                    # Common application code
├── appCustomer/                  # Customer-specific code
├── appStaff/                     # Staff-specific code
├── html-template-source/          # HTML templates
│
├── Dockerfile                    # Dockerfile for building the project
├── bower.json                    # Bower dependencies file
├── gulpfile.js                   # Gulp tasks configuration
├── package.json                  # Node.js dependencies file
├── tsconfig.json                 # TypeScript configuration
│
└── other config files            # Additional config files for build and deployment
```

## Steps for Building and Running the Project in Docker

### 1. Clone the Repository

Ensure you have the latest version of the project. If not already done, clone the repository:

```bash
git clone <repository_url>
cd Valeta.Web
```

### 2. Build the Project Using Docker

To build the project using Docker, follow these steps:

1. Open your terminal and navigate to the `Valeta.Web` project directory.

2. Run the Docker build command:

   ```bash
   sudo docker build -t angular-app .
   ```

   This command will create a Docker image named `angular-app`. The image will contain all necessary dependencies and will run the Gulp build process to compile the frontend.

### 3. Run the Docker Container

Once the image is built, you can start the container and access its command line:

```bash
sudo docker run -it --rm -v /absolute/path/to/UI-Web/Source/Valeta.Web:/usr/src/host angular-app /bin/bash
```

Make sure to replace `/absolute/path/to/UI-Web/Source/Valeta.Web` with the correct absolute path to the `Valeta.Web` folder on your local machine. This command does the following:

- **`-v /absolute/path/to/UI-Web/Source/Valeta.Web:/usr/src/host`**: Mounts the local directory to the container’s `/usr/src/host` folder so that files can be transferred between the container and the local machine.

### 4. Copy Build Files to the Local Machine

Once inside the container, copy the generated files (`valeta-app.js`, `valeta-lib.js`, and `index.html`) to your local machine:

```bash
cp /usr/src/app/valeta-app.js /usr/src/host/
cp /usr/src/app/valeta-lib.js /usr/src/host/
cp /usr/src/app/index.html /usr/src/host/
```

The files will be placed in the mounted directory on your local machine (`/absolute/path/to/UI-Web/Source/Valeta.Web`).

### 5. Verify the Files on Your Local Machine

After exiting the Docker container, you should see the generated files (`valeta-app.js`, `valeta-lib.js`, `index.html`) in your local `Valeta.Web` directory.

Navigate to the directory to check:

```bash
cd ~/Documents/UI-Web/Source/Valeta.Web
ls
```

### 6. Stop and Clean Up

Once you're done, you can clean up by stopping the container (if it's running) and optionally removing the image:

```bash
# Check running containers
docker ps -a

# Stop any running containers (if needed)
docker stop <container_id>

# Remove the image if you no longer need it
docker rmi angular-app
```

## Troubleshooting

### 1. Files Not Appearing on Local Machine

- Ensure you are using an **absolute path** for the volume mount when running the Docker container.
- Check if the files were copied to the `/usr/src/host/` directory inside the container.

### 2. Slow Build Time

- Building the Docker image for the first time may take a while, especially if it needs to download and install dependencies.
- Ensure that Docker has sufficient resources allocated (CPU, memory) for faster builds.

### 3. Dockerfile Modifications

If you need to modify or add new tasks to the build process, you can update the `gulpfile.js` or modify the `Dockerfile` to suit your needs.

## Conclusion

This guide provides a simple approach to building and deploying the **Valeta Web** frontend using Docker. By following the steps, you can ensure the project builds consistently across different environments without the need for manual setup of dependencies.

For further assistance or troubleshooting, feel free to contact the development team.