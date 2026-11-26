<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { obtenerProyecto, crearProyecto, actualizarProyecto } from '../../services/proyectosApi'
import { obtenerUsuarios } from '../../services/usuariosApi'
import { registrarHistorial } from '../../services/api'
import { usuario as yo } from '../../sesion'
import { ODS } from '../../data/ods'
import InsigniaOds from '../../components/InsigniaOds.vue'

const route = useRoute()
const router = useRouter()

const MAX_ARTICULOS = 10

const editando = Boolean(route.params.id)
const formulario = reactive({
  titulo: '', objetivo: '', liderId: '', faseActual: 'Planificación',
  estado: 'activo', esPublico: false, destacado: false, fechaInicio: '', fechaFin: '',
  resumen: '', resultadosEsperados: '', impactoEsperado: '', ods: [], articulos: []
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

function alternarOds(numero) {
  formulario.ods = formulario.ods.includes(numero)
    ? formulario.ods.filter(n => n !== numero)
    : [...formulario.ods, numero].sort((a, b) => a - b)
}

const agregarArticulo = () => formulario.articulos.push({ titulo: '', url: '' })
const quitarArticulo = (i) => formulario.articulos.splice(i, 1)

function esEnlaceWeb(url) {
  try { return ['http:', 'https:'].includes(new URL(url).protocol) } catch { return false }
}

async function guardar() {
  error.value = ''
  if (formulario.titulo.trim().length < 5) { error.value = 'El título debe tener al menos 5 caracteres.'; return }
  if (formulario.objetivo.trim().length < 10) { error.value = 'El objetivo debe tener al menos 10 caracteres.'; return }
  if (!formulario.liderId) { error.value = 'Todo proyecto debe tener un investigador responsable.'; return }
  if (!formulario.fechaInicio || !formulario.fechaFin) { error.value = 'Ingrese fecha de inicio y de término.'; return }
  if (formulario.fechaFin < formulario.fechaInicio) { error.value = 'La fecha de término no puede ser anterior al inicio.'; return }

  // Las filas vacías se ignoran; las incompletas se informan
  const articulos = formulario.articulos
    .map(a => ({ titulo: a.titulo.trim(), url: a.url.trim() }))
    .filter(a => a.titulo || a.url)
  if (articulos.length > MAX_ARTICULOS) { error.value = `Ingrese como máximo ${MAX_ARTICULOS} artículos relevantes.`; return }
  const malo = articulos.findIndex(a => a.titulo.length < 3 || !esEnlaceWeb(a.url))
  if (malo >= 0) { error.value = `Revise el artículo ${malo + 1}: necesita título y un enlace que comience con https://.`; return }

  guardando.value = true
  const datos = {
    ...formulario,
    titulo: formulario.titulo.trim(),
    objetivo: formulario.objetivo.trim(),
    resumen: formulario.resumen.trim(),
    resultadosEsperados: formulario.resultadosEsperados.trim(),
    impactoEsperado: formulario.impactoEsperado.trim(),
    articulos,
    // Un proyecto solo puede destacarse en el portal si está publicado
    destacado: formulario.esPublico && formulario.destacado
  }
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
    <label>Resumen del proyecto <textarea v-model="formulario.resumen" rows="4" maxlength="1500"></textarea></label>
    <label>Resultados esperados <textarea v-model="formulario.resultadosEsperados" rows="3" maxlength="1500"></textarea></label>
    <label>Impacto esperado <textarea v-model="formulario.impactoEsperado" rows="3" maxlength="1500"></textarea></label>
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

    <fieldset>
      <legend>Objetivos de Desarrollo Sostenible asociados ({{ formulario.ods.length }} seleccionados)</legend>
      <div class="selector-ods">
        <button v-for="o in ODS" :key="o.numero" type="button" class="opcion-ods"
                :class="{ elegido: formulario.ods.includes(o.numero) }"
                :aria-pressed="formulario.ods.includes(o.numero)" @click="alternarOds(o.numero)">
          <InsigniaOds :ods="o" chica />
        </button>
      </div>
    </fieldset>

    <fieldset>
      <legend>Artículos relevantes ({{ formulario.articulos.length }} de {{ MAX_ARTICULOS }})</legend>
      <div v-for="(a, i) in formulario.articulos" :key="i" class="fila-articulo">
        <input v-model="a.titulo" :placeholder="`Título del artículo ${i + 1}`" />
        <input v-model="a.url" type="url" placeholder="https://..." />
        <button type="button" class="boton chico rojo" @click="quitarArticulo(i)">Quitar</button>
      </div>
      <button type="button" class="boton chico" :disabled="formulario.articulos.length >= MAX_ARTICULOS" @click="agregarArticulo">
        + Agregar artículo
      </button>
    </fieldset>

    <label class="check"><input v-model="formulario.esPublico" type="checkbox" /> Publicar en el portal público</label>
    <label class="check" :class="{ apagado: !formulario.esPublico }">
      <input v-model="formulario.destacado" type="checkbox" :disabled="!formulario.esPublico" />
      Mostrar en el banner de proyectos destacados
    </label>
    <br>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
    <RouterLink to="/admin/proyectos" style="margin-left:10px">Cancelar</RouterLink>
  </form>
</template>

<style scoped>
fieldset { border: 1px solid #ddd; margin: 10px 0 15px; padding: 10px 15px 15px; max-width: 760px; }
legend { font-weight: 600; padding: 0 5px; }
.selector-ods { display: flex; flex-wrap: wrap; gap: 6px; }
.opcion-ods { padding: 0; border: 3px solid transparent; background: none; cursor: pointer; opacity: .35; }
.opcion-ods.elegido { opacity: 1; border-color: var(--azul); }
.fila-articulo { display: flex; gap: 8px; align-items: center; }
.fila-articulo input { margin: 4px 0; }
.apagado { color: var(--gris); }
@media (max-width: 700px) { .fila-articulo { flex-direction: column; align-items: stretch; } }
</style>
