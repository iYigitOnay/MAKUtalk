# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build argümanlarını al (API URL gibi)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Kaynak kodunu kopyala ve projeyi build et
COPY . .
RUN npx vite build

# Stage 2: Runtime (Nginx ile servis etme)
FROM nginx:stable-alpine

# Build çıktısını Nginx'in sunacağı dizine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Vue Router için gerekli olan Nginx konfigürasyonunu kopyala (SPA History mode)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
