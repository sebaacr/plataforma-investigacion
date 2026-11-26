<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { obtenerProyecto, obtenerEtapas, crearEtapa, obtenerParticipaciones } from '../../services/proyectosApi'
import { obtenerTareasProyecto, crearTarea, cambiarEstado, obtenerArchivos } from '../../services/tareasApi'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { registrarHistorial } from '../../services/api'
import { usuario } from '../../sesion'
import CartaGantt from '../../components/CartaGantt.vue'
import TableroTareas from '../../components/TableroTareas.vue'

const route = useRoute()
const id = route.params.id

const proyecto = ref(null)
const etapas = ref([])
const tareas = ref([])
const archivos = ref([])
const usuarios = ref([])
const participaciones = ref([])
const error = ref('')
const mensaje = ref('')

const formEtapa = reactive({ nombre: '', fechaInicio: '', fechaFin: '' })
const formTarea = reactive({ nombre: '', descripcion: '', etapaId: '', responsableId: '', fechaLimite: '', prioridad: 'media' })
const verEtapa = ref(false)
const verTarea = ref(false)

async function cargar() {
  try {
    proyecto.value = await obtenerProyecto(id)
    etapas.value = await obtenerEtapas(id)
    tareas.value = await obtenerTareasProyecto(id)
    archivos.value = await obtenerArchivos()
    usuarios.value = await obtenerUsuarios()
    participaciones.value = await obtenerParticipaciones()
  } catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const integrantes = computed(() => {
  const ids = participaciones.value.filter(p => p.proyectoId === id).map(p => p.usuarioId)
  return usuarios.value.filter(u => ids.includes(u.id) && u.activo)
})

async function agregarEtapa() {
  error.value = ''; mensaje.value = ''
  if (formEtapa.nombre.trim().length < 3) { error.value = 'El nombre de la etapa es muy corto.'; return }
  if (!formEtapa.fechaInicio || !formEtapa.fechaFin || formEtapa.fechaFin < formEtapa.fechaInicio) {
    error.value = 'Revise las fechas de la etapa.'; return
  }
  try {
    await crearEtapa({ proyectoId: id, nombre: formEtapa.nombre.trim(), orden: etapas.value.length + 1,
                       fechaInicio: formEtapa.fechaInicio, fechaFin: formEtapa.fechaFin })
    await registrarHistorial(usuario.value.nombre, 'etapa', `Creó la etapa "${formEtapa.nombre.trim()}"`)
    Object.assign(formEtapa, { nombre: '', fechaInicio: '', fechaFin: '' })
    verEtapa.value = false
    mensaje.value = 'Etapa agregada.'
    await cargar()
  } catch { error.value = 'No fue posible crear la etapa.' }
}

async function asignarTarea() {
  error.value = ''; mensaje.value = ''
  if (formTarea.nombre.trim().length < 3) { error.value = 'El nombre de la tarea es muy corto.'; return }
  if (!formTarea.etapaId || !formTarea.responsableId || !formTarea.fechaLimite) {
    error.value = 'Seleccione etapa, responsable y fecha límite.'; return
  }
  try {
    await crearTarea({ ...formTarea, nombre: formTarea.nombre.trim(), proyectoId: id, estado: 'pendiente' })
    await registrarHistorial(usuario.value.nombre, 'tarea', `Asignó la tarea "${formTarea.nombre.trim()}"`)
    Object.assign(formTarea, { nombre: '', descripcion: '', etapaId: '', responsableId: '', fechaLimite: '', prioridad: 'media' })
    verTarea.value = false
    mensaje.value = 'Tarea asignada. (Versión futura: se enviará un correo al colaborador)'
    await cargar()
  } catch { error.value = 'No fue posible asignar la tarea.' }
}

async function aprobar(tarea) {
  await cambiarEstado(tarea.id, 'cumplida')
  await registrarHistorial(usuario.value.nombre, 'tarea', `Aprobó la tarea "${tarea.nombre}"`)
  await cargar()
}

async function devolver(tarea) {
  if (!confirm(`¿Devolver "${tarea.nombre}" a pendiente?`)) return
  await cambiarEstado(tarea.id, 'pendiente')
  await registrarHistorial(usuario.value.nombre, 'tarea', `Devolvió la tarea "${tarea.nombre}"`)
  await cargar()
}
</script>

<template>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="mensaje" class="exito">{{ mensaje }}</p>

  <template v-if="proyecto">
    <h2>{{ proyecto.titulo }}</h2>

    <div class="titulo-fila">
      <h3>Carta Gantt</h3>
      <button class="boton" @click="verEtapa = !verEtapa">{{ verEtapa ? 'Cerrar' : '+ Nueva etapa' }}</button>
    </div>
    <form v-if="verEtapa" @submit.prevent="agregarEtapa">
      <label>Nombre de la etapa <input v-model="formEtapa.nombre" /></label>
      <label>Fecha de inicio <input v-model="formEtapa.fechaInicio" type="date" /></label>
      <label>Fecha de término <input v-model="formEtapa.fechaFin" type="date" /></label>
      <button class="boton" type="submit">Agregar etapa</button>
    </form>
    <CartaGantt :etapas="etapas" />

    <div class="titulo-fila">
      <h3>Tareas</h3>
      <button class="boton" @click="verTarea = !verTarea">{{ verTarea ? 'Cerrar' : '+ Asignar tarea' }}</button>
    </div>
    <form v-if="verTarea" @submit.prevent="asignarTarea">
      <label>Nombre de la tarea <input v-model="formTarea.nombre" placeholder="Ej: Documento para comité de ética" /></label>
      <label>Descripción <textarea v-model="formTarea.descripcion" rows="2"></textarea></label>
      <label>Etapa
        <select v-model="formTarea.etapaId">
          <option value="">Seleccione</option>
          <option v-for="e in etapas" :key="e.id" :value="e.id">{{ e.orden }}. {{ e.nombre }}</option>
        </select>
      </label>
      <label>Asignar a
        <select v-model="formTarea.responsableId">
          <option value="">Seleccione</option>
          <option v-for="u in integrantes" :key="u.id" :value="u.id">{{ u.nombre }}</option>
        </select>
      </label>
      <label>Fecha límite <input v-model="formTarea.fechaLimite" type="date" /></label>
      <label>Prioridad
        <select v-model="formTarea.prioridad">
          <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
        </select>
      </label>
      <button class="boton" type="submit">Asignar</button>
    </form>

    <TableroTareas :tareas="tareas" :usuarios="usuarios" :archivos="archivos"
                   @aprobar="aprobar" @devolver="devolver" />
  </template>
</template>