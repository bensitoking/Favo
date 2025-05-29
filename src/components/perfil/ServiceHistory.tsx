import React from 'react';
import { StarIcon } from 'lucide-react';
export const ServiceHistory = ({
  title,
  type,
  services
}) => {
  return <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {services.map(service => <div key={service.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{service.service}</h3>
                <p className="text-sm text-gray-600">
                  {type === 'provided' ? service.client : service.provider}
                </p>
                <p className="text-sm text-gray-500">{service.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{service.amount}</p>
                <span className={`text-sm ${service.status === 'Completado' ? 'text-green-600' : 'text-blue-600'}`}>
                  {service.status}
                </span>
                {service.rating && <div className="flex items-center justify-end gap-1 mt-1">
                    <StarIcon size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {service.rating}
                    </span>
                  </div>}
              </div>
            </div>
          </div>)}
      </div>
    </div>;
};