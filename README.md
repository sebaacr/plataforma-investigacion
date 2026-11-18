# Plataforma de Gestión y Seguimiento de Proyectos de Investigación
**Ingeniería Web · Universidad Adventista de Chile**

- **Equipo:** Sebastián Concha, Germán Cárdenas, Benjamín Rozas, Pablo Apala
- **Contraparte:** Nicolás Gómez
- **Estado:** Prototipo funcional (avance 1)

---

## 1. Objetivo
Aplicación web para centralizar la gestión de proyectos de investigación: portal público tipo "biblioteca", administración de usuarios y proyectos, carta Gantt por etapas, asignación de tareas estilo Trello y dashboard de cumplimiento con enlace a los documentos en Google Drive.

## 2. Tecnologías
- Vue 3 (Composition API: `ref`, `reactive`, `computed`, `onMounted`)
- Vue Router 4 (rutas protegidas por rol)
- Fetch API, centralizado en `src/services/`
- JSON Server (API REST simulada con `db.json`)
- **Siguiente etapa:** backend Express + MySQL (sesiones, bcrypt, roles) e integración con Google Drive y login Google.

## 3. Instalación y ejecución
```bash
cd frontend
npm install
```

Se necesitan **dos terminales** dentro de `frontend`:

**Terminal 1 – API (JSON Server):**
```bash
npm run api
```
Disponible en http://localhost:3000

**Terminal 2 – Frontend (Vite):**
```bash
npm run dev
```
Disponible en http://localhost:5173

## 4. Usuarios de prueba
Contraseña de todos: `1234` (solo prototipo; en el backend real se usará hash bcrypt).

| Rol | Correo |
|---|---|
| Administrador | admin@unach.cl |
| Investigador | aperez@unach.cl, lmunoz@unach.cl |
| Colaborador | jsoto@unach.cl, mlopez@unach.cl |

## 5. Estructura
```
frontend/
├── db.json                 Datos de prueba (según modelo E-R)
└── src/
    ├── sesion.js           Usuario conectado
    ├── router/index.js     Rutas y protección por rol
    ├── services/           Peticiones HTTP (api, usuarios, proyectos, tareas)
    ├── components/         MenuLateral, CartaGantt, TableroTareas
    └── views/
        ├── publico/        InicioPublico, FichaProyecto
        ├── Login.vue
        ├── Dashboard.vue
        ├── admin/          Usuarios, Proyectos, FormularioProyecto, Historial
        ├── investigador/   MisProyectos, VistaProyecto (Gantt + tareas)
        └── colaborador/    MisTareas
```

## 6. Funcionalidades del prototipo
| Rol | Puede |
|---|---|
| Público | Ver proyectos publicados, buscar y ver la ficha (objetivo, investigadores, fase) |
| Administrador | Crear usuarios, cambiar rol, activar/desactivar cuentas; crear y editar proyectos y marcarlos como públicos; ver dashboard e historial |
| Investigador | Ver sus proyectos, agregar etapas a la carta Gantt, asignar tareas, aprobar o devolver tareas |
| Colaborador | Ver sus tareas, subir archivo (la tarea pasa a "Por revisar") |

## 7. Reglas de negocio aplicadas
- RN-01: todo proyecto requiere un investigador responsable.
- RN-07: toda tarea tiene responsable, plazo y estado.
- RN-09: una tarea vencida y no cumplida se muestra como atrasada (se calcula, no se guarda).
- RN-12: el portal solo muestra proyectos marcados como públicos.
- RN-13: los cambios relevantes quedan en el historial.
- RN-16: las cuentas se desactivan, no se eliminan.

## 8. Limitaciones (pendiente para siguientes avances)
- Login simulado contra `db.json` (falta backend con bcrypt y sesiones).
- La subida de archivos solo guarda el nombre; falta integrar la API de Google Drive.
- Envío de correo al asignar tareas: versión futura.
- Por confirmar con la contraparte: si el líder puede crear colaboradores, criterio de % de avance, módulo de estudios y pruebas (RF-16).
