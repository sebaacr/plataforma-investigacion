<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { obtenerProyecto, crearProyecto, actualizarProyecto } from '../../services/proyectosApi'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { registrarHistorial } from '../../services/api'
import { usuario as yo } from '../../sesion'

const route = useRoute()
const router = useRouter()

const editando = Boolean(route.params.id)
const formulario = reactive({
  titulo: '', objetivo: '', liderId: '', faseActual: 'Planificación',
  estado: 'activo', esPublico: false, fechaInicio: '', fechaFin: ''
})
const usuarios = ref([])
const error = ref('')
const guardando = ref(false)

const investigadores = computed(() => usuarios.value.filter(u => u.rol === 'investigador' && u.activo))

onMounted(async () => {
  try {
    usuarios.value = await obtenerUsuarios()
    if (editando) Object.assign(formulario, await obtenerProyecto(route.params.id))
  } catch (e) { error.value = `No fue posible cargar: ${e.message}` }
})

async function guardar() {
  error.value = ''
  if (formulario.titulo.trim().length < 5) { error.value = 'El título debe tener al menos 5 caracteres.'; return }
  if (formulario.objetivo.trim().length < 10) { error.value = 'El objetivo debe tener al menos 10 caracteres.'; return }
  if (!formulario.liderId) { error.value = 'Todo proyecto debe tener un investigador responsable.'; return }
  if (!formulario.fechaInicio || !formulario.fechaFin) { error.value = 'Ingrese fecha de inicio y de término.'; return }
  if (formulario.fechaFin < formulario.fechaInicio) { error.value = 'La fecha de término no puede ser anterior al inicio.'; return }

  guardando.value = true
  const datos = { ...formulario, titulo: formulario.titulo.trim(), objetivo: formulario.objetivo.trim() }
  try {
    if (editando) {
      await actualizarProyecto(route.params.id, datos)
      await registrarHistorial(yo.value.nombre, 'proyecto', `Editó el proyecto "${datos.titulo}"`)
    } else {
      await crearProyecto(datos)
      await registrarHistorial(yo.value.nombre, 'proyecto', `Creó el proyecto "${datos.titulo}"`)
    }
    router.push('/admin/proyectos')
  } catch (e) { error.value = `No fue posible guardar: ${e.message}` }
  finally { guardando.value = false }
}
</script>

<template>
  <h2>{{ editando ? 'Editar proyecto' : 'Nuevo proyecto' }}</h2>
  <form @submit.prevent="guardar">
    <label>Título <input v-model="formulario.titulo" /></label>
    <label>Objetivo <textarea v-model="formulario.objetivo" rows="3"></textarea></label>
    <label>Investigador responsable
      <select v-model="formulario.liderId">
        <option value="">Seleccione</option>
        <option v-for="i in investigadores" :key="i.id" :value="i.id">{{ i.nombre }}</option>
      </select>
    </label>
    <label>Fecha de inicio <input v-model="formulario.fechaInicio" type="date" /></label>
    <label>Fecha de término <input v-model="formulario.fechaFin" type="date" /></label>
    <label>Fase actual <input v-model="formulario.faseActual" /></label>
    <label>Estado
      <select v-model="formulario.estado">
        <option value="activo">Activo</option>
        <option value="pendiente">Pendiente</option>
        <option value="finalizado">Finalizado</option>
      </select>
    </label>
    <label class="check"><input v-model="formulario.esPublico" type="checkbox" /> Publicar en el portal público</label>
    <br>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
    <RouterLink to="/admin/proyectos" style="margin-left:10px">Cancelar</RouterLink>
  </form>
</template>
