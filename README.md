# Mini Plataforma Fintech

Una solución full-stack robusta diseñada para enrutar, validar y gestionar pagos internos entre cuentas virtuales en pesos. Esta plataforma consta de una **API REST** segura y escalable y una **Interfaz Web en React** diseñada para operadores.

El sistema está arquitecturado con un riguroso enfoque en el **manejo de concurrencia**, la **atomicidad transaccional** y la **eficiencia del rendimiento** mediante la separación de capas y la paginación de datos.

---

## Stack Tecnológico

### Backend
- **Core**: Node.js con Express y TypeScript.
- **ORM**: Prisma ORM (para consultas y migraciones seguras).
- **Base de Datos**: PostgreSQL (para soporte nativo de bloqueos concurrentes y transacciones ACID).
- **Testing**: Jest con `ts-jest` (pruebas unitarias y mocks de persistencia).

### Frontend
- **Core**: React 19 con Vite y TypeScript (optimizaciones de empaquetado mediante *Vendor Chunking*).
- **Gestión de Estado Asíncrono**: React Query (`@tanstack/react-query`) para cacheado y sincronización eficiente con el servidor.
- **Estilos**: Tailwind CSS (extensión personalizada para el *Belo Design System*).
- **Iconos**: Lucide React.
- **Testing**: Vitest con Testing Library y JSDOM.

---

## Cómo Ejecutar el Proyecto

El proyecto está completamente contenerizado mediante **Docker** y orquestado con **Docker Compose**. Puedes iniciar todo el entorno con un solo comando.

### Prerrequisitos
Asegúrate de tener instalados:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Iniciar la Plataforma (Un solo paso)
Abre una terminal en la raíz del proyecto y ejecuta:

```bash
docker-compose up --build -d
```

Este comando descargará las imágenes necesarias, compilará los contenedores del frontend y backend, levantará la base de datos PostgreSQL, ejecutará automáticamente las migraciones pendientes del ORM y sembrará (*seed*) los datos de prueba de manera automática.

### Detener la Plataforma
Para detener los contenedores y liberar recursos:

```bash
docker-compose down
```

---

## Servicios, Puertos y Credenciales

Una vez que Docker Compose termine de levantar los contenedores, los siguientes servicios estarán accesibles:

| Servicio | URL / Host | Puerto | Credenciales por Defecto |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | `http://localhost` | `80` | *Sin credenciales (operador simulado)* |
| **Backend API** | `http://localhost:3000` | `3000` | *Cabeceras de autenticación inyectadas* |
| **Base de Datos** | `localhost` | `5432` | **DB**: Definida en `.env`<br>**Usuario**: Definido en `.env`<br>**Password**: Definido en `.env` |

### Endpoints del Backend
- **Healthcheck**: `GET http://localhost:3000/health` (valida estado de conexión a la BD).
- **Transacciones**: `GET /api/transactions?userId=...&page=1&limit=5`
- **Creación**: `POST /api/transactions`
- **Aprobación**: `PATCH /api/transactions/:id/approve`
- **Rechazo**: `PATCH /api/transactions/:id/reject`

---

## Reglas de Negocio Clave

1. **Autenticación Simulada**: El frontend inyecta automáticamente la cabecera `x-user-id: operator-123` en todas las solicitudes HTTP a través de interceptores de Axios. El operador "Juan Pérez" se visualiza logueado en la interfaz.
2. **Paginación en consultas**: El listado de transacciones se pagina en el servidor utilizando `skip` y `take` de Prisma, retornando los resultados correspondientes y metadatos de paginación (`total`, `page`, `limit`, `totalPages`) para evitar cargas ineficientes de memoria.
3. **Control de Límites**: Las transacciones por montos menores o iguales a $50.000 se confirman y debitan automáticamente. Montos mayores a $50.000 quedan en estado `PENDIENTE` para aprobación o rechazo manual en el panel de operadores sin alterar saldos preliminarmente.
4. **Garantía ACID**: Todos los movimientos de saldo se ejecutan de manera atómica bajo bloqueos exclusivos de filas (`SELECT FOR UPDATE`) para evitar condiciones de carrera concurrentes (Race Conditions) y sobregiros.
