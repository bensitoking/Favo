import React from 'react';
import { ThumbsUpIcon, ClockIcon, CheckCircleIcon, UserIcon } from 'lucide-react';
export const ProfileStats = () => {
  const stats = [{
    icon: <ThumbsUpIcon size={24} className="text-blue-800" />,
    label: 'Satisfacción',
    value: '98%',
    description: 'de clientes satisfechos'
  }, {
    icon: <ClockIcon size={24} className="text-blue-800" />,
    label: 'Servicios brindados',
    value: '86',
    description: 'trabajos completados'
  }, {
    icon: <CheckCircleIcon size={24} className="text-blue-800" />,
    label: 'Servicios solicitados',
    value: '12',
    description: 'servicios recibidos'
  }, {
    icon: <UserIcon size={24} className="text-blue-800" />,
    label: 'Clientes recurrentes',
    value: '45%',
    description: 'tasa de repetición'
  }];
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => <div key={index} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            {stat.icon}
            <div>
              <h3 className="text-gray-500 text-sm">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          </div>
        </div>)}
    </div>;
};