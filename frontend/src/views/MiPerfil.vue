<script setup>
import { reactive, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerUsuario, actualizarUsuario } from '../services/usuariosApi'
import { registrarHistorial } from '../services/api'
import { perfilVacio, validarPerfil, limpiarPerfil } from '../services/perfilAcademico'
import { usuario } from '../sesion'

const formulario = reactive({ ...perfilVacio(), especialidad: '', asignaturasTexto: '' })
const error = ref('')
const mensaje = ref('')
const guardando = ref(false)

onMounted(async () => {
  try {
    const datos = await obtenerUsuario(usuario.value.id)
    Object.assign(formulario, limpiarPerfil(datos), { especialidad: datos.especialidad || '' })
    formulario.asignaturasTexto = formulario.asignaturas.join(', ')
  } catch { error.value = 'No se pudo cargar tu perfil.' }
})

async function guardar() {
  error.value = ''; mensaje.value = ''
  const perfil = limpiarPerfil({ ...formulario, asignaturas: formulario.asignaturasTexto })
  const problema = validarPerfil(perfil)
  if (problema) { error.value = problema; return }

  guardando.value = true
  try {
    await actualizarUsuario(usuario.value.id, { ...perfil, especialidad: formulario.especialidad.trim() })
    await registrarHistorial(usuario.value.nombre, 'usuario', 'Actualizó su perfil académico')
    mensaje.value = 'Perfil actualizado.'
  } catch { error.value = 'No fue posible guardar el perfil.' }
  finally { guardando.value = false }
}
</script>

<template>
  <div class="titulo-fila">
    <h2>Mi perfil</h2>
    <RouterLink v-if="usuario.rol === 'investigador'" :to="`/investigador/${usuario.id}`">Ver mi perfil público ↗</RouterLink>
  </div>
  <p class="aviso">Estos datos se muestran en tu perfil público junto a los proyectos publicados en el portal.</p>

  <form @submit.prevent="guardar">
    <label>Nombre <input :value="usuario.nombre" disabled /></label>
    <label>Especialidad <input v-model="formulario.especialidad" maxlength="100" /></label>
    <label>Facultad / dirección <input v-model="formulario.facultad" maxlength="150" placeholder="Ej: Facultad de Ingeniería" /></label>
    <label>Carrera <input v-model="formulario.carrera" maxlength="150" /></label>
    <label>Programa de posgrado <input v-model="formulario.posgrado" maxlength="150" placeholder="Opcional" /></label>
    <label>Asignaturas <input v-model="formulario.asignaturasTexto" placeholder="Separadas por coma: Cálculo, Física" /></label>
    <label>Perfil ORCID <input v-model="formulario.orcid" type="url" placeholder="https://orcid.org/0000-0000-0000-0000" /></label>
    <label>Perfil ResearchGate <input v-model="formulario.researchgate" type="url" placeholder="https://www.researchgate.net/profile/..." /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="mensaje" class="exito">{{ mensaje }}</p>
    <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
  </form>
</template>
