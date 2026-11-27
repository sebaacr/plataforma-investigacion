<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { obtenerProyectosPublicos } from '../../services/proyectosApi'
import { obtenerPublicaciones } from '../../services/publicacionesApi'
import {
  filtrarProyectosPublicos, proyectosDestacados, publicacionesDestacadas, investigadoresActivos, enlaceSeguro,
  nombreSinTitulo, fasesDisponibles
} from '../../services/portalPublico'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { odsDelProyecto } from '../../data/ods'
import InsigniaOds from '../../components/InsigniaOds.vue'

const proyectos = ref([])
const usuarios = ref([])
const publicaciones = ref([])
const buscando = ref('')
const fase = ref('')
const cargando = ref(false)
const error = ref('')

onMounted(async () => {
  cargando.value = true
  try {
    proyectos.value = await obtenerProyectosPublicos()
    usuarios.value = await obtenerUsuarios()
    publicaciones.value = await obtenerPublicaciones()
  } catch {
    error.value = 'No se pudo conectar con la API.'
  } finally {
    cargando.value = false
  }
})

const nombreDe = (id) => usuarios.value.find(u => u.id === id)?.nombre || ''

const filtrados = computed(() => {
  return filtrarProyectosPublicos(proyectos.value, buscando.value, nombreDe, fase.value)
})
const fases = computed(() => fasesDisponibles(proyectos.value))
// Mientras se busca o filtra, se ocultan los banners para mostrar solo los resultados
const filtrando = computed(() => Boolean(buscando.value || fase.value))

const destacados = computed(() => proyectosDestacados(proyectos.value))
const pubDestacadas = computed(() => publicacionesDestacadas(publicaciones.value))
const investigadores = computed(() => investigadoresActivos(usuarios.value))

// Banner de proyectos destacados: cambia solo cada 7 segundos
const actual = ref(0)
const destacadoActual = computed(() => destacados.value[actual.value % Math.max(1, destacados.value.length)])
const mover = (paso) => {
  const total = destacados.value.length
  if (total) actual.value = (actual.value + paso + total) % total
}
let temporizador = null
const pausar = () => clearInterval(temporizador)
const reanudar = () => { pausar(); temporizador = setInterval(() => mover(1), 7000) }
onMounted(reanudar)
onUnmounted(pausar)

const cantidadProyectos = (usuarioId) => proyectos.value.filter(p => p.liderId === usuarioId).length
</script>

