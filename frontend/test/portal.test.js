import assert from 'node:assert/strict'
import test from 'node:test'
import { esProyectoPublico, filtrarProyectosPublicos } from '../src/services/portalPublico.js'

const proyectos = [
  { id: '1', titulo: 'Hábitos de estudio', liderId: 'ana', esPublico: true },
  { id: '2', titulo: 'Uso de IA en educación', liderId: 'luis', esPublico: true },
  { id: '3', titulo: 'Calidad del agua', liderId: 'ana', esPublico: false }
]

const nombreDe = (id) => ({ ana: 'Dra. Ana Pérez', luis: 'Dr. Luis Muñoz' })[id]

test('el portal lista solo proyectos publicados, incluso sin texto de búsqueda', () => {
  const resultado = filtrarProyectosPublicos(proyectos, '', nombreDe)
  assert.deepEqual(resultado.map(proyecto => proyecto.id), ['1', '2'])
})

test('busca proyectos publicados por título o investigador sin distinguir mayúsculas', () => {
  assert.deepEqual(
    filtrarProyectosPublicos(proyectos, 'HÁBITOS', nombreDe).map(proyecto => proyecto.id),
    ['1']
  )
  assert.deepEqual(
    filtrarProyectosPublicos(proyectos, 'luis muñoz', nombreDe).map(proyecto => proyecto.id),
    ['2']
  )
})

test('un proyecto privado no se lista ni se considera visible en su ficha', () => {
  const privado = proyectos[2]
  assert.deepEqual(filtrarProyectosPublicos(proyectos, 'calidad del agua', nombreDe), [])
  assert.equal(esProyectoPublico(privado), false)
  assert.equal(esProyectoPublico(null), false)
})

test('un proyecto publicado puede mostrarse en su ficha', () => {
  assert.equal(esProyectoPublico(proyectos[0]), true)
})

import {
  proyectosDestacados, publicacionesDestacadas, investigadoresActivos,
  equipoDelProyecto, proyectosPublicosDe, tienePerfilPublico, enlaceSeguro, nombreSinTitulo, fasesDisponibles
} from '../src/services/portalPublico.js'

test('el banner solo muestra proyectos destacados que además están publicados', () => {
  const lista = [
    { id: '1', esPublico: true, destacado: true },
    { id: '2', esPublico: true, destacado: false },
    { id: '3', esPublico: false, destacado: true }
  ]
  assert.deepEqual(proyectosDestacados(lista).map(p => p.id), ['1'])
})

test('las publicaciones destacadas se ordenan de la más reciente a la más antigua', () => {
  const lista = [
    { id: 'a', anio: 2024, destacada: true },
    { id: 'b', anio: 2026, destacada: true },
    { id: 'c', anio: 2025, destacada: false }
  ]
  assert.deepEqual(publicacionesDestacadas(lista).map(p => p.id), ['b', 'a'])
})

const usuarios = [
  { id: '2', nombre: 'Dra. Ana Pérez', rol: 'investigador', activo: true },
  { id: '3', nombre: 'Dr. Luis Muñoz', rol: 'investigador', activo: true },
  { id: '4', nombre: 'Juan Soto', rol: 'colaborador', activo: true },
  { id: '6', nombre: 'Dr. Inactivo', rol: 'investigador', activo: false },
  { id: '1', nombre: 'Administrador', rol: 'admin', activo: true }
]
const participaciones = [
  { proyectoId: '1', usuarioId: '3', funcion: 'coinvestigador' },
  { proyectoId: '1', usuarioId: '4', funcion: 'colaborador' },
  { proyectoId: '1', usuarioId: '6', funcion: 'coinvestigador' }
]
const publicados = [{ id: '1', liderId: '2', esPublico: true }, { id: '3', liderId: '3', esPublico: false }]

test('el listado de investigadores muestra solo investigadores activos, ordenados sin considerar el título', () => {
  assert.deepEqual(investigadoresActivos(usuarios).map(u => u.id), ['2', '3'])
  assert.equal(nombreSinTitulo('Dra. Ana Pérez'), 'Ana Pérez')
  assert.equal(nombreSinTitulo('Dr. Luis Muñoz'), 'Luis Muñoz')
  assert.equal(nombreSinTitulo('Juan Soto'), 'Juan Soto')
})

test('la ficha separa co-investigadores y colaboradores activos', () => {
  const equipo = equipoDelProyecto('1', participaciones, usuarios)
  assert.deepEqual(equipo.coinvestigadores.map(u => u.id), ['3'])
  assert.deepEqual(equipo.colaboradores.map(u => u.id), ['4'])
})

test('el perfil público lista solo proyectos publicados donde participa como responsable o co-investigador', () => {
  assert.deepEqual(proyectosPublicosDe('3', publicados, participaciones).map(p => p.id), ['1'])
  assert.deepEqual(proyectosPublicosDe('4', publicados, participaciones), [])
})

test('administradores, colaboradores e inactivos no tienen perfil público', () => {
  assert.equal(tienePerfilPublico(usuarios[0], publicados, participaciones), true)
  assert.equal(tienePerfilPublico(usuarios[2], publicados, participaciones), false)
  assert.equal(tienePerfilPublico(usuarios[3], publicados, participaciones), false)
  assert.equal(tienePerfilPublico(usuarios[4], publicados, participaciones), false)
  assert.equal(tienePerfilPublico(null, publicados, participaciones), false)
})

test('el filtro por fase muestra solo proyectos publicados en esa fase y se combina con la búsqueda', () => {
  const lista = [
    { id: '1', titulo: 'Hábitos de estudio', liderId: 'ana', esPublico: true, faseActual: 'Comité de ética' },
    { id: '2', titulo: 'Uso de IA', liderId: 'luis', esPublico: true, faseActual: 'Planificación' },
    { id: '3', titulo: 'Calidad del agua', liderId: 'ana', esPublico: false, faseActual: 'Planificación' },
    { id: '4', titulo: 'Hábitos de sueño', liderId: 'luis', esPublico: true, faseActual: 'Planificación' }
  ]
  assert.deepEqual(filtrarProyectosPublicos(lista, '', nombreDe, 'Planificación').map(p => p.id), ['2', '4'])
  assert.deepEqual(filtrarProyectosPublicos(lista, 'hábitos', nombreDe, 'Planificación').map(p => p.id), ['4'])
  assert.deepEqual(filtrarProyectosPublicos(lista, '', nombreDe, '').map(p => p.id), ['1', '2', '4'])
  assert.deepEqual(fasesDisponibles(lista), ['Comité de ética', 'Planificación'])
})

test('solo se aceptan enlaces http y https', () => {
  assert.equal(enlaceSeguro('https://orcid.org/0000-0002-1825-0097'), 'https://orcid.org/0000-0002-1825-0097')
  assert.equal(enlaceSeguro('javascript:alert(1)'), '')
  assert.equal(enlaceSeguro('no es un enlace'), '')
  assert.equal(enlaceSeguro(''), '')
})
