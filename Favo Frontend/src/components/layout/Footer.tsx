import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailIcon, PhoneIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, ShoppingBagIcon, UserIcon, HelpCircleIcon } from 'lucide-react';

export const Footer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      const API_URL = 'https://favo-iy6h.onrender.com';
      fetch(`${API_URL}/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const handleNavigate = (path: string) => {
    if ((path === '/perfil' || path === '/pedidos') && !user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg mr-2">Favo</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Conectando necesidades con soluciones de manera rápida y confiable.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
              <FacebookIcon size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
              <TwitterIcon size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-pink-600 transition-colors">
              <InstagramIcon size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
              <LinkedinIcon size={18} />
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Ayuda</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li><a href="#" className="hover:text-blue-600 transition-colors">¿Cómo funciona Favo?</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Preguntas frecuentes</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Reportar un problema</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Términos de servicio</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Navegación</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li><button onClick={() => handleNavigate('/')} className="hover:text-blue-600 transition-colors text-left">Inicio</button></li>
            <li><button onClick={() => handleNavigate('/pedidos')} className="hover:text-blue-600 transition-colors text-left flex items-center gap-1"><ShoppingBagIcon size={16} /> Mis Actividades</button></li>
            <li><button onClick={() => handleNavigate('/perfil')} className="hover:text-blue-600 transition-colors text-left flex items-center gap-1"><UserIcon size={16} /> Perfil</button></li>
            <li><button onClick={() => handleNavigate('/ayuda')} className="hover:text-blue-600 transition-colors text-left flex items-center gap-1"><HelpCircleIcon size={16} /> Ayuda</button></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Contacto</h3>
          <div className="text-sm text-gray-600 space-y-3">
            <div className="flex items-center hover:text-blue-600 transition-colors">
              <MailIcon size={16} className="mr-2" />
              contacto@favo.com.ar
            </div>
            <div className="flex items-center hover:text-blue-600 transition-colors">
              <PhoneIcon size={16} className="mr-2" />
              0800-FAVO
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Favo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};