<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  obtenerPublicaciones, crearPublicacion, actualizarPublicacion, eliminarPublicacion
} from '../../services/publicacionesApi'
import { obtenerProyectos } from '../../services/proyectosApi'
import { registrarHistorial } from '../../services/api'
import { usuario as yo } from '../../sesion'

const publicaciones = ref([])
const proyectos = ref([])
const error = ref('')
const mensaje = ref('')
const mostrarFormulario = ref(false)
const editandoId = ref(null)
const guardando = ref(false)

const vacio = () => ({
  titulo: '', autores: '', revista: '', anio: new Date().getFullYear(),
  resumen: '', imagenUrl: '', url: '', proyectoId: '', destacada: false
})
const formulario = reactive(vacio())

async function cargar() {
  try {
    publicaciones.value = await obtenerPublicaciones()
    proyectos.value = await obtenerProyectos()
  } catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const ordenadas = computed(() =>
  [...publicaciones.value].sort((a, b) => (Number(b.anio) || 0) - (Number(a.anio) || 0))
)
const cantidadDestacadas = computed(() => publicaciones.value.filter(p => p.destacada).length)
const tituloProyecto = (id) => proyectos.value.find(p => p.id === id)?.titulo || '—'

function esEnlaceWeb(url) {
  try { return ['http:', 'https:'].includes(new URL(url).protocol) } catch { return false }
}

function abrirNueva() {
  Object.assign(formulario, vacio())
  editandoId.value = null
  mostrarFormulario.value = !mostrarFormulario.value
}

function editar(p) {
  Object.assign(formulario, vacio(), p)
  editandoId.value = p.id
  mostrarFormulario.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function guardar() {
  error.value = ''; mensaje.value = ''
  const anio = Number(formulario.anio)
  if (formulario.titulo.trim().length < 5) { error.value = 'El título debe tener al menos 5 caracteres.'; return }
  if (formulario.autores.trim().length < 3) { error.value = 'Ingrese los autores.'; return }
  if (formulario.resumen.trim().length < 20) { error.value = 'El resumen debe tener al menos 20 caracteres.'; return }
  if (!Number.isInteger(anio) || anio < 1950 || anio > new Date().getFullYear() + 1) { error.value = 'Ingrese un año válido.'; return }
  if (!esEnlaceWeb(formulario.url.trim())) { error.value = 'El enlace a la publicación debe comenzar con https://.'; return }
  if (formulario.imagenUrl.trim() && !esEnlaceWeb(formulario.imagenUrl.trim())) {
    error.value = 'El enlace de la imagen de portada debe comenzar con https://.'; return
  }

  guardando.value = true
  const datos = {
    titulo: formulario.titulo.trim(), autores: formulario.autores.trim(), revista: formulario.revista.trim(),
    anio, resumen: formulario.resumen.trim(), imagenUrl: formulario.imagenUrl.trim(), url: formulario.url.trim(),
    proyectoId: formulario.proyectoId, destacada: formulario.destacada
  }
  try {
    if (editandoId.value) {
      await actualizarPublicacion(editandoId.value, datos)
      await registrarHistorial(yo.value.nombre, 'publicacion', `Editó la publicación "${datos.titulo}"`)
      mensaje.value = 'Publicación actualizada.'
    } else {
      await crearPublicacion(datos)
      await registrarHistorial(yo.value.nombre, 'publicacion', `Creó la publicación "${datos.titulo}"`)
      mensaje.value = 'Publicación creada.'
    }
    Object.assign(formulario, vacio())
    editandoId.value = null
    mostrarFormulario.value = false
    await cargar()
  } catch { error.value = 'No fue posible guardar la publicación.' }
  finally { guardando.value = false }
}

async function alternarDestacada(p) {
  try {
    await actualizarPublicacion(p.id, { ...p, destacada: !p.destacada })
    await registrarHistorial(yo.value.nombre, 'publicacion', `${p.destacada ? 'Quitó de' : 'Agregó a'} destacadas "${p.titulo}"`)
    await cargar()
  } catch { error.value = 'No fue posible actualizar la publicación.' }
}

async function eliminar(p) {
  if (!confirm(`¿Eliminar la publicación "${p.titulo}"? Esta acción no se puede deshacer.`)) return
  try {
    await eliminarPublicacion(p.id)
    await registrarHistorial(yo.value.nombre, 'publicacion', `Eliminó la publicación "${p.titulo}"`)
    await cargar()
  } catch { error.value = 'No fue posible eliminar la publicación.' }
}
</script>

<template>
  <div class="titulo-fila">
    <h2>Publicaciones</h2>
    <button class="boton" @click="abrirNueva">{{ mostrarFormulario && !editandoId ? 'Cerrar' : '+ Nueva publicación' }}</button>
  </div>
  <p class="aviso">Las publicaciones destacadas ({{ cantidadDestacadas }}) aparecen en el banner secundario del portal público.</p>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="mensaje" class="exito">{{ mensaje }}</p>

  <form v-if="mostrarFormulario" @submit.prevent="guardar">
    <h3>{{ editandoId ? 'Editar publicación' : 'Nueva publicación' }}</h3>
    <label>Título <input v-model="formulario.titulo" /></label>
    <label>Autores <input v-model="formulario.autores" placeholder="Ej: Ana Pérez, Luis Muñoz" /></label>
    <label>Revista o medio <input v-model="formulario.revista" /></label>
    <label>Año <input v-model="formulario.anio" type="number" min="1950" /></label>
    <label>Resumen del artículo <textarea v-model="formulario.resumen" rows="5" maxlength="3000"></textarea></label>
    <label>Enlace a la publicación <input v-model="formulario.url" type="url" placeholder="https://..." /></label>
    <label>Imagen de portada (enlace, opcional) <input v-model="formulario.imagenUrl" type="url" placeholder="https://.../portada.jpg" /></label>
    <label>Proyecto asociado (opcional)
      <select v-model="formulario.proyectoId">
        <option value="">Ninguno</option>
        <option v-for="p in proyectos" :key="p.id" :value="p.id">{{ p.titulo }}</option>
      </select>
    </label>
    <label class="check"><input v-model="formulario.destacada" type="checkbox" /> Mostrar en el banner de publicaciones destacadas</label>
    <br>
    <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
    <a v-if="editandoId" href="#" style="margin-left:10px" @click.prevent="mostrarFormulario = false; editandoId = null">Cancelar</a>
  </form>

  <p v-if="ordenadas.length === 0">Aún no hay publicaciones.</p>
  <table v-else>
    <thead><tr><th>Título</th><th>Año</th><th>Proyecto</th><th>Destacada</th><th>Acciones</th></tr></thead>
    <tbody>
      <tr v-for="p in ordenadas" :key="p.id">
        <td>{{ p.titulo }}<br><small>{{ p.autores }}</small></td>
        <td>{{ p.anio }}</td>
        <td>{{ p.proyectoId ? tituloProyecto(p.proyectoId) : '—' }}</td>
        <td><button class="estrella" :class="{ activa: p.destacada }" title="Mostrar u ocultar en el banner" @click="alternarDestacada(p)">{{ p.destacada ? '★' : '☆' }}</button></td>
        <td>
          <button class="boton chico" @click="editar(p)">Editar</button>
          <RouterLink :to="`/publicacion/${p.id}`" target="_blank">Ver</RouterLink>
          <button class="boton chico rojo" @click="eliminar(p)">Eliminar</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.estrella { background: none; border: none; font-size: 20px; color: var(--gris); cursor: pointer; padding: 0; }
.estrella.activa { color: var(--amarillo); }
</style>
