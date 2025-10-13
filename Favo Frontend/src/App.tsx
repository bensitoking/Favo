import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home'
import { ProfilePage } from './components/perfil/ProfilePage'
import { Layout } from './components/layout/Layout'
import { HelpPage } from './components/ayuda/HelpPage'
import { MyOrdersPage } from './components/pedidos/MyOrdersPage'
import { ChatInterface } from './components/mensajes/ChatInterface'
import { LoginPage } from './components/login/LoginPage'
import { Servicios } from './components/demanda/Servicios'
import { RegisterPage } from './components/login/RegisterPage'
import CategoriesAll from './components/index/CategoriesAll'
import CategoriaPedidos from './components/pedidos/CategoriaPedidos'
import PedidoDetail from './components/pedidos/PedidoDetail'

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
          <Route path="demanda" element={<Servicios/>} />
          <Route path="categorias" element={<CategoriesAll/>} />
          <Route path="categorias/:id" element={<CategoriaPedidos/>} />
          <Route path="pedido/:id" element={<PedidoDetail/>} />
           <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
