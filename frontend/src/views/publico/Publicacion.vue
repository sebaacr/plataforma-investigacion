<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { obtenerPublicacion } from '../../services/publicacionesApi'
import { obtenerProyectosPublicos } from '../../services/proyectosApi'
import { enlaceSeguro } from '../../services/portalPublico'

const route = useRoute()
const publicacion = ref(null)
const proyectos = ref([])
const error = ref('')

onMounted(async () => {
  try {
    publicacion.value = await obtenerPublicacion(route.params.id)
    proyectos.value = await obtenerProyectosPublicos()
  } catch {
    error.value = 'No se encontró la publicación.'
  }
})

const portada = computed(() => enlaceSeguro(publicacion.value?.imagenUrl))
const enlace = computed(() => enlaceSeguro(publicacion.value?.url))
// Solo se enlaza el proyecto si está publicado en el portal
const proyecto = computed(() => proyectos.value.find(p => p.id === publicacion.value?.proyectoId))
</script>

<template>
  <div class="ficha">
    <RouterLink to="/">← Volver</RouterLink>
    <p v-if="error" class="error">{{ error }}</p>

    <article v-if="publicacion" class="publicacion">
      <img v-if="portada" :src="portada" :alt="`Portada de ${publicacion.titulo}`" class="portada-articulo" />
      <div>
        <h2>{{ publicacion.titulo }}</h2>
        <p class="meta">{{ publicacion.autores }}</p>
        <p class="meta">{{ publicacion.revista }}<template v-if="publicacion.anio"> · {{ publicacion.anio }}</template></p>
        <h3>Resumen</h3>
        <p class="resumen">{{ publicacion.resumen }}</p>
        <p v-if="proyecto"><b>Proyecto asociado:</b> <RouterLink :to="`/proyecto/${proyecto.id}`">{{ proyecto.titulo }}</RouterLink></p>
        <a v-if="enlace" :href="enlace" target="_blank" rel="noopener noreferrer" class="boton">Visitar publicación ↗</a>
      </div>
    </article>
  </div>
</template>

<style scoped>
.publicacion { display: flex; gap: 25px; margin-top: 15px; align-items: flex-start; }
.portada-articulo { width: 220px; max-width: 40%; border: 1px solid #ddd; }
.meta { color: #666; margin: 4px 0; }
.resumen { line-height: 1.6; white-space: pre-line; }
@media (max-width: 700px) {
  .publicacion { flex-direction: column; }
  .portada-articulo { max-width: 100%; }
}
</style>
