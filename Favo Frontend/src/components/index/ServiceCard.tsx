import React from 'react';
import { StarIcon, UserIcon, DollarSignIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Servicio = {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  precio?: number;
  id_usuario?: number;
  Usuario?: {
    nombre: string;
  };
  activo?: boolean;
  created_at?: string;
  rating?: number;
  cantidad_ratings?: number;
  foto_perfil?: string;
};

export const ServiceCard = ({ provider, onContratar }: { provider: Servicio; onContratar?: () => void }) => {
  const navigate = useNavigate();

  const handleContactar = () => {
    if (provider.id_usuario) {
      navigate(`/usuario/${provider.id_usuario}`);
    }
  };

  const userName = provider.Usuario?.nombre || 'Profesional';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 cursor-pointer h-full flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start space-x-4 mb-3">
          {provider.foto_perfil ? (
            <img
              src={`data:image/png;base64,${provider.foto_perfil}`}
              alt={provider.titulo}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <UserIcon size={32} className="text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{provider.titulo}</h3>
            <p className="text-xs text-gray-500 truncate">{userName}</p>
            {provider.rating !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      size={12}
                      className={i < Math.round(provider.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-medium">{provider.rating}</span>
                {provider.cantidad_ratings && (
                  <span className="text-xs text-gray-500">({provider.cantidad_ratings})</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-3 flex-1">
          {provider.descripcion}
        </p>

        {provider.precio !== undefined && (
          <div className="flex items-center gap-1 text-blue-600 font-bold mb-2">
            <DollarSignIcon size={16} />
            <span className="text-sm">${provider.precio}</span>
          </div>
        )}

        {provider.created_at && (
          <p className="text-xs text-gray-400">
            {new Date(provider.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
      
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-2">
        <button 
          onClick={handleContactar}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          Ver perfil
        </button>
        <button 
          onClick={onContratar}
          className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
        >
          Contratar
        </button>
      </div>
    </div>
  );
};