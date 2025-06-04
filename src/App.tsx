import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home'
import { ProfilePage } from './components/perfil/ProfilePage'
import { Layout } from './components/layout/Layout'
import { HelpPage } from './components/ayuda/HelpPage'
import { HelpSection } from './components/ayuda/HelpSection'
import { MyOrdersPage } from './components/pedidos/MyOrdersPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="mensajes" element={<div>Mensajes</div>} />
          <Route path="pedidos" element={<MyOrdersPage/>} />
          <Route path="ayuda" element={<HelpPage/>} />
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
