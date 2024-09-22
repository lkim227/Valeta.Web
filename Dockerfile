FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN npm install -g gulp bower
RUN npm install
RUN gulp build-production

# Gulp build targets:
# 'build-debug'
# 'build-staging'
# 'build-rc'
# 'build-production'