# delete node_modules and package-lock.json
FROM node:10 AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install -g gulp bower
RUN npm install
RUN gulp build-production
# CMD ["node", "node_modules/.bin/gulp", "build", "--mode" ,"Production"]

# FROM alpine:latest
# COPY --from=builder /usr/src/app/* /usr/src/app
# WORKDIR /usr/src/app

# files to copy
# valeta-app.js
# valeta-lib.js
# index.html