# 📚 Book Management System

Sistema de gestión de libros en línea desarrollado con Node.js, TypeScript, Prisma y React.
Permite crear, editar, eliminar y consultar libros, así como gestionar préstamos y reservas.

## 🛠️ Stack Tecnológico

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 6
- **Base de datos:** SQL Server
- **Autenticación:** JWT (JSON Web Tokens)
- **Encriptación:** bcrypt (12 rondas)
- **Documentación:** Swagger (OpenAPI 3.0)
- **Logs:** Winston (archivo + consola)

### Frontend
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **HTTP Client:** Axios
- **Routing:** React Router DOM

### Patrones de Diseño
- **Service Layer:** Lógica de negocio separada de los controladores
- **Singleton:** Instancia única de Prisma Client y Winston Logger
- **Middleware:** Autenticación JWT como interceptor de peticiones
- **Repository (implícito):** Prisma actúa como capa de acceso a datos
- **Transaction:** Operaciones atómicas en préstamos y reservas

---

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **SQL Server** instalado y corriendo (local o remoto)
- **npm** v9 o superior

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/EdgMon92/book-management-system
cd book-management-system
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

Crear el archivo `.env` en la carpeta `backend`:
```env
DATABASE_URL=sqlserver://localhost:1433;database=BookSystemDB;user=sa;password=Admin123;encrypt=true;trustServerCertificate=true
PORT=3000
JWT_SECRET="SuperSecretoParaElSistemaDeLibros2026"
```

### 3. Crear la base de datos y tablas

Asegúrarse de que SQL Server esté corriendo y que la base de datos `BookSystemDB` exista. Luego ejecutar:
```bash
npx prisma generate
npx prisma db push
```

### 4. Iniciar el Backend
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### 5. Configurar el Frontend

Abrir una **nueva terminal**:
```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 📖 Documentación de la API (Swagger)

Con el backend corriendo, acceder a:
```
http://localhost:3000/api/docs
```

Allí se encontrará la documentación interactiva de todos los endpoints con la posibilidad de probarlos directamente.

---

## 🔗 Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/profile` | Ver mi perfil | Sí |

### Libros (`/api/books`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/books` | Listar libros (paginación, filtros, ordenamiento) | No |
| GET | `/api/books/:id` | Detalle de un libro | No |
| POST | `/api/books` | Crear libro | Sí |
| PUT | `/api/books/:id` | Actualizar libro | Sí |
| DELETE | `/api/books/:id` | Eliminar libro | Sí |

**Parámetros de consulta para el listado:**
- `page` - Número de página (default: 1)
- `limit` - Cantidad por página (default: 10)
- `search` - Buscar en título y autor
- `author` - Filtrar por autor
- `status` - Filtrar por estado (disponible, reservado, prestado)
- `year` - Filtrar por año de publicación
- `sortBy` - Ordenar por campo (title, author, publicationYear, status, createdAt)
- `sortOrder` - Dirección (asc, desc)

### Préstamos (`/api/loans`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/loans` | Listar todos los préstamos | Sí |
| GET | `/api/loans/my` | Ver mis préstamos activos | Sí |
| POST | `/api/loans` | Solicitar préstamo (14 días) | Sí |
| PATCH | `/api/loans/:id/return` | Devolver libro | Sí |

### Reservas (`/api/reservations`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reservations` | Listar todas las reservas | Sí |
| GET | `/api/reservations/my` | Ver mis reservas activas | Sí |
| POST | `/api/reservations` | Reservar libro (3 días) | Sí |
| PATCH | `/api/reservations/:id/cancel` | Cancelar reserva | Sí |
| PATCH | `/api/reservations/:id/complete` | Completar reserva → crea préstamo | Sí |

---

## 🗄️ Modelo de Datos

### User (usuarios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| name | String | Nombre del usuario |
| email | String | Email único |
| password | String | Hash bcrypt |
| role | String | Rol (admin, user) |

### Book (libros)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| title | String | Título del libro |
| author | String | Autor del libro |
| publicationYear | Int | Año de publicación |
| status | String | disponible, reservado, prestado |

### Loan (préstamos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| bookId | Int | FK → Book |
| userId | Int | FK → User |
| loanDate | DateTime | Fecha del préstamo |
| dueDate | DateTime | Fecha de vencimiento (14 días) |
| returnDate | DateTime? | Fecha de devolución |
| status | String | activo, devuelto, vencido |

### Reservation (reservas)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID autoincremental |
| bookId | Int | FK → Book |
| userId | Int | FK → User |
| reservationDate | DateTime | Fecha de la reserva |
| expirationDate | DateTime | Vence en 3 días |
| status | String | activa, cancelada, completada |

---

## 🏗️ Arquitectura del Proyecto
```
book-management-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelos de datos
│   ├── src/
│   │   ├── config/
│   │   │   └── swagger.ts         # Configuración Swagger
│   │   ├── controllers/           # Controladores
│   │   │   ├── auth.controller.ts
│   │   │   ├── book.controller.ts
│   │   │   ├── loan.controller.ts
│   │   │   └── reservation.controller.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # Verificación JWT
│   │   ├── routes/                
│   │   │   ├── auth.routes.ts
│   │   │   ├── book.routes.ts
│   │   │   ├── loan.routes.ts
│   │   │   └── reservation.routes.ts
│   │   ├── services/              # Lógica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── book.service.ts
│   │   │   ├── loan.service.ts
│   │   │   └── reservation.service.ts
│   │   ├── utils/
│   │   │   ├── logger.ts          # Winston logger
│   │   │   └── prisma.ts          # Cliente Prisma 
│   │   └── app.ts                 # Punto de entrada
│   ├── logs/                      # Archivos de log generados
│   ├── .env                       # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Estado global de autenticación
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Books.tsx
│   │   │   ├── Loans.tsx
│   │   │   └── Reservations.tsx
│   │   ├── services/
│   │   │   └── api.ts             # Cliente Axios configurado
│   │   ├── App.tsx                # Rutas y layout
│   │   ├── main.tsx               # Punto de entrada
│   │   └── index.css              # Estilos globales
│   └── package.json
└── README.md
```

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rondas de salt)
- Autenticación mediante **JWT** con expiración de 24 horas
- Endpoints de escritura protegidos (crear, editar, eliminar)
- Endpoints de lectura públicos (listar y ver detalle de libros)
- Validación de datos en controladores antes de procesar
- **CORS** habilitado solo para el frontend

---

## 📊 Trazabilidad (Logs)

El sistema registra eventos críticos usando **Winston**:

- **Registro de usuarios** (exitoso y duplicado)
- **Inicio de sesión** (exitoso y fallido)
- **CRUD de libros** (creación, actualización, eliminación)
- **Préstamos** (creación y devolución)
- **Reservas** (creación, cancelación y completado)

Los logs se almacenan en:
- `logs/app.log` → Todos los eventos
- `logs/error.log` → Solo errores
- **Consola**
