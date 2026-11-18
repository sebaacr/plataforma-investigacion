<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerProyectosPublicos } from '../../services/proyectosApi'
import { filtrarProyectosPublicos } from '../../services/portalPublico'
import { obtenerUsuarios } from '../../services/usuariosApi'

const proyectos = ref([])
const usuarios = ref([])
const buscando = ref('')
const cargando = ref(false)
const error = ref('')

onMounted(async () => {
  cargando.value = true
  try {
    proyectos.value = await obtenerProyectosPublicos()
    usuarios.value = await obtenerUsuarios()
  } catch {
    error.value = 'No se pudo conectar con la API.'
  } finally {
    cargando.value = false
  }
})

const nombreDe = (id) => usuarios.value.find(u => u.id === id)?.nombre || ''

const filtrados = computed(() => {
  return filtrarProyectosPublicos(proyectos.value, buscando.value, nombreDe)
})
</script>

<template>
  <section class="portada">
    <h1>Proyectos de Investigación</h1>
    <p>Conoce los proyectos que se desarrollan en nuestra universidad</p>
    <input v-model="buscando" placeholder="Buscar por título o investigador..." />
  </section>

  <p v-if="cargando" style="padding:20px">Cargando proyectos...</p>
  <p v-if="error" class="error" style="margin:20px">{{ error }}</p>

  <div class="grilla">
    <p v-if="!cargando && filtrados.length === 0">No hay proyectos que coincidan con la búsqueda.</p>
    <RouterLink v-for="p in filtrados" :key="p.id" :to="`/proyecto/${p.id}`" class="proyecto-card">
      <h3>{{ p.titulo }}</h3>
      <p><b>Investigador responsable:</b> {{ nombreDe(p.liderId) }}</p>
      <p><b>Fase:</b> {{ p.faseActual }}</p>
    </RouterLink>
  </div>
</template>
