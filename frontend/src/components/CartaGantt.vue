<script setup>
import { computed } from 'vue'

const props = defineProps({ etapas: Array, hitos: { type: Array, default: () => [] }, editable: Boolean })
const emit = defineEmits(['editar'])

const DIA = 24 * 60 * 60 * 1000

const inicio = computed(() => Math.min(...props.etapas.map(e => new Date(e.fechaInicio))))
const fin = computed(() => Math.max(...props.etapas.map(e => new Date(e.fechaFin))))
const totalDias = computed(() => Math.max(1, (fin.value - inicio.value) / DIA))

const ordenadas = computed(() => [...props.etapas].sort((a, b) => a.orden - b.orden))

function estilo(etapa) {
  const desde = (new Date(etapa.fechaInicio) - inicio.value) / DIA
  const dias = (new Date(etapa.fechaFin) - new Date(etapa.fechaInicio)) / DIA
  return {
    left: (desde / totalDias.value * 100) + '%',
    width: (dias / totalDias.value * 100) + '%'
  }
}

function estado(etapa) {
  const hoy = new Date().toISOString().slice(0, 10)
  if (etapa.fechaFin < hoy) return 'terminada'
  if (etapa.fechaInicio <= hoy) return 'en-curso'
  return 'futura'
}

const formato = (f) => f.split('-').reverse().join('/')

const hitosVisibles = computed(() => props.hitos.filter(h => {
  const fecha = new Date(h.fecha)
  return props.etapas.length && fecha >= inicio.value && fecha <= fin.value
}))
const posicionHito = (hito) => ({ left: ((new Date(hito.fecha) - inicio.value) / DIA / totalDias.value * 100) + '%' })
</script>

<template>
  <div class="gantt">
    <p v-if="etapas.length === 0">Este proyecto aún no tiene etapas.</p>
    <div v-for="e in ordenadas" :key="e.id" class="gantt-fila">
      <div class="gantt-nombre">
        {{ e.orden }}. {{ e.nombre }}
        <button v-if="editable" class="editar-etapa" title="Editar etapa" @click="emit('editar', e)">✎</button>
      </div>
      <div class="gantt-pista">
        <div class="gantt-barra" :class="estado(e)" :style="estilo(e)"
             :title="`${formato(e.fechaInicio)} - ${formato(e.fechaFin)}`">
          {{ formato(e.fechaInicio).slice(0, 5) }}
        </div>
      </div>
    </div>
    <div v-if="hitosVisibles.length" class="gantt-fila">
      <div class="gantt-nombre"><b>Hitos</b></div>
      <div class="gantt-pista">
        <span v-for="h in hitosVisibles" :key="h.id" class="hito" :class="{ cumplido: h.cumplido }"
              :style="posicionHito(h)" :title="`${h.nombre} · ${formato(h.fecha)}`"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editar-etapa { background: none; border: none; color: var(--azul-claro); cursor: pointer; font-size: 13px; padding: 0 4px; }
.hito { position: absolute; top: 4px; width: 14px; height: 14px; margin-left: -7px; background: var(--amarillo); transform: rotate(45deg); }
.hito.cumplido { background: var(--verde); }
</style>
