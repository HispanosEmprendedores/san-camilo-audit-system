# San Camilo - Sistema de Gestion de Auditorias

Sistema integral de gestion de auditorias para locales comerciales, desarrollado con React, TypeScript y Supabase.

## Descripcion del Proyecto

San Camilo es una plataforma moderna que permite auditar locales comerciales de forma digital, con carga de fotos, tracking de checklist y analisis de datos en tiempo real.

## Caracteristicas Principales

- Autenticacion segura con Supabase
- Sistema de auditorias con checklist personalizado
- Carga de fotos durante auditorias
- Dashboard con estadisticas en tiempo real
- Reportes y analisis de tendencias
- Gestion de locales por zona geografica
- Control de acceso basado en roles (RLS)
- Material POP - Gestion de material publicitario

## Stack Tecnologico

### Frontend

- **React 18** - Libreria de UI
- **TypeScript** - Tipado estatico
- **Vite** - Build tool ultra rapido
- **Tailwind CSS** - Utilidades de estilos
- **Lucide React** - Iconos
- **React Router** - Navegacion SPA

### Backend

- **Supabase** - PostgreSQL + Auth + Realtime
- **Row Level Security (RLS)** - Seguridad de datos

## Estructura del Proyecto

```
san-camilo-audit-system/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Dashboard.tsx
│   │   ├── LoginForm.tsx
│   │   ├── NewAudit.tsx
│   │   ├── AuditHistory.tsx
│   │   ├── Reports.tsx
│   │   └── Stores.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── database.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Estructura de Base de Datos

### Tablas Principales

- **zones** - Zonas geograficas
- **stores** - Locales comerciales
- **user_profiles** - Perfiles y roles de usuarios
- **checklist_categories** - Categorias del checklist
- **checklist_items** - Items individuales
- **audits** - Registros de auditorias
- **audit_responses** - Respuestas del checklist
- **audit_photos** - Fotos adjuntas
- **pop_materials** - Material publicitario disponible
- **store_inventory** - Inventario por local
- **material_requests** - Solicitudes de material

## Roles de Usuario

| Rol | Descripcion |
|-----|-------------|
| **admin** | Acceso completo al sistema |
| **supervisor** | Visualiza multiples locales y reportes |
| **encargada** | Solo ve el local asignado |

## Instalacion y Setup

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalacion

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/HispanosEmprendedores/san-camilo-audit-system.git
   cd san-camilo-audit-system
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` con tus credenciales de Supabase:

   ```
   VITE_SUPABASE_URL=tu_url_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

   La aplicacion estara disponible en `http://localhost:5173`

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para produccion
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

## Flujo de Auditoria

1. El usuario (encargada) inicia sesion
2. Selecciona un local para auditar
3. Completa el checklist item por item
4. Carga fotos de evidencia
5. Envia la auditoria
6. El supervisor puede revisar en el dashboard

## Seguridad

- **RLS Policies** - Usuarios solo ven sus datos
- **JWT** - Autenticacion con tokens
- **CORS** - Configurado para produccion
- **Validacion** - TypeScript + Supabase types

## Mejoras Futuras

- [ ] Exportacion de reportes a PDF
- [ ] Analisis predictivo de tendencias
- [ ] Integracion con Google Maps
- [ ] Notificaciones en tiempo real
- [ ] App movil nativa

## Contribuciones

Este es un proyecto en desarrollo. Las contribuciones son bienvenidas.

## Licencia

MIT License
