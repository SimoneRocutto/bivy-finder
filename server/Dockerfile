FROM node:20.12-alpine AS base

WORKDIR /usr/src/server

COPY package.json package-lock.json ./

FROM base AS development

RUN npm install

COPY . .

CMD ["npm", "run", "start"]

FROM base AS production

ENV NODE_ENV=production

RUN npm install

COPY . .

CMD ["npm", "run", "prod"]