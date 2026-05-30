# Arquitectura del Sistema - Mini Plataforma Fintech

Este documento describe la arquitectura y las decisiones de diseño implementadas en la Mini Plataforma Fintech para garantizar **atomicidad transaccional**, **prevención de condiciones de carrera**, **paginación eficiente** y **separación estricta de responsabilidades**.

---

## 1. Diagrama de Arquitectura y Flujos

El siguiente diagrama ilustra la interacción entre las diferentes capas del sistema, incluyendo la autenticación simulada y la infraestructura de base de datos. También se detalla un flujo de extensión de eventos en tiempo real (Server-Sent Events - SSE):

```mermaid
graph TD
    %% Componentes
    subgraph Cliente [Capa de Cliente (Frontend React + Vite)]
        UI[Componentes UI / Páginas]
        RQ[React Query Cache]
        AX[Axios Client + Interceptor]
    end

    subgraph Servidor [Capa de Servidor (Node.js + Express)]
        R[Rutas REST]
        C[Controladores]
        S[Servicios de Negocio]
        RP[Repositorios]
    end

    subgraph BaseDatos [Capa de Persistencia]
        DB[(PostgreSQL)]
    end

    %% Flujos de Información
    UI -->|Acción del Usuario| RQ
    RQ -->|Invoca Servicio| AX
    AX -->|Petición HTTP + x-user-id| R
    R -->|Enruta Petición| C
    C -->|Parsea page/limit/body| S
    S -->|Reglas de Negocio / ACID Transaction| RP
    RP -->|Consultas Crudas / ORM| DB

    %% Flujos de Concurrencia y Lock
    DB -->|SELECT FOR UPDATE / Bloqueo Fila| RP
    
    %% Flujo Opcional de Eventos en Tiempo Real (SSE)
    S -.->|Publica Evento de Confirmación| SSE[SSE / EventStream Channel]
    SSE -.->|Push Stream en Tiempo Real| UI

    %% Estilos
    style UI fill:#151A23,stroke:#6B00F9,stroke-width:2px,color:#fff
    style AX fill:#151A23,stroke:#00FFB2,stroke-width:2px,color:#fff
    style C fill:#1b2230,stroke:#6B00F9,stroke-width:1px,color:#fff
    style S fill:#1b2230,stroke:#00FFB2,stroke-width:2px,color:#fff
    style RP fill:#1b2230,stroke:#9CA3AF,stroke-width:1px,color:#fff
    style DB fill:#0B0E14,stroke:#FFB200,stroke-width:2px,color:#fff
    style SSE fill:#0B0E14,stroke:#FF3B30,stroke-width:1px,stroke-dasharray: 5 5,color:#fff
```

### Detalle de Flujos Clave

1. **Autenticación Simulada**: Cada petición saliente es interceptada por el cliente Axios (`api.ts`), inyectando el header `x-user-id: operator-123` de forma transparente. El backend está preparado para capturar esta identidad de operador para auditar y autorizar acciones.
2. **Paginación en Servidor**: El controlador captura parámetros `page` y `limit` en peticiones `GET /transactions`. El repositorio ejecuta concurrentemente una consulta paginada (`skip`/`take`) y un conteo (`count`) mediante un bloque `Promise.all` optimizado.
3. **Flujo de Eventos (SSE - Server-Sent Events)**: Diseñado como un canal de salida unidireccional de baja latencia. Cuando una transferencia que superó el límite de $50.000 se aprueba manualmente en la bandeja de entrada del operador, el backend emite un evento de confirmación en tiempo real que el frontend recibe de manera reactiva para recargar el listado de saldos sin necesidad de polling repetitivo.

---

## 2. Justificación de Decisiones Técnicas

### Frontend: Vite + TypeScript y Vendor Chunking
- **Vite**: Elegido frente a bundles tradicionales (como Webpack o Create React App) por su servidor de desarrollo ultra rápido basado en módulos ES nativos (ESM) y compilaciones de producción altamente eficientes mediante Rollup.
- **Vendor Chunking**: Se implementó una estrategia de segmentación de código (*code-splitting*). Al agrupar las dependencias pesadas de terceros (como `@tanstack/react-query`, `react-router-dom`, `axios` y `lucide-react`) en un archivo independiente (`vendor.js`), garantizamos que el navegador del usuario almacene en caché de forma permanente estas librerías estáticas. Cuando actualizamos el código de la aplicación, solo se invalida el archivo ligero de código propietario, reduciendo tiempos de carga subsecuentes a milisegundos.

### Frontend: Tailwind CSS y Belo Design System
- **Tailwind CSS**: Evita el crecimiento indefinido de archivos CSS tradicionales y la duplicación de código mediante clases utilitarias de bajo nivel que se eliminan en producción (*Purge*) si no se utilizan.
- **Belo Design System**: Extendimos el tema de Tailwind y definimos en `theme.ts` las variables `DESIGN_VARIANCE` y `MOTION_INTENSITY`. Esto nos permite desacoplar los estilos visuales fintech premium (efectos de vidrio translúcido/glassmorphism, degradados vibrantes, sombras de luces) y la velocidad de micro-animaciones (escalas en clics e intensidades de cargadores) de los componentes individuales, asegurando coherencia visual absoluta en todas las pantallas.

### Backend: Patrón de Arquitectura Controlador-Servicio-Repositorio
Para el backend de Express, aplicamos estrictamente este patrón de 3 capas:
1. **Controladores**: Encargados únicamente de recibir solicitudes HTTP, validar parámetros de entrada (como parsear tipos de `page`, `limit` y JSON body) y estructurar las respuestas o delegar errores al middleware global.
2. **Servicios (Lógica de Negocio)**: Contiene las reglas del dominio fintech (por ejemplo, validación de saldos suficientes y enrutamiento a estados `PENDIENTE` o `CONFIRMADA` según el monto de la transferencia).
3. **Repositorios (Persistencia)**: Encargados de interactuar directamente con Prisma y la base de datos PostgreSQL. Aislar la persistencia aquí nos otorga dos grandes ventajas:
   - **Mantenimiento de Pruebas Unitarias**: Facilita enormemente mockear las llamadas a base de datos (con herramientas como `jest.mock`) permitiéndonos probar la lógica compleja de negocio del servicio en aislamiento, sin requerir una conexión real de base de datos activa.
   - **Legibilidad de SQL y Locks Pesimistas**: Centraliza sentencias complejas de bloqueo exclusivo de filas (`FOR UPDATE`) ordenadas por ID en un único lugar, evitando la dispersión de código SQL crudo en toda la aplicación.

---

## 3. Manejo de Concurrencia y Atomicidad

El sistema resuelve el requisito transaccional ACID de la siguiente manera:
- **Transacciones de Prisma (`$transaction`)**: Aseguran que las operaciones de débito, crédito y creación de transacciones sean completamente atómicas. Si alguna falla, la base de datos realiza un rollback completo.
- **Bloqueo Pesimista Exclusivo (`FOR UPDATE`)**: Al buscar los usuarios origen y destino, se adquiere un bloqueo exclusivo sobre esas filas en la tabla `User`. Esto previene condiciones de carrera concurrentes (como el doble gasto de saldo desde un mismo origen).
- **Prevención de Deadlocks**: Se ordenan algorítmicamente los IDs de los usuarios de forma alfabética en la consulta `SELECT ... FOR UPDATE` antes de adquirir los bloqueos. Al imponer un orden de bloqueo determinista, se elimina la posibilidad de que dos transacciones concurrentes intenten bloquearse mutuamente.
