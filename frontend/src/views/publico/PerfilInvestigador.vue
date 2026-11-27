<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerUsuario } from '../../services/usuariosApi'
import { obtenerProyectosPublicos, obtenerParticipaciones } from '../../services/proyectosApi'
import { tienePerfilPublico, proyectosPublicosDe, enlaceSeguro } from '../../services/portalPublico'

const route = useRoute()
const persona = ref(null)
const proyectos = ref([])
const participaciones = ref([])
const error = ref('')

onMounted(async () => {
  try {
    const usuario = await obtenerUsuario(route.params.id)
    proyectos.value = await obtenerProyectosPublicos()
    participaciones.value = await obtenerParticipaciones()
    if (!tienePerfilPublico(usuario, proyectos.value, participaciones.value)) {
      error.value = 'Este perfil no está disponible.'
      return
    }
    persona.value = usuario
  } catch {
    error.value = 'No se encontró el perfil.'
  }
})

const susProyectos = computed(() =>
  persona.value ? proyectosPublicosDe(persona.value.id, proyectos.value, participaciones.value) : []
)
const orcid = computed(() => enlaceSeguro(persona.value?.orcid))
const researchgate = computed(() => enlaceSeguro(persona.value?.researchgate))
</script>

<template>
  <div class="ficha">
    <RouterLink to="/">← Volver</RouterLink>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="persona">
      <h2>{{ persona.nombre }}</h2>
      <p v-if="persona.especialidad" class="meta">{{ persona.especialidad }} · {{ persona.institucion }}</p>

      <h3>Filiación</h3>
      <dl class="datos">
        <template v-if="persona.facultad"><dt>Facultad / dirección</dt><dd>{{ persona.facultad }}</dd></template>
        <template v-if="persona.carrera"><dt>Carrera</dt><dd>{{ persona.carrera }}</dd></template>
        <template v-if="persona.posgrado"><dt>Programa de posgrado</dt><dd>{{ persona.posgrado }}</dd></template>
        <template v-if="persona.asignaturas?.length"><dt>Asignaturas</dt><dd>{{ persona.asignaturas.join(', ') }}</dd></template>
      </dl>
      <p v-if="!persona.facultad && !persona.carrera && !persona.posgrado && !persona.asignaturas?.length" class="meta">
        Perfil académico sin completar.
      </p>

      <div v-if="orcid || researchgate" class="enlaces">
        <a v-if="orcid" :href="orcid" target="_blank" rel="noopener noreferrer" class="boton">ORCID ↗</a>
        <a v-if="researchgate" :href="researchgate" target="_blank" rel="noopener noreferrer" class="boton">ResearchGate ↗</a>
      </div>

      <h3>Proyectos</h3>
      <p v-if="susProyectos.length === 0" class="meta">Sin proyectos publicados.</p>
      <ul>
        <li v-for="p in susProyectos" :key="p.id">
          <RouterLink :to="`/proyecto/${p.id}`">{{ p.titulo }}</RouterLink>
          <small>{{ p.liderId === persona.id ? ' · Investigador responsable' : ' · Co-investigador' }}</small>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.meta { color: #666; }
.datos { display: grid; grid-template-columns: 180px 1fr; gap: 6px 15px; margin: 0; }
.datos dt { font-weight: 600; }
.datos dd { margin: 0; }
.enlaces { display: flex; gap: 10px; margin: 15px 0; }
li { margin: 6px 0; }
@media (max-width: 700px) { .datos { grid-template-columns: 1fr; } .datos dd { margin-bottom: 8px; } }
</style>
