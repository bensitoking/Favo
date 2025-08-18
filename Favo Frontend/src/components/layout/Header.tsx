import React, { useEffect, useState } from 'react'; 
import { MessageSquareIcon, ShoppingBagIcon, UserIcon, HelpCircleIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Spinner } from './Spinner';

export const Header = ({ isLoading = false }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const API_URL = 'http://localhost:8000';

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 🔹 Buscar primero en localStorage, si no existe buscar en sessionStorage
        const token =
          localStorage.getItem('access_token') ||
          sessionStorage.getItem('access_token');

        if (!token) {
          setLoadingUser(false);
          return;
        }

        const response = await fetch(`${API_URL}/users/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    // 🔹 Eliminar tokens de ambos lugares
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login';
  };

  if (loadingUser) {
    return (
      <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Spinner />
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-blue-800 hover:text-blue-600 transition-colors">
            <h1 className="flex items-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">Favo</span>
              {isLoading && <span className="ml-2"><Spinner /></span>}
            </h1>
          </Link>

          {user && (
            <span className="text-sm text-gray-600">
              Bienvenido, <strong>{user.nombre || user.mail}</strong>
            </span>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link
                to="/"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/pedidos"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/pedidos') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <ShoppingBagIcon size={16} />
                <span>Mis Pedidos</span>
              </Link>
              <Link
                to="/mensajes"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/mensajes') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <MessageSquareIcon size={16} />
                <span>Mensajes</span>
              </Link>
              <Link
                to="/perfil"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/perfil') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <UserIcon size={16} />
                <span>Perfil</span>
              </Link>
              <Link
                to="/ayuda"
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive('/ayuda') ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}
              >
                <HelpCircleIcon size={16} />
                <span>Ayuda</span>
              </Link>
            </nav>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <Link to="/login" className="text-blue-800 hover:underline">
              Iniciar sesión
            </Link>
          </div>
        )}

        <button className="md:hidden text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};
