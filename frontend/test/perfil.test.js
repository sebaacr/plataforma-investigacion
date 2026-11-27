import assert from 'node:assert/strict'
import test from 'node:test'
import { validarPerfil, limpiarPerfil, textoAAsignaturas } from '../src/services/perfilAcademico.js'
import { odsDelProyecto, ODS } from '../src/data/ods.js'

test('el perfil acepta enlaces reales de ORCID y ResearchGate', () => {
  assert.equal(validarPerfil({ orcid: 'https://orcid.org/0000-0002-1825-0097', researchgate: 'https://www.researchgate.net/profile/X' }), '')
  assert.equal(validarPerfil({}), '')
})

test('el perfil rechaza enlaces de otros sitios o sin https', () => {
  assert.notEqual(validarPerfil({ orcid: 'https://orcid.org.falso.com/1' }), '')
  assert.notEqual(validarPerfil({ orcid: 'http://orcid.org/1' }), '')
  assert.notEqual(validarPerfil({ researchgate: 'javascript:alert(1)' }), '')
})

test('las asignaturas escritas con comas se guardan como lista', () => {
  assert.deepEqual(textoAAsignaturas(' Cálculo, , Física '), ['Cálculo', 'Física'])
  assert.deepEqual(limpiarPerfil({ asignaturas: 'A, B', facultad: ' Ingeniería ' }).asignaturas, ['A', 'B'])
  assert.equal(limpiarPerfil({ facultad: ' Ingeniería ' }).facultad, 'Ingeniería')
})

test('el catálogo tiene los 17 ODS y el proyecto muestra solo números válidos y ordenados', () => {
  assert.equal(ODS.length, 17)
  assert.deepEqual(odsDelProyecto({ ods: [10, 4, 99] }).map(o => o.numero), [4, 10])
  assert.deepEqual(odsDelProyecto({}), [])
})
