export function esProyectoPublico(proyecto) {
  return proyecto?.esPublico === true
}

// RF-06: búsqueda por título o investigador y, opcionalmente, filtro por fase actual
export function filtrarProyectosPublicos(proyectos, texto, nombreDelResponsable, fase = '') {
  const consulta = String(texto || '').trim().toLowerCase()
  return proyectos.filter(proyecto => {
    if (!esProyectoPublico(proyecto)) return false
    if (fase && proyecto.faseActual !== fase) return false
    if (!consulta) return true

    const investigador = nombreDelResponsable(proyecto.liderId) || ''
    return `${proyecto.titulo || ''} ${investigador}`.toLowerCase().includes(consulta)
  })
}

// Fases que tienen los proyectos publicados, sin repetir y en orden alfabético
export function fasesDisponibles(proyectos) {
  const fases = proyectos.filter(esProyectoPublico).map(p => p.faseActual).filter(Boolean)
  return [...new Set(fases)].sort((a, b) => a.localeCompare(b, 'es'))
}

// Banner principal: solo proyectos publicados y marcados como destacados por el admin
export function proyectosDestacados(proyectos) {
  return proyectos.filter(p => esProyectoPublico(p) && p.destacado === true)
}

// Banner secundario: publicaciones destacadas, de la más reciente a la más antigua
export function publicacionesDestacadas(publicaciones) {
  return publicaciones
    .filter(p => p.destacada === true)
    .sort((a, b) => (Number(b.anio) || 0) - (Number(a.anio) || 0))
}

// "Dra. Ana Pérez" -> "Ana Pérez", para ordenar y mostrar iniciales sin el título
export const nombreSinTitulo = (nombre) => String(nombre || '').replace(/^(Dra?|Mg|Prof)\.\s*/i, '')

export function investigadoresActivos(usuarios) {
  return usuarios
    .filter(u => u.rol === 'investigador' && u.activo)
    .sort((a, b) => nombreSinTitulo(a.nombre).localeCompare(nombreSinTitulo(b.nombre), 'es'))
}

// Equipo visible en la ficha pública: co-investigadores y colaboradores activos
export function equipoDelProyecto(proyectoId, participaciones, usuarios) {
  const delProyecto = participaciones.filter(p => p.proyectoId === proyectoId)
  const conFuncion = (funcion) => delProyecto
    .filter(p => p.funcion === funcion)
    .map(p => usuarios.find(u => u.id === p.usuarioId))
    .filter(u => u?.activo)
  return { coinvestigadores: conFuncion('coinvestigador'), colaboradores: conFuncion('colaborador') }
}

// Proyectos publicados donde la persona es responsable o co-investigadora
export function proyectosPublicosDe(usuarioId, proyectos, participaciones) {
  const comoCoinvestigador = participaciones
    .filter(p => p.usuarioId === usuarioId && p.funcion === 'coinvestigador')
    .map(p => p.proyectoId)
  return proyectos.filter(p =>
    esProyectoPublico(p) && (p.liderId === usuarioId || comoCoinvestigador.includes(p.id))
  )
}

// Solo tienen perfil público los investigadores activos y los co-investigadores de proyectos publicados
export function tienePerfilPublico(usuario, proyectos, participaciones) {
  if (!usuario?.activo) return false
  if (usuario.rol === 'investigador') return true
  return proyectosPublicosDe(usuario.id, proyectos, participaciones).length > 0
}

// Evita enlaces peligrosos (por ejemplo "javascript:") en datos ingresados por usuarios
export function enlaceSeguro(url) {
  try {
    const u = new URL(String(url || ''))
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''
  } catch { return '' }
}
