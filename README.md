# Mini Plataforma Fintech

Una solución full-stack robusta, escalable y contenerizada para la gestión, validación y procesamiento de pagos internos entre cuentas virtuales en pesos. Esta plataforma consta de una **API REST** de alto rendimiento en el backend y un **Dashboard de Operaciones** web interactivo en el frontend.

El sistema ha sido arquitecturado bajo rigurosos estándares profesionales para garantizar la **atomicidad transaccional**, **prevención de condiciones de carrera y deadlocks**, **paginación eficiente en servidor** y **notificaciones en tiempo real** mediante eventos persistentes.

---

## 🛠️ Stack Tecnológico

A continuación se detallan las tecnologías clave utilizadas para construir las diferentes capas de la plataforma:

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)](https://react-hook-form.com/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-39827B?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## ⚡ Decisiones Técnicas Clave

Para ofrecer una solución de nivel empresarial, se implementaron las siguientes estrategias de diseño y rendimiento:

*   **Bloqueo Pesimista y Prevención de Deadlocks (`SELECT FOR UPDATE`)**: Todos los movimientos de saldo ocurren en transacciones ACID controladas por Prisma ORM. Se aplican bloqueos de fila exclusivos en base de datos. Para evitar interbloqueos (*deadlocks*) concurrentes, los identificadores únicos (UUIDs) de los usuarios involucrados se ordenan algorítmicamente de forma alfabética antes de solicitar el bloqueo.
*   **Actualizaciones en Tiempo Real vía Server-Sent Events (SSE)**: En lugar de saturar el servidor con *polling* constante desde el frontend, el backend abre una conexión HTTP persistente (`text/event-stream`). Al aprobar o rechazar una transacción pendiente, se emite un evento del lado del servidor que invalida automáticamente la caché del frontend en tiempo real.
*   **React Query & Vendor Chunking**: Implementamos `@tanstack/react-query` para la gestión de estados asíncronos en el cliente, optimizando las peticiones de red y cacheando los saldos y transacciones. La compilación de Vite está configurada con *Vendor Chunking* estratégico para aislar librerías pesadas en un bundle persistente en el caché del navegador, reduciendo drásticamente los tiempos de carga iniciales.
*   **Validación Isomórfica con React Hook Form + Zod**: Los formularios del frontend utilizan `react-hook-form` para minimizar re-renders (inputs no controlados) y `zod` para definir esquemas de validación compartibles con el backend. Esto garantiza paridad absoluta de reglas de negocio entre cliente y servidor sin duplicación de lógica, y permite validaciones cruzadas de campos (ej: origen ≠ destino) con mensajes de error contextuales.
*   **Belo Design System**: Extensión de Tailwind CSS con variables unificadas para el diseño visual (`DESIGN_VARIANCE`) y comportamiento de movimiento (`MOTION_INTENSITY`), logrando una UI oscura premium de alto impacto estético, coherente y fácil de mantener.

---

## 🚀 Guía de Ejecución Rápida (A prueba de fallos)

Toda la infraestructura está dockerizada y configurada mediante Docker Compose para levantar en un solo paso, ejecutando automáticamente las migraciones y sembrando la base de datos con datos de prueba.

### Prerrequisitos
Asegúrate de contar con:
- **Docker Engine** (v20.10+)
- **Docker Compose** (v2.0+)

### Pasos para Iniciar la Plataforma

1. **Clonar o ubicarse en la raíz del proyecto**:
   Abre una terminal en la carpeta principal del proyecto (donde se encuentra `docker-compose.yml`).

2. **Ejecutar la orquestación de contenedores**:
   ```bash
   docker-compose up --build -d
   ```
   > [!IMPORTANT]
   > Este comando se encargará de:
   > - Compilar y descargar las imágenes necesarias.
   > - Configurar e iniciar los servicios de **PostgreSQL**, **Backend API** y **Frontend Web (Nginx)**.
   > - Ejecutar el script `entrypoint.sh` en el backend, el cual espera a que la base de datos esté lista, corre las migraciones de Prisma y ejecuta la semilla (*seed*) de datos iniciales.

3. **Verificar el estado de los servicios**:
   ```bash
   docker-compose ps
   ```

### Detener y Limpiar el Entorno
Para detener la ejecución de la plataforma y liberar los puertos locales:
```bash
docker-compose down
```
Si deseas eliminar también los volúmenes persistentes de la base de datos PostgreSQL:
```bash
docker-compose down -v
```

---

## 🔌 Servicios y Credenciales

Una vez completada la inicialización de Docker Compose, los siguientes servicios estarán expuestos:

| Servicio | URL / Host | Puerto | Descripción / Credenciales |
| :--- | :--- | :--- | :--- |
| **Frontend Web Dashboard** | [http://localhost](http://localhost) | `80` | Panel de Operador (simula la sesión de "Juan Pérez"). |
| **Backend REST API** | [http://localhost:3000](http://localhost:3000) | `3000` | API REST para transacciones y eventos SSE. |
| **PostgreSQL Database** | `localhost` | `5432` | Configurado en `.env` (`user`, `password`, `mini_plataforma_fintech`). |

---

## 📡 Endpoints de la API REST

Los endpoints definidos en el código del servidor coinciden con las especificaciones del archivo [openapi.yaml](file:///c:/Users/mfgom/Desktop/mini_plataforma_fintech/openapi.yaml):

### Endpoints del Sistema
*   **Healthcheck**: `GET /health`
    *   *Descripción*: Verifica el estado operativo de la API Express y la conectividad activa con PostgreSQL.
*   **Canal SSE (Server-Sent Events)**: `GET /api/events`
    *   *Descripción*: Establece una conexión persistente unidireccional para notificar cambios de estado en tiempo real.
*   **Usuarios**: `GET /api/users`
    *   *Descripción*: Retorna una lista con todos los usuarios registrados y sus respectivos saldos en la billetera virtual.

### Endpoints de Transacciones
*   **Listar Transacciones**: `GET /api/transactions`
    *   *Query Parameters*:
        *   `userId` (opcional, UUID): Filtra transferencias enviadas o recibidas por un usuario específico.
        *   `estado` (opcional): Filtra por estado actual (`PENDIENTE`, `CONFIRMADA`, `RECHAZADA`).
        *   `page` (opcional, default `1`): Número de página para consulta paginada.
        *   `limit` (opcional, default `10`): Cantidad máxima de registros a retornar.
*   **Crear Transacción**: `POST /api/transactions`
    *   *Request Body (JSON)*:
        ```json
        {
          "origenId": "UUID-Usuario-Origen",
          "destinoId": "UUID-Usuario-Destino",
          "monto": 15000.50
        }
        ```
*   **Aprobar Transacción Pendiente**: `PATCH /api/transactions/{id}/approve`
    *   *Path Parameters*: `id` (UUID de la transacción).
*   **Rechazar Transacción Pendiente**: `PATCH /api/transactions/{id}/reject`
    *   *Path Parameters*: `id` (UUID de la transacción).
    *   *Request Body (JSON, opcional)*:
        ```json
        {
          "motivo": "Excede el límite mensual permitido por el operador."
        }
        ```

---

## 💼 Reglas de Negocio Implementadas

1. **Límites de Aprobación Automática**:
   *   Transacciones **menores o iguales a $50.000**: Se confirman (`CONFIRMADA`) y debitan/acreditan de forma automática e inmediata en un solo paso transaccional.
   *   Transacciones **mayores a $50.000**: Se registran con estado inicial `PENDIENTE` y no impactan los saldos de los usuarios. Deben ser aprobadas o rechazadas manualmente por un operador de operaciones desde el Dashboard.
2. **Autenticación e Identidad**:
   *   El frontend inyecta automáticamente la cabecera `x-user-id: operator-123` en todas sus peticiones mediante interceptores globales de Axios, simulando la sesión de auditoría activa de un operador.
3. **Control y Seguridad Transaccional**:
   *   No se permiten transacciones por montos negativos o iguales a cero.
   *   Un usuario no puede realizar transferencias hacia sí mismo.
   *   El saldo origen es rigurosamente validado antes de confirmar o aprobar cualquier movimiento financiero.

---

## 🧪 Ejecución de Pruebas Unitarias

La plataforma cuenta con una suite completa de pruebas automatizadas para validar la lógica del backend y los componentes clave del frontend.

### Pruebas del Backend (Jest)
Ejecuta las pruebas en aislamiento sobre servicios y controladores:
```bash
# Ubicarse en el directorio del backend
cd backend
# Instalar dependencias locales (si no se está usando Docker)
npm install
# Ejecutar la suite de tests
npm run test
```

### Pruebas del Frontend (Vitest)
Ejecuta las pruebas unitarias y de renderizado de componentes con Vitest y JSDOM:
```bash
# Ubicarse en el directorio del frontend
cd frontend
# Instalar dependencias locales
npm install
# Ejecutar la suite de tests
npm run test
```
