export const BASE = 'http://localhost:3000'

export async function solicitud(ruta, opciones = {}) {
  const respuesta = await fetch(BASE + ruta, opciones)
  if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`)
  if (respuesta.status === 204) return null
  const texto = await respuesta.text()
  return texto ? JSON.parse(texto) : null
}

export const enviar = (ruta, metodo, datos) => solicitud(ruta, {
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos)
})

export const registrarHistorial = (usuario, entidad, accion) => enviar('/historial', 'POST', {
  usuario, entidad, accion, fecha: new Date().toISOString()
})
