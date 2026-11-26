import { solicitud, enviar } from './api'
import { esProyectoPublico } from './portalPublico'

export const obtenerProyectos = () => solicitud('/proyectos')
export const obtenerProyectosPublicos = async () =>
  (await solicitud('/proyectos')).filter(esProyectoPublico)
export const obtenerProyecto = (id) => solicitud(`/proyectos/${id}`)
export const crearProyecto = (datos) => enviar('/proyectos', 'POST', datos)
export const actualizarProyecto = (id, datos) => enviar(`/proyectos/${id}`, 'PUT', datos)

export const obtenerParticipaciones = () => solicitud('/participaciones')
export const obtenerEtapas = async (proyectoId) =>
  (await solicitud('/etapas')).filter(e => e.proyectoId === proyectoId)
export const crearEtapa = (datos) => enviar('/etapas', 'POST', datos)
export const actualizarEtapa = (id, datos) => enviar(`/etapas/${id}`, 'PATCH', datos)

export const crearParticipacion = (datos) => enviar('/participaciones', 'POST', datos)
export const eliminarParticipacion = (id) => solicitud(`/participaciones/${id}`, { method: 'DELETE' })

export const obtenerHitos = async (proyectoId) =>
  (await solicitud('/hitos')).filter(h => h.proyectoId === proyectoId)
export const crearHito = (datos) => enviar('/hitos', 'POST', datos)
export const actualizarHito = (id, datos) => enviar(`/hitos/${id}`, 'PATCH', datos)
export const eliminarHito = (id) => solicitud(`/hitos/${id}`, { method: 'DELETE' })
