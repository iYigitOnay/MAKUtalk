# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npx vite build

# Stage 2: Runtime (Nginx)
FROM nginx:stable-alpine

# Build çıktısını kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Özel Nginx konfigürasyonunu kopyala (SPA hatasını çözer)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
