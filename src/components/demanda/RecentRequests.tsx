import React from 'react';
import { MapPinIcon } from 'lucide-react';
export const RecentRequests = () => {
  const professionals = [{
    id: 1,
    name: 'Sofia M.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Olivos',
    title: 'Desarrollador frontend',
    description: 'Sólida experiencia en React. Me especializo en construir interfaces modernas, responsivas y escalables, priorizando la experiencia del usuario y el rendimiento.',
    status: 'Disponible',
    timeAgo: '2h'
  }, {
    id: 2,
    name: 'Damián A.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Flores',
    title: 'Soporte técnico',
    description: 'Soy técnico especializado en redes y mantenimiento de equipos. Brindo soporte inmediato para fallos de conectividad y hardware.',
    status: 'Disponible'
  }, {
    id: 3,
    name: 'María S.',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    location: 'Recoleta',
    title: 'Diseñador UX/UI',
    description: 'Soy diseñadora UX/UI con enfoque en usabilidad y accesibilidad. Diseño interfaces intuitivas para aplicaciones web y móviles.',
    status: 'Disponible'
  }];
  return <div className="space-y-4">
      {professionals.map(professional => <div key={professional.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <img src={professional.image} alt={professional.name} className="w-12 h-12 rounded-full border-2 border-gray-100" />
            <div className="ml-3">
              <div className="font-semibold text-gray-800">
                {professional.name}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <MapPinIcon size={12} className="mr-1" />
                {professional.location}{' '}
                {professional.timeAgo && `• ${professional.timeAgo}`}
              </div>
            </div>
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-100 text-green-800">
              {professional.status}
            </span>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">
            {professional.title}
          </h3>
          <p className="text-gray-600 mb-4">{professional.description}</p>
          <div className="flex justify-end">
            <button className="bg-[#1a365d] text-white px-4 py-2 rounded-md hover:bg-[#234781] transition-colors">
              Contactar
            </button>
          </div>
        </div>)}
    </div>;
};