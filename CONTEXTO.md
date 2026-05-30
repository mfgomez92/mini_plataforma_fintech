# Contexto

Sos parte del equipo de una fintech que ofrece cuentas virtuales en pesos a usuarios. Cada usuario puede tener dinero en su cuenta y enviar pagos a otros usuarios. Tu misión es construir una **API** para enrutar y validar pagos internos, junto con una **interfaz web en React** que le permita a un operador visualizar, crear y gestionar transacciones.

---

## Stack requerido

| Capa | Tecnología |
|---|---|
| Backend | Node.js con Express **o** Fastify (a elección) |
| Base de datos | PostgreSQL (recomendado) |
| Frontend | React (podés usar cualquier librería de componentes) |

---

## Entrega

- Repositorio **público** en GitHub con el código completo.
- El repo debe incluir instrucciones claras para correr el proyecto (README o script de setup).
- Enviá el link del repositorio por email al finalizar.

---

## Parte 1 — API Backend

### Modelos principales

**User**

- `id`
- `nombre`
- `email`
- `saldo`

**Transaction**

- `id`
- `origen` (usuario que envía)
- `destino` (usuario que recibe)
- `monto`
- `estado`: `pendiente` | `confirmada` | `rechazada`
- `motivo_rechazo` *(opcional, para rechazos)*
- `fecha`

---

### Endpoints requeridos

#### `POST /transactions`

Crea una transacción entre dos usuarios.

**Reglas:**

- El origen y destino deben existir.
- El origen debe tener saldo suficiente.
- Si el monto **supera los $50.000** → la transacción queda en estado `pendiente` para verificación manual (no mueve fondos aún).
- Si el monto es **≤ $50.000** → se confirma automáticamente y se debita/acredita de inmediato.

---

#### `GET /transactions?userId=...`

Lista las transacciones de un usuario (como origen o destino), ordenadas por fecha descendente.

---

#### `PATCH /transactions/:id/approve`

Confirma una transacción `pendiente` y realiza el movimiento de fondos.

- Solo aplicable si el estado es `pendiente`.

---

#### `PATCH /transactions/:id/reject`

Rechaza una transacción `pendiente`. No modifica saldos.

- Solo aplicable si el estado es `pendiente`.
- Puede recibir un campo `motivo` en el body.

---

### Reglas de negocio

- Ningún usuario puede quedar con saldo negativo.
- Las transacciones deben ser **atómicas**: si falla el débito o el crédito, no debe quedar un estado parcial.
- No se pueden generar dos transacciones simultáneas del mismo origen que superen su saldo disponible *(manejo de concurrencia)*.
- Cada operación debe quedar registrada con su efecto sobre el saldo.

---

### Requisitos de calidad

- Documentación de la API en **Postman collection** o **Swagger/OpenAPI**.
- **Tests unitarios** al menos de la lógica de negocio de transacciones.
- Script o instrucciones para correr el proyecto y la base de datos fácilmente (Docker Compose es bienvenido).

---

## Parte 2 — Frontend en React

Construí una interfaz web que le permita a un operador gestionar transacciones. Debe ser **funcional y presentable** — podés usar cualquier librería de componentes (MUI, Tailwind, etc.).

### Pantallas / vistas requeridas

#### 1. Dashboard de Transacciones

- Tabla o listado de transacciones de un usuario seleccionado.
- Debe mostrar: origen, destino, monto, estado, fecha.
- Filtro por usuario (podés usar un selector con los usuarios disponibles).
- Las transacciones en estado `pendiente` deben destacarse visualmente.

#### 2. Crear Transacción

- Formulario para crear una nueva transacción.
- Campos: usuario origen, usuario destino, monto.
- Feedback claro al usuario: si la transacción fue confirmada automáticamente o quedó pendiente.
- Manejo de errores (saldo insuficiente, usuario inexistente, etc.).

#### 3. Panel de Aprobación

- Listado de transacciones en estado `pendiente`.
- Acciones por cada transacción: **Aprobar** y **Rechazar**.
- Al rechazar, permitir ingresar un motivo.
- Actualización del estado visible sin recargar la página.

---

### Criterios de evaluación del frontend

- Componentes reutilizables y código organizado.
- Manejo correcto de estados de carga y errores.
- UX clara: el operador entiende qué está pasando en todo momento.
- No es necesario un diseño elaborado, pero sí que sea limpio y consistente.

---

## Lo que vamos a evaluar

### Backend

- Correctitud de la lógica de negocio.
- Manejo de errores y edge cases.
- Atomicidad de las transacciones.
- Manejo de concurrencia.
- Calidad y organización del código.
- Tests.

### Frontend

- Funcionalidad completa de las tres vistas.
- Comunicación correcta con la API.
- Manejo de estados (carga, error, éxito).
- Organización de componentes.
- Claridad visual.

### Criterios transversales

- README claro: cómo correr el proyecto de punta a punta.
- Decisiones técnicas justificadas.
- Arquitectura del código (separación de responsabilidades).

---

## Puntos extra (opcionales)

- Diagrama de arquitectura o de flujo del sistema.
- Emitir un evento (por consola o WebSocket) cada vez que se confirme una transacción, y reflejarlo en el frontend en tiempo real.
- Paginación en el listado de transacciones.
- Autenticación simulada con header `x-user-id` y mostrarlo en la UI como "usuario logueado".
- Docker Compose que levante backend + base de datos con un solo comando.
- Explicación escrita de decisiones clave: elección de framework, ORM, manejo de errores, concurrencia.

---

*Ante cualquier duda sobre el enunciado, tomá la decisión que te parezca más razonable y documentala.*
