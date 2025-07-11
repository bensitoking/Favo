import React from 'react';
import { ArrowRightIcon } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-gray-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 flex flex-col justify-center order-2 md:order-1 mt-8 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Pedí lo que necesites, <span className="text-blue-600">pedí un Favo</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Conectamos tus necesidades con profesionales independientes verificados para brindarte soluciones rápidas y confiables.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center transition-all hover:shadow-md">
              Publicar Pedido
              <ArrowRightIcon size={18} className="ml-2" />
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center transition-all hover:shadow-md hover:border-blue-300">
              Buscar Servicios
            </button>
          </div>
        </div>
        <div className="md:w-1/2 order-1 md:order-2 flex justify-center md:justify-end">
          <img 
            src="/Captura_de_pantalla_2025-04-25_090754.png" 
            alt="People connecting and helping each other" 
            className="max-w-full h-auto rounded-lg shadow-xl" 
            style={{
              maxHeight: '400px',
              objectFit: 'contain'
            }} 
          />
        </div>
      </div>
    </section>
  );
};