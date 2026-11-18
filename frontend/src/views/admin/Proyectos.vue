<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerProyectos } from '../../services/proyectosApi'
import { obtenerUsuarios } from '../../services/usuariosApi'

const proyectos = ref([])
const usuarios = ref([])
const buscando = ref('')
const filtroEstado = ref('todos')
const error = ref('')

onMounted(async () => {
  try {
    proyectos.value = await obtenerProyectos()
    usuarios.value = await obtenerUsuarios()
  } catch { error.value = 'No se pudo conectar con la API.' }
})

const nombreDe = (id) => usuarios.value.find(u => u.id === id)?.nombre || '—'

const filtrados = computed(() => {
  const texto = buscando.value.trim().toLowerCase()
  return proyectos.value.filter(p =>
    p.titulo.toLowerCase().includes(texto) &&
    (filtroEstado.value === 'todos' || p.estado === filtroEstado.value)
  )
})
</script>

<template>
  <div class="titulo-fila">
    <h2>Proyectos</h2>
    <RouterLink to="/admin/proyectos/nuevo" class="boton">+ Crear proyecto</RouterLink>
  </div>

  <p v-if="error" class="error">{{ error }}</p>

  <div class="filtros">
    <input v-model="buscando" placeholder="Buscar por título" />
    <select v-model="filtroEstado" style="max-width:200px">
      <option value="todos">Todos los estados</option>
      <option value="activo">Activo</option>
      <option value="pendiente">Pendiente</option>
      <option value="finalizado">Finalizado</option>
    </select>
  </div>

  <table>
    <thead><tr><th>Título</th><th>Líder</th><th>Fase</th><th>Estado</th><th>Público</th><th>Acciones</th></tr></thead>
    <tbody>
      <tr v-for="p in filtrados" :key="p.id">
        <td>{{ p.titulo }}</td>
        <td>{{ nombreDe(p.liderId) }}</td>
        <td>{{ p.faseActual }}</td>
        <td>{{ p.estado }}</td>
        <td>{{ p.esPublico ? 'Sí' : 'No' }}</td>
        <td>
          <RouterLink :to="`/admin/proyectos/editar/${p.id}`">Editar</RouterLink>
          <RouterLink :to="`/gestion/${p.id}`">Ver Gantt</RouterLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>
