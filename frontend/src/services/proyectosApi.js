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
