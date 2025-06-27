import React from 'react';
import { StarIcon, MapPinIcon, MessageSquareIcon, CalendarIcon } from 'lucide-react';

export const ServiceCard = ({ provider }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          <img 
            src={provider.image} 
            alt={provider.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{provider.name}</h3>
              <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                <StarIcon size={14} fill="currentColor" />
                <span className="ml-1 text-xs font-medium">{provider.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center text-gray-500 text-xs mt-1">
              <MapPinIcon size={12} className="mr-1" />
              {provider.location}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {provider.skills?.slice(0, 3).map((skill, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-4 line-clamp-2">
          {provider.description}
        </p>
      </div>
      
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:shadow-md">
          Contactar
        </button>
      </div>
    </div>
  );
};