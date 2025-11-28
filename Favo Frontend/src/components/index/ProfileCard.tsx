import { useNavigate } from 'react-router-dom';
import { StarIcon, CheckCircleIcon, MapPinIcon, BriefcaseIcon, ShoppingBagIcon } from 'lucide-react';

interface Usuario {
  id_usuario: number;
  nombre?: string;
  descripcion?: string;
  foto_perfil?: string;
  verificado?: boolean;
  esProvedor?: boolean;
  esDemanda?: boolean;
  Ubicacion?: {
    provincia?: string;
    barrio_zona?: string;
  };
}

export const ProfileCard = ({ usuario, rating }: { usuario: Usuario; rating?: { promedio: number; cantidad: number } }) => {
  const navigate = useNavigate();

  const locationText = usuario.Ubicacion?.barrio_zona 
    ? `${usuario.Ubicacion.barrio_zona}${usuario.Ubicacion.provincia ? `, ${usuario.Ubicacion.provincia}` : ''}`
    : usuario.Ubicacion?.provincia 
    ? usuario.Ubicacion.provincia
    : null;

  return (
    <div 
      onClick={() => navigate(`/usuario/${usuario.id_usuario}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 cursor-pointer h-full flex flex-col"
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start space-x-4 mb-4">
          <img 
            src={usuario.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}&background=fff&color=1f2937`}
            alt={usuario.nombre} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800 truncate">{usuario.nombre || 'Usuario'}</h3>
              {usuario.verificado && (
                <CheckCircleIcon size={16} className="text-green-600 flex-shrink-0" />
              )}
            </div>
            
            {rating && rating.cantidad > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star}
                      size={12}
                      className={`${
                        star <= Math.round(rating.promedio)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-700">{rating.promedio.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({rating.cantidad})</span>
              </div>
            )}
          </div>
        </div>

        {/* Ubicación */}
        {locationText && (
          <div className="flex items-center gap-1 text-gray-600 text-xs mb-3">
            <MapPinIcon size={14} className="flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}
        
        {/* Descripción */}
        {usuario.descripcion && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
            {usuario.descripcion}
          </p>
        )}

        {/* Roles */}
        {(usuario.esProvedor || usuario.esDemanda) && (
          <div className="flex gap-2 mt-auto pt-3">
            {usuario.esProvedor && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-blue-600 text-xs font-medium">
                <BriefcaseIcon size={12} />
                <span>Proveedor</span>
              </div>
            )}
            {usuario.esDemanda && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-green-600 text-xs font-medium">
                <ShoppingBagIcon size={12} />
                <span>Demandante</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
