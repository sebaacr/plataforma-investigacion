<script setup>
import { RouterLink } from 'vue-router'
import { usuario } from '../sesion'
</script>

<template>
  <aside class="menu">
    <template v-if="usuario.rol === 'admin'">
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/admin/usuarios">Usuarios</RouterLink>
      <RouterLink to="/admin/proyectos">Proyectos</RouterLink>
      <RouterLink to="/admin/publicaciones">Publicaciones</RouterLink>
      <RouterLink to="/admin/historial">Historial</RouterLink>
    </template>

    <template v-if="usuario.rol === 'investigador'">
      <RouterLink to="/mis-proyectos">Mis proyectos</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
    </template>

    <template v-if="usuario.rol === 'colaborador'">
      <RouterLink to="/mis-tareas">Mis tareas</RouterLink>
    </template>
  </aside>
</template>
