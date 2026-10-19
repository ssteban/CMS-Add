# CMS Headless Multi-tenant

CMS headless de código abierto para gestionar contenido de sitios web estáticos desde un panel unificado. Crea campos clave-valor con tipo, publica como JSON y consúmelo desde cualquier frontend mediante API pública con API Key.

---

## Arquitectura

```
Frontend (React + Vite)  ──HTTP──►  Backend (FastAPI)  ──SQL──►  PostgreSQL (Neon)
                                        │
                                   [JWT / API Key]
                                        │
                               Público: GET /api/v1/public/content?api_key=...
```

- **Publicación:** Guardar es distinto a Publicar. "Guardar" persiste los campos en la tabla `components`. "Publicar" arma el JSON final y lo guarda como snapshot en `websites.published_json`.
- **API Key:** Cada proyecto tiene múltiples llaves con prefijo `cms_live_`. Se almacenan hasheadas (SHA-256). El endpoint público recibe la key por query param, la hashea y busca coincidencia.
- **JWT:** Autenticación via JWT (HS256, 24h de expiración) para endpoints privados.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite 8, React Router 7, Lucide |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Base de datos | PostgreSQL (Neon), psycopg2 |
| Auth | JWT (pyjwt), bcrypt, SHA-256 (API keys) |
| Deploy | Vercel (frontend + backend) |

---

## Base de Datos

4 tablas en `backend/migration/model_db.sql`:

```sql
-- Usuarios
users (id_users, username, email, password, created_at, update_at)

-- Proyectos (websites)
websites (id_web, id_users FK, name, url, published_json JSONB, created_at, update_at)

-- API Keys
api_keys (id_key, id_web FK, key_name, api_key_hash UNIQUE, created_at, last_used_at)

-- Campos del editor
components (id_components, id_web FK, key_name, key_label, key_value, key_type, created_at, update_at)
```

2 tablas adicionales en `backend/migration/share_access.sql` (compartir proyectos):

```sql
-- Miembros con acceso de edición a proyectos de otros usuarios
project_members (id_members, id_web FK, id_users FK, created_at, UNIQUE(id_web, id_users))

-- Invitaciones pendientes / respondidas (notificaciones)
project_invitations (id_invitation, id_web FK, id_inviter FK, id_invitee FK, status, created_at, UNIQUE(id_web, id_invitee))
```

Migración extra en `backend/migration/add_published_json.sql` para agregar `published_json` a proyectos existentes.

---

## API Endpoints

### Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/public/content?api_key=...` | Devuelve el JSON publicado (exacto, sin wrapper) |

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Crear cuenta (`username`, `email`, `password`) |
| POST | `/api/v1/auth/login` | Iniciar sesión, devuelve JWT |

### Privados (requieren `Authorization: Bearer <jwt>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/user/proyects` | Listar proyectos |
| POST | `/api/v1/user/create-proyects` | Crear proyecto |
| PUT | `/api/v1/user/proyects/{id}` | Actualizar proyecto |
| GET | `/api/v1/user/proyects/{id}/fields` | Obtener campos del editor |
| PUT | `/api/v1/user/proyects/{id}/fields` | Guardar campos (batch: borra todos e inserta) |
| POST | `/api/v1/user/proyects/{id}/publish` | Publicar JSON (snapshot en `published_json`) |
| GET | `/api/v1/user/proyects/{id}/published-json` | Obtener JSON publicado |
| POST | `/api/v1/user/proyects/{id}/api-keys` | Crear API Key (devuelve `plain_key` una sola vez) |
| GET | `/api/v1/user/proyects/{id}/api-keys` | Listar API Keys (enmascaradas) |
| DELETE | `/api/v1/user/proyects/{id}/api-keys/{key_id}` | Revocar API Key |
| GET | `/api/v1/user/profile` | Obtener perfil del usuario |
| PUT | `/api/v1/user/profile` | Actualizar perfil (`username`, `email`) |
| POST | `/api/v1/user/change-password` | Cambiar contraseña |
| POST | `/api/v1/user/proyects/{id}/share` | Invitar a un usuario por `email` (solo el dueño) |
| GET | `/api/v1/user/notifications` | Invitaciones pendientes del usuario |
| POST | `/api/v1/user/notifications/{id}/accept` | Aceptar invitación (da acceso de edición) |
| POST | `/api/v1/user/notifications/{id}/decline` | Rechazar invitación |

