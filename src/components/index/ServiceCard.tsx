import React from 'react';
import { StarIcon, MapPinIcon } from 'lucide-react';
export const ServiceCard = ({
  provider
}) => {
  return <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex items-center space-x-4">
        <img src={provider.image} alt={provider.name} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h3 className="font-medium text-gray-800">{provider.name}</h3>
          <div className="flex items-center text-yellow-500">
            <StarIcon size={16} fill="currentColor" />
            <span className="ml-1 text-sm">{provider.rating}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <MapPinIcon size={14} className="mr-1" />
            {provider.location}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-3">{provider.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm transition-colors">
          Contactar
        </button>
      </div>
    </div>;
};