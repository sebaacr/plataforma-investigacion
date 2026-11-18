import { solicitud, enviar } from './api'

export const obtenerUsuarios = () => solicitud('/usuarios')
export const obtenerUsuario = (id) => solicitud(`/usuarios/${id}`)
export const crearUsuario = (datos) => enviar('/usuarios', 'POST', datos)
export const actualizarUsuario = (id, datos) => enviar(`/usuarios/${id}`, 'PATCH', datos)

export async function iniciarSesion(correo, password) {
  const lista = await solicitud(`/usuarios?correo=${encodeURIComponent(correo)}`)
  const usuario = lista[0]
  if (!usuario || usuario.password !== password) throw new Error('Correo o contraseña incorrectos')
  if (!usuario.activo) throw new Error('La cuenta está desactivada')
  return { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
}
