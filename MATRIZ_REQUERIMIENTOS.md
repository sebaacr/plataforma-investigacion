# Matriz de requerimientos

Línea base: requerimientos funcionales del documento "Plataforma Integral de Gestión y Seguimiento de Proyectos de Investigación" y acuerdos de la reunión con la contraparte (Nicolás Gómez).

**Avance del hito (50%):** 13 de 24 requerimientos terminados, 7 parciales y 4 pendientes.

| Integrante | Módulo |
|---|---|
| Sebastián Concha | Administrador, matriz y reuniones |
| Benjamín Rozas | Investigador (Gantt y tablero) |
| Germán Cárdenas | Colaborador y datos |
| Pablo Apala | Portal público, login y pruebas |

| ID | Requerimiento | Responsable | Estado | Criterio de aceptación | Evidencia |
|---|---|---|---|---|---|
| RF-01 | Iniciar y cerrar sesión | Pablo | Implementado (Google OIDC) | Solo admite cuentas Google verificadas, activas y registradas; dirige al inicio según rol; "Salir" cierra la sesión; no almacena contraseñas ni tokens de Google | `Login.vue`, `authApp.js`, `sesion.js` |
| RF-02 | Crear, consultar, editar y desactivar cuentas | Sebastián | Terminado | Solo el admin crea cuentas @unach.cl, sin correos repetidos; cambia rol; desactiva sin borrar | `admin/Usuarios.vue` |
| RF-03 | Perfiles con especialidad, institución y proyectos | Sebastián | Parcial | Datos guardados; falta pantalla de perfil | `db.json` (usuarios) |
| RF-04 | Asignar roles y actualizar perfil propio | Sebastián | Parcial | Roles: sí. Edición del perfil propio: pendiente | `admin/Usuarios.vue` |
| RF-05 | Registrar, editar y consultar proyectos | Sebastián | Terminado | Valida título, objetivo, líder obligatorio y fechas coherentes | `admin/FormularioProyecto.vue` |
| RF-06 | Búsqueda, filtros y fichas | Pablo | Terminado | Buscador en portal, filtros por estado y rol, ficha con detalle | `publico/InicioPublico.vue`, `publico/FichaProyecto.vue`, `test/portal.test.js` |
| RF-07 | Publicar solo contenido autorizado | Pablo | Terminado | Un proyecto sin "Publicar" no aparece en el portal ni se abre su ficha | `publico/InicioPublico.vue`, `publico/FichaProyecto.vue`, `test/portal.test.js` |
| RF-08 | Enviar invitaciones | — | Pendiente | Reemplazado por creación de cuentas por el admin; por confirmar con la contraparte | — |
| RF-09 | Aceptar o rechazar invitaciones | — | Pendiente | Depende de RF-08 | — |
| RF-10 | Asignar funciones y consultar integrantes | Benjamín | Parcial | Integrantes visibles en ficha y al asignar; falta pantalla para agregarlos | `db.json` (participaciones) |
| RF-11 | Etapas, hitos, entregables y actividades | Benjamín | Parcial | Etapas con fechas: sí. Hitos: pendiente | `investigador/VistaProyecto.vue` |
| RF-12 | Generar carta Gantt | Benjamín | Terminado | Barras según fechas reales; color según fecha actual | `components/CartaGantt.vue` |
| RF-13 | Actualizar cronograma y ver atrasos | Benjamín | Parcial | Atrasos visibles; falta editar etapas | `services/tareasApi.js` |
| RF-14 | Crear y asignar tareas | Benjamín | Terminado | No se crea sin etapa, responsable y fecha; queda "pendiente"; solo a integrantes | `investigador/VistaProyecto.vue` |
| RF-15 | Actualizar avances y consultar estados | Germán | Terminado | Subir archivo → Por revisar; aprobar → Cumplida; devolver → Pendiente | `colaborador/MisTareas.vue`, `components/TableroTareas.vue` |
| RF-16 | Registrar estudios y pruebas | — | Pendiente | Por confirmar con la contraparte | — |
| RF-17 | Adjuntar, clasificar y descargar documentos | Germán | Parcial | Registro de archivo y versión; subida real a Drive pendiente | `colaborador/MisTareas.vue` |
| RF-18 | Autor y fecha de archivos | Germán | Terminado | Cada archivo guarda `subidoPor`, `subidoEn` y `version` | `db.json` (archivos) |
| RF-19 | Evaluar integración con Google Drive | — | Pendiente | Requiere cuenta institucional | — |
| RF-20 | Proyectos activos, finalizados y pendientes | Sebastián | Terminado | Dashboard muestra la cantidad por estado; al hacer clic se filtra la lista de avance | `Dashboard.vue` |
| RF-21 | Avance, cumplimiento, vencidas y pendientes | Sebastián | Terminado | Contadores por estado de tarea, atrasadas y % de avance por proyecto | `Dashboard.vue` |
| RF-22 | Reportes por proyecto | Sebastián | Parcial | Avance por proyecto; falta reporte exportable | `Dashboard.vue` |
| RF-23 | Registrar cambios con usuario y fecha | Sebastián | Terminado | Cada acción relevante crea un registro en historial | `services/api.js` |
| RF-24 | Consultar historial | Sebastián | Terminado | Tabla ordenada de lo más reciente a lo más antiguo | `admin/Historial.vue` |
