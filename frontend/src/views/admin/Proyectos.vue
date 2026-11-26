<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerProyectos, actualizarProyecto } from '../../services/proyectosApi'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { registrarHistorial } from '../../services/api'
import { usuario as yo } from '../../sesion'

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

// El banner del portal muestra los proyectos destacados (solo si están publicados)
async function alternarDestacado(p) {
  error.value = ''
  if (!p.esPublico) { error.value = 'Primero publique el proyecto para poder destacarlo.'; return }
  try {
    await actualizarProyecto(p.id, { ...p, destacado: !p.destacado })
    await registrarHistorial(yo.value.nombre, 'proyecto', `${p.destacado ? 'Quitó de' : 'Agregó a'} destacados el proyecto "${p.titulo}"`)
    p.destacado = !p.destacado
  } catch { error.value = 'No fue posible actualizar el proyecto.' }
}

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
    <thead><tr><th>Título</th><th>Líder</th><th>Fase</th><th>Estado</th><th>Público</th><th>Destacado</th><th>Acciones</th></tr></thead>
    <tbody>
      <tr v-for="p in filtrados" :key="p.id">
        <td>{{ p.titulo }}</td>
        <td>{{ nombreDe(p.liderId) }}</td>
        <td>{{ p.faseActual }}</td>
        <td>{{ p.estado }}</td>
        <td>{{ p.esPublico ? 'Sí' : 'No' }}</td>
        <td>
          <button class="estrella" :class="{ activa: p.destacado }" :disabled="!p.esPublico"
                  :title="p.esPublico ? 'Mostrar u ocultar en el banner del portal' : 'Solo los proyectos publicados pueden destacarse'"
                  @click="alternarDestacado(p)">{{ p.destacado ? '★' : '☆' }}</button>
        </td>
        <td>
          <RouterLink :to="`/admin/proyectos/editar/${p.id}`">Editar</RouterLink>
          <RouterLink :to="`/gestion/${p.id}`">Ver Gantt</RouterLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.estrella { background: none; border: none; font-size: 20px; color: var(--gris); cursor: pointer; padding: 0; }
.estrella.activa { color: var(--amarillo); }
.estrella:disabled { opacity: .3; cursor: not-allowed; }
</style>