<template>
  <section class="portada">
    <h1>Proyectos de Investigación</h1>
    <p>Conoce los proyectos que se desarrollan en nuestra universidad</p>
    <input v-model="buscando" placeholder="Buscar por título o investigador..." />
    <select v-model="fase" aria-label="Filtrar por fase">
      <option value="">Todas las fases</option>
      <option v-for="f in fases" :key="f" :value="f">{{ f }}</option>
    </select>
  </section>

  <p v-if="cargando" style="padding:20px">Cargando proyectos...</p>
  <p v-if="error" class="error" style="margin:20px">{{ error }}</p>

  <template v-if="!filtrando">
    <section v-if="destacadoActual" class="banner-destacado" @mouseenter="pausar" @mouseleave="reanudar">
      <div class="banner-texto">
        <span class="etiqueta">Proyecto destacado</span>
        <h2>{{ destacadoActual.titulo }}</h2>
        <p>{{ destacadoActual.resumen || destacadoActual.objetivo }}</p>
        <p class="banner-lider"><b>Investigador responsable:</b> {{ nombreDe(destacadoActual.liderId) }}</p>
        <div class="banner-ods">
          <InsigniaOds v-for="o in odsDelProyecto(destacadoActual)" :key="o.numero" :ods="o" chica />
        </div>
        <RouterLink :to="`/proyecto/${destacadoActual.id}`" class="boton">Ver proyecto</RouterLink>
      </div>
      <div v-if="destacados.length > 1" class="banner-controles">
        <button aria-label="Anterior" @click="mover(-1)">‹</button>
        <button v-for="(d, i) in destacados" :key="d.id" class="punto" :class="{ activo: i === actual }"
                :aria-label="`Ver destacado ${i + 1}`" @click="actual = i"></button>
        <button aria-label="Siguiente" @click="mover(1)">›</button>
      </div>
    </section>

    <section v-if="pubDestacadas.length" class="seccion">
      <h2>Publicaciones destacadas</h2>
      <div class="publicaciones">
        <RouterLink v-for="p in pubDestacadas" :key="p.id" :to="`/publicacion/${p.id}`" class="publicacion-card">
          <img v-if="enlaceSeguro(p.imagenUrl)" :src="enlaceSeguro(p.imagenUrl)" :alt="`Portada de ${p.titulo}`" />
          <div v-else class="sin-portada">{{ p.revista || 'Publicación' }}</div>
          <div class="publicacion-texto">
            <h3>{{ p.titulo }}</h3>
            <small>{{ p.revista }}<template v-if="p.anio"> · {{ p.anio }}</template></small>
          </div>
        </RouterLink>
      </div>
    </section>
  </template>

  <section class="seccion">
    <h2 v-if="!filtrando">Proyectos</h2>
    <div class="grilla" style="padding:0">
      <p v-if="!cargando && filtrados.length === 0">No hay proyectos que coincidan con la búsqueda.</p>
      <RouterLink v-for="p in filtrados" :key="p.id" :to="`/proyecto/${p.id}`" class="proyecto-card">
        <h3>{{ p.titulo }}</h3>
        <p><b>Investigador responsable:</b> {{ nombreDe(p.liderId) }}</p>
        <p><b>Fase:</b> {{ p.faseActual }}</p>
      </RouterLink>
    </div>
  </section>

  <section v-if="!filtrando && investigadores.length" class="seccion">
    <h2>Investigadores activos</h2>
    <div class="investigadores">
      <RouterLink v-for="u in investigadores" :key="u.id" :to="`/investigador/${u.id}`" class="investigador-card">
        <span class="inicial">{{ nombreSinTitulo(u.nombre).charAt(0) }}</span>
        <div>
          <b>{{ u.nombre }}</b>
          <small>{{ u.facultad || u.especialidad }}</small>
          <small>{{ cantidadProyectos(u.id) }} proyecto(s) publicado(s)</small>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.portada select { margin: 0 auto; max-width: 550px; }
.seccion { padding: 10px 20px 20px; }
.banner-destacado { margin: 20px; background: linear-gradient(110deg, var(--azul-oscuro), var(--azul) 60%, var(--azul-claro)); color: white; padding: 30px; position: relative; min-height: 230px; }
.banner-texto { max-width: 720px; }
.banner-destacado h2 { color: white; margin: 8px 0; }
.banner-destacado p { line-height: 1.5; }
.banner-lider { font-size: 13px; opacity: .9; }
.etiqueta { background: white; color: var(--azul); font-size: 11px; font-weight: bold; padding: 3px 8px; text-transform: uppercase; }
.banner-ods { display: flex; gap: 6px; flex-wrap: wrap; margin: 12px 0; }
.banner-destacado .boton { background: white; color: var(--azul); font-weight: 600; }
.banner-controles { position: absolute; right: 20px; bottom: 15px; display: flex; align-items: center; gap: 6px; }
.banner-controles button { background: rgba(255,255,255,.2); color: white; border: none; width: 30px; height: 30px; font-size: 18px; cursor: pointer; }
.banner-controles .punto { width: 10px; height: 10px; border-radius: 50%; padding: 0; }
.banner-controles .punto.activo { background: white; }

.publicaciones { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 15px; }
.publicacion-card { background: white; color: var(--texto); text-decoration: none; display: flex; flex-direction: column; border: 1px solid #ddd; }
.publicacion-card:hover { border-color: var(--azul-claro); }
.publicacion-card img, .sin-portada { width: 100%; height: 130px; object-fit: cover; }
.sin-portada { background: var(--azul); color: white; display: flex; align-items: center; justify-content: center; text-align: center; padding: 10px; font-size: 13px; font-weight: 600; }
.publicacion-texto { padding: 12px; }
.publicacion-texto h3 { font-size: 14px; margin: 0 0 6px; }
.publicacion-texto small { color: #777; }

.investigadores { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.investigador-card { background: white; display: flex; gap: 12px; align-items: center; padding: 12px; color: var(--texto); text-decoration: none; border: 1px solid #ddd; }
.investigador-card:hover { border-color: var(--azul-claro); }
.investigador-card small { display: block; color: #777; }
.inicial { width: 42px; height: 42px; border-radius: 50%; background: var(--azul-claro); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0; }
</style>
