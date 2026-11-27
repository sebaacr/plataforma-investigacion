<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { usuario, cerrarSesion } from './sesion'
import MenuLateral from './components/MenuLateral.vue'

const router = useRouter()

function salir() {
  cerrarSesion()
  router.push('/')
}
</script>

<template>
  <header class="barra-top">
    <div class="logos">
      <span>UNACH</span>
      <span class="logo-img"><img src="/logos/crea-evas.svg" alt="CREA-EVAS" /></span>
      <span>Informática</span><span>CDT</span>
    </div>
    <nav>
      <RouterLink to="/">Portal público</RouterLink>
      <template v-if="usuario">
        <span class="nombre-usuario">{{ usuario.nombre }} ({{ usuario.rol }})</span>
        <a href="#" @click.prevent="salir">Salir</a>
      </template>
      <RouterLink v-else to="/login">Iniciar sesión</RouterLink>
    </nav>
  </header>

  <div v-if="usuario" class="contenedor">
    <MenuLateral />
    <main class="principal"><RouterView /></main>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.logos { display: flex; align-items: center; }
.logo-img { padding: 3px 8px; }
.logo-img img { height: 28px; display: block; }
</style>
