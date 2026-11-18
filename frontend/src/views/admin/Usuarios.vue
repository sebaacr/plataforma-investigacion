<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { obtenerUsuarios, crearUsuario, actualizarUsuario } from '../../services/usuariosApi'
import { registrarHistorial } from '../../services/api'
import { usuario as yo } from '../../sesion'

const usuarios = ref([])
const buscando = ref('')
const filtroRol = ref('todos')
const error = ref('')
const mensaje = ref('')
const mostrarFormulario = ref(false)
const guardando = ref(false)
const formulario = reactive({ nombre: '', correo: '', rol: 'colaborador', especialidad: '' })

async function cargar() {
  try { usuarios.value = await obtenerUsuarios() }
  catch { error.value = 'No se pudo conectar con la API.' }
}
onMounted(cargar)

const filtrados = computed(() => {
  const texto = buscando.value.trim().toLowerCase()
  return usuarios.value.filter(u =>
    `${u.nombre} ${u.correo}`.toLowerCase().includes(texto) &&
    (filtroRol.value === 'todos' || u.rol === filtroRol.value)
  )
})

async function guardar() {
  error.value = ''; mensaje.value = ''
  if (formulario.nombre.trim().length < 3) { error.value = 'El nombre debe tener al menos 3 letras.'; return }
  if (!formulario.correo.trim().endsWith('@unach.cl')) { error.value = 'Debe ser un correo institucional (@unach.cl).'; return }
  if (usuarios.value.some(u => u.correo === formulario.correo.trim().toLowerCase())) { error.value = 'Ese correo ya está registrado.'; return }

  guardando.value = true
  try {
    await crearUsuario({
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      password: '1234',
      rol: formulario.rol,
      especialidad: formulario.especialidad.trim(),
      institucion: 'UNACH',
      activo: true
    })
    await registrarHistorial(yo.value.nombre, 'usuario', `Creó el usuario "${formulario.nombre.trim()}"`)
    mensaje.value = 'Usuario creado correctamente.'
    Object.assign(formulario, { nombre: '', correo: '', rol: 'colaborador', especialidad: '' })
    mostrarFormulario.value = false
    await cargar()
  } catch { error.value = 'No fue posible crear el usuario.' }
  finally { guardando.value = false }
}

async function cambiarActivo(u) {
  const accion = u.activo ? 'Desactivar' : 'Activar'
  if (!confirm(`¿${accion} a ${u.nombre}?`)) return
  try {
    await actualizarUsuario(u.id, { activo: !u.activo })
    await registrarHistorial(yo.value.nombre, 'usuario', `${accion} al usuario "${u.nombre}"`)
    await cargar()
  } catch { error.value = 'No fue posible actualizar el usuario.' }
}

async function cambiarRol(u, rol) {
  try {
    await actualizarUsuario(u.id, { rol })
    await registrarHistorial(yo.value.nombre, 'usuario', `Cambió el rol de "${u.nombre}" a ${rol}`)
    await cargar()
  } catch { error.value = 'No fue posible cambiar el rol.' }
}
</script>

<template>
  <div class="titulo-fila">
    <h2>Usuarios</h2>
    <button class="boton" @click="mostrarFormulario = !mostrarFormulario">
      {{ mostrarFormulario ? 'Cerrar' : '+ Crear usuario' }}
    </button>
  </div>

  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="mensaje" class="exito">{{ mensaje }}</p>

  <form v-if="mostrarFormulario" @submit.prevent="guardar">
    <h3>Nuevo usuario</h3>
    <label>Nombre completo <input v-model="formulario.nombre" /></label>
    <label>Correo institucional <input v-model="formulario.correo" type="email" placeholder="nombre@unach.cl" /></label>
    <label>Rol
      <select v-model="formulario.rol">
        <option value="investigador">Investigador</option>
        <option value="colaborador">Colaborador</option>
        <option value="admin">Administrador</option>
      </select>
    </label>
    <label>Especialidad <input v-model="formulario.especialidad" /></label>
    <button class="boton" type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
  </form>

  <div class="filtros">
    <input v-model="buscando" placeholder="Buscar por nombre o correo" />
    <select v-model="filtroRol" style="max-width:200px">
      <option value="todos">Todos los roles</option>
      <option value="admin">Administrador</option>
      <option value="investigador">Investigador</option>
      <option value="colaborador">Colaborador</option>
    </select>
  </div>
  <p>{{ filtrados.length }} usuario(s)</p>

  <table>
    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>
      <tr v-for="u in filtrados" :key="u.id">
        <td>{{ u.nombre }}</td>
        <td>{{ u.correo }}</td>
        <td>
          <select :value="u.rol" @change="cambiarRol(u, $event.target.value)" :disabled="u.id === yo.id" style="margin:0">
            <option value="admin">admin</option>
            <option value="investigador">investigador</option>
            <option value="colaborador">colaborador</option>
          </select>
        </td>
        <td>{{ u.activo ? 'Activo' : 'Inactivo' }}</td>
        <td>
          <button v-if="u.id !== yo.id" class="boton chico" :class="{ rojo: u.activo }" @click="cambiarActivo(u)">
            {{ u.activo ? 'Desactivar' : 'Activar' }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
