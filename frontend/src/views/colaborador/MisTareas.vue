<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerTareasResponsable, cambiarEstado, obtenerArchivos, subirArchivo, estadoVisible, textoPrioridad, pesoPrioridad } from '../../services/tareasApi'
import { obtenerProyectos } from '../../services/proyectosApi'
import { registrarHistorial } from '../../services/api'
import { usuario } from '../../sesion'

const tareas = ref([])
const proyectos = ref([])
const archivos = ref([])
const error = ref('')
const mensaje = ref('')
const subiendo = ref(null)
const archivoElegido = ref(null)

async function cargar() {
  try {
    tareas.value = await obtenerTareasResponsable(usuario.value.id)
    proyectos.value = await obtenerProyectos()
    archivos.value = await obtenerArchivos()
  } catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const tituloDe = (id) => proyectos.value.find(p => p.id === id)?.titulo || ''
const archivoDe = (tareaId) => archivos.value.filter(a => a.tareaId === tareaId).at(-1)
const formato = (f) => f.split('-').reverse().join('/')
const textoEstado = { pendiente: 'Pendiente', por_revisar: 'Por revisar', cumplida: 'Cumplida', atrasada: 'Atrasada' }

// Filtro por estado (incluye "atrasada", que se calcula)
const filtroEstado = ref('todos')

// Tareas filtradas y ordenadas: primero por prioridad (alta > media > baja), luego por fecha límite
const tareasVisibles = computed(() =>
  tareas.value
    .filter(t => filtroEstado.value === 'todos' || estadoVisible(t) === filtroEstado.value)
    .sort((a, b) =>
      (pesoPrioridad[a.prioridad] || 9) - (pesoPrioridad[b.prioridad] || 9) ||
      a.fechaLimite.localeCompare(b.fechaLimite))
)

function elegir(evento) {
  archivoElegido.value = evento.target.files[0] || null
}

async function enviarArchivo(tarea) {
  error.value = ''; mensaje.value = ''
  if (!archivoElegido.value) { error.value = 'Seleccione un archivo.'; return }
  const anteriores = archivos.value.filter(a => a.tareaId === tarea.id).length
  try {
    await subirArchivo({
      tareaId: tarea.id,
      nombre: archivoElegido.value.name,
      driveUrl: 'https://drive.google.com/',
      subidoPor: usuario.value.id,
      subidoEn: new Date().toISOString().slice(0, 10),
      version: anteriores + 1
    })
    await cambiarEstado(tarea.id, 'por_revisar')
    await registrarHistorial(usuario.value.nombre, 'tarea', `Subió archivo a "${tarea.nombre}"`)
    mensaje.value = 'Archivo subido. La tarea quedó "Por revisar".'
    subiendo.value = null
    archivoElegido.value = null
    await cargar()
  } catch { error.value = 'No fue posible subir el archivo.' }
}
</script>

<template>
  <h2>Mis tareas</h2>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="mensaje" class="exito">{{ mensaje }}</p>
  <p v-if="!error && tareas.length === 0">No tienes tareas asignadas.</p>

  <div v-if="tareas.length" class="filtros">
    <select v-model="filtroEstado" style="max-width:200px">
      <option value="todos">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="por_revisar">Por revisar</option>
      <option value="cumplida">Cumplida</option>
      <option value="atrasada">Atrasada</option>
    </select>
  </div>

  <p v-if="tareas.length && tareasVisibles.length === 0">No hay tareas con ese estado.</p>

  <table v-if="tareasVisibles.length">
    <thead><tr><th>Tarea</th><th>Proyecto</th><th>Prioridad</th><th>Vence</th><th>Estado</th><th>Archivo</th><th>Acción</th></tr></thead>
    <tbody>
      <tr v-for="t in tareasVisibles" :key="t.id">
        <td><b>{{ t.nombre }}</b><br><small>{{ t.descripcion }}</small></td>
        <td>{{ tituloDe(t.proyectoId) }}</td>
        <td>
          <span class="prioridad" :class="t.prioridad">{{ textoPrioridad[t.prioridad] || '—' }}</span>
        </td>
        <td>{{ formato(t.fechaLimite) }}</td>
        <td>
          <span class="estado" :class="estadoVisible(t)">{{ textoEstado[estadoVisible(t)] }}</span>
        </td>
        <td>
          <a v-if="archivoDe(t.id)" :href="archivoDe(t.id).driveUrl" target="_blank">
            {{ archivoDe(t.id).nombre }} (v{{ archivoDe(t.id).version }})
          </a>
          <span v-else>—</span>
        </td>
        <td>
          <template v-if="t.estado === 'pendiente'">
            <button v-if="subiendo !== t.id" class="boton chico" @click="subiendo = t.id">Subir archivo</button>
            <div v-else>
              <input type="file" @change="elegir" />
              <button class="boton chico" @click="enviarArchivo(t)">Enviar</button>
              <button class="boton chico gris" @click="subiendo = null">Cancelar</button>
            </div>
          </template>
          <span v-else>—</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
