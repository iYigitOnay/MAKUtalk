# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Prisma Client'ı tekrar oluştur
RUN npx prisma generate

EXPOSE 3000

# CMD içinde doğrudan değişkenlerin yüklenmesini bekleyelim
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
