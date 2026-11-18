import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { crearAuthApp } from '../authApp.js'

const nonce = 'a'.repeat(64)
const usuario = {
  id: '3',
  nombre: 'Dra. Ana Pérez',
  correo: 'aperez@unach.cl',
  rol: 'investigador',
  activo: true
}

async function solicitarLogin(app, datos) {
  const servidor = app.listen(0, '127.0.0.1')
  await once(servidor, 'listening')
  try {
    const respuesta = await fetch(`http://127.0.0.1:${servidor.address().port}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    return { status: respuesta.status, body: await respuesta.json() }
  } finally {
    servidor.close()
    await once(servidor, 'close')
  }
}

test('acepta un token Google verificado y retorna solo el perfil de la app', async () => {
  const app = crearAuthApp({
    verificarToken: async credential => ({
      email: 'aperez@unach.cl',
      email_verified: true,
      nonce,
      credential
    }),
    obtenerUsuario: async () => usuario
  })

  const resultado = await solicitarLogin(app, { credential: 'token-google', nonce })

  assert.equal(resultado.status, 200)
  assert.deepEqual(resultado.body, {
    id: '3',
    nombre: 'Dra. Ana Pérez',
    correo: 'aperez@unach.cl',
    rol: 'investigador'
  })
  assert.equal(Object.hasOwn(resultado.body, 'credential'), false)
})

test('rechaza tokens inválidos, correos no verificados y nonces incorrectos', async (t) => {
  const variantes = [
    { verificarToken: async () => { throw new Error('token inválido') }, status: 401 },
    { verificarToken: async () => ({ email: 'aperez@unach.cl', email_verified: false, nonce }), status: 401 },
    { verificarToken: async () => ({ email: 'aperez@unach.cl', email_verified: true, nonce: 'distinto' }), status: 401 }
  ]

  for (const [indice, variante] of variantes.entries()) {
    await t.test(`caso ${indice + 1}`, async () => {
      const resultado = await solicitarLogin(crearAuthApp(variante), {
        credential: 'token-google',
        nonce
      })
      assert.equal(resultado.status, variante.status)
    })
  }
})

test('rechaza usuarios inexistentes, desactivados y roles desconocidos', async (t) => {
  const variantes = [
    { obtenerUsuario: async () => null },
    { obtenerUsuario: async () => ({ ...usuario, activo: false }) },
    { obtenerUsuario: async () => ({ ...usuario, rol: 'desconocido' }) }
  ]

  for (const [indice, variante] of variantes.entries()) {
    await t.test(`caso ${indice + 1}`, async () => {
      const app = crearAuthApp({
        verificarToken: async () => ({ email: usuario.correo, email_verified: true, nonce }),
        ...variante
      })
      const resultado = await solicitarLogin(app, { credential: 'token-google', nonce })
      assert.equal(resultado.status, 403)
    })
  }
})

test('rechaza solicitudes incompletas sin validar el token', async () => {
  const app = crearAuthApp({
    verificarToken: async () => assert.fail('No debe validar una solicitud incompleta')
  })
  const resultado = await solicitarLogin(app, { credential: 'token-google', nonce: 'corto' })
  assert.equal(resultado.status, 400)
})
