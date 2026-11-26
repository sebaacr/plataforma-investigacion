import { createRouter, createWebHistory } from 'vue-router'
import { usuario } from '../sesion'

import InicioPublico from '../views/publico/InicioPublico.vue'
import FichaProyecto from '../views/publico/FichaProyecto.vue'
import Login from '../views/Login.vue'
import Usuarios from '../views/admin/Usuarios.vue'
import Proyectos from '../views/admin/Proyectos.vue'
import FormularioProyecto from '../views/admin/FormularioProyecto.vue'
import Historial from '../views/admin/Historial.vue'
import Publicaciones from '../views/admin/Publicaciones.vue'
import Dashboard from '../views/Dashboard.vue'
import MisProyectos from '../views/investigador/MisProyectos.vue'
import VistaProyecto from '../views/investigador/VistaProyecto.vue'
import MisTareas from '../views/colaborador/MisTareas.vue'

const rutas = [
  { path: '/', component: InicioPublico },
  { path: '/proyecto/:id', component: FichaProyecto },
  { path: '/login', component: Login },

  { path: '/admin/usuarios', component: Usuarios, meta: { roles: ['admin'] } },
  { path: '/admin/proyectos', component: Proyectos, meta: { roles: ['admin'] } },
  { path: '/admin/proyectos/nuevo', component: FormularioProyecto, meta: { roles: ['admin'] } },
  { path: '/admin/proyectos/editar/:id', component: FormularioProyecto, meta: { roles: ['admin'] } },
  { path: '/admin/historial', component: Historial, meta: { roles: ['admin'] } },
  { path: '/admin/publicaciones', component: Publicaciones, meta: { roles: ['admin'] } },

  { path: '/dashboard', component: Dashboard, meta: { roles: ['admin', 'investigador'] } },

  { path: '/mis-proyectos', component: MisProyectos, meta: { roles: ['investigador'] } },
  { path: '/gestion/:id', component: VistaProyecto, meta: { roles: ['investigador', 'admin'] } },

  { path: '/mis-tareas', component: MisTareas, meta: { roles: ['colaborador'] } }
]

const router = createRouter({ history: createWebHistory(), routes: rutas })

router.beforeEach((to) => {
  if (!to.meta.roles) return true
  if (!usuario.value) return '/login'
  if (!to.meta.roles.includes(usuario.value.rol)) return '/'
  return true
})

export default router
