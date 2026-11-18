import express from 'express'
import { OAuth2Client } from 'google-auth-library'

async function verificarTokenGoogle(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const cliente = new OAuth2Client(clientId)
  const ticket = await cliente.verifyIdToken({ idToken: credential, audience: clientId })
  return ticket.getPayload()
}

async function buscarUsuario(correo) {
  const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '')
  const correoNormalizado = correo.toLowerCase()
  const respuesta = await fetch(`${apiUrl}/usuarios?correo=${encodeURIComponent(correoNormalizado)}`)
  if (!respuesta.ok) throw new Error(`La API de usuarios respondió HTTP ${respuesta.status}.`)
  const usuarios = await respuesta.json()
  return usuarios.find(usuario => usuario.correo.toLowerCase() === correoNormalizado) || null
}

export function crearAuthApp({ verificarToken = verificarTokenGoogle, obtenerUsuario = buscarUsuario } = {}) {
  const app = express()
  app.use(express.json({ limit: '12kb' }))

  app.post('/auth/google', async (req, res) => {
    const { credential, nonce } = req.body || {}
    if (
      typeof credential !== 'string' || credential.length === 0 || credential.length > 10000 ||
      typeof nonce !== 'string' || nonce.length < 32 || nonce.length > 128
    ) {
      return res.status(400).json({ error: 'La credencial de Google no es válida.' })
    }

    let identidad
    try {
      identidad = await verificarToken(credential)
    } catch {
      return res.status(401).json({ error: 'No se pudo validar la identidad de Google.' })
    }

    if (
      !identidad?.email ||
      identidad.email_verified !== true ||
      identidad.nonce !== nonce
    ) {
      return res.status(401).json({ error: 'La identidad de Google no pudo ser confirmada.' })
    }

    let usuario
    try {
      usuario = await obtenerUsuario(identidad.email)
    } catch {
      return res.status(502).json({ error: 'No se pudo consultar el registro institucional.' })
    }

    if (!usuario || !usuario.activo) {
      return res.status(403).json({ error: 'La cuenta no está registrada o se encuentra desactivada.' })
    }
    if (!['admin', 'investigador', 'colaborador'].includes(usuario.rol)) {
      return res.status(403).json({ error: 'La cuenta no tiene un rol habilitado.' })
    }

    return res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    })
  })

  return app
}
