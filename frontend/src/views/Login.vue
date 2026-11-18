<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarSesion } from '../services/usuariosApi'
import { guardarSesion } from '../sesion'

const router = useRouter()
const correo = ref('')
const password = ref('')
const error = ref('')
const entrando = ref(false)

const inicioPorRol = {
  admin: '/dashboard',
  investigador: '/mis-proyectos',
  colaborador: '/mis-tareas'
}

async function entrar() {
  error.value = ''
  if (!correo.value.trim() || !password.value) {
    error.value = 'Ingrese correo y contraseña.'
    return
  }
  entrando.value = true
  try {
    const usuario = await iniciarSesion(correo.value.trim().toLowerCase(), password.value)
    guardarSesion(usuario)
    router.push(inicioPorRol[usuario.rol])
  } catch (e) {
    error.value = e.message
  } finally {
    entrando.value = false
  }
}
</script>

<template>
  <form class="caja-login" @submit.prevent="entrar">
    <h2>Iniciar sesión</h2>
    <label>Correo institucional <input v-model="correo" type="email" placeholder="nombre@unach.cl" /></label>
    <label>Contraseña <input v-model="password" type="password" /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="boton" type="submit" :disabled="entrando">{{ entrando ? 'Ingresando...' : 'Ingresar' }}</button>
    <button class="boton gris" type="button" disabled>Ingresar con Google (próximamente)</button>
    <p class="aviso">
      Usuarios de prueba (contraseña 1234):<br>
      admin@unach.cl · aperez@unach.cl · jsoto@unach.cl
    </p>
  </form>
</template>
