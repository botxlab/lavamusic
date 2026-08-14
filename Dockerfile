FROM oven/bun:1

WORKDIR /app

RUN apt-get update && apt-get install -y su-exec && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["bun", "run", "start"]
