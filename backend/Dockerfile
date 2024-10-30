FROM --platform=linux/arm64 node

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4000

CMD [ "npm","run","start"]