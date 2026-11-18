import { solicitud, enviar } from './api'

export const obtenerTareas = () => solicitud('/tareas')
export const obtenerTareasProyecto = async (proyectoId) =>
  (await obtenerTareas()).filter(t => t.proyectoId === proyectoId)
export const obtenerTareasResponsable = async (usuarioId) =>
  (await obtenerTareas()).filter(t => t.responsableId === usuarioId)
export const crearTarea = (datos) => enviar('/tareas', 'POST', datos)
export const cambiarEstado = (id, estado) => enviar(`/tareas/${id}`, 'PATCH', { estado })

export const obtenerArchivos = () => solicitud('/archivos')
export const subirArchivo = (datos) => enviar('/archivos', 'POST', datos)

export const obtenerHistorial = async () =>
  (await solicitud('/historial')).sort((a, b) => b.fecha.localeCompare(a.fecha))

export function estaAtrasada(tarea) {
  const hoy = new Date().toISOString().slice(0, 10)
  return tarea.estado !== 'cumplida' && tarea.fechaLimite < hoy
}
