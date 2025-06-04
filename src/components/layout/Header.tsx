import React from 'react'
import {
  MessageSquareIcon,
  ShoppingBagIcon,
  UserIcon,
  HelpCircleIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/login" className="text-xl font-bold text-blue-800">
          <h1>Favo</h1>
          </Link >
        </div>
        <nav className="flex items-center space-x-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-blue-800">
            Inicio
          </Link>
          <Link
            to="/pedidos"
            className="text-gray-500 hover:text-blue-800 flex items-center gap-1"
          >
            <ShoppingBagIcon size={16} />
            <span>Mis Pedidos</span>
          </Link>
          <Link
            to="/mensajes"
            //className="text-blue-800 font-medium flex items-center gap-1"
            className="text-gray-500 hover:text-blue-800 flex items-center gap-1"
          >
            <MessageSquareIcon size={16} />
            <span>Mensajes</span>
          </Link>
          <Link
            to="/perfil"
            className="text-gray-500 hover:text-blue-800 flex items-center gap-1"
          >
            <UserIcon size={16} />
            <span>Perfil</span>
          </Link>
          <Link
            to="/ayuda"
            className="text-gray-500 hover:text-blue-800 flex items-center gap-1"
          >
            <HelpCircleIcon size={16} />
            <span>Ayuda</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}