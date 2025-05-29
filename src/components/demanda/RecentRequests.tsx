import React from 'react';
import { MapPinIcon } from 'lucide-react';
export const RecentRequests = () => {
  const requests = [{
    id: 1,
    user: {
      name: 'Laura M.',
      location: 'Olivos',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    title: 'Necesito profesor de matemáticas',
    description: 'Busco profesor particular para clases de matemáticas para alumno de secundaria, 2 veces por semana.',
    location: 'Palermo, Buenos Aires',
    status: 'Abierto'
  }, {
    id: 2,
    user: {
      name: 'Carlos G.',
      location: 'Flores',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    title: 'Plomero urgente',
    description: 'Necesito plomero para reparar pérdida en caño de la cocina. Disponibilidad inmediata.',
    location: 'Belgrano, Buenos Aires',
    status: 'Abierto'
  }, {
    id: 3,
    user: {
      name: 'María S.',
      location: 'Recoleta',
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    title: 'Diseñador gráfico para logo',
    description: 'Busco diseñador para crear logo de emprendimiento de productos naturales.',
    location: 'Trabajo remoto',
    status: 'En proceso'
  }];
  return <section className="py-8 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Pedidos Recientes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {requests.map(request => <div key={request.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center mb-4">
                <img src={request.user.image} alt={request.user.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <div className="font-medium text-gray-800">
                    {request.user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {request.user.location}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-2 py-1 rounded-full ${request.status === 'Abierto' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {request.status}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                {request.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {request.description}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <MapPinIcon size={14} className="mr-1" />
                {request.location}
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};