**Permisos:** los endpoints de campos/publicación aceptan al dueño **y** a los
miembros (`project_members`). Las API Keys, editar/eliminar el proyecto y
compartir son exclusivos del dueño.

---

## Compartir Proyectos

El dueño de un proyecto puede invitar a otro usuario (por email registrado) a
**editar el contenido** de ese proyecto:

1. En *Mis Proyectos*, el dueño pulsa **Compartir** y envía una invitación.
2. El invitado recibe una notificación en la campana del navbar con
   **Aceptar** / **Rechazar**.
3. Al aceptar, el proyecto aparece en la lista del invitado con el badge
   **Compartido** y puede editar/guardar/publicar su contenido.

Restricciones para usuarios compartidos: no pueden eliminar el proyecto,
gestionar credenciales API, editarlo (nombre/URL) ni compartirlo. Rechazar una
invitación permite volver a recibir la misma invitación después.

---

## JSON Publicado (estructura de salida)

El editor permite organizar los campos en **módulos**. El JSON publicado expone
los campos agrupados por módulo en `modules`, donde cada módulo es un slug
derivado de su nombre:

```json
{
  "website": "Nombre del Proyecto",
  "schema_version": 1,
  "published_at": "2026-10-18T12:00:00",
  "total_fields": 3,
  "modules": {
    "general": {
      "label": "General",
      "fields": [
        { "key": "titulo", "label": "Título", "value": "Mi Web", "type": "text" }
      ]
    },
    "hero": {
      "label": "Hero",
      "fields": [
        { "key": "logo", "label": "", "value": "https://...", "type": "image" },
        { "key": "color_principal", "label": "Color principal", "value": "#3b82f6", "type": "color" }
      ]
    }
  }
}
```

`label` es la etiqueta legible definida en el editor; si está vacía se usa la
`key`. `published_at` usa formato ISO 8601 (local, sin zona horaria).

Tipos de campo soportados: `text`, `image`, `link`, `color`, `number`, `richtext`, `separator`.
El tipo `separator` es interno del editor (delimita módulos) y no aparece en el JSON publicado.

---

## Getting Started

### Prerrequisitos

- Node.js 20+
- Python 3.11+
- PostgreSQL (o cuenta en [Neon](https://neon.tech))

### Backend

```bash
cd backend
cp .env.example .env   # Completar credenciales DB y SECRET_KEY
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m app.main      # Inicia en http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
cp .env.example .env    # Opcional: VITE_API_URL apunta al backend
npm install
npm run dev             # Inicia en http://localhost:5173
```

### Variables de Entorno

**Backend (`.env`)**

| Variable | Descripción |
|----------|-------------|
| `DB_NAME` | Nombre de la base de datos PostgreSQL |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña |
| `DB_HOST` | Host (ej: `ep-tu-endpoint.neon.tech`) |
| `DB_PORT` | Puerto (usualmente `5432`) |
| `SECRET_KEY` | Clave secreta para firmar JWT |
| `ALGORITHM` | Algoritmo JWT (`HS256`) |

**Frontend**

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend (por defecto `http://127.0.0.1:8000`) |

---

## Estructura del Proyecto

```
cms/
├── frontend/                    # Aplicación React
│   └── src/
│       ├── App.tsx              # Rutas públicas y privadas
│       ├── config.ts            # API_BASE centralizada
│       ├── context/             # AuthContext, ProjectContext
│       ├── components/          # Navbar, Sidebar, Footer, modals, fields
│       ├── layouts/             # MainLayout, DashboardLayout
│       └── pages/               # Home, Login, Register, Dashboard, Projects,
│                                # ProjectEditor, Settings, Docs, Uso
│
├── backend/                     # API FastAPI
│   ├── app/
│   │   ├── main.py              # Punto de entrada, CORS, rutas
│   │   ├── routers/             # auth_route, user_route, field_route, public_route
│   │   ├── models/              # Pydantic schemas
│   │   ├── db/                  # Queries SQL (psycopg2)
│   │   └── utils/               # auth_util (JWT, bcrypt, API keys)
│   ├── migration/               # model_db.sql, add_published_json.sql
│   └── requirements.txt
```

---

## Despliegue

Ambos, frontend y backend, están preparados para deploy en **Vercel**.

- Backend: archivo `vercel.json` en `/backend` con configuración serverless para FastAPI.
- Frontend: build con `npm run build` genera `dist/` listo para static hosting.

El endpoint público no requiere JWT, solo la API Key del proyecto (formato `cms_live_...`).
