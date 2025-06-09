import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home'
import { ProfilePage } from './components/perfil/ProfilePage'
import { Layout } from './components/layout/Layout'
import { HelpPage } from './components/ayuda/HelpPage'
import { HelpSection } from './components/ayuda/HelpSection'
import { MyOrdersPage } from './components/pedidos/MyOrdersPage'
import { ChatInterface } from './components/mensajes/ChatInterface'
import { LoginPage } from './components/login/LoginPage'
import { RecentRequests } from './components/demanda/RecentRequests'
import { TrendingColumn } from './components/demanda/TrendingColumn'
import { Servicios } from './components/demanda/Servicios'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="mensajes" element={<ChatInterface/>} />
          <Route path="pedidos" element={<MyOrdersPage/>} />
          <Route path="ayuda" element={<HelpPage/>} />
          <Route path="login" element={<LoginPage/>} />
          <Route path="demanda" element={<Servicios/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
