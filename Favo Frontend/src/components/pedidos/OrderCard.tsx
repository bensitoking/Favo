import React from 'react';
import { MapPinIcon, CalendarIcon, StarIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
interface OrderProps {
  order: {
    id: number;
    service: string;
    provider: string;
    status: string;
    date: string;
    description: string;
    location: string;
    rating?: number;
  };
}
export function OrderCard({
  order
}: OrderProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'en_proceso':
        return {
          icon: <ClockIcon className="text-yellow-500" size={20} />,
          text: 'En Proceso',
          color: 'text-yellow-500'
        };
      case 'pendiente':
        return {
          icon: <AlertCircleIcon className="text-orange-500" size={20} />,
          text: 'Pendiente',
          color: 'text-orange-500'
        };
      case 'completado':
        return {
          icon: <CheckCircleIcon className="text-green-500" size={20} />,
          text: 'Completado',
          color: 'text-green-500'
        };
      default:
        return {
          icon: <ClockIcon className="text-gray-500" size={20} />,
          text: 'Desconocido',
          color: 'text-gray-500'
        };
    }
  };
  const statusInfo = getStatusInfo(order.status);
  return <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {order.service}
          </h3>
          <p className="text-gray-600">Proveedor: {order.provider}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <span className={`${statusInfo.color} font-medium`}>
            {statusInfo.text}
          </span>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{order.description}</p>
      <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
        <div className="flex items-center gap-1">
          <MapPinIcon size={16} />
          <span>{order.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon size={16} />
          <span>{new Date(order.date).toLocaleDateString('es-AR')}</span>
        </div>
        {order.rating && <div className="flex items-center gap-1">
            <StarIcon size={16} className="text-yellow-400 fill-current" />
            <span>{order.rating}/5</span>
          </div>}
      </div>
      {order.status === 'completado' && !order.rating && <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            <StarIcon size={16} />
            Calificar servicio
          </button>
        </div>}
    </div>;
}