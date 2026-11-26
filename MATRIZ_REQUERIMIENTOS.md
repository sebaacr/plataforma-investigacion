# Matriz de requerimientos

Línea base: requerimientos funcionales del documento "Plataforma Integral de Gestión y Seguimiento de Proyectos de Investigación" y acuerdos de la reunión con la contraparte (Nicolás Gómez).

**Avance del hito:** 19 de 24 requerimientos terminados, 1 parcial y 4 pendientes (incluye la retroalimentación N° 1 de la contraparte).

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
| RF-03 | Perfiles con especialidad, institución y proyectos | Sebastián | Terminado | Perfil académico (facultad, carrera, posgrado, asignaturas, ORCID/ResearchGate) editable por el admin y visible en el perfil público con sus proyectos | `admin/Usuarios.vue`, `publico/PerfilInvestigador.vue` |
| RF-04 | Asignar roles y actualizar perfil propio | Sebastián / Benjamín | Terminado | Roles: admin. Cada investigador o colaborador edita su perfil en "Mi perfil" | `admin/Usuarios.vue`, `MiPerfil.vue` |
| RF-05 | Registrar, editar y consultar proyectos | Sebastián | Terminado | Valida título, objetivo, líder obligatorio y fechas coherentes | `admin/FormularioProyecto.vue` |
| RF-06 | Búsqueda, filtros y fichas | Pablo | Terminado | Buscador en portal, filtros por estado y rol, ficha con detalle | `publico/InicioPublico.vue`, `publico/FichaProyecto.vue`, `test/portal.test.js` |
| RF-07 | Publicar solo contenido autorizado | Pablo | Terminado | Un proyecto sin "Publicar" no aparece en el portal ni se abre su ficha | `publico/InicioPublico.vue`, `publico/FichaProyecto.vue`, `test/portal.test.js` |
| RF-08 | Enviar invitaciones | — | Pendiente | Reemplazado por creación de cuentas por el admin; por confirmar con la contraparte | — |
| RF-09 | Aceptar o rechazar invitaciones | — | Pendiente | Depende de RF-08 | — |
| RF-10 | Asignar funciones y consultar integrantes | Benjamín | Terminado | Agregar co-investigadores y colaboradores; no se puede quitar a quien tiene tareas sin cumplir | `investigador/VistaProyecto.vue` |
| RF-11 | Etapas, hitos, entregables y actividades | Benjamín | Terminado | Etapas con fechas e hitos con fecha y estado cumplido, dibujados en la carta Gantt | `investigador/VistaProyecto.vue`, `components/CartaGantt.vue` |
| RF-12 | Generar carta Gantt | Benjamín | Terminado | Barras según fechas reales; color según fecha actual | `components/CartaGantt.vue` |
| RF-13 | Actualizar cronograma y ver atrasos | Benjamín | Terminado | Atrasos visibles; las etapas se editan desde la carta Gantt (✎) con validación de fechas | `investigador/VistaProyecto.vue` |
| RF-14 | Crear y asignar tareas | Benjamín | Terminado | No se crea sin etapa, responsable y fecha; queda "pendiente"; solo a integrantes | `investigador/VistaProyecto.vue` |
| RF-15 | Actualizar avances y consultar estados | Germán | Terminado | Subir archivo → Por revisar; aprobar → Cumplida; devolver → Pendiente | `colaborador/MisTareas.vue`, `components/TableroTareas.vue` |
| RF-16 | Registrar estudios y pruebas | — | Pendiente | Por confirmar con la contraparte | — |
| RF-17 | Adjuntar, clasificar y descargar documentos | Germán | Parcial | Registro de archivo y versión; subida real a Drive pendiente | `colaborador/MisTareas.vue` |
| RF-18 | Autor y fecha de archivos | Germán | Terminado | Cada archivo guarda `subidoPor`, `subidoEn` y `version` | `db.json` (archivos) |
| RF-19 | Evaluar integración con Google Drive | — | Pendiente | Requiere cuenta institucional | — |
| RF-20 | Proyectos activos, finalizados y pendientes | Sebastián | Terminado | Dashboard muestra la cantidad por estado; al hacer clic se filtra la lista de avance | `Dashboard.vue` |
| RF-21 | Avance, cumplimiento, vencidas y pendientes | Sebastián | Terminado | Contadores por estado de tarea, atrasadas y % de avance por proyecto | `Dashboard.vue` |
| RF-22 | Reportes por proyecto | Sebastián | Terminado | Avance por proyecto y reporte CSV exportable (abre en Excel) según el filtro de estado | `Dashboard.vue` |
| RF-23 | Registrar cambios con usuario y fecha | Sebastián | Terminado | Cada acción relevante crea un registro en historial | `services/api.js` |
| RF-24 | Consultar historial | Sebastián | Terminado | Tabla ordenada de lo más reciente a lo más antiguo | `admin/Historial.vue` |

## Retroalimentación N° 1 de la contraparte (20-11-2026)

Cambios solicitados por el Prof. Nicolás Gómez después del informe de avance N° 1.

| ID | Solicitud | Responsable | Estado | Criterio de aceptación | Evidencia |
|---|---|---|---|---|---|
| RC-01 | Banner de proyectos destacados cambiable por el administrador | Pablo / Sebastián | Terminado | El admin marca proyectos con ★ (solo si están publicados); el portal los muestra en un banner rotativo | `publico/InicioPublico.vue`, `admin/Proyectos.vue` |
| RC-02 | Banner secundario de publicaciones destacadas con página propia (portada, resumen y enlace) | Pablo / Sebastián | Terminado | El admin crea y destaca publicaciones; cada una abre su página con imagen, resumen y "Visitar publicación" | `publico/Publicacion.vue`, `admin/Publicaciones.vue` |
| RC-03 | Listado de investigadores activos | Pablo | Terminado | Solo investigadores activos, con enlace a su perfil | `publico/InicioPublico.vue`, `test/portal.test.js` |
| RC-04 | Resumen, resultados esperados e impacto esperado del proyecto | Sebastián | Terminado | Campos en la edición del proyecto, visibles en la ficha pública | `admin/FormularioProyecto.vue`, `publico/FichaProyecto.vue` |
| RC-05 | Seleccionar los ODS del proyecto con su logo | Sebastián / Germán | Terminado | Selector de los 17 ODS con número, nombre y color oficial | `data/ods.js`, `components/InsigniaOds.vue` |
| RC-06 | Hasta 10 artículos relevantes con título y enlace | Sebastián | Terminado | Máximo 10; cada uno exige título y enlace http(s) | `admin/FormularioProyecto.vue` |
| RC-07 | "Integrantes" pasa a "Co-investigadores" y perfil académico público | Pablo / Benjamín | Terminado | La ficha separa co-investigadores y colaboradores; cada investigador tiene perfil público con filiación y ORCID/ResearchGate | `publico/FichaProyecto.vue`, `publico/PerfilInvestigador.vue` |
| RC-08 | Logos institucionales | Pablo | Parcial | Logo CREA-EVAS incorporado; falta el logo del CDT (solicitar al profesor Pablo) | `public/logos/crea-evas.svg` |
| RC-09 | Modelo de datos para los cambios | Germán | Terminado | Tablas de ODS, artículos, publicaciones, hitos y perfil académico | `database/retroalimentacion_1.sql`, `db.json` |
