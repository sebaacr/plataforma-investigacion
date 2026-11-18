<script setup>
import { ref, computed, onMounted } from 'vue'
import { obtenerProyectos } from '../services/proyectosApi'
import { obtenerTareas, obtenerArchivos, estaAtrasada } from '../services/tareasApi'
import { obtenerUsuarios } from '../services/usuariosApi'
import { usuario } from '../sesion'

const proyectos = ref([])
const tareas = ref([])
const archivos = ref([])
const usuarios = ref([])
const error = ref('')

onMounted(async () => {
  try {
    proyectos.value = await obtenerProyectos()
    tareas.value = await obtenerTareas()
    archivos.value = await obtenerArchivos()
    usuarios.value = await obtenerUsuarios()
  } catch { error.value = 'No se pudo conectar con la API.' }
})

const misProyectos = computed(() =>
  usuario.value.rol === 'admin'
    ? proyectos.value
    : proyectos.value.filter(p => p.liderId === usuario.value.id)
)
const misTareas = computed(() => {
  const ids = misProyectos.value.map(p => p.id)
  return tareas.value.filter(t => ids.includes(t.proyectoId))
})

const estadosProyecto = [
  { valor: 'activo', texto: 'Activos' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'finalizado', texto: 'Finalizados' }
]
const filtroEstado = ref('todos')

const contarProyectos = (estado) => misProyectos.value.filter(p => p.estado === estado).length

const proyectosFiltrados = computed(() =>
  filtroEstado.value === 'todos'
    ? misProyectos.value
    : misProyectos.value.filter(p => p.estado === filtroEstado.value)
)

function elegirEstado(estado) {
  filtroEstado.value = filtroEstado.value === estado ? 'todos' : estado
}

const contar = (estado) => misTareas.value.filter(t => t.estado === estado).length
const atrasadas = computed(() => misTareas.value.filter(estaAtrasada).length)

function avance(proyectoId) {
  const lista = tareas.value.filter(t => t.proyectoId === proyectoId)
  if (lista.length === 0) return 0
  return Math.round(lista.filter(t => t.estado === 'cumplida').length / lista.length * 100)
}

const cumplidas = computed(() => misTareas.value.filter(t => t.estado === 'cumplida'))
const tituloDe = (id) => proyectos.value.find(p => p.id === id)?.titulo || ''
const nombreDe = (id) => usuarios.value.find(u => u.id === id)?.nombre || ''
const archivoDe = (tareaId) => archivos.value.filter(a => a.tareaId === tareaId).at(-1)
</script>

<template>
  <h2>Dashboard</h2>
  <p v-if="error" class="error">{{ error }}</p>

  <h3>Proyectos por estado</h3>
  <div class="tarjetas">
    <div v-for="e in estadosProyecto" :key="e.valor" class="tarjeta seleccionable"
         :class="{ elegida: filtroEstado === e.valor }" @click="elegirEstado(e.valor)">
      <div class="numero">{{ contarProyectos(e.valor) }}</div>Proyectos {{ e.texto.toLowerCase() }}
    </div>
  </div>

  <h3>Tareas</h3>
  <div class="tarjetas">
    <div class="tarjeta"><div class="numero">{{ contar('cumplida') }}</div>Cumplidas</div>
    <div class="tarjeta"><div class="numero">{{ contar('por_revisar') }}</div>Por revisar</div>
    <div class="tarjeta"><div class="numero">{{ contar('pendiente') }}</div>Pendientes</div>
    <div class="tarjeta"><div class="numero texto-rojo">{{ atrasadas }}</div>Atrasadas</div>
  </div>

  <div class="titulo-fila">
    <h3>Avance por proyecto</h3>
    <a v-if="filtroEstado !== 'todos'" href="#" @click.prevent="filtroEstado = 'todos'">Ver todos</a>
  </div>
  <p v-if="proyectosFiltrados.length === 0">No hay proyectos en este estado.</p>
  <div v-for="p in proyectosFiltrados" :key="p.id">
    <p>{{ p.titulo }} <span class="estado-proyecto" :class="p.estado">{{ p.estado }}</span></p>
    <div class="barra-avance"><div :style="{ width: avance(p.id) + '%' }">{{ avance(p.id) }}%</div></div>
  </div>

  <h3>Tareas cumplidas</h3>
  <p v-if="cumplidas.length === 0">Todavía no hay tareas cumplidas.</p>
  <table v-else>
    <thead><tr><th>Tarea</th><th>Proyecto</th><th>Responsable</th><th>Documento</th></tr></thead>
    <tbody>
      <tr v-for="t in cumplidas" :key="t.id">
        <td>{{ t.nombre }}</td>
        <td>{{ tituloDe(t.proyectoId) }}</td>
        <td>{{ nombreDe(t.responsableId) }}</td>
        <td>
          <a v-if="archivoDe(t.id)" :href="archivoDe(t.id).driveUrl" target="_blank">Ver en Drive ↗</a>
          <span v-else>—</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
