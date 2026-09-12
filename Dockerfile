FROM node:22-bookworm

RUN apt-get update && apt-get install -y python3 python3-pip curl unzip && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

WORKDIR /FFvert

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 3003

CMD ["node", "app.js"]
