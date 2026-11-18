<script setup>
import { estaAtrasada } from '../services/tareasApi'

const props = defineProps({
  tareas: Array,
  usuarios: Array,
  archivos: Array
})
const emit = defineEmits(['aprobar', 'devolver'])

const columnas = [
  { estado: 'pendiente', titulo: 'Pendiente' },
  { estado: 'por_revisar', titulo: 'Por revisar' },
  { estado: 'cumplida', titulo: 'Cumplida' }
]

const tareasDe = (estado) => props.tareas.filter(t => t.estado === estado)
const nombreDe = (id) => props.usuarios.find(u => u.id === id)?.nombre || '—'
const ultimoArchivo = (tareaId) => props.archivos.filter(a => a.tareaId === tareaId).at(-1)
const formato = (f) => f.split('-').reverse().join('/')
</script>

<template>
  <div class="tablero">
    <div v-for="c in columnas" :key="c.estado" class="columna">
      <h3>{{ c.titulo }} ({{ tareasDe(c.estado).length }})</h3>

      <div v-for="t in tareasDe(c.estado)" :key="t.id" class="tarea"
           :class="[t.estado, { atrasada: estaAtrasada(t) }]">
        <b>{{ t.nombre }}</b><br>
        <small>{{ nombreDe(t.responsableId) }} · vence {{ formato(t.fechaLimite) }}</small>
        <small v-if="estaAtrasada(t)" class="texto-rojo"> · atrasada</small>

        <div v-if="ultimoArchivo(t.id)" class="archivo">
          📎 <a :href="ultimoArchivo(t.id).driveUrl" target="_blank">{{ ultimoArchivo(t.id).nombre }}</a>
        </div>

        <div v-if="t.estado === 'por_revisar'" class="acciones">
          <button class="boton chico" @click="emit('aprobar', t)">Aprobar</button>
          <button class="boton chico gris" @click="emit('devolver', t)">Devolver</button>
        </div>
      </div>
    </div>
  </div>
</template>
