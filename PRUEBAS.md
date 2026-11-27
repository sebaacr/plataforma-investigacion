# Pruebas del portal público y del inicio de sesión (P1–P10)

**Responsable:** Pablo Apala · **Módulo:** portal público, login y pruebas

Las pruebas automáticas se ejecutan dentro de `frontend` con:

```bash
npm test
```

Resultado: **26 pruebas, 26 correctas** (`test/portal.test.js`, `test/perfil.test.js` y `test/auth.test.js`).
Las capturas están en [`docs/evidencias/`](docs/evidencias/).

| N° | Requerimiento | Procedimiento | Resultado esperado | Resultado | Evidencia |
|---|---|---|---|---|---|
| P1 | RF-07 / RN-12 | Abrir el portal sin iniciar sesión | Solo aparecen los proyectos marcados "Publicar"; "Calidad del agua en Chillán" (privado) no aparece | Correcto | Prueba "el portal lista solo proyectos publicados…" · [captura](docs/evidencias/p01-portal-publico.png) |
| P2 | RF-06 | Escribir "luis" en el buscador | Aparece solo el proyecto del Dr. Luis Muñoz; la búsqueda no distingue mayúsculas | Correcto | Prueba "busca proyectos publicados por título o investigador…" · [captura](docs/evidencias/p02-busqueda.png) |
| P3 | RF-06 | Elegir "Planificación" en el filtro de fase | Solo aparecen proyectos publicados en esa fase; se combina con el buscador | Correcto | Prueba "el filtro por fase…" · [captura](docs/evidencias/p03-filtro-por-fase.png) |
| P4 | RF-07 | Abrir directamente `/proyecto/3` (proyecto privado) | Muestra "Este proyecto no está publicado." y no muestra datos | Correcto | Prueba "un proyecto privado no se lista…" · [captura](docs/evidencias/p04-proyecto-privado.png) |
| P5 | RC-01 / RC-07 | Ver el banner y abrir la ficha de "Hábitos de estudio" | El banner muestra solo proyectos publicados y destacados; la ficha separa co-investigadores y colaboradores, con resumen, ODS y artículos | Correcto | Pruebas "el banner solo muestra…" y "la ficha separa…" · [captura](docs/evidencias/p05-ficha-coinvestigadores.png) |
| P6 | RC-02 | Hacer clic en una publicación destacada | Se abre su página con autores, revista, año, resumen y "Visitar publicación" | Correcto | Prueba "las publicaciones destacadas se ordenan…" · [captura](docs/evidencias/p06-pagina-publicacion.png) |
| P7 | RC-03 / RC-07 | Abrir `/investigador/3` y luego `/investigador/4` | El investigador muestra su filiación, enlaces y proyectos; un colaborador no tiene perfil público | Correcto | Pruebas "el listado de investigadores…" y "administradores, colaboradores e inactivos…" · [captura 1](docs/evidencias/p07a-perfil-investigador.png) · [captura 2](docs/evidencias/p07b-perfil-colaborador-no-disponible.png) |
| P8 | RF-01 | Iniciar sesión con una cuenta Google verificada y registrada | Entra con su rol; el servidor devuelve solo el perfil de la app (sin tokens de Google) | Correcto | Prueba "acepta un token Google verificado…" · [captura](docs/evidencias/p08-p10-npm-test.png) |
| P9 | RF-01 | Intentar entrar con token inválido, correo no verificado, nonce incorrecto, cuenta inexistente o desactivada | El servidor rechaza el ingreso en todos los casos | Correcto | Pruebas "rechaza tokens inválidos…", "rechaza usuarios inexistentes, desactivados…" y "rechaza solicitudes incompletas…" · [captura](docs/evidencias/p08-p10-npm-test.png) |
| P10 | Seguridad | Guardar un enlace `javascript:alert(1)` como ORCID o artículo | El enlace no se muestra ni se acepta; solo se permiten `http` y `https` | Correcto | Pruebas "solo se aceptan enlaces http y https" y "el perfil rechaza enlaces…" · [captura](docs/evidencias/p08-p10-npm-test.png) |

## Cómo repetir las pruebas manuales

1. Dentro de `frontend`, abrir tres terminales: `npm run api`, `npm run auth` y `npm run dev`.
2. Entrar a http://localhost:5173 sin iniciar sesión y seguir la columna "Procedimiento".
3. Para P8 y P9 se usan las pruebas automáticas, porque el ingreso real requiere una cuenta Google del dominio.
