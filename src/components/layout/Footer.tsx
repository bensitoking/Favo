import React from 'react';
import { MailIcon, PhoneIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';

export const Footer = () => {
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
          <h3 className="font-bold text-gray-800 text-lg mb-4">Enlaces rápidos</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Sobre nosotros</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Cómo funciona</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Términos y condiciones</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Política de privacidad</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Categorías</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li><a href="#" className="hover:text-blue-600 transition-colors">Tecnología</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Hogar</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Educación</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Salud</a></li>
            <li><a href="#" className="hover:text-blue-600 transition-colors">Ver todas</a></li>
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