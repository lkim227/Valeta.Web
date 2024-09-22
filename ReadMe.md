# Valeta Build

The provided `./build_and_copy.sh` script builds the assets in a docker container and copies the build artifacts to the current working directory

## Docker Build

The provided `Dockerfile` builds the assets for `production` mode. There are several different build targets defined in the gulpfile, modify the last line of the docker to build for other environments

## Move build artifacts

In `./build_and_copy.sh` There is a list of build artifacts and directories that will be copied over to the current working directory. This includes the two main build assets, `valeta-app.js` and `valeta-lib.js`, the `index.html` and several subdirectories that may or may not be needed for the app to function.

We shell into the built container and use a shared volume to move the assets described above onto the host machine.
