# warranty-app-api

Backend del Cuarto Proyecto Integrador — Backend con NestJS. API REST para **Warranty App**, una aplicación para registrar productos comprados y hacer seguimiento automático del vencimiento de sus garantías.

- **Autor:** Facundo Ferreyra
- **Idea heredada del Segundo Proyecto Integrador:** [warranty-app](https://github.com/FranciscoDevelopment/warranty-app) (React + Vite + Zustand). Este backend reemplaza el `localStorage` de esa entrega por una API real con base de datos, autenticación de usuarios y seguridad.

## Qué hace

El usuario registra productos con su fecha de compra, duración de garantía y categoría, adjuntando opcionalmente el comprobante de compra. La API calcula automáticamente si la garantía está **vigente**, **por vencer** o **vencida**, y permite filtrar los productos por categoría, estado y nombre.

## Tecnologías

- **Framework:** NestJS 12 (ESM + `moduleResolution: nodenext`)
- **Lenguaje:** TypeScript
- **ORM:** Prisma 6, fijado explícitamente en `package.json`
- **Base de datos:** PostgreSQL, gestionada por Supabase
- **Autenticación:** `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` — JWT de access (15 min) y refresh (7 días) con secrets independientes
- **Hasheo:** `bcrypt`
- **Validación:** `class-validator` + `class-transformer`
- **Seguridad:** `helmet`, CORS explícito, `@nestjs/throttler` (rate limiting global y reforzado en `/auth/login` y `/auth/register`)
- **Fechas:** `date-fns`
- **Tests:** Vitest (e2e sobre el flujo de Auth)
- **Package manager:** pnpm

## Instalación

```bash
git clone https://github.com/Facu-Ferreyra/warranty-app-api.git
cd warranty-app-api
pnpm install
pnpm approve-builds   # necesario para compilar el binario nativo de bcrypt
cp .env.example .env  # completar con valores reales, ver tabla abajo
npx prisma migrate dev
pnpm start:dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL. Con Supabase, usar el **Session Pooler** (`postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`) — la conexión directa es IPv6-only y falla en redes que no lo soportan. |
| `JWT_SECRET` | Secret para firmar access tokens. Generar con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `JWT_REFRESH_SECRET` | Secret para firmar refresh tokens. Debe ser **distinto** al anterior. |
| `FRONTEND_URL` | Origen permitido por CORS (ej. `http://localhost:5173`). |
| `PORT` | Opcional, default `3000`. |

## Links

- **Repositorio:** https://github.com/Facu-Ferreyra/warranty-app-api
- **Deploy:** https://warranty-app-api.onrender.com

> El servicio corre en el free tier de Render: si no recibió tráfico en los últimos ~15 minutos, la primera request puede tardar unos segundos extra (cold start).

## Endpoints

### Auth

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| POST | `/auth/register` | Crea un usuario nuevo | No |
| POST | `/auth/login` | Devuelve access y refresh token | No |
| POST | `/auth/refresh` | Renueva el access token (rota el refresh token) | Sí (refresh token) |
| POST | `/auth/logout` | Invalida el refresh token del usuario | Sí (access token) |
| GET | `/auth/me` | Devuelve los datos del usuario autenticado | Sí (access token) |

### Categories

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| POST | `/categories` | Crea una categoría propia | Sí |
| GET | `/categories` | Lista las categorías del usuario | Sí |
| GET | `/categories/:id` | Detalle de una categoría propia | Sí |
| PATCH | `/categories/:id` | Renombra una categoría propia | Sí |
| DELETE | `/categories/:id` | Borra una categoría propia (falla si tiene productos asociados) | Sí |

### Products

| Método | Ruta | Descripción | Protegida |
|---|---|---|---|
| POST | `/products` | Crea un producto (requiere `categoryId` propio) | Sí |
| GET | `/products` | Lista productos propios. Filtros por query: `categoryId`, `status` (`vigente`\|`por_vencer`\|`vencida`), `search` | Sí |
| GET | `/products/:id` | Detalle de un producto propio (incluye `receiptBase64` completo) | Sí |
| PATCH | `/products/:id` | Actualiza un producto propio | Sí |
| DELETE | `/products/:id` | Borra un producto propio | Sí |

Todas las rutas protegidas requieren el header `Authorization: Bearer <accessToken>`.

## Decisiones de diseño relevantes

- **Comprobante de compra:** se persiste en base64 (`receiptBase64`), embebido en la fila de `Product`. El listado (`GET /products`) no devuelve el base64 completo (solo `hasReceipt: boolean`), para no inflar la respuesta; el detalle (`GET /products/:id`) sí lo incluye.
- **`expirationDate` y `status`:** no se persisten como columnas — se calculan en `ProductsService` a partir de `purchaseDate` + `warrantyMonths` en cada consulta, para no desincronizarse del día real.
- **Categorías:** son privadas por usuario, no un catálogo global.

## Tests

```bash
pnpm run test:e2e
```

Cubre el flujo completo de Auth: registro de usuario, login con credenciales válidas, y rechazo de credenciales inválidas.
