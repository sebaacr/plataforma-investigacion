import 'dotenv/config'
import { crearAuthApp } from './authApp.js'

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Configura GOOGLE_CLIENT_ID en frontend/.env antes de iniciar el servidor de autenticación.')
}

const port = Number(process.env.GOOGLE_AUTH_PORT || 3001)
const app = crearAuthApp()

app.listen(port, () => {
  console.log(`Servidor de autenticación disponible en http://localhost:${port}`)
})
