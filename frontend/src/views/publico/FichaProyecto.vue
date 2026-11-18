<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerProyecto, obtenerEtapas, obtenerParticipaciones } from '../../services/proyectosApi'
import { obtenerUsuarios } from '../../services/usuariosApi'

const route = useRoute()
const proyecto = ref(null)
const etapas = ref([])
const usuarios = ref([])
const participaciones = ref([])
const error = ref('')

onMounted(async () => {
  try {
    proyecto.value = await obtenerProyecto(route.params.id)
    if (!proyecto.value.esPublico) { proyecto.value = null; error.value = 'Este proyecto no está publicado.'; return }
    etapas.value = (await obtenerEtapas(route.params.id)).sort((a, b) => a.orden - b.orden)
    usuarios.value = await obtenerUsuarios()
    participaciones.value = await obtenerParticipaciones()
  } catch {
    error.value = 'No se encontró el proyecto.'
  }
})

const nombreDe = (id) => usuarios.value.find(u => u.id === id)?.nombre || ''

const integrantes = computed(() =>
  participaciones.value
    .filter(p => p.proyectoId === route.params.id)
    .map(p => nombreDe(p.usuarioId))
)

const indiceActual = computed(() => etapas.value.findIndex(e => e.nombre === proyecto.value?.faseActual))
</script>

<template>
  <div class="ficha">
    <RouterLink to="/">← Volver</RouterLink>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="proyecto">
      <h2>{{ proyecto.titulo }}</h2>
      <p><b>Objetivo:</b> {{ proyecto.objetivo }}</p>
      <p><b>Investigador responsable:</b> {{ nombreDe(proyecto.liderId) }}</p>
      <p v-if="integrantes.length"><b>Integrantes:</b> {{ integrantes.join(', ') }}</p>
      <p><b>Fase actual:</b> {{ proyecto.faseActual }}</p>

      <div class="fases">
        <div v-for="(e, i) in etapas" :key="e.id" class="fase" :class="{ hecha: i <= indiceActual }">
          {{ e.orden }}. {{ e.nombre }}
        </div>
      </div>
    </template>
  </div>
</template>
