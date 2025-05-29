import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home'
import { ProfilePage } from './components/perfil/ProfilePage'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="mensajes" element={<div>Mensajes</div>} />
          <Route path="pedidos" element={<div>Mis Pedidos</div>} />
          <Route path="ayuda" element={<div>Ayuda</div>} />
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
