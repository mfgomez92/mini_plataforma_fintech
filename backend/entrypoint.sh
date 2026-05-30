#!/bin/sh
set -e

echo "🔄 Aplicando schema a la base de datos..."
npx prisma db push --skip-generate

echo "🌱 Ejecutando seed de datos..."
node dist/prisma/seed.js

echo "🚀 Iniciando servidor..."
node dist/server.js
