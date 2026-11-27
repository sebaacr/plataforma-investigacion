<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerProyecto, obtenerEtapas, obtenerParticipaciones } from '../../services/proyectosApi'
import { esProyectoPublico, equipoDelProyecto, enlaceSeguro } from '../../services/portalPublico'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { odsDelProyecto } from '../../data/ods'
import InsigniaOds from '../../components/InsigniaOds.vue'

const route = useRoute()
const proyecto = ref(null)
const etapas = ref([])
const usuarios = ref([])
const participaciones = ref([])
const error = ref('')

onMounted(async () => {
  try {
    proyecto.value = await obtenerProyecto(route.params.id)
    if (!esProyectoPublico(proyecto.value)) { proyecto.value = null; error.value = 'Este proyecto no está publicado.'; return }
    etapas.value = (await obtenerEtapas(route.params.id)).sort((a, b) => a.orden - b.orden)
    usuarios.value = await obtenerUsuarios()
    participaciones.value = await obtenerParticipaciones()
  } catch {
    error.value = 'No se encontró el proyecto.'
  }
})

const lider = computed(() => usuarios.value.find(u => u.id === proyecto.value?.liderId))
const equipo = computed(() => equipoDelProyecto(route.params.id, participaciones.value, usuarios.value))
const ods = computed(() => odsDelProyecto(proyecto.value))
const articulos = computed(() =>
  (proyecto.value?.articulos || []).map(a => ({ ...a, url: enlaceSeguro(a.url) })).filter(a => a.titulo && a.url)
)

const indiceActual = computed(() => etapas.value.findIndex(e => e.nombre === proyecto.value?.faseActual))
</script>

<template>
  <div class="ficha">
    <RouterLink to="/">← Volver</RouterLink>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="proyecto">
      <h2>{{ proyecto.titulo }}</h2>
      <p v-if="proyecto.resumen" class="resumen">{{ proyecto.resumen }}</p>
      <p><b>Objetivo:</b> {{ proyecto.objetivo }}</p>
      <p><b>Investigador responsable:</b> <RouterLink v-if="lider" :to="`/investigador/${lider.id}`">{{ lider.nombre }}</RouterLink></p>
      <p v-if="equipo.coinvestigadores.length"><b>Co-investigadores:</b> <template v-for="(u, i) in equipo.coinvestigadores" :key="u.id">
          <RouterLink :to="`/investigador/${u.id}`">{{ u.nombre }}</RouterLink><template v-if="i < equipo.coinvestigadores.length - 1">, </template>
        </template>
      </p>
      <p v-if="equipo.colaboradores.length"><b>Colaboradores:</b> {{ equipo.colaboradores.map(u => u.nombre).join(', ') }}</p>
      <p><b>Fase actual:</b> {{ proyecto.faseActual }}</p>

      <div class="fases">
        <div v-for="(e, i) in etapas" :key="e.id" class="fase" :class="{ hecha: i <= indiceActual }">
          {{ e.orden }}. {{ e.nombre }}
        </div>
      </div>

      <template v-if="proyecto.resultadosEsperados">
        <h3>Resultados esperados</h3>
        <p class="texto-largo">{{ proyecto.resultadosEsperados }}</p>
      </template>
      <template v-if="proyecto.impactoEsperado">
        <h3>Impacto esperado</h3>
        <p class="texto-largo">{{ proyecto.impactoEsperado }}</p>
      </template>

      <template v-if="ods.length">
        <h3>Objetivos de Desarrollo Sostenible</h3>
        <div class="lista-ods">
          <InsigniaOds v-for="o in ods" :key="o.numero" :ods="o" />
        </div>
      </template>

      <template v-if="articulos.length">
        <h3>Artículos relevantes</h3>
        <ol class="articulos">
          <li v-for="(a, i) in articulos" :key="i">
            <a :href="a.url" target="_blank" rel="noopener noreferrer">{{ a.titulo }} ↗</a>
          </li>
        </ol>
      </template>
    </template>
  </div>
</template>

<style scoped>
.resumen { font-size: 15px; line-height: 1.6; color: #444; }
.texto-largo { line-height: 1.6; white-space: pre-line; }
.lista-ods { display: flex; gap: 8px; flex-wrap: wrap; }
.articulos li { margin: 6px 0; }
</style>
