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

  <div class="tarjetas">
    <div class="tarjeta"><div class="numero">{{ misProyectos.filter(p => p.estado === 'activo').length }}</div>Proyectos activos</div>
    <div class="tarjeta"><div class="numero">{{ contar('cumplida') }}</div>Tareas cumplidas</div>
    <div class="tarjeta"><div class="numero">{{ contar('por_revisar') }}</div>Por revisar</div>
    <div class="tarjeta"><div class="numero">{{ contar('pendiente') }}</div>Pendientes</div>
    <div class="tarjeta"><div class="numero texto-rojo">{{ atrasadas }}</div>Atrasadas</div>
  </div>

  <h3>Avance por proyecto</h3>
  <div v-for="p in misProyectos" :key="p.id">
    <p>{{ p.titulo }}</p>
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
