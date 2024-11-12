FROM node:20.12 AS development

WORKDIR /usr/src/server

COPY . .

# COPY src/config/.env.example src/config/.env

RUN npm install

# TODO build server! RUN npm run build

CMD ["npm", "run", "start"]