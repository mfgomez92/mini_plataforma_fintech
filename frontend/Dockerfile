# ============================================
# Stage 1: Build con Vite
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias primero (cache de capas)
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción con Vite
# La baseURL del API se resuelve via nginx reverse proxy (/api -> backend:3000)
RUN npm run build

# ============================================
# Stage 2: Servir con Nginx
# ============================================
FROM nginx:alpine

# Copiar configuración de Nginx (incluye reverse proxy a /api)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados del stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
