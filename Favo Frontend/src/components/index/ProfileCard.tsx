import { useNavigate } from 'react-router-dom';
import { StarIcon, CheckCircleIcon } from 'lucide-react';

interface Usuario {
  id_usuario: number;
  nombre?: string;
  descripcion?: string;
  foto_perfil?: string;
  verificado?: boolean;
}

export const ProfileCard = ({ usuario, rating }: { usuario: Usuario; rating?: { promedio: number; cantidad: number } }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/usuario/${usuario.id_usuario}`)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-start space-x-4">
          <img 
            src={usuario.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre || 'Usuario')}&background=fff&color=1f2937`}
            alt={usuario.nombre} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{usuario.nombre || 'Usuario'}</h3>
              {rating && rating.cantidad > 0 && (
                <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                  <StarIcon size={14} fill="currentColor" />
                  <span className="ml-1 text-xs font-medium">{rating.promedio.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {usuario.verificado && (
              <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                <CheckCircleIcon size={14} />
                <span>Verificado</span>
              </div>
            )}
            
            {usuario.descripcion && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {usuario.descripcion}
              </p>
            )}

            {rating && rating.cantidad > 0 && (
              <p className="text-gray-500 text-xs mt-2">
                {rating.cantidad} {rating.cantidad === 1 ? 'reseña' : 'reseñas'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
