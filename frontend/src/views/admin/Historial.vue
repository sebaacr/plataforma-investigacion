<script setup>
import { ref, onMounted } from 'vue'
import { obtenerHistorial } from '../../services/tareasApi'

const historial = ref([])
const error = ref('')

onMounted(async () => {
  try { historial.value = await obtenerHistorial() }
  catch { error.value = 'No se pudo conectar con la API.' }
})

const formato = (f) => new Date(f).toLocaleString('es-CL')
</script>

<template>
  <h2>Historial de cambios</h2>
  <p v-if="error" class="error">{{ error }}</p>
  <table>
    <thead><tr><th>Fecha</th><th>Usuario</th><th>Elemento</th><th>Acción</th></tr></thead>
    <tbody>
      <tr v-for="h in historial" :key="h.id">
        <td>{{ formato(h.fecha) }}</td>
        <td>{{ h.usuario }}</td>
        <td>{{ h.entidad }}</td>
        <td>{{ h.accion }}</td>
      </tr>
    </tbody>
  </table>
</template>
