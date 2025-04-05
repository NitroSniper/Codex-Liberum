# The build image
FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app
# Reason for ci instead of install - https://stackoverflow.com/a/53325242
RUN npm ci --omit=dev && \
    rm -f .npmrc

# The production image
FROM node:23.11-alpine@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc
RUN apk add dumb-init
# Reason - https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html#3-optimize-nodejs-tooling-for-production
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
# Reason - https://cheatsheetseries.owasp.org/cheatsheets/NodeJS_Docker_Cheat_Sheet.html#5-properly-handle-events-to-safely-terminate-a-nodejs-docker-web-application
CMD ["dumb-init", "npm", "start"]