
FROM node:18


WORKDIR /usr/src/app


COPY package*.json ./
RUN npm install


RUN npm install -g ts-node nodemon

COPY . .


EXPOSE 3001


CMD ["npm", "run", "start:dev"]
