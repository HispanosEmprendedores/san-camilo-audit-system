# 📋 San Camilo - Sistema de Gestión de Auditorías

Sistema integral de gestión de auditorías para locales comerciales, desarrollado con React, TypeScript y Supabase.

## 🎯 Descripción del Proyecto

San Camilo es una plataforma moderna que permite auditar locales comerciales de forma digital, con carga de fotos, tracking de checklist y análisis de datos en tiempo real.

## 🚀 Características Principales

- ✅ **Autenticación segura** con Supabase
- - ✅ **Sistema de auditorías** con checklist personalizado
  - - ✅ **Carga de fotos** durante auditorías
    - - ✅ **Dashboard** con estadísticas en tiempo real
      - - ✅ **Reportes** y análisis de tendencias
        - - ✅ **Gestión de locales** por zona geográfica
          - - ✅ **Control de acceso** basado en roles (RLS)
            - - ✅ **Material POP** - Gestión de material publicitario
             
              - ## 🛠️ Stack Tecnológico
             
              - ### Frontend
              - - **React 18** - Librería de UI
                - - **TypeScript** - Tipado estático
                  - - **Vite** - Build tool ultra rápido
                    - - **Tailwind CSS** - Utilidades de estilos
                      - - **Lucide React** - Iconos elegantes
                       
                        - ### Backend
                        - - **Supabase** - PostgreSQL + Auth + Realtime
                          - - **Row Level Security (RLS)** - Seguridad de datos
                           
                            - ## 📁 Estructura del Proyecto
                           
                            - ```
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
                              ├── package.json
                              ├── tsconfig.json
                              ├── vite.config.ts
                              ├── tailwind.config.js
                              └── index.html
                              ```

                              ## 🗄️ Estructura de Base de Datos

                              ### Tablas Principales
                              - **zones** - Zonas geográficas
                              - - **stores** - Locales comerciales
                                - - **user_profiles** - Perfiles y roles de usuarios
                                  - - **checklist_categories** - Categorías del checklist
                                    - - **checklist_items** - Items individuales
                                      - - **audits** - Registros de auditorías
                                        - - **audit_responses** - Respuestas del checklist
                                          - - **audit_photos** - Fotos adjuntas
                                            - - **pop_materials** - Material publicitario disponible
                                              - - **store_inventory** - Inventario por local
                                                - - **material_requests** - Solicitudes de material
                                                 
                                                  - ## 👥 Roles de Usuario
                                                 
                                                  - | Rol | Descripción |
                                                  - |-----|-------------|
                                                  - | **admin** | Acceso completo al sistema |
                                                  - | **supervisor** | Visualiza múltiples locales y reportes |
                                                  - | **encargada** | Solo ve el local asignado |
                                                 
                                                  - ## 🚀 Instalación y Setup
                                                 
                                                  - ### Requisitos
                                                  - - Node.js 18+
                                                    - - npm o yarn
                                                      - - Cuenta de Supabase
                                                       
                                                        - ### Pasos de Instalación
                                                       
                                                        - 1. **Clonar el repositorio**
                                                          2. ```bash
                                                             git clone https://github.com/HispanosEmprendedores/san-camilo-audit-system.git
                                                             cd san-camilo-audit-system
                                                             ```

                                                             2. **Instalar dependencias**
                                                             3. ```bash
                                                                npm install
                                                                ```

                                                                3. **Configurar variables de entorno**
                                                                4. ```bash
                                                                   cp .env.example .env.local
                                                                   ```

                                                                   Edita `.env.local` con tus credenciales de Supabase:
                                                                   ```
                                                                   VITE_SUPABASE_URL=tu_url_supabase
                                                                   VITE_SUPABASE_ANON_KEY=tu_anon_key
                                                                   ```

                                                                   4. **Ejecutar en desarrollo**
                                                                   5. ```bash
                                                                      npm run dev
                                                                      ```

                                                                      La aplicación estará disponible en `http://localhost:5173`

                                                                      ## 🏗️ Desarrollo

                                                                      ### Scripts Disponibles

                                                                      ```bash
                                                                      # Desarrollo
                                                                      npm run dev

                                                                      # Build para producción
                                                                      npm run build

                                                                      # Preview del build
                                                                      npm run preview

                                                                      # Linting
                                                                      npm run lint

                                                                      # Type checking
                                                                      npm run typecheck
                                                                      ```

                                                                      ## 📊 Flujo de Auditoría

                                                                      1. El usuario (encargada) inicia sesión
                                                                      2. 2. Selecciona un local para auditar
                                                                         3. 3. Completa el checklist item por item
                                                                            4. 4. Carga fotos de evidencia
                                                                               5. 5. Envía la auditoría
                                                                                  6. 6. El supervisor puede revisar en el dashboard
                                                                                    
                                                                                     7. ## 🔐 Seguridad
                                                                                    
                                                                                     8. - **RLS Policies** - Usuarios solo ven sus datos
                                                                                        - - **JWT** - Autenticación con tokens
                                                                                          - - **CORS** - Configurado para producción
                                                                                            - - **Validación** - TypeScript + Supabase types
                                                                                             
                                                                                              - ## 📈 Mejoras Futuras
                                                                                             
                                                                                              - - [ ] Exportación de reportes a PDF
                                                                                                - [ ] - [ ] Análisis predictivo de tendencias
                                                                                                - [ ] - [ ] Integración con Google Maps
                                                                                                - [ ] - [ ] Notificaciones en tiempo real
                                                                                                - [ ] - [ ] App móvil nativa
                                                                                               
                                                                                                - [ ] ## 🤝 Contribuciones
                                                                                               
                                                                                                - [ ] Este es un proyecto en desarrollo. Las contribuciones son bienvenidas.
                                                                                               
                                                                                                - [ ] ## 📄 Licencia
                                                                                               
                                                                                                - [ ] MIT License
                                                                                               
                                                                                                - [ ] ## 👨‍💼 Contacto
                                                                                               
                                                                                                - [ ] Para más información, contacta al equipo de desarrollo.
                                                                                               
                                                                                                - [ ] ---
                                                                                               
                                                                                                - [ ] **Última actualización:** Enero 2026
