<script setup>
import { ref, onMounted } from 'vue'
import { obtenerTareasResponsable, cambiarEstado, obtenerArchivos, subirArchivo, estaAtrasada } from '../../services/tareasApi'
import { obtenerProyectos } from '../../services/proyectosApi'
import { registrarHistorial } from '../../services/api'
import { usuario } from '../../sesion'

const tareas = ref([])
const proyectos = ref([])
const archivos = ref([])
const error = ref('')
const mensaje = ref('')
const subiendo = ref(null)
const archivoElegido = ref(null)

async function cargar() {
  try {
    tareas.value = await obtenerTareasResponsable(usuario.value.id)
    proyectos.value = await obtenerProyectos()
    archivos.value = await obtenerArchivos()
  } catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const tituloDe = (id) => proyectos.value.find(p => p.id === id)?.titulo || ''
const archivoDe = (tareaId) => archivos.value.filter(a => a.tareaId === tareaId).at(-1)
const formato = (f) => f.split('-').reverse().join('/')
const textoEstado = { pendiente: 'Pendiente', por_revisar: 'Por revisar', cumplida: 'Cumplida' }

function elegir(evento) {
  archivoElegido.value = evento.target.files[0] || null
}

async function enviarArchivo(tarea) {
  error.value = ''; mensaje.value = ''
  if (!archivoElegido.value) { error.value = 'Seleccione un archivo.'; return }
  const anteriores = archivos.value.filter(a => a.tareaId === tarea.id).length
  try {
    await subirArchivo({
      tareaId: tarea.id,
      nombre: archivoElegido.value.name,
      driveUrl: 'https://drive.google.com/',
      subidoPor: usuario.value.id,
      subidoEn: new Date().toISOString().slice(0, 10),
      version: anteriores + 1
    })
    await cambiarEstado(tarea.id, 'por_revisar')
    await registrarHistorial(usuario.value.nombre, 'tarea', `Subió archivo a "${tarea.nombre}"`)
    mensaje.value = 'Archivo subido. La tarea quedó "Por revisar".'
    subiendo.value = null
    archivoElegido.value = null
    await cargar()
  } catch { error.value = 'No fue posible subir el archivo.' }
}
</script>

<template>
  <h2>Mis tareas</h2>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="mensaje" class="exito">{{ mensaje }}</p>
  <p v-if="!error && tareas.length === 0">No tienes tareas asignadas.</p>

  <table v-if="tareas.length">
    <thead><tr><th>Tarea</th><th>Proyecto</th><th>Vence</th><th>Estado</th><th>Archivo</th><th>Acción</th></tr></thead>
    <tbody>
      <tr v-for="t in tareas" :key="t.id">
        <td><b>{{ t.nombre }}</b><br><small>{{ t.descripcion }}</small></td>
        <td>{{ tituloDe(t.proyectoId) }}</td>
        <td>{{ formato(t.fechaLimite) }}</td>
        <td>
          <span class="estado" :class="estaAtrasada(t) ? 'atrasada' : t.estado">
            {{ estaAtrasada(t) ? 'Atrasada' : textoEstado[t.estado] }}
          </span>
        </td>
        <td>
          <a v-if="archivoDe(t.id)" :href="archivoDe(t.id).driveUrl" target="_blank">
            {{ archivoDe(t.id).nombre }} (v{{ archivoDe(t.id).version }})
          </a>
          <span v-else>—</span>
        </td>
        <td>
          <template v-if="t.estado === 'pendiente'">
            <button v-if="subiendo !== t.id" class="boton chico" @click="subiendo = t.id">Subir archivo</button>
            <div v-else>
              <input type="file" @change="elegir" />
              <button class="boton chico" @click="enviarArchivo(t)">Enviar</button>
              <button class="boton chico gris" @click="subiendo = null">Cancelar</button>
            </div>
          </template>
          <span v-else>—</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
