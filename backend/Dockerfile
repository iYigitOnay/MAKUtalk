# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# NestJS bazen dist içinde src oluşturur, onu kontrol edip ana dizine taşıyalım veya start komutunu esnetelim
# Ama en temizi start komutunu Docker içinde özelleştirmektir.

EXPOSE 3000

# Dosya yolunu kontrol ederek çalıştıran esnek komut
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]
