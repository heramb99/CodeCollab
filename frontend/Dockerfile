FROM --platform=linux/arm64 node

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD [ "npm","run","dev"]