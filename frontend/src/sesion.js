import { ref } from 'vue'

const guardado = sessionStorage.getItem('usuario')
export const usuario = ref(guardado ? JSON.parse(guardado) : null)

export function guardarSesion(datos) {
  usuario.value = datos
  sessionStorage.setItem('usuario', JSON.stringify(datos))
}

export function cerrarSesion() {
  usuario.value = null
  sessionStorage.removeItem('usuario')
}
