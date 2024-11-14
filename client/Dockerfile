FROM node:20.12-alpine AS base

WORKDIR /usr/src/client

COPY package.json package-lock.json ./

RUN npm install

COPY . .

FROM base AS development

RUN npm install -g @angular/cli

CMD ["sh", "-c", "npm run docker-dev"]

FROM base AS builder

ARG BUILD_ENVIRONMENT

RUN npm run build

FROM nginx AS production

EXPOSE 80

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /usr/src/client/dist/browser /usr/share/nginx/html