<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerProyectos } from '../../services/proyectosApi'
import { usuario } from '../../sesion'

const proyectos = ref([])
const error = ref('')

onMounted(async () => {
  try { proyectos.value = await obtenerProyectos() }
  catch { error.value = 'No se pudo conectar con la API.' }
})

const mios = computed(() => proyectos.value.filter(p => p.liderId === usuario.value.id))
</script>

<template>
  <h2>Mis proyectos</h2>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="!error && mios.length === 0">No tienes proyectos asignados como líder.</p>

  <div class="grilla" style="padding:0">
    <RouterLink v-for="p in mios" :key="p.id" :to="`/gestion/${p.id}`" class="proyecto-card">
      <h3>{{ p.titulo }}</h3>
      <p><b>Fase:</b> {{ p.faseActual }}</p>
      <p><b>Estado:</b> {{ p.estado }}</p>
    </RouterLink>
  </div>
</template>