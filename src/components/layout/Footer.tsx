import React from 'react';
import { MailIcon, PhoneIcon } from 'lucide-react';
export const Footer = () => {
  return <footer className="bg-white border-t border-gray-200 py-8 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Favo</h3>
          <p className="text-sm text-gray-600 mb-2">
            Conectando necesidades con soluciones
          </p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Enlaces rápidos</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Sobre nosotros</li>
            <li>Cómo funciona</li>
            <li>Términos y condiciones</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Categorías</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Tecnología</li>
            <li>Hogar</li>
            <li>Educación</li>
            <li>Salud</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Contacto</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center">
              <MailIcon size={16} className="mr-2" />
              contacto@favo.com.ar
            </div>
            <div className="flex items-center">
              <PhoneIcon size={16} className="mr-2" />
              0800-FAVO
            </div>
          </div>
        </div>
      </div>
    </footer>;
};