import React from 'react';
import { MessageSquareIcon, ShoppingBagIcon, UserIcon, HelpCircleIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Spinner } from './Spinner';

export const Header = ({ isLoading = false }) => {
  const location = useLocation();
  
  // Función para determinar si el enlace está activo
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/login" className="text-2xl font-bold text-blue-800 hover:text-blue-600 transition-colors">
            <h1 className="flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">Favo</span>
              {isLoading && <span className="ml-2"><Spinner /></span>}
            </h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link 
            to="/" 
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'}`}
          >
            Inicio
          </Link>
          <Link
            to="/pedidos"
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isActive('/pedidos') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'}`}
          >
            <ShoppingBagIcon size={16} />
            <span>Mis Pedidos</span>
          </Link>
          <Link
            to="/mensajes"
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isActive('/mensajes') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'}`}
          >
            <MessageSquareIcon size={16} />
            <span>Mensajes</span>
          </Link>
          <Link
            to="/perfil"
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isActive('/perfil') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'}`}
          >
            <UserIcon size={16} />
            <span>Perfil</span>
          </Link>
          <Link
            to="/ayuda"
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${isActive('/ayuda') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'}`}
          >
            <HelpCircleIcon size={16} />
            <span>Ayuda</span>
          </Link>
        </nav>
        
        {/* Menú móvil (simplificado) */}
        <button className="md:hidden text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};