# Plataforma de Gestión y Seguimiento de Proyectos de Investigación
**Ingeniería Web · Universidad Adventista de Chile**

- **Equipo:** Sebastián Concha, Germán Cárdenas, Benjamín Rozas, Pablo Apala
- **Contraparte:** Nicolás Gómez
- **Estado:** Prototipo funcional (avance 1 + retroalimentación N° 1 de la contraparte)

---

## 1. Objetivo
Aplicación web para centralizar la gestión de proyectos de investigación: portal público tipo "biblioteca", administración de usuarios y proyectos, carta Gantt por etapas, asignación de tareas estilo Trello y dashboard de cumplimiento con enlace a los documentos en Google Drive.

## 2. Tecnologías
- Vue 3 (Composition API: `ref`, `reactive`, `computed`, `onMounted`)
- Vue Router 4 (rutas protegidas por rol)
- Fetch API, centralizado en `src/services/`
- JSON Server (API REST simulada con `db.json`)
- Express + `google-auth-library` para validar los ID tokens de Google
- Inicio exclusivo con Google; la aplicación no almacena contraseñas ni tokens de Google
- **Pendiente:** reemplazar JSON Server por persistencia institucional y proteger todas las operaciones del servidor por rol.

## 3. Instalación y ejecución
```bash
cd frontend
npm install
```

1. Copia `frontend/.env.example` a `frontend/.env` y configura `GOOGLE_CLIENT_ID` con un cliente OAuth de tipo aplicación web creado en Google Cloud. Autoriza `http://localhost:5173` como origen JavaScript. El mismo ID se usa en el navegador y en el servidor; no agregues secretos OAuth al frontend.

Se necesitan **tres terminales** dentro de `frontend`:

**Terminal 1 – API de datos (JSON Server):**
```bash
npm run api
```
Disponible en http://localhost:3000

**Terminal 2 – Validación de identidad (Express):**
```bash
npm run auth
```
Disponible en http://localhost:3001. Verifica la firma, audiencia, correo confirmado y nonce del ID token de Google, y permite entrar solo a cuentas activas ya registradas.

**Terminal 3 – Frontend (Vite):**
```bash
npm run dev
```
Disponible en http://localhost:5173

**Pruebas automatizadas:**
```bash
npm test
```
El detalle de las pruebas P1–P10 del portal y del login, con sus evidencias, está en [PRUEBAS.md](PRUEBAS.md).

## 4. Usuarios habilitados de prueba
Para iniciar sesión, usa Google con la misma dirección de correo registrada. No existen contraseñas locales; `db.json` solo contiene perfiles, roles y estado de las cuentas.

| Rol | Correo |
|---|---|
| Administrador | admin@unach.cl |
| Investigador | aperez@unach.cl, lmunoz@unach.cl |
| Colaborador | jsoto@unach.cl, mlopez@unach.cl |

## 5. Estructura
```
database/
├── modelo.sql                  Modelo E-R en MySQL
└── retroalimentacion_1.sql     ODS, artículos, publicaciones, hitos y perfil académico
frontend/
├── db.json                 Datos de prueba (según modelo E-R)
├── public/logos/           Logos institucionales (CREA-EVAS)
└── src/
    ├── sesion.js           Usuario conectado
    ├── router/index.js     Rutas y protección por rol
    ├── data/ods.js         Catálogo de los 17 ODS
    ├── services/           Peticiones HTTP (api, usuarios, proyectos, tareas, publicaciones) y perfil académico
    ├── components/         MenuLateral, CartaGantt, TableroTareas, InsigniaOds
    └── views/
        ├── publico/        InicioPublico, FichaProyecto, Publicacion, PerfilInvestigador
        ├── Login.vue
        ├── Dashboard.vue
        ├── MiPerfil.vue
        ├── admin/          Usuarios, Proyectos, FormularioProyecto, Publicaciones, Historial
        ├── investigador/   MisProyectos, VistaProyecto (equipo, Gantt, hitos y tareas)
        └── colaborador/    MisTareas
```

## 6. Funcionalidades del prototipo
| Rol | Puede |
|---|---|
| Público | Ver el banner de proyectos destacados y el de publicaciones destacadas (cada publicación con su página), buscar proyectos, ver la ficha (resumen, objetivo, co-investigadores, fase, resultados e impacto esperado, ODS y artículos relevantes), el listado de investigadores activos y su perfil académico |
| Administrador | Crear usuarios, cambiar rol, activar/desactivar cuentas y editar su perfil académico; crear y editar proyectos (resumen, resultados, impacto, ODS y hasta 10 artículos), publicarlos y destacarlos; administrar publicaciones; ver dashboard, exportar el reporte CSV e historial |
| Investigador | Ver sus proyectos, agregar co-investigadores y colaboradores, crear y editar etapas, registrar hitos, asignar tareas, aprobar o devolver tareas y editar su perfil |
| Colaborador | Ver sus tareas, subir archivo (la tarea pasa a "Por revisar") y editar su perfil |

## 7. Reglas de negocio aplicadas
- RN-01: todo proyecto requiere un investigador responsable.
- RN-07: toda tarea tiene responsable, plazo y estado.
- RN-09: una tarea vencida y no cumplida se muestra como atrasada (se calcula, no se guarda).
- RN-12: el portal solo muestra proyectos marcados como públicos.
- RN-13: los cambios relevantes quedan en el historial.
- RN-16: las cuentas se desactivan, no se eliminan.

## 8. Limitaciones (pendiente para siguientes avances)
- Las rutas y los datos del sistema siguen siendo un prototipo local con JSON Server. Aunque el servidor de autenticación valida Google, el perfil de sesión y las rutas protegidas del cliente no sustituyen autorización de servidor. No publicar este prototipo como sistema de producción hasta proteger las operaciones de datos y desplegar el backend bajo HTTPS.
- La subida de archivos solo guarda el nombre; falta integrar la API de Google Drive.
- Falta el logo del CDT (se solicitará al profesor Pablo). Los ODS se muestran con su número, nombre y color oficial.
- Las portadas de las publicaciones se ingresan como enlace a una imagen; aún no se suben archivos.
- Envío de correo al asignar tareas: versión futura.
- Por confirmar con la contraparte: si el líder puede crear colaboradores, criterio de % de avance, módulo de estudios y pruebas (RF-16).
