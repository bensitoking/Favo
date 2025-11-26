import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './home'
import { ProfilePage } from './components/perfil/ProfilePage'
import { UserProfilePage } from './components/perfil/UserProfilePage'
import { Layout } from './components/layout/Layout'
import { HelpPage } from './components/ayuda/HelpPage'
import { LoginPage } from './components/login/LoginPage'
import { Servicios } from './components/demanda/Servicios'
import { RegisterPage } from './components/login/RegisterPage'
import CategoriesAll from './components/index/CategoriesAll'
import CategoriaPedidos from './components/pedidos/CategoriaPedidos'
import PedidoDetail from './components/pedidos/PedidoDetail'
import MyActivitiesPage from './components/pedidos/MyActivitiesPage'
import { SearchResultsPage } from './components/index/SearchResultsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="usuario/:id" element={<UserProfilePage />} />
          <Route path="pedidos" element={<MyActivitiesPage/>} />
          <Route path="ayuda" element={<HelpPage/>} />
          <Route path="demanda" element={<Servicios/>} />
          <Route path="buscar" element={<SearchResultsPage/>} />
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
