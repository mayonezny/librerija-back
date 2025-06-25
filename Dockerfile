# 1. Builder stage
FROM node:18-alpine AS builder
WORKDIR /app

# Устанавливаем все зависимости (включая dev)
COPY package.json package-lock.json ./
RUN npm ci

# Копируем исходники и билдим
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY data-source.ts ./
COPY src ./src
RUN npm run build   

# 2. Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем package.json и установленные prod-зависимости
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Копируем только собранный код из builder
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node", "dist/src/main.js"]
