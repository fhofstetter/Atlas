FROM node:24-alpine

RUN addgroup -S tracker && adduser -S tracker -G tracker

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js server.js storage.js config.js alerts.js \
     currency.js scraper.js shipping.js customs.js \
     deals.js utils.js ./

COPY commands/ ./commands/
COPY views/    ./views/
COPY public/   ./public/

# DATA_DIR, CONFIG_DIR, LOGS_DIR are bind-mounted at runtime via docker-compose
ENV PORT=3456 \
    DATA_DIR=/data \
    CONFIG_DIR=/config \
    LOGS_DIR=/logs \
    NODE_ENV=production

USER tracker

EXPOSE 3456

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3456/api/health || exit 1

CMD ["node", "server.js"]
