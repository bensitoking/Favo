import React from 'react';
export const Hero = () => {
  return <section className="py-10 px-4">
      <div className="container mx-auto flex flex-col md:flex-row">
        <div className="md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pedí lo que necesites, pedí un Favo
          </h1>
          <p className="text-gray-600 mb-6">
            Conectamos tus necesidades con profesionales independientes de
            confianza
          </p>
          <div className="flex space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
              Publicar Pedido
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
              Buscar Servicios
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <img src="/Captura_de_pantalla_2025-04-25_090754.png" alt="People connecting and helping each other" className="max-w-full h-auto" style={{
          maxHeight: '300px',
          objectFit: 'contain'
        }} />
        </div>
      </div>
    </section>;
};