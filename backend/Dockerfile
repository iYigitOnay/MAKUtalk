# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Paket dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

# Tüm kaynak kodunu kopyala ve projeyi derle
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Derlenmiş dosyaları ve gerekli modülleri builder aşamasından kopyala
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Prisma Client'ı runtime ortamı için tekrar oluştur (Platform uyumluluğu için)
RUN npx prisma generate

EXPOSE 3000

# Container başlatıldığında önce veritabanı migration'larını uygula, ardından uygulamayı başlat
CMD ["sh", "-c", "npx prisma migrate deploy && if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]
