<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  obtenerProyecto, obtenerEtapas, crearEtapa, actualizarEtapa, obtenerParticipaciones,
  crearParticipacion, eliminarParticipacion, obtenerHitos, crearHito, actualizarHito, eliminarHito
} from '../../services/proyectosApi'
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
const hitos = ref([])
const error = ref('')
const mensaje = ref('')

const formEtapa = reactive({ nombre: '', fechaInicio: '', fechaFin: '' })
const formTarea = reactive({ nombre: '', descripcion: '', etapaId: '', responsableId: '', fechaLimite: '', prioridad: 'media' })
const formIntegrante = reactive({ usuarioId: '', funcion: 'coinvestigador' })
const formHito = reactive({ nombre: '', fecha: '' })
const verEtapa = ref(false)
const verTarea = ref(false)
const verIntegrante = ref(false)
const verHito = ref(false)
const etapaEditando = ref(null)

async function cargar() {
  try {
    proyecto.value = await obtenerProyecto(id)
    etapas.value = await obtenerEtapas(id)
    tareas.value = await obtenerTareasProyecto(id)
    archivos.value = await obtenerArchivos()
    usuarios.value = await obtenerUsuarios()
    participaciones.value = await obtenerParticipaciones()
    hitos.value = (await obtenerHitos(id)).sort((a, b) => a.fecha.localeCompare(b.fecha))
  } catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const nombreDe = (usuarioId) => usuarios.value.find(u => u.id === usuarioId)?.nombre || ''
const formato = (f) => f.split('-').reverse().join('/')

const integrantes = computed(() => {
  const ids = participaciones.value.filter(p => p.proyectoId === id).map(p => p.usuarioId)
  return usuarios.value.filter(u => ids.includes(u.id) && u.activo)
})

// RF-10: equipo del proyecto con su función
const equipo = computed(() => participaciones.value.filter(p => p.proyectoId === id))
const disponibles = computed(() => {
  const yaEstan = equipo.value.map(p => p.usuarioId)
  return usuarios.value.filter(u =>
    u.activo && u.rol !== 'admin' && u.id !== proyecto.value?.liderId && !yaEstan.includes(u.id)
  )
})

async function agregarIntegrante() {
  error.value = ''; mensaje.value = ''
  if (!formIntegrante.usuarioId) { error.value = 'Seleccione a la persona que se integra.'; return }
  try {
    await crearParticipacion({
      proyectoId: id, usuarioId: formIntegrante.usuarioId, funcion: formIntegrante.funcion,
      fechaIngreso: new Date().toISOString().slice(0, 10)
    })
    const texto = formIntegrante.funcion === 'coinvestigador' ? 'co-investigador' : 'colaborador'
    await registrarHistorial(usuario.value.nombre, 'proyecto', `Agregó a ${nombreDe(formIntegrante.usuarioId)} como ${texto} en "${proyecto.value.titulo}"`)
    Object.assign(formIntegrante, { usuarioId: '', funcion: 'coinvestigador' })
    verIntegrante.value = false
    mensaje.value = 'Integrante agregado.'
    await cargar()
  } catch { error.value = 'No fue posible agregar al integrante.' }
}

async function quitarIntegrante(participacion) {
  error.value = ''; mensaje.value = ''
  const pendientes = tareas.value.filter(t => t.responsableId === participacion.usuarioId && t.estado !== 'cumplida')
  if (pendientes.length) {
    error.value = `${nombreDe(participacion.usuarioId)} tiene ${pendientes.length} tarea(s) sin cumplir. Reasígnelas antes de quitarlo del equipo.`
    return
  }
  if (!confirm(`¿Quitar a ${nombreDe(participacion.usuarioId)} del proyecto?`)) return
  try {
    await eliminarParticipacion(participacion.id)
    await registrarHistorial(usuario.value.nombre, 'proyecto', `Quitó a ${nombreDe(participacion.usuarioId)} de "${proyecto.value.titulo}"`)
    await cargar()
  } catch { error.value = 'No fue posible quitar al integrante.' }
}

// RF-13: la misma forma sirve para crear o editar una etapa
function editarEtapa(etapa) {
  etapaEditando.value = etapa
  Object.assign(formEtapa, { nombre: etapa.nombre, fechaInicio: etapa.fechaInicio, fechaFin: etapa.fechaFin })
  verEtapa.value = true
}

function cerrarEtapa() {
  verEtapa.value = !verEtapa.value
  etapaEditando.value = null
  Object.assign(formEtapa, { nombre: '', fechaInicio: '', fechaFin: '' })
}

async function guardarEtapa() {
  error.value = ''; mensaje.value = ''
  if (formEtapa.nombre.trim().length < 3) { error.value = 'El nombre de la etapa es muy corto.'; return }
  if (!formEtapa.fechaInicio || !formEtapa.fechaFin || formEtapa.fechaFin < formEtapa.fechaInicio) {
    error.value = 'Revise las fechas de la etapa.'; return
  }
  const datos = { nombre: formEtapa.nombre.trim(), fechaInicio: formEtapa.fechaInicio, fechaFin: formEtapa.fechaFin }
  try {
    if (etapaEditando.value) {
      await actualizarEtapa(etapaEditando.value.id, datos)
      await registrarHistorial(usuario.value.nombre, 'etapa', `Editó la etapa "${datos.nombre}"`)
      mensaje.value = 'Etapa actualizada.'
    } else {
      await crearEtapa({ proyectoId: id, orden: etapas.value.length + 1, ...datos })
      await registrarHistorial(usuario.value.nombre, 'etapa', `Creó la etapa "${datos.nombre}"`)
      mensaje.value = 'Etapa agregada.'
    }
    etapaEditando.value = null
    Object.assign(formEtapa, { nombre: '', fechaInicio: '', fechaFin: '' })
    verEtapa.value = false
    await cargar()
  } catch { error.value = 'No fue posible guardar la etapa.' }
}

// RF-11: hitos del proyecto
async function agregarHito() {
  error.value = ''; mensaje.value = ''
  if (formHito.nombre.trim().length < 3) { error.value = 'El nombre del hito es muy corto.'; return }
  if (!formHito.fecha) { error.value = 'Ingrese la fecha del hito.'; return }
  try {
    await crearHito({ proyectoId: id, nombre: formHito.nombre.trim(), fecha: formHito.fecha, cumplido: false })
    await registrarHistorial(usuario.value.nombre, 'hito', `Creó el hito "${formHito.nombre.trim()}"`)
    Object.assign(formHito, { nombre: '', fecha: '' })
    verHito.value = false
    mensaje.value = 'Hito agregado.'
    await cargar()
  } catch { error.value = 'No fue posible crear el hito.' }
}

async function marcarHito(hito) {
  try {
    await actualizarHito(hito.id, { cumplido: !hito.cumplido })
    await registrarHistorial(usuario.value.nombre, 'hito', `${hito.cumplido ? 'Reabrió' : 'Cumplió'} el hito "${hito.nombre}"`)
    await cargar()
  } catch { error.value = 'No fue posible actualizar el hito.' }
}

async function quitarHito(hito) {
  if (!confirm(`¿Eliminar el hito "${hito.nombre}"?`)) return
  try {
    await eliminarHito(hito.id)
    await registrarHistorial(usuario.value.nombre, 'hito', `Eliminó el hito "${hito.nombre}"`)
    await cargar()
  } catch { error.value = 'No fue posible eliminar el hito.' }
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
      <h3>Equipo</h3>
      <button class="boton" @click="verIntegrante = !verIntegrante">{{ verIntegrante ? 'Cerrar' : '+ Agregar integrante' }}</button>
    </div>
    <form v-if="verIntegrante" @submit.prevent="agregarIntegrante">
      <label>Persona
        <select v-model="formIntegrante.usuarioId">
          <option value="">Seleccione</option>
          <option v-for="u in disponibles" :key="u.id" :value="u.id">{{ u.nombre }} ({{ u.rol }})</option>
        </select>
      </label>
      <label>Función
        <select v-model="formIntegrante.funcion">
          <option value="coinvestigador">Co-investigador</option>
          <option value="colaborador">Colaborador</option>
        </select>
      </label>
      <button class="boton" type="submit">Agregar</button>
    </form>
    <table class="tabla-equipo">
      <thead><tr><th>Nombre</th><th>Función</th><th>Desde</th><th></th></tr></thead>
      <tbody>
        <tr><td>{{ nombreDe(proyecto.liderId) }}</td><td>Investigador responsable</td><td>{{ formato(proyecto.fechaInicio) }}</td><td></td></tr>
        <tr v-for="p in equipo" :key="p.id">
          <td>{{ nombreDe(p.usuarioId) }}</td>
          <td>{{ p.funcion === 'coinvestigador' ? 'Co-investigador' : 'Colaborador' }}</td>
          <td>{{ p.fechaIngreso ? formato(p.fechaIngreso) : '' }}</td>
          <td><button class="boton chico rojo" @click="quitarIntegrante(p)">Quitar</button></td>
        </tr>
      </tbody>
    </table>

    <div class="titulo-fila">
      <h3>Carta Gantt</h3>
      <div>
        <button class="boton" @click="verHito = !verHito">{{ verHito ? 'Cerrar' : '+ Nuevo hito' }}</button>
        <button class="boton" style="margin-left:6px" @click="cerrarEtapa">{{ verEtapa ? 'Cerrar' : '+ Nueva etapa' }}</button>
      </div>
    </div>
    <form v-if="verEtapa" @submit.prevent="guardarEtapa">
      <h4 v-if="etapaEditando">Editando la etapa "{{ etapaEditando.nombre }}"</h4>
      <label>Nombre de la etapa <input v-model="formEtapa.nombre" /></label>
      <label>Fecha de inicio <input v-model="formEtapa.fechaInicio" type="date" /></label>
      <label>Fecha de término <input v-model="formEtapa.fechaFin" type="date" /></label>
      <button class="boton" type="submit">{{ etapaEditando ? 'Guardar cambios' : 'Agregar etapa' }}</button>
    </form>
    <form v-if="verHito" @submit.prevent="agregarHito">
      <label>Nombre del hito <input v-model="formHito.nombre" placeholder="Ej: Aprobación del comité de ética" /></label>
      <label>Fecha <input v-model="formHito.fecha" type="date" /></label>
      <button class="boton" type="submit">Agregar hito</button>
    </form>
    <CartaGantt :etapas="etapas" :hitos="hitos" editable @editar="editarEtapa" />

    <div v-if="hitos.length" class="panel">
      <h4 style="margin-top:0">Hitos</h4>
      <div v-for="h in hitos" :key="h.id" class="hito-fila">
        <label class="check"><input type="checkbox" :checked="h.cumplido" @change="marcarHito(h)" /> {{ h.nombre }}</label>
        <small>{{ formato(h.fecha) }}</small>
        <button class="boton chico gris" @click="quitarHito(h)">Eliminar</button>
      </div>
    </div>

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

<style scoped>
.tabla-equipo { margin-bottom: 20px; }
.hito-fila { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid #eee; }
.hito-fila label { flex: 1; font-weight: normal; }
</style>
