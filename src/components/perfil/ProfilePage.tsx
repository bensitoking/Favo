import React from 'react';
import { ProfileStats } from './ProfileStats';
import { ServiceHistory } from './ServiceHistory';
import { StarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from 'lucide-react';
export const ProfilePage = () => {
  return <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Foto de perfil" className="w-32 h-32 rounded-full border-4 border-white shadow-md" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Carlos González
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <MapPinIcon size={16} className="text-gray-400" />
                  <span className="text-gray-600">Buenos Aires, Argentina</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon size={16} className="text-gray-400" />
                  <span className="text-gray-600">
                    Miembro desde Marzo 2023
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircleIcon size={16} className="text-green-500" />
                  <span className="text-green-600">Identidad verificada</span>
                </div>
              </div>
              <button className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900">
                Editar perfil
              </button>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-1">
                <StarIcon size={20} className="text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">4.8</span>
                <span className="text-gray-500">(124 reseñas)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProfileStats />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <ServiceHistory title="Servicios brindados" type="provided" services={[{
        id: 1,
        service: 'Plomería',
        client: 'María López',
        date: '15 Mar 2024',
        status: 'Completado',
        rating: 5,
        amount: '$15.000'
      }, {
        id: 2,
        service: 'Reparación de cañería',
        client: 'Juan Pérez',
        date: '10 Mar 2024',
        status: 'Completado',
        rating: 5,
        amount: '$8.500'
      }, {
        id: 3,
        service: 'Instalación de grifería',
        client: 'Ana García',
        date: '5 Mar 2024',
        status: 'Completado',
        rating: 4,
        amount: '$12.000'
      }]} />
        <ServiceHistory title="Servicios solicitados" type="requested" services={[{
        id: 1,
        service: 'Clases de inglés',
        provider: 'Laura Martínez',
        date: '20 Mar 2024',
        status: 'Programado',
        amount: '$4.500'
      }, {
        id: 2,
        service: 'Limpieza de hogar',
        provider: 'Carmen Rodríguez',
        date: '1 Mar 2024',
        status: 'Completado',
        rating: 5,
        amount: '$6.000'
      }]} />
      </div>
    </div>;
};