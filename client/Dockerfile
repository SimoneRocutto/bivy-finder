FROM node:20 AS development

ENV NODE_ENV=production

WORKDIR /usr/src/client

COPY . .

RUN npm install

# TODO build client for production! RUN npm run build

CMD ["sh", "-c", "npm start"]