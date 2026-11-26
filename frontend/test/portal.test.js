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
