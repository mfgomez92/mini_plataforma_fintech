# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar manifiestos de dependencias primero (cache de capas)
COPY package.json package-lock.json ./

# Instalar TODAS las dependencias (incluidas devDeps para compilar TS)
RUN npm ci

# Copiar código fuente y schema de Prisma
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Compilar el seed por separado (no está incluido en el tsconfig principal)
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --module commonjs --target es2022 --skipLibCheck

# ============================================
# Stage 2: Production runtime
# ============================================
FROM node:20-alpine

# Instalar dependencias del sistema necesarias en runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar manifiestos e instalar solo dependencias de producción como root, luego cambiar ownership
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar el cliente de Prisma generado desde el builder con ownership adecuado
COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar código compilado con ownership adecuado
COPY --chown=node:node --from=builder /app/dist ./dist

# Copiar schema de Prisma con ownership adecuado
COPY --chown=node:node prisma ./prisma

# Copiar entrypoint con ownership adecuado
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Usar usuario no-root por seguridad
USER node

EXPOSE 3000

# Entrypoint: push schema → seed → start
CMD ["./entrypoint.sh"]
