import React from 'react';
import { StarIcon, MapPinIcon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Provider = {
  id_usuario?: number;
  name: string;
  rating: number;
  location?: string | null;
  image?: string | null;
  description: string;
  skills?: string[];
};

export const ServiceCard = ({ provider }: { provider: Provider }) => {
  const navigate = useNavigate();

  const handleContactar = () => {
    if (provider.id_usuario) {
      navigate(`/usuarios/${provider.id_usuario}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          {provider.image ? (
            <img 
              src={provider.image} 
              alt={provider.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
              <UserIcon size={32} className="text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{provider.name}</h3>
              <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                <StarIcon size={14} fill="currentColor" />
                <span className="ml-1 text-xs font-medium">{provider.rating}</span>
              </div>
            </div>
            
            {provider.location && (
              <div className="flex items-center text-gray-500 text-xs mt-1">
                <MapPinIcon size={12} className="mr-1" />
                {provider.location}
              </div>
            )}
            
            <div className="mt-2 flex flex-wrap gap-2">
              {provider.skills?.slice(0, 3).map((skill: string, i: number) => (
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
        <div className="flex gap-2">
          <button 
            onClick={handleContactar}
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition-colors"
          >
            Contactar
          </button>
          <button className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition-colors">
            Contratar
          </button>
        </div>
      </div>
    </div>
  );
};