import { solicitud, enviar } from './api'

export const obtenerUsuarios = () => solicitud('/usuarios')
export const obtenerUsuario = (id) => solicitud(`/usuarios/${id}`)
export const crearUsuario = (datos) => enviar('/usuarios', 'POST', datos)
export const actualizarUsuario = (id, datos) => enviar(`/usuarios/${id}`, 'PATCH', datos)

export async function iniciarSesion(credential, nonce) {
  const respuesta = await fetch('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, nonce })
  })
  const resultado = await respuesta.json()
  if (!respuesta.ok) {
    throw new Error(resultado.error || `Error HTTP ${respuesta.status}`)
  }
  return resultado
}
