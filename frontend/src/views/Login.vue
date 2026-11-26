<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarSesion } from '../services/usuariosApi'
import { guardarSesion } from '../sesion'

const router = useRouter()
const botonGoogle = ref(null)
const error = ref('')
const entrando = ref(false)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
let nonce = ''

const inicioPorRol = {
  admin: '/dashboard',
  investigador: '/mis-proyectos',
  colaborador: '/mis-tareas'
}

let cargaGoogle

function cargarGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!cargaGoogle) {
    cargaGoogle = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => window.google?.accounts?.id
        ? resolve()
        : reject(new Error('Google Identity Services no quedó disponible.'))
      script.onerror = () => reject(new Error('No se pudo cargar el inicio de sesión de Google.'))
      document.head.appendChild(script)
    }).catch((e) => {
      cargaGoogle = null
      throw e
    })
  }
  return cargaGoogle
}

function crearNonce() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

async function entrarConGoogle(respuesta) {
  error.value = ''
  if (!respuesta.credential) {
    error.value = 'Google no entregó una credencial válida.'
    return
  }
  entrando.value = true
  try {
    const usuario = await iniciarSesion(respuesta.credential, nonce)
    guardarSesion(usuario)
    router.push(inicioPorRol[usuario.rol])
  } catch (e) {
    error.value = e.message
  } finally {
    entrando.value = false
  }
}

onMounted(async () => {
  if (!googleClientId) {
    error.value = 'Falta configurar GOOGLE_CLIENT_ID en el archivo .env.'
    return
  }
  try {
    await cargarGoogleIdentity()
    nonce = crearNonce()
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      nonce,
      callback: entrarConGoogle
    })
    window.google.accounts.id.renderButton(botonGoogle.value, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 320
    })
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <section class="caja-login">
    <h2>Iniciar sesión</h2>
    <p>Accede con la cuenta de Google vinculada a tu usuario institucional.</p>
    <div ref="botonGoogle" class="boton-google"></div>
    <p v-if="entrando">Validando tu cuenta...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>
