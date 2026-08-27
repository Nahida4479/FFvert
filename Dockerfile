FROM node:22-bookworm

RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /FFvert

ENV NODE_OPTIONS="--jitless"

COPY package*.json ./
RUN npm install --maxsockets=1 --jobs=1

COPY . .

RUN mkdir -p uploads

EXPOSE 3003

CMD ["node", "app.js"]
