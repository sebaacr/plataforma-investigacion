export function esProyectoPublico(proyecto) {
  return proyecto?.esPublico === true
}

export function filtrarProyectosPublicos(proyectos, texto, nombreDelResponsable) {
  const consulta = String(texto || '').trim().toLowerCase()
  return proyectos.filter(proyecto => {
    if (!esProyectoPublico(proyecto)) return false
    if (!consulta) return true

    const investigador = nombreDelResponsable(proyecto.liderId) || ''
    return `${proyecto.titulo || ''} ${investigador}`.toLowerCase().includes(consulta)
  })
}
